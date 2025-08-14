const pool = require('../../db/pool');

async function getLevel(serverId, userId) {
    const [rows] = await pool.query(
        'SELECT xp, total_xp, level FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    if (rows.length === 0) return null;

    const { xp, total_xp, level } = rows[0];

    return { xp, totalXp: total_xp, level };
}

module.exports = { getLevel };