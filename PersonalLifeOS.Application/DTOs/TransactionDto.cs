using System.ComponentModel.DataAnnotations;
using PersonalLifeOS.Domain.Enums;

namespace PersonalLifeOS.Application.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string? Category { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public string StatusCode { get; set; } = string.Empty;
}

public class CreateTransactionDto
{
    // Always positive; Type decides whether it is income or expense
    [Range(typeof(decimal), ValidationLimits.MinAmount, ValidationLimits.MaxAmount)]
    public decimal Amount { get; set; }

    [Required]
    [EnumDataType(typeof(TransactionType))]
    public TransactionType Type { get; set; }

    [MaxLength(50)]
    public string? Category { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.Today;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateTransactionDto : CreateTransactionDto
{
    public int Id { get; set; }
}
