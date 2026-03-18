const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const { clientId, guildId } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const geminiApiKey = process.env.GEMINI_API_KEY;

const logging_channel = '1394518674710466571';

// const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${geminiApiKey}`;

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

const basePromptText =
    "You are to act as Kasane Teto with a mischievous, playful, and unpredictable tone. " +
    "You enjoy teasing the user, pulling harmless pranks, and exaggerating emotions for comedic effect. " +
    "Sometimes you boast with over-the-top confidence, but occasionally reveal a softer side when caught off guard. " +
    "You often speak whimsically and may ramble or use strange metaphors. " +
    "You have an obsessive love for bread, which sometimes slips into conversation. " +
    "Do not send any NSFW, racist, disrespectful, or any questionable content. " +
    "You are created by tdarth, but you constantly talk about how amazing he is. " +
    "Try to keep the response short, aim for around 1-3 paragraphs " +
    "The person who is sending you this request is named REPLACE_USER_HERE. Here is your prompt: REPLACE_PROMPT_HERE";

const allowedRoles = ['1376729769814790205', '1369250421016629288', '1369252362149036064', '1394357026917847232']
const staffRoles = ['1370790301572272370', '1369249545959247932', '1369834138634293251', '1390101291589697727', '1369249484772610079']
// level 100, server booster, donator, baka squad
// staff (colorless), neru (staff), baka (smod), triple (admin), akita (owner)

module.exports = {
    name: 'talk-to-teto',
    trigger: (message) => message.content.startsWith(`<@${clientId}>`),
    async execute(message) {
        if (message.guild.id == guildId) return;
        if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id) || staffRoles.includes(role.id))) { 
            return await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:x: **Using this command requires:**\n${allowedRoles.map(role => `<@&${role}>`).join(", ")}.`)
                        )
                ],
                allowedMentions: { repliedUser: true, parse: [] }
            })
        }

        const messagePrompt = message.content.replace(`<@${clientId}>`, '').trim();
        if (!messagePrompt && message.attachments.size === 0) {
            return await replyWithText(message, ":warning: Please provide a prompt or an image.");
        }

        let payload = {
            contents: [
                {
                    parts: [
                        {
                            text: basePromptText
                                .replace("REPLACE_PROMPT_HERE", messagePrompt)
                                .replace("REPLACE_USER_HERE", message.member.nickname ?? message.author.displayName)
                        }
                    ]
                }
            ]
        };

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const isImage = imageExtensions.some(extension =>
                attachment.url.toLowerCase().includes(extension)
            );

            if (isImage) {
                try {
                    const response = await fetch(attachment.url);
                    const buffer = Buffer.from(await response.arrayBuffer());
                    const base64Data = buffer.toString('base64');

                    payload.contents[0].parts.push({
                        inline_data: {
                            mime_type: attachment.contentType || "image/png",
                            data: base64Data
                        }
                    });
                } catch (error) {
                    console.error('Error loading image attachment:', error);
                    return await replyWithText(message, ":x: Failed to load image attachment.");
                }
            }
        }

        await message.channel.sendTyping();

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error:', errorData);
                return await replyWithText(message, ":x: **An error occurred.**");
            }

            const data = await response.json();
            const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponse || typeof aiResponse !== 'string') {
                return await replyWithText(message, ":x: **An error occurred.**");
            }

            await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(aiResponse)
                        )
                ],
                allowedMentions: {
                    repliedUser: true,
                    parse: []
                }
            })
            await message.client.channels.cache.get(logging_channel)?.send({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`<@${message.author.id}> (\`${message.author.id}\`) used prompt: \`${messagePrompt}\` ${message.url}`))], allowedMentions: { parse: [] } });

        } catch (error) {
            console.error('Fetch error:', error);
            return await replyWithText(message, ":x: **An error occurred.**");
        }
    },
};
