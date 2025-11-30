const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (message.guild.id == '1369247242724179998') return;

    await message.reply(`<:teto_middlefinger:1440902677079920731>`);

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