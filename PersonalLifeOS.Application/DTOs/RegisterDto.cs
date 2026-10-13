using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class RegisterDto
{
    /// <summary>3–32 letters, digits, dot, underscore or hyphen; no "@", so it never looks like an email.</summary>
    [Required]
    [RegularExpression("^[A-Za-z0-9._-]{3,32}$", ErrorMessage = "Username must be 3–32 letters, digits, dots, underscores or hyphens")]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
}
