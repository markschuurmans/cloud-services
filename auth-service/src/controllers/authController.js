import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { email, password, role, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password and displayName are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash,
      role: role || 'participant',
      displayName
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role
      } 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'User account is deactivated' });
    }

    const payload = {
      sub: user._id,
      role: user.role,
      email: user.email,
      displayName: user.displayName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
};

export const validate = (req, res) => {
  // If the request reaches here, it means it already passed the authMiddleware
  // So standard validation applies and we can safely return the user payload
  res.status(200).json({
    valid: true,
    user: req.user
  });
};
