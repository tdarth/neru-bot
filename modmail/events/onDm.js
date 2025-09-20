const { Events, ChannelType, EmbedBuilder, ThreadAutoArchiveDuration } = require('discord.js');
const { getChannelByUser, addUserToChannel, clearChannel } = require('../db/utils/helper');
const { getChannelFromId } = require('../utils/getChannelFromId');
const { messages } = require('../messages.json');
const { modmailCategoryId, modmailLogChannelId, modmailChannelForThreadId, modmailChannelType, modmailPingStaffOnCreation, staffRoles, modmailWelcomeMessage } = require('../config.json');

async function createChannel(guild, channelName, authorId, type = 0, channelId = null, client = null) {
    let channel = null;

    if (type == 0) {
        channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: authorId,
            parent: modmailCategoryId
        });

    } else if (type == 1) {
        channelToCreateThread = await getChannelFromId(client, channelId);
        channel = await channelToCreateThread.threads.create({
            name: channelName,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            type: ChannelType.PrivateThread,
            invitable: false
        })
    }

    await addUserToChannel(guild.id, channel.id, authorId);
    return channel || null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channel.type !== ChannelType.DM) return;
        if (message.author.bot) return;
        if (message.messageSnapshots.first()) {
            await message.reply(messages.errors.NO_FORWARDED_MESSAGES);
            return await message.react('❌');
        }

        const client = message.client;
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        const author = message.author;

        let modmailChannelId = await getChannelByUser(process.env.GUILD_ID, author.id);
        console.log(`[MODMAIL] Fetched channel ID from DB for user ${author.id}: ${modmailChannelId}`);
        let modmailChannel;

        if (modmailChannelId) {
            modmailChannel = await getChannelFromId(client, modmailChannelId);
            if (!modmailChannel) {
                await clearChannel(process.env.GUILD_ID, modmailChannelId);
                modmailChannel = await createChannel(guild, `modmail-${author?.username || 'unknown'}`, author.id, modmailChannelType, modmailChannelForThreadId, client);
                await author.send(messages.info.OPENED_MODMAIL);

                if (modmailPingStaffOnCreation) await modmailChannel.send(staffRoles.map(role => `<@&${role}>`).join(', '));
                if (modmailWelcomeMessage) await modmailChannel.send(messages.info.WELCOME_MESSAGE);

                if (modmailLogChannelId) {
                    const logChannel = await getChannelFromId(message.client, modmailLogChannelId);
                    await logChannel.send({ content: `:inbox_tray: <t:${Math.floor(Date.now() / 1000)}:f> <#${modmailChannel.id}> (**#${modmailChannel.name}**, \`${modmailChannel.id}\`) opened by <@!${author.id}> (**${author.username || 'unknown'}**, \`${author.id}\`).`, allowedMentions: { parse: [] } });
                }
            }
        } else {
            modmailChannel = await createChannel(guild, `modmail-${author?.username || 'unknown'}`, author.id, modmailChannelType, modmailChannelForThreadId, client);
            await author.send(messages.info.OPENED_MODMAIL);

            if (modmailPingStaffOnCreation) await modmailChannel.send(staffRoles.map(role => `<@&${role}>`).join(', '));
            if (modmailWelcomeMessage) await modmailChannel.send(messages.info.WELCOME_MESSAGE);

            if (modmailLogChannelId) {
                const logChannel = await getChannelFromId(message.client, modmailLogChannelId);
                await logChannel.send({ content: `:inbox_tray: <t:${Math.floor(Date.now() / 1000)}:f> <#${modmailChannel.id}> (**#${modmailChannel.name}**, \`${modmailChannel.id}\`) opened by <@!${author.id}> (**${author.username || 'unknown'}**, \`${author.id}\`).`, allowedMentions: { parse: [] } });
            }
        }

        if (!modmailChannel) {
            console.log(`[MODMAIL] Unable to fetch channel for user ${author.id}`);
            return;
        }

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: author?.username || 'unknown', iconURL: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png` });
        embed.setColor('#242429');
        embed.setTimestamp(Date.now());

        let toAdd = "";

        if (message.content) toAdd += message.content;
        if (message.stickers.size > 0) toAdd += `\n\n${message.stickers.map(sticker => `**__Sticker:__** ${sticker.url}`).join('\n')}`;

        if (toAdd) embed.setDescription(toAdd);

        const files = message.attachments.size > 0 ? Array.from(message.attachments.values()) : undefined;

        try {
            await modmailChannel.send({
                embeds: [embed],
                ...(files && { files })
            });
            await message.react('✅');
        } catch (err) {
            console.log(`[MODMAIL] Error in sending message to ${modmailChannel.id}: ${err}`);
            await message.react('❌');
        }
    },
};