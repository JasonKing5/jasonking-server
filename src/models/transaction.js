const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

// 格式化日期为 MySQL datetime 格式
const formatDate = (date) => {
    if (!date) return new Date();
    if (typeof date === 'string') {
        // 将 ISO 字符串转换为 Date 对象
        date = new Date(date);
    }
    return date;
};

const create = async (userId, { amount, type, category, description, date }) => {
    const [result] = await pool.execute(
        `INSERT INTO transactions (user_id, amount, type, category, description, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, amount, type, category, description, formatDate(date)]
    );
    return result.insertId;
};

const findAll = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM transactions 
         WHERE user_id = ?
         ORDER BY date DESC`,
        [userId]
    );
    return rows;
};

const findById = async (id, userId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM transactions 
         WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return rows[0];
};

const update = async (id, userId, updates) => {
    const allowedFields = ['amount', 'type', 'category', 'description', 'date'];
    const updateFields = [];
    const values = [];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            // 如果是日期字段，需要格式化
            values.push(field === 'date' ? formatDate(updates[field]) : updates[field]);
        }
    });

    if (updateFields.length === 0) return false;

    values.push(id, userId);
    const [result] = await pool.execute(
        `UPDATE transactions 
         SET ${updateFields.join(', ')}
         WHERE id = ? AND user_id = ?`,
        values
    );
    return result.affectedRows > 0;
};

const deleteTransaction = async (id, userId) => {
    const [result] = await pool.execute(
        `DELETE FROM transactions 
         WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    delete: deleteTransaction
};
