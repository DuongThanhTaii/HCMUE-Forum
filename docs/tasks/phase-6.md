# 💬 PHASE 6: CHAT MODULE

> **Real-time Chat với SignalR**

---

## 📋 PHASE INFO

| Property          | Value          |
| ----------------- | -------------- |
| **Phase**         | 6              |
| **Name**          | Chat Module    |
| **Status**        | 🔵 IN_PROGRESS |
| **Progress**      | 1/12 tasks     |
| **Est. Duration** | 2 weeks        |
| **Dependencies**  | Phase 3        |

---

## 📝 TASKS

### TASK-062: Design Conversation Aggregate

| Property     | Value                                     |
| ------------ | ----------------------------------------- |
| **ID**       | TASK-062                                  |
| **Status**   | ✅ COMPLETED (2026-02-07)                 |
| **Priority** | 🔴 Critical                               |
| **Estimate** | 4 hours                                   |
| **Branch**   | `feature/TASK-062-conversation-aggregate` |

**Deliverables:**

- ✅ Conversation aggregate với business logic
  - CreateDirect (1:1 chat, exactly 2 participants)
  - CreateGroup (2+ participants, optional title)
  - AddParticipant/RemoveParticipant (Group only)
  - Archive/Unarchive
- ✅ ConversationId (strongly-typed ID)
- ✅ ConversationType enum (Direct, Group)
- ✅ 5 domain events (Created, ParticipantAdded, ParticipantRemoved, Archived, Unarchived)
- ✅ 55 unit tests (100% passing)
  - 47 ConversationTests (Create, Add/RemoveParticipant, Archive/Unarchive)
  - 8 ConversationIdTests (equality, hashing)

---

### TASK-063: Design Message Entity

| Property     | Value                             |
| ------------ | --------------------------------- |
| **ID**       | TASK-063                          |
| **Status**   | ⬜ NOT_STARTED                    |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 3 hours                           |
| **Branch**   | `feature/TASK-063-message-entity` |

---

### TASK-064: Design Channel Entity

| Property     | Value                             |
| ------------ | --------------------------------- |
| **ID**       | TASK-064                          |
| **Status**   | ⬜ NOT_STARTED                    |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 3 hours                           |
| **Branch**   | `feature/TASK-064-channel-entity` |

---

### TASK-065: Setup SignalR Hub

| Property     | Value                          |
| ------------ | ------------------------------ |
| **ID**       | TASK-065                       |
| **Status**   | ⬜ NOT_STARTED                 |
| **Priority** | 🔴 Critical                    |
| **Estimate** | 4 hours                        |
| **Branch**   | `feature/TASK-065-signalr-hub` |

---

### TASK-066: Setup Redis Backplane

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **ID**       | TASK-066                           |
| **Status**   | ⬜ NOT_STARTED                     |
| **Priority** | 🔴 Critical                        |
| **Estimate** | 2 hours                            |
| **Branch**   | `feature/TASK-066-redis-backplane` |

---

### TASK-067: Implement 1:1 Chat

| Property     | Value                          |
| ------------ | ------------------------------ |
| **ID**       | TASK-067                       |
| **Status**   | ⬜ NOT_STARTED                 |
| **Priority** | 🔴 Critical                    |
| **Estimate** | 4 hours                        |
| **Branch**   | `feature/TASK-067-direct-chat` |

---

### TASK-068: Implement Group Chat

| Property     | Value                         |
| ------------ | ----------------------------- |
| **ID**       | TASK-068                      |
| **Status**   | ⬜ NOT_STARTED                |
| **Priority** | 🔴 Critical                   |
| **Estimate** | 4 hours                       |
| **Branch**   | `feature/TASK-068-group-chat` |

---

### TASK-069: Implement Channels

| Property     | Value                       |
| ------------ | --------------------------- |
| **ID**       | TASK-069                    |
| **Status**   | ⬜ NOT_STARTED              |
| **Priority** | 🟡 Medium                   |
| **Estimate** | 3 hours                     |
| **Branch**   | `feature/TASK-069-channels` |

---

### TASK-070: Implement File Sharing

| Property     | Value                           |
| ------------ | ------------------------------- |
| **ID**       | TASK-070                        |
| **Status**   | ⬜ NOT_STARTED                  |
| **Priority** | 🟡 Medium                       |
| **Estimate** | 3 hours                         |
| **Branch**   | `feature/TASK-070-file-sharing` |

---

### TASK-071: Implement Message Reactions

| Property     | Value                        |
| ------------ | ---------------------------- |
| **ID**       | TASK-071                     |
| **Status**   | ⬜ NOT_STARTED               |
| **Priority** | 🟢 Low                       |
| **Estimate** | 2 hours                      |
| **Branch**   | `feature/TASK-071-reactions` |

---

### TASK-072: Implement Read Receipts

| Property     | Value                            |
| ------------ | -------------------------------- |
| **ID**       | TASK-072                         |
| **Status**   | ⬜ NOT_STARTED                   |
| **Priority** | 🟡 Medium                        |
| **Estimate** | 2 hours                          |
| **Branch**   | `feature/TASK-072-read-receipts` |

---

### TASK-073: Chat API Endpoints

| Property     | Value                       |
| ------------ | --------------------------- |
| **ID**       | TASK-073                    |
| **Status**   | ⬜ NOT_STARTED              |
| **Priority** | 🔴 Critical                 |
| **Estimate** | 4 hours                     |
| **Branch**   | `feature/TASK-073-chat-api` |

**API Endpoints:**

```
GET    /api/v1/conversations
GET    /api/v1/conversations/{id}
POST   /api/v1/conversations
GET    /api/v1/conversations/{id}/messages
POST   /api/v1/conversations/{id}/messages
DELETE /api/v1/messages/{id}
POST   /api/v1/messages/{id}/react

GET    /api/v1/channels
POST   /api/v1/channels
PUT    /api/v1/channels/{id}
DELETE /api/v1/channels/{id}
POST   /api/v1/channels/{id}/join
POST   /api/v1/channels/{id}/leave
```

---

## ✅ COMPLETION CHECKLIST

- [ ] TASK-062 - TASK-073

---

_Last Updated: 2026-02-04_
