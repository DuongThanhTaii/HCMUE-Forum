namespace UniHub.Identity.Presentation.DTOs.Roles;

/// <summary>
/// Role information
/// </summary>
public sealed record RoleResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDefault,
    bool IsSystemRole,
    int PermissionCount,
    DateTime CreatedAt);
