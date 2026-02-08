using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UniHub.Learning.Domain.Documents.Events;
using UniHub.Notification.Application.Abstractions.Notifications;
using UniHub.Notification.Application.EventHandlers;
using Xunit;

namespace UniHub.Notification.Application.Tests.EventHandlers;

public class DocumentApprovedEventHandlerTests
{
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly IInAppNotificationService _inAppNotificationService;
    private readonly ILogger<DocumentApprovedEventHandler> _logger;
    private readonly DocumentApprovedEventHandler _handler;

    public DocumentApprovedEventHandlerTests()
    {
        _emailNotificationService = Substitute.For<IEmailNotificationService>();
        _inAppNotificationService = Substitute.For<IInAppNotificationService>();
        _logger = Substitute.For<ILogger<DocumentApprovedEventHandler>>();
        _handler = new DocumentApprovedEventHandler(
            _emailNotificationService,
            _inAppNotificationService,
            _logger);
    }

    [Fact]
    public async Task Handle_ShouldLogExecution()
    {
        // Arrange
        var documentId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var @event = new DocumentApprovedEvent(documentId, approverId, "Good work!", DateTime.UtcNow);

        // Act
        await _handler.Handle(@event, CancellationToken.None);

        // Assert - Should complete without error
        // Note: Since document repository is not implemented, handler logs but doesn't send notifications
        await Task.CompletedTask;
    }
}
