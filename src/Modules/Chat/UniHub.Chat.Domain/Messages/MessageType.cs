namespace UniHub.Chat.Domain.Messages;

/// <summary>
/// Loại message trong conversation
/// </summary>
public enum MessageType
{
    /// <summary>
    /// Text message thông thường
    /// </summary>
    Text = 0,
    
    /// <summary>
    /// File attachment (documents, etc.)
    /// </summary>
    File = 1,
    
    /// <summary>
    /// Image attachment
    /// </summary>
    Image = 2,
    
    /// <summary>
    /// Video attachment
    /// </summary>
    Video = 3,
    
    /// <summary>
    /// System message (user joined, user left, etc.)
    /// </summary>
    System = 4
}
