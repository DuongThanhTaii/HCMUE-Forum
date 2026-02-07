# 💼 PHASE 7: CAREER HUB MODULE

> **Job Postings, Company Profiles, Applications**

---

## 📋 PHASE INFO

| Property          | Value             |
| ----------------- | ----------------- |
| **Phase**         | 7                 |
| **Name**          | Career Hub Module |
| **Status**        | 🔵 IN_PROGRESS    |
| **Progress**      | 4/12 tasks        |
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
| **Status** | ✅ COMPLETED                         |
| **Branch** | `feature/TASK-075-company-aggregate` |

**Deliverables:**

✅ **Company Aggregate Root** ([Company.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Company.cs)):

- Full lifecycle management: Pending → Verified → Suspended/Inactive
- Register companies with comprehensive validation
- Verify/Suspend/Reactivate/Deactivate state transitions
- Update company profile (restricted when Suspended)
- Manage benefits collection (add/remove, max 20)
- Track job posting count (increment/decrement)
- `CanPostJobs()` guard (only Verified companies)
- `IsActive()` status check

✅ **Value Objects**:

- [ContactInfo.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/ContactInfo.cs): Email (required, validated, normalized), Phone, Address
- [SocialLinks.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/SocialLinks.cs): LinkedIn, Facebook, Twitter, Instagram, YouTube URLs with validation

✅ **Domain Events** (6 events):

- [CompanyRegisteredEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanyRegisteredEvent.cs)
- [CompanyVerifiedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanyVerifiedEvent.cs)
- [CompanyProfileUpdatedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanyProfileUpdatedEvent.cs)
- [CompanySuspendedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanySuspendedEvent.cs)
- [CompanyReactivatedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanyReactivatedEvent.cs)
- [CompanyDeactivatedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Events/CompanyDeactivatedEvent.cs)

✅ **Enumerations**:

- [CompanyStatus.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/CompanyStatus.cs): Pending, Verified, Suspended, Inactive
- [CompanySize.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/CompanySize.cs): Startup (1-10), Small (11-50), Medium (51-200), Large (201-1000), Enterprise (1000+)
- [Industry.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/Industry.cs): 16 industries (Technology, Finance, Healthcare, Education, Retail, Manufacturing, Telecommunications, RealEstate, Logistics, Media, Hospitality, Consulting, Government, Agriculture, Energy, Other)

✅ **Domain Infrastructure**:

- [CompanyId.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/CompanyId.cs): Strongly-typed ID using GuidId pattern
- [CompanyErrors.cs](../../src/Modules/Career/UniHub.Career.Domain/Companies/CompanyErrors.cs): 20+ error definitions

✅ **Unit Tests** ([tests/Modules/Career/UniHub.Career.Domain.Tests/Companies/](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Companies/)):

- [CompanyTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Companies/CompanyTests.cs): 70 tests covering Register factory, Verify, Suspend, Reactivate, Deactivate, UpdateProfile, Benefits, Counters, Guards, Lifecycle flows, ID
- [ContactInfoTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Companies/ContactInfoTests.cs): 14 tests covering value object validation
- [SocialLinksTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Companies/SocialLinksTests.cs): 14 tests covering URL validation
- **Total: 98 tests (96 Company + 2 value objects) - ALL PASSING** ✅

**Key Design Patterns**:

- Factory pattern with `Result<T>` return type
- All validation in factory methods before object construction
- Domain events raised via `AddDomainEvent()`
- Private collections exposed as `IReadOnlyList<T>`
- State machine with business rules enforcement
- Guard methods prevent invalid operations

**Commit**: `bf5ea98` - Build: 0 errors, 0 warnings - Tests: 222/222 passing

---

### TASK-076: Design Application Entity

| Property   | Value                                 |
| ---------- | ------------------------------------- |
| **ID**     | TASK-076                              |
| **Status** | ✅ COMPLETED                          |
| **Branch** | `feature/TASK-076-application-entity` |

**Deliverables:**

✅ **Application Aggregate Root** ([Application.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Application.cs)):

- Full lifecycle management: Pending → Reviewing → Shortlisted → Interviewed → Offered → Accepted/Rejected/Withdrawn
- Submit applications with resume and optional cover letter
- State transitions: MoveToReviewing, Shortlist, MarkAsInterviewed, Offer, Accept, Reject, Withdraw
- Permission checks: Only applicant can withdraw/accept
- Review notes tracking throughout lifecycle
- Guard methods: `IsActive()`, `IsFinal()`, `CanBeReviewed()`

✅ **Value Objects**:

- [Resume.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Resume.cs): FileName, FileUrl, FileSizeBytes (max 10MB), ContentType (PDF/DOC/DOCX only)
- [CoverLetter.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/CoverLetter.cs): Content (50-5000 chars), optional via CreateOptional()

