const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/sessionController');

const upload = multer({ dest: 'uploads/' });

// Upload timetable (Excel/CSV)
router.post('/upload', upload.single('file'), ctrl.uploadTimetable);

// Get all sessions
router.get('/', ctrl.getAllSessions);

// Get consolidated sessions
router.get('/consolidated', ctrl.getConsolidatedSessions);

// Get sessions by date range
router.get('/range', ctrl.getSessionsByRange);

// Add a new session
router.post('/', ctrl.addSession);

// Update a session
router.patch('/:id', ctrl.updateSession);

// Delete a session
router.delete('/:id', ctrl.deleteSession);

// PUT route for timetable revision (update by date and courseCode)
router.put('/', ctrl.upsertSession);

// Get total count of all sessions
router.get('/count', ctrl.getSessionCount);

module.exports = router;
