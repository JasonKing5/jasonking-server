const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 创建交易记录
router.post('/', transactionController.create);

// 获取所有交易记录
router.get('/', transactionController.getAll);

// 获取特定交易记录
router.get('/:id', transactionController.getOne);

// 更新交易记录
router.put('/:id', transactionController.update);

// 删除交易记录
router.delete('/:id', transactionController.delete);

module.exports = router;
