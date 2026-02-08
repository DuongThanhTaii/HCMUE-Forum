using MediatR;
using UniHub.SharedKernel.Results;

namespace UniHub.Notification.Application.Commands.MarkAllNotificationsAsRead;

/// <summary>
/// Command to mark all notifications as read for a user.
/// </summary>
public sealed record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<Result<int>>;
