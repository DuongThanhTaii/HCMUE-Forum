using UniHub.Chat.Domain.Conversations;
using UniHub.Chat.Domain.Messages.Events;
using UniHub.SharedKernel.Domain;
using UniHub.SharedKernel.Results;

namespace UniHub.Chat.Domain.Messages;

/// <summary>
/// Message entity - đại diện cho một tin nhắn trong conversation
/// </summary>
public sealed class Message : Entity<MessageId>
{
    private readonly List<Attachment> _attachments = new();
    private readonly List<Reaction> _reactions = new();
    private readonly List<ReadReceipt> _readReceipts = new();

    /// <summary>
    /// Conversation ID mà message này thuộc về
    /// </summary>
    public ConversationId ConversationId { get; private set; }

    /// <summary>
    /// User ID của người gửi message
    /// </summary>
    public Guid SenderId { get; private set; }

    /// <summary>
    /// Nội dung text của message
    /// </summary>
    public string Content { get; private set; }

    /// <summary>
    /// Loại message (Text, File, Image, Video, System)
    /// </summary>
    public MessageType Type { get; private set; }

    /// <summary>
    /// Thời gian gửi message
    /// </summary>
    public DateTime SentAt { get; private set; }

    /// <summary>
    /// Thời gian edit message (null nếu chưa edit)
    /// </summary>
    public DateTime? EditedAt { get; private set; }

    /// <summary>
    /// Message có bị xóa không (soft delete)
    /// </summary>
    public bool IsDeleted { get; private set; }

    /// <summary>
    /// Thời gian xóa message
    /// </summary>
    public DateTime? DeletedAt { get; private set; }

    /// <summary>
    /// Message ID của message được reply (nullable, for threading)
    /// </summary>
    public MessageId? ReplyToMessageId { get; private set; }

    /// <summary>
    /// Danh sách attachments (files, images, videos)
    /// </summary>
    public IReadOnlyList<Attachment> Attachments => _attachments.AsReadOnly();

    /// <summary>
    /// Danh sách reactions (emojis)
    /// </summary>
    public IReadOnlyList<Reaction> Reactions => _reactions.AsReadOnly();

    /// <summary>
    /// Danh sách read receipts (who read this message)
    /// </summary>
    public IReadOnlyList<ReadReceipt> ReadReceipts => _readReceipts.AsReadOnly();

    private Message() { } // EF Core

    private Message(
        MessageId id,
        ConversationId conversationId,
        Guid senderId,
        string content,
        MessageType type,
        MessageId? replyToMessageId,
        List<Attachment> attachments,
        DateTime sentAt)
    {
        Id = id;
        ConversationId = conversationId;
        SenderId = senderId;
        Content = content;
        Type = type;
        ReplyToMessageId = replyToMessageId;
        _attachments = attachments;
        SentAt = sentAt;
        IsDeleted = false;
    }

    /// <summary>
    /// Tạo text message
    /// </summary>
    public static Result<Message> CreateText(
        ConversationId conversationId,
        Guid senderId,
        string content,
        MessageId? replyToMessageId = null)
    {
        // Validate conversation ID
        if (conversationId == null)
        {
            return Result.Failure<Message>(new Error("Message.InvalidConversation", "Conversation ID cannot be null"));
        }

        // Validate sender
        if (senderId == Guid.Empty)
        {
            return Result.Failure<Message>(new Error("Message.InvalidSender", "Sender ID cannot be empty"));
        }

        // Validate content
        if (string.IsNullOrWhiteSpace(content))
        {
            return Result.Failure<Message>(new Error("Message.EmptyContent", "Message content cannot be empty"));
        }

        if (content.Length > 5000)
        {
            return Result.Failure<Message>(new Error("Message.ContentTooLong", "Message content cannot exceed 5000 characters"));
        }

        var messageId = MessageId.CreateUnique();
        var sentAt = DateTime.UtcNow;

        var message = new Message(
            messageId,
            conversationId,
            senderId,
            content.Trim(),
            MessageType.Text,
            replyToMessageId,
            new List<Attachment>(),
            sentAt);

        // Raise domain event
        message.AddDomainEvent(new MessageSentEvent(
            messageId.Value,
            conversationId.Value,
            senderId,
            MessageType.Text,
            content.Trim(),
            sentAt));

        return Result.Success(message);
    }

