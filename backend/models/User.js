const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['faculty','admin'], 
    required: true
  },
  isActive: {
    type: Boolean,
    default: true // 🛡️ Added this so your auth middleware won't reject users
  },
  // Placeholders for your profile patch routes so they don't get ignored by MongoDB
  department: { type: String, trim: true },
  employeeId: { type: String, trim: true },
  bankAccount: { type: String, trim: true },
  ifscCode: { type: String, trim: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

// ========================================================
// 🔐 AUTOMATIC PASSWORD HASHING HOOK (Crucial Fix!)
// ========================================================
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;