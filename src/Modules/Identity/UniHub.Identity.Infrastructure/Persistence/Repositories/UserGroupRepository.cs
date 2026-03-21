using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Authorization;
using UniHub.Identity.Domain.Users;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

public sealed class UserGroupRepository : IUserGroupRepository
{
    private static readonly List<UserGroup> Groups = new();
    private static readonly object LockObj = new();

    public Task<UserGroup?> GetByIdAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            return Task.FromResult(Groups.FirstOrDefault(item => item.Id == groupId));
        }
    }

    public Task<UserGroup?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            return Task.FromResult(Groups.FirstOrDefault(item =>
                item.Name.Equals(name, StringComparison.OrdinalIgnoreCase)));
        }
    }

    public Task<List<UserGroup>> GetByMemberAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            var result = Groups
                .Where(group => group.Members.Any(member => member.UserId == userId))
                .ToList();

            return Task.FromResult(result);
        }
    }

    public Task<List<UserGroup>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            return Task.FromResult(Groups.ToList());
        }
    }

    public Task AddAsync(UserGroup group, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            Groups.Add(group);
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(UserGroup group, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task DeleteAsync(UserGroup group, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            Groups.Remove(group);
        }

        return Task.CompletedTask;
    }
}
