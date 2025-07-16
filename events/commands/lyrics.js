const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'lyrics',
    trigger: (message) => message.content.startsWith(`${prefix}lyrics`),
    async execute(message) {
        const command = message.content.replace(`${prefix}lyrics`, ``).trim();
        if (!command) return replyWithText(message, `:x: **Usage: ${prefix}lyrics song name [artist in brackets]**`);

        const match = command.match(/([^\[\]]*)\[(.*?)\]/);
        let title = '';
        let artist = '';
        let lyrics = [];

        if (match) {
            title = match[1].trim();
            artist = match[2].trim();
        } else {
            return replyWithText(message, `:x: **Usage: ${prefix}lyrics song name [artist in brackets]**`);
        }

        await message.channel.sendTyping();

        const response = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`);
        if (!response.ok) { return replyWithText(message, `:x: **Lyrics not found.**`); };

        const data = await response.json();
        
        lyrics = data.plainLyrics;

        if (lyrics.length > 0) {
            const buffer = Buffer.from(lyrics, 'utf-8');
            const fileName = `${data.trackName}-${data.artistName}.txt`;
            const attachment = new AttachmentBuilder(buffer, { name: fileName });

            await message.reply({
                files: [attachment],
                allowedMentions: { repliedUser: true, parse: [] }
            });
        }
    },
};
