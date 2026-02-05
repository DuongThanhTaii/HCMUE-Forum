namespace UniHub.Identity.Presentation.DTOs.Users;

/// <summary>
/// User profile information
/// </summary>
public sealed record UserResponse(
    Guid Id,
    string Email,
    string FullName,
    string? Bio,
    string Status,
    OfficialBadgeDto? Badge,
    DateTime CreatedAt);

public sealed record OfficialBadgeDto(
    string Type,
    string Name,
    string? Description,
    string Emoji);
