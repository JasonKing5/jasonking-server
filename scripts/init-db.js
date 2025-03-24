require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbConfig = require('../src/config/database');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建任务表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATETIME,
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
        category VARCHAR(50),
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 创建习惯表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        frequency ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL DEFAULT 'daily',
        frequency_config JSON,
        reminder_time TIME,
        start_date DATE NOT NULL,
        end_date DATE,
        color VARCHAR(20),
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 创建习惯日志表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        habit_id INT NOT NULL,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('completed', 'skipped', 'missed') NOT NULL DEFAULT 'completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_habit_date (habit_id, date)
      );
    `);

    // 添加索引以提高查询性能
    try {
      await connection.query(`CREATE INDEX idx_tasks_user_id ON tasks(user_id)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_tasks_user_id 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_tasks_status ON tasks(status)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_tasks_status 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_tasks_due_date ON tasks(due_date)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_tasks_due_date 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_tasks_priority ON tasks(priority)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_tasks_priority 已存在，跳过创建');
    }

    // 添加习惯表的索引以提高查询性能
    try {
      await connection.query(`CREATE INDEX idx_habits_user_id ON habits(user_id)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habits_user_id 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habits_frequency ON habits(frequency)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habits_frequency 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habits_start_date ON habits(start_date)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habits_start_date 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habits_is_active ON habits(is_active)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habits_is_active 已存在，跳过创建');
    }

    // 添加习惯日志表的索引以提高查询性能
    try {
      await connection.query(`CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habit_logs_habit_id 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habit_logs_user_id 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habit_logs_date ON habit_logs(date)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habit_logs_date 已存在，跳过创建');
    }
    
    try {
      await connection.query(`CREATE INDEX idx_habit_logs_status ON habit_logs(status)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('索引 idx_habit_logs_status 已存在，跳过创建');
    }

    // Check if root user exists
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      ['root']
    );

    // Create root user if it doesn't exist
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['root', 'root@example.com', hashedPassword, 'admin']
      );
      console.log('Root user created successfully');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
