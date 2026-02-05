using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Posts.ValueObjects;

namespace UniHub.Forum.Domain.Tests.Posts;

public class PostTests
{
    private readonly Guid _authorId = Guid.NewGuid();
    private readonly Guid _categoryId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        var title = PostTitle.Create("Valid Post Title").Value;
        var content = PostContent.Create("This is valid post content with enough characters.").Value;
        var type = PostType.Discussion;

        // Act
        var result = Post.Create(title, content, type, _authorId, _categoryId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Title.Should().Be(title);
        result.Value.Content.Should().Be(content);
        result.Value.Type.Should().Be(type);
        result.Value.AuthorId.Should().Be(_authorId);
        result.Value.CategoryId.Should().Be(_categoryId);
        result.Value.Status.Should().Be(PostStatus.Draft);
        result.Value.ViewCount.Should().Be(0);
        result.Value.VoteScore.Should().Be(0);
        result.Value.CommentCount.Should().Be(0);
        result.Value.IsPinned.Should().BeFalse();
        result.Value.IsLocked.Should().BeFalse();
    }

    [Fact]
    public void Create_ShouldGenerateSlugFromTitle()
    {
        // Arrange
        var title = PostTitle.Create("My Cool Post Title").Value;
        var content = PostContent.Create("This is valid post content with enough characters.").Value;

        // Act
        var result = Post.Create(title, content, PostType.Discussion, _authorId);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Slug.Value.Should().Be("my-cool-post-title");
    }

    [Fact]
    public void Create_WithTags_ShouldAddTags()
    {
        // Arrange
        var title = PostTitle.Create("Valid Post Title").Value;
        var content = PostContent.Create("This is valid post content with enough characters.").Value;
        var tags = new[] { "tag1", "tag2", "tag3" };

        // Act
        var result = Post.Create(title, content, PostType.Discussion, _authorId, tags: tags);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Tags.Should().HaveCount(3);
        result.Value.Tags.Should().Contain("tag1");
        result.Value.Tags.Should().Contain("tag2");
        result.Value.Tags.Should().Contain("tag3");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdatePost()
    {
        // Arrange
        var title = PostTitle.Create("Original Title").Value;
        var content = PostContent.Create("Original content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        var newTitle = PostTitle.Create("Updated Title").Value;
        var newContent = PostContent.Create("Updated content with enough characters.").Value;

        // Act
        var result = post.Update(newTitle, newContent, _categoryId, new[] { "newtag" });

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.Title.Should().Be(newTitle);
        post.Content.Should().Be(newContent);
        post.CategoryId.Should().Be(_categoryId);
        post.Tags.Should().Contain("newtag");
        post.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Update_OnDeletedPost_ShouldReturnFailure()
    {
        // Arrange
        var title = PostTitle.Create("Original Title").Value;
        var content = PostContent.Create("Original content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Delete();

        var newTitle = PostTitle.Create("Updated Title").Value;
        var newContent = PostContent.Create("Updated content with enough characters.").Value;

        // Act
        var result = post.Update(newTitle, newContent, null, null);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Post.Deleted");
    }

    [Fact]
    public void Publish_OnDraftPost_ShouldPublishPost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        var result = post.Publish();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.Status.Should().Be(PostStatus.Published);
        post.PublishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Publish_OnAlreadyPublishedPost_ShouldReturnFailure()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Publish();

        // Act
        var result = post.Publish();

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Post.AlreadyPublished");
    }

    [Fact]
    public void Archive_OnPublishedPost_ShouldArchivePost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Publish();

        // Act
        var result = post.Archive();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.Status.Should().Be(PostStatus.Archived);
    }

    [Fact]
    public void Delete_OnExistingPost_ShouldDeletePost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        var result = post.Delete();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.Status.Should().Be(PostStatus.Deleted);
    }

    [Fact]
    public void Pin_OnUnpinnedPost_ShouldPinPost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        var result = post.Pin();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.IsPinned.Should().BeTrue();
    }

    [Fact]
    public void Pin_OnAlreadyPinnedPost_ShouldReturnFailure()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Pin();

        // Act
        var result = post.Pin();

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Post.AlreadyPinned");
    }

    [Fact]
    public void Unpin_OnPinnedPost_ShouldUnpinPost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Pin();

        // Act
        var result = post.Unpin();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.IsPinned.Should().BeFalse();
    }

    [Fact]
    public void Lock_OnUnlockedPost_ShouldLockPost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        var result = post.Lock();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.IsLocked.Should().BeTrue();
    }

    [Fact]
    public void Unlock_OnLockedPost_ShouldUnlockPost()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.Lock();

        // Act
        var result = post.Unlock();

        // Assert
        result.IsSuccess.Should().BeTrue();
        post.IsLocked.Should().BeFalse();
    }

    [Fact]
    public void IncrementViewCount_ShouldIncreaseViewCount()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        post.IncrementViewCount();
        post.IncrementViewCount();

        // Assert
        post.ViewCount.Should().Be(2);
    }

    [Fact]
    public void IncrementVoteScore_ShouldIncreaseVoteScore()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        post.IncrementVoteScore();

        // Assert
        post.VoteScore.Should().Be(1);
    }

    [Fact]
    public void DecrementVoteScore_ShouldDecreaseVoteScore()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        post.DecrementVoteScore();

        // Assert
        post.VoteScore.Should().Be(-1);
    }

    [Fact]
    public void IncrementCommentCount_ShouldIncreaseCommentCount()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        post.IncrementCommentCount();

        // Assert
        post.CommentCount.Should().Be(1);
    }

    [Fact]
    public void DecrementCommentCount_ShouldDecreaseCommentCount()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;
        post.IncrementCommentCount();

        // Act
        post.DecrementCommentCount();

        // Assert
        post.CommentCount.Should().Be(0);
    }

    [Fact]
    public void DecrementCommentCount_WhenZero_ShouldStayAtZero()
    {
        // Arrange
        var title = PostTitle.Create("Valid Title").Value;
        var content = PostContent.Create("Valid content with enough characters.").Value;
        var post = Post.Create(title, content, PostType.Discussion, _authorId).Value;

        // Act
        post.DecrementCommentCount();

        // Assert
        post.CommentCount.Should().Be(0);
    }
}
