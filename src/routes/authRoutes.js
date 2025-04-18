const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// 注册路由
router.post('/register', authController.register);

// 登录路由
router.post('/login', authController.login);

// 重置密码路由
router.post('/reset', authController.resetPassword);

module.exports = router;
