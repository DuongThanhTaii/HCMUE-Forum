using UniHub.SharedKernel.CQRS;

namespace UniHub.Learning.Application.Commands.CourseManagement;

/// <summary>
/// Command to assign a moderator to a course
/// </summary>
public sealed record AssignModeratorCommand(
    Guid CourseId,
    Guid ModeratorId) : ICommand;
