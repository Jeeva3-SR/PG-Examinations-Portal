const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserByUserId = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.hodResetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: 'csehod@annauniv.edu', role: 'hod' });
    if (!user) return res.status(404).json({ error: 'HOD user not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.hodLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'hod' });
    if (!user) return res.status(404).json({ error: 'HOD user not found' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.coordinatorResetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: 'coordinator@annauniv.edu', role: 'coordinator' });
    if (!user) return res.status(404).json({ error: 'Coordinator user not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.coordinatorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'coordinator' });
    if (!user) return res.status(404).json({ error: 'Coordinator user not found' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
