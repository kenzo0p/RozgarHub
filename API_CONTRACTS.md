# API Contracts — RozgarHub

Complete API documentation with request/response schemas for all 44 endpoints.

**Base URL**: `http://localhost:8000/api/v1`

---

## Table of Contents

- [Response Format](#response-format)
- [Error Responses](#error-responses)
- [Authentication](#authentication)
- [Users](#users)
- [Jobs](#jobs)
- [Companies](#companies)
- [Applications](#applications)
- [Notifications](#notifications)
- [Saved Jobs](#saved-jobs)
- [Analytics](#analytics)
- [Recommendations](#recommendations)
- [Health](#health)

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Error Responses

| Status Code | Error Type | Description |
|-------------|-----------|-------------|
| `400` | Bad Request | Invalid input (validation failed) |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but not authorized (wrong role) |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (e.g., already applied) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

### Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per 15 minutes per IP
- Response header: `Retry-After: <seconds>`

---

## Authentication

Authentication uses httpOnly cookies with dual tokens (access + refresh).

### POST `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "fullname": "Rahul Kumar",
  "email": "rahul@example.com",
  "password": "SecurePass123",
  "username": "rahulk",
  "role": "employee"
}
```

**Validation:**
- `fullname`: 2-50 characters
- `email`: valid email format, unique
- `password`: 6+ characters
- `username`: 3-30 characters, alphanumeric + underscores, unique
- `role`: `"employee"` or `"employer"`

**Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "664a...",
      "fullname": "Rahul Kumar",
      "email": "rahul@example.com",
      "username": "rahulk",
      "role": "employee",
      "profile": { "bio": "", "skills": [], "resume": "" }
    }
  }
}
```

**Sets Cookies:** `rozgarhub_access` (15min), `rozgarhub_refresh` (7d)

---

### POST `/auth/login`

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "SecurePass123"
}
```

**Success (200):** Same shape as register response + cookies set.

**Errors:** `401` — Invalid credentials

---

### POST `/auth/logout`

Revokes the current refresh token.

**Auth:** Cookie-based (refresh token)

**Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Clears Cookies:** `rozgarhub_access`, `rozgarhub_refresh`

---

### POST `/auth/logout-all`

Revokes ALL refresh tokens for the current user (all devices).

**Auth:** Required (access token cookie)

**Success (200):**
```json
{
  "success": true,
  "message": "All sessions revoked"
}
```

---

### POST `/auth/refresh`

Exchange refresh token for a new access + refresh token pair.

**Auth:** Cookie-based (refresh token only)

**Success (200):**
```json
{
  "success": true,
  "message": "Token refreshed"
}
```

**Sets new cookies:** Rotated `rozgarhub_access` + `rozgarhub_refresh`

**Errors:**
- `401` — No refresh token, expired, or revoked
- `401` + ALL sessions revoked — Reuse of revoked token (theft detected)

---

### POST `/auth/forgot-password`

Generate a password reset token (sent via email in production).

**Request Body:**
```json
{
  "email": "rahul@example.com"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent.",
  "data": {}
}
```

> **Note:** The response is identical whether or not the email exists (prevents
> account enumeration). The token is logged server-side (emailed in a real
> deployment) and is only included in the response body when
> `NODE_ENV=development`, for manual testing.

---

### POST `/auth/reset-password`

Reset password using the token from forgot-password.

**Request Body:**
```json
{
  "token": "a1b2c3d4...",
  "password": "NewSecurePass456"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:** `400` — Invalid or expired token

---

### GET `/auth/sessions`

List all active sessions (devices) for the current user.

**Auth:** Required

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "664b...",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-01-22T10:30:00Z"
    }
  ]
}
```

---

## Users

### GET `/user/:id/profile`

Get a user's public profile.

**Auth:** Required

**Success (200):**
```json
{
  "success": true,
  "data": {
    "_id": "664a...",
    "fullname": "Rahul Kumar",
    "email": "rahul@example.com",
    "role": "employee",
    "profile": {
      "bio": "Experienced plumber",
      "skills": ["plumbing", "pipe fitting"],
      "resume": "https://cloudinary.com/...",
      "profilePhoto": "https://cloudinary.com/..."
    }
  }
}
```

### PATCH `/user/profile/update`

Update the authenticated user's profile.

**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `fullname` (string, optional)
- `bio` (string, optional)
- `skills` (comma-separated string, optional)
- `file` (image/pdf, optional) — profile photo or resume

---

## Jobs

### POST `/job`

Create a new job posting.

**Auth:** Employer only

**Request Body:**
```json
{
  "title": "Plumber Needed",
  "description": "Experienced plumber for residential work",
  "salary": 8,
  "location": "Mumbai",
  "jobType": "Full-Time",
  "position": 3,
  "companyId": "664c...",
  "requirements": ["plumbing", "pipe fitting"]
}
```

**Headers (optional):**
- `Idempotency-Key: <uuid>` — Prevents duplicate job creation

**Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Job posted",
  "data": { "job": { ... } }
}
```

### GET `/job`

Search and filter jobs (offset-based pagination, cached).

**Query Parameters:**
- `keyword` (string) — Search title, description, location
- `location` (string) — Filter by location
- `jobType` (string) — Filter by type (Full-Time, Part-Time, etc.)
- `salaryMin` / `salaryMax` (number) — Salary range
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 50)
- `sortBy` (string) — `createdAt`, `salary`
- `sortOrder` (`asc` | `desc`)

**Success (200):** Paginated response with jobs array.

### GET `/job/cursor`

Cursor-based pagination for infinite scroll.

**Query Parameters:**
- `cursor` (string) — Last item's `_id` from previous page
- `limit` (number, default: 10)
- `keyword`, `location`, `jobType` — Same filters as above

**Success (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "nextCursor": "664d...",
    "hasMore": true,
    "limit": 10
  }
}
```

### GET `/job/admin`

Get jobs created by the authenticated employer.

**Auth:** Employer only

### GET `/job/:id`

Get job details plus viewer-specific state. Not cached — the response
depends on who is asking.

**Auth:** Required

**Success (200):**
```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "job": { "_id": "...", "title": "...", "company": { "...": "..." } },
    "totalApplications": 12,
    "isApplied": false
  }
}
```

> **Note:** The raw applications list is never returned here — applicant data
> is only visible to the job owner via `GET /application/:id/applicants`.

---

## Companies

### POST `/company`

**Auth:** Employer only

**Request Body:** `{ "companyName": "BuildCo" }`

### GET `/company`

List all companies for the authenticated employer.

**Auth:** Employer only

### GET `/company/:id`

Get company details.

**Auth:** Required

### PUT `/company/:id`

Update company (name, description, website, location, logo).

**Auth:** Employer only (owner)  
**Content-Type:** `multipart/form-data`

---

## Applications

### POST `/application/apply/:jobId`

Apply to a job.

**Auth:** Employee only  
**Headers (optional):** `Idempotency-Key: <uuid>`

**Success (201):**
```json
{
  "success": true,
  "message": "Application submitted"
}
```

**Errors:**
- `409` — Already applied
- `404` — Job not found

**Side Effects (via Event Bus):**
- Notification created for employer
- Job cache invalidated

### GET `/application`

Get the authenticated user's applications.

**Auth:** Employee only

### GET `/application/:jobId/applicants`

Get all applicants for a specific job.

**Auth:** Employer only (job owner)

### PATCH `/application/:applicationId/status`

Accept or reject an application.

**Auth:** Employer only

**Request Body:**
```json
{
  "status": "accepted"
}
```

Valid statuses: `"accepted"`, `"rejected"`

**Side Effects:**
- Notification created for applicant
- Analytics cache invalidated

---

## Notifications

### GET `/notifications`

List notifications for the authenticated user.

**Auth:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

### GET `/notifications/unread-count`

Get the number of unread notifications (for badge display).

**Auth:** Required

**Success (200):**
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

### PATCH `/notifications/read-all`

Mark all notifications as read.

**Auth:** Required

### PATCH `/notifications/:id/read`

Mark a specific notification as read.

**Auth:** Required

### DELETE `/notifications/:id`

Delete a specific notification.

**Auth:** Required

---

## Saved Jobs

### POST `/saved-jobs/save/:jobId`

Bookmark a job for later.

**Auth:** Employee only  
**Headers (optional):** `Idempotency-Key: <uuid>`

**Errors:** `409` — Already saved

### DELETE `/saved-jobs/unsave/:jobId`

Remove a bookmarked job.

**Auth:** Employee only

### GET `/saved-jobs`

Get all saved jobs (populated with full job data).

**Auth:** Employee only

### GET `/saved-jobs/ids`

Get just the IDs of saved jobs (optimized for frontend — used to show bookmark state on job cards).

**Auth:** Employee only

**Success (200):**
```json
{
  "success": true,
  "data": {
    "jobIds": ["664a...", "664b...", "664c..."]
  }
}
```

### GET `/saved-jobs/check/:jobId`

Check if a specific job is saved.

**Auth:** Employee only

**Success (200):**
```json
{
  "success": true,
  "data": { "isSaved": true }
}
```

---

## Analytics

### GET `/analytics/platform`

Platform-wide statistics.

**Auth:** Admin/Employer

**Success (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 1250,
    "totalUsers": 8500,
    "totalApplications": 32000,
    "jobsByType": [
      { "_id": "Full-Time", "count": 800 },
      { "_id": "Part-Time", "count": 450 }
    ]
  }
}
```

### GET `/analytics/trending`

Trending jobs (most applied to in the last 30 days).

### GET `/analytics/employer`

Employer-specific metrics (their jobs, application counts, acceptance rates).

**Auth:** Employer only

### GET `/analytics/skills`

Skill demand analysis (most requested skills across all jobs).

---

## Recommendations

### GET `/recommendations`

Personalized job recommendations based on user profile.

**Auth:** Employee only

**Query Parameters:**
- `limit` (number, default: 10)

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "job": { "_id": "664d...", "title": "Plumber", ... },
      "score": 0.85,
      "matchReason": "Skills match: plumbing, pipe fitting"
    }
  ]
}
```

---

## Health

### GET `/health`

Liveness probe — is the process running?

**Auth:** None

**Success (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### GET `/health/ready`

Readiness probe — can the app serve traffic?

**Auth:** None

**Success (200):**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "mongodb": { "status": "healthy", "latency": 2 },
    "redis": { "status": "healthy", "latency": 1 }
  },
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": "85MB",
      "heapUsed": "45MB",
      "heapTotal": "60MB"
    },
    "nodeVersion": "v20.11.0",
    "pid": 1234
  }
}
```

**Failure (503):**
```json
{
  "status": "not_ready",
  "checks": {
    "mongodb": { "status": "unhealthy", "details": "connection refused" },
    "redis": { "status": "not_configured" }
  }
}
```

---

## Authentication Details

### Cookie Names

| Cookie | Purpose | MaxAge | Path |
|--------|---------|--------|------|
| `rozgarhub_access` | Access token (JWT) | 15 minutes | `/` |
| `rozgarhub_refresh` | Refresh token | 7 days | `/api/v1/auth` |

### Cookie Flags

All cookies are set with:
- `httpOnly: true` — Not accessible via JavaScript
- `secure: true` — Only sent over HTTPS (production)
- `sameSite: strict` — Not sent in cross-site requests

### Headers

| Header | Purpose | Example |
|--------|---------|---------|
| `X-Request-ID` | Request correlation | `550e8400-e29b-41d4-a716-446655440000` |
| `Idempotency-Key` | Prevent duplicate mutations | `my-unique-key-123` |
| `X-RateLimit-Remaining` | Remaining requests | `95` |
| `Retry-After` | Seconds until rate limit resets | `120` |

---

*Last updated: June 2026*
