using Microsoft.EntityFrameworkCore;
using UniHub.Chat.Application.Abstractions;
using UniHub.Identity.Domain.Users;
using UniHub.Infrastructure.Persistence;

namespace UniHub.Chat.Infrastructure.Services;

/// <summary>
/// Loads display names for conversation participants from the identity store.
/// </summary>
public sealed class ConversationParticipantLookup : IConversationParticipantLookup
{
    private readonly ApplicationDbContext _context;

    public ConversationParticipantLookup(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyDictionary<Guid, ParticipantDisplay>> GetByIdsAsync(
        IReadOnlyList<Guid> userIds,
        CancellationToken cancellationToken = default)
    {
        if (userIds.Count == 0)
        {
            return new Dictionary<Guid, ParticipantDisplay>();
        }

        var distinct = userIds.Distinct().ToList();

        var rows = await _context.Set<User>()
            .AsNoTracking()
            .Where(u => distinct.Contains(EF.Property<Guid>(u, nameof(User.Id))))
            .Select(u => new
            {
                Id = EF.Property<Guid>(u, nameof(User.Id)),
                First = u.Profile.FirstName,
                Last = u.Profile.LastName,
                Email = u.Email.Value,
            })
            .ToListAsync(cancellationToken);

        var map = new Dictionary<Guid, ParticipantDisplay>();
        foreach (var r in rows)
        {
            var name = $"{r.First} {r.Last}".Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                name = r.Email;
            }

            map[r.Id] = new ParticipantDisplay(name, r.Email);
        }

        return map;
    }
}
