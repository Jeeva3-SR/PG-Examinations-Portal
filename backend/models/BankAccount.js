const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  panNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  bankAccountNumber: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
