const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { getJwtSecret } = require('../utils/jwtSecret');
const jwt = require('jsonwebtoken');
const { normalizeEmail, formatUserResponse } = require('../utils/helpers');
const { AppError, asyncHandler } = require('../utils/AppError');

exports.setupAdmin = asyncHandler(async (req, res) => {
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) throw new AppError('Admin user already exists', 400);

  const { name, email, password, department, employeeId } = req.body;
  if (!name || !email || !password || !employeeId) {
    throw new AppError('Required fields are missing.', 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { employeeId }] });
  if (existingUser) throw new AppError('User with this email or employee ID already exists', 400);

  const admin = new User({ name, email: normalizedEmail, password, department, employeeId, userId: employeeId, role: 'admin' });
  await admin.save();

  res.status(201).json({ message: 'Admin user created successfully', user: formatUserResponse(admin) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = typeof password === 'string' ? password.trim() : password;

  const user = await User.findOne({ email: normalizedEmail });
  const passwordMatches = user ? await user.comparePassword(normalizedPassword) : false;

  if (!user || !passwordMatches) throw new AppError('Invalid credentials', 401);
  if (user.isActive === false) throw new AppError('Your account has been deactivated.', 403);

  const token = jwt.sign({ userId: user._id }, getJwtSecret(), { expiresIn: '1h' });

  res.json({ token, user: formatUserResponse(user) });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email, and password are required.', 400);

  const normalizedEmail = normalizeEmail(email);
  const userId = req.body.userId || `FAC-${Date.now()}`;

  const existingUser = await User.findOne({ $or: [{ userId }, { email: normalizedEmail }] });
  if (existingUser) throw new AppError('User with this email already exists.', 400);

  const user = new User({
    userId, name, email: normalizedEmail, password, role: 'faculty', isActive: true,
    department: req.body.department, employeeId: req.body.employeeId,
    bankAccount: req.body.bankAccount, ifscCode: req.body.ifscCode
  });

  await user.save();

  await Faculty.findOneAndUpdate(
    { facultyId: userId },
    { facultyId: userId, name, email: normalizedEmail, department: req.body.department, employeeId: req.body.employeeId },
    { upsert: true, new: true }
  );

  res.status(201).json({ message: 'Registration successful. You can now log in.' });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: formatUserResponse(req.user) });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'bankAccount', 'ifscCode'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) throw new AppError('Invalid updates', 400);

  updates.forEach(update => req.user[update] = req.body[update]);
  await req.user.save();

  res.json({ message: 'Profile updated successfully', user: formatUserResponse(req.user) });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

exports.changeUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (typeof req.body.isActive !== 'boolean') throw new AppError('isActive must be a boolean value', 400);

  user.isActive = req.body.isActive;
  await user.save();

  res.json({ message: 'User status updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({ message: 'If that email exists, a password reset link has been generated.' });
  }

  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const sendEmail = require('../utils/email');
  await sendEmail({
    email: user.email,
    subject: 'PG Exam Portal - Password Reset',
    message: `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below (or copy and paste it into your browser) to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\nBest regards,\nPG Exam Portal Team`
  });

  res.json({ message: 'If that email exists, a password reset link has been generated.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) throw new AppError('New password is required', 400);

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError('Password reset token is invalid or has expired.', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in with your new password.' });
});
