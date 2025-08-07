const { TextDisplayBuilder, ContainerBuilder, MessageFlags } = require("discord.js");

async function sendToChannelWithText(client, id, content) {
    const textDisplay = new TextDisplayBuilder().setContent(content);
    const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
    await client.channels.cache.get(id)?.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
}

module.exports = sendToChannelWithText;