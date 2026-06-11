const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seatingArrangementController');

// Generate seating arrangement by date and session
router.post('/generate', ctrl.generateSeating);

// Get all rooms
router.get('/rooms', ctrl.getRooms);

// Get room summary by date, session, and room
router.get('/room-summary', ctrl.getRoomSummary);

// Generate seating plan from uploaded Excel files
router.post('/generate-from-excel', ctrl.generateFromExcel);

// Get seating plan by entry ID
router.get('/by-entry/:entryId', ctrl.getByEntry);

// Get seating arrangements by date and session
router.get('/by-date-session', ctrl.getByDateSession);

module.exports = router;
