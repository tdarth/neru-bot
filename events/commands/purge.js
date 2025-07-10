const { prefix, emojis } = require('../../config.json');
const replyWithText = require("../../utils/replyWithText");
const sendToChannelWithText = require("../../utils/sendToChannelWithText");

const allowedRoles = ["1369834948386623518", "1390101291589697727", "1369249484772610079"];

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

        try {
            while (amount > 0) {
                const toDelete = amount > 100 ? 100 : amount;
                const deletedMessages = await message.channel.bulkDelete(toDelete, true);
                const deletedCount = deletedMessages.size;
                totalDeleted += deletedCount;
                amount -= deletedCount;

                if (deletedCount === 0) break;
            }

            await sendToChannelWithText(message.client, message.channel.id, `:white_check_mark: Purged \`${totalDeleted}\` messages by <@${message.author.id}> (\`${message.author.id}\`)`);
        } catch (error) {
            console.error("Error during purge:", error);
            await replyWithText(message, `:x: **An error occurred while purging messages.**`);
        }
    },
};
