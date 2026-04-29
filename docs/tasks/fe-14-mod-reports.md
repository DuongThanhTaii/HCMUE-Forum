# FE-14: Mod Zone — Reports Queue + Post Management

| Property | Value |
|---|---|
| **ID** | FE-14 |
| **Branch** | `feature/FE-14-mod-reports` |
| **Commit** | `feat(fe/mod): implement reports queue and post moderation` |
| **Priority** | Medium |
| **Estimate** | 6h |
| **Status** | ⬜ NOT_STARTED |
| **Depends on** | FE-04 |

---

## API Endpoints

| Action | Endpoint |
|---|---|
| Get reports | GET `/api/v1/forum/reports?status=Pending&page=` |
| Get all posts (mod view) | GET `/api/v1/forum/posts?includePinned=true&page=` |
| Pin post | POST `/api/v1/forum/posts/{id}/pin` |
| Unpin post | DELETE `/api/v1/forum/posts/{id}/pin` |
| Delete post (mod) | DELETE `/api/v1/forum/posts/{id}` |
| Delete comment (mod) | DELETE `/api/v1/forum/comments/{id}` |

Note: Report dismiss/action endpoint — cần confirm với BE (có thể dùng DeletePost/DeleteComment kèm lý do).

---

## Pages

### `/mod/reports` — Reports Queue

```
┌──────────────────────────────────────────────────────┐
│  Reports Queue                    Filter: [All ▼]    │
│  ─────────────────────────────────────────────────── │
│  [!] Post Report                           2h ago    │
│  Báo cáo: "Nội dung spam quảng cáo"                 │
│  Post: "Tuyển dụng XYZ..." by UserA                  │
│  [Xem bài] [Xóa bài] [Bỏ qua]                       │
│  ─────────────────────────────────────────────────── │
│  [!] Comment Report                        5h ago   │
│  Báo cáo: "Ngôn ngữ thù địch"                       │
│  Comment: "abc xyz..." by UserB                      │
│  [Xem] [Xóa comment] [Bỏ qua]                       │
└──────────────────────────────────────────────────────┘
```

Actions:
- **Xem bài/comment:** mở trong modal hoặc navigate
- **Xóa:** confirm dialog → DELETE API
- **Bỏ qua (Dismiss):** mark report as dismissed

### `/mod/posts` — Post Management

Table với tất cả posts:
| Title | Author | Date | Status | Actions |
|-------|--------|------|--------|---------|
| ... | ... | ... | Pinned | [Unpin][Hide] |
| ... | ... | ... | Active | [Pin][Hide] |
| ... | ... | ... | Hidden | [Restore][Delete] |

Filter: Pinned / Hidden / All  
Bulk actions: Pin selected / Delete selected

---

## Components

```
components/features/mod/
├── ReportCard.tsx          ← single report item
├── ReportQueue.tsx         ← list + filters
├── PostModTable.tsx        ← all posts table (TanStack Table)
├── ModActionButtons.tsx    ← Pin/Unpin/Hide/Delete/Dismiss
└── ConfirmModDialog.tsx    ← destructive action confirm
```

---

## Acceptance Criteria

- [ ] Reports queue hiện đúng pending reports
- [ ] Filter reports theo type (post/comment)
- [ ] Delete post/comment action với confirm
- [ ] Dismiss report action
- [ ] Post management table với sorting
- [ ] Pin/Unpin post hoạt động
- [ ] Hide/Restore post hoạt động
- [ ] Pending report count hiện trong mod sidebar badge
