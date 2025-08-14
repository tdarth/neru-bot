const pool = require('./pool');
const { serverColumns } = require('../../db/init');

async function verifyServerColumns() {
    const [rows] = await pool.query(`SHOW COLUMNS FROM server_settings`);
    const existingColumns = rows.map(r => r.Field);

    for (const colDef of serverColumns) {
        const colName = colDef.split(' ')[0];

        if (!existingColumns.includes(colName)) {
            await pool.query(`ALTER TABLE server_settings ADD COLUMN ${colDef}`);
            console.log(`[CADMIUM] Added column ${colName}`);
        } else {
            await pool.query(`ALTER TABLE server_settings MODIFY COLUMN ${colDef}`);
            console.log(`[CADMIUM] Ensured column ${colName} matches definition`);
        }
    }

    console.log('[CADMIUM] All server columns ensured');
}

module.exports = { verifyServerColumns };