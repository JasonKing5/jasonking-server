const habit = require('../models/habit');
const { success, error, StatusCodes } = require('../utils/responseUtil');

// 创建新习惯
const createHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitData = {
      user_id: userId,
      ...req.body
    };

    // 验证必填字段
    if (!habitData.name) {
      return error(res, StatusCodes.INVALID_PARAMS, '习惯名称不能为空');
    }

    const newHabit = await habit.create(habitData);
    
    return success(res, '习惯创建成功', newHabit);
  } catch (err) {
    console.error('创建习惯出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '创建习惯时发生错误', { error: err.message });
  }
};

// 获取用户的所有习惯
const getUserHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { frequency, is_active, start_date_after, start_date_before, sort_by, sort_order } = req.query;
    
    // 构建过滤参数
    const filters = {};
    
    if (frequency) filters.frequency = frequency;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (start_date_after) filters.start_date_after = start_date_after;
    if (start_date_before) filters.start_date_before = start_date_before;
    if (sort_by) filters.sort_by = sort_by;
    if (sort_order && ['ASC', 'DESC'].includes(sort_order.toUpperCase())) {
      filters.sort_order = sort_order.toUpperCase();
    }
    
    const habits = await habit.findAllByUser(userId, filters);
    
    return success(res, '获取习惯列表成功', habits);
  } catch (err) {
    console.error('获取习惯列表出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取习惯列表时发生错误', { error: err.message });
  }
};

// 获取单个习惯详情
const getHabitDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    
    const habitData = await habit.findById(habitId, userId);
    
    if (!habitData) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该习惯');
    }
    
    return success(res, '获取习惯详情成功', habitData);
  } catch (err) {
    console.error('获取习惯详情出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取习惯详情时发生错误', { error: err.message });
  }
};

// 更新习惯
const updateHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const updates = req.body;
    
    const updatedHabit = await habit.update(habitId, userId, updates);
    
    if (!updatedHabit) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该习惯');
    }
    
    return success(res, '习惯更新成功', updatedHabit);
  } catch (err) {
    console.error('更新习惯出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '更新习惯时发生错误', { error: err.message });
  }
};

// 删除习惯
const deleteHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    
    const result = await habit.delete(habitId, userId);
    
    if (!result) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该习惯');
    }
    
    return success(res, '习惯删除成功');
  } catch (err) {
    console.error('删除习惯出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '删除习惯时发生错误', { error: err.message });
  }
};

// 记录习惯完成情况
const logHabitCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const logData = req.body;
    
    const result = await habit.logHabit(habitId, userId, logData);
    
    if (!result) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该习惯');
    }
    
    return success(res, '习惯记录成功', result);
  } catch (err) {
    console.error('记录习惯出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '记录习惯时发生错误', { error: err.message });
  }
};

// 获取习惯日志
const getHabitLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const { status, date_after, date_before, sort_by, sort_order } = req.query;
    
    // 构建过滤参数
    const filters = {};
    
    if (status) filters.status = status;
    if (date_after) filters.date_after = date_after;
    if (date_before) filters.date_before = date_before;
    if (sort_by) filters.sort_by = sort_by;
    if (sort_order && ['ASC', 'DESC'].includes(sort_order.toUpperCase())) {
      filters.sort_order = sort_order.toUpperCase();
    }
    
    const logs = await habit.getHabitLogs(habitId, userId, filters);
    
    return success(res, '获取习惯日志成功', logs);
  } catch (err) {
    console.error('获取习惯日志出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取习惯日志时发生错误', { error: err.message });
  }
};

// 获取所有习惯的统计数据
const getHabitStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date_after, date_before } = req.query;
    
    // 构建过滤参数
    const filters = {};
    
    if (date_after) filters.date_after = date_after;
    if (date_before) filters.date_before = date_before;
    
    const stats = await habit.getStats(userId, filters);
    
    return success(res, '获取习惯统计成功', stats);
  } catch (err) {
    console.error('获取习惯统计出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取习惯统计时发生错误', { error: err.message });
  }
};

// 获取所有习惯日志
const getAllHabitLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, date_after, date_before, habit_id, sort_by, sort_order } = req.query;
    
    // 构建过滤参数
    const filters = {};
    
    if (status) filters.status = status;
    if (date_after) filters.date_after = date_after;
    if (date_before) filters.date_before = date_before;
    if (habit_id) filters.habit_id = habit_id;
    if (sort_by) filters.sort_by = sort_by;
    if (sort_order && ['ASC', 'DESC'].includes(sort_order.toUpperCase())) {
      filters.sort_order = sort_order.toUpperCase();
    }
    
    const logs = await habit.getAllUserHabitLogs(userId, filters);
    
    return success(res, '获取所有习惯日志成功', logs);
  } catch (err) {
    console.error('获取所有习惯日志出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取所有习惯日志时发生错误', { error: err.message });
  }
};

// 删除习惯日志
const deleteHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = req.params.logId;
    
    const result = await habit.deleteHabitLog(logId, userId);
    
    if (!result) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该日志');
    }
    
    return success(res, '习惯日志删除成功');
  } catch (err) {
    console.error('删除习惯日志出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '删除习惯日志时发生错误', { error: err.message });
  }
};

module.exports = {
  createHabit,
  getUserHabits,
  getHabitDetails,
  updateHabit,
  deleteHabit,
  logHabitCompletion,
  getHabitLogs,
  getHabitStats,
  getAllHabitLogs,
  deleteHabitLog
};
