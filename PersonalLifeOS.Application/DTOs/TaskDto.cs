using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Category { get; set; }
    public string? Priority { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class CreateTaskDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [AllowedValues(null, "", "High", "Medium", "Low", ErrorMessage = "Priority must be High, Medium, Low or empty.")]
    public string? Priority { get; set; }
}

/// <summary>
/// Status is not editable here; use the complete/uncomplete endpoints.
/// </summary>
public class UpdateTaskDto : CreateTaskDto
{
    public int Id { get; set; }
}
