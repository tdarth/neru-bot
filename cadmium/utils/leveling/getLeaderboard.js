const pool = require('../../db/pool');

async function getLeaderboard(serverId, limit = 25) {
    const [rows] = await pool.query(
        `SELECT user_id, username, level, xp, next_level_xp 
         FROM users 
         WHERE server_id = ? 
         ORDER BY level DESC, xp DESC 
         LIMIT ?`,
        [serverId, limit]
    );

    return rows.map((row, index) => ({
        id: row.user_id,
        username: row.username,
        rank: index + 1,
        level: row.level,
        xp: row.xp,
        xpNeeded: row.next_level_up,
        xpNextLevel: row.next_level_xp - row.xp
    }));
}

module.exports = { getLeaderboard };