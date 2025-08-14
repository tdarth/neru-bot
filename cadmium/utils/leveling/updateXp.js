const pool = require('../../db/pool');

async function updateXp(serverId, userId, username, updateFn) {
    const [userRows] = await pool.query(
        'SELECT * FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    if (userRows.length === 0) {
        const initialXp = updateFn(0);
        await pool.query(
            'INSERT INTO users (server_id, user_id, username, xp, total_xp, messages, last_message) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [serverId, userId, username, initialXp, initialXp, 1]
        );
        return { newXp: initialXp, newTotal: initialXp };
    }

    const user = userRows[0];
    const newXp = updateFn(user.xp);
    const newTotal = user.total_xp + (newXp - user.xp);
    const newMessages = user.messages + 1;

    await pool.query(
        'UPDATE users SET xp = ?, total_xp = ?, messages = ?, last_message = NOW(), username = ? WHERE server_id = ? AND user_id = ?',
        [newXp, newTotal, newMessages, username, serverId, userId]
    );

    return { newXp, newTotal };
}

module.exports = updateXp;