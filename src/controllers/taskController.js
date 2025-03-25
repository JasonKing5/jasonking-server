const Task = require('../models/task');
const { response } = require('../utils/responseUtil');

// 任务控制器
const taskController = {
  // 创建任务
  async createTask(req, res) {
    try {
      const { title, description, due_date, priority, status, category, tags } = req.body;
      
      // 验证必填字段
      if (!title) {
        return response(res, 400, '任务标题不能为空');
      }
      
      // 从认证中获取用户ID
      const userId = req.user.id;
      
      // 创建任务对象
      const taskData = {
        user_id: userId,
        title,
        description,
        due_date,
        priority,
        status,
        category,
        tags
      };
      
      // 保存到数据库
      const newTask = await Task.create(taskData);
      
      return response(res, 201, '任务创建成功', newTask);
    } catch (error) {
      console.error('创建任务出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 获取用户所有任务
  async getUserTasks(req, res) {
    try {
      const userId = req.user.id;
      
      // 从查询参数中获取过滤条件
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category: req.query.category,
        due_date_before: req.query.due_date_before,
        due_date_after: req.query.due_date_after,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };
      
      // 查询数据库
      const tasks = await Task.findAllByUser(userId, filters);
      
      return response(res, 200, '任务获取成功', tasks);
    } catch (error) {
      console.error('获取任务列表出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 获取单个任务详情
  async getTaskById(req, res) {
    try {
      const taskId = req.params.id;
      const userId = req.user.id;
      
      // 查询数据库
      const task = await Task.findById(taskId, userId);
      
      if (!task) {
        return response(res, 404, '任务不存在或无权访问');
      }
      
      return response(res, 200, '任务获取成功', task);
    } catch (error) {
      console.error('获取任务详情出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 更新任务
  async updateTask(req, res) {
    try {
      const taskId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;
      
      // 更新数据库
      const updatedTask = await Task.update(taskId, userId, updateData);
      
      if (!updatedTask) {
        return response(res, 404, '任务不存在或无权访问');
      }
      
      return response(res, 200, '任务更新成功', updatedTask);
    } catch (error) {
      console.error('更新任务出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 删除任务
  async deleteTask(req, res) {
    try {
      const taskId = req.params.id;
      const userId = req.user.id;
      
      // 从数据库删除
      const result = await Task.delete(taskId, userId);
      
      if (!result) {
        return response(res, 404, '任务不存在或无权访问');
      }
      
      return response(res, 200, '任务删除成功');
    } catch (error) {
      console.error('删除任务出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 获取任务统计数据
  async getTaskStats(req, res) {
    try {
      const userId = req.user.id;
      
      // 查询统计数据
      const stats = await Task.getStats(userId);
      
      return response(res, 200, '统计数据获取成功', stats);
    } catch (error) {
      console.error('获取任务统计数据出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  },
  
  // 批量更新任务状态
  async bulkUpdateTaskStatus(req, res) {
    try {
      const userId = req.user.id;
      const { task_ids, status } = req.body;
      
      // 验证必填字段
      if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
        return response(res, 400, '任务ID列表不能为空');
      }
      
      if (!status) {
        return response(res, 400, '状态不能为空');
      }
      
      // 验证状态值是否有效
      const validStatuses = ['not_started', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return response(res, 400, '无效的状态值');
      }
      
      // 批量更新
      const result = await Task.bulkUpdateStatus(userId, task_ids, status);
      
      if (!result.success) {
        return response(res, 400, result.message || '批量更新失败');
      }
      
      return response(res, 200, '批量更新成功', {
        affected_rows: result.affectedRows
      });
    } catch (error) {
      console.error('批量更新任务状态出错:', error);
      return response(res, 500, '服务器内部错误');
    }
  }
};

module.exports = taskController;
