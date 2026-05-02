using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;
using UniHub.SharedKernel.CQRS;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Application.Queries.GetConversations;

/// <summary>
/// Handler for getting user's conversations
/// </summary>
public sealed class GetConversationsQueryHandler : IQueryHandler<GetConversationsQuery, IReadOnlyList<ConversationResponse>>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IConversationParticipantLookup _participantLookup;

    public GetConversationsQueryHandler(
        IConversationRepository conversationRepository,
        IConversationParticipantLookup participantLookup)
    {
        _conversationRepository = conversationRepository;
        _participantLookup = participantLookup;
    }

    public async Task<Result<IReadOnlyList<ConversationResponse>>> Handle(
        GetConversationsQuery request,
        CancellationToken cancellationToken)
    {
        var conversations = await _conversationRepository.GetByUserIdAsync(request.UserId, cancellationToken);

        var allParticipantIds = conversations
            .SelectMany(c => c.Participants)
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var peerCards = await _participantLookup.GetByIdsAsync(allParticipantIds, cancellationToken);

        var response = conversations
            .Select(c =>
            {
                Guid? peerId = null;
                string? peerName = null;
                string? peerEmail = null;
                string? title = c.Type == ConversationType.Group ? c.Title : null;

                if (c.Type == ConversationType.Direct)
                {
                    var other = c.Participants.FirstOrDefault(p => p != request.UserId);
                    if (other != Guid.Empty && peerCards.TryGetValue(other, out var card))
                    {
                        peerId = other;
                        peerName = card.FullName;
                        peerEmail = card.Email;
                    }

                    return new ConversationResponse(
                        c.Id.Value,
                        c.Type.ToString(),
                        c.Participants.ToList(),
                        c.LastMessageAt,
                        c.CreatedAt,
                        c.IsArchived,
                        title,
                        peerId,
                        peerName,
                        peerEmail);
                }

                if (c.Type == ConversationType.Group)
                {
                    var custom = c.Title?.Trim();
                    if (string.IsNullOrEmpty(custom))
                    {
                        var otherNames = c.Participants
                            .Where(p => p != request.UserId)
                            .Select(p => peerCards.TryGetValue(p, out var g) ? g.FullName : null)
                            .Where(n => !string.IsNullOrWhiteSpace(n))
                            .Select(n => n!)
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .OrderBy(n => n, StringComparer.OrdinalIgnoreCase)
                            .ToList();
                        const int maxNames = 3;
                        if (otherNames.Count == 0)
                        {
                            title = $"Group ({c.Participants.Count})";
                        }
                        else if (otherNames.Count <= maxNames)
                        {
                            title = string.Join(", ", otherNames);
                        }
                        else
                        {
                            title = string.Join(", ", otherNames.Take(maxNames)) +
                                    $" +{otherNames.Count - maxNames}";
                        }
                    }
                    else
                    {
                        title = custom;
                    }
                }

                return new ConversationResponse(
                    c.Id.Value,
                    c.Type.ToString(),
                    c.Participants.ToList(),
                    c.LastMessageAt,
                    c.CreatedAt,
                    c.IsArchived,
                    title,
                    null,
                    null,
                    null);
            })
            .ToList();

        return Result.Success<IReadOnlyList<ConversationResponse>>(response);
    }
}
