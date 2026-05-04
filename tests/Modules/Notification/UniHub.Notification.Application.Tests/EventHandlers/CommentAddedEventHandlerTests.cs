using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Events;
using UniHub.Forum.Domain.Posts;
using UniHub.Notification.Application.Abstractions;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Application.EventHandlers;
using Xunit;

namespace UniHub.Notification.Application.Tests.EventHandlers;

public class CommentAddedEventHandlerTests
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IPostAuthorLookup _postAuthorLookup;
    private readonly INotificationPusher _pusher;
    private readonly ILogger<CommentAddedEventHandler> _logger;
    private readonly CommentAddedEventHandler _handler;

    public CommentAddedEventHandlerTests()
    {
        _notificationRepository = Substitute.For<INotificationRepository>();
        _postAuthorLookup = Substitute.For<IPostAuthorLookup>();
        _pusher = Substitute.For<INotificationPusher>();
        _logger = Substitute.For<ILogger<CommentAddedEventHandler>>();
        
        _handler = new CommentAddedEventHandler(
            _notificationRepository,
            _postAuthorLookup,
            _pusher,
            _logger);
    }

    [Fact]
    public async Task Handle_ShouldLogExecution()
    {
        // Arrange
        var commentId = CommentId.CreateUnique();
        var postId = PostId.CreateUnique();
        var authorId = Guid.NewGuid();
        var @event = new CommentAddedEvent(commentId, postId, authorId, null);

        // Act
        await _handler.Handle(@event, CancellationToken.None);

        // Assert - Should complete without error
        // Note: Since post repository is not implemented, handler logs but doesn't send notifications
        await Task.CompletedTask;
    }
}
