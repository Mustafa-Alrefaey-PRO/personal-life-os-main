using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Application.DTOs;

public class BillDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public int ReminderDaysBefore { get; set; }
}

public class CreateBillDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), ValidationLimits.MinAmount, ValidationLimits.MaxAmount)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    [Range(0, ValidationLimits.MaxReminderDays)]
    public int ReminderDaysBefore { get; set; } = 3;
}

/// <summary>
/// Status is not editable here; use the pay/unpay endpoints.
/// </summary>
public class UpdateBillDto : CreateBillDto
{
    public int Id { get; set; }
}
