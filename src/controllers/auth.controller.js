const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userData = (u) => ({
  id: u._id.toString(),
  name: u.name,
  user_name: u.user_name,
  role: u.role,
});

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
