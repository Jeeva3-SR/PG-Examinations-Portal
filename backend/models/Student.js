const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  date: String,
  session: String,
  courseCode: String,
  courseName: String
});

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: String,
  branch: String,
  exams: [examSchema]
});

module.exports = mongoose.model('Student', studentSchema); 