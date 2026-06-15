const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coordinatorController');

router.get('/', ctrl.getCoordinator);

module.exports = router;
