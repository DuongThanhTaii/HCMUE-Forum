# Notification API for Frontend (`ApiResponse` Envelope)

## Base URL
- `/api/v1/notifications`

## Auth
- Required (JWT Bearer) for all endpoints.

## Response Envelope (applies to all endpoints)
```json
{
  "success": true,
  "data": {},
  "message": "optional success message",
  "error": null
}
```

Error example:
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": "Notification not found"
}
```

## Endpoints

### `GET /api/v1/notifications`
- **Auth**: required
- **Query**: `pageNumber`, `pageSize`
- **200**: `ApiResponse<GetNotificationsResponse>`
- **400**: failure envelope
- **401**: failure envelope (`Invalid user token`)

### `GET /api/v1/notifications/unread-count`
- **Auth**: required
- **200**: `ApiResponse<{ count: number }>`
- **401**: failure envelope

### `POST /api/v1/notifications/{id}/read`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Notification marked as read`
- **404**: failure envelope (`Notification.NotFound`)
- **403**: failure envelope (`Notification.Forbidden`)

### `POST /api/v1/notifications/read-all`
- **Auth**: required
- **200**: `ApiResponse<{ count: number }>` with message `Notifications marked as read`

### `DELETE /api/v1/notifications/{id}`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Notification deleted successfully`
- **404**: failure envelope (`Notification.NotFound`)
- **403**: failure envelope (`Notification.Forbidden`)

### `GET /api/v1/notifications/preferences`
- **Auth**: required
- **200**: `ApiResponse<NotificationPreferencesDto>`

### `PUT /api/v1/notifications/preferences`
- **Auth**: required
- **Body**: `UpdateNotificationPreferencesRequest`
- **200**: `ApiResponse<null>` with message `Notification preferences updated successfully`

## Schemas

### `GetNotificationsResponse`
- `notifications` (NotificationDto[])
- `totalCount` (int)
- `pageNumber` (int)
- `pageSize` (int)
- `totalPages` (int)

### `NotificationDto`
- `id` (guid)
- `subject` (string)
- `body` (string)
- `actionUrl` (string | null)
- `iconUrl` (string | null)
- `status` (string)
- `channel` (string)
- `createdAt` (datetime)
- `readAt` (datetime | null)
- `isRead` (boolean)

### `NotificationPreferencesDto`
- `userId` (guid)
- `emailEnabled` (boolean)
- `pushEnabled` (boolean)
- `inAppEnabled` (boolean)
- `createdAt` (datetime)
- `updatedAt` (datetime | null)

### `UpdateNotificationPreferencesRequest`
- `emailEnabled` (boolean)
- `pushEnabled` (boolean)
- `inAppEnabled` (boolean)
