using MediatR;
using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;

namespace UniHub.Notification.Application.EventHandlers;

/// <summary>
/// Handles PostCreatedEvent by notifying followers of the post author.
/// </summary>
public sealed class PostCreatedEventHandler : INotificationHandler<PostCreatedEvent>
{
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<PostCreatedEventHandler> _logger;

    public PostCreatedEventHandler(
        IInAppNotificationService inAppNotificationService,
        ILogger<PostCreatedEventHandler> logger)
    {
        _inAppNotificationService = inAppNotificationService;
        _logger = logger;
    }

    public async Task Handle(PostCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling PostCreatedEvent for post {PostId} by author {AuthorId}",
            notification.PostId.Value,
            notification.AuthorId);

        try
        {
            // TODO: Fetch followers of the post author from repository
            // For now, this is a placeholder implementation
            // In production, you would:
            // 1. Get followers from IFollowerRepository
            // 2. Check each follower's notification preferences
            // 3. Send notifications to followers who have InApp notifications enabled

            _logger.LogInformation(
                "Post created notification handler executed for post {PostId}. " +
                "Follower notification logic requires IFollowerRepository implementation.",
                notification.PostId.Value);

            // Example of how it would work with repository:
            // var followers = await _followerRepository.GetFollowersAsync(notification.AuthorId, cancellationToken);
            // foreach (var follower in followers)
            // {
            //     var notificationResult = Notification.Create(
            //         userId: follower.FollowerId,
            //         category: NotificationCategory.Social,
            //         subject: "New post from someone you follow",
            //         body: $"Author {notification.AuthorId} created a new post",
            //         actionUrl: $"/posts/{notification.PostId.Value}",
            //         channels: new List<NotificationChannel> { NotificationChannel.InApp });
            //     await _inAppNotificationService.SendAsync(notificationResult.Value, cancellationToken);
            // }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error handling PostCreatedEvent for post {PostId}",
                notification.PostId.Value);
        }
    }
}
