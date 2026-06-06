require('dotenv').config();
const mongoose = require('mongoose');
const Coordinator = require('./models/Coordinator');

async function addCoordinator() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const doc = await Coordinator.create({
    name: 'Dr. C. Valliyammai',
    designation: 'Professor, Chief Superintendent (P.G. Examinations)'
  });
  console.log('Coordinator added:', doc);
  await mongoose.disconnect();
}

addCoordinator().catch(err => {
  console.error(err);
  process.exit(1);
}); 