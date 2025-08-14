const pool = require('../../db/pool');

async function getUserData(serverId, userId) {
    const [rows] = await pool.query(
        `SELECT * FROM users WHERE server_id = ? AND user_id = ?`,
        [serverId, userId]
    );

    if (rows.length === 0) return null;
    return rows[0];
}

module.exports = { getUserData };