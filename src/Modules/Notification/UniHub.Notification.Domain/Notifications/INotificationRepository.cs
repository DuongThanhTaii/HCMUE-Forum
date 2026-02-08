using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Domain.Notifications;

/// <summary>
/// Repository interface for Notification aggregate.
/// </summary>
public interface INotificationRepository
{
    /// <summary>
    /// Gets a notification by its ID.
    /// </summary>
    Task<Notification?> GetByIdAsync(NotificationId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated notifications for a user.
    /// </summary>
    Task<(List<Notification> Notifications, int TotalCount)> GetByRecipientAsync(
        Guid recipientId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets count of unread notifications for a user.
    /// </summary>
    Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new notification.
    /// </summary>
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing notification.
    /// </summary>
    Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a notification.
    /// </summary>
    Task DeleteAsync(Notification notification, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks all notifications as read for a user.
    /// </summary>
    Task<int> MarkAllAsReadAsync(Guid recipientId, CancellationToken cancellationToken = default);
}
