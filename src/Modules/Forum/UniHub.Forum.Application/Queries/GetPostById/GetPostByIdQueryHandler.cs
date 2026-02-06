using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Posts;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Forum.Application.Queries.GetPostById;

/// <summary>
/// Handler for getting a post by ID
/// </summary>
public sealed class GetPostByIdQueryHandler : IQueryHandler<GetPostByIdQuery, PostDetailResult?>
{
    private readonly IPostRepository _postRepository;

    public GetPostByIdQueryHandler(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<Result<PostDetailResult?>> Handle(
        GetPostByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (request.PostId == Guid.Empty)
        {
            return Result.Failure<PostDetailResult?>(
                new Error("GetPostById.InvalidId", "Post ID cannot be empty"));
        }

        var result = await _postRepository.GetPostDetailsAsync(
            new PostId(request.PostId),
            cancellationToken);

        return Result.Success(result);
    }
}
