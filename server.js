const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
let students = [
  { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', grade: 'A' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Mathematics', grade: 'B' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', course: 'Physics', grade: 'A' }
];

let nextId = 4;

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API Testing Tutorial API',
    endpoints: {
      'GET /students': 'Get all students',
      'GET /students/:id': 'Get a specific student',
      'GET /students/search?name=value': 'Search students by name',
      'POST /students': 'Create a new student',
      'PUT /students/:id': 'Update a student (full update)',
      'PATCH /students/:id': 'Update a student (partial update)',
      'DELETE /students/:id': 'Delete a student'
    }
  });
});

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

// POST - Create a new student
app.post('/students', (req, res) => {
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

// PUT - Full update of a student
app.put('/students/:id', (req, res) => {
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

// PATCH - Partial update of a student
app.patch('/students/:id', (req, res) => {
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

// DELETE - Delete a student
app.delete('/students/:id', (req, res) => {
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
  console.log(`API Testing Tutorial Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} for available endpoints`);
});
