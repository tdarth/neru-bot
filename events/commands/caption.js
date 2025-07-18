const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, FileBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const path = require('path');

registerFont(path.join(__dirname, '../../assets/impact.ttf'), { family: 'Impact' });

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const { width } = ctx.measureText(testLine);
        if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
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
            const ctx = createCanvas(0, 0).getContext('2d');

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
                lines = wrapText(ctx, caption, maxTextWidth);
                lineHeight = fontSize * 1.2;
                textHeight = lines.length * lineHeight;
                borderHeight = Math.ceil((textHeight + fontSize * 0.5) * 1.2);

                if (borderHeight <= maxBorderHeight) break;

                fontSize -= 2;
            }

            if (fontSize < minFontSize) {
                fontSize = minFontSize;
                ctx.font = `bold ${fontSize}px Impact`;
                lines = wrapText(ctx, caption, maxTextWidth);
                lineHeight = fontSize * 1.2;
                textHeight = lines.length * lineHeight;
                borderHeight = Math.min(Math.ceil((textHeight + fontSize * 0.5) * 1.2), maxBorderHeight);
            }

            const canvas = createCanvas(canvasWidth, img.height + borderHeight);
            const canvasCtx = canvas.getContext('2d');

            canvasCtx.fillStyle = 'white';
            canvasCtx.fillRect(0, 0, canvas.width, borderHeight);
            canvasCtx.drawImage(img, 0, borderHeight);
            canvasCtx.font = `bold ${fontSize}px Impact`;
            canvasCtx.fillStyle = 'black';
            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'top';

            const startY = (borderHeight - textHeight) / 2;

            for (let i = 0; i < lines.length; i++) {
                const y = startY + i * lineHeight;
                canvasCtx.fillText(lines[i], canvasWidth / 2, y);
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