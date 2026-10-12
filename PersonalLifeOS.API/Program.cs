using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PersonalLifeOS.API.ErrorHandling;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.FileStorage;
using PersonalLifeOS.Infrastructure.Identity;
using PersonalLifeOS.Infrastructure.Persistence;
using PersonalLifeOS.Infrastructure.Repositories;
using PersonalLifeOS.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return model validation failures in the same ApiResponse shape as every other endpoint
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? "Invalid value" : e.ErrorMessage)
                .ToList();
            return new BadRequestObjectResult(ApiResponse<object>.ErrorResponse("Validation failed", errors));
        };
    });

builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not set. Put it in appsettings.Development.json or user-secrets.");

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;

    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSection = builder.Configuration.GetSection(JwtSettings.SectionName);
var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();
if (jwtSettings.SecretKey.Length < JwtSettings.MinSecretKeyLength)
    throw new InvalidOperationException(
        $"JwtSettings:SecretKey must be at least {JwtSettings.MinSecretKeyLength} characters. " +
        "Put it in appsettings.Development.json or user-secrets, never in appsettings.json.");

builder.Services.Configure<JwtSettings>(jwtSection);
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = JwtTokenService.CreateSigningKey(jwtSettings),
        ClockSkew = TimeSpan.Zero
    };
});

// Register repositories
builder.Services.AddScoped<TaskRepository>();
builder.Services.AddScoped<JournalRepository>();
builder.Services.AddScoped<ReceiptRepository>();
builder.Services.AddScoped<BillRepository>();
builder.Services.AddScoped<TransactionRepository>();

// Register application services
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<JournalService>();
builder.Services.AddScoped<ReceiptService>();
builder.Services.AddScoped<BillService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<DashboardService>();

// Register receipt image storage: "Local" (default) or "GoogleDrive"
var storageSection = builder.Configuration.GetSection("Storage");
if (string.Equals(storageSection["Provider"], "GoogleDrive", StringComparison.OrdinalIgnoreCase))
{
    var drive = storageSection.GetSection("GoogleDrive");
    builder.Services.AddSingleton<IFileStorage>(new GoogleDriveStorageService(
        drive["ClientId"] ?? throw new InvalidOperationException("Storage:GoogleDrive:ClientId is not set."),
        drive["ClientSecret"] ?? throw new InvalidOperationException("Storage:GoogleDrive:ClientSecret is not set."),
        drive["RefreshToken"] ?? throw new InvalidOperationException("Storage:GoogleDrive:RefreshToken is not set."),
        drive["FolderId"] ?? throw new InvalidOperationException("Storage:GoogleDrive:FolderId is not set.")));
}
else
{
    var localPath = Path.Combine(builder.Environment.ContentRootPath, storageSection["LocalPath"] ?? "App_Data/receipts");
    builder.Services.AddSingleton<IFileStorage>(new LocalFileStorage(localPath));
}

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Personal Life OS API",
        Version = "v1",
        Description = "Personal productivity and life management API"
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Personal Life OS API V1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}
else
{
    // The dev "http" profile has no HTTPS port; only redirect outside development
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
