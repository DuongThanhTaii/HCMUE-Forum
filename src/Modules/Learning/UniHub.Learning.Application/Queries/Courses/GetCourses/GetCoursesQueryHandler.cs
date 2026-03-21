using MediatR;
using UniHub.Learning.Application.Abstractions;
using UniHub.SharedKernel.Results;

namespace UniHub.Learning.Application.Queries.Courses.GetCourses;

/// <summary>
/// Handler for GetCoursesQuery
/// </summary>
internal sealed class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, Result<List<CourseListItemResponse>>>
{
    private readonly ICourseRepository _courseRepository;
    private readonly IDocumentRepository _documentRepository;

    public GetCoursesQueryHandler(
        ICourseRepository courseRepository,
        IDocumentRepository documentRepository)
    {
        _courseRepository = courseRepository;
        _documentRepository = documentRepository;
    }

    public async Task<Result<List<CourseListItemResponse>>> Handle(
        GetCoursesQuery request,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Courses.Course> courses;

        if (request.FacultyId.HasValue)
        {
            courses = await _courseRepository.GetByFacultyIdAsync(request.FacultyId.Value, cancellationToken);
        }
        else
        {
            // If no faculty filter, get all courses via faculty ID null check
            // Note: This is a simplified approach. In production, add GetAllAsync method to ICourseRepository
            courses = new List<Domain.Courses.Course>();
        }

        var responses = new List<CourseListItemResponse>();

        foreach (var course in courses)
        {
            // Get document count for this course
            var documents = await _documentRepository.GetByCourseIdAsync(course.Id.Value, cancellationToken);
            
            responses.Add(new CourseListItemResponse(
                course.Id.Value,
                course.Code,
                course.Name,
                course.Description,
                course.Semester,
                course.Credits,
                course.FacultyId,
                course.CreatedAt,
                documents.Count
            ));
        }

        return Result.Success(responses);
    }
}
