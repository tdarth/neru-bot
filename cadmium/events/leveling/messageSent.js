const { Events } = require('discord.js');
const { messages } = require('../../messages.json');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../../utils/user/getUserData');
const { toMySQLDate, fromMySQLDate } = require('../../utils/sqlDate');
const { addXp } = require('../../utils/leveling/addXp');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const serverConfig = await getServerConfig(message.guild.id);
        let userData = await getUserData(message.guild.id, message.author.id);

        if (!userData.last_message) {
            await updateUserData(message.guild.id, message.author.id, 'last_message', toMySQLDate(Date.now()));
            userData = await getUserData(message.guild.id, message.author.id);
        }

        if (serverConfig.xp_enabled) {
            if (message.createdTimestamp - fromMySQLDate(userData.last_message) >= serverConfig.xp_cooldown * 1000) {
                await addXp(message.guild.id, message.author.id, 'msg');
            }
        }
    },
};