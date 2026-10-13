using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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
        var userName = dto.UserName.Trim().ToLowerInvariant();
        if (await _userManager.FindByNameAsync(userName) != null)
        {
            return Conflict(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Username taken",
                new List<string> { "This username is already taken" }
            ));
        }

        if (await _userManager.FindByEmailAsync(dto.Email) != null)
        {
            return Conflict(ApiResponse<AuthResponseDto>.ErrorResponse(
                "User already exists",
                new List<string> { "An account with this email already exists" }
            ));
        }

        var user = new ApplicationUser
        {
            UserName = userName,
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
    /// Login with a username (or email) and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        // Usernames cannot contain "@", so one means the caller typed an email.
        var login = dto.Login.Trim();
        var user = login.Contains('@')
            ? await _userManager.FindByEmailAsync(login)
            : await _userManager.FindByNameAsync(login);
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

    /// <summary>
    /// Change the signed-in user's password. The current password is required, and
    /// wrong guesses count toward the login lockout. Returns a fresh token.
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        if (await _userManager.IsLockedOutAsync(user))
        {
            return StatusCode(StatusCodes.Status423Locked, ApiResponse<AuthResponseDto>.ErrorResponse(
                "Account locked",
                new List<string> { "Too many failed attempts. Try again in a few minutes." }
            ));
        }

        if (!await _userManager.CheckPasswordAsync(user, dto.CurrentPassword))
        {
            await _userManager.AccessFailedAsync(user);
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Current password is incorrect",
                new List<string> { "Current password is incorrect" }
            ));
        }

        if (dto.NewPassword == dto.CurrentPassword)
        {
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Password unchanged",
                new List<string> { "The new password must be different from the current one" }
            ));
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Password change failed", errors));
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(CreateAuthResponse(user), "Password changed"));
    }

    /// <summary>
    /// Update the signed-in user's name, username and email. Returns a fresh token,
    /// because the old one carries the old email and name.
    /// </summary>
    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = userId is null ? null : await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var userName = dto.UserName.Trim().ToLowerInvariant();
        var email = dto.Email.Trim();

        var nameOwner = await _userManager.FindByNameAsync(userName);
        if (nameOwner != null && nameOwner.Id != user.Id)
        {
            return Conflict(ApiResponse<AuthResponseDto>.ErrorResponse(
                "Username taken", new List<string> { "This username is already taken" }));
        }

        var emailOwner = await _userManager.FindByEmailAsync(email);
        if (emailOwner != null && emailOwner.Id != user.Id)
        {
            return Conflict(ApiResponse<AuthResponseDto>.ErrorResponse(
                "User already exists", new List<string> { "An account with this email already exists" }));
        }

        user.FullName = dto.FullName.Trim();
        user.UserName = userName;
        user.Email = email;
        user.EmailConfirmed = true; // No email verification flow yet
        user.UpdatedBy = user.Email;
        user.UpdatedDate = DateTime.UtcNow;

        // UpdateAsync re-normalizes the username and email and checks Identity's own rules
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Profile update failed", errors));
        }

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(CreateAuthResponse(user), "Profile updated"));
    }

        private AuthResponseDto CreateAuthResponse(ApplicationUser user)
    {
        var token = _tokenService.CreateToken(user);
        return new AuthResponseDto
        {
            Token = token.Token,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email!,
            FullName = user.FullName ?? string.Empty,
            ExpiresAt = token.ExpiresAt
        };
    }

    private UnauthorizedObjectResult InvalidCredentials() =>
        Unauthorized(ApiResponse<AuthResponseDto>.ErrorResponse(
            "Invalid credentials",
            new List<string> { "Username or password is incorrect" }
        ));
}
