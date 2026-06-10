const mongoose = require('mongoose');

const studentInputSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required']
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required']
  },
  cegRegular: {
    type: Number,
    default: 0,
    min: [0, 'CEG Regular count cannot be negative']
  },
  cegArrear: {
    type: Number,
    default: 0,
    min: [0, 'CEG Arrear count cannot be negative']
  },
  mitRegular: {
    type: Number,
    default: 0,
    min: [0, 'MIT Regular count cannot be negative']
  },
  mitArrear: {
    type: Number,
    default: 0,
    min: [0, 'MIT Arrear count cannot be negative']
  },
  totalRegular: {
    type: Number,
    required: true,
    min: [0, 'Total regular cannot be negative']
  },
  totalArrear: {
    type: Number,
    required: true,
    min: [0, 'Total arrear cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  totalCEG: {
    type: Number,
    default: 0,
    min: [0, 'Total CEG cannot be negative']
  },
  totalMIT: {
    type: Number,
    default: 0,
    min: [0, 'Total MIT cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    enum: ['FN', 'AN']
  },
  sessionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  cegRegularStatus: { type: String, enum: ['pending', 'uploaded', 'skipped'], default: 'pending' },
  cegArrearStatus: { type: String, enum: ['pending', 'uploaded', 'skipped'], default: 'pending' },
  mitRegularStatus: { type: String, enum: ['pending', 'uploaded', 'skipped'], default: 'pending' },
  mitArrearStatus: { type: String, enum: ['pending', 'uploaded', 'skipped'], default: 'pending' },
  cegRegularKey: { type: String },
  cegArrearKey: { type: String },
  mitRegularKey: { type: String },
  mitArrearKey: { type: String }
}, {
  timestamps: true
});

// Pre-save hook to validate totals match sum of counts
studentInputSchema.pre('save', function(next) {
  const totalRegular = this.cegRegular + this.mitRegular;
  const totalArrear = this.cegArrear + this.mitArrear;
  const total = totalRegular + totalArrear;
  const totalCEG = this.cegRegular + this.cegArrear;
  const totalMIT = this.mitRegular + this.mitArrear;

  if (this.totalRegular !== totalRegular) {
    this.totalRegular = totalRegular;
  }
  if (this.totalArrear !== totalArrear) {
    this.totalArrear = totalArrear;
  }
  if (this.total !== total) {
    this.total = total;
  }
  if (this.totalCEG !== totalCEG) {
    this.totalCEG = totalCEG;
  }
  if (this.totalMIT !== totalMIT) {
    this.totalMIT = totalMIT;
  }
  next();
});

module.exports = mongoose.model('StudentInput', studentInputSchema); 