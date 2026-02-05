using UniHub.SharedKernel.CQRS;

namespace UniHub.Forum.Application.Commands.PublishPost;

/// <summary>
/// Command to publish a post
/// </summary>
public sealed record PublishPostCommand(
    Guid PostId,
    Guid RequestingUserId) : ICommand;
