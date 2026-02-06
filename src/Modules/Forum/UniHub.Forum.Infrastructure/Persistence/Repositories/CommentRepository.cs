using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries.GetComments;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Posts;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// In-memory implementation of comment repository for Forum module.
/// TODO: Replace with EF Core implementation when database is configured.
/// </summary>
public sealed class CommentRepository : ICommentRepository
{
    private static readonly List<Comment> _comments = new();
    private static readonly object _lock = new();

    public Task<Comment?> GetByIdAsync(CommentId commentId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var comment = _comments.FirstOrDefault(c => c.Id == commentId);
            return Task.FromResult(comment);
        }
    }

    public Task<IReadOnlyList<Comment>> GetByPostIdAsync(PostId postId, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var comments = _comments
                .Where(c => c.PostId == postId)
                .ToList();
            return Task.FromResult<IReadOnlyList<Comment>>(comments.AsReadOnly());
        }
    }

    public Task AddAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _comments.Add(comment);
            return Task.CompletedTask;
        }
    }

    public Task UpdateAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var index = _comments.FindIndex(c => c.Id == comment.Id);
            if (index >= 0)
            {
                _comments[index] = comment;
            }
            return Task.CompletedTask;
        }
    }

    public Task DeleteAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            _comments.RemoveAll(c => c.Id == comment.Id);
            return Task.CompletedTask;
        }
    }

    public Task<GetCommentsResult> GetCommentsByPostIdAsync(
        PostId postId,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var query = _comments.Where(c => c.PostId == postId);

            var totalCount = query.Count();

            // Apply pagination and ordering
            var items = query
                .OrderBy(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CommentItem
                {
                    Id = c.Id.Value,
                    PostId = c.PostId.Value,
                    AuthorId = c.AuthorId,
                    Content = c.Content.Value,
                    ParentCommentId = c.ParentCommentId?.Value,
                    VoteScore = c.VoteScore,
                    IsAcceptedAnswer = c.IsAcceptedAnswer,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToList();

            return Task.FromResult(new GetCommentsResult
            {
                Comments = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }
    }
}