    /// <summary>
    /// Tạo message với attachments (File, Image, Video)
    /// </summary>
    public static Result<Message> CreateWithAttachments(
        ConversationId conversationId,
        Guid senderId,
        string content,
        MessageType type,
        List<Attachment> attachments,
        MessageId? replyToMessageId = null)
    {
        // Validate conversation ID
        if (conversationId == null)
        {
            return Result.Failure<Message>(new Error("Message.InvalidConversation", "Conversation ID cannot be null"));
        }

        // Validate sender
        if (senderId == Guid.Empty)
        {
            return Result.Failure<Message>(new Error("Message.InvalidSender", "Sender ID cannot be empty"));
        }

        // Validate type (must be File, Image, or Video)
        if (type == MessageType.Text || type == MessageType.System)
        {
            return Result.Failure<Message>(new Error("Message.InvalidType", "Use CreateText for text messages or CreateSystem for system messages"));
        }

        // Validate attachments
        if (attachments == null || attachments.Count == 0)
        {
            return Result.Failure<Message>(new Error("Message.MissingAttachments", "Messages with attachments must have at least one attachment"));
        }

        if (attachments.Count > 10)
        {
            return Result.Failure<Message>(new Error("Message.TooManyAttachments", "Cannot attach more than 10 files"));
        }

        // Content is optional for attachment messages
        var messageContent = string.IsNullOrWhiteSpace(content) ? string.Empty : content.Trim();

        if (messageContent.Length > 5000)
        {
            return Result.Failure<Message>(new Error("Message.ContentTooLong", "Message content cannot exceed 5000 characters"));
        }

        var messageId = MessageId.CreateUnique();
        var sentAt = DateTime.UtcNow;

        var message = new Message(
            messageId,
            conversationId,
            senderId,
            messageContent,
            type,
            replyToMessageId,
            new List<Attachment>(attachments),
            sentAt);

        // Raise domain event
        message.AddDomainEvent(new MessageSentEvent(
            messageId.Value,
            conversationId.Value,
            senderId,
            type,
            messageContent,
            sentAt));

        return Result.Success(message);
    }

    /// <summary>
    /// Tạo system message (user joined, user left, etc.)
    /// </summary>
    public static Result<Message> CreateSystem(
        ConversationId conversationId,
        string content)
    {
        // Validate conversation ID
        if (conversationId == null)
        {
            return Result.Failure<Message>(new Error("Message.InvalidConversation", "Conversation ID cannot be null"));
        }

        // Validate content
        if (string.IsNullOrWhiteSpace(content))
        {
            return Result.Failure<Message>(new Error("Message.EmptyContent", "System message content cannot be empty"));
        }

        var messageId = MessageId.CreateUnique();
        var sentAt = DateTime.UtcNow;

        var message = new Message(
            messageId,
            conversationId,
            Guid.Empty, // System messages have no sender
            content.Trim(),
            MessageType.System,
            null,
            new List<Attachment>(),
            sentAt);

        // Raise domain event
        message.AddDomainEvent(new MessageSentEvent(
            messageId.Value,
            conversationId.Value,
            Guid.Empty,
            MessageType.System,
            content.Trim(),
            sentAt));

        return Result.Success(message);
    }

    /// <summary>
    /// Edit message content (chỉ sender mới được edit, không edit được system message)
    /// </summary>
    public Result Edit(string newContent, Guid editorId)
    {
        // System messages cannot be edited
        if (Type == MessageType.System)
        {
            return Result.Failure(new Error("Message.CannotEditSystem", "System messages cannot be edited"));
        }

        // Only sender can edit
        if (editorId != SenderId)
        {
            return Result.Failure(new Error("Message.NotSender", "Only the sender can edit this message"));
        }

        // Cannot edit deleted message
        if (IsDeleted)
        {
            return Result.Failure(new Error("Message.AlreadyDeleted", "Cannot edit deleted message"));
        }

        // Validate new content
        if (string.IsNullOrWhiteSpace(newContent))
        {
            return Result.Failure(new Error("Message.EmptyContent", "Message content cannot be empty"));
        }

        if (newContent.Length > 5000)
        {
            return Result.Failure(new Error("Message.ContentTooLong", "Message content cannot exceed 5000 characters"));
        }

        Content = newContent.Trim();
        EditedAt = DateTime.UtcNow;

        // Raise domain event
        AddDomainEvent(new MessageEditedEvent(
            Id.Value,
            ConversationId.Value,
            Content,
            EditedAt.Value));

        return Result.Success();
    }

