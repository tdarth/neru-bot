const pool = require('../../db/pool');

async function fetchLevelRoles(serverId, level, includeLower = false) {
    let query;
    let params;

    if (includeLower) {
        query = `
            SELECT role_id
            FROM server_level_roles
            WHERE server_id = ? AND level <= ?
            ORDER BY level ASC
        `;
        params = [serverId, level];
    } else {
        query = `
            SELECT role_id
            FROM server_level_roles
            WHERE server_id = ? AND level = (
                SELECT MAX(level)
                FROM server_level_roles
                WHERE server_id = ? AND level <= ?
            )
        `;
        params = [serverId, serverId, level];
    }

    const [rows] = await pool.query(query, params);
    return rows.map(r => r.role_id);
}

module.exports = { fetchLevelRoles };