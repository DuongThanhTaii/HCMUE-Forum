# 💬 PHASE 4: FORUM MODULE

> **Posts, Comments, Categories, Voting system**

---

## 📋 PHASE INFO

| Property          | Value          |
| ----------------- | -------------- |
| **Phase**         | 4              |
| **Name**          | Forum Module   |
| **Status**        | 🔵 IN_PROGRESS |
| **Progress**      | 9/12 tasks     |
| **Est. Duration** | 2 weeks        |
| **Dependencies**  | Phase 3        |

---

## 🎯 OBJECTIVES

- [ ] Implement Post aggregate với comments và votes
- [ ] Implement Category management
- [ ] Implement Tagging system
- [ ] Implement Search functionality
- [ ] Implement Content moderation

---

## 📝 TASKS

### TASK-038: Design Post Aggregate

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-038                          |
| **Status**       | ✅ DONE                           |
| **Priority**     | 🔴 Critical                       |
| **Estimate**     | 4 hours                           |
| **Branch**       | `feature/TASK-038-post-aggregate` |
| **Dependencies** | Phase 3                           |

**Description:**
Implement Post aggregate root với value objects.

**Acceptance Criteria:**

- [x] `Post` aggregate root implemented
- [x] `PostId` strongly-typed ID
- [x] `PostStatus` enum
- [x] `PostType` enum
- [x] Value objects: Title, Content, Slug
- [x] Domain events defined
- [x] Unit tests written (56 tests passed)

**Commit Message:**

```
feat(forum): implement Post aggregate

Refs: TASK-038
```

---

### TASK-039: Design Comment Entity

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-039                          |
| **Status**       | ✅ DONE                           |
| **Priority**     | 🔴 Critical                       |
| **Estimate**     | 3 hours                           |
| **Branch**       | `feature/TASK-039-comment-entity` |
| **Dependencies** | TASK-038                          |

**Acceptance Criteria:**

- [x] `Comment` entity implemented
- [x] Nested comments support (ParentCommentId)
- [x] `IsAcceptedAnswer` for Q&A type
- [x] Comment votes (IncrementVoteScore/DecrementVoteScore)
- [x] Unit tests written (29 tests passed)

**Commit Message:**

```
feat(forum): implement Comment entity

Refs: TASK-039
```

---

### TASK-040: Design Category Aggregate

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **ID**           | TASK-040                              |
| **Status**       | ✅ DONE                               |
| **Priority**     | 🔴 Critical                           |
| **Estimate**     | 2 hours                               |
| **Branch**       | `feature/TASK-040-category-aggregate` |
| **Dependencies** | TASK-038                              |

**Acceptance Criteria:**

- [x] `Category` aggregate root
- [x] Hierarchical categories (ParentCategoryId)
- [x] Slug generation (reuses Slug value object)
- [x] Moderator assignment (AssignModerator/RemoveModerator)
- [x] Unit tests written (39 tests passed)

**Commit Message:**

```
feat(forum): implement Category aggregate

Refs: TASK-040
```

---

### TASK-041: Design Vote Value Object

| Property         | Value                          |
| ---------------- | ------------------------------ |
| **ID**           | TASK-041                       |
| **Status**       | ✅ DONE                        |
| **Priority**     | 🟡 Medium                      |
| **Estimate**     | 2 hours                        |
| **Branch**       | `feature/TASK-041-vote-system` |
| **Dependencies** | TASK-038                       |

**Acceptance Criteria:**

- [x] `Vote` value object
- [x] `VoteType` enum (Upvote, Downvote)
- [x] One vote per user per post
- [x] Vote score calculation
- [x] Unit tests written (21 vote tests + 30 voting integration tests = 51 new tests, 162 total)

**Commit Message:**

```
feat(forum): implement voting system

Refs: TASK-041
```

---

### TASK-042: Implement Post CRUD Commands

| Property         | Value                        |
| ---------------- | ---------------------------- |
| **ID**           | TASK-042                     |
| **Status**       | ✅ DONE                      |
| **Priority**     | 🔴 Critical                  |
| **Estimate**     | 4 hours                      |
| **Branch**       | `feature/TASK-042-post-crud` |
| **Dependencies** | TASK-038, TASK-040           |

**Acceptance Criteria:**

- [x] CreatePostCommand
- [x] UpdatePostCommand
- [x] DeletePostCommand
- [x] PublishPostCommand
- [x] PinPostCommand
- [x] Unit tests written (25 tests passed)

**Commit Message:**

```
feat(forum): implement Post CRUD commands

Refs: TASK-042
```

---

### TASK-043: Implement Comment Commands

| Property         | Value                               |
| ---------------- | ----------------------------------- |
| **ID**           | TASK-043                            |
| **Status**       | ✅ DONE                             |
| **Priority**     | 🔴 Critical                         |
| **Estimate**     | 3 hours                             |
| **Branch**       | `feature/TASK-043-comment-commands` |
| **Dependencies** | TASK-039                            |

**Acceptance Criteria:**

- [x] AddCommentCommand
- [x] UpdateCommentCommand
- [x] DeleteCommentCommand
- [x] AcceptAnswerCommand (for Q&A)
- [x] Unit tests written (24 tests passed)

**Commit Message:**

```
feat(forum): implement Comment commands

Refs: TASK-043
```

---

### TASK-044: Implement Voting Commands

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-044                           |
| **Status**       | ✅ DONE                            |
| **Priority**     | 🟡 Medium                          |
| **Estimate**     | 2 hours                            |
| **Branch**       | `feature/TASK-044-voting-commands` |
| **Dependencies** | TASK-041                           |

