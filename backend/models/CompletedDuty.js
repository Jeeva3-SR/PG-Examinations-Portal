const mongoose = require('mongoose');

const completedDutySchema = new mongoose.Schema({
  dutyId: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  dutyDetails: {
    date: Date,
    session: String,
    courseName: String
  },
  status: { type: String, required: true, enum: ['completed', 'not completed'] }
});

module.exports = mongoose.model('CompletedDuty', completedDutySchema); 