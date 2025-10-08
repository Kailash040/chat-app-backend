const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'email or username already exists'
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        error: 'wrong email and password'
      });
    }

    const token = signToken(user._id);

    res.json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;