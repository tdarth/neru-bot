const { Events } = require('discord.js');
const { messages } = require('../../messages.json');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../../utils/user/getUserData');
const ContainerMessage = require('../../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const serverConfig = getServerConfig(message.guild.id);
        const userData = getUserData(message.guild.id, message.author.id);

        console.log('message detected');
        console.log(serverConfig.xp_enabled);

        if (serverConfig.xp_enabled) {
            console.log(message.createdTimestamp);
        }
    },
};