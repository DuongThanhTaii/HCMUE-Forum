using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Application.Queries.GetMessages;

/// <summary>
/// Handler for getting conversation messages
/// </summary>
public sealed class GetMessagesQueryHandler : IQueryHandler<GetMessagesQuery, PagedResponse<MessageResponse>>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;

    public GetMessagesQueryHandler(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
    }

    public async Task<Result<PagedResponse<MessageResponse>>> Handle(
        GetMessagesQuery request,
        CancellationToken cancellationToken)
    {
        // Verify conversation exists
        var conversationId = ConversationId.Create(request.ConversationId);
        var exists = await _conversationRepository.ExistsAsync(conversationId, cancellationToken);

        if (!exists)
        {
            return Result.Failure<PagedResponse<MessageResponse>>(new Error(
                "Conversation.NotFound",
                $"Conversation with ID {request.ConversationId} not found"));
        }

        // Get messages
        var messages = await _messageRepository.GetByConversationIdAsync(
            conversationId,
            request.Page,
            request.PageSize,
            cancellationToken);

        // Get total count for pagination
        var totalCount = await _messageRepository.CountByConversationIdAsync(conversationId, cancellationToken);

        // Map to response
        var messageResponses = messages
            .Select(m => new MessageResponse(
                m.Id.Value,
                m.ConversationId.Value,
                m.SenderId,
                m.Content,
                m.Type.ToString(),
                m.SentAt,
                m.EditedAt,
                m.IsDeleted,
                m.ReplyToMessageId?.Value,
                m.Reactions
                    .GroupBy(r => r.Emoji)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(r => r.UserId).ToList())))
            .ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var response = new PagedResponse<MessageResponse>(
            messageResponses,
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);

        return Result.Success(response);
    }
}
