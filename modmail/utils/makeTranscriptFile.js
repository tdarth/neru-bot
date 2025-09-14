const { ChannelType } = require("discord.js");

async function makeTranscriptFile(client, channelId, count) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PrivateThread)) {
        throw new Error("Invalid channel: must be a text channel or private thread");
    }

    let fetchedMessages = [];
    let lastId = null;

    while (fetchedMessages.length < count) {
        const options = { limit: Math.min(count - fetchedMessages.length, 100) };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        fetchedMessages = fetchedMessages.concat(Array.from(messages.values()));
        lastId = messages.last().id;
    }

    fetchedMessages = fetchedMessages.reverse();

    let output = `Server: ${channel.guild.name} (${channel.guild.id})\n\n`;

    for (const msg of fetchedMessages) {
        const timestamp = msg.createdAt.toISOString();
        const username = msg.author?.tag ?? "Unknown User";
        const content = msg.content || "";

        output += `[#${channel.name}] ${timestamp} ${username}: ${content || "[No content]"}\n`;

        if (msg.attachments.size > 0) {
            msg.attachments.forEach(att => {
                output += `    [Attachment] ${att.name} -> ${att.url}\n`;
            });
        }

        if (msg.embeds.length > 0) {
            msg.embeds.forEach((embed, i) => {
                output += `    [Embed #${i + 1}]\n`;
                if (embed.title) output += `      Title: ${embed.title}\n`;
                if (embed.description) output += `      Description: ${embed.description}\n`;
                if (embed.url) output += `      URL: ${embed.url}\n`;
                if (embed.author?.name) output += `      Author: ${embed.author.name}\n`;
                if (embed.fields?.length) {
                    embed.fields.forEach(f => {
                        output += `      Field: ${f.name} -> ${f.value}${f.inline ? " (inline)" : ""}\n`;
                    });
                }
                if (embed.footer?.text) output += `      Footer: ${embed.footer.text}\n`;
            });
        }
    }

    output += `\nLog file generated on ${new Date().toISOString()}\n`;

    return output;
}

module.exports = { makeTranscriptFile };