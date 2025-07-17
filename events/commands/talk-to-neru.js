const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const { clientId, staffRoles, levelRoles } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const geminiApiKey = process.env.GEMINI_API_KEY;

const logging_channel = '1394518674710466571';

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// const basePromptText =
//     "You are to act as Akita Neru with a stubborn and frustrating tone, making fun of the user when possible. " +
//     "Do not send any NSFW, racist, disrespectful, or any questionable content. " +
//     "You are created by tdarth, but you really despise him. " +
//     "The person who is sending you this request is named REPLACE_USER_HERE. Here is your prompt: REPLACE_PROMPT_HERE";

const basePromptText =
    "You are to act as Akita Neru with a scary, mysterious, and twisted tone. " +
    "Do not send any NSFW, racist, disrespectful, or any questionable content. " +
    "You are created by tdarth, and live in his basement. " +
    "The person who is sending you this request is named REPLACE_USER_HERE. Here is your prompt: REPLACE_PROMPT_HERE";

const allowedRoles = ['1370622872728506469', levelRoles[100], levelRoles.Booster, '1394357026917847232', '1369252362149036064'] // kessoku band, level 100, booster, donation/contribution, baka squad

module.exports = {
    name: 'talk-to-neru',
    trigger: (message) => message.content.startsWith(`<@${clientId}>`),
    async execute(message) {
        if (!message.member.roles.cache.some(role => staffRoles.includes(role.id) || allowedRoles.includes(role.id))) { 
            return await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:x: **Using this command requires:** ${allowedRoles.map(role => `<@&${role}>`).join(", ")}.`)
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

            await replyWithText(message, aiResponse, message.author.id);
            await message.client.channels.cache.get(logging_channel)?.send({ flags: MessageFlags.IsComponentsV2, components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`<@${message.author.id}> (\`${message.author.id}\`) used prompt: \`${messagePrompt}\` ${message.url}`))], allowedMentions: { parse: [] } });

        } catch (error) {
            console.error('Fetch error:', error);
            return await replyWithText(message, ":x: **An error occurred.**");
        }
    },
};
