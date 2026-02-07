# 💼 PHASE 7: CAREER HUB MODULE

> **Job Postings, Company Profiles, Applications**

---

## 📋 PHASE INFO

| Property          | Value             |
| ----------------- | ----------------- |
| **Phase**         | 7                 |
| **Name**          | Career Hub Module |
| **Status**        | 🔵 IN_PROGRESS    |
| **Progress**      | 1/12 tasks        |
| **Est. Duration** | 2 weeks           |
| **Dependencies**  | Phase 3           |

---

## 📝 TASKS

### TASK-074: Design JobPosting Aggregate

| Property   | Value                            |
| ---------- | -------------------------------- |
| **ID**     | TASK-074                         |
| **Status** | ✅ COMPLETED                     |
| **Branch** | `feature/TASK-074-job-aggregate` |

**Deliverables:**

✅ **JobPosting Aggregate Root** ([JobPosting.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobPosting.cs)):

- Full lifecycle management: Draft → Published → Paused → Closed/Expired
- Create job postings with comprehensive validation
- Publish/pause/close/expire state transitions
- Update details (only when Draft/Paused)
- Manage requirements (skills) collection with duplicate detection
- Manage tags collection with normalization
- Track view count and application count
- `IsAcceptingApplications()` guard
- `CheckAndExpire()` auto-expiration logic

✅ **Value Objects**:

- [SalaryRange.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/SalaryRange.cs): Min/max amounts, 7 supported currencies (VND, USD, EUR, GBP, JPY, SGD, AUD), 5 periods (hour, day, week, month, year)
- [WorkLocation.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/WorkLocation.cs): City/district/address, remote flag, formatted display
- [JobRequirement.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobRequirement.cs): Skill name, required/preferred flag

✅ **Domain Events** (5 events):

- [JobPostingCreatedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/Events/JobPostingCreatedEvent.cs)
- [JobPostingPublishedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/Events/JobPostingPublishedEvent.cs)
- [JobPostingUpdatedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/Events/JobPostingUpdatedEvent.cs)
- [JobPostingClosedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/Events/JobPostingClosedEvent.cs)
- [JobPostingExpiredEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/Events/JobPostingExpiredEvent.cs)

✅ **Enumerations**:

- [JobType.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobType.cs): FullTime, PartTime, Internship, Freelance, Remote, Temporary
- [JobPostingStatus.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobPostingStatus.cs): Draft, Published, Paused, Closed, Expired
- [ExperienceLevel.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/ExperienceLevel.cs): Entry, Junior, Mid, Senior, Lead, Executive

✅ **Domain Infrastructure**:

- [JobPostingId.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobPostingId.cs): Strongly-typed ID using GuidId pattern
- [JobPostingErrors.cs](../../src/Modules/Career/UniHub.Career.Domain/JobPostings/JobPostingErrors.cs): 20+ error definitions

✅ **Unit Tests** ([tests/Modules/Career/UniHub.Career.Domain.Tests/](../../tests/Modules/Career/UniHub.Career.Domain.Tests/)):

- [JobPostingTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/JobPostings/JobPostingTests.cs): 84 tests covering aggregate lifecycle, state transitions, validation, requirements, tags
- [SalaryRangeTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/JobPostings/SalaryRangeTests.cs): 18 tests covering value object validation
- [WorkLocationTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/JobPostings/WorkLocationTests.cs): 14 tests covering location logic
- [JobRequirementTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/JobPostings/JobRequirementTests.cs): 10 tests covering skill requirements
- **Total: 126 tests - ALL PASSING** ✅

**Key Design Patterns**:

- Factory pattern with `Result<T>` return type
- All validation in factory methods before object construction
- Domain events raised via `AddDomainEvent()`
- Private collections exposed as `IReadOnlyList<T>`
- Idempotent operations where applicable
- Guard methods prevent invalid state transitions

**Commit**: `a224a25` - Build: 0 errors, 0 warnings

---

### TASK-075: Design Company Aggregate

| Property   | Value                                |
| ---------- | ------------------------------------ |
| **ID**     | TASK-075                             |
| **Status** | ⬜ NOT_STARTED                       |
| **Branch** | `feature/TASK-075-company-aggregate` |

---

### TASK-076: Design Application Entity

