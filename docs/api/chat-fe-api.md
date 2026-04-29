# Chat API for Frontend (`ApiResponse` Envelope)

## Base URL
- `api/v1/chat`

## Auth
- Required (JWT Bearer) for all endpoints.

## Envelope
```json
{
  "success": true,
  "data": {},
  "message": "optional success message",
  "error": null
}
```

Error sample:
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": "Conversation not found"
}
```

## Conversations

### `GET /api/v1/chat/conversations`
- **200**: `ApiResponse<IReadOnlyList<ConversationResponse>>`

### `POST /api/v1/chat/conversations/direct`
- **201**: `ApiResponse<CreateDirectConversationResponse>`

### `POST /api/v1/chat/conversations/group`
- **201**: `ApiResponse<CreateGroupConversationResponse>`

### `POST /api/v1/chat/conversations/{id}/participants`
- **200**: `ApiResponse<null>` with message `Participant added successfully`
- **404**: failure envelope (`Conversation.NotFound`)

### `DELETE /api/v1/chat/conversations/{id}/participants/{participantId}`
- **200**: `ApiResponse<null>` with message `Participant removed successfully`
- **404**: failure envelope (`Conversation.NotFound`)

## Messages

### `GET /api/v1/chat/messages?conversationId=&page=&pageSize=`
- **200**: `ApiResponse<PagedResponse<MessageResponse>>`
- **404**: failure envelope (`Conversation.NotFound`)

### `POST /api/v1/chat/messages`
- **201**: `ApiResponse<SendMessageResponse>`
- **403**: failure envelope (not participant)
- **404**: failure envelope (resource not found)

### `POST /api/v1/chat/messages/upload`
- **Content-Type**: `multipart/form-data` (field name: `file`)
- **200**: `ApiResponse<UploadFileResponse>`
- **400**: failure envelope (`No file provided`, validation errors)

### `POST /api/v1/chat/messages/with-attachments`
- **201**: `ApiResponse<SendMessageResponse>`
- **403**: failure envelope (not participant)
- **404**: failure envelope (resource not found)

### `POST /api/v1/chat/messages/{messageId}/reactions`
- **200**: `ApiResponse<null>` with message `Reaction added successfully`
- **404**: failure envelope (`Message.NotFound`)

### `DELETE /api/v1/chat/messages/{messageId}/reactions/{emoji}`
- **200**: `ApiResponse<null>` with message `Reaction removed successfully`
- **404**: failure envelope (`Message.NotFound`)

### `POST /api/v1/chat/messages/{messageId}/read`
- **200**: `ApiResponse<null>` with message `Message marked as read`
- **404**: failure envelope (`Message.NotFound`)

### `GET /api/v1/chat/messages/{messageId}/read-receipts`
- **200**: `ApiResponse<List<ReadReceiptResponse>>`
- **404**: failure envelope (`Message.NotFound`)

## Channels

### `GET /api/v1/chat/channels/public`
- **200**: `ApiResponse<IReadOnlyList<ChannelResponse>>`

### `GET /api/v1/chat/channels/my-channels`
- **200**: `ApiResponse<IReadOnlyList<ChannelResponse>>`

### `POST /api/v1/chat/channels`
- **201**: `ApiResponse<CreateChannelResponse>`

### `POST /api/v1/chat/channels/{id}/join`
- **200**: `ApiResponse<null>` with message `Successfully joined channel`
- **404**: failure envelope (`Channel.NotFound`)

### `POST /api/v1/chat/channels/{id}/leave`
- **200**: `ApiResponse<null>` with message `Successfully left channel`
- **404**: failure envelope (`Channel.NotFound`)

### `POST /api/v1/chat/channels/{id}/moderators`
- **200**: `ApiResponse<null>` with message `Moderator added successfully`
- **403**: failure envelope (not owner/authorized)
- **404**: failure envelope (`Channel.NotFound`)

### `DELETE /api/v1/chat/channels/{id}/moderators/{moderatorId}`
- **200**: `ApiResponse<null>` with message `Moderator removed successfully`
- **403**: failure envelope (not owner/authorized)
- **404**: failure envelope (`Channel.NotFound`)

### `PUT /api/v1/chat/channels/{id}`
- **200**: `ApiResponse<null>` with message `Channel updated successfully`
- **403**: failure envelope (not moderator/authorized)
- **404**: failure envelope (`Channel.NotFound`)
