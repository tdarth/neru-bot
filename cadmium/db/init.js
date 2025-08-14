const pool = require('./pool');

const userColumns = [
    'username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    'level INT DEFAULT 0',
    'xp INT DEFAULT 0',
    'next_level_xp INT DEFAULT 100',
    'total_xp INT DEFAULT 0',
    'messages INT DEFAULT 0',
    'last_message DATETIME'
];

const serverColumns = [
    'xp_enabled BOOLEAN DEFAULT TRUE',
    'xp_mode ENUM("static","random") DEFAULT "static"',
    'xp_static INT DEFAULT 10',
    'xp_random_min INT DEFAULT 5',
    'xp_random_max INT DEFAULT 15',
    'xp_cooldown INT DEFAULT 30',
    `level_up_message VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT "Congrats {user}, you reached level {level}!"`,
    'xp_levelup_mode ENUM("fixed","exponential") DEFAULT "fixed"',
    'xp_levelup_amount INT DEFAULT 100',
    'xp_levelup_multiplier FLOAT DEFAULT 1'
];

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(20) NOT NULL,
            user_id VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_per_server (server_id, user_id)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS server_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(20) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    for (const col of userColumns) {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col}`);
    }

    for (const col of serverColumns) {
        await pool.query(`ALTER TABLE server_settings ADD COLUMN IF NOT EXISTS ${col}`);
    }

    console.log('[CADMIUM] Database initialized.');
}

const serverColumnNames = serverColumns.map(col => col.split(' ')[0]);
const userColumnNames = userColumns.map(col => col.split(' ')[0]);

module.exports = { initDatabase, serverColumns, serverColumnNames, userColumnNames };