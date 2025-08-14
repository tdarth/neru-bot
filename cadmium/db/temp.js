require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateUtf8mb4() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('[MIGRATION] Starting utf8mb4 migration...');

        await connection.query(`
            ALTER DATABASE \`${process.env.DB_NAME}\`
            CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
        `);

        await connection.query(`
            ALTER TABLE users
            CONVERT TO CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
        `);

        await connection.query(`
            ALTER TABLE server_settings
            CONVERT TO CHARACTER SET utf8mb4
            COLLATE utf8mb4_unicode_ci
        `);

        console.log('[MIGRATION] Migration completed successfully.');
    } catch (err) {
        console.error('[MIGRATION] Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrateUtf8mb4();
