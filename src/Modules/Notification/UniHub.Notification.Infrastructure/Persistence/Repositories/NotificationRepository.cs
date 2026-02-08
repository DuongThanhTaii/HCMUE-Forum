using UniHub.Notification.Application.Abstractions;
using UniHub.Notification.Domain.Notifications;

namespace UniHub.Notification.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of INotificationRepository for development/testing.
/// </summary>
public sealed class NotificationRepository : INotificationRepository
{
    private static readonly List<Domain.Notifications.Notification> _notifications = new();
    private static readonly object _lock = new();

    public Task<Domain.Notifications.Notification?> GetByIdAsync(
        NotificationId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var notification = _notifications.FirstOrDefault(n => n.Id == id);
            return Task.FromResult(notification);
        }
    }

    public Task<(List<Domain.Notifications.Notification> Notifications, int TotalCount)> GetByRecipientAsync(
        Guid recipientId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _notifications
                .Where(n => n.RecipientId == recipientId)
                .OrderByDescending(n => n.CreatedAt);

            var totalCount = query.Count();
            var items = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Task.FromResult((items, totalCount));
        }
    }

    public Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var count = _notifications.Count(n =>
                n.RecipientId == recipientId && !n.IsRead());

            return Task.FromResult(count);
        }
    }

    public Task AddAsync(Domain.Notifications.Notification notification, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _notifications.Add(notification);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Domain.Notifications.Notification notification, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _notifications.FindIndex(n => n.Id == notification.Id);
            if (index >= 0)
            {
                _notifications[index] = notification;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Domain.Notifications.Notification notification, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _notifications.RemoveAll(n => n.Id == notification.Id);
            return Task.CompletedTask;
        }
    }

    public Task<int> MarkAllAsReadAsync(Guid recipientId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var unread = _notifications
                .Where(n => n.RecipientId == recipientId && !n.IsRead())
                .ToList();

            foreach (var notification in unread)
            {
                notification.MarkAsRead();
            }

            return Task.FromResult(unread.Count);
        }
    }
}
