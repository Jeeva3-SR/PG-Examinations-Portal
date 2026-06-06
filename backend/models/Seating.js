const mongoose = require('mongoose');

const seatingSchema = new mongoose.Schema({
  roomNo: {
    type: String,
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    ref: 'Course'
  },
  students: [{
    rollNo: String,
    name: String,
    seatNo: Number
  }],
  capacity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for room and session
seatingSchema.index({ roomNo: 1, session: 1 });

module.exports = mongoose.model('Seating', seatingSchema); 