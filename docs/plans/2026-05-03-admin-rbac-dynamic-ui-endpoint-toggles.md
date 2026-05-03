# Plan: Phân quyền động — UI gọn, nhóm module, Endpoint toggles + giải thích “ghi đè quyền”

**Date:** 2026-05-03  
**Mục tiêu:** Rush **production-ready** cho màn **Roles / Permissions** và **Observability → Endpoint toggles**: nhóm theo cụm, expand/collapse, toggle FE rõ ràng; đồng bộ với **permission-based** (`docs/plans/2026-05-03-observability-permission-based-production.md`).

---

## A. “Ghi đè quyền” (permission override) là gì?

Trong UniHub có **ba lớp** (từ “mặc định” đến “cụ thể user”):

| Lớp | Ý nghĩa | Ví dụ |
|-----|---------|--------|
| **1. Role permissions** | Quyền **mặc định** của vai trò (Moderator, Lecturer, …) — gán trong màn **Roles → checkbox**. | Moderator có `forum.reports.review`. |
| **2. Group overrides** | Gán/bớt quyền cho **một nhóm** (vd. “Khoa SP”). | Nhóm được phép `learning.documents.create` trong scope Department X. |
| **3. User overrides** | **Ghi đè** riêng một **user**: cho phép hoặc **tưới tắt** một permission so với role + group. | User A thêm `forum.posts.delete` dù role Student không có — hoặc **Deny** một quyền role đã có. |

**PermissionChecker** trong BE đánh giá **override trước**, sau đó mới đến role cache — đúng nghĩa “ghi đè động”.

**Admin UI:** `/admin/overrides/users` và `/admin/overrides/groups` là chỗ cấu hình (2) và (3). Không nhầm với **endpoint toggle** (bật/tắt API toàn hệ thống).

---

## B. Bug 500 `DbUpdateConcurrencyException` khi `POST /roles/{id}/permissions`

**Nguyên nhân đã xử lý trong code:** `GetByIdAsync` **không load** `Role.Permissions` từ DB → aggregate tưởng chưa có quyền → domain cho phép **assign** lần nữa → conflict khi lưu (hoặc trạng thái EF không khớp). Đồng thời **GetUserPermissions** / **PermissionChecker** khi cache miss cũng đọc role **không có** danh sách permission → danh sách quyền hiệu lực có thể **rỗng sai**.

**Sửa:** `RoleRepository.GetByIdAsync` và `GetAllAsync` dùng `.Include(r => r.Permissions)`; `GET /api/v1/roles/{id}` trả thêm **`permissions[]`** (chi tiết gán) để FE đồng bộ checkbox.

Sau deploy: retest gán/bỏ quyền Moderator; xóa cache permission (hoặc đăng xuất/nhập) nếu cần.

---

## C. UI phân quyền theo cụm (dynamic RBAC list)

### C.1 Nhóm permission (FE)

- Parse **`permission.code`** hoặc các field **`module` / `resource`** (API `GET /permissions` đã có).
- **Nhóm cấp 1:** `module` (Forum, Chat, Learning, Identity, …).
- **Nhóm cấp 2 (optional):** `resource` (posts, comments, categories, …).
- Hiển thị: **Accordion / collapsible** — mặc định **đóng**, hiển thị số quyền đã bật `3/12`.

### C.2 Trạng thái checkbox

- Nguồn sự thật: `GET /roles/{id}` → `permissions[]` (sau fix BE).
- Optimistic UI + **invalidate** RTK tag `Role` sau assign/remove.
- **System role** (`isSystemRole`): disable toàn bộ hoặc ẩn nút (theo policy domain — role hệ thống không cho sửa permission).

### C.3 Copy ngắn cho từng role (documentation trong UI)

- Tooltip hoặc một dòng dưới tên role: *Student — người dùng mặc định*, *Moderator — duyệt nội dung forum*, …

---

## D. Endpoint toggles — UI “đẹp và có toggle ngay trên FE”

### D.1 Nhóm endpoint

- API `GET /api/v1/admin/authorization/toggles` trả danh sách **endpointKey** (vd. full controller action name hoặc route key).
- **FE nhóm** theo prefix:
  - Viết helper: lấy segment đầu sau `UniHub.` hoặc nhóm theo **module** nếu key có convention (Forum / Identity / Chat).
- Mỗi nhóm: tiêu đề + số **enabled/total** + expand.

### D.2 Hàng toggle

- **Switch** + label ngắn (truncate + tooltip full key).
- Trạng thái loading per-row khi `PUT` toggle.
- **Confirm** cho toggle **tắt** (risk): modal “Xác nhận tắt API …”.

### D.3 Quyền (permission-based)

- Chỉ user có `observability.endpoint-toggles.read` mới **thấy** trang; `…manage` mới **bật/tắt** (theo plan observability).
- Tách route: ví dụ `/admin/system/toggles` với guard permission — không gộp chung “Admin role only”.

---

## E. Backend bổ sung (theo vòng production)

1. **Policies** cho toggles / audit / user-actions (như plan observability).
2. **GET me/permissions** cho FE guard (tránh chỉ dựa role).
3. **Rate limit** trên search log và list toggles.

---

## F. Definition of Done (màn RBAC + toggles)

- [ ] Role permission assign/remove **không 500**; GET role có **`permissions`** khớp DB.
- [ ] Permission list FE **grouped + expandable**; không phải một trang dài “AI trôi”.
- [ ] Endpoint toggles **grouped** + switch + confirm off.
- [ ] Tài liệu ngắn trong README admin hoặc `docs/api/` về **override** vs **role**.

---

## G. Tham chiếu file

- BE fix Include: `UniHub.Identity.Infrastructure/Persistence/Repositories/RoleRepository.cs`
- Response: `RoleResponse`, `RoleAssignedPermissionResponse`, `RolesController`
- FE roles: `frontend/src/features/admin/roles/*`
- FE toggles: `frontend/src/features/admin/observability/components/AdminTogglesPage.tsx`
- Overrides: `AdminOverridesPage.tsx` + `AuthorizationAdminController` overrides routes
