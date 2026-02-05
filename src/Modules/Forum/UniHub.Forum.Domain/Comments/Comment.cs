using UniHub.Forum.Domain.Comments.ValueObjects;
using UniHub.Forum.Domain.Events;
using UniHub.Forum.Domain.Posts;
using UniHub.SharedKernel.Domain;
using UniHub.SharedKernel.Results;

namespace UniHub.Forum.Domain.Comments;

public sealed class Comment : Entity<CommentId>
{
    public PostId PostId { get; private set; }
    public Guid AuthorId { get; private set; }
    public CommentContent Content { get; private set; }
    public CommentId? ParentCommentId { get; private set; }
    public bool IsAcceptedAnswer { get; private set; }
    public int VoteScore { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // EF Core constructor
    private Comment()
    {
        PostId = null!;
        Content = null!;
    }

    private Comment(
        CommentId id,
        PostId postId,
        Guid authorId,
        CommentContent content,
        CommentId? parentCommentId)
    {
        Id = id;
        PostId = postId;
        AuthorId = authorId;
        Content = content;
        ParentCommentId = parentCommentId;
        IsAcceptedAnswer = false;
        VoteScore = 0;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<Comment> Create(
        PostId postId,
        Guid authorId,
        CommentContent content,
        CommentId? parentCommentId = null)
    {
        var comment = new Comment(
            CommentId.CreateUnique(),
            postId,
            authorId,
            content,
            parentCommentId);

        comment.RaiseDomainEvent(new CommentAddedEvent(comment.Id, comment.PostId, comment.AuthorId, comment.ParentCommentId));
        return Result.Success(comment);
    }

    public Result Update(CommentContent newContent)
    {
        if (IsDeleted)
        {
            return Result.Failure(new Error("Comment.Deleted", "Cannot update a deleted comment"));
        }

        Content = newContent;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new CommentUpdatedEvent(Id, PostId));
        return Result.Success();
    }

    public Result Delete()
    {
        if (IsDeleted)
        {
            return Result.Failure(new Error("Comment.AlreadyDeleted", "Comment is already deleted"));
        }

        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new CommentDeletedEvent(Id, PostId));
        return Result.Success();
    }

    public Result AcceptAsAnswer()
    {
        if (IsDeleted)
        {
            return Result.Failure(new Error("Comment.Deleted", "Cannot accept a deleted comment as answer"));
        }

        if (IsAcceptedAnswer)
        {
            return Result.Failure(new Error("Comment.AlreadyAccepted", "Comment is already accepted as answer"));
        }

        if (ParentCommentId is not null)
        {
            return Result.Failure(new Error("Comment.NestedComment", "Nested comments cannot be accepted as answers"));
        }

        IsAcceptedAnswer = true;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new CommentAcceptedAsAnswerEvent(Id, PostId, AuthorId));
        return Result.Success();
    }

    public Result UnacceptAsAnswer()
    {
        if (!IsAcceptedAnswer)
        {
            return Result.Failure(new Error("Comment.NotAccepted", "Comment is not accepted as answer"));
        }

        IsAcceptedAnswer = false;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new CommentUnacceptedAsAnswerEvent(Id, PostId));
        return Result.Success();
    }

    public void IncrementVoteScore()
    {
        VoteScore++;
    }

    public void DecrementVoteScore()
    {
        VoteScore--;
    }

    private void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        // In a full implementation, this would add the event to a collection
        // that gets processed by the infrastructure layer
    }
}
