using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniHub.Chat.Application.Commands.AddParticipant;
using UniHub.Chat.Application.Commands.CreateDirectConversation;
using UniHub.Chat.Application.Commands.CreateGroupConversation;
using UniHub.Chat.Application.Commands.RemoveParticipant;
using UniHub.Chat.Application.Queries.GetConversations;

namespace UniHub.Chat.Presentation.Controllers;

/// <summary>
/// Controller for managing conversations
/// </summary>
[ApiController]
[Route("api/v1/chat/conversations")]
[Authorize]
[Produces("application/json")]
public class ConversationsController : ControllerBase
{
    private readonly ISender _sender;

    public ConversationsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Get all conversations for the current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ConversationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetConversations(CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var query = new GetConversationsQuery(userId);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a direct (1:1) conversation
    /// </summary>
    /// <param name="request">Request containing the other user's ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("direct")]
    [ProducesResponseType(typeof(CreateDirectConversationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateDirectConversation(
        [FromBody] CreateDirectConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        // For direct conversation, User1Id is current user, User2Id is the other user
        var command = new CreateDirectConversationCommand(
            userId,
            request.OtherUserId,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new CreateDirectConversationResponse
        {
            ConversationId = result.Value
        };

        return CreatedAtAction(
            nameof(GetConversations),
            new { id = result.Value },
            response);
    }

    /// <summary>
    /// Create a group conversation
    /// </summary>
    /// <param name="request">Request containing title and participant IDs</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("group")]
    [ProducesResponseType(typeof(CreateGroupConversationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateGroupConversation(
        [FromBody] CreateGroupConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        var command = new CreateGroupConversationCommand(
            request.Title,
            request.ParticipantIds,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new CreateGroupConversationResponse
        {
            ConversationId = result.Value
        };

        return CreatedAtAction(
            nameof(GetConversations),
            new { id = result.Value },
            response);
    }

    /// <summary>
    /// Add a participant to a group conversation
    /// </summary>
    /// <param name="id">Conversation ID</param>
    /// <param name="request">Request containing the participant ID to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpPost("{id:guid}/participants")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddParticipant(
        Guid id,
        [FromBody] AddParticipantRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        var command = new AddParticipantCommand(
            id,
            request.ParticipantId,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Conversation.NotFound")
            {
                return NotFound(new { error = result.Error.Message });
            }

            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Participant added successfully" });
    }

    /// <summary>
    /// Remove a participant from a group conversation
    /// </summary>
    /// <param name="id">Conversation ID</param>
    /// <param name="participantId">Participant ID to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    [HttpDelete("{id:guid}/participants/{participantId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveParticipant(
        Guid id,
        Guid participantId,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        var command = new RemoveParticipantCommand(
            id,
            participantId,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Conversation.NotFound")
            {
                return NotFound(new { error = result.Error.Message });
            }

            return BadRequest(new { error = result.Error.Message });
        }

        return Ok(new { message = "Participant removed successfully" });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}

/// <summary>
/// Request to create a direct conversation
/// </summary>
public record CreateDirectConversationRequest(Guid OtherUserId);

/// <summary>
/// Response after creating a conversation
/// </summary>
public record CreateDirectConversationResponse
{
    public Guid ConversationId { get; init; }
}

/// <summary>
/// Request to create a group conversation
/// </summary>
public record CreateGroupConversationRequest(string Title, List<Guid> ParticipantIds);

/// <summary>
/// Response after creating a group conversation
/// </summary>
public record CreateGroupConversationResponse
{
    public Guid ConversationId { get; init; }
}

/// <summary>
/// Request to add a participant to a conversation
/// </summary>
public record AddParticipantRequest(Guid ParticipantId);
