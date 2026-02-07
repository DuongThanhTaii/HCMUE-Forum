# 💬 PHASE 6: CHAT MODULE

> **Real-time Chat với SignalR**

---

## 📋 PHASE INFO

| Property          | Value          |
| ----------------- | -------------- |
| **Phase**         | 6              |
| **Name**          | Chat Module    |
| **Status**        | 🔵 IN_PROGRESS |
| **Progress**      | 2/12 tasks     |
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
| **Status**   | ✅ COMPLETED (2026-02-07)         |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 3 hours                           |
| **Branch**   | `feature/TASK-063-message-entity` |

**Deliverables:**

- ✅ Message entity với business logic
  - CreateText: Plain text messages với reply support
  - CreateWithAttachments: File/Image/Video messages (max 10 attachments)
  - CreateSystem: System messages (user joined, left, etc.)
  - Edit: Only sender can edit (not System messages)
  - Delete: Soft delete by sender only
  - AddReaction/RemoveReaction: Emoji reactions
- ✅ MessageId (strongly-typed ID)
- ✅ MessageType enum (Text, File, Image, Video, System)
- ✅ Attachment value object (filename, URL, size, MIME type, thumbnail)
- ✅ Reaction value object (userId, emoji, timestamp)
- ✅ 5 domain events (Sent, Edited, Deleted, ReactionAdded, ReactionRemoved)
- ✅ 67 unit tests (100% passing)
  - 46 MessageTests (Create, Edit, Delete, Reactions)
  - 13 AttachmentTests (validation, file size limits)
  - 8 MessageIdTests
  - 10 ReactionTests

---

### TASK-064: Design Channel Entity

| Property     | Value                             |
| ------------ | --------------------------------- |
| **ID**       | TASK-064                          |
| **Status**   | ✅ COMPLETED                      |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 3 hours                           |
| **Branch**   | `feature/TASK-064-channel-entity` |

**Deliverables:**

- ✅ Channel aggregate root with ownership hierarchy (Owner → Moderators → Members)
  - ChannelId strongly-typed ID
  - ChannelType enum (Public/Private)
  - Create factory with auto-add owner as member+moderator
  - Join/Leave operations (owner cannot leave)
  - AddModerator/RemoveModerator (owner-only operations)
  - UpdateInfo (moderator-level permission)
  - Archive (moderator-level permission)
  - Permission helpers: IsMember, IsModerator, IsOwner
- ✅ 6 domain events (ChannelCreated, MemberJoined, MemberLeft, ModeratorAdded, ModeratorRemoved, ChannelUpdated, ChannelArchived)
- ✅ 56 unit tests (100% passing)
  - 48 ChannelTests (Create, Join, Leave, AddModerator, RemoveModerator, UpdateInfo, Archive, Helpers)
  - 8 ChannelIdTests

---

### TASK-065: Setup SignalR Hub

| Property     | Value                          |
| ------------ | ------------------------------ |
| **ID**       | TASK-065                       |
| **Status**   | ✅ COMPLETED (2026-02-07)      |
| **Priority** | 🔴 Critical                    |
| **Estimate** | 4 hours                        |
| **Branch**   | `feature/TASK-065-signalr-hub` |

**Deliverables:**

- ✅ SignalR Hub Setup for real-time chat
  - ChatHub with strongly-typed IChatClient interface
  - OnConnected/OnDisconnected lifecycle management
  - User online/offline status tracking
- ✅ Conversation Methods
  - JoinConversation/LeaveConversation (SignalR groups)
  - SendMessage with reply support
  - SendTypingIndicator for real-time typing status
- ✅ Channel Methods
  - JoinChannel/LeaveChannel (SignalR groups)
  - SendChannelMessage for public/private channels
- ✅ Message Actions
  - AddReaction/RemoveReaction (emoji support)
  - MarkMessageAsRead (read receipts)
- ✅ ConnectionManager Service
  - Track user connections (multi-device support)
  - Manage conversation/channel membership
  - Query online users and presence
- ✅ Notification Records (10 types)
  - MessageNotification, MessageEdited, MessageDeleted
  - UserJoined, UserLeft, UserTyping
  - ReactionAdded, ReactionRemoved
  - MessageRead, ChannelUpdated, UserStatusChanged
- ✅ Configuration
  - CORS policy for SignalR (AllowCredentials)
  - Hub endpoint: `/hubs/chat`
  - Keep-alive (15s), timeout (30s), max message size (128KB)

---

### TASK-066: Setup Redis Backplane

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **ID**       | TASK-066                           |
| **Status**   | ✅ COMPLETED (2026-02-07)          |
| **Priority** | 🔴 Critical                        |
| **Estimate** | 2 hours                            |
| **Branch**   | `feature/TASK-066-redis-backplane` |

**Deliverables:**

- ✅ Redis Backplane Configuration
  - RedisBackplaneOptions with ConnectionString, Enabled, KeyPrefix
  - Configurable timeouts (Connect: 5s, Sync: 5s)
  - AbortOnConnectFail option for production
  - Automatic fallback to in-memory mode if disabled
- ✅ SignalR Integration
  - AddStackExchangeRedis for multi-server scaling
  - Connection string masking in logs (password protection)
  - Logging for backplane status (enabled/disabled)
- ✅ Configuration in appsettings.json
  - RedisBackplane section with all options
  - Production-ready defaults (localhost:6379)
- ✅ Architecture Documentation
  - Comprehensive setup guide (docs/architecture/signalr-redis-backplane.md)
  - Multi-server deployment scenarios
  - Redis connection string formats (basic, SSL, Azure Cache)
  - Performance considerations and monitoring
  - Troubleshooting guide

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
