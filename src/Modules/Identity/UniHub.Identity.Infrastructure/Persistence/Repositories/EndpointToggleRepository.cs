using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Authorization;

namespace UniHub.Identity.Infrastructure.Persistence.Repositories;

public sealed class EndpointToggleRepository : IEndpointToggleRepository
{
    private static readonly List<EndpointToggle> Toggles = new();
    private static readonly object LockObj = new();

    public Task<EndpointToggle?> GetByEndpointKeyAsync(string endpointKey, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            var result = Toggles.FirstOrDefault(item =>
                item.EndpointKey.Equals(endpointKey, StringComparison.OrdinalIgnoreCase));

            return Task.FromResult(result);
        }
    }

    public Task<List<EndpointToggle>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            return Task.FromResult(Toggles.ToList());
        }
    }

    public Task AddAsync(EndpointToggle endpointToggle, CancellationToken cancellationToken = default)
    {
        lock (LockObj)
        {
            Toggles.Add(endpointToggle);
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(EndpointToggle endpointToggle, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
