const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userOtp = require('../models/userOtp');
const User = require('../models/user');
const escapeRegExp = require('../utils/escapeRegExp');
const { generateOtp, cooldownOtp, limitOtp } = require('../utils/otp');
const { otpVerifyAccont, otpForgotPassword } = require('../utils/sendOtp');
require('dotenv').config();

// Helper to format user data
const userData = (u) => ({
  id: u._id.toString(),
  email: u.email,
  full_name: u.full_name,
  user_name: u.user_name,
  verified: u.verified,
});

exports.signup = async (req, res) => {
  try {
    const { email, full_name, user_name, password } = req.body;
    if (!email || !full_name || !user_name || !password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    // Unique email & username check
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingUserName = await User.findOne({ user_name });
    if (existingUserName) {
      return res.status(409).json({ message: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      full_name,
      user_name,
      password: hashedPassword,
    });

    // Generate and send OTP
    const { otp, otpHash, expires_at } = await generateOtp();

    await userOtp.deleteMany({ user_id: newUser._id });
    await userOtp.create({
      user_id: newUser._id,
      otp: otpHash,
      expires_at,
      purpose: 'Verify Account',
    });
    await otpVerifyAccont(email, otp);

    await newUser.save();
    return res.status(201).json({
      success: true,
      otp_sent: true,
      data: userData(newUser),
      info: {
        resend_count: newRecord.resend_count,
        expires_at: newRecord.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { user_id, otp } = req.body;
    if (!user_id || !otp) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const record = await userOtp.findOne({ user_id }).sort({ created_at: -1 });
    if (!record) return res.status(404).json({ message: 'OTP not found' });

    if (record.expires_at < new Date()) {
      await userOtp.deleteMany({ user_id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const match = await bcrypt.compare(otp, record.otp);
    if (!match) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    await userOtp.deleteMany({ user_id });
    await User.findByIdAndUpdate(user_id, { verified: true });

    return res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.verified)
      return res.status(400).json({ message: 'User already verified' });

    // Cooldown check
    const lastRecord = await userOtp
      .findOne({ user_id: user._id })
      .sort({ created_at: -1 });

    const cooldown = cooldownOtp(lastRecord, 60);
    if (cooldown) {
      return res.status(429).json({
        message: `Please wait ${cooldown.wait} seconds before requesting a new OTP`,
      });
    }

    // Resend limit
    const resendLimit = limitOtp(lastRecord, 3);
    if (resendLimit.limited) {
      return res.status(429).json({
        message: 'Maximum OTP resend attempts reached',
      });
    }
    const prevResendCount = resendLimit.count;

    // Generate and send OTP
    const { otp, otpHash, expires_at } = await generateOtp();

    await userOtp.deleteMany({ user_id: user._id });
    const newRecord = await userOtp.create({
      user_id: user._id,
      otp: otpHash,
      purpose: 'Forgot Password',
      expires_at,
      resend_count: prevResendCount + 1,
    });
    await otpVerifyAccont(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP resent',
      info: {
        resend_count: newRecord.resend_count,
        expires_at: newRecord.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const safeIdentifier = escapeRegExp(identifier.trim());
    const query = {
      $or: [
        { email: new RegExp(`^${safeIdentifier}$`, 'i') },
        { user_name: new RegExp(`^${safeIdentifier}$`, 'i') },
      ],
    };

    const user = await User.findOne(query);
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified)
      return res.status(403).json({ message: 'Account not verified' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      user_name: user.user_name,
      verified: user.verified,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_TTL || '7d',
    });

    return res.status(200).json({ token, data: userData(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.keepSignedIn = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id)
      .select('name user_name role')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ data: userData(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, 'i'),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cooldown check
    const lastRecord = await userOtp
      .findOne({ user_id: user._id, purpose: 'Forgot Password' })
      .sort({ created_at: -1 });

    const cooldown = cooldownOtp(lastRecord, 60);
    if (cooldown) {
      return res.status(429).json({
        message: `Please wait ${cooldown.wait} seconds before requesting a new OTP`,
      });
    }

    // Resend limit
    const resendLimit = limitOtp(lastRecord, 3);
    if (resendLimit.limited) {
      return res.status(429).json({
        message: 'Maximum OTP resend attempts reached',
      });
    }
    const prevResendCount = resendLimit.count;

    // Generate and send OTP
    const { otp, otpHash, expires_at } = await generateOtp();

    await userOtp.deleteMany({ user_id: user._id, purpose: 'Forgot Password' });
    const newRecord = await userOtp.create({
      user_id: user._id,
      otp: otpHash,
      expires_at,
      resend_count: prevResendCount + 1,
      purpose: 'Forgot Password',
    });

    // Send OTP
    await otpForgotPassword(user.email, otp, { purpose: 'Forgot Password' });

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email',
      info: {
        resend_count: newRecord.resend_count,
        expires_at: newRecord.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, 'i'),
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const record = await userOtp
      .findOne({ user_id: user._id, purpose: 'Forgot Password' })
      .sort({ created_at: -1 });

    if (!record) return res.status(404).json({ message: 'OTP not found' });

    if (record.expires_at < new Date()) {
      await userOtp.deleteMany({
        user_id: user._id,
        purpose: 'Forgot Password',
      });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const match = await bcrypt.compare(otp, record.otp);
    if (!match) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await userOtp.deleteMany({ user_id: user._id, purpose: 'Forgot Password' });

    return res
      .status(200)
      .json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.signout = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
