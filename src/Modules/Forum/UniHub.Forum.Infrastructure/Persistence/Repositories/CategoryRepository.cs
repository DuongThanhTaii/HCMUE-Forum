using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Domain.Categories;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of category repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class CategoryRepository : ICategoryRepository
{
    private static readonly List<Category> _categories = new();
    private static readonly object _lock = new();

    public Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return Task.FromResult<IReadOnlyList<Category>>(_categories.ToList().AsReadOnly());
        }
    }

    public Task<Category?> GetByIdAsync(CategoryId categoryId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var category = _categories.FirstOrDefault(c => c.Id == categoryId);
            return Task.FromResult(category);
        }
    }

    public Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var category = _categories.FirstOrDefault(c => c.Slug.Value == slug);
            return Task.FromResult(category);
        }
    }

    public Task<bool> ExistsAsync(CategoryId categoryId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _categories.Any(c => c.Id == categoryId);
            return Task.FromResult(exists);
        }
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _categories.Add(category);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _categories.FindIndex(c => c.Id == category.Id);
            if (index >= 0)
            {
                _categories[index] = category;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Category category, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _categories.RemoveAll(c => c.Id == category.Id);
            return Task.CompletedTask;
        }
    }
}
