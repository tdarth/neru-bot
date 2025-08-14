const pool = require('../../db/pool');
const { userColumnNames } = require('../../db/init');

async function updateUserData(serverId, userId, columnName, value) {
    if (!userColumnNames.includes(columnName)) {
        throw new Error(`[CADMIUMs] Invalid user column: ${columnName}`);
    }

    await pool.query(
        `INSERT INTO users (server_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE server_id = server_id`,
        [serverId, userId]
    );

    await pool.query(
        `UPDATE users SET \`${columnName}\` = ? WHERE server_id = ? AND user_id = ?`,
        [value, serverId, userId]
    );
}

module.exports = { updateUserData };