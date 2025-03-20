require('dotenv').config();

const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'jason_king_dev',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jason_king',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = dbConfig[env];
