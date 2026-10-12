using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Diagnostics;
using PersonalLifeOS.Application.DTOs;

namespace PersonalLifeOS.API.ErrorHandling;

/// <summary>
/// Turns unhandled exceptions into ApiResponse bodies. Only expected exception types expose
/// their message; anything else is logged and answered with a generic 500.
/// </summary>
public class ApiExceptionHandler : IExceptionHandler
{
    private readonly ILogger<ApiExceptionHandler> _logger;

    public ApiExceptionHandler(ILogger<ApiExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var (status, message, errors) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not found", new List<string> { exception.Message }),
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failed", new List<string> { exception.Message }),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", new List<string>())
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(message, errors), cancellationToken);
        return true;
    }
}