**Acceptance Criteria:**

- [x] VotePostCommand
- [x] VoteCommentCommand
- [x] Remove vote on re-vote same type
- [x] Unit tests written (14 tests passed)

**Commit Message:**

```
feat(forum): implement voting commands

Refs: TASK-044
```

---

### TASK-045: Implement Full-Text Search

| Property         | Value                     |
| ---------------- | ------------------------- |
| **ID**           | TASK-045                  |
| **Status**       | ✅ DONE                   |
| **Priority**     | 🟡 Medium                 |
| **Estimate**     | 4 hours                   |
| **Branch**       | `feature/TASK-045-search` |
| **Dependencies** | TASK-042                  |

**Acceptance Criteria:**

- [x] PostgreSQL full-text search setup (repository contract defined)
- [x] SearchPostsQuery
- [x] Search by title, content, tags
- [x] Ranking results (SearchRank property)
- [x] Unit tests written (13 tests passed)

**Commit Message:**

```
feat(forum): implement full-text search

Refs: TASK-045
```

---

### TASK-046: Implement Tagging System

| Property         | Value                      |
| ---------------- | -------------------------- |
| **ID**           | TASK-046                   |
| **Status**       | ✅ DONE                    |
| **Priority**     | 🟡 Medium                  |
| **Estimate**     | 3 hours                    |
| **Branch**       | `feature/TASK-046-tagging` |
| **Dependencies** | TASK-038                   |

**Acceptance Criteria:**

- [x] `Tag` entity
- [x] Post-Tag relationship (PostTag join entity)
- [x] Tag CRUD commands (Create, Update, Delete)
- [x] Tag queries (GetTags with search/pagination, GetPopularTags)
- [x] Unit tests written (25 domain + 36 application = 61 tests passed)

**Commit Message:**

```
feat(forum): implement tagging system

Refs: TASK-046
```

---

### TASK-047: Implement Bookmark Feature

| Property         | Value                        |
| ---------------- | ---------------------------- |
| **ID**           | TASK-047                     |
| **Status**       | ⬜ NOT_STARTED               |
| **Priority**     | 🟢 Low                       |
| **Estimate**     | 2 hours                      |
| **Branch**       | `feature/TASK-047-bookmarks` |
| **Dependencies** | TASK-038                     |

**Acceptance Criteria:**

- [ ] BookmarkPostCommand
- [ ] UnbookmarkPostCommand
- [ ] GetBookmarkedPostsQuery
- [ ] Unit tests written

**Commit Message:**

```
feat(forum): implement bookmark feature

Refs: TASK-047
```

---

### TASK-048: Implement Report System

| Property         | Value                      |
| ---------------- | -------------------------- |
| **ID**           | TASK-048                   |
| **Status**       | ⬜ NOT_STARTED             |
| **Priority**     | 🟡 Medium                  |
| **Estimate**     | 3 hours                    |
| **Branch**       | `feature/TASK-048-reports` |
| **Dependencies** | TASK-038                   |

**Acceptance Criteria:**

- [ ] `Report` entity
- [ ] ReportPostCommand
- [ ] ReportCommentCommand
- [ ] GetReportsQuery (for moderators)
- [ ] Unit tests written

**Commit Message:**

```
feat(forum): implement report system

Refs: TASK-048
```

---

### TASK-049: Forum API Endpoints

| Property         | Value                        |
| ---------------- | ---------------------------- |
| **ID**           | TASK-049                     |
| **Status**       | ⬜ NOT_STARTED               |
| **Priority**     | 🔴 Critical                  |
| **Estimate**     | 4 hours                      |
| **Branch**       | `feature/TASK-049-forum-api` |
| **Dependencies** | All previous Forum tasks     |

**Acceptance Criteria:**

- [ ] PostsController
- [ ] CategoriesController
- [ ] CommentsController
- [ ] VotesController
- [ ] Request/Response DTOs
- [ ] Integration tests written

**API Endpoints:**

```
GET    /api/v1/posts
GET    /api/v1/posts/{id}
POST   /api/v1/posts
PUT    /api/v1/posts/{id}
DELETE /api/v1/posts/{id}
POST   /api/v1/posts/{id}/publish
POST   /api/v1/posts/{id}/vote
GET    /api/v1/posts/{id}/comments
POST   /api/v1/posts/{id}/comments
POST   /api/v1/posts/{id}/bookmark
DELETE /api/v1/posts/{id}/bookmark
POST   /api/v1/posts/{id}/report

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/{id}
DELETE /api/v1/categories/{id}

PUT    /api/v1/comments/{id}
DELETE /api/v1/comments/{id}
POST   /api/v1/comments/{id}/vote
POST   /api/v1/comments/{id}/accept

GET    /api/v1/tags
GET    /api/v1/search?q=
```

**Commit Message:**

```
feat(forum): create API endpoints

Refs: TASK-049
```

---

## ✅ COMPLETION CHECKLIST

- [x] TASK-038: Design Post Aggregate
- [x] TASK-039: Design Comment Entity
- [x] TASK-040: Design Category Aggregate
- [x] TASK-041: Design Vote Value Object
- [x] TASK-042: Implement Post CRUD Commands
- [x] TASK-043: Implement Comment Commands
- [x] TASK-044: Implement Voting Commands
- [x] TASK-045: Implement Full-Text Search
- [x] TASK-046: Implement Tagging System
- [ ] TASK-047: Implement Bookmark Feature
- [ ] TASK-048: Implement Report System
- [ ] TASK-049: Forum API Endpoints

---

_Last Updated: 2026-02-05_
