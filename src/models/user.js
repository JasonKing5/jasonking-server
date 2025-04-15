const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const pool = mysql.createPool(dbConfig);

const findByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const create = async (userData) => {
  const { username, email, password, role = 'user' } = userData;
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, password, role]
  );
  return result.insertId;
};

const update = async (id, userData) => {
  const { username, email } = userData;
  const [result] = await pool.execute(
    'UPDATE users SET username = ?, email = ? WHERE id = ?',
    [username, email, id]
  );
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const [result] = await pool.execute(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

const findAll = async () => {
  const [rows] = await pool.execute('SELECT * FROM users');
  return rows;
};

module.exports = {
  findByUsername,
  findByEmail,
  findById,
  create,
  update,
  delete: deleteUser,
  findAll
};
