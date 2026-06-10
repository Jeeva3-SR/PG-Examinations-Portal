const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  studentCount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['Regular', 'Arrear'],
    required: true
  },
  college: {
    type: String,
    enum: ['CEG', 'MIT'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);