using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Events;
using UniHub.Notification.Application.Abstractions;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;
using UniHub.SharedKernel.Domain;

namespace UniHub.Notification.Application.EventHandlers;

/// <summary>
/// Sends an in-app notification to the post author when someone comments on their post.
/// Also notifies the parent-comment author when someone replies.
/// </summary>
public sealed class CommentAddedEventHandler : IDomainEventHandler<CommentAddedEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IPostAuthorLookup _postAuthorLookup;
    private readonly INotificationPusher _pusher;
    private readonly ILogger<CommentAddedEventHandler> _logger;

    public CommentAddedEventHandler(
        INotificationRepository notificationRepository,
        IPostAuthorLookup postAuthorLookup,
        INotificationPusher pusher,
        ILogger<CommentAddedEventHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _postAuthorLookup = postAuthorLookup;
        _pusher = pusher;
        _logger = logger;
    }

    public async Task Handle(CommentAddedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var postInfo = await _postAuthorLookup.GetAuthorAsync(notification.PostId, cancellationToken);
            if (postInfo is null) return;

            var (postAuthorId, postTitle) = postInfo.Value;

            // Don't notify if the commenter IS the post author
            if (postAuthorId == notification.AuthorId) return;

            var actionUrl = $"/forum/{notification.PostId.Value}#comment-{notification.CommentId.Value}";
            var subject = "Binh luan moi trong bai viet cua ban";
            var body = $"Co binh luan moi tren bai \"{Truncate(postTitle, 60)}\".";

            var contentResult = NotificationContent.Create(subject, body, actionUrl);
            if (contentResult.IsFailure)
            {
                _logger.LogWarning("CommentAdded: could not build content: {Error}", contentResult.Error.Message);
                return;
            }

            var notifResult = Domain.Notifications.Notification.Create(
                postAuthorId,
                NotificationChannel.InApp,
                contentResult.Value);

            if (notifResult.IsFailure)
            {
                _logger.LogWarning("CommentAdded: could not create notification: {Error}", notifResult.Error.Message);
                return;
            }

            var notif = notifResult.Value;
            await _notificationRepository.AddAsync(notif, cancellationToken);

            await _pusher.PushAsync(
                postAuthorId,
                notif.Id.Value,
                subject,
                body,
                "comment",
                notif.CreatedAt,
                cancellationToken);

            var unreadCount = await _notificationRepository.GetUnreadCountAsync(postAuthorId, cancellationToken);
            await _pusher.PushUnreadCountAsync(postAuthorId, unreadCount, cancellationToken);

            _logger.LogInformation(
                "Comment notification sent to post author {AuthorId} for post {PostId}",
                postAuthorId, notification.PostId.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling CommentAddedEvent for comment {CommentId}", notification.CommentId.Value);
        }
    }

    private static string Truncate(string s, int max) =>
        s.Length <= max ? s : s[..max] + "…";
}
