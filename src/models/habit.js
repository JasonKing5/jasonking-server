const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

// 格式化日期为 MySQL date 格式
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') {
    // 将 ISO 字符串转换为 Date 对象
    date = new Date(date);
  }
  
  // 格式化为 MySQL date 格式: YYYY-MM-DD
  return date.toISOString().slice(0, 10);
};

// 格式化时间为 MySQL time 格式
const formatTime = (time) => {
  if (!time) return null;
  return time;
};

// 格式化 JSON 配置
const formatConfig = (config) => {
  if (!config) return null;
  return JSON.stringify(config);
};

// 解析 JSON 配置
const parseConfig = (jsonConfig) => {
  if (!jsonConfig) return null;
  try {
    return JSON.parse(jsonConfig);
  } catch (error) {
    console.error('Error parsing JSON config:', error);
    return null;
  }
};

// 创建习惯
const create = async (habitData) => {
  try {
    const { 
      user_id, 
      name, 
      description, 
      frequency, 
      frequency_config, 
      reminder_time, 
      start_date, 
      end_date,
      color,
      icon,
      is_active
    } = habitData;
    
    const [result] = await pool.execute(
      `INSERT INTO habits 
       (user_id, name, description, frequency, frequency_config, reminder_time, 
        start_date, end_date, color, icon, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, 
        name, 
        description || null, 
        frequency || 'daily', 
        formatConfig(frequency_config),
        formatTime(reminder_time),
        formatDate(start_date || new Date()),
        formatDate(end_date),
        color || null,
        icon || null,
        is_active === undefined ? true : is_active
      ]
    );
    
    return { id: result.insertId, ...habitData };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

// 获取用户的所有习惯
const findAllByUser = async (userId, filters = {}) => {
  try {
    const conditions = ['user_id = ?'];
    const params = [userId];
    
    // 添加过滤条件
    if (filters.frequency) {
      conditions.push('frequency = ?');
      params.push(filters.frequency);
    }
    
    if (filters.is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(filters.is_active);
    }
    
    if (filters.start_date_after) {
      conditions.push('start_date >= ?');
      params.push(formatDate(filters.start_date_after));
    }
    
    if (filters.start_date_before) {
      conditions.push('start_date <= ?');
      params.push(formatDate(filters.start_date_before));
    }
    
    const query = `
      SELECT * FROM habits 
      WHERE ${conditions.join(' AND ')} 
      ORDER BY ${filters.sort_by || 'created_at'} ${filters.sort_order || 'DESC'}
    `;
    
    const [habits] = await pool.execute(query, params);
    
    // 将JSON字符串转换为JavaScript对象
    return habits.map(habit => ({
      ...habit,
      frequency_config: parseConfig(habit.frequency_config)
    }));
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

// 根据ID获取习惯
const findById = async (habitId, userId) => {
  try {
    const [habits] = await pool.execute(
      `SELECT * FROM habits WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );
    
    if (habits.length === 0) {
      return null;
    }
    
    const habit = habits[0];
    return {
      ...habit,
      frequency_config: parseConfig(habit.frequency_config)
    };
  } catch (error) {
    console.error('Error fetching habit by ID:', error);
    throw error;
  }
};

// 更新习惯
const update = async (habitId, userId, updates) => {
  try {
    // 首先检查习惯是否存在以及是否属于该用户
    const habit = await findById(habitId, userId);
    if (!habit) {
      return null;
    }
    
    const allowedFields = [
      'name', 'description', 'frequency', 'frequency_config', 
      'reminder_time', 'start_date', 'end_date', 'color', 'icon', 'is_active'
    ];
    const updateFields = [];
    const values = [];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        
        // 根据字段类型进行适当格式化
        if (field === 'frequency_config') {
          values.push(formatConfig(updates[field]));
        } 
        else if (field === 'start_date' || field === 'end_date') {
          values.push(formatDate(updates[field]));
        }
        else if (field === 'reminder_time') {
          values.push(formatTime(updates[field]));
        }
        else {
          values.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) return habit;
    
    values.push(habitId, userId);
    
    await pool.execute(
      `UPDATE habits 
       SET ${updateFields.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      values
    );
    
    return await findById(habitId, userId);
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

// 删除习惯
const deleteHabit = async (habitId, userId) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM habits WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// 记录习惯完成情况
const logHabit = async (habitId, userId, logData) => {
  try {
    // 首先检查习惯是否存在以及是否属于该用户
    const habit = await findById(habitId, userId);
    if (!habit) {
      return null;
    }
    
    const { date, status, notes } = logData;
    
    // 使用REPLACE INTO以处理可能的重复记录（同一天的同一习惯）
    const [result] = await pool.execute(
      `REPLACE INTO habit_logs 
       (habit_id, user_id, date, status, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        habitId, 
        userId, 
        formatDate(date || new Date()), 
        status || 'completed', 
        notes || null
      ]
    );
    
    return { 
      id: result.insertId,
      habit_id: habitId,
      user_id: userId,
      date: formatDate(date || new Date()),
      status: status || 'completed',
      notes: notes || null
    };
  } catch (error) {
    console.error('Error logging habit:', error);
    throw error;
  }
};

