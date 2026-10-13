using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class LoginDto
{
    /// <summary>A username, or an email (anything containing "@").</summary>
    [Required]
    [MaxLength(256)]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
