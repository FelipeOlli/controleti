require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db_controleti',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'controleti_user',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'controleti',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = pool;
