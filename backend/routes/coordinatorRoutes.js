const express = require('express');
const router = express.Router();
const Coordinator = require('../models/Coordinator');

const DEFAULT_COORDINATOR = {
  name: 'Dr. C. Valliyammai',
  designation: 'Chief Superintendent, PG Examinations, DCSE',
};

// GET /api/coordinator - get the first coordinator
router.get('/', async (req, res) => {
  try {
    const coordinator = await Coordinator.findOne();
    if (!coordinator) {
      return res.json(DEFAULT_COORDINATOR);
    }
    res.json(coordinator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 