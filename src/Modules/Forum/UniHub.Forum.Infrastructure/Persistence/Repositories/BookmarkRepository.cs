using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries.GetBookmarkedPosts;
using UniHub.Forum.Domain.Bookmarks;
using UniHub.Forum.Domain.Posts;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of bookmark repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class BookmarkRepository : IBookmarkRepository
{
    private static readonly List<Bookmark> _bookmarks = new();
    private static readonly object _lock = new();

    public Task<Bookmark?> GetByUserAndPostAsync(
        Guid userId,
        PostId postId,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var bookmark = _bookmarks.FirstOrDefault(b =>
                b.UserId == userId && b.PostId == postId);
            return Task.FromResult(bookmark);
        }
    }

    public Task<GetBookmarkedPostsResult> GetBookmarkedPostsAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _bookmarks.Where(b => b.UserId == userId);

            var totalCount = query.Count();

            // Apply pagination and ordering
            // Note: This is simplified. In a real implementation with EF Core,
            // you would join with Posts table to get full post details.
            var items = query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookmarkedPostDto
                {
                    Id = b.PostId.Value,
                    BookmarkedAt = b.CreatedAt,
                    // Other fields would be populated via join with Posts in real implementation
                    Title = string.Empty,
                    Slug = string.Empty,
                    PostType = 0,
                    Status = 0,
                    AuthorId = Guid.Empty,
                    VoteScore = 0,
                    CommentCount = 0,
                    ViewCount = 0,
                    IsPinned = false,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            return Task.FromResult(new GetBookmarkedPostsResult
            {
                Posts = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }

    public Task AddAsync(Bookmark bookmark, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _bookmarks.Add(bookmark);
            return Task.CompletedTask;
        }
    }

    public Task RemoveAsync(Bookmark bookmark, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _bookmarks.RemoveAll(b =>
                b.UserId == bookmark.UserId && b.PostId == bookmark.PostId);
            return Task.CompletedTask;
        }
    }
}
