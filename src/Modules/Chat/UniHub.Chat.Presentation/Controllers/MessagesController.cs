using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniHub.Chat.Application.Commands.AddReaction;
using UniHub.Chat.Application.Commands.RemoveReaction;
using UniHub.Chat.Application.Commands.SendMessage;
using UniHub.Chat.Application.Commands.SendMessageWithAttachments;
using UniHub.Chat.Application.Commands.UploadFile;
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

    /// <summary>
    /// Upload a file for chat
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(UploadFileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadFile(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided" });
        }

        var userId = GetUserId();

        using var stream = file.OpenReadStream();

        var command = new UploadFileCommand(
            file.FileName,
            stream,
            file.ContentType,
            file.Length,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new UploadFileResponse
        {
            FileName = result.Value.FileName,
            FileUrl = result.Value.FileUrl,
            FileSize = result.Value.FileSize,
            ContentType = result.Value.ContentType
        };

        return Ok(response);
    }

    /// <summary>
    /// Send a message with file attachments
    /// </summary>
    [HttpPost("with-attachments")]
    [ProducesResponseType(typeof(SendMessageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessageWithAttachments(
        [FromBody] SendMessageWithAttachmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        var attachments = request.Attachments
            .Select(a => new AttachmentDto(
                a.FileName,
                a.FileUrl,
                a.FileSize,
                a.MimeType,
                a.ThumbnailUrl))
            .ToList();

        var command = new SendMessageWithAttachmentsCommand(
            request.ConversationId,
            userId,
            request.Content,
            attachments,
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

    /// <summary>
    /// Add an emoji reaction to a message
    /// </summary>
    [HttpPost("{messageId}/reactions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddReaction(
        Guid messageId,
        [FromBody] AddReactionRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var command = new AddReactionCommand(messageId, userId, request.Emoji);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Message.NotFound")
            {
                return NotFound(new { error = result.Error.Message });
            }

            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { success = true });
    }

    /// <summary>
    /// Remove an emoji reaction from a message
    /// </summary>
    [HttpDelete("{messageId}/reactions/{emoji}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveReaction(
        Guid messageId,
        string emoji,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var command = new RemoveReactionCommand(messageId, userId, emoji);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Message.NotFound")
            {
                return NotFound(new { error = result.Error.Message });
            }

            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { success = true });
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
/// Request to send a message with attachments
/// </summary>
public record SendMessageWithAttachmentsRequest(
    Guid ConversationId,
    string? Content,
    List<AttachmentRequest> Attachments,
    Guid? ReplyToMessageId = null);

/// <summary>
/// Attachment data for request
/// </summary>
public record AttachmentRequest(
    string FileName,
    string FileUrl,
    long FileSize,
    string MimeType,
    string? ThumbnailUrl = null);

/// <summary>
/// Response after sending a message
/// </summary>
public record SendMessageResponse
{
    public Guid MessageId { get; init; }
    public DateTime SentAt { get; init; }
}

/// <summary>
/// Response after uploading a file
/// </summary>
public record UploadFileResponse
{
    public string FileName { get; init; } = string.Empty;
    public string FileUrl { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string ContentType { get; init; } = string.Empty;
}

/// <summary>
/// Request to add a reaction to a message
/// </summary>
public record AddReactionRequest(string Emoji);
