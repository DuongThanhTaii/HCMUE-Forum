using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Reports;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Forum.Application.Commands.ResolveModerationReport;

public sealed class ResolveModerationReportCommandHandler : ICommandHandler<ResolveModerationReportCommand>
{
    private readonly IReportRepository _reportRepository;
    private readonly IPostRepository _postRepository;
    private readonly ICommentRepository _commentRepository;

    public ResolveModerationReportCommandHandler(
        IReportRepository reportRepository,
        IPostRepository postRepository,
        ICommentRepository commentRepository)
    {
        _reportRepository = reportRepository;
        _postRepository = postRepository;
        _commentRepository = commentRepository;
    }

    public async Task<Result> Handle(ResolveModerationReportCommand request, CancellationToken cancellationToken)
    {
        var report = await _reportRepository.GetByIdAsync(new ReportId(request.ReportId), cancellationToken);
        if (report is null)
        {
            return Result.Failure(ReportErrors.ReportNotFound);
        }

        if (report.Status is ReportStatus.Resolved or ReportStatus.Dismissed)
        {
            return Result.Failure(ReportErrors.AlreadyResolved);
        }

        if (request.Action == "remove")
        {
            var removeResult = await SoftDeleteTargetAsync(report, cancellationToken);
            if (removeResult.IsFailure)
            {
                return removeResult;
            }

            var resolve = report.Resolve(request.ReviewerId, ReportResolutionDecision.Remove);
            if (resolve.IsFailure)
            {
                return resolve;
            }
        }
        else
        {
            var resolve = report.Resolve(request.ReviewerId, ReportResolutionDecision.Keep);
            if (resolve.IsFailure)
            {
                return resolve;
            }
        }

        await _reportRepository.UpdateAsync(report, cancellationToken);
        return Result.Success();
    }

    private async Task<Result> SoftDeleteTargetAsync(Report report, CancellationToken cancellationToken)
    {
        if (report.ReportedItemType == ReportedItemType.Post)
        {
            var post = await _postRepository.GetByIdAsync(new PostId(report.ReportedItemId), cancellationToken);
            if (post is null)
            {
                return Result.Failure(ReportErrors.PostNotFound);
            }

            var delete = post.Delete();
            if (delete.IsFailure)
            {
                return delete;
            }

            await _postRepository.UpdateAsync(post, cancellationToken);
            return Result.Success();
        }

        var comment = await _commentRepository.GetByIdAsync(new CommentId(report.ReportedItemId), cancellationToken);
        if (comment is null)
        {
            return Result.Failure(ReportErrors.CommentNotFound);
        }

        var commentDelete = comment.Delete();
        if (commentDelete.IsFailure)
        {
            return commentDelete;
        }

        await _commentRepository.UpdateAsync(comment, cancellationToken);
        return Result.Success();
    }
}
