const mongoose = require('mongoose');

const qpOrderSchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['regular', 'arrear'],
    required: true
  },
  regulation: {
    type: String,
    default: '2023'
  },
  examMonth: {
    type: String,
    required: true
  },
  lastDateToSubmit: {
    type: Date,
    required: true
  },
  letterText: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Waiting for Response', 'Approved', 'Rejected'],
    default: 'Waiting for Response'
  }
});

module.exports = mongoose.model('QPOrder', qpOrderSchema); 