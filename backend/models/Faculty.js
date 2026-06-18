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
  
  // Changed from String Enum to an Array of Strings
  roles: {
    type: [String],
    enum: ['faculty', 'hod', 'coordinator'],
    default: ['faculty'] // Everyone starts with basic faculty access
  },

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