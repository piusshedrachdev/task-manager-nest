# Task Manager API

A secure task-manager backend built with NestJS, TypeORM and PostgreSQL. Users
register and log in with JWT authentication, then manage their own projects and
the tasks inside them.

The Week 8 work hardened validation, introduced a single error contract,
completed the Swagger/OpenAPI documentation, validated the environment and added
a runnable Postman collection.

## Stack

- NestJS 12 (ESM, Express platform)
- TypeORM 1.x with PostgreSQL (`pg`)
- `class-validator` / `class-transformer` DTO validation
- `jsonwebtoken` and `bcrypt` for authentication
- `@nestjs/swagger` for OpenAPI 3 documentation
- `zod` for environment validation
- Vitest + Supertest for unit and e2e tests

## Features

- JWT bearer authentication; passwords hashed with bcrypt
- Every project and task query is scoped to the authenticated user
- DTO validation with trimming, length limits, password complexity and enum checks
- Unknown request properties are rejected, not silently stripped
- Route `:id` parameters validated before reaching the database
- Custom exception hierarchy with stable machine-readable error codes
- One standard JSON envelope for validation, HTTP, database and unknown errors
- Swagger UI at `/api` and an exportable OpenAPI document
- Validated environment variables with an example file
- Postman collection covering happy paths, auth and error cases

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### Setup

```bash
npm install
cp .env.example .env      # then fill in the real values
npm run migration:run     # creates the schema
npm run start:dev         # http://localhost:3000, Swagger at /api
```

`npm run migration:run` requires a reachable database and a valid `.env`,
because both the app and the TypeORM CLI validate the environment on startup.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development`, `test` or `production` |
| `PORT` | no | `3000` | HTTP port |
| `DB_HOST` | no | `localhost` | PostgreSQL host |
| `DB_PORT` | no | `5432` | PostgreSQL port |
| `DB_USERNAME` | no | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | yes | — | PostgreSQL password |
| `DB_DATABASE` | no | `tasks_db` | Database name |
| `JWT_SECRET` | yes | — | Signing secret, at least 16 characters |
| `SWAGGER_ENABLED` | no | `true` outside production | `true`/`false`; Swagger is off in production unless set |
| `DATA_ROOT_DIR`, `TASK_FILE_NAME` | no | — | Only used by the unused file-storage module in `src/db` |

Configuration is validated once at startup by `src/config/env.validation.ts`.
A missing `DB_PASSWORD` or a short `JWT_SECRET` stops the process with a clear
message instead of failing later at runtime. `.env` is git-ignored;
`.env.example` lists every variable with placeholders.

### Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Watch mode |
| `npm run start:prod` | Run the compiled build |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Type-aware oxlint over `src` and `test` |
| `npm run format` | Prettier |
| `npm test` | Unit tests |
| `npm run test:e2e` | API e2e tests |
| `npm run test:cov` | Unit tests with coverage |
| `npm run migration:run` | Apply migrations |
| `npm run migration:generate -- src/migrations/<Name>` | Generate a migration |
| `npm run migration:revert` | Revert the last migration |
| `npm run openapi:export` | Build and write `docs/openapi.json` |

`npm run openapi:export` boots the app to read the route metadata, so it needs
the same working database configuration as `npm run start`.

## API reference

Base URL: `http://localhost:3000`. Protected routes expect
`Authorization: Bearer <token>`.

| Method | Path | Auth | Success |
|---|---|---|---|
| `GET` | `/` | no | `200` `Hello World!` |
| `POST` | `/users/register` | no | `201` `{ message }` |
| `POST` | `/users/login` | no | `200` JWT as plain text |
| `GET` | `/users/profile` | yes | `200` `{ id, name, email, role }` |
| `PATCH` | `/users/:id/role` | admin | `200` `{ id, role: "admin" }` |
| `GET` | `/projects` | yes | `200` projects + tasks |
| `POST` | `/projects` | yes | `201` project |
| `GET` | `/projects/:id` | yes | `200` project + tasks |
| `PUT` | `/projects/:id` | yes | `200` project |
| `DELETE` | `/projects/:id` | yes | `200` `{ id, deleted: true }` |
| `GET` | `/tasks` | yes | `200` tasks |
| `POST` | `/tasks` | yes | `201` task |
| `GET` | `/tasks/:id` | yes | `200` task |
| `PATCH` | `/tasks/:id` | yes | `200` task |
| `DELETE` | `/tasks/:id` | yes | `200` `{ id, deleted: true }` |

Task status values: `todo`, `in_progress`, `completed`.

### Authentication flow

