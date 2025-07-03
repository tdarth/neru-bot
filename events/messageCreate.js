const { Events } = require('discord.js');

const codeRegex = /^[a-z0-9]{8}$/i;
const ACCESS_TOKEN = process.env.APPLICATIONS_ACCESS_TOKEN;
const FETCH_URL = "https://bakabakabakaapplication.tdarthh.workers.dev/fetchapplication";
const APPLICATION_CHANNEL_ID = "1381511430578245642";

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

    if (message.channel.type !== 1) {
      const verifyCode = message.content.trim();
      if (!codeRegex.test(verifyCode)) return;
      const username = message.author.username;

      try {
        const url = new URL(FETCH_URL);
        url.searchParams.set("username", username);
        url.searchParams.set("verify-code", verifyCode);
        url.searchParams.set("access-token", ACCESS_TOKEN);

        const res = await fetch(url);
        const text = await res.text();

        if (!res.ok) {
          await message.reply(":x: Invalid verification code or no matching application.");
          return;
        }

        const application = JSON.parse(text);

        const channel = await message.client.channels.fetch(APPLICATION_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) return;

        let applicationFields = Object.entries(application)
          .map(([q, a]) => `**${q}**:\n${a}`)
          .join("\n\n");

        await channel.send({
          content: `New application from **${username}**:\n\n${applicationFields}`
        });

        await message.reply("Your application has been verified and sent.");
      } catch (err) {
        console.error("Error verifying application:", err);
        await message.reply(":x: Something went wrong verifying your application.");
      }
    }
  },
};
