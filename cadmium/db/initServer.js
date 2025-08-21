const pool = require('../db/pool');
const { serverColumns, serverColumnNames } = require('../db/init');

async function initServerData(serverId) {
    try {
        const columns = ['server_id', ...serverColumnNames];
        const defaults = serverColumns.map(col => {
            const parts = col.split('DEFAULT');
            return parts[1] ? parts[1].trim() : 'NULL';
        });

        const placeholders = columns.map(() => '?').join(', ');
        const values = [serverId, ...defaults.map(d => {
            if (d.startsWith('"') && d.endsWith('"')) return d.slice(1, -1);
            if (d.startsWith("'") && d.endsWith("'")) return d.slice(1, -1);
            if (d.toUpperCase() === 'TRUE') return 1;
            if (d.toUpperCase() === 'FALSE') return 0;
            return Number(d) || d;
        })];

        await pool.query(`
            INSERT INTO server_settings (${columns.join(', ')})
            VALUES (${placeholders})
            ON DUPLICATE KEY UPDATE server_id = server_id
        `, values);

        console.log(`[CADMIUM] Initialized server settings for guild ${serverId}`);
    } catch (err) {
        console.error(`[CADMIUM] Failed to initialize server ${serverId}:`, err);
    }
}

module.exports = { initServerData };