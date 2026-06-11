const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { auth, adminAuth } = require('../middleware/auth');
const { getJwtSecret } = require('../utils/jwtSecret');
const ctrl = require('../controllers/authController');


// 1. SETUP INITIAL ADMIN (Public setup)
router.post('/setup-admin', ctrl.setupAdmin); 


// 2. LOGIN ROUTE (Fixed Naming Disconnects)
router.post('/login', ctrl.login);

// 3. PUBLIC REGISTRATION ROUTE
router.post('/register', ctrl.register);


// 4. USER PROFILE ROUTE (Protected)
router.get('/profile', auth, ctrl.getProfile);

// 5. UPDATE PROFILE ROUTE (Protected)
router.patch('/profile', auth, ctrl.updateProfile);

// 6. GET ALL USERS (🛡️ Secured with adminAuth)
router.get('/users', adminAuth, ctrl.getAllUsers);

// 7. CHANGE USER STATUS (🛡️ Secured with adminAuth)
router.patch('/users/:id/status', adminAuth, ctrl.changeUserStatus);

// 8. FORGOT PASSWORD (🛡️ Unified for all roles)
router.post('/forgot-password', ctrl.forgotPassword); 


// 9. RESET PASSWORD (🛡️ Unified for all roles)
router.post('/reset-password/:token', ctrl.resetPassword);

module.exports = router;