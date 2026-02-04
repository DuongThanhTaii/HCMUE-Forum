# 🎨 PHASE 10: FRONTEND DEVELOPMENT

> **Next.js App với Shadcn/ui + PWA**

---

## 📋 PHASE INFO

| Property          | Value                       |
| ----------------- | --------------------------- |
| **Phase**         | 10                          |
| **Name**          | Frontend Development        |
| **Status**        | ⬜ NOT_STARTED              |
| **Progress**      | 0/14 tasks                  |
| **Est. Duration** | 3 weeks                     |
| **Dependencies**  | Backend modules (Phase 3-9) |

---

## 🛠️ TECH STACK

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **State**: Zustand (client) + TanStack Query (server)
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client

---

## 📝 TASKS

### TASK-101: Setup Next.js Project Structure

| Property     | Value                               |
| ------------ | ----------------------------------- |
| **ID**       | TASK-101                            |
| **Status**   | ⬜ NOT_STARTED                      |
| **Priority** | 🔴 Critical                         |
| **Estimate** | 4 hours                             |
| **Branch**   | `feature/TASK-101-nextjs-structure` |

**Acceptance Criteria:**

- [ ] App Router structure
- [ ] TypeScript strict mode
- [ ] Path aliases configured
- [ ] ESLint + Prettier
- [ ] Folder structure created