```bash
# Register
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Log in and capture the token (the body is the raw JWT)
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}')

# Use it
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

Passwords must be 8–72 characters and contain an uppercase letter, a lowercase
letter and a number. Emails and names are trimmed; emails are lowercased.

### Validation rules

- Unknown body properties are rejected with `400`.
- Titles are trimmed, non-empty and capped at 100 characters (tasks) or 255
  (projects).
- `projectId` and route ids must be positive integers.
- `UpdateTaskDto` / `UpdateProjectDto` are partial: omitted fields are allowed,
  invalid values are not.

Database writes are tenant-scoped: a task can only be created in, read from,
updated in or deleted from a project owned by the authenticated user. Attempting
to use another user's project returns `404` rather than leaking its existence.

## Error contract

Every error response uses the same envelope:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "code": "NOT_FOUND",
  "message": "Task with id \"99\" not found",
  "details": [{ "field": "email", "message": "email must be an email" }],
  "path": "/tasks/99",
  "method": "GET",
  "timestamp": "2026-11-04T10:00:00.000Z"
}
```

`details` is only present for validation failures. Unknown 5xx errors return a
generic message; the stack trace is logged, never returned.

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body or route parameter failed validation |
| `BAD_REQUEST` | 400 | Malformed request |
| `INVALID_INPUT` | 400 | Database rejected a value (missing/format/constraint) |
| `UNAUTHORIZED` | 401 | Missing, invalid or expired token |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource does not exist or is not owned by the caller |
| `DUPLICATE_RESOURCE` | 409 | Unique value already exists (e.g. email) |
| `FOREIGN_KEY_VIOLATION` | 409 | Referenced row does not exist |
| `BUSINESS_RULE_VIOLATION` | 422 | Request is valid but breaks a business rule |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected failure |

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3000/api`
- OpenAPI JSON: `http://localhost:3000/api-json`
- Exported document: `docs/openapi.json` (regenerate with `npm run openapi:export`)

Every endpoint is tagged (`App`, `Users`, `Projects`, `Tasks`), documents its
success schema, `:id` parameter, bearer requirement and the standard error
responses. Response DTOs exclude password fields.

Swagger is enabled outside production by default. Set `SWAGGER_ENABLED=false` to
hide it (for example on a public deployment) or `true` to force it on.

## Postman collection

Files:

- `postman/task-manager.postman_collection.json`
- `postman/task-manager.postman_environment.json`

Import both into Postman and select the **Task Manager - Local** environment.

1. Start the API (`npm run start:dev`).
2. Run **Users → Register** — it generates a unique email.
3. Run **Users → Login** — it stores the returned JWT in the `token` variable.
4. Run the project and task requests in order, then the **Errors** folder.

The collection uses collection-level bearer auth, so every protected request
picks up `{{token}}` automatically; public requests override it with `noauth`.
Request tests assert status codes, response shapes and the stored ids, so a full
run doubles as a smoke test.

Before sharing or publishing, add the real base URL to the environment. To
publish the docs, open the collection in Postman and use **Share → Publish
documentation** (a Postman account is required; publishing from the CLI is not
supported). Alternatively commit the collection as done here — importing it
requires no account.

## Testing

```bash
npm test          # 15 files, 36 unit tests
npm run test:e2e  # 2 files, 28 e2e tests
```

Unit coverage: exception filter envelope and database-error mapping, validation
pipe flattening, id pipe, DTO rules for users/tasks/projects, JWT guard, service
tenant checks.

The API e2e suite (`test/api.e2e-spec.ts`) boots the real controllers, services,
validation pipe and exception filter over HTTP with in-memory repository doubles.
It covers registration and normalization, duplicate email (service and database
constraint), structured validation errors, unknown properties, login, token
handling, admin authorization, route parameter validation, CRUD for projects and
tasks, cross-tenant rejection and the 404 envelope. It does not exercise SQL, so
run a migration check against a real database when changing entities.

## Week 8 documentation

- `docs/week8-compliance.md` — requirement-by-requirement assessment
- `docs/week8-phase-0-and-2.md` — baseline and error handling
- `docs/week8-phase-1.md` — validation hardening
- `docs/week8-phase-3.md` — Swagger/OpenAPI
- `docs/week8-phase-4-and-5.md` — environment validation, Postman and docs
- `docs/week8-phase-6.md` — e2e coverage

## Security notes

- `JWT_SECRET` has no fallback; signing and verification both read the validated
  configuration.
- Passwords are bcrypt-hashed and never returned by the API.
- Unique index on `users.email`; duplicate registration returns `409`.
- All project/task reads and writes are scoped to the token's user id.
- Swagger is disabled in production unless explicitly enabled.
- The debug logging and direct `process.env` reads from earlier weeks are gone.