// 获取习惯日志
const getHabitLogs = async (habitId, userId, filters = {}) => {
  try {
    const conditions = ['habit_id = ? AND user_id = ?'];
    const params = [habitId, userId];
    
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    
    if (filters.date_after) {
      conditions.push('date >= ?');
      params.push(formatDate(filters.date_after));
    }
    
    if (filters.date_before) {
      conditions.push('date <= ?');
      params.push(formatDate(filters.date_before));
    }
    
    const query = `
      SELECT * FROM habit_logs
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${filters.sort_by || 'date'} ${filters.sort_order || 'DESC'}
    `;
    
    const [logs] = await pool.execute(query, params);
    return logs;
  } catch (error) {
    console.error('Error getting habit logs:', error);
    throw error;
  }
};

// 获取用户所有习惯的日志
const getAllUserHabitLogs = async (userId, filters = {}) => {
  try {
    const conditions = ['hl.user_id = ?'];
    const params = [userId];
    
    if (filters.status) {
      conditions.push('hl.status = ?');
      params.push(filters.status);
    }
    
    if (filters.date_after) {
      conditions.push('hl.date >= ?');
      params.push(formatDate(filters.date_after));
    }
    
    if (filters.date_before) {
      conditions.push('hl.date <= ?');
      params.push(formatDate(filters.date_before));
    }
    
    if (filters.habit_id) {
      conditions.push('hl.habit_id = ?');
      params.push(filters.habit_id);
    }
    
    const query = `
      SELECT hl.*, h.name as habit_name, h.frequency
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${filters.sort_by || 'hl.date'} ${filters.sort_order || 'DESC'}
    `;
    
    const [logs] = await pool.execute(query, params);
    return logs;
  } catch (error) {
    console.error('Error getting all user habit logs:', error);
    throw error;
  }
};

// 获取习惯统计数据
const getStats = async (userId, filters = {}) => {
  try {
    // 基本过滤条件
    let dateFilter = '';
    const params = [userId];
    
    if (filters.date_after) {
      dateFilter += ' AND hl.date >= ?';
      params.push(formatDate(filters.date_after));
    }
    
    if (filters.date_before) {
      dateFilter += ' AND hl.date <= ?';
      params.push(formatDate(filters.date_before));
    }
    
    // 总体统计
    const [overallStats] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT h.id) as total_habits,
        COUNT(hl.id) as total_logs,
        SUM(CASE WHEN hl.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN hl.status = 'skipped' THEN 1 ELSE 0 END) as skipped_count,
        SUM(CASE WHEN hl.status = 'missed' THEN 1 ELSE 0 END) as missed_count
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id
      WHERE h.user_id = ?${dateFilter}`,
      params
    );
    
    // 按习惯类型统计
    const [frequencyStats] = await pool.execute(
      `SELECT 
        h.frequency,
        COUNT(DISTINCT h.id) as habits_count,
        SUM(CASE WHEN hl.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM habits h
      LEFT JOIN habit_logs hl ON h.id = hl.habit_id
      WHERE h.user_id = ?${dateFilter}
      GROUP BY h.frequency`,
      params
    );
    
    // 日期范围内的每日完成情况
    let dateRangeQuery = `
      SELECT 
        hl.date,
        COUNT(hl.id) as total_logs,
        SUM(CASE WHEN hl.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM habit_logs hl
      WHERE hl.user_id = ?
    `;
    
    if (filters.date_after) {
      dateRangeQuery += ' AND hl.date >= ?';
    }
    
    if (filters.date_before) {
      dateRangeQuery += ' AND hl.date <= ?';
    }
    
    dateRangeQuery += ' GROUP BY hl.date ORDER BY hl.date';
    
    const [dateStats] = await pool.execute(dateRangeQuery, params);
    
    return {
      overall: overallStats[0],
      by_frequency: frequencyStats,
      by_date: dateStats
    };
  } catch (error) {
    console.error('Error getting habit stats:', error);
    throw error;
  }
};

// 删除习惯日志
const deleteHabitLog = async (logId, userId) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM habit_logs 
       WHERE id = ? AND user_id = ?`,
      [logId, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting habit log:', error);
    throw error;
  }
};

module.exports = {
  create,
  findAllByUser,
  findById,
  update,
  delete: deleteHabit,
  logHabit,
  getHabitLogs,
  getAllUserHabitLogs,
  getStats,
  deleteHabitLog
};
