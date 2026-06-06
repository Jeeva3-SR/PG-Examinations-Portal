const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get user by userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// HOD reset password
router.post('/hod/reset-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Only allow for the HOD user
    const user = await User.findOne({ email: 'csehod@annauniv.edu', role: 'hod' });
    if (!user) {
      return res.status(404).json({ error: 'HOD user not found' });
    }
    const isMatch = currentPassword === user.password;
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// HOD login
router.post('/hod/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'hod' });
    if (!user) {
      return res.status(404).json({ error: 'HOD user not found' });
    }
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Coordinator reset password
router.post('/coordinator/reset-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Only allow for the Coordinator user
    const user = await User.findOne({ email: 'coordinator@annauniv.edu', role: 'coordinator' });
    if (!user) {
      return res.status(404).json({ error: 'Coordinator user not found' });
    }
    const isMatch = currentPassword === user.password;
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Coordinator login
router.post('/coordinator/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'coordinator' });
    if (!user) {
      return res.status(404).json({ error: 'Coordinator user not found' });
    }
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 