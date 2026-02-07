using UniHub.Chat.Domain.Conversations;
using UniHub.Chat.Domain.Messages;

namespace UniHub.Chat.Application.Abstractions;

/// <summary>
/// Repository for Message entity operations
/// </summary>
public interface IMessageRepository
{
    /// <summary>
    /// Get a message by ID
    /// </summary>
    Task<Message?> GetByIdAsync(MessageId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all messages in a conversation
    /// </summary>
    Task<IReadOnlyList<Message>> GetByConversationIdAsync(
        ConversationId conversationId,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new message
    /// </summary>
    Task AddAsync(Message message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing message
    /// </summary>
    Task UpdateAsync(Message message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Count messages in a conversation
    /// </summary>
    Task<int> CountByConversationIdAsync(ConversationId conversationId, CancellationToken cancellationToken = default);
}
