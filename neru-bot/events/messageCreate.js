const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    // await message.reply({ stickers: message.client.guilds.cache.get(message.guild.id).stickers.cache.filter(s => s.id === "1389298310875058216") });

    if (message.guild) {
      for (const trigger of message.client.triggers) {
        try {
          if (trigger.trigger(message)) {
            await trigger.execute(message);
            break;
          }
        } catch (err) {
          console.error(`Error in command "${trigger.name}":`, err);
        }
      }
    }
  },
};
