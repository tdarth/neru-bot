const { TextDisplayBuilder, ContainerBuilder, MessageFlags, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=`;

module.exports = {
    name: 'translate',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}translate`),
    async execute(message) {
        let textToTranslate;

        if (message.reference) {
            try {
                const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
                textToTranslate = repliedTo.content;
            } catch (error) {
                console.error("Failed to fetch replied message:", error);
            }
        }

        if (!textToTranslate) {
            textToTranslate = message.content.slice(prefix.length + "translate".length).trim();
        }

        if (!textToTranslate) {
            return await replyWithText(message, ":warning: Please reply to a message or provide text to translate.");
        }

        await message.channel.sendTyping();

        try {
            const response = await fetch(`${apiUrl}${encodeURIComponent(textToTranslate)}`);

            if (!response.ok) {
                console.error('API error:', await response.text());
                return await replyWithText(message, ":x: **An error occurred.**");
            }

            const data = await response.json();
            const translatedText = data?.[0]?.[0]?.[0];

            if (!translatedText) {
                return await replyWithText(message, ":x: Translation failed or returned empty.");
            }

            const mainText = new TextDisplayBuilder().setContent(translatedText);
            const disclaimer = new TextDisplayBuilder().setContent("-# Translations are not 100% accurate.");
            const separator = new SeparatorBuilder();

            const container = new ContainerBuilder()
                .addTextDisplayComponents(mainText)
                .addSeparatorComponents(separator)
                .addTextDisplayComponents(disclaimer);

            await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [container],
                allowedMentions: {
                    users: [message.author.id],
                    roles: [],
                    parse: []
                }
            });

        } catch (error) {
            console.error('Fetch error:', error);
            await replyWithText(message, ":x: **An error occurred.**");
        }
    },
};
