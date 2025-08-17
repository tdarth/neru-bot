const pool = require('../../db/pool');
const { formatNumber } = require('../formatNumber');

async function updateXp(serverId, userId, updateFn) {
    const [userRows] = await pool.query(
        'SELECT * FROM users WHERE server_id = ? AND user_id = ?',
        [serverId, userId]
    );

    let oldXp, oldTotal, newXp, newTotal;

    if (userRows.length === 0) {
        oldXp = 0;
        oldTotal = 0;
        newXp = formatNumber(updateFn(oldXp));
        newTotal = formatNumber(newXp);

        await pool.query(
            'INSERT INTO users (server_id, user_id, xp, total_xp, messages, last_message) VALUES (?, ?, ?, ?, ?, NOW())',
            [serverId, userId, newXp, newTotal, 1]
        );
    } else {
        const user = userRows[0];
        oldXp = user.xp;
        oldTotal = user.total_xp;

        newXp = formatNumber(updateFn(oldXp));
        newTotal = formatNumber(oldTotal + (newXp - oldXp));
        const newMessages = user.messages + 1;

        await pool.query(
            'UPDATE users SET xp = ?, total_xp = ?, messages = ? WHERE server_id = ? AND user_id = ?',
            [newXp, newTotal, newMessages, serverId, userId]
        );
    }

    return { oldXp, newXp, oldTotal, newTotal };
}

module.exports = updateXp;