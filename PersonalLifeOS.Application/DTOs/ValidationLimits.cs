namespace PersonalLifeOS.Application.DTOs;

/// <summary>Shared bounds for DTO validation attributes.</summary>
public static class ValidationLimits
{
    // decimal(18,2) columns; amounts must be positive
    public const string MinAmount = "0.01";
    public const string MaxAmount = "9999999999999999.99";

    public const int MaxReminderDays = 365;
}
