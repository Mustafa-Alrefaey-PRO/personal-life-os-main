namespace PersonalLifeOS.Infrastructure.FileStorage;

/// <summary>
/// Stores files on local disk outside wwwroot, so they are only reachable through the API.
/// </summary>
public class LocalFileStorage : IFileStorage
{
    private readonly string _rootPath;

    public LocalFileStorage(string rootPath)
    {
        _rootPath = Path.GetFullPath(rootPath);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType)
    {
        // Only the extension of the client's name is kept; the id is server-generated
        var fileId = $"{Guid.NewGuid():N}{Path.GetExtension(fileName).ToLowerInvariant()}";
        await using var file = File.Create(ResolvePath(fileId));
        await content.CopyToAsync(file);
        return fileId;
    }

    public Task<StoredFile?> OpenReadAsync(string fileId)
    {
        var path = ResolvePath(fileId);
        if (!File.Exists(path)) return Task.FromResult<StoredFile?>(null);

        Stream stream = File.OpenRead(path);
        return Task.FromResult<StoredFile?>(new StoredFile(stream, ImageFileRules.ContentTypeFor(fileId)));
    }

    public Task DeleteAsync(string fileId)
    {
        var path = ResolvePath(fileId);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    // Guards against ids like "../appsettings.json" escaping the storage folder
    private string ResolvePath(string fileId)
    {
        var path = Path.GetFullPath(Path.Combine(_rootPath, Path.GetFileName(fileId)));
        if (!path.StartsWith(_rootPath, StringComparison.Ordinal))
            throw new InvalidOperationException("Invalid file id.");
        return path;
    }
}
