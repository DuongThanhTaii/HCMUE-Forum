using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniHub.Chat.Application.Commands.SendMessage;
using UniHub.Chat.Application.Queries.GetMessages;

namespace UniHub.Chat.Presentation.Controllers;

/// <summary>
/// Controller for managing messages
/// </summary>
[ApiController]
[Route("api/v1/chat/messages")]
[Authorize]
[Produces("application/json")]
public class MessagesController : ControllerBase
{
    private readonly ISender _sender;

    public MessagesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Get messages for a conversation with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<MessageResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMessages(
        [FromQuery] Guid conversationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = new GetMessagesQuery(conversationId, page, pageSize);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Conversation.NotFound")
            {
                return NotFound(new { error = result.Error.Message });
            }

            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Send a text message to a conversation
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SendMessageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        [FromBody] SendMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        var command = new SendMessageCommand(
            request.ConversationId,
            userId,
            request.Content,
            request.ReplyToMessageId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code.Contains("NotFound"))
            {
                return NotFound(new { error = result.Error.Message });
            }

            if (result.Error.Code.Contains("NotParticipant"))
            {
                return Forbid();
            }

            return BadRequest(new { error = result.Error.Message });
        }

        var response = new SendMessageResponse
        {
            MessageId = result.Value,
            SentAt = DateTime.UtcNow
        };

        return CreatedAtAction(
            nameof(GetMessages),
            new { conversationId = request.ConversationId },
            response);
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}

/// <summary>
/// Request to send a message
/// </summary>
public record SendMessageRequest(
    Guid ConversationId,
    string Content,
    Guid? ReplyToMessageId = null);

/// <summary>
/// Response after sending a message
/// </summary>
public record SendMessageResponse
{
    public Guid MessageId { get; init; }
    public DateTime SentAt { get; init; }
}
