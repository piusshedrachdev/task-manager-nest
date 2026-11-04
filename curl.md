# Task Manager API — cURL Examples

All routes below use port `3000` (override with `PORT`). Protected routes need a
bearer token.

```bash
BASE_URL=http://localhost:3000
```

## Health

```bash
curl $BASE_URL/
```

## Users

### Register

```bash
curl -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
```

### Log in and store the token

The response body is the raw JWT.

```bash
TOKEN=$(curl -s -X POST $BASE_URL/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}')
```

### Profile

```bash
curl $BASE_URL/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Change a user role (admin only)

```bash
curl -X PATCH $BASE_URL/users/1/role \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Projects

### Create

```bash
curl -X POST $BASE_URL/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Week 8 project"}'
```

### List

```bash
curl $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Get one

```bash
curl $BASE_URL/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update

```bash
curl -X PUT $BASE_URL/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated project"}'
```

### Delete

```bash
curl -X DELETE $BASE_URL/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Tasks

### Create

`projectId` must identify a project owned by the authenticated user.

```bash
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Document the API","description":"Publish Swagger and Postman","projectId":1}'
```

### List

```bash
curl $BASE_URL/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Get one

```bash
curl $BASE_URL/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update

Status values are `todo`, `in_progress` and `completed`.

```bash
curl -X PATCH $BASE_URL/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"completed"}'
```

### Delete

```bash
curl -X DELETE $BASE_URL/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Error examples

### Validation error (400)

```bash
curl -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"not-an-email","password":"weak"}'
```

### Missing token (401)

```bash
curl $BASE_URL/users/profile
```

### Not found (404)

```bash
curl $BASE_URL/tasks/999999 \
  -H "Authorization: Bearer $TOKEN"
```

### Invalid route parameter (400)

```bash
curl $BASE_URL/projects/not-a-number \
  -H "Authorization: Bearer $TOKEN"
```

Every error uses the standard envelope documented in `README.md` and in Swagger
(`http://localhost:3000/api`). For a runnable, ordered version of these requests
use `postman/task-manager.postman_collection.json`.
