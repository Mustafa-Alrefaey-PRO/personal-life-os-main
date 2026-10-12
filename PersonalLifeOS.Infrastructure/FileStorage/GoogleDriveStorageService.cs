using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;

namespace PersonalLifeOS.Infrastructure.FileStorage;

/// <summary>
/// Stores files in a private Google Drive folder. Files keep Drive's default (owner-only) sharing.
/// </summary>
public class GoogleDriveStorageService : IFileStorage
{
    private readonly DriveService _driveService;
    private readonly string _folderId;

    public GoogleDriveStorageService(string clientId, string clientSecret, string refreshToken, string folderId)
    {
        _folderId = folderId;

        var credential = new UserCredential(
            new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = new ClientSecrets
                {
                    ClientId = clientId,
                    ClientSecret = clientSecret
                },
                Scopes = [DriveService.Scope.DriveFile]
            }),
            "user",
            new TokenResponse { RefreshToken = refreshToken }
        );

        _driveService = new DriveService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PersonalLifeOS"
        });
    }

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType)
    {
        var fileMetadata = new Google.Apis.Drive.v3.Data.File
        {
            Name = $"{Guid.NewGuid():N}{Path.GetExtension(fileName).ToLowerInvariant()}",
            Parents = [_folderId]
        };

        var request = _driveService.Files.Create(fileMetadata, content, contentType);
        request.Fields = "id";
        var progress = await request.UploadAsync();

        if (progress.Status != Google.Apis.Upload.UploadStatus.Completed)
            throw new InvalidOperationException("Google Drive upload failed.", progress.Exception);

        return request.ResponseBody?.Id
            ?? throw new InvalidOperationException("Google Drive upload returned no file id.");
    }

    public async Task<StoredFile?> OpenReadAsync(string fileId)
    {
        try
        {
            var metadataRequest = _driveService.Files.Get(fileId);
            metadataRequest.Fields = "mimeType";
            var metadata = await metadataRequest.ExecuteAsync();

            var buffer = new MemoryStream();
            await _driveService.Files.Get(fileId).DownloadAsync(buffer);
            buffer.Position = 0;
            return new StoredFile(buffer, metadata.MimeType ?? "application/octet-stream");
        }
        catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task DeleteAsync(string fileId)
    {
        try
        {
            await _driveService.Files.Delete(fileId).ExecuteAsync();
        }
        catch (Google.GoogleApiException ex) when (ex.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Already gone
        }
    }
}
