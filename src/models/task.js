const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

// 将tags对象转换为JSON字符串
const formatTags = (tags) => {
  if (!tags) return null;
  return JSON.stringify(tags);
};

// 将JSON字符串转换为tags对象
const parseTags = (tagsJson) => {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch (error) {
    console.error('Error parsing tags JSON:', error);
    return [];
  }
};

// 格式化日期为 MySQL datetime 格式
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') {
    // 将 ISO 字符串转换为 Date 对象
    date = new Date(date);
  }
  
  // 格式化为MySQL datetime格式: YYYY-MM-DD HH:MM:SS
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// 创建任务
const create = async (taskData) => {
  try {
    const { user_id, title, description, due_date, priority, status, category, tags } = taskData;
    
    const [result] = await pool.execute(
      `INSERT INTO tasks 
       (user_id, title, description, due_date, priority, status, category, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, 
        title, 
        description || null, 
        formatDate(due_date), 
        priority || 'medium', 
        status || 'not_started', 
        category || null,
        formatTags(tags)
      ]
    );
    
    return { id: result.insertId, ...taskData };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// 获取用户的所有任务
const findAllByUser = async (userId, filters = {}) => {
  try {
    const conditions = ['user_id = ?'];
    const params = [userId];
    
    // 添加过滤条件
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    
    if (filters.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }
    
    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    
    if (filters.due_date_before) {
      conditions.push('due_date <= ?');
      params.push(filters.due_date_before);
    }
    
    if (filters.due_date_after) {
      conditions.push('due_date >= ?');
      params.push(filters.due_date_after);
    }
    
    const query = `
      SELECT * FROM tasks 
      WHERE ${conditions.join(' AND ')} 
      ORDER BY ${filters.sort_by || 'created_at'} ${filters.sort_order || 'DESC'}
    `;
    
    const [tasks] = await pool.execute(query, params);
    
    // 将JSON字符串转换为JavaScript对象
    return tasks.map(task => ({
      ...task,
      tags: parseTags(task.tags)
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// 根据ID获取任务
const findById = async (taskId, userId) => {
  try {
    const [tasks] = await pool.execute(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [taskId, userId]
    );
    
    if (tasks.length === 0) {
      return null;
    }
    
    const task = tasks[0];
    // 将JSON字符串转换为JavaScript对象
    return {
      ...task,
      tags: parseTags(task.tags)
    };
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    throw error;
  }
};

// 更新任务
const update = async (taskId, userId, updates) => {
  try {
    // 首先检查任务是否存在以及是否属于该用户
    const task = await findById(taskId, userId);
    if (!task) {
      return null;
    }
    
    const allowedFields = ['title', 'description', 'due_date', 'priority', 'status', 'category', 'tags'];
    const updateFields = [];
    const values = [];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        // 如果是tags字段，需要格式化
        if (field === 'tags') {
          values.push(formatTags(updates[field]));
        } 
        // 如果是due_date字段，需要格式化日期
        else if (field === 'due_date') {
          values.push(formatDate(updates[field]));
        }
        else {
          values.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) return task;
    
    values.push(taskId, userId);
    
    await pool.execute(
      `UPDATE tasks 
       SET ${updateFields.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      values
    );
    
    return await findById(taskId, userId);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// 删除任务
const deleteTask = async (taskId, userId) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
      [taskId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// 获取统计数据
const getStats = async (userId) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as not_started,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority_count,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority_count,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count,
        SUM(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue
      FROM tasks
      WHERE user_id = ?`,
      [userId]
    );
    
    return stats[0];
  } catch (error) {
    console.error('Error getting task stats:', error);
    throw error;
  }
};

// 批量更新任务状态
const bulkUpdateStatus = async (userId, taskIds, status) => {
  try {
    if (!taskIds || taskIds.length === 0) {
      return { success: false, message: '没有提供任务ID' };
    }
    
    // 构建参数占位符
    const placeholders = taskIds.map(() => '?').join(',');
    
    // 构建参数数组
    const params = [status, ...taskIds, userId];
    
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET status = ? 
       WHERE id IN (${placeholders}) AND user_id = ?`,
      params
    );
    
    return { 
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('Error bulk updating task status:', error);
    throw error;
  }
};

module.exports = {
  create,
  findAllByUser,
  findById,
  update,
  delete: deleteTask,
  getStats,
  bulkUpdateStatus
};