| Property   | Value                                 |
| ---------- | ------------------------------------- |
| **ID**     | TASK-076                              |
| **Status** | ⬜ NOT_STARTED                        |
| **Branch** | `feature/TASK-076-application-entity` |

---

### TASK-077: Implement Company Registration

| Property   | Value                                   |
| ---------- | --------------------------------------- |
| **ID**     | TASK-077                                |
| **Status** | ⬜ NOT_STARTED                          |
| **Branch** | `feature/TASK-077-company-registration` |

---

### TASK-078: Implement Job Posting CRUD

| Property   | Value                       |
| ---------- | --------------------------- |
| **ID**     | TASK-078                    |
| **Status** | ⬜ NOT_STARTED              |
| **Branch** | `feature/TASK-078-job-crud` |

---

### TASK-079: Implement Job Search

| Property   | Value                         |
| ---------- | ----------------------------- |
| **ID**     | TASK-079                      |
| **Status** | ⬜ NOT_STARTED                |
| **Branch** | `feature/TASK-079-job-search` |

---

### TASK-080: Implement Application Flow

| Property   | Value                               |
| ---------- | ----------------------------------- |
| **ID**     | TASK-080                            |
| **Status** | ⬜ NOT_STARTED                      |
| **Branch** | `feature/TASK-080-application-flow` |

---

### TASK-081: Implement Saved Jobs

| Property   | Value                         |
| ---------- | ----------------------------- |
| **ID**     | TASK-081                      |
| **Status** | ⬜ NOT_STARTED                |
| **Branch** | `feature/TASK-081-saved-jobs` |

---

### TASK-082: Implement Company Dashboard

| Property   | Value                                |
| ---------- | ------------------------------------ |
| **ID**     | TASK-082                             |
| **Status** | ⬜ NOT_STARTED                       |
| **Branch** | `feature/TASK-082-company-dashboard` |

---

### TASK-083: Implement Job Matching

| Property   | Value                           |
| ---------- | ------------------------------- |
| **ID**     | TASK-083                        |
| **Status** | ⬜ NOT_STARTED                  |
| **Branch** | `feature/TASK-083-job-matching` |

---

### TASK-084: Implement Recruiter Role

| Property   | Value                             |
| ---------- | --------------------------------- |
| **ID**     | TASK-084                          |
| **Status** | ⬜ NOT_STARTED                    |
| **Branch** | `feature/TASK-084-recruiter-role` |

---

### TASK-085: Career API Endpoints

| Property   | Value                         |
| ---------- | ----------------------------- |
| **ID**     | TASK-085                      |
| **Status** | ⬜ NOT_STARTED                |
| **Branch** | `feature/TASK-085-career-api` |

**API Endpoints:**

```
GET    /api/v1/jobs
GET    /api/v1/jobs/{id}
POST   /api/v1/jobs
PUT    /api/v1/jobs/{id}
DELETE /api/v1/jobs/{id}
POST   /api/v1/jobs/{id}/apply
POST   /api/v1/jobs/{id}/save
DELETE /api/v1/jobs/{id}/save
GET    /api/v1/jobs/saved

GET    /api/v1/companies
GET    /api/v1/companies/{id}
POST   /api/v1/companies
PUT    /api/v1/companies/{id}
GET    /api/v1/companies/{id}/jobs
GET    /api/v1/companies/{id}/applications

GET    /api/v1/applications
GET    /api/v1/applications/{id}
PUT    /api/v1/applications/{id}/status
```

---

## ✅ COMPLETION CHECKLIST

- [x] TASK-074: Design JobPosting Aggregate
- [ ] TASK-075: Design Company Aggregate
- [ ] TASK-076: Design Application Entity
- [ ] TASK-077: Implement Company Registration
- [ ] TASK-078: Implement Job Posting CRUD
- [ ] TASK-079: Implement Job Search
- [ ] TASK-080: Implement Application Flow
- [ ] TASK-081: Implement Saved Jobs
- [ ] TASK-082: Implement Company Dashboard
- [ ] TASK-083: Implement Job Matching
- [ ] TASK-084: Implement Recruiter Role
- [ ] TASK-085: Career API Endpoints

---

_Last Updated: 2026-02-07_
