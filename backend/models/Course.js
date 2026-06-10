const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true
  },

  employeeId: String,

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  // Reference multiple courses
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  position: String,

  contactInfo: {
    email: String,
    phone: String
  },

  areasOfExpertise: {
    type: [String],
    default: []
  },

  classesHandled: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    semester: String,
    section: String,
    year: String
  }],

  dob: Date,

  dateOfJoining: Date,

  department: String,

  gender: String,

  profilePicUrl: String,

  isActive: {
    type: Boolean,
    default: true
  },

  scaleOfPay: String,

  presentPay: Number,

  natureOfAppointment: String,

  bankAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);