# 👤 PHASE 3: IDENTITY & ACCESS MODULE

> **Hệ thống Authentication và Dynamic Role-Based Access Control**

---

## 📋 PHASE INFO

| Property          | Value                    |
| ----------------- | ------------------------ |
| **Phase**         | 3                        |
| **Name**          | Identity & Access Module |
| **Status**        | 🔵 IN_PROGRESS           |
| **Progress**      | 8/12 tasks               |
| **Est. Duration** | 2 weeks                  |
| **Dependencies**  | Phase 2                  |

---

## 🎯 OBJECTIVES

- [x] Implement User aggregate với value objects
- [x] Implement Role và Permission entities
- [x] Implement JWT Authentication với Refresh Token
- [x] Implement Dynamic Role Management
- [x] Implement Permission Assignment
- [ ] Implement Official Badge system
- [ ] Implement Scoped Permissions

---

## 📝 TASKS

### TASK-026: Design User Aggregate ✅

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-026                          |
| **Status**       | ✅ COMPLETED                      |
| **Priority**     | 🔴 Critical                       |
| **Estimate**     | 4 hours                           |
| **Branch**       | `feature/TASK-026-user-aggregate` |
| **Dependencies** | Phase 2                           |

**Description:**
Implement User aggregate root với value objects.

**Acceptance Criteria:**

- [x] `User` aggregate root implemented
- [x] `UserId` strongly-typed ID created
- [x] `Email` value object created
- [x] `UserProfile` value object created
- [x] `OfficialBadge` value object created
- [x] Domain events defined
- [x] Unit tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Domain/
├── Users/
│   ├── User.cs
│   ├── UserId.cs
│   ├── UserStatus.cs
│   └── ValueObjects/
│       ├── Email.cs
│       ├── Password.cs
│       ├── UserProfile.cs
│       └── OfficialBadge.cs
├── Events/
│   ├── UserRegisteredEvent.cs
│   ├── UserProfileUpdatedEvent.cs
│   └── UserStatusChangedEvent.cs
└── Errors/
    └── UserErrors.cs