✅ **Domain Events** (6 events):

- [ApplicationSubmittedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationSubmittedEvent.cs)
- [ApplicationStatusChangedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationStatusChangedEvent.cs)
- [ApplicationWithdrawnEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationWithdrawnEvent.cs)
- [ApplicationRejectedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationRejectedEvent.cs)
- [ApplicationOfferedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationOfferedEvent.cs)
- [ApplicationAcceptedEvent.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/Events/ApplicationAcceptedEvent.cs)

✅ **Enumerations**:

- [ApplicationStatus.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/ApplicationStatus.cs): 8 states (Pending, Reviewing, Shortlisted, Interviewed, Offered, Accepted, Rejected, Withdrawn)

✅ **Domain Infrastructure**:

- [ApplicationId.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/ApplicationId.cs): Strongly-typed ID using GuidId pattern
- [ApplicationErrors.cs](../../src/Modules/Career/UniHub.Career.Domain/Applications/ApplicationErrors.cs): 14 error definitions

✅ **Unit Tests** ([tests/Modules/Career/UniHub.Career.Domain.Tests/Applications/](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Applications/)):

- [ApplicationTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Applications/ApplicationTests.cs): 77 tests covering Submit factory, all state transitions, permission checks, guards, lifecycle flows
- [CoverLetterTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Applications/CoverLetterTests.cs): 11 tests covering value object validation
- [ResumeTests.cs](../../tests/Modules/Career/UniHub.Career.Domain.Tests/Applications/ResumeTests.cs): 17 tests covering file validation
- **Total: 105 tests (95 Application + 10 value objects) - ALL PASSING** ✅

**Key Design Patterns**:

- Factory pattern with `Result<T>` return type
- All validation in factory methods before object construction
- Domain events raised via `AddDomainEvent()`
- State machine with 8 distinct application states
- Permission checks for applicant-specific actions
- Guard methods prevent invalid state transitions

**Commit**: `a1d1aad` - Build: 0 errors, 0 warnings - Tests: 317/317 passing

---

### TASK-077: Implement Company Registration

| Property   | Value                                   |
| ---------- | --------------------------------------- |
| **ID**     | TASK-077                                |
| **Status** | ✅ COMPLETED                            |
| **Branch** | `feature/TASK-077-company-registration` |

**Deliverables:**

✅ **Application Layer** ([src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/](../../src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/)):

- [RegisterCompanyCommand.cs](../../src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/RegisterCompanyCommand.cs): CQRS command with 16 properties (name, description, industry, size, contact info, social links)
- [RegisterCompanyCommandHandler.cs](../../src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/RegisterCompanyCommandHandler.cs): Command handler with domain validation and repository persistence
- [RegisterCompanyCommandValidator.cs](../../src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/RegisterCompanyCommandValidator.cs): FluentValidation rules for all input fields
- [CompanyResponse.cs](../../src/Modules/Career/UniHub.Career.Application/Commands/Companies/RegisterCompany/CompanyResponse.cs): DTO for API responses

✅ **Repository Interface** ([ICompanyRepository.cs](../../src/Modules/Career/UniHub.Career.Application/Abstractions/ICompanyRepository.cs)):

- AddAsync: Persist new companies
- GetByIdAsync: Retrieve by CompanyId
- GetByNameAsync: Retrieve by name
- IsNameUniqueAsync: Check name availability
- UpdateAsync: Update existing companies
- GetAllAsync: Paginated company list
- GetByStatusAsync: Filter by status

✅ **Unit Tests** ([tests/Modules/Career/UniHub.Career.Application.Tests/](../../tests/Modules/Career/UniHub.Career.Application.Tests/)):

- [RegisterCompanyCommandHandlerTests.cs](../../tests/Modules/Career/UniHub.Career.Application.Tests/Commands/Companies/RegisterCompanyCommandHandlerTests.cs): 7 tests covering:
  - Valid registration with full data
  - Valid registration with minimal data
  - Duplicate name validation
  - Invalid email validation
  - Invalid website URL validation
  - Invalid social link validation
  - Response DTO mapping verification
- Uses NSubstitute for repository mocking
- **Total: 7 tests - ALL PASSING** ✅

**Key Features**:

- Company name uniqueness check before registration
- Comprehensive validation via FluentValidation
- Domain validation via value objects (ContactInfo, SocialLinks)
- Automatic status set to Pending after registration
- Domain events raised automatically (CompanyRegisteredEvent)
- Clean separation: Application layer orchestrates domain logic

**Commit**: `f3c0492` - Build: 0 errors, 0 warnings - Tests: 324/324 passing (317 domain + 7 application)

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
- [x] TASK-075: Design Company Aggregate
- [x] TASK-076: Design Application Entity
- [x] TASK-077: Implement Company Registration
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
