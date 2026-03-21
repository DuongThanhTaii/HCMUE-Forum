using Microsoft.EntityFrameworkCore;
using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Conversations;
using UniHub.Infrastructure.Persistence;

namespace UniHub.Chat.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of conversation repository for Chat module
/// </summary>
public sealed class ConversationRepository : IConversationRepository
{
    private readonly ApplicationDbContext _context;

    public ConversationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation?> GetByIdAsync(ConversationId id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Conversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var conversations = await _context.Conversations
            .Where(c => c.Participants.Contains(userId) && !c.IsArchived)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return conversations.AsReadOnly();
    }

    public async Task<Conversation?> GetDirectConversationAsync(Guid user1Id, Guid user2Id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .FirstOrDefaultAsync(c =>
                c.Type == ConversationType.Direct &&
                c.Participants.Contains(user1Id) &&
                c.Participants.Contains(user2Id),
                cancellationToken);
    }

    public async Task<bool> ExistsAsync(ConversationId id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .AnyAsync(c => c.Id == id, cancellationToken);
    }

    public async Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.AddAsync(conversation, cancellationToken);
    }

    public Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        _context.Conversations.Update(conversation);
        return Task.CompletedTask;
    }
}
