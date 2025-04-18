const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { response, success, error, StatusCodes } = require('../utils/responseUtil');
const { sendResetPasswordEmail } = require('../services/emailService.js');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return error(res, StatusCodes.INVALID_PARAMS, '所有字段都是必填的');
    }

    // 检查用户是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return error(res, StatusCodes.DATA_CONFLICT, '用户名已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userData = {
      username,
      email,
      password: hashedPassword
    };
    
    const userId = await User.create(userData);
    const user = await User.findById(userId);
    
    return success(res, '用户注册成功', {
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('注册错误:', error);
    return response(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findByEmail(email);
    if (!user) {
      return error(res, StatusCodes.NOT_LOGGED_IN, '该用户不存在');
    }

    // 检查密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, StatusCodes.NOT_LOGGED_IN, '账号或密码错误');
    }

    // 生成令牌
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return success(res, '登录成功', {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('登录错误:', err);
    return error(res, StatusCodes.SERVER_ERROR, '服务器错误');
  }
};

// 用户重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return error(res, StatusCodes.INVALID_PARAMS, '缺少邮箱地址')
    }

    // 查找用户
    const user = await User.findByEmail(email)
    if (!user) {
      return error(res, StatusCodes.NOT_LOGGED_IN, '该用户不存在')
    }

    // 生成一个临时 token 或 reset 链接，这里简化为随机字符串
    const resetToken = Math.random().toString(36).substr(2)

    const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`

    await sendResetPasswordEmail(email, resetUrl)
    return success(res, '重置密码邮件已发送，请查收！')
  } catch (error) {
    console.error("发送邮件失败:", error)
    return error(res, StatusCodes.SERVER_ERROR, '发送邮件失败')
  }
};