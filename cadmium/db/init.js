// init.js
const pool = require('./pool');

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(20) NOT NULL,
            user_id VARCHAR(20) NOT NULL,
            username VARCHAR(100),
            level INT DEFAULT 0,
            xp INT DEFAULT 0,
            total_xp INT DEFAULT 0,
            messages INT DEFAULT 0,
            last_message DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_per_server (server_id, user_id)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS server_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(20) NOT NULL UNIQUE,
            xp_enabled BOOLEAN DEFAULT TRUE,
            xp_mode ENUM('static','random') DEFAULT 'static',
            xp_static INT DEFAULT 10,
            xp_random_min INT DEFAULT 5,
            xp_random_max INT DEFAULT 15,
            xp_cooldown INT DEFAULT 30,
            level_up_message VARCHAR(255) DEFAULT 'Congrats {user}, you reached level {level}!',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Database initialized');
}

module.exports = initDatabase;
