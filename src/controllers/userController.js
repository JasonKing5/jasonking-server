const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { response } = require('../utils/responseUtil');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    return response(res, 200, '获取用户列表成功', users.map(user => ({
      ...user,
      password: undefined
    })));
  } catch (error) {
    return response(res, 500, '服务器错误');
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return response(res, 404, '用户不存在');
    }
    
    const { password, ...userWithoutPassword } = user;
    return response(res, 200, '获取用户信息成功', userWithoutPassword);
  } catch (error) {
    return response(res, 500, '服务器错误');
  }
};

const updateUser = async (req, res) => {
  try {
    // 确保用户只能更新自己的信息
    if (req.user.id !== parseInt(req.params.id)) {
      return response(res, 403, '无权修改其他用户信息');
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
      return response(res, 404, '用户不存在');
    }
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return response(res, 200, '用户信息更新成功', userWithoutPassword);
  } catch (error) {
    return response(res, 500, '服务器错误', { error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    // 确保用户只能删除自己的账号
    if (req.user.id !== parseInt(req.params.id)) {
      return response(res, 403, '无权删除其他用户账号');
    }
    
    // 特殊保护：不允许删除root用户
    if (req.user.username === 'root') {
      return response(res, 403, '不允许删除root用户');
    }
    
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return response(res, 404, '用户不存在');
    }
    
    return response(res, 200, '用户删除成功');
  } catch (error) {
    return response(res, 500, '服务器错误');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
