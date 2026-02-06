using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries.GetPopularTags;
using UniHub.Forum.Application.Queries.GetTags;
using UniHub.Forum.Domain.Tags;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of tag repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class TagRepository : ITagRepository
{
    private static readonly List<Tag> _tags = new();
    private static readonly object _lock = new();

    public Task<Tag?> GetByIdAsync(TagId id, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var tag = _tags.FirstOrDefault(t => t.Id == id);
            return Task.FromResult(tag);
        }
    }

    public Task<Tag?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var tag = _tags.FirstOrDefault(t => t.Name.Value.Equals(name, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(tag);
        }
    }

    public Task<Tag?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var tag = _tags.FirstOrDefault(t => t.Slug.Value.Equals(slug, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(tag);
        }
    }

    public Task<GetTagsResult> GetTagsAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm,
        bool orderByUsage,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _tags.AsEnumerable();

            // Filter by search term
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t =>
                    t.Name.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    t.Description.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Order by usage or name
            query = orderByUsage
                ? query.OrderByDescending(t => t.UsageCount)
                : query.OrderBy(t => t.Name.Value);

            var totalCount = query.Count();

            // Apply pagination
            var items = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TagDto
                {
                    Id = (int)t.Id.Value,
                    Name = t.Name.Value,
                    Slug = t.Slug.Value,
                    Description = t.Description.Value,
                    UsageCount = t.UsageCount,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToList();

            return Task.FromResult(new GetTagsResult
            {
                Tags = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }

    public Task<IEnumerable<PopularTagDto>> GetPopularTagsAsync(
        int count,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var popularTags = _tags
                .OrderByDescending(t => t.UsageCount)
                .Take(count)
                .Select(t => new PopularTagDto
                {
                    Id = (int)t.Id.Value,
                    Name = t.Name.Value,
                    Slug = t.Slug.Value,
                    UsageCount = t.UsageCount
                });

            return Task.FromResult(popularTags);
        }
    }

    public Task AddAsync(Tag tag, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _tags.Add(tag);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Tag tag, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _tags.FindIndex(t => t.Id == tag.Id);
            if (index >= 0)
            {
                _tags[index] = tag;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Tag tag, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _tags.RemoveAll(t => t.Id == tag.Id);
            return Task.CompletedTask;
        }
    }
}
