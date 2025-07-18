const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder, MessageFlags, ContainerBuilder, TextDisplayBuilder, FileBuilder, MediaGalleryBuilder } = require('discord.js');
const { prefix, emojis } = require('../../config.json');
const path = require('path');

registerFont(path.join(__dirname, '../../assets/impact.ttf'), { family: 'Impact' });

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const { width: testWidth } = ctx.measureText(testLine);

        if (testWidth > maxWidth && currentLine) {
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
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`:x: **Usage: ${prefix}caption <text>**`)
                    )
            ]
        });

        const attachment = await message.attachments.first();
        if (!attachment || !attachment.contentType?.startsWith('image/')) {
            return await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:x: **No image uploaded.**`)
                        )
                ]
            });
        }

        const loadingMessage = await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${emojis.loading} **Captioning..**`)
                    )
            ]
        });

        try {
            const img = await loadImage(attachment.url);
            const canvasWidth = img.width;

            let fontSize = Math.floor(canvasWidth / 10);
            if (fontSize > 100) fontSize = 100;

            const ctx = createCanvas(0, 0).getContext('2d');
            ctx.font = `bold ${fontSize}px Impact`;

            const maxTextWidth = canvasWidth * 0.9;
            let lines = wrapText(ctx, caption, maxTextWidth);

            const lineHeight = fontSize * 1.2;
            let textHeight = lines.length * lineHeight;

            const maxBorderHeight = Math.max(img.height / 3, lineHeight * 3);
            while (textHeight > maxBorderHeight && fontSize > 10) {
                fontSize -= 2;
                ctx.font = `bold ${fontSize}px Impact`;
                lines = wrapText(ctx, caption, maxTextWidth);
                const newLineHeight = fontSize * 1.2;
                textHeight = lines.length * newLineHeight;
            }

            const borderHeight = Math.ceil(textHeight + fontSize * 0.5);

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
                const y = startY + i * (fontSize * 1.2);
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
                            new MediaGalleryBuilder()
                                .addItems([
                                    {
                                        media: {
                                            url: `attachment://captioned.gif`,
                                        },
                                    }
                                ])
                        )
                        .addFileComponents(
                            new FileBuilder()
                                .setURL('attachment://captioned.png')
                        )
                ],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (err) {
            console.error(`Caption Error: ${err}`);
            await loadingMessage.edit({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:x: **An error occurred.**`)
                        )
                ]
            });
        }
    },
};
