const pool = require('../../db/pool');

async function deleteServerData(serverId) {
    await pool.query('DELETE FROM users WHERE server_id = ?', [serverId]);
    await pool.query('DELETE FROM server_settings WHERE server_id = ?', [serverId]);

    console.log(`[CADMIUM] Deleted all data for server ${serverId}`);
}

module.exports = { deleteServerData };