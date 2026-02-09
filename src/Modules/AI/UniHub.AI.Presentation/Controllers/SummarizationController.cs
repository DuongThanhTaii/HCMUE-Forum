using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using UniHub.AI.Application.DTOs;
using UniHub.AI.Application.Services;

namespace UniHub.AI.Presentation.Controllers;

/// <summary>
/// Controller for document summarization operations.
/// </summary>
[ApiController]
[Route("api/v1/ai")]
[Produces("application/json")]
[Authorize]
[EnableRateLimiting("ai")]
public class SummarizationController : ControllerBase
{
    private readonly IDocumentSummarizationService _summarizationService;

    public SummarizationController(IDocumentSummarizationService summarizationService)
    {
        _summarizationService = summarizationService ?? throw new ArgumentNullException(nameof(summarizationService));
    }

    /// <summary>
    /// Summarize a document or text content.
    /// </summary>
    /// <param name="request">Summarization request with content and options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>SummarizationResponse with summary and key points.</returns>
    [HttpPost("summarize")]
    [ProducesResponseType(typeof(SummarizationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Summarize(
        [FromBody] SummarizationRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { error = "Content is required for summarization." });
        }

        try
        {
            var response = await _summarizationService.SummarizeAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while summarizing content.", details = ex.Message });
        }
    }

    /// <summary>
    /// Extract key points from text without full summarization.
    /// </summary>
    /// <param name="content">Content to extract key points from.</param>
    /// <param name="maxPoints">Maximum number of key points to extract.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of key points.</returns>
    [HttpPost("summarize/keypoints")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExtractKeyPoints(
        [FromBody] KeyPointsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { error = "Content is required." });
        }

        try
        {
            var keyPoints = await _summarizationService.ExtractKeyPointsAsync(
                request.Content, 
                request.MaxPoints,
                cancellationToken);
            
            return Ok(new { keyPoints });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while extracting key points.", details = ex.Message });
        }
    }

    /// <summary>
    /// Detect the language of text content.
    /// </summary>
    /// <param name="content">Text content to analyze.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detected language code.</returns>
    [HttpGet("summarize/detect-language")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DetectLanguage(
        [FromQuery] string content,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return BadRequest(new { error = "Content parameter is required." });
        }

        try
        {
            var language = await _summarizationService.DetectLanguageAsync(content, cancellationToken);
            return Ok(new { language });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while detecting language.", details = ex.Message });
        }
    }

    /// <summary>
    /// Clear summarization cache.
    /// </summary>
    /// <param name="cacheKey">Optional specific cache key to clear. If omitted, clears all cache.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("summarize/cache")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ClearCache(
        [FromQuery] string? cacheKey = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(cacheKey))
            {
                await _summarizationService.ClearAllCacheAsync();
            }
            else
            {
                await _summarizationService.ClearCacheAsync(cacheKey);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, 
                new { error = "An error occurred while clearing cache.", details = ex.Message });
        }
    }
}

/// <summary>
/// Request model for extracting key points.
/// </summary>
public class KeyPointsRequest
{
    /// <summary>
    /// Content to extract key points from.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Maximum number of key points to extract.
    /// </summary>
    public int MaxPoints { get; set; } = 5;
}
