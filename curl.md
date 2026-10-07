# Task Manager — cURL

# GET /tasks
curl http://localhost:9001/tasks

# GET /tasks/:id
curl http://localhost:9001/tasks/1791369245529

# POST /tasks
curl -X POST http://localhost:9001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"integrate whatsapp api","description":"some description"}'

# PUT /tasks/:id
curl -X PUT http://localhost:9001/tasks/1791369245529 \
  -H "Content-Type: application/json" \
  -d '{"title":"updated title","description":"updated description"}'

# DELETE /tasks/:id
curl -X DELETE http://localhost:9001/tasks/1791369245529

# PATCH /tasks/:id/status
curl -X PATCH http://localhost:9001/tasks/1791369245529/status \
  -H "Content-Type: application/json" \
  -d '{"status":"DOING"}'

# GET /tasks/:id/comments
curl http://localhost:9001/tasks/1791369245529/comments

# POST /tasks/:id/comments
curl -X POST http://localhost:9001/tasks/1791369245529/comments \
  -H "Content-Type: application/json" \
  -d '{"text":"I will use OS for it"}'

