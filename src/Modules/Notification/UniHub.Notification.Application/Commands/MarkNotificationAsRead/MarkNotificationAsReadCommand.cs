using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Application.Commands.MarkNotificationAsRead;

/// <summary>
/// Command to mark a notification as read.
/// </summary>
public sealed record MarkNotificationAsReadCommand(Guid NotificationId, Guid UserId) : IRequest<Result>;
