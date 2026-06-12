const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/letterController');

// Get data for the advance claim letter and save it
router.get('/advance-claim', ctrl.getAdvanceClaim);

// Forward the advance requisition letter
router.post('/advance-requisition/forward', ctrl.forwardAdvanceRequisition);

// Get the latest pending forwarded advance requisition letter
router.get('/advance-requisition/forwarded', ctrl.getForwardedAdvanceRequisition);

// Get the very latest forwarded advance requisition letter
router.get('/advance-requisition/latest', ctrl.getLatestAdvanceRequisition);

// Approve an advance requisition letter by id
router.put('/advance-requisition/:id/approve', ctrl.approveAdvanceRequisition);

// Reject an advance requisition letter by id
router.put('/advance-requisition/:id/reject', ctrl.rejectAdvanceRequisition);

module.exports = router;
