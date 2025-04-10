const task = require('../models/task');
const { success, error, StatusCodes } = require('../utils/responseUtil');

// 创建任务
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, due_date, priority, status, category } = req.body;
    
    // 验证必填字段
    if (!title) {
      return error(res, StatusCodes.INVALID_PARAMS, '任务标题不能为空');
    }
    
    // 创建任务数据
    const taskData = {
      user_id: userId,
      title,
      description: description || '',
      due_date: due_date || null,
      priority: priority || 'medium',
      status: status || 'pending',
      category: category || 'default'
    };
    
    const newTask = await task.create(taskData);
    
    return success(res, '任务创建成功', newTask);
  } catch (err) {
    console.error('创建任务出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '创建任务时发生错误', { error: err.message });
  }
};

// 获取用户的所有任务
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority, category, due_date_after, due_date_before, sort_by, sort_order } = req.query;
    
    // 构建过滤参数
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (due_date_after) filters.due_date_after = due_date_after;
    if (due_date_before) filters.due_date_before = due_date_before;
    if (sort_by) filters.sort_by = sort_by;
    if (sort_order && ['ASC', 'DESC'].includes(sort_order.toUpperCase())) {
      filters.sort_order = sort_order.toUpperCase();
    }
    
    const tasks = await task.findAllByUser(userId, filters);
    
    return success(res, '获取任务列表成功', tasks);
  } catch (err) {
    console.error('获取任务列表出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取任务列表时发生错误', { error: err.message });
  }
};

// 获取单个任务详情
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    const taskData = await task.findById(taskId, userId);
    
    if (!taskData) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该任务');
    }
    
    return success(res, '获取任务详情成功', taskData);
  } catch (err) {
    console.error('获取任务详情出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取任务详情时发生错误', { error: err.message });
  }
};

// 更新任务
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const updates = req.body;
    
    // 验证任务存在性
    const existingTask = await task.findById(taskId, userId);
    if (!existingTask) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该任务');
    }
    
    const updatedTask = await task.update(taskId, userId, updates);
    
    return success(res, '任务更新成功', updatedTask);
  } catch (err) {
    console.error('更新任务出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '更新任务时发生错误', { error: err.message });
  }
};

// 删除任务
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    
    // 验证任务存在性
    const existingTask = await task.findById(taskId, userId);
    if (!existingTask) {
      return error(res, StatusCodes.NOT_FOUND, '未找到该任务');
    }
    
    await task.delete(taskId, userId);
    
    return success(res, '任务删除成功');
  } catch (err) {
    console.error('删除任务出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '删除任务时发生错误', { error: err.message });
  }
};

// 批量更新任务状态
const bulkUpdateTaskStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_ids, status } = req.body;
    
    // 验证请求数据
    if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
      return error(res, StatusCodes.INVALID_PARAMS, '任务ID列表不能为空');
    }
    
    if (!status) {
      return error(res, StatusCodes.INVALID_PARAMS, '状态不能为空');
    }
    
    // 检查所有任务是否属于当前用户
    const tasks = await task.findByIds(task_ids, userId);
    if (tasks.length !== task_ids.length) {
      return error(res, StatusCodes.NOT_FOUND, '部分任务不存在或不属于当前用户');
    }
    
    // 批量更新状态
    await task.bulkUpdateStatus(task_ids, userId, status);
    
    return success(res, '任务状态批量更新成功');
  } catch (err) {
    console.error('批量更新任务状态出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '批量更新任务状态时发生错误', { error: err.message });
  }
};

// 获取任务统计信息
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await task.getStats(userId);
    
    return success(res, '获取任务统计信息成功', stats);
  } catch (err) {
    console.error('获取任务统计信息出错:', err);
    return error(res, StatusCodes.SERVER_ERROR, '获取任务统计信息时发生错误', { error: err.message });
  }
};

module.exports = {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
  bulkUpdateTaskStatus,
  getTaskStats
};
