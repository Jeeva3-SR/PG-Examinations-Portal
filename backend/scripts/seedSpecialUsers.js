const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
  await mongoose.connect('mongodb://localhost:27017/exam-management'); // Change DB name if needed
  for (const userData of users) {
    const existing = await User.findOne({ userId: userData.userId });
    if (!existing) {
      await User.create({ ...userData }); // Store password as plain text
      console.log(`Seeded user: ${userData.userId}`);
    } else {
      console.log(`User already exists: ${userData.userId}`);
    }
  }
  mongoose.disconnect();
}

seed(); 