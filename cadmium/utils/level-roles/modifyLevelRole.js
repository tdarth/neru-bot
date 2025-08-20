const pool = require('../../db/pool');

async function modifyLevelRole(serverId, roleId, level, newValues = {}) {
    const fields = [];
    const params = [];

    if (newValues.roleId) {
        fields.push('role_id = ?');
        params.push(newValues.roleId);
    }

    if (newValues.level) {
        fields.push('level = ?');
        params.push(newValues.level);
    }

    if (fields.length === 0) return;

    params.push(serverId, roleId, level);

    await pool.query(
        `UPDATE server_level_roles
         SET ${fields.join(', ')}
         WHERE server_id = ? AND role_id = ? AND level = ?`,
        params
    );
}

module.exports = { modifyLevelRole };