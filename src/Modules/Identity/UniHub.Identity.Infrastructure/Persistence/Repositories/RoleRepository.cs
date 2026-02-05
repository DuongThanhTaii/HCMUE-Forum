using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Roles;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of role repository
/// TODO: Replace with proper database implementation when adding EF Core
/// </summary>
public sealed class RoleRepository : IRoleRepository
{
    private static readonly List<Role> _roles = new();
    private static readonly object _lock = new();

    static RoleRepository()
    {
        // Seed default roles
        SeedDefaultRoles();
    }

    private static void SeedDefaultRoles()
    {
        if (_roles.Count > 0) return;

        var studentRole = Role.Create("Student", "Default role for students");
        var teacherRole = Role.Create("Teacher", "Role for teachers and instructors");
        var adminRole = Role.Create("Admin", "Administrator role with full access");

        if (studentRole.IsSuccess)
            _roles.Add(studentRole.Value);

        if (teacherRole.IsSuccess)
            _roles.Add(teacherRole.Value);

        if (adminRole.IsSuccess)
            _roles.Add(adminRole.Value);
    }

    public Task<Role?> GetByIdAsync(RoleId roleId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var role = _roles.FirstOrDefault(r => r.Id == roleId);
            return Task.FromResult(role);
        }
    }

    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var role = _roles.FirstOrDefault(r => r.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(role);
        }
    }

    public Task<List<Role>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return Task.FromResult(_roles.ToList());
        }
    }

    public Task AddAsync(Role role, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _roles.Add(role);
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Role role, CancellationToken cancellationToken = default)
    {
        // In-memory implementation doesn't need explicit update as objects are mutable
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Role role, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _roles.Remove(role);
        }
        return Task.CompletedTask;
    }
}
