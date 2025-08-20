const pool = require('../../db/pool');

async function removeLevelRole(serverId, roleId, level) {
    await pool.query(
        `DELETE FROM server_level_roles
         WHERE server_id = ? AND role_id = ? AND level = ?`,
        [serverId, roleId, level]
    );
}

module.exports = { removeLevelRole };
