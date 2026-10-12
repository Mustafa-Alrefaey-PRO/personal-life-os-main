using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using System.Security.Claims;

namespace PersonalLifeOS.API.Controllers;

/// <summary>
/// Base for authenticated, user-scoped controllers. Validation and errors are handled globally
/// (see Program.cs), so actions only contain the happy path.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public abstract class BaseApiController : ControllerBase
{
    protected string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Authenticated request has no user id claim.");

    protected ActionResult<ApiResponse<T>> Success<T>(T data, string message) =>
        Ok(ApiResponse<T>.SuccessResponse(data, message));

    protected ActionResult<ApiResponse<object>> Success(string message) =>
        Ok(ApiResponse<object>.SuccessResponse(null!, message));

    protected ActionResult<ApiResponse<object>> IdMismatch() =>
        BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch",
            new List<string> { "The ID in the URL does not match the ID in the request body" }));
}
