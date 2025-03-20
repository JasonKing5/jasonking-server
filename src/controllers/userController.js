const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: 'All fields are required',
        data: null
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: 'Username already exists',
        data: null
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const user = await User.findById(userId);
    
    res.status(201).json({
      code: 201,
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Server error',
      data: null
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid credentials',
        data: null
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      code: 200,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Server error',
      data: null
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.json({
      code: 200,
      message: 'Users retrieved successfully',
      data: users.map(user => ({
        ...user,
        password: undefined
      }))
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Server error',
      data: null
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
        data: null
      });
    }

    // Only admin can modify role
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: 'Only admin can modify user role',
        data: null
      });
    }

    // Only admin or the user themselves can update their info
    if (req.user.role !== 'admin' && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({
        code: 403,
        message: 'Unauthorized access',
        data: null
      });
    }

    const success = await User.update(id, {
      username: username || user.username,
      email: email || user.email,
      role: role || user.role
    });

    if (success) {
      res.json({
        code: 200,
        message: 'User updated successfully',
        data: null
      });
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Server error',
      data: null
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User not found',
        data: null
      });
    }

    // Prevent deletion of root user
    if (user.username === 'root') {
      return res.status(403).json({
        code: 403,
        message: 'Cannot delete root user',
        data: null
      });
    }

    const success = await User.delete(id);

    if (success) {
      res.json({
        code: 200,
        message: 'User deleted successfully',
        data: null
      });
    } else {
      throw new Error('Delete failed');
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Server error',
      data: null
    });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser
};
