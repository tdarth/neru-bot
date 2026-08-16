const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (message.guild) {
      for (const trigger of message.client.triggers) {
        try {
          const testMessage = Object.create(message);
          if (trigger.name != "talk-to-teto") testMessage.content = testMessage.content.replace(new RegExp(`<@${message.client.user.id}>\\s*`), '');

          if (trigger.trigger(testMessage)) {
            await trigger.execute(testMessage);

            let warningMsg;

            if (!message.mentions.users.has(message.client.user.id)) warningMsg = await message.reply(`\n-# :warning: [Due to a Discord change](<https://support-dev.discord.com/hc/en-us/articles/40281523410967-Changes-to-Privileged-Intent-Access-for-Discord-Apps>), this command will soon require you to ping the bot in your message.\n\`\`\`@${message?.client?.member?.nickname || message?.client?.user?.username} ${message.content}\`\`\``);

            if (warningMsg) {
              setTimeout(async () => {
                await warningMsg.delete();
              }, 6000);
            }

            break;
          }
        } catch (err) {
          console.error(`Error in command "${trigger.name}":`, err);
        }
      }
    }
  },
};