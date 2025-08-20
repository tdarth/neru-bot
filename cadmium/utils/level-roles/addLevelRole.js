const pool = require('../../db/pool');

async function addLevelRole(serverId, roleId, level) {
    await pool.query(
        `INSERT INTO server_level_roles (server_id, role_id, level)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), level = VALUES(level)`,
        [serverId, roleId, level]
    );
}

module.exports = { addLevelRole };