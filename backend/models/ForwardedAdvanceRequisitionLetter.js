const mongoose = require('mongoose');

const ForwardedAdvanceRequisitionLetterSchema = new mongoose.Schema({
  letterText: { type: String, required: true },
  forwardedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

module.exports = mongoose.model('ForwardedAdvanceRequisitionLetter', ForwardedAdvanceRequisitionLetterSchema); 