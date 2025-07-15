const { TextDisplayBuilder, ContainerBuilder, MessageFlags, SeparatorBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");

const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=`;

const NERU_CODE = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D",
    ".": "E", "..-.": "F", "--.": "G", "....": "H",
    "..": "I", ".---": "J", "-.-": "K", ".-..": "L",
    "--": "M", "-.": "N", "---": "O", ".--.": "P",
    "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
    "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
    "-.--": "Y", "--..": "Z",
    "-----": "0", ".----": "1", "..---": "2", "...--": "3",
    "....-": "4", ".....": "5", "-....": "6", "--...": "7",
    "---..": "8", "----.": "9",
    "/": " ", "|": " "
};

function decodeMorse(morse) {
    return morse
        .trim()
        .split(/\s+/)
        .map(code => NERU_CODE[code.toUpperCase()] || "")
        .join("");
}

function isMorseWord(word) {
    return /^[.\-/|]+$/.test(word);
}

function splitMorseAndText(input) {
    const words = input.trim().split(/\s+/);
    const morseWords = [];
    const normalWords = [];

    for (const word of words) {
        if (isMorseWord(word)) {
            morseWords.push(word);
        } else {
            normalWords.push(word);
        }
    }

    return {
        morseText: morseWords.join(' '),
        normalText: normalWords.join(' ')
    };
}

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

        textToTranslate = textToTranslate || message.content.slice(prefix.length + "translate".length).trim();

        if (!textToTranslate) {
            return await replyWithText(message, ":warning: Please reply to a message or provide text to translate.");
        }

        await message.channel.sendTyping();

        try {
            const { morseText, normalText } = splitMorseAndText(textToTranslate);

            let morseTranslation = '';
            if (morseText) {
                morseTranslation = decodeMorse(morseText);
            }

            let translatedText = '';
            if (normalText) {
                const response = await fetch(`${apiUrl}${encodeURIComponent(normalText)}`);
                if (!response.ok) {
                    console.error('API error:', await response.text());
                    return await replyWithText(message, ":x: **An error occurred.**");
                }

                const data = await response.json();
                translatedText = data?.[0]?.[0]?.[0] || '';
            }

            if (!translatedText && !morseTranslation) {
                return await replyWithText(message, ":x: Translation failed or returned empty.");
            }

            const finalText = [translatedText, morseTranslation].filter(Boolean).join(" | ");

            const mainText = new TextDisplayBuilder().setContent(finalText);
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
