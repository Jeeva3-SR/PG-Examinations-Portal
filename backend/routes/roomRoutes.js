const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/roomController');

// Get all rooms
router.get('/', auth, ctrl.getAllRooms);

// Add a new room
router.post('/', auth, ctrl.addRoom);

// Update a room
router.put('/:id', auth, ctrl.updateRoom);

// Delete a room
router.delete('/:id', auth, ctrl.deleteRoom);

module.exports = router;
