using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Users.ValueObjects;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of user repository
/// TODO: Replace with proper database implementation when adding EF Core
/// </summary>
public sealed class UserRepository : IUserRepository
{
    private static readonly List<User> _users = new();
    private static readonly object _lock = new();

    public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return Task.FromResult<IReadOnlyList<User>>(_users.ToList().AsReadOnly());
        }
    }

    public Task<User?> GetByIdAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var user = _users.FirstOrDefault(u => u.Id == userId);
            return Task.FromResult(user);
        }
    }

    public Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var user = _users.FirstOrDefault(u => u.Email.Equals(email));
            return Task.FromResult(user);
        }
    }

    public Task<bool> IsEmailUniqueAsync(Email email, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _users.Any(u => u.Email.Equals(email));
            return Task.FromResult(!exists);
        }
    }

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _users.Add(user);
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        // In-memory implementation doesn't need explicit update as objects are mutable
        return Task.CompletedTask;
    }

    public Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _users.Remove(user);
        }
        return Task.CompletedTask;
    }
}
