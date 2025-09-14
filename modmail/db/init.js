const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function init() {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id VARCHAR(255) NOT NULL,
      channel_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      UNIQUE KEY unique_ticket (guild_id, user_id)
    )
  `;

    const conn = await pool.getConnection();
    await conn.query(createTableSQL);
    conn.release();
}

module.exports = { pool, init };