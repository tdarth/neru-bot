const pool = require('./pool');

const userColumns = [
    'username VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    'level INT DEFAULT 0',
    'xp INT DEFAULT 0',
    'next_level_xp INT DEFAULT 100',
    'total_xp INT DEFAULT 0',
    'messages INT DEFAULT 0',
    'last_message DATETIME',
    'card_bar_color VARCHAR(255) DEFAULT "#4D4D4D"',
    'card_bg_image VARCHAR(255) DEFAULT 0'
];

const serverColumns = [
    'xp_enabled BOOLEAN DEFAULT TRUE',
    'xp_mode ENUM("static","random") DEFAULT "static"',
    'xp_static INT DEFAULT 10',
    'xp_random_min INT DEFAULT 5',
    'xp_random_max INT DEFAULT 15',
    'xp_cooldown INT DEFAULT 30',
    'level_up_message_location VARCHAR(255) DEFAULT 1',
    `level_up_message VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT "Congrats {user}, you reached level {newLevel}!"`,
    `level_up_message_card VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT "Level {newLevel}"`,
    `level_up_message_card_displayname_enabled VARCHAR(255) DEFAULT 0`,
    "level_up_message_card_enabled INT DEFAULT 1",
    'level_command_card_enabled INT DEFAULT 1',
    'level_command_message VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT ":stars: {user}\n-# **Level**: `{level}`\n-# **XP**: `{xp}`/`{nextLevelXp}` ({totalXp} total)"',
    'xp_levelup_mode ENUM("fixed","additive","exponential") DEFAULT "fixed"',
    'xp_levelup_amount INT DEFAULT 100',
    'xp_levelup_multiplier FLOAT DEFAULT 1.1'
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

    try {
        await pool.query(`
            CREATE INDEX idx_server_level_xp
            ON users (server_id, level, xp)
        `);
    } catch (err) {
        if (err.code !== 'ER_DUP_KEYNAME') {
            throw err;
        }
    }

    console.log('[CADMIUM] Database initialized.');
}

const serverColumnNames = serverColumns.map(col => col.split(' ')[0]);
const userColumnNames = userColumns.map(col => col.split(' ')[0]);

module.exports = { initDatabase, serverColumns, serverColumnNames, userColumnNames };