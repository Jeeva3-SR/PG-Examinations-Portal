const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Create Express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/duties', require('./routes/dutyRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/student-inputs', require('./routes/studentInputRoutes'));
app.use('/api/assigned-qpsetters', require('./routes/assignedQPSetterRoutes'));
app.use('/api/qporders', require('./routes/qpOrderRoutes'));
app.use('/api/evaluation-letter', require('./routes/evaluationLetterRoutes'));
app.use('/api/seating-arrangement', require('./routes/seatingArrangementRoutes'));
app.use('/api/letters', require('./routes/letterRoutes'));
app.use('/api/coordinator', require('./routes/coordinatorRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/bank-accounts', require('./routes/bankAccountRoutes'));
app.use('/api/subject-assignments', require('./routes/subjectAssignmentRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api', require('./routes/authRoutes'));
// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Handle mongoose cast errors (invalid ObjectId, etc)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: err.message
    });
  }

  // Handle other unknown errors
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

// Handle 404 errors (ignore webpack HMR noise accidentally proxied to backend)
app.use((req, res) => {
  const isDevAsset = /\.hot-update\.(json|js)$/.test(req.url)
    || req.url.startsWith('/sockjs-node')
    || req.url.startsWith('/static/')
    || req.url === '/favicon.ico';

  if (isDevAsset) {
    return res.status(404).end();
  }

  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exam-management';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- POST /api/student-inputs');
  console.log('- GET /api/student-inputs');
  console.log('- GET /api/student-inputs/range');
  console.log('- GET /api/student-inputs/specialization/:specialization');
  console.log('- PUT /api/student-inputs/:id');
  console.log('- DELETE /api/student-inputs/:id');
}); 