using MediatR;
using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;

namespace UniHub.Notification.Application.EventHandlers;

/// <summary>
/// Handles CommentAddedEvent by notifying the post author.
/// </summary>
public sealed class CommentAddedEventHandler : INotificationHandler<CommentAddedEvent>
{
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly IPushNotificationService _pushNotificationService;
    private readonly ILogger<CommentAddedEventHandler> _logger;

    public CommentAddedEventHandler(
        IInAppNotificationService inAppNotificationService,
        IPushNotificationService pushNotificationService,
        ILogger<CommentAddedEventHandler> logger)
    {
        _inAppNotificationService = inAppNotificationService;
        _pushNotificationService = pushNotificationService;
        _logger = logger;
    }

    public async Task Handle(CommentAddedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling CommentAddedEvent for comment {CommentId} on post {PostId}",
            notification.CommentId.Value,
            notification.PostId.Value);

        try
        {
            // TODO: Fetch post author from repository
            // For now, this is a placeholder implementation
            // In production, you would:
            // 1. Get post details from IPostRepository to find the post author
            // 2. Don't notify if comment author is the same as post author (self-comment)
            // 3. Check post author's notification preferences
            // 4. Send notifications via preferred channels (InApp + Push)

            _logger.LogInformation(
                "Comment added notification handler executed for comment {CommentId}. " +
                "Post author notification logic requires IPostRepository implementation.",
                notification.CommentId.Value);

            // Example of how it would work with repository:
            // var post = await _postRepository.GetByIdAsync(notification.PostId, cancellationToken);
            // if (post == null || post.AuthorId == notification.AuthorId) return; // Don't notify self
            // 
            // var notificationResult = Notification.Create(
            //     userId: post.AuthorId,
            //     category: NotificationCategory.Social,
            //     subject: "New comment on your post",
            //     body: $"User {notification.AuthorId} commented on your post",
            //     actionUrl: $"/posts/{notification.PostId.Value}#comment-{notification.CommentId.Value}",
            //     channels: new List<NotificationChannel> { NotificationChannel.InApp, NotificationChannel.Push });
            // 
            // await Task.WhenAll(
            //     _inAppNotificationService.SendAsync(notificationResult.Value, cancellationToken),
            //     _pushNotificationService.SendAsync(notificationResult.Value, cancellationToken));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error handling CommentAddedEvent for comment {CommentId}",
                notification.CommentId.Value);
        }
    }
}
