# Learning API for Frontend (`ApiResponse` Envelope)

## Base URL
- `api/v1/courses`
- `api/v1/faculties`
- `api/v1/documents`

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
  "error": "Human readable message"
}
```

---

## Faculties

### `GET /api/v1/faculties`
- **Auth**: anonymous
- **200**: `ApiResponse<List<FacultyListItemResponse>>`

### `GET /api/v1/faculties/{id}`
- **Auth**: anonymous
- **200**: `ApiResponse<FacultyDetailResponse>`
- **404**: `ApiResponse<null>` (failure)

### `POST /api/v1/faculties`
- **Auth**: required
- **201**: `ApiResponse<CreateFacultyResponse>`
- **400**: `ApiResponse<null>` (failure)

---

## Courses

### `GET /api/v1/courses?facultyId=&semester=`
- **Auth**: anonymous
- **200**: `ApiResponse<List<CourseListItemResponse>>`

### `GET /api/v1/courses/{id}`
- **Auth**: anonymous
- **200**: `ApiResponse<CourseDetailResponse>`
- **404**: `ApiResponse<null>` (failure)

### `POST /api/v1/courses`
- **Auth**: required
- **201**: `ApiResponse<CreateCourseResponse>`

### `PUT /api/v1/courses/{id}`
- **Auth**: required
- **200**: `ApiResponse<null>` with success message `Course updated successfully`

### `DELETE /api/v1/courses/{id}`
- **Auth**: required
- **Body**: `DeleteCourseRequest` (requires `deletedBy`)
- **200**: `ApiResponse<null>` with success message `Course deleted successfully`

### `POST /api/v1/courses/{id}/moderators`
- **Auth**: required
- **Body**: `AssignModeratorRequest` (requires `moderatorId`, `assignedBy`)
- **200**: `ApiResponse<null>` with success message `Moderator assigned successfully`

### `DELETE /api/v1/courses/{id}/moderators/{moderatorId}`
- **Auth**: required
- **Body**: `RemoveModeratorRequest` (requires `removedBy`)
- **200**: `ApiResponse<null>` with success message `Moderator removed successfully`

---

## Documents

### `GET /api/v1/documents`
- **Auth**: anonymous
- **200**: `ApiResponse<SearchDocumentsResult>`

### `GET /api/v1/documents/{id}`
- **Auth**: anonymous
- **200**: `ApiResponse<DocumentDetailResponse>`
- **404**: `ApiResponse<null>` (failure)

### `POST /api/v1/documents/upload`
- **Auth**: required
- **Content-Type**: `multipart/form-data`
- **Body**: `UploadDocumentRequest` (file + metadata)
- **201**: `ApiResponse<UploadDocumentResponse>`

### `POST /api/v1/documents/{id}/rate`
- **Auth**: required
- **Body**: `RateDocumentRequest`
- **200**: `ApiResponse<null>` with success message `Document rated successfully`

### `POST /api/v1/documents/{id}/download`
- **Auth**: required
- **Body**: `DownloadDocumentRequest`
- **200**: `ApiResponse<null>` with success message `Document download tracked successfully`

### `POST /api/v1/documents/{id}/approve`
- **Auth**: required
- **Body**: `ApproveDocumentRequest`
- **200**: `ApiResponse<null>` with success message `Document approved successfully`

### `POST /api/v1/documents/{id}/reject`
- **Auth**: required
- **Body**: `RejectDocumentRequest`
- **200**: `ApiResponse<null>` with success message `Document rejected successfully`

### `POST /api/v1/documents/{id}/request-revision`
- **Auth**: required
- **Body**: `RequestRevisionRequest`
- **200**: `ApiResponse<null>` with success message `Revision requested successfully`