```

**Domain Model:**

```csharp
public sealed class User : AggregateRoot<UserId>
{
    public Email Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserProfile Profile { get; private set; }
    public UserStatus Status { get; private set; }
    public OfficialBadge? Badge { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<UserRole> _roles = new();
    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();

    private readonly List<RefreshToken> _refreshTokens = new();
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    private User() { }

    public static Result<User> Create(Email email, string passwordHash, UserProfile profile)
    {
        var user = new User
        {
            Id = UserId.CreateUnique(),
            Email = email,
            PasswordHash = passwordHash,
            Profile = profile,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        user.AddDomainEvent(new UserRegisteredEvent(user.Id, user.Email));
        return Result.Success(user);
    }

    public Result AssignRole(Role role)
    {
        if (_roles.Any(r => r.RoleId == role.Id))
            return Result.Failure(UserErrors.RoleAlreadyAssigned);

        _roles.Add(new UserRole(Id, role.Id));
        AddDomainEvent(new RoleAssignedEvent(Id, role.Id));
        return Result.Success();
    }

    public void SetOfficialBadge(OfficialBadge badge)
    {
        Badge = badge;
        AddDomainEvent(new OfficialBadgeAssignedEvent(Id, badge));
    }
}
```

**Commit Message:**

```
feat(identity): implement User aggregate

- Add User aggregate root
- Add UserId strongly-typed ID
- Add Email, UserProfile, OfficialBadge value objects
- Add UserRegistered and other domain events
- Add UserErrors
- Add unit tests

Refs: TASK-026
```

---

### TASK-027: Design Role & Permission Entities

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-027                           |
| **Status**       | ✅ COMPLETED                       |
| **Priority**     | 🔴 Critical                        |
| **Estimate**     | 3 hours                            |
| **Branch**       | `feature/TASK-027-role-permission` |
| **Dependencies** | TASK-026                           |

**Description:**
Implement Role aggregate và Permission entity cho dynamic RBAC.

**Acceptance Criteria:**

- [x] `Role` aggregate root implemented
- [x] `Permission` entity implemented
- [x] `PermissionScope` value object created
- [x] Role-Permission relationship
- [x] Seed data for default roles
- [x] Unit tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Domain/
├── Roles/
│   ├── Role.cs
│   ├── RoleId.cs
│   └── RolePermission.cs
├── Permissions/
│   ├── Permission.cs
│   ├── PermissionId.cs
│   └── PermissionScope.cs
```

**Permission Structure:**

```csharp
// Permission codes follow pattern: {module}.{resource}.{action}
public static class PermissionCodes
{
    public static class Forum
    {
        public const string PostCreate = "forum.post.create";
        public const string PostEdit = "forum.post.edit";
        public const string PostDelete = "forum.post.delete";
        public const string PostModerate = "forum.post.moderate";
        public const string CommentCreate = "forum.comment.create";
        public const string CommentDelete = "forum.comment.delete";
    }

    public static class Learning
    {
        public const string DocumentUpload = "learning.document.upload";
        public const string DocumentApprove = "learning.document.approve";
        public const string CourseManage = "learning.course.manage";
    }

    public static class Identity
    {
        public const string UserManage = "identity.user.manage";
        public const string RoleManage = "identity.role.manage";
        public const string PermissionAssign = "identity.permission.assign";
    }
    // ... more modules
}
```

**Commit Message:**

```
feat(identity): implement Role and Permission entities

- Add Role aggregate root
- Add Permission entity
- Add PermissionScope for scoped permissions
- Add RolePermission relationship
- Define permission codes per module
- Add unit tests

Refs: TASK-027
```

---

### TASK-028: Implement JWT Authentication

| Property         | Value                       |
| ---------------- | --------------------------- |
| **ID**           | TASK-028                    |
| **Status**       | ✅ COMPLETED                |
| **Priority**     | 🔴 Critical                 |
| **Estimate**     | 4 hours                     |
| **Branch**       | `feature/TASK-028-jwt-auth` |
| **Dependencies** | TASK-026                    |

**Description:**
Implement JWT token generation và validation.

**Acceptance Criteria:**

- [x] `IJwtService` interface defined
- [x] `JwtService` implementation
- [x] Access token generation (15 min expiry)
- [x] Token validation middleware
- [x] JWT settings in configuration
- [x] Unit tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Application/
├── Abstractions/
│   └── IJwtService.cs

src/Modules/Identity/UniHub.Identity.Infrastructure/
├── Authentication/
│   ├── JwtService.cs
│   ├── JwtSettings.cs
│   └── JwtBearerOptionsSetup.cs
```

**Commit Message:**

```
feat(identity): implement JWT authentication

- Add IJwtService interface
- Add JwtService implementation
- Configure 15 min access token expiry
- Add JWT validation middleware
- Add configuration settings
- Add unit tests

Refs: TASK-028
```

---

### TASK-029: Implement Refresh Token Flow

| Property         | Value                            |
| ---------------- | -------------------------------- |
| **ID**           | TASK-029                         |
| **Status**       | ✅ COMPLETED                     |
| **Priority**     | 🔴 Critical                      |
| **Estimate**     | 4 hours                          |
| **Branch**       | `feature/TASK-029-refresh-token` |
| **Dependencies** | TASK-028                         |

**Description:**
Implement Refresh Token với rotation.

**Acceptance Criteria:**

- [x] `RefreshToken` entity implemented
- [x] Token rotation on use
- [x] Token revocation
- [x] 7 day expiry
- [ ] HttpOnly cookie storage (deferred to API implementation)
- [x] Unit tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Domain/
├── Tokens/
│   ├── RefreshToken.cs
│   └── RefreshTokenId.cs

src/Modules/Identity/UniHub.Identity.Application/
├── Commands/RefreshToken/
│   ├── RefreshTokenCommand.cs
│   ├── RefreshTokenCommandHandler.cs
│   └── RefreshTokenCommandValidator.cs
```

**Commit Message:**

```
feat(identity): implement refresh token flow

- Add RefreshToken entity
- Implement token rotation
- Add token revocation
- Configure 7 day expiry
- Store in HttpOnly cookies
- Add unit tests

Refs: TASK-029
```

---

### TASK-030: Create Registration Flow

| Property         | Value                           |
| ---------------- | ------------------------------- |
| **ID**           | TASK-030                        |
| **Status**       | ✅ COMPLETED                    |
| **Priority**     | 🔴 Critical                     |
| **Estimate**     | 3 hours                         |
| **Branch**       | `feature/TASK-030-registration` |
| **Dependencies** | TASK-026, TASK-027              |

**Description:**
Implement user registration command và handler.

**Acceptance Criteria:**

- [x] `RegisterUserCommand` implemented
- [x] `RegisterUserCommandHandler` implemented
- [x] `RegisterUserCommandValidator` implemented
- [x] Email uniqueness check
- [x] Password hashing
- [x] Default role assignment
- [x] Unit tests written

**Files Created:**

```
src/Modules/Identity/UniHub.Identity.Application/
├── Commands/Register/
│   ├── RegisterUserCommand.cs
│   ├── RegisterUserCommandHandler.cs
│   ├── RegisterUserCommandValidator.cs
│   └── UserErrors.cs
├── Abstractions/
│   ├── IUserRepository.cs
│   ├── IRoleRepository.cs
│   └── IPasswordHasher.cs

src/Modules/Identity/UniHub.Identity.Infrastructure/
├── Authentication/
│   └── PasswordHasher.cs
├── Persistence/Repositories/
│   ├── UserRepository.cs
│   └── RoleRepository.cs

tests/Modules/Identity/UniHub.Identity.Application.Tests/
├── Commands/Register/
│   ├── RegisterUserCommandHandlerTests.cs (6 tests)
│   └── RegisterUserCommandValidatorTests.cs (25 tests)
```

**Implementation Details:**

- Split FullName into firstName/lastName for UserProfile
- BCrypt password hashing with workFactor 12
- In-memory repositories with seeded roles (Student, Teacher, Admin)
- Comprehensive validation: email format, password strength, field lengths
- 31 unit tests added (388 total tests passing)

**Commit Message:**

```
feat(identity): implement user registration - TASK-030

- Add RegisterUserCommand, Handler, and Validator
- Add IUserRepository, IRoleRepository, IPasswordHasher interfaces
- Add UserRepository, RoleRepository with in-memory implementations
- Add PasswordHasher with BCrypt (workFactor: 12)
- Add 31 comprehensive unit tests (handler + validator)
- Register services in DI container
- All 388 tests passing (357 existing + 31 new)

Refs: TASK-030
```

---

### TASK-031: Create Login Flow

| Property         | Value                        |
| ---------------- | ---------------------------- |
| **ID**           | TASK-031                     |
| **Status**       | ✅ COMPLETED                 |
| **Priority**     | 🔴 Critical                  |
| **Estimate**     | 3 hours                      |
| **Branch**       | `feature/TASK-031-login`     |
| **Dependencies** | TASK-028, TASK-029, TASK-030 |

**Description:**
Implement login command và handler.

**Acceptance Criteria:**

- [x] `LoginCommand` implemented
- [x] `LoginCommandHandler` implemented
- [x] Password verification
- [x] Generate JWT + Refresh Token
- [x] Return tokens in response
- [x] Unit tests written

**Files Created:**

```
src/Modules/Identity/UniHub.Identity.Application/
├── Commands/Login/
│   ├── LoginCommand.cs
│   ├── LoginCommandHandler.cs
│   ├── LoginCommandValidator.cs
│   ├── LoginErrors.cs
│   └── LoginResponse.cs

tests/Modules/Identity/UniHub.Identity.Application.Tests/
├── Commands/Login/
│   ├── LoginCommandHandlerTests.cs (6 tests)
│   └── LoginCommandValidatorTests.cs (4 tests)
```

**Implementation Details:**

- Email validation via Email value object
- Password verification using BCrypt PasswordHasher
- User account status check (Active required)
- JWT access token generation (15-minute expiry)
- Refresh token generation and persistence (7-day expiry)
- Returns LoginResponse with both tokens and expiry times
- Secure error messages (don't reveal which credential is wrong)
- 10 unit tests added (405 total tests passing)

**Commit Message:**

```
feat(identity): implement login flow - TASK-031

- Add LoginCommand and LoginResponse
- Add LoginCommandHandler with password verification
- Add LoginCommandValidator for input validation
- Generate both access and refresh tokens
- Check user account status
- Add 10 comprehensive unit tests
- All 405 tests passing (388 existing + 17 new)

Refs: TASK-031
```

│ ├── LoginCommand.cs
│ ├── LoginCommandHandler.cs
│ ├── LoginCommandValidator.cs
│ └── LoginResponse.cs

```

**Commit Message:**

```

feat(identity): implement login flow

- Add LoginCommand
- Add LoginCommandHandler
- Verify password with BCrypt
- Generate JWT and refresh token
- Return tokens in response
- Add unit tests

Refs: TASK-031

```

---

### TASK-032: Implement Dynamic Role Management ✅

| Property         | Value                              |
| ---------------- | ---------------------------------- |
| **ID**           | TASK-032                           |
| **Status**       | ✅ COMPLETED                       |
| **Priority**     | 🔴 Critical                        |
| **Estimate**     | 4 hours                            |
| **Branch**       | `feature/TASK-032-role-management` |
| **Dependencies** | TASK-027                           |

**Description:**
Implement CRUD commands cho dynamic role management.

**Acceptance Criteria:**

- [x] Create Role command
- [x] Update Role command
- [x] Delete Role command
- [x] Assign Permission to Role command
- [x] Remove Permission from Role command
- [ ] Unit tests written

**Files to Create:**

```

src/Modules/Identity/UniHub.Identity.Application/
├── Commands/Roles/
│ ├── CreateRole/
│ ├── UpdateRole/
│ ├── DeleteRole/
│ ├── AssignPermission/
│ └── RemovePermission/

```

**Commit Message:**

```

feat(identity): implement dynamic role management

- Add CreateRoleCommand and handler
- Add UpdateRoleCommand and handler
- Add DeleteRoleCommand and handler
- Add AssignPermissionCommand and handler
- Add RemovePermissionCommand and handler
- Add unit tests

Refs: TASK-032

```

---

### TASK-033: Implement Permission Assignment ✅

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| **ID**           | TASK-033                             |
| **Status**       | ✅ COMPLETED                         |
| **Priority**     | 🔴 Critical                          |
| **Estimate**     | 3 hours                              |
| **Branch**       | `feature/TASK-033-permission-assign` |
| **Dependencies** | TASK-032                             |

**Description:**
Implement permission assignment cho users qua roles.

**Acceptance Criteria:**

- [x] Assign Role to User command
- [x] Remove Role from User command
- [x] Get User Permissions query
- [x] Permission caching in Redis
- [ ] Unit tests written

**Files to Create:**

```

src/Modules/Identity/UniHub.Identity.Application/
├── Commands/Users/
│ ├── AssignRole/
│ └── RemoveRole/
├── Queries/
│ └── GetUserPermissions/

```

**Commit Message:**

```

feat(identity): implement permission assignment

- Add AssignRoleCommand and handler
- Add RemoveRoleCommand and handler
- Add GetUserPermissionsQuery
- Cache permissions in Redis
- Add unit tests

Refs: TASK-033

````

---

### TASK-034: Create Official Account System

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-034                          |
| **Status**       | ⬜ NOT_STARTED                    |
| **Priority**     | 🟡 Medium                         |
| **Estimate**     | 3 hours                           |
| **Branch**       | `feature/TASK-034-official-badge` |
| **Dependencies** | TASK-026                          |

**Description:**
Implement Official Badge system cho verified accounts.

**Acceptance Criteria:**

- [ ] `BadgeType` enum (Department, Club, Faculty, Company)
- [ ] Assign Badge command
- [ ] Remove Badge command
- [ ] Badge verification workflow
- [ ] Unit tests written

**Badge Types:**

```csharp
public enum BadgeType
{
    Department,    // 🔵 Blue - Phòng ban chính thức
    Club,          // 🟢 Green - CLB/Đoàn thể
    BoardOfDirectors, // 🟡 Gold - Ban Giám hiệu
    Faculty,       // 🟣 Purple - Giảng viên
    Company        // 🟠 Orange - Doanh nghiệp đối tác
}
````

**Commit Message:**

```
feat(identity): implement official badge system

- Add BadgeType enum
- Add AssignBadgeCommand and handler
- Add RemoveBadgeCommand and handler
- Add badge verification workflow
- Add unit tests

Refs: TASK-034
```

---

### TASK-035: Implement Scoped Permissions

| Property         | Value                                 |
| ---------------- | ------------------------------------- |
| **ID**           | TASK-035                              |
| **Status**       | ⬜ NOT_STARTED                        |
| **Priority**     | 🟡 Medium                             |
| **Estimate**     | 4 hours                               |
| **Branch**       | `feature/TASK-035-scoped-permissions` |
| **Dependencies** | TASK-033                              |

**Description:**
Implement scoped permissions (per-course, per-department).

**Acceptance Criteria:**

- [ ] `PermissionScope` value object
- [ ] Scope types: Module, Course, Department, Category
- [ ] Check scoped permission logic
- [ ] Assign scoped role command
- [ ] Unit tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Domain/
├── Permissions/
│   └── PermissionScope.cs

src/Modules/Identity/UniHub.Identity.Application/
├── Services/
│   └── IPermissionChecker.cs
```

**Example:**

```csharp
// User có quyền moderate chỉ cho course CS101
var scopedPermission = new ScopedPermission(
    PermissionCodes.Learning.DocumentApprove,
    PermissionScopeType.Course,
    courseId: "CS101"
);
```

**Commit Message:**

```
feat(identity): implement scoped permissions

- Add PermissionScope value object
- Add scope types: Module, Course, Department, Category
- Add IPermissionChecker service
- Add scoped permission checking logic
- Add unit tests

Refs: TASK-035
```

---

### TASK-036: Password Reset Flow

| Property         | Value                             |
| ---------------- | --------------------------------- |
| **ID**           | TASK-036                          |
| **Status**       | ⬜ NOT_STARTED                    |
| **Priority**     | 🟡 Medium                         |
| **Estimate**     | 3 hours                           |
| **Branch**       | `feature/TASK-036-password-reset` |
| **Dependencies** | TASK-026                          |

**Description:**
Implement forgot password và reset password flow.

**Acceptance Criteria:**

- [ ] Forgot Password command (send email)
- [ ] Reset Password command
- [ ] Reset token generation
- [ ] Token expiry (1 hour)
- [ ] Unit tests written

**Commit Message:**

```
feat(identity): implement password reset flow

- Add ForgotPasswordCommand and handler
- Add ResetPasswordCommand and handler
- Generate secure reset token
- Configure 1 hour token expiry
- Add unit tests

Refs: TASK-036
```

---

### TASK-037: Identity API Endpoints

| Property         | Value                           |
| ---------------- | ------------------------------- |
| **ID**           | TASK-037                        |
| **Status**       | ⬜ NOT_STARTED                  |
| **Priority**     | 🔴 Critical                     |
| **Estimate**     | 4 hours                         |
| **Branch**       | `feature/TASK-037-identity-api` |
| **Dependencies** | All previous Identity tasks     |

**Description:**
Create API controllers cho Identity module.

**Acceptance Criteria:**

- [ ] `AuthController` (register, login, refresh, logout)
- [ ] `UsersController` (CRUD, profile)
- [ ] `RolesController` (CRUD, permissions)
- [ ] Request/Response DTOs
- [ ] Swagger documentation
- [ ] Integration tests written

**Files to Create:**

```
src/Modules/Identity/UniHub.Identity.Presentation/
├── Controllers/
│   ├── AuthController.cs
│   ├── UsersController.cs
│   └── RolesController.cs
├── DTOs/
│   ├── Requests/
│   └── Responses/
```

**API Endpoints:**

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
GET    /api/v1/users/me
PUT    /api/v1/users/me/profile
POST   /api/v1/users/{id}/roles
DELETE /api/v1/users/{id}/roles/{roleId}

GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/{id}
PUT    /api/v1/roles/{id}
DELETE /api/v1/roles/{id}
POST   /api/v1/roles/{id}/permissions
DELETE /api/v1/roles/{id}/permissions/{permissionId}

GET    /api/v1/permissions
```

**Commit Message:**

```
feat(identity): create API endpoints

- Add AuthController with auth endpoints
- Add UsersController with user management
- Add RolesController with role management
- Add request/response DTOs
- Add Swagger documentation
- Add integration tests

Refs: TASK-037
```

---

## ✅ COMPLETION CHECKLIST

- [x] TASK-026: Design User Aggregate
- [x] TASK-027: Design Role & Permission Entities
- [x] TASK-028: Implement JWT Authentication
- [x] TASK-029: Implement Refresh Token Flow
- [x] TASK-030: Create Registration Flow
- [x] TASK-031: Create Login Flow
- [x] TASK-032: Implement Dynamic Role Management
- [x] TASK-033: Implement Permission Assignment
- [ ] TASK-034: Create Official Account System
- [ ] TASK-035: Implement Scoped Permissions
- [ ] TASK-036: Password Reset Flow
- [ ] TASK-037: Identity API Endpoints

---

## 📝 NOTES

- JWT secret PHẢI lưu trong environment variables, KHÔNG hardcode
- Password hashing dùng BCrypt
- Tất cả endpoints sensitive phải có rate limiting

---

_Last Updated: 2026-02-04_
