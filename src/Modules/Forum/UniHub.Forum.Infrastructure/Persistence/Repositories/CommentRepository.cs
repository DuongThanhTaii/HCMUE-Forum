using Microsoft.EntityFrameworkCore;
using UniHub.Forum.Application.Abstractions;
using UniHub.Forum.Application.Queries.GetComments;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Posts;
using UniHub.Infrastructure.Persistence;

namespace UniHub.Forum.Infrastructure.Persistence.Repositories;

/// <summary>
/// EF Core implementation of comment repository for Forum module.
/// </summary>
public sealed class CommentRepository : ICommentRepository
{
    private readonly ApplicationDbContext _context;

    public CommentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Comment?> GetByIdAsync(CommentId commentId, CancellationToken cancellationToken = default)
    {
        return await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId, cancellationToken);
    }

    public async Task<IReadOnlyList<Comment>> GetByPostIdAsync(PostId postId, CancellationToken cancellationToken = default)
    {
        var comments = await _context.Comments
            .Where(c => c.PostId == postId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return comments.AsReadOnly();
    }

    public async Task AddAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        await _context.Comments.AddAsync(comment, cancellationToken);
    }

    public Task UpdateAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        _context.Comments.Update(comment);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        _context.Comments.Remove(comment);
        return Task.CompletedTask;
    }

    public async Task<GetCommentsResult> GetCommentsByPostIdAsync(
        PostId postId,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Comments.Where(c => c.PostId == postId);

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination and ordering
        var items = await query
            .OrderBy(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .Select(c => new CommentItem
            {
                Id = c.Id.Value,
                PostId = c.PostId.Value,
                AuthorId = c.AuthorId,
                Content = c.Content.Value,
                ParentCommentId = c.ParentCommentId != null ? c.ParentCommentId.Value : null,
                VoteScore = c.VoteScore,
                IsAcceptedAnswer = c.IsAcceptedAnswer,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new GetCommentsResult
        {
            Comments = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}
