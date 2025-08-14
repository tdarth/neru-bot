const pool = require('../../db/pool');

async function updateXp(serverId, userId, username, updateFn) {
    const [userRows] = await pool.query(
        'SELECT * FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    let oldXp, oldTotal, newXp, newTotal;

    if (userRows.length === 0) {
        oldXp = 0;
        oldTotal = 0;
        newXp = updateFn(oldXp);
        newTotal = newXp;

        await pool.query(
            'INSERT INTO users (server_id, user_id, username, xp, total_xp, messages, last_message) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [serverId, userId, username, newXp, newTotal, 1]
        );
    } else {
        const user = userRows[0];
        oldXp = user.xp;
        oldTotal = user.total_xp;

        newXp = updateFn(oldXp);
        newTotal = oldTotal + (newXp - oldXp);
        const newMessages = user.messages + 1;

        await pool.query(
            'UPDATE users SET xp = ?, total_xp = ?, messages = ?, last_message = NOW(), username = ? WHERE server_id = ? AND user_id = ?',
            [newXp, newTotal, newMessages, username, serverId, userId]
        );
    }

    return { oldXp, newXp, oldTotal, newTotal };
}

module.exports = updateXp;