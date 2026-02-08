using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.AI.Application.DTOs;
using UniHub.AI.Application.Services;
using UniHub.AI.Domain.Entities;

namespace UniHub.AI.Presentation.Controllers;

/// <summary>
/// Controller for AI chatbot (UniBot) operations.
/// </summary>
[ApiController]
[Route("api/v1/ai")]
[Produces("application/json")]
public class AIChatController : ControllerBase
{
    private readonly IUniBotService _uniBotService;
    private readonly IConversationService _conversationService;

    public AIChatController(
        IUniBotService uniBotService,
        IConversationService conversationService)
    {
        _uniBotService = uniBotService ?? throw new ArgumentNullException(nameof(uniBotService));
        _conversationService = conversationService ?? throw new ArgumentNullException(nameof(conversationService));
    }

    /// <summary>
    /// Send a message to UniBot chatbot.
    /// </summary>
    /// <param name="request">Chat request with message and optional conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>ChatResponse with bot's reply.</returns>
    [HttpPost("chat")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Chat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message is required." });
        }

        try
        {
            var response = await _uniBotService.ChatAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while processing your request.", details = ex.Message });
        }
    }

    /// <summary>
    /// Get all conversations for a user.
    /// </summary>
    /// <param name="userId">User ID to filter conversations.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of conversations.</returns>
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(IReadOnlyList<Conversation>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetConversations(
        [FromQuery] string userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { error = "userId parameter is required." });
        }

        if (!Guid.TryParse(userId, out var userGuid))
        {
            return BadRequest(new { error = "Invalid userId format." });
        }

        try
        {
            var conversations = await _conversationService.GetByUserIdAsync(userGuid, cancellationToken: cancellationToken);
            return Ok(conversations);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while retrieving conversations.", details = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific conversation by ID.
    /// </summary>
    /// <param name="id">Conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Conversation details.</returns>
    [HttpGet("conversations/{id}")]
    [ProducesResponseType(typeof(Conversation), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetConversation(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Conversation ID is required." });
        }

        if (!Guid.TryParse(id, out var conversationId))
        {
            return BadRequest(new { error = "Invalid conversation ID format." });
        }

        try
        {
            var conversation = await _conversationService.GetByIdAsync(conversationId, cancellationToken);
            
            if (conversation == null)
            {
                return NotFound(new { error = $"Conversation with ID '{id}' not found." });
            }

            return Ok(conversation);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while retrieving the conversation.", details = ex.Message });
        }
    }

    /// <summary>
    /// Close/delete a conversation.
    /// </summary>
    /// <param name="id">Conversation ID to close.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("conversations/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteConversation(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Conversation ID is required." });
        }

        if (!Guid.TryParse(id, out var conversationId))
        {
            return BadRequest(new { error = "Invalid conversation ID format." });
        }

        try
        {
            var closed = await _conversationService.CloseConversationAsync(conversationId, cancellationToken);
            
            if (!closed)
            {
                return NotFound(new { error = $"Conversation with ID '{id}' not found." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while closing the conversation.", details = ex.Message });
        }
    }
}
