const mongoose = require('mongoose');

const subjectAssignmentSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  facultyId: {
    type: String,
    required: true
  },
  facultyName: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

subjectAssignmentSchema.index({ courseCode: 1, year: 1, semester: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model('SubjectAssignment', subjectAssignmentSchema);
