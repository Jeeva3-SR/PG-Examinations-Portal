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
  department: {
    type: String,
    required: true,
    trim: true,
    default: 'Unassigned'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    default: ''
  },
  originalDate: {
    type: Date,
    default: null
  },
  rescheduleType: {
    type: String,
    enum: ['prepone', 'postpone', null],
    default: null
  },
  rescheduleReason: {
    type: String,
    default: ''
  },
  rescheduledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

sessionSchema.index({ date: 1, session: 1 });
sessionSchema.index(
  { date: 1, session: 1, courseCode: 1, department: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'session_unique_active_slot',
  }
);

module.exports = mongoose.model('Session', sessionSchema);
