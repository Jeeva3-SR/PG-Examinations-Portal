const mongoose = require('mongoose');

const seatingArrangementSchema = new mongoose.Schema({
  entryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentInput'
  },
  roomNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    enum: ['FN', 'AN'],
    required: true
  },
  courseCode: String,
  specialization: String,
  floor: {
    type: String,
    default: ''
  },
  students: [
    {
      studentName: String,
      regNo: String,
      courseCode: String,
      specialization: String,
      category: String,
      seatNo: Number
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('SeatingArrangement', seatingArrangementSchema); 