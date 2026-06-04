# Contributing to RozgarHub

Thank you for your interest in contributing to RozgarHub! This guide will help you get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Adding a New Feature](#adding-a-new-feature)
- [Adding a New API Endpoint](#adding-a-new-api-endpoint)

---

## Development Setup

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Redis 7+ (optional)
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/kenzo0p/RozgarHub.git
cd RozgarHub

# Backend setup
cd backend
cp .env.example .env    # Fill in your MongoDB URI, JWT secret, etc.
npm install
npm run dev             # http://localhost:8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Verify Setup

```bash
# Backend: TypeScript type check
cd backend && npx tsc --noEmit

# Frontend: Production build
cd frontend && npx vite build
```

---

## Project Architecture

```
backend/src/
├── config/          # Environment, database, Redis, CORS configuration
├── controllers/     # HTTP layer — parse request, call service, send response
├── services/        # Business logic — the "brain" of the application
├── repositories/    # Data access — all MongoDB queries live here
├── models/          # Mongoose schemas — database structure
├── middlewares/     # Request pipeline — auth, validation, audit, cache
├── routes/          # Express routers — URL → controller mapping
├── events/          # Event bus — decoupled side effects
├── validators/      # Zod schemas — runtime input validation
├── types/           # TypeScript type definitions
└── utils/           # Shared utilities — logger, cache, pagination, retry
```

### Key Principle: Layer Separation

```
Route → Controller → Service → Repository → Model
```

- **Controllers** never touch the database directly
- **Services** never access `req` or `res`
- **Repositories** never contain business logic
- Each layer only depends on the one below it

---

## Branch Naming

Use descriptive branch names with the following prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/job-search-filters` |
| `fix/` | Bug fix | `fix/login-cookie-expiry` |
| `refactor/` | Code improvement | `refactor/auth-service-cleanup` |
| `docs/` | Documentation | `docs/api-contracts` |
| `chore/` | Tooling, CI, deps | `chore/upgrade-mongoose` |
| `test/` | Adding tests | `test/auth-service-unit` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Examples

```
feat(auth): add password reset flow with email token
fix(jobs): prevent duplicate applications via compound index
refactor(services): extract notification logic to event handler
docs(readme): add architecture diagram and API reference
chore(ci): add Docker build validation step
test(auth): add unit tests for token rotation
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, CI, or tooling changes |
| `perf` | Performance improvement |
| `style` | Code formatting (no logic change) |

---

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**, following the code style guide below.

3. **Verify before pushing**:
   ```bash
   # Backend
   cd backend && npx tsc --noEmit

   # Frontend
   cd frontend && npx vite build
   ```

4. **Push and create a PR** against `main`.

5. **PR description should include**:
   - What changed and why
   - Screenshots (for UI changes)
   - How to test the changes
   - Any breaking changes

6. **CI must pass** before merging.

---

## Code Style

### TypeScript (Backend)

- **Strict mode** enabled — no `any` types unless absolutely necessary
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer `const` over `let`, never use `var`
- Error handling: throw typed errors (`NotFoundError`, `UnauthorizedError`, etc.)
- Async functions: always use `try/catch` or `asyncHandler` wrapper

### React (Frontend)

- **Functional components** only (no class components except ErrorBoundary)
- Use **custom hooks** for reusable logic (e.g., `useSavedJobs`, `useTheme`)
- Use **semantic Tailwind classes** (`text-foreground`, `bg-background`) for dark mode compatibility
- Avoid inline styles — use Tailwind utility classes

### General

- Max line length: 100 characters (Prettier enforced)
- Single quotes, trailing commas, semicolons
- Write comments for **why**, not **what**

---

## Adding a New Feature

### Backend Checklist

1. **Model** (`src/models/`) — Define the Mongoose schema
2. **Types** (`src/types/models.ts`) — Add TypeScript interface
3. **Repository** (`src/repositories/`) — Data access methods
4. **Service** (`src/services/`) — Business logic
5. **Controller** (`src/controllers/`) — HTTP handler
6. **Validator** (`src/validators/`) — Zod schema for input
7. **Routes** (`src/routes/v1/`) — Wire endpoints
8. **Router Index** (`src/routes/v1/index.ts`) — Register route group
9. **Feature Flag** (optional) — Add to `src/utils/featureFlags.ts`

### Frontend Checklist

1. **Hook** (`src/hooks/`) — API calls + state management
2. **Component** (`src/components/`) — UI implementation
3. **Route** (`src/App.jsx`) — Add to router
4. **Loading State** — Use `Skeleton` components
5. **Empty State** — Use `EmptyState` component
6. **Error Handling** — Wrap in `ErrorBoundary`
7. **Dark Mode** — Use semantic colors (`text-foreground`, not `text-gray-900`)

---

## Adding a New API Endpoint

Step-by-step example for adding `GET /api/v1/job/trending`:

### 1. Service (`src/services/job.service.ts`)

```typescript
async getTrendingJobs(limit: number = 10) {
  return await jobRepository.findTrending(limit);
}
```

### 2. Controller (`src/controllers/job.controller.ts`)

```typescript
export const getTrending = asyncHandler(async (req, res) => {
  const jobs = await jobService.getTrendingJobs();
  res.json(ApiResponse.success(jobs, 'Trending jobs'));
});
```

### 3. Route (`src/routes/v1/job.routes.ts`)

```typescript
router.get('/trending', cacheMiddleware(300), getTrending);
```

### 4. Verify

```bash
npx tsc --noEmit   # Must pass
```

---

## Questions?

If something is unclear or you need help, open a GitHub Issue with the `question` label.
