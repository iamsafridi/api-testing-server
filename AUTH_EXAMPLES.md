# Authentication & Authorization Examples

## Overview

This API demonstrates:
- **Authentication** - Verifying who you are (login with username/password)
- **Authorization** - Verifying what you can do (admin vs regular user)
- **JWT Tokens** - Storing authentication in request headers
- **Role-Based Access Control** - Different permissions for different users

## Default Users

### Admin User (Full Access)
- Username: `teacher`
- Password: `teacher123`
- Role: `admin`
- Can: Create, Read, Update, Delete students

### Regular User (Limited Access)
- Username: `student`
- Password: `student123`
- Role: `user`
- Can: Create and Read students only

## Authentication Flow

### 1. Register a New User (Optional)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "user"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 3,
    "username": "newuser",
    "role": "user"
  }
}
```

### 2. Login to Get Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher",
    "password": "teacher123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "teacher",
    "role": "admin"
  }
}
```

**Important:** Save the token! You'll need it for protected endpoints.

### 3. Use Token in Requests

Add the token to the `Authorization` header as `Bearer <token>`:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Protected Endpoints

### Public Endpoints (No Token Required)
- `GET /students` - View all students
- `GET /students/:id` - View single student
- `GET /students/search` - Search students

### Authenticated Endpoints (Token Required)
- `POST /students` - Create student (any logged-in user)
- `GET /auth/me` - Get current user info

### Admin Only Endpoints (Token + Admin Role Required)
- `PUT /students/:id` - Full update student
- `PATCH /students/:id` - Partial update student
- `DELETE /students/:id` - Delete student

## Testing Different Scenarios

### Scenario 1: Access Without Token (401 Unauthorized)

```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "course": "Testing"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Access token required. Please login first."
}
```

### Scenario 2: Access With Valid Token (Success)

```bash
# First, login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then use the token
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "course": "Testing"
  }'
```

### Scenario 3: Regular User Trying Admin Action (403 Forbidden)

```bash
# Login as regular user
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Try to delete (admin only)
curl -X DELETE http://localhost:3000/students/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Scenario 4: Admin User Performing Admin Action (Success)

```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Delete student
curl -X DELETE http://localhost:3000/students/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Postman Testing

### Step 1: Login
1. Create a POST request to `http://localhost:3000/auth/login`
2. Set Body → raw → JSON:
```json
{
  "username": "teacher",
  "password": "teacher123"
}
```
3. Send request
4. Copy the `token` from response

### Step 2: Set Authorization Header
For protected endpoints:
1. Go to Headers tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer <paste-your-token-here>`

### Step 3: Test Protected Endpoints
Now you can test POST, PUT, PATCH, DELETE endpoints with the token.

## Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists

## Security Concepts Demonstrated

1. **Password Hashing** - Passwords are hashed with bcrypt, never stored in plain text
2. **JWT Tokens** - Stateless authentication using JSON Web Tokens
3. **Bearer Token** - Standard way to send tokens in Authorization header
4. **Token Expiration** - Tokens expire after 24 hours
5. **Role-Based Access Control (RBAC)** - Different permissions for different roles
6. **Middleware Chain** - Authentication → Authorization → Route Handler

## Teaching Points

### Authentication vs Authorization
- **Authentication** = "Who are you?" (Login with credentials)
- **Authorization** = "What can you do?" (Check user role/permissions)

### Why JWT in Headers?
- Stateless - Server doesn't need to store sessions
- Scalable - Works across multiple servers
- Standard - `Authorization: Bearer <token>` is industry standard
- Secure - Token is signed and can't be tampered with

### Token Lifecycle
1. User logs in with credentials
2. Server validates and creates JWT token
3. Client stores token (localStorage, memory, etc.)
4. Client sends token in Authorization header for each request
5. Server validates token and extracts user info
6. Token expires after set time (24h in this API)
