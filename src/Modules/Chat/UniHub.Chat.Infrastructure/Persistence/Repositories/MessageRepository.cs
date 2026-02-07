using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;
using UniHub.Chat.Domain.Messages;

namespace UniHub.Chat.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of message repository for Chat module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class MessageRepository : IMessageRepository
{
    private static readonly List<Message> _messages = new();
    private static readonly object _lock = new();

    public Task<Message?> GetByIdAsync(MessageId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var message = _messages.FirstOrDefault(m => m.Id == id);
            return Task.FromResult(message);
        }
    }

    public Task<IReadOnlyList<Message>> GetByConversationIdAsync(
        ConversationId conversationId,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var messages = _messages
                .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList()
                .AsReadOnly();

            return Task.FromResult<IReadOnlyList<Message>>(messages);
        }
    }

    public Task AddAsync(Message message, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _messages.Add(message);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Message message, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _messages.FindIndex(m => m.Id == message.Id);
            if (index >= 0)
            {
                _messages[index] = message;
            }
            return Task.CompletedTask;
        }
    }

    public Task<int> CountByConversationIdAsync(ConversationId conversationId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var count = _messages.Count(m => m.ConversationId == conversationId && !m.IsDeleted);
            return Task.FromResult(count);
        }
    }
}