    /// <summary>
    /// Delete message (soft delete, chỉ sender mới được xóa)
    /// </summary>
    public Result Delete(Guid deleterId)
    {
        // System messages cannot be deleted
        if (Type == MessageType.System)
        {
            return Result.Failure(new Error("Message.CannotDeleteSystem", "System messages cannot be deleted"));
        }

        // Only sender can delete
        if (deleterId != SenderId)
        {
            return Result.Failure(new Error("Message.NotSender", "Only the sender can delete this message"));
        }

        // Already deleted
        if (IsDeleted)
        {
            return Result.Failure(new Error("Message.AlreadyDeleted", "Message is already deleted"));
        }

        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;

        // Raise domain event
        AddDomainEvent(new MessageDeletedEvent(
            Id.Value,
            ConversationId.Value,
            deleterId,
            DeletedAt.Value));

        return Result.Success();
    }

    /// <summary>
    /// Thêm reaction (emoji) vào message
    /// </summary>
    public Result AddReaction(Guid userId, string emoji)
    {
        if (userId == Guid.Empty)
        {
            return Result.Failure(new Error("Message.InvalidUser", "User ID cannot be empty"));
        }

        // Cannot react to deleted message
        if (IsDeleted)
        {
            return Result.Failure(new Error("Message.MessageDeleted", "Cannot react to deleted message"));
        }

        // Check if user already reacted with this emoji
        if (_reactions.Any(r => r.UserId == userId && r.Emoji == emoji))
        {
            return Result.Failure(new Error("Message.AlreadyReacted", "User has already reacted with this emoji"));
        }

        var reactionResult = Reaction.Create(userId, emoji);
        if (reactionResult.IsFailure)
        {
            return Result.Failure(reactionResult.Error);
        }

        _reactions.Add(reactionResult.Value);

        // Raise domain event
        AddDomainEvent(new MessageReactionAddedEvent(
            Id.Value,
            ConversationId.Value,
            userId,
            emoji,
            DateTime.UtcNow));

        return Result.Success();
    }

    /// <summary>
    /// Remove reaction khỏi message
    /// </summary>
    public Result RemoveReaction(Guid userId, string emoji)
    {
        if (userId == Guid.Empty)
        {
            return Result.Failure(new Error("Message.InvalidUser", "User ID cannot be empty"));
        }

        // Find reaction
        var reaction = _reactions.FirstOrDefault(r => r.UserId == userId && r.Emoji == emoji);
        if (reaction == null)
        {
            return Result.Failure(new Error("Message.ReactionNotFound", "Reaction not found"));
        }

        _reactions.Remove(reaction);

        // Raise domain event
        AddDomainEvent(new MessageReactionRemovedEvent(
            Id.Value,
            ConversationId.Value,
            userId,
            emoji,
            DateTime.UtcNow));

        return Result.Success();
    }

    /// <summary>
    /// Mark message as read by a user
    /// </summary>
    public Result MarkAsRead(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            return Result.Failure(new Error("Message.InvalidUserId", "User ID cannot be empty"));
        }

        // Check if user already read this message
        if (_readReceipts.Any(r => r.UserId == userId))
        {
            return Result.Success(); // Already read, idempotent
        }

        // Create read receipt
        var readReceiptResult = ReadReceipt.Create(userId);
        if (readReceiptResult.IsFailure)
        {
            return Result.Failure(readReceiptResult.Error);
        }

        _readReceipts.Add(readReceiptResult.Value);

        // Raise domain event
        AddDomainEvent(new MessageReadDomainEvent(
            Id,
            userId,
            DateTime.UtcNow));

        return Result.Success();
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        // Messages are entities, not aggregate roots
        // Events should be dispatched via parent aggregate (Conversation)
        // For now, we'll store them here but in practice they'd be
        // raised through the Conversation aggregate
    }
}
