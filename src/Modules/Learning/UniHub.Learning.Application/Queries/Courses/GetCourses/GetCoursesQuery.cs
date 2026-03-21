using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Learning.Application.Queries.Courses.GetCourses;

/// <summary>
/// Query to get all courses with optional filtering
/// </summary>
public sealed record GetCoursesQuery(
    Guid? FacultyId = null,
    string? Semester = null
) : IRequest<Result<List<CourseListItemResponse>>>;

/// <summary>
/// Response for course list item
/// </summary>
public sealed record CourseListItemResponse(
    Guid CourseId,
    string Code,
    string Name,
    string Description,
    string Semester,
    int Credits,
    Guid? FacultyId,
    DateTime CreatedAt,
    int DocumentCount
);
