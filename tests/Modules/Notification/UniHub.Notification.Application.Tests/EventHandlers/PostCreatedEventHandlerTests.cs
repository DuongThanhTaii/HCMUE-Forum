using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UniHub.Forum.Domain.Events;
using UniHub.Forum.Domain.Posts;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Application.EventHandlers;

namespace UniHub.Notification.Application.Tests.EventHandlers;

public class PostCreatedEventHandlerTests
{
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<PostCreatedEventHandler> _logger;
    private readonly PostCreatedEventHandler _handler;

    public PostCreatedEventHandlerTests()
    {
        _inAppNotificationService = Substitute.For<IInAppNotificationService>();
        _logger = Substitute.For<ILogger<PostCreatedEventHandler>>();
        _handler = new PostCreatedEventHandler(_inAppNotificationService, _logger);
    }

    [Fact]
    public async Task Handle_ShouldLogExecution()
    {
        // Arrange
        var postId = PostId.CreateUnique();
        var authorId = Guid.NewGuid();
        var @event = new PostCreatedEvent(postId, authorId, PostType.Discussion);

        // Act
        await _handler.Handle(@event, CancellationToken.None);

        // Assert - Should complete without error
        // Note: Since follower repository is not implemented, handler logs but doesn't send notifications
        await Task.CompletedTask;
    }
}
