const express = require('express');
const router = express.Router();
const Coordinator = require('../models/Coordinator');

// GET /api/coordinator - get the first coordinator
router.get('/', async (req, res) => {
  try {
    const coordinator = await Coordinator.findOne();
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json(coordinator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 