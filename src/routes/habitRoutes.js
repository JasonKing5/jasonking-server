const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { auth } = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 习惯基本CRUD操作
router.post('/', habitController.createHabit);
router.get('/', habitController.getUserHabits);
router.get('/:id', habitController.getHabitDetails);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

// 习惯日志相关操作
router.post('/:id/logs', habitController.logHabitCompletion);
router.get('/:id/logs', habitController.getHabitLogs);

// 习惯统计与综合查询
router.get('/stats/summary', habitController.getHabitStats);
router.get('/logs/all', habitController.getAllHabitLogs);

// 删除习惯日志
router.delete('/logs/:logId', habitController.deleteHabitLog);

module.exports = router;
