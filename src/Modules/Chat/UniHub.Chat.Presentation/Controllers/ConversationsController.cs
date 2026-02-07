using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UniHub.Chat.Application.Commands.CreateDirectConversation;
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
