const pool = require('../../db/pool');
const { serverColumnNames } = require('../../db/init');

async function updateServerConfig(serverId, configName, value) {
    if (!serverColumnNames.includes(configName)) {
        throw new Error(`[CADMIUMs] Invalid config column: ${configName}`);
    }

    await pool.query(
        `INSERT INTO server_settings (server_id) VALUES (?) ON DUPLICATE KEY UPDATE server_id = server_id`,
        [serverId]
    );

    await pool.query(
        `UPDATE server_settings SET \`${configName}\` = ? WHERE server_id = ?`,
        [value, serverId]
    );
}

module.exports = { updateServerConfig };
