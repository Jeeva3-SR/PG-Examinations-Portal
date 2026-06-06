const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/exam-management';

const users = [
  {
    userId: 'COORD001',
    name: 'PG Coordinator',
    email: 'coordinator@annauniv.edu',
    password: 'coordinator@pg',
    role: 'coordinator'
  },
  {
    userId: 'HOD001',
    name: 'CSE HOD',
    email: 'csehod@annauniv.edu',
    password: 'csehod@pg',
    role: 'hod'
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  for (const userData of users) {
    const existing = await User.findOne({ userId: userData.userId });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`Seeded user: ${userData.userId}`);
    } else {
      console.log(`User already exists: ${userData.userId}`);
    }
  }
  mongoose.disconnect();
}

seed(); 