using FluentValidation;

namespace UniHub.Learning.Application.Commands.CourseManagement;

public sealed class AssignModeratorCommandValidator : AbstractValidator<AssignModeratorCommand>
{
    public AssignModeratorCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty()
            .WithMessage("Course ID is required");

        RuleFor(x => x.ModeratorId)
            .NotEmpty()
            .WithMessage("Moderator ID is required");
    }
}
