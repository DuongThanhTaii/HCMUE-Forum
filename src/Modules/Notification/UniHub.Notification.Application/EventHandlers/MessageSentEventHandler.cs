using MediatR;
using Microsoft.Extensions.Logging;
using UniHub.Chat.Domain.Messages.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;

namespace UniHub.Notification.Application.EventHandlers;

/// <summary>
/// Handles MessageSentEvent by sending push notification to recipient.
/// </summary>
public sealed class MessageSentEventHandler : INotificationHandler<MessageSentEvent>
{
    private readonly IPushNotificationService _pushNotificationService;
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<MessageSentEventHandler> _logger;

    public MessageSentEventHandler(
        IPushNotificationService pushNotificationService,
        IInAppNotificationService inAppNotificationService,
        ILogger<MessageSentEventHandler> logger)
    {
        _pushNotificationService = pushNotificationService;
        _inAppNotificationService = inAppNotificationService;
        _logger = logger;
    }

    public async Task Handle(MessageSentEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling MessageSentEvent for message {MessageId} in conversation {ConversationId}",
            notification.MessageId,
            notification.ConversationId);

        try
        {
            // TODO: Fetch conversation participants from repository
            // For now, this is a placeholder implementation
            // In production, you would:
            // 1. Get conversation from IConversationRepository
            // 2. Find recipient(s) - all participants except sender
            // 3. Check each recipient's notification preferences
            // 4. Send push + in-app notifications for real-time chat

            _logger.LogInformation(
                "Message sent notification handler executed for message {MessageId}. " +
                "Recipient notification logic requires IConversationRepository implementation.",
                notification.MessageId);

            // Example of how it would work with repository:
            // var conversation = await _conversationRepository.GetByIdAsync(notification.ConversationId, cancellationToken);
            // if (conversation == null) return;
            // 
            // var recipients = conversation.Participants
            //     .Where(p => p.UserId != notification.SenderId)
            //     .Select(p => p.UserId);
            // 
            // foreach (var recipientId in recipients)
            // {
            //     var notificationResult = Notification.Create(
            //         userId: recipientId,
            //         category: NotificationCategory.Social,
            //         subject: "New message",
            //         body: $"You have a new message: {notification.Content}",
            //         actionUrl: $"/chat/{notification.ConversationId}",
            //         channels: new List<NotificationChannel> { NotificationChannel.Push, NotificationChannel.InApp });
            //     
            //     await Task.WhenAll(
            //         _pushNotificationService.SendAsync(notificationResult.Value, cancellationToken),
            //         _inAppNotificationService.SendAsync(notificationResult.Value, cancellationToken));
            // }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error handling MessageSentEvent for message {MessageId}",
                notification.MessageId);
        }
    }
}
