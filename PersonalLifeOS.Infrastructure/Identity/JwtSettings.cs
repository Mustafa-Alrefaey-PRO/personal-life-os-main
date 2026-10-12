namespace PersonalLifeOS.Infrastructure.Identity;

/// <summary>Bound from the "JwtSettings" configuration section.</summary>
public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    // HMAC-SHA256 needs at least 256 bits of key material
    public const int MinSecretKeyLength = 32;

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "PersonalLifeOSAPI";
    public string Audience { get; set; } = "PersonalLifeOSClient";
    public int ExpiryInMinutes { get; set; } = 60;
}
