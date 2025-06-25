const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

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
  },
};