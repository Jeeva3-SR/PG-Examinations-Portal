const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/exam-management'; // Update if needed

const users = [
  {
    userId: 'ADMIN001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'admin'
  },
  {
    userId: 'FAC001',
    name: 'Faculty One',
    email: 'faculty1@example.com',
    password: 'faculty1pass',
    role: 'faculty'
  },
  {
    userId: 'HOD001',
    name: 'HOD User',
    email: 'hod@example.com',
    password: 'hodpass',
    role: 'hod'
  }
];

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  for (let user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await User.create({ ...user, password: hashed });
  }
  console.log('Users seeded!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 