using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;

namespace UniHub.Chat.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of conversation repository for Chat module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class ConversationRepository : IConversationRepository
{
    private static readonly List<Conversation> _conversations = new();
    private static readonly object _lock = new();

    public Task<Conversation?> GetByIdAsync(ConversationId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var conversation = _conversations.FirstOrDefault(c => c.Id == id);
            return Task.FromResult(conversation);
        }
    }

    public Task<IReadOnlyList<Conversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var conversations = _conversations
                .Where(c => c.Participants.Contains(userId) && !c.IsArchived)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToList()
                .AsReadOnly();

            return Task.FromResult<IReadOnlyList<Conversation>>(conversations);
        }
    }

    public Task<Conversation?> GetDirectConversationAsync(Guid user1Id, Guid user2Id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var conversation = _conversations.FirstOrDefault(c =>
                c.Type == ConversationType.Direct &&
                c.Participants.Contains(user1Id) &&
                c.Participants.Contains(user2Id));

            return Task.FromResult(conversation);
        }
    }

    public Task<bool> ExistsAsync(ConversationId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _conversations.Any(c => c.Id == id);
            return Task.FromResult(exists);
        }
    }

    public Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _conversations.Add(conversation);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _conversations.FindIndex(c => c.Id == conversation.Id);
            if (index >= 0)
            {
                _conversations[index] = conversation;
            }
            return Task.CompletedTask;
        }
    }
}
