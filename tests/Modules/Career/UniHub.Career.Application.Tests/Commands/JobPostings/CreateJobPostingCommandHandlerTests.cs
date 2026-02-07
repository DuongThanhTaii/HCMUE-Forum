using FluentAssertions;
using NSubstitute;
using UniHub.Career.Application.Abstractions;
using UniHub.Career.Application.Commands.JobPostings.CreateJobPosting;
using UniHub.Career.Domain.JobPostings;
using Xunit;

namespace UniHub.Career.Application.Tests.Commands.JobPostings;

public class CreateJobPostingCommandHandlerTests
{
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly CreateJobPostingCommandHandler _handler;

    public CreateJobPostingCommandHandlerTests()
    {
        _jobPostingRepository = Substitute.For<IJobPostingRepository>();
        _handler = new CreateJobPostingCommandHandler(_jobPostingRepository);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateJobPosting()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: ".NET Developer",
            Description: "We are looking for a talented .NET developer to join our team.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.FullTime,
            ExperienceLevel: ExperienceLevel.Mid,
            City: "Ho Chi Minh City",
            District: "District 1",
            Address: "123 Nguyen Hue",
            IsRemote: false,
            MinSalary: 1000m,
            MaxSalary: 2000m,
            SalaryCurrency: "USD",
            SalaryPeriod: "month",
            Deadline: DateTime.UtcNow.AddMonths(1));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Title.Should().Be(".NET Developer");
        result.Value.JobType.Should().Be("FullTime");
        result.Value.ExperienceLevel.Should().Be("Mid");
        result.Value.Status.Should().Be("Draft");

        await _jobPostingRepository.Received(1).AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithMinimalData_ShouldCreateJobPosting()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: "Frontend Developer",
            Description: "Build amazing user interfaces.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.Remote,
            ExperienceLevel: ExperienceLevel.Junior,
            City: "Ha Noi");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Salary.Should().BeNull();
        result.Value.Deadline.Should().BeNull();

        await _jobPostingRepository.Received(1).AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithInvalidCity_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: "Backend Developer",
            Description: "Build scalable APIs.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.FullTime,
            ExperienceLevel: ExperienceLevel.Senior,
            City: ""); // Empty city

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        await _jobPostingRepository.DidNotReceive().AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithInvalidSalaryRange_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: "Data Engineer",
            Description: "Work with big data.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.FullTime,
            ExperienceLevel: ExperienceLevel.Mid,
            City: "Da Nang",
            MinSalary: 3000m,
            MaxSalary: 2000m, // Max < Min (invalid)
            SalaryCurrency: "USD",
            SalaryPeriod: "month");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        await _jobPostingRepository.DidNotReceive().AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithDeadlineInPast_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: "DevOps Engineer",
            Description: "Manage infrastructure.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.FullTime,
            ExperienceLevel: ExperienceLevel.Senior,
            City: "Can Tho",
            Deadline: DateTime.UtcNow.AddDays(-1)); // Past deadline

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        await _jobPostingRepository.DidNotReceive().AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithMissingSalaryCurrency_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateJobPostingCommand(
            Title: "QA Engineer",
            Description: "Ensure quality.",
            CompanyId: Guid.NewGuid(),
            PostedBy: Guid.NewGuid(),
            JobType: JobType.FullTime,
            ExperienceLevel: ExperienceLevel.Junior,
            City: "Vung Tau",
            MinSalary: 1000m,
            MaxSalary: 2000m,
            SalaryCurrency: null, // Missing currency
            SalaryPeriod: "month");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();

        await _jobPostingRepository.DidNotReceive().AddAsync(
            Arg.Any<JobPosting>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldMapResponseCorrectly()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var postedBy = Guid.NewGuid();
        var command = new CreateJobPostingCommand(
            Title: "Mobile Developer",
            Description: "Build mobile apps.",
            CompanyId: companyId,
            PostedBy: postedBy,
            JobType: JobType.PartTime,
            ExperienceLevel: ExperienceLevel.Entry,
            City: "Nha Trang",
            IsRemote: true,
            MinSalary: 500m,
            MaxSalary: 1000m,
            SalaryCurrency: "USD",
            SalaryPeriod: "hour");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.CompanyId.Should().Be(companyId);
        result.Value.PostedBy.Should().Be(postedBy);
        result.Value.Location.City.Should().Be("Nha Trang");
        result.Value.Location.IsRemote.Should().BeTrue();
        result.Value.Salary.Should().NotBeNull();
        result.Value.Salary!.MinAmount.Should().Be(500m);
        result.Value.Salary.MaxAmount.Should().Be(1000m);
        result.Value.Salary.Currency.Should().Be("USD");
        result.Value.Salary.Period.Should().Be("hour");
    }
}
