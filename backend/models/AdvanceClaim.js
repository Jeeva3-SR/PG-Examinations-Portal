const mongoose = require('mongoose');

const advanceClaimSchema = new mongoose.Schema({
  totalAmount: {
    type: Number,
    required: true,
  },
  details: {
    otherExpensesAmount: Number,
    miscExpensesAmount: Number,
    thesisVivaAmount: Number,
    taDaAmount: Number,
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const AdvanceClaim = mongoose.model('AdvanceClaim', advanceClaimSchema);

module.exports = AdvanceClaim; 