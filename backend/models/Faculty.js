const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true },
  employeeId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  course: { type: [String], default: [] },
  courseCode: { type: String },
  position: { type: String },
  contactInfo: {
    email: { type: String },
    phone: { type: String }
  },
  areasOfExpertise: { type: [String], default: [] },
  classesHandled: [{
    subject: { type: String },
    semester: { type: String },
    section: { type: String },
    year: { type: String }
  }],
  dob: { type: Date },
  dateOfJoining: { type: Date },
  department: { type: String },
  gender: { type: String },
  profilePicUrl: { type: String },
  isActive: { type: Boolean, default: true },
  scaleOfPay: { type: String },
  presentPay: { type: Number },
  natureOfAppointment: { type: String }
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty; 