using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Domain.Courses;
using UniHub.SharedKernel;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Learning.Application.Commands.CourseManagement;

public sealed class AssignModeratorCommandHandler : ICommandHandler<AssignModeratorCommand>
{
    private readonly ICourseRepository _courseRepository;

    public AssignModeratorCommandHandler(ICourseRepository courseRepository)
    {
        _courseRepository = courseRepository;
    }

    public async Task<Result> Handle(AssignModeratorCommand request, CancellationToken cancellationToken)
    {
        // Get course
        var course = await _courseRepository.GetByIdAsync(
            CourseId.Create(request.CourseId),
            cancellationToken);

        if (course is null)
        {
            return Result.Failure(new Error("Course.NotFound", "Course not found"));
        }

        // Assign moderator (use same ID for assignedBy as moderatorId for now - could be improved with current user context)
        var result = course.AssignModerator(request.ModeratorId, request.ModeratorId);
        if (result.IsFailure)
        {
            return result;
        }

        // Persist changes
        await _courseRepository.UpdateAsync(course, cancellationToken);

        return Result.Success();
    }
}
