using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Application.Commands.DeleteNotification;

/// <summary>
/// Command to delete a notification.
/// </summary>
public sealed record DeleteNotificationCommand(Guid NotificationId, Guid UserId) : IRequest<Result>;
