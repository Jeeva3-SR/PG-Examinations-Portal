const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  dutyType: { type: String, enum: ['Invigilation', 'QP Setting', 'Evaluation (Arrear)'], required: true },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Not Approved', 'Signed Off'], default: 'Pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Claim', claimSchema); 