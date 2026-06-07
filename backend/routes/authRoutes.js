const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// ==========================================
// 1. SETUP INITIAL ADMIN (Public setup)
// ==========================================
router.post('/setup-admin', async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const { name, email, password, department, employeeId } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or employee ID already exists'
      });
    }

    const admin = new User({
      name,
      email: normalizedEmail,
      password,
      department,
      employeeId,
      userId: employeeId,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        employeeId: admin.employeeId,
        userId: admin.userId,
        facultyId: admin.userId // Backward-compatibility safety key
      }
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 2. LOGIN ROUTE (🛡️ Fixed Naming Disconnects)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password.trim() : password;

    // Fetch account profile matching email parameters
    const user = await User.findOne({ email: normalizedEmail });
    const passwordMatches = user ? await user.comparePassword(normalizedPassword) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Safety fallback block if user account is disabled
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Dynamic resolution layer capturing internal identifiers safely
    const finalFacultyId = user.userId || user.employeeId || user._id.toString();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        userId: finalFacultyId,      // Matches views looking for data.userId
        facultyId: finalFacultyId   // 🛡️ FIXES QPORDERS ROUTE LOOPS
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 3. PUBLIC REGISTRATION ROUTE
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { userId, name, email, password } = req.body;

    // Validate required fields
    if (!userId || !name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate userId or email to ensure database consistency
    const existingUser = await User.findOne({ 
      $or: [{ userId }, { email: normalizedEmail }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this userId or email already exists.' });
    }

    // Create and save new user doc
    const user = new User({
      userId,
      name,
      email: normalizedEmail,
      password,
      role: 'faculty', // Force safe baseline tier privileges
      isActive: true   // Ensures immediate middleware validation clearance
    });
    
    await user.save();

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 4. USER PROFILE ROUTE (Protected)
// ==========================================
router.get('/profile', auth, async (req, res) => {
  try {
    const finalFacultyId = req.user.userId || req.user.employeeId || req.user._id.toString();
    
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        employeeId: req.user.employeeId,
        bankAccount: req.user.bankAccount,
        ifscCode: req.user.ifscCode,
        userId: finalFacultyId,
        facultyId: finalFacultyId // Backward-compatibility safety key
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 5. UPDATE PROFILE ROUTE (Protected)
// ==========================================
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'bankAccount', 'ifscCode'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    const finalFacultyId = req.user.userId || req.user.employeeId || req.user._id.toString();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        employeeId: req.user.employeeId,
        bankAccount: req.user.bankAccount,
        ifscCode: req.user.ifscCode,
        userId: finalFacultyId,
        facultyId: finalFacultyId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 6. GET ALL USERS (🛡️ Secured with adminAuth)
// ==========================================
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// 7. CHANGE USER STATUS (🛡️ Secured with adminAuth)
// ==========================================
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;