using UniHub.Learning.Domain.Courses;

namespace UniHub.Learning.Application.Abstractions;

/// <summary>
/// Repository interface for Course aggregate
/// </summary>
public interface ICourseRepository
{
    /// <summary>
    /// Add a new course
    /// </summary>
    Task AddAsync(Course course, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing course
    /// </summary>
    Task UpdateAsync(Course course, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get course by ID
    /// </summary>
    Task<Course?> GetByIdAsync(CourseId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if course exists
    /// </summary>
    Task<bool> ExistsAsync(CourseId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete course
    /// </summary>
    Task DeleteAsync(CourseId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get courses by faculty ID
    /// </summary>
    Task<IReadOnlyList<Course>> GetByFacultyIdAsync(Guid facultyId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if course code already exists
    /// </summary>
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get courses by moderator ID
    /// </summary>
    Task<IReadOnlyList<Course>> GetByModeratorIdAsync(Guid moderatorId, CancellationToken cancellationToken = default);
}
