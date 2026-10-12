using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Identity;

namespace PersonalLifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtTokenService _tokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtTokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        if (await _userManager.FindByEmailAsync(dto.Email) != null)
        {
            return Conflict(ApiResponse<AuthResponseDto>.ErrorResponse(
                "User already exists",
                new List<string> { "An account with this email already exists" }
            ));
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            CreatedBy = dto.Email,
            CreatedDate = DateTime.UtcNow,
            EmailConfirmed = true // No email verification flow yet
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Registration failed", errors));
        }

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(CreateAuthResponse(user), "Registration successful"));
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return InvalidCredentials();

        // lockoutOnFailure: repeated wrong passwords lock the account (limits set in Program.cs)
        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (result.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status423Locked, ApiResponse<AuthResponseDto>.ErrorResponse(
                "Account locked",
                new List<string> { "Too many failed attempts. Try again in a few minutes." }
            ));
        }
        if (!result.Succeeded) return InvalidCredentials();

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(CreateAuthResponse(user), "Login successful"));
    }

    private AuthResponseDto CreateAuthResponse(ApplicationUser user)
    {
        var token = _tokenService.CreateToken(user);
        return new AuthResponseDto
        {
            Token = token.Token,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            ExpiresAt = token.ExpiresAt
        };
    }

    private UnauthorizedObjectResult InvalidCredentials() =>
        Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(
            "Invalid credentials",
            new List<string> { "Email or password is incorrect" }
        ));
}
