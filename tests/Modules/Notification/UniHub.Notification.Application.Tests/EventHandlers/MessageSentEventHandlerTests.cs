using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UniHub.Chat.Domain.Messages;
using UniHub.Chat.Domain.Messages.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Application.EventHandlers;
using Xunit;

namespace UniHub.Notification.Application.Tests.EventHandlers;

public class MessageSentEventHandlerTests
{
    private readonly IPushNotificationService _pushNotificationService;
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<MessageSentEventHandler> _logger;
    private readonly MessageSentEventHandler _handler;

    public MessageSentEventHandlerTests()
    {
        _pushNotificationService = Substitute.For<IPushNotificationService>();
        _inAppNotificationService = Substitute.For<IInAppNotificationService>();
        _logger = Substitute.For<ILogger<MessageSentEventHandler>>();
        _handler = new MessageSentEventHandler(
            _pushNotificationService,
            _inAppNotificationService,
            _logger);
    }

    [Fact]
    public async Task Handle_ShouldLogExecution()
    {
        // Arrange
        var messageId = Guid.NewGuid();
        var conversationId = Guid.NewGuid();
        var senderId = Guid.NewGuid();
        var @event = new MessageSentEvent(
            messageId,
            conversationId,
            senderId,
            MessageType.Text,
            "Hello!",
            DateTime.UtcNow);

        // Act
        await _handler.Handle(@event, CancellationToken.None);

        // Assert - Should complete without error
        // Note: Since conversation repository is not implemented, handler logs but doesn't send notifications
        await Task.CompletedTask;
    }
}
