const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evaluationLetterController');

// Generate evaluation letter
router.get('/', ctrl.getLetter);

// Forward the evaluation letter
router.post('/forward', ctrl.forwardLetter);

// Get the latest forwarded evaluation letter (pending)
router.get('/forwarded', ctrl.getForwardedLetter);

// Get the very latest forwarded evaluation letter regardless of status
router.get('/latest', ctrl.getLatestLetter);

// Approve a specific evaluation letter
router.put('/:id/approve', ctrl.approveLetter);

// Reject a specific evaluation letter
router.put('/:id/reject', ctrl.rejectLetter);

module.exports = router;
