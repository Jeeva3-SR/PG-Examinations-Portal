const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { auth, adminAuth } = require('../middleware/auth');
const { getJwtSecret } = require('../utils/jwtSecret');
const jwt = require('jsonwebtoken');

exports.setupAdmin = async (req, res) => {
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
}

exports.login = async (req, res) => {
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
      getJwtSecret(),
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
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userId = req.body.userId || `FAC-${Date.now()}`;

    const existingUser = await User.findOne({ 
      $or: [{ userId }, { email: normalizedEmail }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = new User({
      userId,
      name,
      email: normalizedEmail,
      password,
      role: 'faculty',
      isActive: true,
      department: req.body.department,
      employeeId: req.body.employeeId,
      bankAccount: req.body.bankAccount,
      ifscCode: req.body.ifscCode
    });
    
    await user.save();

    await Faculty.findOneAndUpdate(
      { facultyId: userId },
      { facultyId: userId, name, email: normalizedEmail, department: req.body.department, employeeId: req.body.employeeId },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

exports.getProfile = async (req, res) => {
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
}

exports.updateProfile = async (req, res) => {
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
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

exports.changeUserStatus = async (req, res) => {
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
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return 200 for security, preventing account enumeration
      return res.json({ message: 'If that email exists, a password reset link has been generated.' });
    }

    // Generate secure random token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Reset Link URL (forces port 3000 for frontend dev server)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const sendEmail = require('../utils/email');
    await sendEmail({
      email: user.email,
      subject: 'PG Exam Portal - Password Reset',
      message: `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below (or copy and paste it into your browser) to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\nBest regards,\nPG Exam Portal Team`
    });

    res.json({ message: 'If that email exists, a password reset link has been generated.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
} 