async function getChannelFromId(client, channelId) {
  let channel = client.channels.cache.get(channelId);

  if (!channel) {
    try {
      channel = await client.channels.fetch(channelId);
    } catch (err) {
      console.error(`[MODMAIL] Failed to fetch channel ${channelId}:`, err);
      return null;
    }
  }

  return channel;
}

module.exports = { getChannelFromId };