const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

// 所有任务路由都需要认证
router.use(auth);

// 创建任务
router.post('/', taskController.createTask);

// 获取用户所有任务
router.get('/', taskController.getUserTasks);

// 获取单个任务
router.get('/:id', taskController.getTaskById);

// 更新任务
router.put('/:id', taskController.updateTask);

// 删除任务
router.delete('/:id', taskController.deleteTask);

// 获取任务统计
router.get('/stats/overview', taskController.getTaskStats);

// 批量更新任务状态
router.patch('/bulk/status', taskController.bulkUpdateTaskStatus);

module.exports = router;
