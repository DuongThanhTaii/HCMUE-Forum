using UniHub.SharedKernel.CQRS;

namespace UniHub.Forum.Application.Queries.GetComments;

/// <summary>
/// Query to get comments for a post
/// </summary>
public sealed record GetCommentsQuery(
    Guid PostId,
    int PageNumber = 1,
    int PageSize = 20) : IQuery<GetCommentsResult>;
