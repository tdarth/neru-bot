const { pool } = require("../init");

async function getChannelByUser(guildId, userId) {
  const sql = `
    SELECT channel_id FROM tickets
    WHERE guild_id = ? AND user_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [guildId, userId]);
  return rows.length > 0 ? rows[0].channel_id : null;
}

async function getUserByChannel(guildId, channelId) {
  const sql = `
    SELECT user_id FROM tickets
    WHERE guild_id = ? AND channel_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [guildId, channelId]);
  return rows.length > 0 ? rows[0].user_id : null;
}

async function addUserToChannel(guildId, channelId, userId) {
  const sql = `
    INSERT IGNORE INTO tickets (guild_id, channel_id, user_id)
    VALUES (?, ?, ?)
  `;
  await pool.query(sql, [guildId, channelId, userId]);
}

async function removeUserFromChannel(guildId, channelId, userId) {
  const sql = `
    DELETE FROM tickets
    WHERE guild_id = ? AND channel_id = ? AND user_id = ?
  `;
  await pool.query(sql, [guildId, channelId, userId]);
}

async function clearChannel(guildId, channelId) {
  const sql = `
    DELETE FROM tickets
    WHERE guild_id = ? AND channel_id = ?
  `;
  await pool.query(sql, [guildId, channelId]);
}

async function updateUserChannel(guildId, channelId, userId) {
  const sql = `
    UPDATE tickets SET channel_id = ?
    WHERE guild_id = ? AND user_id = ?
  `;
  await pool.query(sql, [channelId, guildId, userId]);
}

module.exports = {
  addUserToChannel,
  getChannelByUser,
  removeUserFromChannel,
  clearChannel,
  updateUserChannel,
  getUserByChannel
};