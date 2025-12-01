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


## Logout / Session Invalidation

### How Logout Works with JWT

Unlike traditional session-based auth, JWT tokens are stateless. Once issued, they're valid until expiration. This API implements logout using a **token blacklist**:

1. User logs out
2. Token is added to a blacklist (in-memory Set)
3. Future requests with that token are rejected
4. Token remains blacklisted until server restart

### Logout Endpoint

```bash
# First login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Use the token (works)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Logout (invalidate token)
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try to use same token again (fails)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response after logout:**
```json
{
  "success": false,
  "message": "Token has been revoked. Please login again."
}
```

### Client-Side Logout

In a real application, the client should also:

1. Call the logout endpoint
2. Delete the token from storage (localStorage, sessionStorage, cookies)
3. Redirect to login page

**Example JavaScript:**
```javascript
// Logout function
async function logout() {
  const token = localStorage.getItem('token');
  
  // Call logout endpoint
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Remove token from storage
  localStorage.removeItem('token');
  
  // Redirect to login
  window.location.href = '/login';
}
```

### Different Logout Strategies

#### 1. Token Blacklist (Current Implementation)
- **Pros**: Immediate invalidation, works across all servers if using shared storage
- **Cons**: Requires server-side storage, memory grows over time
- **Best for**: Teaching, small apps, when immediate logout is critical

#### 2. Client-Side Only (Simple)
- Just delete token from client storage
- **Pros**: No server changes needed, stateless
- **Cons**: Token still valid if stolen, works until expiration
- **Best for**: Low-security apps, short token expiration times

#### 3. Short-Lived Tokens + Refresh Tokens
- Access token expires quickly (15 min)
- Refresh token for getting new access tokens
- Logout invalidates refresh token
- **Pros**: More secure, scalable
- **Cons**: More complex implementation
- **Best for**: Production apps

#### 4. Database/Redis Blacklist
- Store blacklisted tokens in database or Redis
- **Pros**: Persists across server restarts, scalable
- **Cons**: Requires external storage
- **Best for**: Production with multiple servers

### Teaching Points

1. **Stateless vs Stateful**: JWT is stateless, but logout requires state (blacklist)
2. **Token Lifecycle**: Issue → Use → Revoke → Expire
3. **Security Trade-offs**: Convenience vs immediate invalidation
4. **Client Responsibility**: Client must delete token too
5. **Expiration**: Even without logout, tokens expire (24h in this API)

### Testing Logout Flow

```bash
# Complete logout test
echo "1. Login..."
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

echo -e "\n2. Access protected endpoint (should work)..."
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n3. Logout..."
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n4. Try to access again (should fail)..."
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n5. Login again to get new token..."
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'
```

### Postman Testing

1. **Login** - Save token from response
2. **Test endpoint** - Use token in Authorization header (works)
3. **Logout** - POST to /auth/logout with token
4. **Test again** - Same token now fails with "Token has been revoked"
5. **Login again** - Get new token, works normally

### Notes

- Blacklist is in-memory and clears on server restart
- In production, use Redis or database for persistent blacklist
- Consider cleaning up expired tokens from blacklist periodically
- Token expiration (24h) provides automatic cleanup
