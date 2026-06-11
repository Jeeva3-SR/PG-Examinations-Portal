const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coordinatorController');

// GET /api/coordinator - get the first coordinator
router.get('/', ctrl.getCoordinator);

module.exports = router;
