const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function init() {
    const sql = `
        CREATE TABLE IF NOT EXISTS roles (
            guildId VARCHAR(32) NOT NULL,
            section VARCHAR(32) NOT NULL,
            tag VARCHAR(100) NOT NULL,
            serverId VARCHAR(32) NOT NULL,
            roleId VARCHAR(32) NOT NULL,
            PRIMARY KEY (guildId, section, tag, roleId)
        )
    `;
    const conn = await pool.getConnection();
    await conn.query(sql);
    conn.release();
}

init().catch(console.error);

async function writeData(guildId, section, tag, roleId, serverId) {
    const conn = await pool.getConnection();

    await conn.query(`
        INSERT INTO roles (guildId, section, tag, serverId, roleId)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE serverId = VALUES(serverId)
    `, [guildId, section, tag, serverId, roleId]);

    conn.release();
}

async function readData(guildId) {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`
        SELECT section, tag, serverId, roleId
        FROM roles
        WHERE guildId = ?
    `, [guildId]);
    conn.release();

    const result = {};

    for (const row of rows) {
        const { section, tag, serverId, roleId } = row;
        if (!result[section]) result[section] = {};
        if (!result[section][tag]) result[section][tag] = { serverId, roleIds: [] };
        result[section][tag].roleIds.push(roleId);
    }

    return result;
}
async function deleteData(guildId, tag, roleId, serverId) {
    const conn = await pool.getConnection();

    const [rows] = await conn.query(`
        DELETE FROM roles
        WHERE guildId = ? AND tag = ? AND roleId = ? AND serverId = ?
    `, [guildId, tag, roleId, serverId]);

    conn.release();

    return rows.affectedRows > 0;
}

module.exports = {
    writeData,
    readData,
    deleteData,
    pool
};