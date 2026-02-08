using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Application.Commands.UpdateNotificationPreferences;

/// <summary>
/// Command to update notification preferences for a user.
/// </summary>
public sealed record UpdateNotificationPreferencesCommand(
    Guid UserId,
    bool EmailEnabled,
    bool PushEnabled,
    bool InAppEnabled) : IRequest<Result>;
