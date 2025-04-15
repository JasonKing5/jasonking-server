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
    const { id, username, email } = req.body;

    // 确保用户只能更新自己的信息
    if (req.user.username !== 'root' && req.user.id !== parseInt(id)) {
      return error(res, StatusCodes.NO_PERMISSION, '无权修改其他用户信息');
    }
    
    // 准备更新数据
    const userData = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   userData.password = await bcrypt.hash(password, salt);
    // }
    
    const updatedUser = await User.update(id, userData);
    
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



// 新增用户
const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    // 参数校验
    if (!username || !email) {
      return error(res, StatusCodes.INVALID_PARAMS, '用户名和邮箱为必填项');
    }

    // 检查用户名/邮箱是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return error(res, StatusCodes.DATA_CONFLICT, '用户名已存在');
    }
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return error(res, StatusCodes.DATA_CONFLICT, '邮箱已存在');
    }

    // 默认密码加密
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 创建用户
    const userData = {
      username,
      email,
      role: 'user',
      password: hashedPassword
    };

    const userId = await User.create(userData);
    const user = await User.findById(userId);

    return success(res, '用户创建成功', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('后台创建用户错误:', err);
    return response(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

const deleteUser = async (req, res) => {
  try {
    // 确保用户只能删除自己的账号
    if (req.user.username !== 'root' && req.user.id !== parseInt(req.params.id)) {
      return error(res, StatusCodes.NO_PERMISSION, '无权删除其他用户账号');
    }

    const user = await User.findById(req.params.id);
    
    // 特殊保护：不允许删除root用户
    if (user.username === 'root') {
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
  createUser,
  deleteUser
};
