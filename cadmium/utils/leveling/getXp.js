const pool = require('../../db/pool');

async function getXp(serverId, userId) {
    const [rows] = await pool.query(
        'SELECT xp, total_xp FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    if (rows.length === 0) {
        return null;
    }

    return {
        xp: rows[0].xp,
        totalXp: rows[0].total_xp
    };
}

module.exports = { getXp };
