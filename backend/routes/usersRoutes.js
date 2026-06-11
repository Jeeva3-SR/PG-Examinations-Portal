const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/usersController');

// Get all users
router.get('/', auth, ctrl.getAllUsers);

// Get user by userId
router.get('/:userId', ctrl.getUserByUserId);

// HOD reset password
router.post('/hod/reset-password', ctrl.hodResetPassword);

// HOD login
router.post('/hod/login', ctrl.hodLogin);

// Coordinator reset password
router.post('/coordinator/reset-password', ctrl.coordinatorResetPassword);

// Coordinator login
router.post('/coordinator/login', ctrl.coordinatorLogin);

module.exports = router;
