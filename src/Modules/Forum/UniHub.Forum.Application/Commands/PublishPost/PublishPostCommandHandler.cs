using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Commands.CreatePost;
using UniHub.Forum.Domain.Posts;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Forum.Application.Commands.PublishPost;

/// <summary>
/// Handler for publishing a post
/// </summary>
public sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    private readonly IPostRepository _postRepository;

    public PublishPostCommandHandler(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task<Result> Handle(PublishPostCommand request, CancellationToken cancellationToken)
    {
        // Get post
        var postId = new PostId(request.PostId);
        var post = await _postRepository.GetByIdAsync(postId, cancellationToken);
        if (post is null)
        {
            return Result.Failure(PostErrors.PostNotFound);
        }

        // Check authorization (only author can publish)
        if (post.AuthorId != request.RequestingUserId)
        {
            return Result.Failure(PostErrors.UnauthorizedAccess);
        }

        // Publish post
        var publishResult = post.Publish();
        if (publishResult.IsFailure)
        {
            return Result.Failure(publishResult.Error);
        }

        // Save changes
        await _postRepository.UpdateAsync(post, cancellationToken);

        return Result.Success();
    }
}
