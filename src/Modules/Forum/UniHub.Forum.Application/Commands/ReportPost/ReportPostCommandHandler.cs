using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;
using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Reports;

namespace UniHub.Forum.Application.Commands.ReportPost;

public sealed class ReportPostCommandHandler : ICommandHandler<ReportPostCommand, int>
{
    private readonly IReportRepository _reportRepository;
    private readonly IPostRepository _postRepository;

    public ReportPostCommandHandler(
        IReportRepository reportRepository,
        IPostRepository postRepository)
    {
        _reportRepository = reportRepository;
        _postRepository = postRepository;
    }

    public async Task<Result<int>> Handle(
        ReportPostCommand request,
        CancellationToken cancellationToken)
    {
        // Check if post exists
        var post = await _postRepository.GetByIdAsync(
            new PostId(request.PostId),
            cancellationToken);

        if (post is null)
        {
            return Result.Failure<int>(ReportErrors.PostNotFound);
        }

        // Check if user has already reported this post
        var existingReport = await _reportRepository.GetByReporterAndItemAsync(
            request.ReporterId,
            request.PostId,
            ReportedItemType.Post,
            cancellationToken);

        if (existingReport is not null)
        {
            return Result.Failure<int>(ReportErrors.DuplicateReport);
        }

        // Create report
        var reportId = new ReportId(0); // Will be assigned by database
        var reportResult = Report.Create(
            reportId,
            request.PostId,
            ReportedItemType.Post,
            request.ReporterId,
            request.Reason,
            request.Description);

        if (reportResult.IsFailure)
        {
            return Result.Failure<int>(reportResult.Error);
        }

        await _reportRepository.AddAsync(reportResult.Value, cancellationToken);

        return Result.Success(reportResult.Value.Id.Value);
    }
}
