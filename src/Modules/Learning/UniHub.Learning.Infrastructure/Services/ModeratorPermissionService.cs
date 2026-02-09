using Microsoft.EntityFrameworkCore;
using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Domain.Courses;
using UniHub.Learning.Domain.Documents;
using UniHub.Shared.Infrastructure.Persistence;

namespace UniHub.Learning.Infrastructure.Services;

/// <summary>
/// Service to check if a user has moderator permissions for courses/documents.
/// Checks the moderator_ids JSONB array in the courses table.
/// </summary>
internal sealed class ModeratorPermissionService : IModeratorPermissionService
{
    private readonly ApplicationDbContext _context;

    public ModeratorPermissionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> IsModeratorForDocumentAsync(
        Guid userId,
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        // Get document's course, then check if user is in moderator_ids
        var document = await _context.Documents
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == DocumentId.Create(documentId), cancellationToken);

        if (document is null)
        {
            return false;
        }

        return await IsModeratorForCourseAsync(userId, document.CourseId.Value, cancellationToken);
    }

    public async Task<bool> IsModeratorForCourseAsync(
        Guid userId,
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        // TODO: This requires JSONB query on moderator_ids array
        // For now, load course and check in-memory
        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == CourseId.Create(courseId), cancellationToken);

        if (course is null)
        {
            return false;
        }

        return course.ModeratorIds.Contains(userId);
    }
}
