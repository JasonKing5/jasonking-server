const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: 'Authentication required',
        data: null
      });
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
    res.status(401).json({
      code: 401,
      message: 'Invalid token',
      data: null
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: 'Admin access required',
        data: null
      });
    }
    next();
  } catch (error) {
    res.status(403).json({
      code: 403,
      message: 'Unauthorized access',
      data: null
    });
  }
};

module.exports = { auth, adminAuth };
