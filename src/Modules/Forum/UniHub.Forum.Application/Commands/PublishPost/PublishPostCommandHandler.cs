using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Commands.CreatePost;
using UniHub.Forum.Domain.Categories;
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
    private readonly ICategoryRepository _categoryRepository;

    public PublishPostCommandHandler(IPostRepository postRepository, ICategoryRepository categoryRepository)
    {
        _postRepository = postRepository;
        _categoryRepository = categoryRepository;
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

        if (!await CanPublishAsync(post, request, cancellationToken))
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

    private async Task<bool> CanPublishAsync(
        Post post,
        PublishPostCommand request,
        CancellationToken cancellationToken)
    {
        switch (request.Actor)
        {
            case PostPublishActor.Author:
                return post.AuthorId == request.RequestingUserId;
            case PostPublishActor.Admin:
                return true;
            case PostPublishActor.Moderator:
                if (post.CategoryId is null)
                {
                    return false;
                }

                var category = await _categoryRepository.GetByIdAsync(
                    new CategoryId(post.CategoryId.Value),
                    cancellationToken);
                return category is not null && category.ModeratorIds.Contains(request.RequestingUserId);
            default:
                return false;
        }
    }
}
