using MediatR;
using UniHub.Learning.Application.Abstractions;
using UniHub.Learning.Domain.Documents;
using UniHub.SharedKernel.Results;

namespace UniHub.Learning.Application.Queries.Documents.GetDocumentById;

/// <summary>
/// Handler for GetDocumentByIdQuery.
/// </summary>
internal sealed class GetDocumentByIdQueryHandler
    : IRequestHandler<GetDocumentByIdQuery, Result<DocumentDetailResponse>>
{
    private readonly IDocumentRepository _documentRepository;

    public GetDocumentByIdQueryHandler(IDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    public async Task<Result<DocumentDetailResponse>> Handle(
        GetDocumentByIdQuery request,
        CancellationToken cancellationToken)
    {
        var documentId = DocumentId.Create(request.DocumentId);
        var document = await _documentRepository.GetByIdAsync(documentId, cancellationToken);

        if (document is null)
        {
            return Result.Failure<DocumentDetailResponse>(
                new Error("Document.NotFound", $"Document with ID {request.DocumentId} not found"));
        }

        var response = new DocumentDetailResponse(
            document.Id.Value,
            document.Title.Value,
            document.Description.Value,
            document.Type.ToString(),
            document.Status.ToString(),
            document.File.FileName,
            document.File.FileSize,
            document.File.ContentType,
            document.AverageRating,
            document.RatingCount,
            document.ViewCount,
            document.DownloadCount,
            document.UploaderId,
            document.CourseId,
            document.ReviewerId,
            document.ReviewComment,
            document.RejectionReason,
            document.CreatedAt,
            document.UpdatedAt,
            document.SubmittedAt,
            document.ReviewedAt);

        return Result.Success(response);
    }
}
