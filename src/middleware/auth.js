const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { response } = require('../utils/responseUtil');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response(res, 401, '需要身份验证');
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return response(res, 401, '无效的令牌');
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return response(res, 403, '需要管理员权限');
    }
    next();
  } catch (error) {
    return response(res, 500, '服务器错误');
  }
};

module.exports = { auth, adminAuth };
