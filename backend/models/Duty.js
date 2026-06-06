const mongoose = require('mongoose');

const dutySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
  },
  facultyName: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Storing as string like 'YYYY-MM-DD'
    required: true,
  },
  session: {
    type: String, // 'FN' or 'AN'
    required: true,
  },
});

const Duty = mongoose.model('Duty', dutySchema);

module.exports = Duty; 