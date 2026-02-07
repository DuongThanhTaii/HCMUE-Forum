using UniHub.Chat.Application.Abstractions;
using UniHub.Chat.Domain.Channels;

namespace UniHub.Chat.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of channel repository for Chat module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class ChannelRepository : IChannelRepository
{
    private static readonly List<Channel> _channels = new();
    private static readonly object _lock = new();

    public Task<Channel?> GetByIdAsync(ChannelId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var channel = _channels.FirstOrDefault(c => c.Id == id);
            return Task.FromResult(channel);
        }
    }

    public Task<IReadOnlyList<Channel>> GetPublicChannelsAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var publicChannels = _channels
                .Where(c => c.Type == ChannelType.Public && !c.IsArchived)
                .OrderBy(c => c.Name)
                .ToList()
                .AsReadOnly();

            return Task.FromResult<IReadOnlyList<Channel>>(publicChannels);
        }
    }

    public Task<IReadOnlyList<Channel>> GetByMemberIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var memberChannels = _channels
                .Where(c => c.Members.Contains(userId) && !c.IsArchived)
                .OrderBy(c => c.Name)
                .ToList()
                .AsReadOnly();

            return Task.FromResult<IReadOnlyList<Channel>>(memberChannels);
        }
    }

    public Task<bool> ExistsAsync(ChannelId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _channels.Any(c => c.Id == id);
            return Task.FromResult(exists);
        }
    }

    public Task AddAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _channels.Add(channel);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _channels.FindIndex(c => c.Id == channel.Id);
            if (index >= 0)
            {
                _channels[index] = channel;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Channel channel, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _channels.Remove(channel);
            return Task.CompletedTask;
        }
    }
}
