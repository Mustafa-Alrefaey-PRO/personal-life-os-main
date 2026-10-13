using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class UpdateProfileDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^[A-Za-z0-9._-]{3,32}$", ErrorMessage = "Username must be 3–32 letters, digits, dots, underscores or hyphens")]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
