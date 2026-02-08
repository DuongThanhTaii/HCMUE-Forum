using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Application.Queries.GetNotificationPreferences;

/// <summary>
/// Query to get notification preferences for a user.
/// </summary>
public sealed record GetNotificationPreferencesQuery(Guid UserId) : IRequest<Result<NotificationPreferencesDto>>;
