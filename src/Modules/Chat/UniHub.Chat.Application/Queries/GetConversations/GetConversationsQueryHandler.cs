using UniHub.Chat.Application.Abstractions;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Application.Queries.GetConversations;

/// <summary>
/// Handler for getting user's conversations
/// </summary>
public sealed class GetConversationsQueryHandler : IQueryHandler<GetConversationsQuery, IReadOnlyList<ConversationResponse>>
{
    private readonly IConversationRepository _conversationRepository;

    public GetConversationsQueryHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<Result<IReadOnlyList<ConversationResponse>>> Handle(
        GetConversationsQuery request,
        CancellationToken cancellationToken)
    {
        var conversations = await _conversationRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        var response = conversations
            .Select(c => new ConversationResponse(
                c.Id.Value,
                c.Type.ToString(),
                c.Participants.ToList(),
                c.LastMessageAt,
                c.CreatedAt,
                c.IsArchived))
            .ToList();

        return Result.Success<IReadOnlyList<ConversationResponse>>(response);
    }
}
