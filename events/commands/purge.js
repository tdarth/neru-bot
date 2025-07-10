const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");
const sendToChannelWithText = require("../../utils/sendToChannelWithText");
const { MessageAttachment } = require('discord.js');
const path = require('path');

const allowedRoles = ["1369834948386623518", "1390101291589697727", "1369249484772610079"];

const ARCHIVE_CHANNEL_ID = "1369842594003292211"; 

module.exports = {
    name: 'purge',
    trigger: (message) => message.content.toLowerCase().startsWith(`${prefix}purge`),
    async execute(message) {
        if (message.author.id !== "990500436047982602" && !message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
            return await replyWithText(message, `:x: **No permission.**`);
        }

        let amount = message.content.toLowerCase().replace(`${prefix}purge`, "").trim();
        amount = parseInt(amount, 10);

        if (!amount || isNaN(amount)) {
            return await replyWithText(message, `:x: **Please specify a valid number. (max 500)**`);
        }

        if (amount > 500) amount = 500;

        let totalDeleted = 0;
        let deletedMessagesArchive = [];

        try {
            while (amount > 0) {
                const toDelete = amount > 100 ? 100 : amount;

                const fetchedMessages = await message.channel.messages.fetch({ limit: toDelete });
                if (fetchedMessages.size === 0) break;

                fetchedMessages.forEach(msg => {
                    const channelName = message.channel.name;
                    const messageId = msg.id;
                    const timestamp = msg.createdAt.toISOString().replace('T', ' ').substring(0, 19);
                    const username = msg.member?.displayName || msg.author.username;
                    const content = msg.content.replace(/\n/g, " ");

                    deletedMessagesArchive.push(`[${channelName}] [${messageId}] [${timestamp}] ${username}: ${content}`);
                });

                const deletedMessages = await message.channel.bulkDelete(fetchedMessages, true);
                const deletedCount = deletedMessages.size;
                totalDeleted += deletedCount;
                amount -= deletedCount;

                if (deletedCount === 0) break;
            }

            const archiveContent = deletedMessagesArchive.reverse().join('\n'); 

            if (archiveContent.length > 0) {
                const buffer = Buffer.from(archiveContent, 'utf-8');
                const fileName = `purge-archive-${message.channel.name}-${Date.now()}.txt`;
                const attachment = new MessageAttachment(buffer, fileName);

                const archiveChannel = message.client.channels.cache.get(ARCHIVE_CHANNEL_ID);
                if (archiveChannel) {
                    await archiveChannel.send({
                        content: `Purge archive from #${message.channel.name} by <@${message.author.id}> (\`${message.author.id}\`)`,
                        files: [attachment],
                        allowedMentions: { parse: [] }
                    });
                } else {
                    console.warn("Archive channel not found.");
                }
            }

            await sendToChannelWithText(message.client, message.channel.id, `:white_check_mark: Purged \`${totalDeleted}\` messages by <@${message.author.id}> (\`${message.author.id}\`)`);
        } catch (error) {
            console.error("Error during purge:", error);
            await replyWithText(message, `:x: **An error occurred while purging messages.**`);
        }
    },
};
