const pool = require('./pool');

async function listLevelRoles(serverId) {
    const [rows] = await pool.query(
        `SELECT role_id, level 
         FROM server_level_roles
         WHERE server_id = ?
         ORDER BY level ASC`,
        [serverId]
    );

    return rows.map(row => ({
        roleId: row.role_id,
        level: row.level
    }));
}

module.exports = { listLevelRoles };