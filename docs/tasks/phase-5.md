# 📚 PHASE 5: LEARNING RESOURCES MODULE

> **Document Management với Approval Workflow (Event Sourcing)**

---

## 📋 PHASE INFO

| Property          | Value                     |
| ----------------- | ------------------------- |
| **Phase**         | 5                         |
| **Name**          | Learning Resources Module |
| **Status**        | ⬜ NOT_STARTED            |
| **Progress**      | 0/12 tasks                |
| **Est. Duration** | 2 weeks                   |
| **Dependencies**  | Phase 3                   |

---

## 🎯 OBJECTIVES

- [ ] Implement Document aggregate với Event Sourcing cho approval
- [ ] Implement Course/Faculty management
- [ ] Implement Approval workflow
- [ ] Implement Moderator assignment per course
- [ ] Implement Rating/Review system

---

## 📝 TASKS

### TASK-050: Design Document Aggregate

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **ID**           | TASK-050                              |
| **Status**       | ⬜ NOT_STARTED                        |
| **Priority**     | 🔴 Critical                           |
| **Estimate**     | 4 hours                               |
| **Branch**       | `feature/TASK-050-document-aggregate` |
| **Dependencies** | Phase 3                               |

**Description:**
Implement Document aggregate với Event Sourcing cho approval history.

**Acceptance Criteria:**

- [ ] `Document` aggregate root
- [ ] `DocumentFile` value object
- [ ] `DocumentType` enum
- [ ] `DocumentStatus` enum
- [ ] Event Sourcing cho approval history
- [ ] Unit tests written

**Document Types:**

```csharp
public enum DocumentType
{
    Slide,      // Slide bài giảng
    Exam,       // Đề thi
    Summary,    // Tóm tắt
    SourceCode, // Code mẫu
    Video,      // Video bài giảng
    Other
}
```

**Commit Message:**

```
feat(learning): implement Document aggregate with Event Sourcing

Refs: TASK-050
```

---

### TASK-051: Design Course Entity

| Property         | Value                            |
| ---------------- | -------------------------------- |
| **ID**           | TASK-051                         |
| **Status**       | ⬜ NOT_STARTED                   |
| **Priority**     | 🔴 Critical                      |
| **Estimate**     | 3 hours                          |
| **Branch**       | `feature/TASK-051-course-entity` |
| **Dependencies** | TASK-050                         |

**Acceptance Criteria:**

- [ ] `Course` aggregate root
- [ ] Course code (CS101, etc.)
- [ ] Moderator list per course
- [ ] Semester info
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement Course aggregate

Refs: TASK-051
```

---

### TASK-052: Design Faculty Entity

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-052                          |
| **Status**       | ⬜ NOT_STARTED                    |
| **Priority**     | 🔴 Critical                       |
| **Estimate**     | 2 hours                           |
| **Branch**       | `feature/TASK-052-faculty-entity` |
| **Dependencies** | TASK-051                          |

**Acceptance Criteria:**

- [ ] `Faculty` aggregate root
- [ ] Faculty manager assignment
- [ ] Courses relationship
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement Faculty aggregate

Refs: TASK-052
```

---

### TASK-053: Implement Approval Events (Event Sourcing)

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-053                           |
| **Status**       | ⬜ NOT_STARTED                     |
| **Priority**     | 🔴 Critical                        |
| **Estimate**     | 5 hours                            |
| **Branch**       | `feature/TASK-053-approval-events` |
| **Dependencies** | TASK-050                           |

**Description:**
Implement Event Sourcing cho Document approval workflow.

**Acceptance Criteria:**

- [ ] `DocumentSubmittedEvent`
- [ ] `DocumentAIScannedEvent`
- [ ] `DocumentReviewStartedEvent`
- [ ] `DocumentApprovedEvent`
- [ ] `DocumentRejectedEvent`
- [ ] `DocumentRevisionRequestedEvent`
- [ ] Event store (MongoDB)
- [ ] State reconstruction from events
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement approval Event Sourcing

Refs: TASK-053
```

---

### TASK-054: Implement Document Upload

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-054                           |
| **Status**       | ⬜ NOT_STARTED                     |
| **Priority**     | 🔴 Critical                        |
| **Estimate**     | 4 hours                            |
| **Branch**       | `feature/TASK-054-document-upload` |
| **Dependencies** | TASK-050                           |

**Acceptance Criteria:**

- [ ] UploadDocumentCommand
- [ ] File storage (Cloudflare R2 hoặc local)
- [ ] File metadata in MongoDB
- [ ] File validation (size, type)
- [ ] Virus scan placeholder
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement document upload

Refs: TASK-054
```

---

### TASK-055: Implement Approval Workflow

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| **ID**           | TASK-055                             |
| **Status**       | ⬜ NOT_STARTED                       |
| **Priority**     | 🔴 Critical                          |
| **Estimate**     | 4 hours                              |
| **Branch**       | `feature/TASK-055-approval-workflow` |
| **Dependencies** | TASK-053                             |

**Acceptance Criteria:**

- [ ] StartReviewCommand
- [ ] ApproveDocumentCommand
- [ ] RejectDocumentCommand
- [ ] RequestRevisionCommand
- [ ] Check moderator permission
- [ ] Unit tests written

**Workflow:**

```
Submitted → AI Scanned → Under Review → Approved/Rejected/Revision Requested
                                              ↓
                                         Resubmitted → Under Review → ...
```

