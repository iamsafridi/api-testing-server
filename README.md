# API Testing Tutorial - Complete REST API

A complete REST API for teaching API testing with all HTTP methods (GET, POST, PUT, PATCH, DELETE).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or use nodemon for auto-restart during development:
```bash
npm run dev
```

The API will run on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. GET - Retrieve All Students
```
GET /students
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### 2. GET - Retrieve Single Student
```
GET /students/:id
```

**Example:**
```
GET /students/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "course": "Computer Science",
    "grade": "A"
  }
}
```

### 3. GET - Search Students
```
GET /students/search?name=john&course=computer&grade=A
```

**Query Parameters:**
- `name` - Search by name (partial match)
- `course` - Search by course (partial match)
- `grade` - Search by exact grade

### 4. POST - Create New Student
```
POST /students
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Alice Williams",
  "email": "alice@example.com",
  "course": "Biology",
  "grade": "A"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": 4,
    "name": "Alice Williams",
    "email": "alice@example.com",
    "course": "Biology",
    "grade": "A"
  }
}
```

### 5. PUT - Full Update Student
```
PUT /students/:id
Content-Type: application/json
```

**Note:** PUT requires ALL fields to be provided.

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "course": "Computer Science",
  "grade": "A+"
}
```

### 6. PATCH - Partial Update Student
```
PATCH /students/:id
Content-Type: application/json
```

**Note:** PATCH allows updating only specific fields.

**Request Body (update only grade):**
```json
{
  "grade": "B+"
}
```

### 7. DELETE - Remove Student
```
DELETE /students/:id
```

**Example:**
```
DELETE /students/1
```

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    ...
  }
}
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Email already exists

## Testing with cURL

### GET all students
```bash
curl http://localhost:3000/students
```

### GET single student
```bash
curl http://localhost:3000/students/1
```

### POST create student
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@example.com","course":"Testing","grade":"A"}'
```

### PUT update student
```bash
curl -X PUT http://localhost:3000/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com","course":"Updated Course","grade":"A+"}'
```

### PATCH partial update
```bash
curl -X PATCH http://localhost:3000/students/1 \
  -H "Content-Type: application/json" \
  -d '{"grade":"B+"}'
```

### DELETE student
```bash
curl -X DELETE http://localhost:3000/students/1
```

## Testing with Postman

1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. For POST, PUT, PATCH requests:
   - Set Headers: `Content-Type: application/json`
   - Add JSON body in the Body tab (raw)

## Authentication & Authorization

This API includes JWT-based authentication to teach security concepts.

### Default Credentials

**Admin User (Full Access):**
- Username: `teacher`
- Password: `teacher123`
- Can: Create, Update, Delete students

**Regular User (Limited Access):**
- Username: `student`
- Password: `student123`
- Can: Create and Read students only

### Authentication Endpoints

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'
```

**Response includes a JWT token:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "teacher",
    "role": "admin"
  }
}
```

#### Using the Token

Add the token to the `Authorization` header:
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"New Student","email":"new@example.com","course":"Math"}'
```

### Protected Endpoints

- **Public** (no token): GET /students, GET /students/:id
- **Authenticated** (token required): POST /students
- **Admin Only** (token + admin role): PUT, PATCH, DELETE /students/:id

See [AUTH_EXAMPLES.md](AUTH_EXAMPLES.md) for detailed authentication examples and testing scenarios.

## Key Learning Points

1. **GET vs POST vs PUT vs PATCH vs DELETE** - Different HTTP methods for different operations
2. **Status Codes** - Understanding 200, 201, 400, 401, 403, 404, 409
3. **Authentication** - Login with credentials to get JWT token
4. **Authorization** - Role-based access control (admin vs user)
5. **Bearer Tokens** - Sending JWT in Authorization header
6. **Request Headers** - Content-Type and Authorization
7. **Request Body** - Sending data in POST/PUT/PATCH
8. **URL Parameters** - Using :id in the path
9. **Query Parameters** - Using ?name=value for search
10. **Validation** - Required fields and error handling
11. **PUT vs PATCH** - Full update vs partial update
12. **Security** - Password hashing, token expiration, role-based permissions
