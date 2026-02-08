namespace UniHub.Notification.Domain.NotificationPreferences;

/// <summary>
/// Repository interface for NotificationPreference aggregate.
/// </summary>
public interface INotificationPreferenceRepository
{
    /// <summary>
    /// Gets a notification preference by its ID.
    /// </summary>
    Task<NotificationPreference?> GetByIdAsync(NotificationPreferenceId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a notification preference by user ID.
    /// </summary>
    Task<NotificationPreference?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new notification preference.
    /// </summary>
    Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing notification preference.
    /// </summary>
    Task UpdateAsync(NotificationPreference preference, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a preference exists for a user.
    /// </summary>
    Task<bool> ExistsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
