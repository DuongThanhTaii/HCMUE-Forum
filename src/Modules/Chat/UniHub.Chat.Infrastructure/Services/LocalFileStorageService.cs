using UniHub.Chat.Application.Abstractions;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Infrastructure.Services;

/// <summary>
/// Local file storage implementation for chat files.
/// Stores files in wwwroot/uploads/chat directory.
/// TODO: Replace with cloud storage (Azure Blob, AWS S3, etc.) for production.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;

    public LocalFileStorageService(string uploadPath, string baseUrl)
    {
        _uploadPath = uploadPath;
        _baseUrl = baseUrl;

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<Result<string>> UploadFileAsync(
        string fileName,
        Stream fileStream,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Generate unique file name to prevent collisions
            var fileExtension = Path.GetExtension(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            // Save file to disk
            using (var fileStreamOutput = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
            }

            // Generate public URL
            var fileUrl = $"{_baseUrl}/uploads/chat/{uniqueFileName}";

            return Result.Success(fileUrl);
        }
        catch (Exception ex)
        {
            return Result.Failure<string>(new Error(
                "FileStorage.UploadFailed",
                $"Failed to upload file: {ex.Message}"));
        }
    }

    public Task<Result> DeleteFileAsync(
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Extract file name from URL
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var filePath = Path.Combine(_uploadPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            return Task.FromResult(Result.Success());
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result.Failure(new Error(
                "FileStorage.DeleteFailed",
                $"Failed to delete file: {ex.Message}")));
        }
    }

    public Task<Result<(Stream Stream, string ContentType)>> GetFileAsync(
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Extract file name from URL
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var filePath = Path.Combine(_uploadPath, fileName);

            if (!File.Exists(filePath))
            {
                return Task.FromResult(Result.Failure<(Stream, string)>(new Error(
                    "FileStorage.FileNotFound",
                    "File not found")));
            }

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var contentType = GetContentType(Path.GetExtension(fileName));

            return Task.FromResult(Result.Success((stream as Stream, contentType)));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result.Failure<(Stream, string)>(new Error(
                "FileStorage.GetFileFailed",
                $"Failed to get file: {ex.Message}")));
        }
    }

    public Task<bool> FileExistsAsync(
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var filePath = Path.Combine(_uploadPath, fileName);
            return Task.FromResult(File.Exists(filePath));
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    private string GetContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".txt" => "text/plain",
            ".mp4" => "video/mp4",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}
