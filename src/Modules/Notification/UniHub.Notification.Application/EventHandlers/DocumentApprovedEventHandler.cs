using Microsoft.Extensions.Logging;
using UniHub.Learning.Domain.Documents.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;
using UniHub.SharedKernel.Domain;

namespace UniHub.Notification.Application.EventHandlers;

/// <summary>
/// Handles DocumentApprovedEvent by notifying the document uploader.
/// </summary>
public sealed class DocumentApprovedEventHandler : IDomainEventHandler<DocumentApprovedEvent>
{
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<DocumentApprovedEventHandler> _logger;

    public DocumentApprovedEventHandler(
        IEmailNotificationService emailNotificationService,
        IInAppNotificationService inAppNotificationService,
        ILogger<DocumentApprovedEventHandler> logger)
    {
        _emailNotificationService = emailNotificationService;
        _inAppNotificationService = inAppNotificationService;
        _logger = logger;
    }

    public async Task Handle(DocumentApprovedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Handling DocumentApprovedEvent for document {DocumentId} approved by {ApproverId}",
            notification.DocumentId,
            notification.ApproverId);

        try
        {
            // TODO: Fetch document uploader from repository
            // For now, this is a placeholder implementation
            // In production, you would:
            // 1. Get document details from IDocumentRepository to find the uploader
            // 2. Check uploader's notification preferences
            // 3. Send notifications via Email + InApp channels

            _logger.LogInformation(
                "Document approved notification handler executed for document {DocumentId}. " +
                "Uploader notification logic requires IDocumentRepository implementation.",
                notification.DocumentId);

            // Example of how it would work with repository:
            // var document = await _documentRepository.GetByIdAsync(notification.DocumentId, cancellationToken);
            // if (document == null) return;
            // 
            // var notificationResult = Notification.Create(
            //     userId: document.UploaderId,
            //     category: NotificationCategory.Academic,
            //     subject: "Your document has been approved",
            //     body: notification.ApprovalComment ?? "Your document has been approved and is now visible to all users.",
            //     actionUrl: $"/documents/{notification.DocumentId}",
            //     channels: new List<NotificationChannel> { NotificationChannel.Email, NotificationChannel.InApp });
            // 
            // await Task.WhenAll(
            //     _emailNotificationService.SendAsync(notificationResult.Value, cancellationToken),
            //     _inAppNotificationService.SendAsync(notificationResult.Value, cancellationToken));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error handling DocumentApprovedEvent for document {DocumentId}",
                notification.DocumentId);
        }
    }
}
