const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  session: {
    type: String,
    enum: ['FN', 'AN'],
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    ref: 'Course'
  },
  courseName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for date and session
sessionSchema.index({ date: 1, session: 1 });

module.exports = mongoose.model('Session', sessionSchema); 