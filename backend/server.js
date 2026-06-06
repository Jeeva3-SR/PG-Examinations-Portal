const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
let swaggerDocument = undefined;
let swaggerJSDoc = undefined;
try {
  swaggerJSDoc = require('swagger-jsdoc');
} catch (err) {
  // swagger-jsdoc not installed yet; will fallback to static swagger.json if present
}
try {
  swaggerDocument = require('./swagger.json');
} catch (err) {
  swaggerDocument = undefined;
}

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
app.use('/api', require('./routes/authRoutes'));

// Swagger UI - API documentation
if (swaggerJSDoc) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PG Examinations Portal API',
        version: '1.0.0',
        description: 'Auto-generated API documentation from JSDoc comments',
      },
    },
    apis: [path.join(__dirname, 'routes', '*.js')],
  };
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn('Swagger UI disabled: install swagger-jsdoc or provide swagger.json');
}

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }

  // Handle mongoose errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Handle other errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/exam-management';
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