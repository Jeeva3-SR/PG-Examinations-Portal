const mongoose = require('mongoose');

const assignedQPSetterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  facultyId: {
    type: String,
    required: true,
    trim: true
  },
  facultyName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate assignments
assignedQPSetterSchema.index({ subject: 1, facultyId: 1 }, { unique: true });

module.exports = mongoose.model('AssignedQPSetter', assignedQPSetterSchema); 