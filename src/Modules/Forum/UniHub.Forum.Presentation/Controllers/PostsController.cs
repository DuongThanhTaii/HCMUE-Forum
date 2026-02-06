using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Forum.Application.Commands.BookmarkPost;
using UniHub.Forum.Application.Commands.CreatePost;
using UniHub.Forum.Application.Commands.DeletePost;
using UniHub.Forum.Application.Commands.PinPost;
using UniHub.Forum.Application.Commands.PublishPost;
using UniHub.Forum.Application.Commands.ReportPost;
using UniHub.Forum.Application.Commands.UnbookmarkPost;
using UniHub.Forum.Application.Commands.UpdatePost;
using UniHub.Forum.Application.Commands.VotePost;
using UniHub.Forum.Application.Queries.GetComments;
using UniHub.Forum.Application.Queries.GetPostById;
using UniHub.Forum.Application.Queries.GetPosts;
using UniHub.Forum.Domain.Votes;
using UniHub.Forum.Presentation.DTOs.Comments;
using UniHub.Forum.Presentation.DTOs.Posts;
using UniHub.Forum.Presentation.DTOs.Reports;
using UniHub.Forum.Presentation.DTOs.Votes;

namespace UniHub.Forum.Presentation.Controllers;

[ApiController]
[Route("api/v1/posts")]
[Produces("application/json")]
public class PostsController : ControllerBase
{
    private readonly ISender _sender;

    public PostsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Get a paginated list of posts with optional filtering
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PostListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPosts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] int? type = null,
        [FromQuery] int? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPostsQuery(pageNumber, pageSize, categoryId, type, status);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new PostListResponse
        {
            Posts = result.Value.Posts.Select(p => new PostResponse
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                Slug = p.Slug,
                Type = p.Type,
                Status = p.Status,
                AuthorId = p.AuthorId,
                CategoryId = p.CategoryId,
                Tags = p.Tags,
                VoteScore = p.VoteScore,
                CommentCount = p.CommentCount,
                IsPinned = p.IsPinned,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                PublishedAt = p.PublishedAt
            }).ToList(),
            TotalCount = result.Value.TotalCount,
            PageNumber = result.Value.PageNumber,
            PageSize = result.Value.PageSize,
            TotalPages = result.Value.TotalPages,
            HasPreviousPage = result.Value.HasPreviousPage,
            HasNextPage = result.Value.HasNextPage
        };

        return Ok(response);
    }

    /// <summary>
    /// Get a post by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPostById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPostByIdQuery(id);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure || result.Value == null)
        {
            return NotFound(new { error = "Post not found" });
        }

        var response = new PostResponse
        {
            Id = result.Value.Id,
            Title = result.Value.Title,
            Content = result.Value.Content,
            Slug = result.Value.Slug,
            Type = result.Value.Type,
            Status = result.Value.Status,
            AuthorId = result.Value.AuthorId,
            CategoryId = result.Value.CategoryId,
            Tags = result.Value.Tags,
            VoteScore = result.Value.VoteScore,
            CommentCount = result.Value.CommentCount,
            IsPinned = result.Value.IsPinned,
            CreatedAt = result.Value.CreatedAt,
            UpdatedAt = result.Value.UpdatedAt,
            PublishedAt = result.Value.PublishedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Create a new post
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePost(
        [FromBody] CreatePostRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var authorId = Guid.NewGuid(); // Placeholder

        var command = new CreatePostCommand(
            request.Title,
            request.Content,
            request.Type,
            authorId,
            request.CategoryId,
            request.Tags);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return CreatedAtAction(
            nameof(GetPostById),
            new { id = result.Value },
            new { postId = result.Value });
    }

    /// <summary>
    /// Update a post
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePost(
        Guid id,
        [FromBody] UpdatePostRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new UpdatePostCommand(
            id,
            request.Title ?? string.Empty,
            request.Content ?? string.Empty,
            request.CategoryId,
            request.Tags,
            userId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a post
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePost(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new DeletePostCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Publish a post
    /// </summary>
    [HttpPost("{id:guid}/publish")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PublishPost(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new PublishPostCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Pin or unpin a post
    /// </summary>
    [HttpPost("{id:guid}/pin")]
    [Authorize] // TODO: Add moderator/admin role requirement
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PinPost(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new PinPostCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Vote on a post (upvote or downvote)
    /// </summary>
    [HttpPost("{id:guid}/vote")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VotePost(
        Guid id,
        [FromBody] VoteRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var voteType = request.VoteType == 1 ? VoteType.Upvote : VoteType.Downvote;
        var command = new VotePostCommand(id, userId, voteType);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Get comments for a post
    /// </summary>
    [HttpGet("{id:guid}/comments")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CommentListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetPostComments(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetCommentsQuery(id, pageNumber, pageSize);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        var response = new CommentListResponse
        {
            Comments = result.Value.Comments.Select(c => new CommentResponse
            {
                Id = c.Id,
                PostId = c.PostId,
                AuthorId = c.AuthorId,
                Content = c.Content,
                ParentCommentId = c.ParentCommentId,
                VoteScore = c.VoteScore,
                IsAcceptedAnswer = c.IsAcceptedAnswer,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList(),
            TotalCount = result.Value.TotalCount,
            PageNumber = result.Value.PageNumber,
            PageSize = result.Value.PageSize,
            TotalPages = result.Value.TotalPages,
            HasPreviousPage = result.Value.HasPreviousPage,
            HasNextPage = result.Value.HasNextPage
        };

        return Ok(response);
    }

    /// <summary>
    /// Bookmark a post
    /// </summary>
    [HttpPost("{id:guid}/bookmark")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BookmarkPost(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new BookmarkPostCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Remove bookmark from a post
    /// </summary>
    [HttpDelete("{id:guid}/bookmark")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnbookmarkPost(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new UnbookmarkPostCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(new { error = result.Error.Message });
        }

        return NoContent();
    }

    /// <summary>
    /// Report a post
    /// </summary>
    [HttpPost("{id:guid}/report")]
    [Authorize]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReportPost(
        Guid id,
        [FromBody] ReportRequest request,
        CancellationToken cancellationToken = default)
    {
        // TODO: Get actual user ID from authentication context
        var userId = Guid.NewGuid(); // Placeholder

        var command = new ReportPostCommand(
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
