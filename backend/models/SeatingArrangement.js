const mongoose = require('mongoose');

const seatingArrangementSchema = new mongoose.Schema({
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
  floor: {
    type: String,
    required: true
  },
  students: [
    {
      studentName: String,
      regNo: String,
      courseCode: String,
      specialization: String,
      seatNo: Number
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('SeatingArrangement', seatingArrangementSchema); 