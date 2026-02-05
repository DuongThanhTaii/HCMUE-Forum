using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Permissions;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of permission repository
/// TODO: Replace with proper database implementation when adding EF Core
/// </summary>
public sealed class PermissionRepository : IPermissionRepository
{
    private static readonly List<Permission> _permissions = new();
    private static readonly object _lock = new();

    static PermissionRepository()
    {
        // Seed default permissions
        SeedDefaultPermissions();
    }

    private static void SeedDefaultPermissions()
    {
        if (_permissions.Count > 0) return;

        // Forum permissions
        AddPermission("forum.post.create", "Create Post", "Create new posts in forums");
        AddPermission("forum.post.edit", "Edit Post", "Edit own posts");
        AddPermission("forum.post.delete", "Delete Post", "Delete own posts");
        AddPermission("forum.post.moderate", "Moderate Post", "Moderate posts from other users");
        AddPermission("forum.comment.create", "Create Comment", "Create comments on posts");
        AddPermission("forum.comment.delete", "Delete Comment", "Delete comments");

        // Learning permissions
        AddPermission("learning.document.upload", "Upload Document", "Upload learning documents");
        AddPermission("learning.document.approve", "Approve Document", "Approve uploaded documents");
        AddPermission("learning.course.manage", "Manage Course", "Manage course content and settings");

        // Identity permissions
        AddPermission("identity.user.manage", "Manage Users", "Manage user accounts");
        AddPermission("identity.role.manage", "Manage Roles", "Manage roles and permissions");
        AddPermission("identity.permission.assign", "Assign Permissions", "Assign permissions to roles");
    }

    private static void AddPermission(string code, string name, string? description = null)
    {
        var permissionResult = Permission.Create(code, name, description);
        if (permissionResult.IsSuccess)
        {
            _permissions.Add(permissionResult.Value);
        }
    }

    public Task<Permission?> GetByIdAsync(PermissionId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var permission = _permissions.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(permission);
        }
    }

    public Task<IReadOnlyList<Permission>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return Task.FromResult<IReadOnlyList<Permission>>(_permissions.ToList());
        }
    }
}
