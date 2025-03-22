const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// 注册路由
router.post('/register', authController.register);

// 登录路由
router.post('/login', authController.login);

module.exports = router;
