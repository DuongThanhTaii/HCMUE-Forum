using Microsoft.EntityFrameworkCore;
using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Application.Queries.DocumentSearch;
using UniHub.Learning.Domain.Courses;
using UniHub.Learning.Domain.Documents;
using UniHub.Shared.Infrastructure.Persistence;

namespace UniHub.Learning.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of IDocumentRepository.
/// </summary>
internal sealed class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task AddAsync(Document document, CancellationToken cancellationToken = default)
    {
        _context.Documents.Add(document);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Document document, CancellationToken cancellationToken = default)
    {
        _context.Documents.Update(document);
        return Task.CompletedTask;
    }

    public async Task<Document?> GetByIdAsync(DocumentId id, CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsAsync(DocumentId id, CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .AsNoTracking()
            .AnyAsync(d => d.Id == id, cancellationToken);
    }

    public async Task DeleteAsync(DocumentId id, CancellationToken cancellationToken = default)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        
        if (document is not null)
        {
            _context.Documents.Remove(document);
        }
    }

    public async Task<IReadOnlyList<Document>> GetByCourseIdAsync(Guid courseId, CancellationToken cancellationToken = default)
    {
        var courseIdTyped = CourseId.Create(courseId);
        return await _context.Documents
            .AsNoTracking()
            .Where(d => d.CourseId == courseIdTyped)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Document>> GetByUploaderIdAsync(Guid uploaderId, CancellationToken cancellationToken = default)
    {
        return await _context.Documents
            .AsNoTracking()
            .Where(d => d.UploadedBy == uploaderId)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Document> Documents, int TotalCount)> SearchAsync(
        string? searchTerm,
        Guid? courseId,
        Guid? facultyId,
        int? documentType,
        int? status,
        DocumentSortBy sortBy,
        bool sortDescending,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Documents.AsNoTracking();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(d => 
                d.Title.Contains(searchTerm) || 
                d.Description.Contains(searchTerm));
        }

        if (courseId.HasValue)
        {
            var courseIdTyped = CourseId.Create(courseId.Value);
            query = query.Where(d => d.CourseId == courseIdTyped);
        }

        if (facultyId.HasValue)
        {
            // Join with Courses to filter by FacultyId
            query = query.Where(d => _context.Courses
                .Any(c => c.Id == d.CourseId && c.FacultyId == facultyId.Value));
        }

        if (documentType.HasValue)
        {
            var docTypeEnum = (DocumentType)documentType.Value;
            query = query.Where(d => d.Type == docTypeEnum);
        }

        if (status.HasValue)
        {
            var statusEnum = (DocumentStatus)status.Value;
            query = query.Where(d => d.Status == statusEnum);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = sortBy switch
        {
            DocumentSortBy.Title => sortDescending 
                ? query.OrderByDescending(d => d.Title)
                : query.OrderBy(d => d.Title),
            DocumentSortBy.Rating => sortDescending
                ? query.OrderByDescending(d => d.AverageRating)
                : query.OrderBy(d => d.AverageRating),
            DocumentSortBy.Downloads => sortDescending
                ? query.OrderByDescending(d => d.DownloadCount)
                : query.OrderBy(d => d.DownloadCount),
            DocumentSortBy.ViewCount => sortDescending
                ? query.OrderByDescending(d => d.ViewCount)
                : query.OrderBy(d => d.ViewCount),
            DocumentSortBy.CreatedDate or _ => sortDescending
                ? query.OrderByDescending(d => d.CreatedAt)
                : query.OrderBy(d => d.CreatedAt)
        };

        // Apply pagination
        var documents = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (documents, totalCount);
    }
}
