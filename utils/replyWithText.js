const { TextDisplayBuilder, ContainerBuilder, MessageFlags } = require("discord.js");

async function replyWithText(message, content) {
    const textDisplay = new TextDisplayBuilder().setContent(content);
    const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
    await message.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
}

module.exports = replyWithText;