const pool = require('../../db/pool');

async function getServerConfig(serverId) {
    const [rows] = await pool.query(
        `SELECT * FROM server_settings WHERE server_id = ?`,
        [serverId]
    );

    if (rows.length === 0) return null;
    return rows[0];
}

module.exports = { getServerConfig };