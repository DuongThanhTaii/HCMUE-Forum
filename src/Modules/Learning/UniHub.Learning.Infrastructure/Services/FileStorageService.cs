using UniHub.Learning.Application.Abstractions;

namespace UniHub.Learning.Infrastructure.Services;

/// <summary>
/// Local filesystem implementation of IFileStorageService.
/// Files are stored in a configurable directory on the local filesystem.
/// </summary>
internal sealed class FileStorageService : IFileStorageService
{
    private readonly string _storagePath;

    public FileStorageService(string storagePath = "uploads/documents")
    {
        _storagePath = storagePath;
        
        // Ensure storage directory exists
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> UploadFileAsync(
        string fileName, 
        byte[] fileContent, 
        string contentType, 
        CancellationToken cancellationToken = default)
    {
        // Generate unique file name to avoid collisions
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(_storagePath, uniqueFileName);

        // Write file to disk
        await File.WriteAllBytesAsync(filePath, fileContent, cancellationToken);

        // Return relative path (can be stored in database)
        return Path.Combine(_storagePath, uniqueFileName).Replace("\\", "/");
    }

    public async Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return;
        }

        // Ensure path is within storage directory for security
        var fullPath = Path.GetFullPath(filePath);
        var storageFullPath = Path.GetFullPath(_storagePath);

        if (fullPath.StartsWith(storageFullPath) && File.Exists(fullPath))
        {
            await Task.Run(() => File.Delete(fullPath), cancellationToken);
        }
    }

    public async Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        // Ensure path is within storage directory for security
        var fullPath = Path.GetFullPath(filePath);
        var storageFullPath = Path.GetFullPath(_storagePath);

        if (!fullPath.StartsWith(storageFullPath))
        {
            throw new UnauthorizedAccessException($"Access denied to file: {filePath}");
        }

        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    public Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return Task.FromResult(false);
        }

        var exists = File.Exists(filePath);
        return Task.FromResult(exists);
    }
}
