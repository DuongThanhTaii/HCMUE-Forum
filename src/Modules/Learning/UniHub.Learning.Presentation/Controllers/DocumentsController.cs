using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniHub.Contracts;
using UniHub.Learning.Application.Commands.DocumentDownload;
using UniHub.Learning.Application.Commands.DocumentRating;
using UniHub.Learning.Application.Commands.UploadDocument;
using UniHub.Learning.Application.Commands.ApprovalWorkflow;
using UniHub.Learning.Application.Queries.DocumentSearch;
using UniHub.Learning.Application.Queries.Documents.GetDocumentById;
using UniHub.Learning.Domain.Documents;
using UniHub.Learning.Presentation.DTOs.Documents;

namespace UniHub.Learning.Presentation.Controllers;

[Route("api/v1/documents")]
[Produces("application/json")]
public class DocumentsController : BaseApiController
{
    private readonly ISender _sender;

    public DocumentsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Search documents with filtering and pagination
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<SearchDocumentsResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchDocuments(
        [FromQuery] SearchDocumentsRequest request,
        CancellationToken cancellationToken)
    {
        var query = new SearchDocumentsQuery(
            request.SearchTerm,
            request.CourseId,
            request.FacultyId,
            request.DocumentType,
            request.Status,
            request.SortBy ?? DocumentSortBy.CreatedDate,
            request.SortDescending ?? true,
            request.PageNumber ?? 1,
            request.PageSize ?? 20);

        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }

    /// <summary>
    /// Get a document by its ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<DocumentDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetDocumentByIdQuery(id);
        var result = await _sender.Send(query, cancellationToken);

        if (result.IsFailure)
        {
            return NotFound(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success(result.Value));
    }

    /// <summary>
    /// Upload a new document
    /// </summary>
    [HttpPost("upload")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UploadDocumentResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadDocument(
        [FromForm] UploadDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UploadDocumentCommand(
            request.Title,
            request.Description ?? string.Empty,
            request.FileName,
            request.FileContent,
            request.ContentType,
            request.FileSize,
            (DocumentType)request.DocumentType,
            request.UploaderId,
            request.CourseId);

        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        var response = new UploadDocumentResponse(result.Value, request.Title);

        return CreatedAtAction(nameof(UploadDocument), new { id = response.DocumentId }, ApiResponses.Success(response, "Document uploaded successfully"));
    }

    /// <summary>
    /// Rate a document (1-5 stars)
    /// </summary>
    [HttpPost("{id}/rate")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RateDocument(
        Guid id,
        [FromBody] RateDocumentRequest request,
        CancellationToken cancellationToken)
    {
        Guid userId;
        try
        {
            userId = GetCurrentUserId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(ApiResponses.Failure("User is not authenticated."));
        }

        if (request.UserId != userId)
        {
            return BadRequest(ApiResponses.Failure("UserId in request must match the authenticated user."));
        }

        var command = new RateDocumentCommand(id, userId, request.Rating);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Document rated successfully"));
    }

    /// <summary>
    /// Download a document
    /// </summary>
    [HttpPost("{id}/download")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadDocument(
        Guid id,
        [FromBody] DownloadDocumentRequest request,
        CancellationToken cancellationToken)
    {
        Guid userId;
        try
        {
            userId = GetCurrentUserId();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(ApiResponses.Failure("User is not authenticated."));
        }

        if (request.UserId != userId)
        {
            return BadRequest(ApiResponses.Failure("UserId in request must match the authenticated user."));
        }

        var command = new DownloadDocumentCommand(id, userId);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Document download tracked successfully"));
    }

    /// <summary>
    /// Approve a document
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveDocument(
        Guid id,
        [FromBody] ApproveDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new ApproveDocumentCommand(id, request.ReviewerId, request.Comment);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Document approved successfully"));
    }

    /// <summary>
    /// Reject a document
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectDocument(
        Guid id,
        [FromBody] RejectDocumentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RejectDocumentCommand(id, request.ReviewerId, request.Reason);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Document rejected successfully"));
    }

    /// <summary>
    /// Request revision for a document
    /// </summary>
    [HttpPost("{id}/request-revision")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object?>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestRevision(
        Guid id,
        [FromBody] RequestRevisionRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RequestRevisionCommand(id, request.ReviewerId, request.Reason);
        var result = await _sender.Send(command, cancellationToken);

        if (result.IsFailure)
        {
            return BadRequest(ApiResponses.Failure(result.Error.Message));
        }

        return Ok(ApiResponses.Success("Revision requested successfully"));
    }
}
