# Task Manager — cURL

# GET /tasks
curl http://localhost:9000/tasks

# GET /tasks/:id
curl http://localhost:9001/tasks/1791369245529

# POST /tasks
curl -X POST http://localhost:9000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"integrate whatsapp api","description":"some description"}'

# PUT /tasks/:id
curl -X PUT http://localhost:9000/tasks/1791369245529 \
  -H "Content-Type: application/json" \
  -d '{"title":"updated title","description":"updated description"}'

# DELETE /tasks/:id
curl -X DELETE http://localhost:9001/tasks/1791369245529



# GET /projects
curl http://localhost:9000/projects

# GET /projects/:id
curl http://localhost:9000/projects/1

# POST /projects
curl -X POST http://localhost:9000/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"week4 task manager"}'

# PUT /projects/:id
curl -X PUT http://localhost:9000/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"updated project title"}'

# DELETE /projects/:id
curl -X DELETE http://localhost:9000/projects/1












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

