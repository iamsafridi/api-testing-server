const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
let students = [
  { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', grade: 'A' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Mathematics', grade: 'B' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', course: 'Physics', grade: 'A' }
];

// Users database (passwords are hashed)
let users = [
  { 
    id: 1, 
    username: 'teacher', 
    password: bcrypt.hashSync('teacher123', 10), 
    role: 'admin' 
  },
  { 
    id: 2, 
    username: 'student', 
    password: bcrypt.hashSync('student123', 10), 
    role: 'user' 
  }
];

let nextId = 4;
let nextUserId = 3;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please login first.'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Authorization Middleware (Admin only)
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API Testing Tutorial API',
    authentication: {
      'POST /auth/register': 'Register a new user',
      'POST /auth/login': 'Login and get token',
      'GET /auth/me': 'Get current user info (requires token)'
    },
    endpoints: {
      'GET /students': 'Get all students (public)',
      'GET /students/:id': 'Get a specific student (public)',
      'GET /students/search?name=value': 'Search students by name (public)',
      'POST /students': 'Create a new student (requires authentication)',
      'PUT /students/:id': 'Update a student (requires admin)',
      'PATCH /students/:id': 'Update a student (requires admin)',
      'DELETE /students/:id': 'Delete a student (requires admin)'
    },
    defaultCredentials: {
      admin: { username: 'teacher', password: 'teacher123' },
      user: { username: 'student', password: 'student123' }
    }
  });
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register new user
app.post('/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  // Check if username exists
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: 'Username already exists'
    });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: nextUserId++,
    username,
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'user' // Default to user
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    }
  });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// Get current user info (protected route)
app.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// ============ STUDENT ENDPOINTS ============

// GET - Get all students
app.get('/students', (req, res) => {
  res.json({
    success: true,
    count: students.length,
    data: students
  });
});

// GET - Get student by ID
app.get('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find(s => s.id === id);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with id ${id} not found`
    });
  }
  
  res.json({
    success: true,
    data: student
  });
});

// GET - Search students by name
app.get('/students/search', (req, res) => {
  const { name, course, grade } = req.query;
  let results = students;
  
  if (name) {
    results = results.filter(s => 
      s.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (course) {
    results = results.filter(s => 
      s.course.toLowerCase().includes(course.toLowerCase())
    );
  }
  
  if (grade) {
    results = results.filter(s => s.grade === grade.toUpperCase());
  }
  
  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// POST - Create a new student (requires authentication)
app.post('/students', authenticateToken, (req, res) => {
  const { name, email, course, grade } = req.body;
  
  // Validation
  if (!name || !email || !course) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and course'
    });
  }
  
  // Check if email already exists
  const emailExists = students.find(s => s.email === email);
  if (emailExists) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }
  
  const newStudent = {
    id: nextId++,
    name,
    email,
    course,
    grade: grade || 'N/A'
  };
  
  students.push(newStudent);
  
  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: newStudent
  });
});

// PUT - Full update of a student (requires admin)
app.put('/students/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, course, grade } = req.body;
  
  const index = students.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Student with id ${id} not found`
    });
  }
  
  // Validation - PUT requires all fields
  if (!name || !email || !course || !grade) {
    return res.status(400).json({
      success: false,
      message: 'PUT requires all fields: name, email, course, and grade'
    });
  }
  
  // Check if email already exists (excluding current student)
  const emailExists = students.find(s => s.email === email && s.id !== id);
  if (emailExists) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }
  
  students[index] = { id, name, email, course, grade };
  
  res.json({
    success: true,
    message: 'Student updated successfully',
    data: students[index]
  });
});

// PATCH - Partial update of a student (requires admin)
app.patch('/students/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  const index = students.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Student with id ${id} not found`
    });
  }
  
  // Check if trying to update email and it already exists
  if (updates.email) {
    const emailExists = students.find(s => s.email === updates.email && s.id !== id);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
  }
  
  // Apply partial updates
  students[index] = { ...students[index], ...updates, id }; // Keep original id
  
  res.json({
    success: true,
    message: 'Student updated successfully',
    data: students[index]
  });
});

// DELETE - Delete a student (requires admin)
app.delete('/students/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Student with id ${id} not found`
    });
  }
  
  const deletedStudent = students[index];
  students.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Student deleted successfully',
    data: deletedStudent
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Testing Tutorial Server running on http://localhost:${PORT}`);
  console.log(`📚 Visit http://localhost:${PORT} for available endpoints`);
  console.log(`\n🔐 Default Credentials:`);
  console.log(`   Admin: username=teacher, password=teacher123`);
  console.log(`   User:  username=student, password=student123`);
});
