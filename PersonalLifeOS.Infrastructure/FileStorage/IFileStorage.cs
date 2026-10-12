namespace PersonalLifeOS.Infrastructure.FileStorage;

public record StoredFile(Stream Content, string ContentType);

/// <summary>
/// Private file storage. Files are never exposed directly; the API streams them to their owner.
/// </summary>
public interface IFileStorage
{
    /// <summary>Saves the file and returns the id used to read or delete it later.</summary>
    Task<string> SaveAsync(Stream content, string fileName, string contentType);

    /// <summary>Opens the file, or returns null if it no longer exists.</summary>
    Task<StoredFile?> OpenReadAsync(string fileId);

    /// <summary>Deletes the file; missing files are ignored.</summary>
    Task DeleteAsync(string fileId);
}
