const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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
  getAllUsers,
  updateUser,
  deleteUser
};
