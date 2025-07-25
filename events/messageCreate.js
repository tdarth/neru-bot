const { Events, MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder } = require('discord.js');
const { modApplicationsChannelId } = require('../config.json');
const replyWithText = require('../utils/replyWithText');
const splitIntoChunks = require('../utils/splitIntoChunks');

const codeRegex = /^[a-z0-9]{8}$/i;
const ACCESS_TOKEN = process.env.APPLICATIONS_ACCESS_TOKEN;
const FETCH_URL = "https://bakabakabakaapplication.tdarthh.workers.dev/fetchapplication";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

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

    if (message.channel.type === 1) {
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

        if (!res.ok) return await replyWithText(message, ":x: **Invalid verification code.**");

        const application = JSON.parse(text);

        const channel = await message.client.channels.fetch(modApplicationsChannelId);
        if (!channel) return;

        let applicationFields = Object.entries(application)
          .map(([q, a]) => {
            const cleanQuestion = q.replace(/\s*\n\s*/g, ' ').trim();
        
            let cleanAnswer;
        
            if (Array.isArray(a)) {
              cleanAnswer = a
                .map(item => String(item).replace(/\*/g, '').trim())
                .join('\n- ');
              cleanAnswer = '- ' + cleanAnswer;
            } else {
              cleanAnswer = String(a || '')
                .replace(/\*/g, '')
                .trim();
              cleanAnswer = '- ' + cleanAnswer;
            }
        
            return `-# **${cleanQuestion}**\n${cleanAnswer}`;
          })
          .join("\n\n");

        const headerContainer = new ContainerBuilder()
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# <@${message.author.id}>'s Application \`${message.author.id}\``)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
              )
          );
        
        const chunks = splitIntoChunks(applicationFields, 3900);
        
        await channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: [
            headerContainer,
            new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(chunks[0]))
          ],
          allowedMentions: { parse: [] }
        });
        
        for (let i = 1; i < chunks.length; i++) {
          await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(chunks[i]))
            ],
            allowedMentions: { parse: [] }
          });
        }

        replyWithText(message, ":white_check_mark: **Your application has been submitted.**");
      } catch (err) {
        console.error("Error verifying application:", err);
        replyWithText(message, ":x: **An error occurred. If this happens again, please message staff.**");
      }
    }
  },
};
