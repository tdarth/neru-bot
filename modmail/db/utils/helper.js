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

async function addBannedUser(guildId, userId, reason = null) {
  const sql = `
    INSERT INTO banned (guild_id, user_id, reason)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE reason = VALUES(reason)
  `;
  await pool.query(sql, [guildId, userId, reason]);
}

async function removeBannedUser(guildId, userId) {
  const sql = `
    DELETE FROM banned
    WHERE guild_id = ? AND user_id = ?
  `;
  await pool.query(sql, [guildId, userId]);
}

async function isUserBanned(guildId, userId) {
  const sql = `
    SELECT reason FROM banned
    WHERE guild_id = ? AND user_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [guildId, userId]);
  if (rows.length > 0) {
    return { banned: true, reason: rows[0].reason };
  }
  return { banned: false, reason: null };
}

async function associateMessageToEmbed(userMessageId, embedMessageId, modmailChannelId) {
  const sql = `
    INSERT INTO message_associations (channel_id, user_message_id, embed_message_id)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE embed_message_id = VALUES(embed_message_id)
  `;
  await pool.query(sql, [modmailChannelId, userMessageId, embedMessageId]);
}

async function getEmbedMessageFromUser(userMessageId, modmailChannelId) {
  const sql = `
    SELECT embed_message_id FROM message_associations
    WHERE channel_id = ? AND user_message_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [modmailChannelId, userMessageId]);
  return rows.length > 0 ? rows[0].embed_message_id : null;
}

async function getUserMessageFromEmbed(embedMessageId, modmailChannelId) {
  const sql = `
    SELECT user_message_id FROM message_associations
    WHERE channel_id = ? AND embed_message_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [modmailChannelId, embedMessageId]);
  return rows.length > 0 ? rows[0].user_message_id : null;
}

async function clearMessageAssociations(modmailChannelId) {
  const sql = `
    DELETE FROM message_associations
    WHERE channel_id = ?
  `;
  await pool.query(sql, [modmailChannelId]);
}

module.exports = {
  addUserToChannel,
  getChannelByUser,
  removeUserFromChannel,
  clearChannel,
  updateUserChannel,
  getUserByChannel,
  addBannedUser,
  removeBannedUser,
  isUserBanned
};

// export new functions
module.exports.associateMessageToEmbed = associateMessageToEmbed;
module.exports.getEmbedMessageFromUser = getEmbedMessageFromUser;
module.exports.getUserMessageFromEmbed = getUserMessageFromEmbed;
module.exports.clearMessageAssociations = clearMessageAssociations;