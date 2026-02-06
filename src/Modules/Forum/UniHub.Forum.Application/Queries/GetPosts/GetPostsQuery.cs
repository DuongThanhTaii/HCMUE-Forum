using UniHub.SharedKernel.CQRS;

namespace UniHub.Forum.Application.Queries.GetPosts;

/// <summary>
/// Query to get a paginated list of posts with optional filtering
/// </summary>
public sealed record GetPostsQuery(
    int PageNumber = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    int? Type = null,
    int? Status = null) : IQuery<GetPostsResult>;
