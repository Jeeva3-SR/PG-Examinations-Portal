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
    enum: ['faculty', 'coordinator', 'hod'],
    required: true
  }
}, {
  timestamps: true
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return candidatePassword === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 