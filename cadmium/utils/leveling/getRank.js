const pool = require('../../db/pool');

async function getRank(serverId, userId) {
    const [userRows] = await pool.query(
        `SELECT user_id, level, xp, total_xp, next_level_xp
         FROM users
         WHERE server_id = ? AND user_id = ?
         LIMIT 1`,
        [serverId, userId]
    );

    if (userRows.length === 0) {
        return null;
    }

    const user = userRows[0];

    const [rankRows] = await pool.query(
        `SELECT COUNT(*) + 1 AS rank
         FROM users
         WHERE server_id = ?
         AND (level > ? OR (level = ? AND xp > ?))`,
        [serverId, user.level, user.level, user.xp]
    );

    return {
        userId: user.user_id,
        rank: rankRows[0].rank,
        level: user.level,
        xp: user.xp,
        totalXp: user.total_xp,
        xpNeeded: user.next_level_xp - user.xp,
        xpNextLevel: user.next_level_xp - user.xp
    };
}

module.exports = { getRank };