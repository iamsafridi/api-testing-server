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

## Key Learning Points

1. **GET vs POST vs PUT vs PATCH vs DELETE** - Different HTTP methods for different operations
2. **Status Codes** - Understanding 200, 201, 400, 404, 409
3. **Request Headers** - Content-Type for JSON
4. **Request Body** - Sending data in POST/PUT/PATCH
5. **URL Parameters** - Using :id in the path
6. **Query Parameters** - Using ?name=value for search
7. **Validation** - Required fields and error handling
8. **PUT vs PATCH** - Full update vs partial update
9. **Idempotency** - PUT and DELETE are idempotent
10. **Response Structure** - Consistent JSON responses

## Notes

- Data is stored in memory and will reset when server restarts
- Email must be unique across all students
- The `grade` field is optional when creating a student (defaults to 'N/A')
- PUT requires all fields, PATCH allows partial updates


## Deployment to Render

### Option 1: Deploy from GitHub (Recommended)

1. Push this code to a GitHub repository
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the settings from `render.yaml`
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Your API will be live at `https://your-app-name.onrender.com`

### Option 2: Deploy with Render CLI

```bash
# Install Render CLI
npm install -g render

# Login and deploy
render login
render deploy
```

### After Deployment

Share the URL with your students:
```
https://your-app-name.onrender.com/students
```

**Note:** Free tier may sleep after inactivity. First request might take 30-60 seconds to wake up.

## Alternative: Railway Deployment

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

## Alternative: Fly.io Deployment

1. Install flyctl: `brew install flyctl` (macOS)
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Deploy: `fly deploy`
