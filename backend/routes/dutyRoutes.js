const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dutyController');

// Get all duties
router.get('/', ctrl.getDuties);

// Save duty assignments (batch)
router.post('/', ctrl.addDuty);

// Update a duty
router.patch('/:id', ctrl.updateDuty);

// Delete a duty
router.delete('/:id', ctrl.deleteDuty);

// Get duties by date range
router.get('/range', ctrl.getByRange);

// Auto-generate duties for a session
router.post('/generate/:sessionId', ctrl.generate);

// Get distinct dates and sessions
router.get('/dates', ctrl.getDates);

// Get distinct rooms for a date and session
router.get('/rooms', ctrl.getRooms);

// Get duties for a specific faculty
router.get('/faculty/:facultyId', ctrl.getByFaculty);

// Mark duty as completed or not completed
router.post('/completed-duties', ctrl.markCompleted);

// Remove completed duty record
router.delete('/completed-duties/:dutyId', ctrl.removeCompleted);

// Get all completed duty records
router.get('/completed-duties', ctrl.getCompleted);

// Mark duty as completed by id
router.post('/:id/complete', ctrl.complete);

module.exports = router;
