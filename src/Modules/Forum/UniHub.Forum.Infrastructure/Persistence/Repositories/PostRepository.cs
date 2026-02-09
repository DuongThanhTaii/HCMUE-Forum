using Microsoft.EntityFrameworkCore;
using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries;
using UniHub.Forum.Application.Queries.GetPostById;
using UniHub.Forum.Application.Queries.GetPosts;
using UniHub.Forum.Application.Queries.SearchPosts;
using UniHub.Forum.Domain.Posts;
using UniHub.Infrastructure.Persistence;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of post repository for Forum module.
/// </summary>
public sealed class PostRepository : IPostRepository
{
    private readonly ApplicationDbContext _context;

    public PostRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Post>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var posts = await _context.Posts
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return posts.AsReadOnly();
    }

    public async Task<Post?> GetByIdAsync(PostId postId, CancellationToken cancellationToken = default)
    {
        return await _context.Posts
            .FirstOrDefaultAsync(p => p.Id == postId, cancellationToken);
    }

    public async Task<Post?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _context.Posts
            .FirstOrDefaultAsync(p => p.Slug.Value == slug, cancellationToken);
    }

    public async Task<bool> IsSlugUniqueAsync(string slug, CancellationToken cancellationToken = default)
    {
        var exists = await _context.Posts
            .AnyAsync(p => p.Slug.Value == slug, cancellationToken);
        return !exists;
    }

    public async Task AddAsync(Post post, CancellationToken cancellationToken = default)
    {
        await _context.Posts.AddAsync(post, cancellationToken);
    }

    public Task UpdateAsync(Post post, CancellationToken cancellationToken = default)
    {
        _context.Posts.Update(post);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Post post, CancellationToken cancellationToken = default)
    {
        _context.Posts.Remove(post);
        return Task.CompletedTask;
    }

    public async Task<SearchPostsResult> SearchAsync(
        string searchTerm,
        Guid? categoryId = null,
        int? postType = null,
        IEnumerable<string>? tags = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Posts.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerSearchTerm = searchTerm.ToLower();
            query = query.Where(p =>
                p.Title.Value.ToLower().Contains(lowerSearchTerm) ||
                p.Content.Value.ToLower().Contains(lowerSearchTerm));
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

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
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
                CommentCount = 0, // TODO: Calculate from Comments table
                IsPinned = p.IsPinned,
                SearchRank = 1.0 // TODO: Implement full-text search ranking
            })
            .ToListAsync(cancellationToken);

        return new SearchPostsResult
        {
            Posts = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<GetPostsResult> GetPostsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        Guid? categoryId = null,
        int? type = null,
        int? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Posts.AsQueryable();

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

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
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
                CommentCount = 0, // TODO: Calculate from Comments table
                IsPinned = p.IsPinned,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new GetPostsResult
        {
            Posts = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PostDetailResult?> GetPostDetailsAsync(
        PostId postId,
        CancellationToken cancellationToken = default)
    {
        var post = await _context.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == postId, cancellationToken);
        
        if (post == null)
        {
            return null;
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
            CommentCount = 0, // TODO: Calculate from Comments table
            IsPinned = post.IsPinned,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };

        return result;
    }
}