**Structure:**

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── forum/
│   │   ├── learning/
│   │   ├── chat/
│   │   ├── career/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── admin/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Shadcn
│   ├── features/           # Feature components
│   └── shared/             # Shared components
├── lib/
│   ├── api/               # API client
│   ├── utils/
│   └── validations/       # Zod schemas
├── hooks/
├── stores/                # Zustand stores
├── types/
└── styles/
```

---

### TASK-102: Setup Tailwind + Shadcn/ui

| Property     | Value                           |
| ------------ | ------------------------------- |
| **ID**       | TASK-102                        |
| **Status**   | ⬜ NOT_STARTED                  |
| **Priority** | 🔴 Critical                     |
| **Estimate** | 2 hours                         |
| **Branch**   | `feature/TASK-102-shadcn-setup` |

**Components to Install:**

```bash
npx shadcn-ui@latest add button input card form dialog toast
npx shadcn-ui@latest add avatar dropdown-menu navigation-menu
npx shadcn-ui@latest add tabs table badge separator
npx shadcn-ui@latest add sheet skeleton switch textarea
npx shadcn-ui@latest add alert alert-dialog select checkbox
npx shadcn-ui@latest add popover command scroll-area
```

---

### TASK-103: Implement PWA

| Property     | Value                        |
| ------------ | ---------------------------- |
| **ID**       | TASK-103                     |
| **Status**   | ⬜ NOT_STARTED               |
| **Priority** | 🟡 Medium                    |
| **Estimate** | 3 hours                      |
| **Branch**   | `feature/TASK-103-pwa-setup` |

**Acceptance Criteria:**

- [ ] manifest.json configured
- [ ] Service worker setup
- [ ] Offline support
- [ ] Install prompt
- [ ] App icons

---

### TASK-104: Auth Pages

| Property     | Value                         |
| ------------ | ----------------------------- |
| **ID**       | TASK-104                      |
| **Status**   | ⬜ NOT_STARTED                |
| **Priority** | 🔴 Critical                   |
| **Estimate** | 4 hours                       |
| **Branch**   | `feature/TASK-104-auth-pages` |

**Pages:**

- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Auth provider (context)
- [ ] Protected route wrapper

---

### TASK-105: Main Layout + Navigation

| Property     | Value                     |
| ------------ | ------------------------- |
| **ID**       | TASK-105                  |
| **Status**   | ⬜ NOT_STARTED            |
| **Priority** | 🔴 Critical               |
| **Estimate** | 4 hours                   |
| **Branch**   | `feature/TASK-105-layout` |

**Components:**

- [ ] Navbar with user menu
- [ ] Sidebar navigation
- [ ] Mobile responsive menu
- [ ] Footer
- [ ] Breadcrumbs

---

### TASK-106: Forum Pages

| Property     | Value                          |
| ------------ | ------------------------------ |
| **ID**       | TASK-106                       |
| **Status**   | ⬜ NOT_STARTED                 |
| **Priority** | 🔴 Critical                    |
| **Estimate** | 6 hours                        |
| **Branch**   | `feature/TASK-106-forum-pages` |

**Pages:**

- [ ] Posts list (with filters)
- [ ] Post detail (with comments)
- [ ] Create post
- [ ] Edit post
- [ ] Categories page
- [ ] Search results

---

### TASK-107: Learning Pages

| Property     | Value                             |
| ------------ | --------------------------------- |
| **ID**       | TASK-107                          |
| **Status**   | ⬜ NOT_STARTED                    |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 6 hours                           |
| **Branch**   | `feature/TASK-107-learning-pages` |

**Pages:**

- [ ] Documents list
- [ ] Document detail
- [ ] Upload document
- [ ] Courses list
- [ ] Course detail
- [ ] Approval queue (for moderators)

---

### TASK-108: Chat Interface

| Property     | Value                             |
| ------------ | --------------------------------- |
| **ID**       | TASK-108                          |
| **Status**   | ⬜ NOT_STARTED                    |
| **Priority** | 🔴 Critical                       |
| **Estimate** | 8 hours                           |
| **Branch**   | `feature/TASK-108-chat-interface` |

**Components:**

- [ ] Conversation list
- [ ] Chat window
- [ ] Message bubble
- [ ] Input with file upload
- [ ] Online status
- [ ] Typing indicator
- [ ] Channel sidebar

---

### TASK-109: Career Hub Pages

| Property     | Value                           |
| ------------ | ------------------------------- |
| **ID**       | TASK-109                        |
| **Status**   | ⬜ NOT_STARTED                  |
| **Priority** | 🟡 Medium                       |
| **Estimate** | 6 hours                         |
| **Branch**   | `feature/TASK-109-career-pages` |

**Pages:**

- [ ] Jobs list
- [ ] Job detail
- [ ] Company profile
- [ ] Post job (recruiter)
- [ ] My applications
- [ ] Saved jobs

---

### TASK-110: Admin Dashboard

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **ID**       | TASK-110                           |
| **Status**   | ⬜ NOT_STARTED                     |
| **Priority** | 🟡 Medium                          |
| **Estimate** | 6 hours                            |
| **Branch**   | `feature/TASK-110-admin-dashboard` |

**Pages:**

- [ ] Dashboard overview
- [ ] Users management
- [ ] Roles management
- [ ] Reports management
- [ ] Analytics

---

### TASK-111: Profile Pages

| Property     | Value                            |
| ------------ | -------------------------------- |
| **ID**       | TASK-111                         |
| **Status**   | ⬜ NOT_STARTED                   |
| **Priority** | 🟡 Medium                        |
| **Estimate** | 4 hours                          |
| **Branch**   | `feature/TASK-111-profile-pages` |

**Pages:**

- [ ] View profile
- [ ] Edit profile
- [ ] Change password
- [ ] Notification settings
- [ ] Activity history

---

### TASK-112: Notification Center

| Property     | Value                                  |
| ------------ | -------------------------------------- |
| **ID**       | TASK-112                               |
| **Status**   | ⬜ NOT_STARTED                         |
| **Priority** | 🟡 Medium                              |
| **Estimate** | 3 hours                                |
| **Branch**   | `feature/TASK-112-notification-center` |

**Components:**

- [ ] Notification dropdown
- [ ] Notification page
- [ ] Real-time updates
- [ ] Mark as read

---

### TASK-113: Responsive Design

| Property     | Value                         |
| ------------ | ----------------------------- |
| **ID**       | TASK-113                      |
| **Status**   | ⬜ NOT_STARTED                |
| **Priority** | 🔴 Critical                   |
| **Estimate** | 4 hours                       |
| **Branch**   | `feature/TASK-113-responsive` |

**Acceptance Criteria:**

- [ ] Mobile-first approach
- [ ] Tablet breakpoints
- [ ] Desktop optimization
- [ ] Touch-friendly interactions

---

### TASK-114: Dark Mode

| Property     | Value                        |
| ------------ | ---------------------------- |
| **ID**       | TASK-114                     |
| **Status**   | ⬜ NOT_STARTED               |
| **Priority** | 🟢 Low                       |
| **Estimate** | 2 hours                      |
| **Branch**   | `feature/TASK-114-dark-mode` |

**Acceptance Criteria:**

- [ ] Theme toggle
- [ ] System preference detection
- [ ] Persist preference
- [ ] Smooth transition

---

## ✅ COMPLETION CHECKLIST

- [ ] TASK-101 - TASK-114

---

_Last Updated: 2026-02-04_
