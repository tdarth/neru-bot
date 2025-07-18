const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, FileBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const path = require('path');

registerFont(path.join(__dirname, '../../assets/impact.ttf'), { family: 'Impact' });

function splitTextWithEmojis(text) {
    const parts = [];
    let lastIndex = 0;

    const regex = /<a?:\w+:(\d+)>|\p{Extended_Pictographic}/gu;

    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
        }

        if (match[0].startsWith('<')) {
            const animated = match[0].startsWith('<a:');
            const id = match[1];
            parts.push({ type: 'discord_emoji', id, animated });
        } else {
            parts.push({ type: 'emoji', value: match[0] });
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.slice(lastIndex) });
    }
    return parts;
}

async function measureLineWidth(ctx, parts, fontSize) {
    ctx.font = `bold ${fontSize}px Impact`;
    let width = 0;
    for (const part of parts) {
        if (part.type === 'text') {
            width += ctx.measureText(part.value).width;
        } else if (part.type === 'emoji' || part.type === 'discord_emoji') {
            width += fontSize;
        }
    }
    return width;
}

async function wrapTextWithEmojis(ctx, text, maxWidth, fontSize) {
    ctx.font = `bold ${fontSize}px Impact`;
    const words = text.split(' ');
    const lines = [];
    let currentLineParts = [];
    let currentLineWidth = 0;

    for (const word of words) {
        const parts = splitTextWithEmojis(word);
        const wordWidth = await measureLineWidth(ctx, parts, fontSize);
        ctx.font = `bold ${fontSize}px Impact`;
        const spaceWidth = ctx.measureText(' ').width;

        if (currentLineWidth + wordWidth + (currentLineParts.length > 0 ? spaceWidth : 0) > maxWidth && currentLineParts.length > 0) {
            lines.push(currentLineParts);
            currentLineParts = parts.slice();
            currentLineWidth = wordWidth;
        } else {
            if (currentLineParts.length > 0) {
                currentLineParts.push({ type: 'text', value: ' ' });
                currentLineWidth += spaceWidth;
            }
            currentLineParts = currentLineParts.concat(parts);
            currentLineWidth += wordWidth;
        }
    }
    if (currentLineParts.length > 0) {
        lines.push(currentLineParts);
    }
    return lines;
}

async function drawLineWithEmojis(ctx, parts, x, y, fontSize) {
    let cursorX = x;

    ctx.font = `bold ${fontSize}px Impact`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';

    for (const part of parts) {
        if (part.type === 'text') {
            ctx.fillText(part.value, cursorX, y);
            cursorX += ctx.measureText(part.value).width;
        } else if (part.type === 'emoji') {
            const codePoints = [...part.value].map(c => c.codePointAt(0).toString(16)).join('-');
            const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`;

            try {
                const img = await loadImage(url);
                const emojiSize = fontSize;
                ctx.drawImage(img, cursorX, y, emojiSize, emojiSize);
                cursorX += emojiSize;
            } catch (e) {
                ctx.fillText(part.value, cursorX, y);
                cursorX += ctx.measureText(part.value).width;
            }
        } else if (part.type === 'discord_emoji') {
            const ext = part.animated ? 'gif' : 'png';
            const url = `https://cdn.discordapp.com/emojis/${part.id}.${ext}`;
            try {
                const img = await loadImage(url);
                const emojiSize = fontSize;
                ctx.drawImage(img, cursorX, y, emojiSize, emojiSize);
                cursorX += emojiSize;
            } catch (e) {
                ctx.fillText('?', cursorX, y);
                cursorX += ctx.measureText('?').width;
            }
        }
    }
}

module.exports = {
    name: 'caption',
    trigger: (message) => message.content.startsWith(`${prefix}caption`),
    async execute(message) {
        const caption = message.content.replace(`${prefix}caption`, '').trim();
        if (!caption) return await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`:x: **Usage: ${prefix}caption <text>**`)
                )
            ]
        });

        let attachment = message.attachments.first();

        if (!attachment && message.reference) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                attachment = referencedMessage.attachments.first();
            } catch (err) {
                console.error('Failed to fetch replied message:', err);
            }
        }

        if (!attachment || !attachment.contentType?.startsWith('image/')) {
            return await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`:x: **No image uploaded.**`)
                    )
                ]
            });
        }

        const loadingMessage = await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emojis.loading} **Captioning...**`)
                )
            ]
        });

        try {
            const img = await loadImage(attachment.url);
            const canvasWidth = img.width;
            const ctx = createCanvas(canvasWidth, 100).getContext('2d');

            const maxTextWidth = canvasWidth * 0.9;
            const maxBorderHeight = img.height / 3;
            const minFontSize = 18;
            let fontSize = Math.floor(canvasWidth / 10);
            let lines = [];
            let textHeight = 0;
            let lineHeight = 0;
            let borderHeight = 0;

            while (fontSize >= minFontSize) {
                ctx.font = `bold ${fontSize}px Impact`;
                lines = await wrapTextWithEmojis(ctx, caption, maxTextWidth, fontSize);
                lineHeight = fontSize * 1.2;
                textHeight = lines.length * lineHeight;
                borderHeight = Math.ceil((textHeight + fontSize * 0.5) * 1.2);

                if (borderHeight <= maxBorderHeight) break;
                fontSize -= 2;
            }

            if (fontSize < minFontSize) {
                fontSize = minFontSize;
                ctx.font = `bold ${fontSize}px Impact`;
                lines = await wrapTextWithEmojis(ctx, caption, maxTextWidth, fontSize);
                lineHeight = fontSize * 1.2;
                textHeight = lines.length * lineHeight;
                borderHeight = Math.min(Math.ceil((textHeight + fontSize * 0.5) * 1.2), maxBorderHeight);
            }

            const canvas = createCanvas(canvasWidth, img.height + borderHeight);
            const canvasCtx = canvas.getContext('2d');

            canvasCtx.fillStyle = 'white';
            canvasCtx.fillRect(0, 0, canvas.width, borderHeight);
            canvasCtx.drawImage(img, 0, borderHeight);

            const startY = (borderHeight - textHeight) / 2;
            let y = startY;

            for (const lineParts of lines) {
                canvasCtx.font = `bold ${fontSize}px Impact`;
                canvasCtx.textBaseline = 'top';

                let lineWidth = 0;
                for (const part of lineParts) {
                    if (part.type === 'text') {
                        lineWidth += canvasCtx.measureText(part.value).width;
                    } else if (part.type === 'emoji' || part.type === 'discord_emoji') {
                        lineWidth += fontSize;
                    }
                }
                const startX = (canvasWidth - lineWidth) / 2;

                await drawLineWithEmojis(canvasCtx, lineParts, startX, y, fontSize);
                y += lineHeight;
            }

            const buffer = canvas.toBuffer();
            const file = new AttachmentBuilder(buffer, { name: 'captioned.gif' });
            const filepng = new AttachmentBuilder(buffer, { name: 'captioned.png' });

            await loadingMessage.edit({
                files: [file, filepng],
                components: [
                    new ContainerBuilder()
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder().addItems([
                                { media: { url: `attachment://captioned.gif` } }
                            ])
                        )
                        .addFileComponents(
                            new FileBuilder().setURL('attachment://captioned.png')
                        )
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (err) {
            console.error(`Caption Error: ${err}`);
            await loadingMessage.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`:x: **An error occurred.**`)
                    )
                ]
            });
        }
    }
};