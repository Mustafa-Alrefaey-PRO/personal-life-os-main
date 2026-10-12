using System.ComponentModel.DataAnnotations;

namespace PersonalLifeOS.Infrastructure.FileStorage;

/// <summary>Which uploads are accepted as receipt images.</summary>
public static class ImageFileRules
{
    public const long MaxBytes = 10 * 1024 * 1024;

    private static readonly Dictionary<string, string> ContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".webp"] = "image/webp",
        [".gif"] = "image/gif",
    };

    /// <summary>Throws a ValidationException (mapped to HTTP 400) when the file is not an accepted image.</summary>
    public static void Validate(string fileName, string contentType, long length)
    {
        if (length == 0)
            throw new ValidationException("An image file is required.");
        if (length > MaxBytes)
            throw new ValidationException($"Images must be {MaxBytes / (1024 * 1024)} MB or smaller.");
        if (!ContentTypes.TryGetValue(Path.GetExtension(fileName), out var expected)
            || !string.Equals(expected, contentType, StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Only JPG, PNG, WEBP and GIF images are allowed.");
    }

    public static string ContentTypeFor(string fileName) =>
        ContentTypes.GetValueOrDefault(Path.GetExtension(fileName), "application/octet-stream");
}
