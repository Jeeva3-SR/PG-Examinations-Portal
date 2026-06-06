const mongoose = require('mongoose');

const ForwardedAdvanceClaimSchema = new mongoose.Schema({
  totalAmount: { type: Number, required: true },
  formattedMonthYear: { type: String, required: true },
  forwardedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForwardedAdvanceClaim', ForwardedAdvanceClaimSchema); 