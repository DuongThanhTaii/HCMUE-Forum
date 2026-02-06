using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Forum.Application.Commands.AcceptAnswer;
using UniHub.Forum.Application.Commands.AddComment;
using UniHub.Forum.Application.Commands.DeleteComment;
using UniHub.Forum.Application.Commands.ReportComment;
using UniHub.Forum.Application.Commands.UpdateComment;
using UniHub.Forum.Application.Commands.VoteComment;
using UniHub.Forum.Domain.Votes;
using UniHub.Forum.Presentation.DTOs.Comments;
using UniHub.Forum.Presentation.DTOs.Reports;
using UniHub.Forum.Presentation.DTOs.Votes;

namespace UniHub.Forum.Presentation.Controllers;

[ApiController]
[Route("api/v1/comments")]
[Produces("application/json")]
public class CommentsController : ControllerBase
{
    private readonly ISender _sender;

    public CommentsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Add a comment to a post
    /// </summary>
    [HttpPost("posts/{postId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddComment(
        Guid postId,
        [FromBody] AddCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new AddCommentCommand(
            postId,
            userId,
            request.Content,
            request.ParentCommentId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Created(string.Empty, new { commentId = result.Value });
    }

    /// <summary>
    /// Update a comment
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateComment(
        Guid id,
        [FromBody] UpdateCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new UpdateCommentCommand(id, request.Content, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a comment
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteComment(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new DeleteCommentCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Vote on a comment (upvote or downvote)
    /// </summary>
    [HttpPost("{id:guid}/vote")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VoteComment(
        Guid id,
        [FromBody] VoteRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var voteType = request.VoteType == 1 ? VoteType.Upvote : VoteType.Downvote;
        var command = new VoteCommentCommand(id, userId, voteType);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Accept a comment as the answer to a question post
    /// </summary>
    [HttpPost("{id:guid}/accept")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptAnswer(
        Guid id,
        [FromQuery] Guid postId,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new AcceptAnswerCommand(id, postId, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Report a comment
    /// </summary>
    [HttpPost("{id:guid}/report")]
    [Authorize]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReportComment(
        Guid id,
        [FromBody] ReportRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new ReportCommentCommand(
            id,
            userId,
            (UniHub.Forum.Domain.Reports.ReportReason)request.Reason,
            request.Description);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return Created(string.Empty, new { reportId = result.Value });
    }
}
