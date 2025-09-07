const { prefix } = require('../../config.json');
const replyWithText = require('../../utils/replyWithText');

module.exports = {
    name: 'umamusume',
    trigger: (message) => message.content.startsWith(`${prefix}umamusume`),
    async execute(message) {
        await message.channel.sendTyping();

        const charactersRes = await fetch('https://umapyoi.net/api/v1/character');
        if (!charactersRes.ok) return replyWithText(message, ':x: **An error occurred.**');
        const characters = await charactersRes.json();

        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        const charId = randomChar.web_id;

        const characterInfoRes = await fetch(`https://umapyoi.net/api/v1/character/${charId}`);
        if (!characterInfoRes.ok) return replyWithText(message, ':x: **An error occurred.**');
        const characterInfo = await characterInfoRes.json();

        let info = "";

        if (characterInfo?.name_en && characterInfo?.name_jp) info += `**${characterInfo.name_en} \`${characterInfo.name_jp}\`**`;
        else if (characterInfo?.name_en) info += `**${characterInfo.name_en}**`;
        else if (characterInfo?.name_jp) info += `**${characterInfo.name_jp}**`;

        if (characterInfo?.profile) info += `\n\`\`\`${characterInfo.profile}\`\`\``;

        const imagesRes = await fetch(`https://umapyoi.net/api/v1/character/images/${charId}`);
        if (!imagesRes.ok) return replyWithText(message, ':x: **An error occurred.**');
        const images = await imagesRes.json();

        const categories = Object.values(images);
        const allImages = categories.flatMap(cat => cat.images);
        const randomImage = allImages[Math.floor(Math.random() * allImages.length)];

        await message.reply(`${info}\n[Image](${randomImage.image})`);
    },
};
