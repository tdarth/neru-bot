const pool = require('../../db/pool');

async function forceAddXp(serverId, userId, username, amount) {
    const [userRows] = await pool.query(
        'SELECT * FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    let user;
    if (userRows.length === 0) {
        const [result] = await pool.query(
            'INSERT INTO users (server_id, user_id, username, xp, total_xp, messages, last_message) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [serverId, userId, username, amount, amount, 1]
        );
        return { newXp: amount, newTotal: amount };
    } else {
        user = userRows[0];
        const newXp = user.xp + amount;
        const newTotal = user.total_xp + amount;
        const newMessages = user.messages + 1;

        await pool.query(
            'UPDATE users SET xp = ?, total_xp = ?, messages = ?, last_message = NOW(), username = ? WHERE server_id = ? AND user_id = ?',
            [newXp, newTotal, newMessages, username, serverId, userId]
        );

        return { newXp, newTotal };
    }
}

module.exports = { forceAddXp };