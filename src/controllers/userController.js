const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { response, success, error, StatusCodes } = require('../utils/responseUtil');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    return success(res, '获取用户列表成功', users.map(user => ({
      ...user,
      password: undefined
    })));
  } catch (err) {
    console.error('获取用户列表错误:', err);
    return error(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return error(res, StatusCodes.NOT_FOUND, '用户不存在');
    }
    
    const { password, ...userWithoutPassword } = user;
    return success(res, '获取用户信息成功', userWithoutPassword);
  } catch (err) {
    console.error('获取用户信息错误:', err);
    return error(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

const updateUser = async (req, res) => {
  try {
    // 确保用户只能更新自己的信息
    if (req.user.id !== parseInt(req.params.id)) {
      return error(res, StatusCodes.NO_PERMISSION, '无权修改其他用户信息');
    }
    
    const { username, email, password } = req.body;
    
    // 准备更新数据
    const userData = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }
    
    const updatedUser = await User.update(req.params.id, userData);
    
    if (!updatedUser) {
      return error(res, StatusCodes.NOT_FOUND, '用户不存在');
    }
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return success(res, '用户信息更新成功', userWithoutPassword);
  } catch (err) {
    console.error('更新用户信息错误:', err);
    return error(res, StatusCodes.SERVER_ERROR, '服务器错误', { error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    // 确保用户只能删除自己的账号
    if (req.user.id !== parseInt(req.params.id)) {
      return error(res, StatusCodes.NO_PERMISSION, '无权删除其他用户账号');
    }
    
    // 特殊保护：不允许删除root用户
    if (req.user.username === 'root') {
      return error(res, StatusCodes.NO_PERMISSION, '不允许删除root用户');
    }
    
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return error(res, StatusCodes.NOT_FOUND, '用户不存在');
    }
    
    return success(res, '用户删除成功');
  } catch (err) {
    console.error('删除用户错误:', err);
    return error(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
