using UniHub.Notification.Application.Abstractions;
using UniHub.Notification.Domain.NotificationPreferences;

namespace UniHub.Notification.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of INotificationPreferenceRepository for development/testing.
/// </summary>
public sealed class NotificationPreferenceRepository : INotificationPreferenceRepository
{
    private static readonly List<NotificationPreference> _preferences = new();
    private static readonly object _lock = new();

    public Task<NotificationPreference?> GetByIdAsync(
        NotificationPreferenceId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var preference = _preferences.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(preference);
        }
    }

    public Task<NotificationPreference?> GetByUserIdAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var preference = _preferences.FirstOrDefault(p => p.UserId == userId);
            return Task.FromResult(preference);
        }
    }

    public Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _preferences.Add(preference);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _preferences.FindIndex(p => p.Id == preference.Id);
            if (index >= 0)
            {
                _preferences[index] = preference;
            }
            return Task.CompletedTask;
        }
    }

    public Task<bool> ExistsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _preferences.Any(p => p.UserId == userId);
            return Task.FromResult(exists);
        }
    }
}
