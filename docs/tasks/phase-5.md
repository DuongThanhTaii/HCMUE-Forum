# 📚 PHASE 5: LEARNING RESOURCES MODULE

> **Document Management với Approval Workflow (Event Sourcing)**

---

## 📋 PHASE INFO

| Property          | Value                     |
| ----------------- | ------------------------- |
| **Phase**         | 5                         |
| **Name**          | Learning Resources Module |
| **Status**        | 🟡 IN_PROGRESS            |
| **Progress**      | 2/12 tasks (16.7%)        |
| **Est. Duration** | 2 weeks                   |
| **Dependencies**  | Phase 3                   |

---

## 🎯 OBJECTIVES

- [x] Implement Document aggregate với Event Sourcing cho approval
- [x] Implement Course aggregate với moderator management
- [ ] Implement Faculty management
- [ ] Implement Approval workflow
- [ ] Implement Rating/Review system

---

## 📝 TASKS

### TASK-050: Design Document Aggregate

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **ID**           | TASK-050                              |
| **Status**       | ✅ COMPLETED                          |
| **Priority**     | 🔴 Critical                           |
| **Estimate**     | 4 hours                               |
| **Actual**       | 4 hours                               |
| **Branch**       | `feature/TASK-050-document-aggregate` |
| **Dependencies** | Phase 3                               |
| **Completed**    | 2026-02-06                            |

**Description:**
Implement Document aggregate với Event Sourcing cho approval history.

**Acceptance Criteria:**

- [x] `Document` aggregate root (398 lines)
- [x] `DocumentFile` value object (max 50MB, file validation)
- [x] `DocumentType` enum (Slide, Exam, Summary, SourceCode, Video, Other)
- [x] `DocumentStatus` enum (Draft, PendingApproval, Approved, Rejected, Deleted)
- [x] Event Sourcing cho approval history (6 domain events)
- [x] Unit tests written (136 tests, 100% pass)

**Implementation Notes:**

- Complete approval workflow: Draft → PendingApproval → Approved/Rejected
- Event Sourcing with 6 domain events for full audit trail
- Rating system (1-5 stars), view count, download count
- Value objects: DocumentTitle (5-200 chars), DocumentDescription (0-1000 chars)
- Test coverage: DocumentTests (78), DocumentFileTests (36), DocumentTitleTests (10), DocumentDescriptionTests (7), DocumentIdTests (5)

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
| **Status**       | ✅ COMPLETED                     |
| **Priority**     | 🔴 Critical                      |
| **Estimate**     | 3 hours                          |
| **Actual**       | 3 hours                          |
| **Branch**       | `feature/TASK-051-course-entity` |
| **Dependencies** | TASK-050                         |
| **Completed**    | 2026-02-06                       |

**Description:**
Implement Course aggregate với moderator management và Event Sourcing.

**Acceptance Criteria:**

- [x] `Course` aggregate root (406 lines)
- [x] Course code validation (CS101, MATH201 format)
- [x] Moderator assignment/removal per course
- [x] Semester info with helper methods
- [x] Status management (Active, Completed, Archived, Deleted)
- [x] Event Sourcing (7 domain events)
- [x] Unit tests written (106 tests, 100% pass)

**Implementation Notes:**

- Course aggregate with moderator list management (assign/remove)
- Value objects: CourseCode (regex validation), CourseName (3-200 chars), CourseDescription (0-2000 chars), Semester (format helper)
- Status transitions: Active ↔ Archived, Active → Completed, any → Deleted
- Credits validation: 1-10 range
- Document/Enrollment counters
- Faculty association (optional)
- Test coverage: CourseTests (76), CourseIdTests (5), CourseCodeTests (11), CourseNameTests (9), CourseDescriptionTests (7), SemesterTests (12)

**Domain Events:**

```csharp
CourseCreatedEvent          // Course được tạo
ModeratorAssignedEvent      // Moderator được assign
ModeratorRemovedEvent       // Moderator được remove
CourseUpdatedEvent          // Course info được update
CourseArchivedEvent         // Course được archive
CourseActivatedEvent        // Course được reactivate
CourseDeletedEvent          // Course bị xóa (soft delete)
```

**Commit Message:**

```
feat(learning): implement Course aggregate with Event Sourcing

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

- [x] TASK-050: Design Document Aggregate ✅ (2026-02-06)
- [x] TASK-051: Design Course Entity ✅ (2026-02-06)
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

## 📊 PHASE 5 STATISTICS

**Test Coverage:**

- Total Tests: 242
- Passing: 242 (100%)
- Failing: 0
- Skipped: 0

**Module Breakdown:**

- Document Domain: 136 tests ✅
- Course Domain: 106 tests ✅
- Faculty Domain: 0 tests (pending)

**Code Statistics:**

- Domain Classes: 8 (Document, Course + IDs + Status enums)
- Value Objects: 7 (DocumentTitle, DocumentDescription, DocumentFile, CourseCode, CourseName, CourseDescription, Semester)
- Domain Events: 13 (6 for Document + 7 for Course)
- Test Classes: 11
- Lines of Code: ~4,750 (domain + tests)

---

_Last Updated: 2026-02-06_
