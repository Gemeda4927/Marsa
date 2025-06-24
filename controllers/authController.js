const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
// const sendEmail = require('../config/email');

// 🔐 Generate JWT Token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// ✨ USER AUTH CONTROLLERS ✨

// 🆕 SIGNUP
exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      passwordConfirm,
      role,
      bio,
      skills,
      profilePic,
    } = req.body;

    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
      bio,
      skills,
      profilePic,
    });

    const token = signToken(newUser._id);
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// 🔑 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: '📛 Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: '❌ Incorrect email or password',
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '🔥 Server error',
    });
  }
};

// 🛡️ PROTECT MIDDLEWARE
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: '🔒 You are not logged in!',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: '👤 User no longer exists.',
      });
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: '🔄 Password changed recently. Please log in again.',
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: '❌ Invalid or expired token.',
    });
  }
};

// 👮 ROLE RESTRICTION MIDDLEWARE
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: '⛔ You do not have permission to perform this action',
      });
    }
    next();
  };
};

// 📧 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: '📭 No user found with that email.',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: '📨 Reset token sent to email!',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '💥 Error sending reset token. Try again later.',
    });
  }
};

// 🔄 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: '⌛ Token is invalid or has expired',
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '💣 Could not reset password',
    });
  }
};

// ✏️ UPDATE CURRENT USER DATA (name, email, etc.)
exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'bio', 'skills', 'profilePic'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field]) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: '📝 Failed to update user data',
    });
  }
};

// ✅ UPDATE CURRENT USER PASSWORD
exports.updateMyPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: '❌ Your current password is incorrect',
      });
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '🔐 Could not update password',
    });
  }
};

// ❌ DELETE CURRENT USER
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(204).json({
      status: 'success',
      data: null,
      message: '🗑️ User deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '❌ Failed to delete user',
    });
  }
};
