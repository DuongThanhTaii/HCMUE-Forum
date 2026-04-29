# AI API for Frontend (`ApiResponse` Envelope)

## Base URL
- `/api/v1/ai`

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
  "error": "Human readable message"
}
```

## Chat

### `POST /api/v1/ai/chat`
- **200**: `ApiResponse<ChatResponse>`
- **400**: failure envelope (`Message is required`, validation errors)

### `GET /api/v1/ai/conversations?userId=`
- **Query**: `userId` (required, GUID)
- **200**: `ApiResponse<IReadOnlyList<Conversation>>`
- **400**: failure envelope (missing/invalid userId)

### `GET /api/v1/ai/conversations/{id}`
- **200**: `ApiResponse<Conversation>`
- **404**: failure envelope

### `DELETE /api/v1/ai/conversations/{id}`
- **200**: `ApiResponse<null>` with message `Conversation deleted successfully`
- **404**: failure envelope

## Content Moderation

### `POST /api/v1/ai/moderate`
- **200**: `ApiResponse<ModerationResponse>`

### `GET /api/v1/ai/moderate/check?content=`
- **Query**: `content` (required)
- **200**: `ApiResponse<{ isSafe, riskScore, isBlocked, requiresReview }>`

## Smart Search

### `GET /api/v1/ai/search`
- **Query**: `q` (required), `type`, `category`, `page`, `pageSize`, `suggestions`
- **200**: `ApiResponse<SearchResponse>`

### `POST /api/v1/ai/search`
- **Body**: `SearchRequest`
- **200**: `ApiResponse<SearchResponse>`

### `GET /api/v1/ai/search/suggestions?q=&limit=`
- **Query**: `q` (required), `limit` (optional)
- **200**: `ApiResponse<{ query, suggestions }>`

### `GET /api/v1/ai/search/understand?q=`
- **Query**: `q` (required)
- **200**: `ApiResponse<QueryUnderstanding>`

## Summarization

### `POST /api/v1/ai/summarize`
- **200**: `ApiResponse<SummarizationResponse>`

### `POST /api/v1/ai/summarize/keypoints`
- **Body**: `{ content, maxPoints }`
- **200**: `ApiResponse<{ keyPoints }>`

### `GET /api/v1/ai/summarize/detect-language?content=`
- **Query**: `content` (required)
- **200**: `ApiResponse<{ language }>`

### `DELETE /api/v1/ai/summarize/cache?cacheKey=`
- **Query**: `cacheKey` (optional)
- **200**: `ApiResponse<null>` with message `Cache cleared successfully`
