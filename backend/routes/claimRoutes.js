const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/claimController');

// Get all claims
router.get('/', ctrl.getAllClaims);

// Add a new claim
router.post('/', ctrl.addClaim);

// Update a claim
router.patch('/:id', ctrl.updateClaim);

// Delete a claim
router.delete('/:id', ctrl.deleteClaim);

// Generate claims from duties
router.post('/generate', ctrl.generateClaimsFromDuties);

// Get claims by faculty
router.get('/faculty/:employeeId', ctrl.getAllClaimsByFaculty);

// Get advance claim details
router.get('/advance-details', ctrl.getAdvanceClaimDetails);

// Forward advance claim letter data
router.post('/forward-advance-letter', ctrl.forwardAdvanceClaimLetter);

// Get latest forwarded advance claim letter
router.get('/forwarded-advance-letter', ctrl.getForwardedAdvanceLetters);

// Get all types of claims
router.get('/all', ctrl.getAllTypesOfClaims);

// Patch (upsert) a claim by claimId
router.patch('/:claimId', ctrl.patchClaim);

// Get advance claim amount
router.get('/advance', ctrl.getAdvanceClaimAmount);

module.exports = router;
