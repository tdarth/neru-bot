const { Events } = require('discord.js');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../../utils/user/getUserData');
const { updateUserData } = require('../../utils/user/updateUserData');
const { toMySQLDate, fromMySQLDate } = require('../../utils/sqlDate');
const { addXp } = require('../../utils/leveling/addXp');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const serverConfig = await getServerConfig(message.guild.id);
        let userData = await getUserData(message.guild.id, message.author.id);

        if (!userData?.last_message) {
            await updateUserData(message.guild.id, message.author.id, 'last_message', toMySQLDate(Date.now() - serverConfig.xp_cooldown * 1000));
            await updateUserData(message.guild.id, message.author.id, 'username', message.author.username);
            userData = await getUserData(message.guild.id, message.author.id);
        }

        if (serverConfig.xp_enabled) {
            if (message.createdTimestamp - fromMySQLDate(userData.last_message) >= serverConfig.xp_cooldown * 1000) {
                await addXp(message.guild.id, message.author.id, 'msg', message.channel);
            }
        }
    },
};