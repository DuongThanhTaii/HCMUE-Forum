# Career API for Frontend (`ApiResponse` Envelope)

## Base URL
- `api/v1/jobs`
- `api/v1/companies`
- `api/v1/applications`
- `api/v1/recruiters`

## Envelope
```json
{
  "success": true,
  "data": {},
  "message": "optional success message",
  "error": null
}
```

Error sample:
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": "Human readable message"
}
```

## Jobs

### `GET /api/v1/jobs`
- **Auth**: optional
- **Query**: `companyId`, `jobType`, `experienceLevel`, `status`, `city`, `isRemote`, `searchTerm`, `page`, `pageSize`
- **200**: `ApiResponse<JobPostingListResponse>`

### `GET /api/v1/jobs/search`
- **Auth**: optional
- **Query**: `keywords`, `companyId`, `jobType`, `experienceLevel`, `city`, `isRemote`, `minSalary`, `maxSalary`, `currency`, `skills`, `tags`, `postedAfter`, `postedBefore`, `sortBy`, `page`, `pageSize`
- **200**: `ApiResponse<JobPostingSearchResponse>`

### `GET /api/v1/jobs/{id}`
- **Auth**: optional
- **200**: `ApiResponse<JobPostingResponse>`
- **404**: failure envelope

### `POST /api/v1/jobs`
- **Auth**: required
- **201**: `ApiResponse<JobPostingResponse>`

### `PUT /api/v1/jobs/{id}`
- **Auth**: required
- **200**: `ApiResponse<JobPostingResponse>`
- **400**: failure envelope (`ID mismatch` or validation)

### `POST /api/v1/jobs/{id}/publish`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Job posting published successfully`

### `POST /api/v1/jobs/{id}/close`
- **Auth**: required
- **Body**: `CloseJobPostingCommand` (must include matching `jobPostingId`)
- **200**: `ApiResponse<null>` with message `Job posting closed successfully`

### `POST /api/v1/jobs/{id}/save`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Job saved successfully`

### `DELETE /api/v1/jobs/{id}/save`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Job unsaved successfully`

### `GET /api/v1/jobs/saved`
- **Auth**: required
- **Query**: `userId` (required), `page`, `pageSize`
- **200**: `ApiResponse<SavedJobsResponse>`

### `GET /api/v1/jobs/{id}/saved`
- **Auth**: required
- **Query**: `userId` (required)
- **200**: `ApiResponse<{ isSaved: boolean }>`

## Companies

### `POST /api/v1/companies`
- **Auth**: required
- **201**: `ApiResponse<CompanyResponse>`

### `GET /api/v1/companies/{id}`
- **Auth**: optional
- **200**: `ApiResponse<CompanyDetailResponse>`
- **404**: failure envelope

### `GET /api/v1/companies/{id}/statistics`
- **Auth**: required
- **200**: `ApiResponse<CompanyStatisticsResponse>`
- **404**: failure envelope

### `GET /api/v1/companies/{id}/jobs`
- **Auth**: optional
- **200**: `ApiResponse<JobPostingListResponse>`

### `GET /api/v1/companies/{id}/applications`
- **Auth**: required
- **Query**: `page`, `pageSize`
- **200**: `ApiResponse<RecentApplicationsResponse>`
- **404**: failure envelope

## Applications

### `POST /api/v1/applications`
- **Auth**: required
- **201**: `ApiResponse<ApplicationResponse>`

### `GET /api/v1/applications`
- **Auth**: required
- **200**: `ApiResponse<ApplicationListResponse>`

### `GET /api/v1/applications/{id}`
- **Auth**: required
- **200**: `ApiResponse<ApplicationResponse>`
- **404**: failure envelope

### `PUT /api/v1/applications/{id}/status`
- **Auth**: required
- **Body**: `UpdateApplicationStatusCommand` (must include matching `applicationId`)
- **200**: `ApiResponse<null>` with message `Application status updated successfully`

### `POST /api/v1/applications/{id}/withdraw`
- **Auth**: required
- **Body**: `WithdrawApplicationCommand` (must include matching `applicationId`)
- **200**: `ApiResponse<null>` with message `Application withdrawn successfully`

### `POST /api/v1/applications/{id}/accept`
- **Auth**: required
- **Body**: `AcceptApplicationCommand` (must include matching `applicationId`)
- **200**: `ApiResponse<null>` with message `Job offer accepted successfully`

### `POST /api/v1/applications/{id}/reject`
- **Auth**: required
- **Body**: `RejectApplicationCommand` (must include matching `applicationId`)
- **200**: `ApiResponse<null>` with message `Application rejected successfully`

### `GET /api/v1/applications/jobs/{jobId}`
- **Auth**: required
- **Query**: `page`, `pageSize`
- **200**: `ApiResponse<ApplicationListResponse>`

## Recruiters

### `POST /api/v1/recruiters`
- **Auth**: required
- **201**: `ApiResponse<RecruiterResponse>`

### `GET /api/v1/recruiters/companies/{companyId}`
- **Auth**: required
- **Query**: `activeOnly` (optional)
- **200**: `ApiResponse<RecruitersResponse>`

### `GET /api/v1/recruiters/check?userId=&companyId=`
- **Auth**: required
- **200**: `ApiResponse<IsRecruiterResponse>`

### `PUT /api/v1/recruiters/{id}/permissions`
- **Auth**: required
- **Body**: `UpdateRecruiterPermissionsCommand` (must include matching `recruiterId`)
- **200**: `ApiResponse<null>` with message `Recruiter permissions updated successfully`

### `POST /api/v1/recruiters/{id}/deactivate`
- **Auth**: required
- **Body**: `DeactivateRecruiterCommand` (must include matching `recruiterId`)
- **200**: `ApiResponse<null>` with message `Recruiter deactivated successfully`

### `POST /api/v1/recruiters/{id}/reactivate`
- **Auth**: required
- **Body**: `ReactivateRecruiterCommand` (must include matching `recruiterId`)
- **200**: `ApiResponse<null>` with message `Recruiter reactivated successfully`
