const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateOtp = require('../utils/generateOtp');
const sendOtp = require('../utils/sendOtp');
const userOtp = require('../models/userOtp');
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
    await newUser.save();

    // Generate and send OTP
    const otp = generateOtp(6);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    await userOtp.deleteMany({ user_id: newUser._id });
    await userOtp.create({
      user_id: newUser._id,
      otp: otpHash,
      expires_at: otpExpiry,
    });
    await sendOtp(email, otp);

    return res
      .status(201)
      .json({ success: true, otp_sent: true, data: userData(newUser) });
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

exports.signin = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
      return res.status(400).json({ message: 'Fields are required' });
    }

    const user = await User.findOne({ user_name });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_TTL,
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
