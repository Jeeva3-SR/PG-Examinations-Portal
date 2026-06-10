const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

// GET /api/rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rooms
router.post('/', auth, async (req, res) => {
  try {
    const { roomNumber, capacity, floor } = req.body;
    if (!roomNumber || !capacity || !floor) {
      return res.status(400).json({ message: 'roomNumber, capacity, and floor are required' });
    }
    const room = new Room({ roomNumber, capacity, floor });
    const saved = await room.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/rooms/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { roomNumber, capacity, floor } = req.body;
    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, capacity, floor },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Room not found' });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;