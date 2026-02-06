using FluentAssertions;
using NSubstitute;
using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Application.Commands.CourseManagement;
using UniHub.Learning.Domain.Courses;
using UniHub.Learning.Domain.Courses.ValueObjects;
using Xunit;

namespace UniHub.Learning.Application.Tests.Commands.CourseManagement;

public class AssignModeratorCommandHandlerTests
{
    private readonly ICourseRepository _courseRepository;
    private readonly AssignModeratorCommandHandler _handler;

    public AssignModeratorCommandHandlerTests()
    {
        _courseRepository = Substitute.For<ICourseRepository>();
        _handler = new AssignModeratorCommandHandler(_courseRepository);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldReturnSuccess()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var command = new AssignModeratorCommand(courseId, moderatorId);

        var course = Course.Create(
            CourseCode.Create("CS101").Value,
            CourseName.Create("Introduction to Computer Science").Value,
            CourseDescription.Create("Basic concepts").Value,
            Semester.Create("2024-1").Value,
            3,
            Guid.NewGuid(),
            null).Value;

        _courseRepository.GetByIdAsync(CourseId.Create(courseId), Arg.Any<CancellationToken>())
            .Returns(course);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _courseRepository.Received(1).UpdateAsync(course, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentCourse_ShouldReturnFailure()
    {
        // Arrange
        var command = new AssignModeratorCommand(Guid.NewGuid(), Guid.NewGuid());

        _courseRepository.GetByIdAsync(Arg.Any<CourseId>(), Arg.Any<CancellationToken>())
            .Returns((Course?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Course.NotFound");
        await _courseRepository.DidNotReceive().UpdateAsync(Arg.Any<Course>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithAlreadyAssignedModerator_ShouldReturnFailure()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var command = new AssignModeratorCommand(courseId, moderatorId);

        var course = Course.Create(
            CourseCode.Create("CS101").Value,
            CourseName.Create("Introduction to Computer Science").Value,
            CourseDescription.Create("Basic concepts").Value,
            Semester.Create("2024-1").Value,
            3,
            Guid.NewGuid(),
            null).Value;

        // Assign moderator first time
        course.AssignModerator(moderatorId, Guid.NewGuid());

        _courseRepository.GetByIdAsync(CourseId.Create(courseId), Arg.Any<CancellationToken>())
            .Returns(course);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Course.ModeratorAlreadyAssigned");
        await _courseRepository.DidNotReceive().UpdateAsync(Arg.Any<Course>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithDeletedCourse_ShouldReturnFailure()
    {
        // Arrange
        var courseId = Guid.NewGuid();
        var moderatorId = Guid.NewGuid();
        var command = new AssignModeratorCommand(courseId, moderatorId);

        var course = Course.Create(
            CourseCode.Create("CS101").Value,
            CourseName.Create("Introduction to Computer Science").Value,
            CourseDescription.Create("Basic concepts").Value,
            Semester.Create("2024-1").Value,
            3,
            Guid.NewGuid(),
            null).Value;

        course.Delete(Guid.NewGuid()); // Soft delete the course

        _courseRepository.GetByIdAsync(CourseId.Create(courseId), Arg.Any<CancellationToken>())
            .Returns(course);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Course.Deleted");
        await _courseRepository.DidNotReceive().UpdateAsync(Arg.Any<Course>(), Arg.Any<CancellationToken>());
    }
}
