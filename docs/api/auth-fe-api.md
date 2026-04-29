# Auth API for Frontend (`ApiResponse` Envelope)

## Base URL
- `api/v1/auth`

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
  "error": "Invalid email or password"
}
```

## Endpoints

### `POST /api/v1/auth/register`
- **Auth**: anonymous
- **201**: `ApiResponse<RegisterResponse>` with message `User registered successfully`
- **400**: failure envelope

### `POST /api/v1/auth/login`
- **Auth**: anonymous
- **200**: `ApiResponse<LoginResponse>`
- **401**: failure envelope

### `POST /api/v1/auth/refresh`
- **Auth**: anonymous
- **200**: `ApiResponse<LoginResponse>`
- **401**: failure envelope

### `POST /api/v1/auth/logout`
- **Auth**: required
- **200**: `ApiResponse<null>` with message `Logged out successfully`

### `POST /api/v1/auth/forgot-password`
- **Auth**: anonymous
- **200**: always success envelope
  - if email unknown: `data.message = "If the email exists, a reset link will be sent"`
  - if email known (dev/testing): `data = { token, expiresAt }`, `message = "Password reset token generated"`

### `POST /api/v1/auth/reset-password`
- **Auth**: anonymous
- **200**: `ApiResponse<null>` with message `Password reset successfully`
- **400**: failure envelope