**Commit Message:**

```
feat(learning): implement approval workflow

Refs: TASK-055
```

---

### TASK-056: Implement Course Management

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| **ID**           | TASK-056                             |
| **Status**       | ⬜ NOT_STARTED                       |
| **Priority**     | 🟡 Medium                            |
| **Estimate**     | 3 hours                              |
| **Branch**       | `feature/TASK-056-course-management` |
| **Dependencies** | TASK-051                             |

**Acceptance Criteria:**

- [ ] CreateCourseCommand
- [ ] UpdateCourseCommand
- [ ] DeleteCourseCommand
- [ ] AssignModeratorCommand
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement course management

Refs: TASK-056
```

---

### TASK-057: Implement Moderator Assignment

| Property         | Value                                   |
| ---------------- | --------------------------------------- |
| **ID**           | TASK-057                                |
| **Status**       | ⬜ NOT_STARTED                          |
| **Priority**     | 🔴 Critical                             |
| **Estimate**     | 3 hours                                 |
| **Branch**       | `feature/TASK-057-moderator-assignment` |
| **Dependencies** | TASK-056                                |

**Acceptance Criteria:**

- [ ] AssignCourseModerator command
- [ ] RemoveCourseModerator command
- [ ] Check scoped permission (per course)
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement moderator assignment

Refs: TASK-057
```

---

### TASK-058: Implement Document Rating

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-058                           |
| **Status**       | ⬜ NOT_STARTED                     |
| **Priority**     | 🟡 Medium                          |
| **Estimate**     | 3 hours                            |
| **Branch**       | `feature/TASK-058-document-rating` |
| **Dependencies** | TASK-050                           |

**Acceptance Criteria:**

- [ ] RateDocumentCommand
- [ ] Average rating calculation
- [ ] One rating per user per document
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement document rating

Refs: TASK-058
```

---

### TASK-059: Implement Document Search

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-059                           |
| **Status**       | ⬜ NOT_STARTED                     |
| **Priority**     | 🟡 Medium                          |
| **Estimate**     | 3 hours                            |
| **Branch**       | `feature/TASK-059-document-search` |
| **Dependencies** | TASK-050                           |

**Acceptance Criteria:**

- [ ] SearchDocumentsQuery
- [ ] Filter by course, faculty, type
- [ ] Sort by rating, downloads, date
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement document search

Refs: TASK-059
```

---

### TASK-060: Implement Download Tracking

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| **ID**           | TASK-060                             |
| **Status**       | ⬜ NOT_STARTED                       |
| **Priority**     | 🟢 Low                               |
| **Estimate**     | 2 hours                              |
| **Branch**       | `feature/TASK-060-download-tracking` |
| **Dependencies** | TASK-054                             |

**Acceptance Criteria:**

- [ ] DownloadDocumentCommand
- [ ] Track download count
- [ ] Track downloads per user
- [ ] Unit tests written

**Commit Message:**

```
feat(learning): implement download tracking

Refs: TASK-060
```

---

### TASK-061: Learning API Endpoints

| Property         | Value                           |
| ---------------- | ------------------------------- |
| **ID**           | TASK-061                        |
| **Status**       | ⬜ NOT_STARTED                  |
| **Priority**     | 🔴 Critical                     |
| **Estimate**     | 4 hours                         |
| **Branch**       | `feature/TASK-061-learning-api` |
| **Dependencies** | All previous Learning tasks     |

**Acceptance Criteria:**

- [ ] DocumentsController
- [ ] CoursesController
- [ ] FacultiesController
- [ ] Request/Response DTOs
- [ ] Integration tests written

**API Endpoints:**

```
GET    /api/v1/documents
GET    /api/v1/documents/{id}
POST   /api/v1/documents/upload
GET    /api/v1/documents/{id}/download
POST   /api/v1/documents/{id}/rate
GET    /api/v1/documents/{id}/history  (approval history)
POST   /api/v1/documents/{id}/approve
POST   /api/v1/documents/{id}/reject
POST   /api/v1/documents/{id}/request-revision

GET    /api/v1/courses
POST   /api/v1/courses
PUT    /api/v1/courses/{id}
DELETE /api/v1/courses/{id}
POST   /api/v1/courses/{id}/moderators
DELETE /api/v1/courses/{id}/moderators/{userId}
GET    /api/v1/courses/{id}/documents

GET    /api/v1/faculties
POST   /api/v1/faculties
PUT    /api/v1/faculties/{id}
DELETE /api/v1/faculties/{id}
GET    /api/v1/faculties/{id}/courses
```

**Commit Message:**

```
feat(learning): create API endpoints

Refs: TASK-061
```

---

## ✅ COMPLETION CHECKLIST

- [ ] TASK-050: Design Document Aggregate
- [ ] TASK-051: Design Course Entity
- [ ] TASK-052: Design Faculty Entity
- [ ] TASK-053: Implement Approval Events (Event Sourcing)
- [ ] TASK-054: Implement Document Upload
- [ ] TASK-055: Implement Approval Workflow
- [ ] TASK-056: Implement Course Management
- [ ] TASK-057: Implement Moderator Assignment
- [ ] TASK-058: Implement Document Rating
- [ ] TASK-059: Implement Document Search
- [ ] TASK-060: Implement Download Tracking
- [ ] TASK-061: Learning API Endpoints

---

_Last Updated: 2026-02-04_
