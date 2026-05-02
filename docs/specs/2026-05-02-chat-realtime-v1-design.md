# Chat realtime (v1) — design spec

**Status:** Draft for review  
**Date:** 2026-05-02  
**Scope label:** C + channels (B) + reliable send (B) + DM discovery (C) + dock (C) + browser notifications (A)  
**Out of scope (v1):** Video/voice *calls*, screen share, WebRTC signaling.

## 1. Product decisions (locked from brainstorming)

| Topic | Choice |
|--------|--------|
| Feature bundle | **C** — text realtime + typing + dock + full page + **images/docs** + **voice notes**; no video call |
| Public channels | **B** — **Channels** in v1 (`/channels` API: public + my) alongside **Conversations** (1-1 + group) |
| Offline / delivery | **B** — **Retry queue** for failed sends; recipient **refetches** history on reconnect + **SignalR** when live |
| New 1-1 chat | **C** — **Search** (name/email) + **suggestions** (e.g. recent partners when data exists) |
| Dock visibility | **C** — dock **everywhere** when authenticated + **hide/minimize** persisted (e.g. `localStorage`) |
| Background alerts | **A** — **Browser Notification API**, permission prompt, show on new messages (prioritize DMs; channels may aggregate later) |

## 2. Architectural approaches (frontend)

1. **Recommended — Feature module + RTK Query + single SignalR hub client**  
   - `features/chat`: REST via RTK Query (`baseApi`), connection lifecycle in `chatHub.ts`, thin React context for dock + route `/chat`.  
   - **Send queue:** separate module (retry with backoff, surfaces “đang gửi / lỗi / đã gửi”).  
   - Aligns with existing Redux/`baseApi` patterns.

2. **Alternative — Zustand for ephemeral UI** (typing bubbles, dock open state) on top of (1). Use only if Redux updates feel noisy.

3. **Deferred — TanStack Query-only** — higher hand-merge cost with hub; not recommended for v1.

## 3. Backend surface (existing)

- REST: see `docs/api/chat-fe-api.md` — conversations, messages (paged), upload, send with attachments, channels, reactions, read receipts.  
- SignalR: `ChatHub` — connections, presence, typing, reactions (verify method names when wiring).  
- **Implementation note:** Confirm whether **channel messages** use the same `conversationId` as DM/group or a parallel model; FE uses a normalized **thread** model internally once confirmed.

## 4. UX / IA

### 4.1 Routes

- **`/chat`** — full-screen inbox: sidebar (segments **Messages** vs **Channels**) + thread view + composer.  
- **Dock** — global overlay (z-index above content, below modal alerts); **Facebook-like** minimized strips + expandable panels.

### 4.2 Dock behavior (decision C)

- Persist: **hidden**, **minimized** (bar only), **expanded** panels — keys e.g. `chat:dock:visibility`, `chat:dock:openThreads`.  
- Respect **keyboard**: Esc minimizes panel; focus trap inside expanded panel (ui-ux-pro-max: a11y).

### 4.3 New conversation

- Entry points: **New message** from `/chat` and optionally shortcut from dock.  
- **Search** users (requires Identity/search endpoint — add if missing).  
- **Suggestions:** derive from `GET /chat/conversations` sorted by `lastMessageAt` (top N).

### 4.4 Channels (decision B)

- Tab **Khám phá** / **Public** — `GET .../channels/public`.  
- **Của tôi** — `GET .../channels/my-channels`.  
- Join/leave per existing API; thread UI mirrors DM where IDs align.

### 4.5 Composer — attachments & voice (scope C)

- **Images/docs:** `multipart` upload → `UploadFileResponse` → `SendMessageWithAttachmentsRequest` with `AttachmentRequest` rows.  
- **Voice:** record in-browser (`MediaRecorder`), upload as file (treat as attachment); show waveform optional — **defer fancy waveform** if tight; minimum play button + duration.  
- Enforce limits **from API**; FE validates roughly before upload (avoid useless traffic).

### 4.6 Typing indicators

- Subscribe hub typing events for active thread; show “**X đang nhập…**” in **dock panel** and **full page** (user requirement).

### 4.7 Notifications (decision A)

- On `Notification` permission **granted**, post notification when: new message in thread **not** currently focused (and optionally suppress noisy channels v2).  
- Dedupe by `(conversationId, latestMessageId)` or short debounce.  
- Click notification → focus `/chat` or open dock thread.

### 4.8 Reliable send (decision B)

- Outbound: enqueue on Send click; on HTTP failure → retry with backoff; max attempts → user-visible failed state + “Thử lại”.  
- Inbound: on SignalR `Reconnect`, **invalidate** messages query for open threads + refresh conversation list.

## 5. Non-functional

- **Auth:** JWT on REST + hub; reuse `baseQueryWithReauth`.  
- **i18n:** `chat.json` vi/en.  
- **Mobile width:** dock collapses to single panel; test 375px.

## 6. Open points before coding

1. **Channel ↔ conversation ID** mapping for message APIs.  
2. **User search** endpoint for DM (Identity module).  
3. **Hub URL** and negotiation path in `appsettings` / env for FE `VITE_` vars.  
4. Exact **upload size** limits from server validation messages.

## 7. Self-review

- No contradictory scope: calls/screenshare explicitly out.  
- Phasing inside v1 is single bundle C; channels included per user choice.  
- Ambiguity: channel message routing — flagged for dev verification.

---

**Next step after approval:** Use **writing-plans** skill to produce an implementation plan (tasks ordered: hub wire-up → REST slices → `/chat` page → dock → queue → attachments/voice → notifications → polish).
