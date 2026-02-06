using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries;
using UniHub.Forum.Application.Queries.GetPostById;
using UniHub.Forum.Application.Queries.GetPosts;
using UniHub.Forum.Application.Queries.SearchPosts;
using UniHub.Forum.Domain.Posts;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of post repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class PostRepository : IPostRepository
{
    private static readonly List<Post> _posts = new();
    private static readonly object _lock = new();

    public Task<IReadOnlyList<Post>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            return Task.FromResult<IReadOnlyList<Post>>(_posts.ToList().AsReadOnly());
        }
    }

    public Task<Post?> GetByIdAsync(PostId postId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var post = _posts.FirstOrDefault(p => p.Id == postId);
            return Task.FromResult(post);
        }
    }

    public Task<Post?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var post = _posts.FirstOrDefault(p => p.Slug.Value == slug);
            return Task.FromResult(post);
        }
    }

    public Task<bool> IsSlugUniqueAsync(string slug, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var exists = _posts.Any(p => p.Slug.Value == slug);
            return Task.FromResult(!exists);
        }
    }

    public Task AddAsync(Post post, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _posts.Add(post);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Post post, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _posts.FindIndex(p => p.Id == post.Id);
            if (index >= 0)
            {
                _posts[index] = post;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Post post, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _posts.RemoveAll(p => p.Id == post.Id);
            return Task.CompletedTask;
        }
    }

    public Task<SearchPostsResult> SearchAsync(
        string searchTerm,
        Guid? categoryId = null,
        int? postType = null,
        IEnumerable<string>? tags = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _posts.AsEnumerable();

            // Filter by search term (simple contains for in-memory)
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(p =>
                    p.Title.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    p.Content.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

            // Filter by category
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId.Value == categoryId.Value);
            }

            // Filter by post type
            if (postType.HasValue)
            {
                query = query.Where(p => (int)p.Type == postType.Value);
            }

            // Filter by tags
            if (tags != null && tags.Any())
            {
                var tagList = tags.ToList();
                query = query.Where(p => p.Tags.Any(t => tagList.Contains(t)));
            }

            var totalCount = query.Count();

            // Apply pagination
            var items = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostSearchResult
                {
                    Id = p.Id.Value,
                    Title = p.Title.Value,
                    Content = p.Content.Value,
                    Slug = p.Slug.Value,
                    Type = (int)p.Type,
                    AuthorId = p.AuthorId,
                    VoteScore = p.VoteScore,
                    CategoryId = p.CategoryId.Value,
                    Tags = p.Tags.ToList(),
                    CreatedAt = p.CreatedAt,
                    CommentCount = 0,
                    IsPinned = p.IsPinned,
                    SearchRank = 1.0 // Simple rank for in-memory
                })
                .ToList();

            return Task.FromResult(new SearchPostsResult
            {
                Posts = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }

    public Task<GetPostsResult> GetPostsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        Guid? categoryId = null,
        int? type = null,
        int? status = null,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _posts.AsEnumerable();

            // Filter by category
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId.Value == categoryId.Value);
            }

            // Filter by type
            if (type.HasValue)
            {
                query = query.Where(p => (int)p.Type == type.Value);
            }

            // Filter by status
            if (status.HasValue)
            {
                query = query.Where(p => (int)p.Status == status.Value);
            }

            var totalCount = query.Count();

            // Apply pagination and ordering
            var items = query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PostItem
                {
                    Id = p.Id.Value,
                    Title = p.Title.Value,
                    Content = p.Content.Value,
                    Slug = p.Slug.Value,
                    Type = (int)p.Type,
                    Status = (int)p.Status,
                    AuthorId = p.AuthorId,
                    CategoryId = p.CategoryId.Value,
                    Tags = p.Tags.ToList(),
                    VoteScore = p.VoteScore,
                    CommentCount = 0,
                    IsPinned = p.IsPinned,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToList();

            return Task.FromResult(new GetPostsResult
            {
                Posts = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }

    public Task<PostDetailResult?> GetPostDetailsAsync(
        PostId postId,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var post = _posts.FirstOrDefault(p => p.Id == postId);
            if (post == null)
            {
                return Task.FromResult<PostDetailResult?>(null);
            }

            var result = new PostDetailResult
            {
                Id = post.Id.Value,
                Title = post.Title.Value,
                Content = post.Content.Value,
                Slug = post.Slug.Value,
                Type = (int)post.Type,
                Status = (int)post.Status,
                AuthorId = post.AuthorId,
                CategoryId = post.CategoryId.Value,
                Tags = post.Tags.ToList(),
                VoteScore = post.VoteScore,
                CommentCount = 0,
                IsPinned = post.IsPinned,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt
            };

            return Task.FromResult<PostDetailResult?>(result);
        }
    }
}
