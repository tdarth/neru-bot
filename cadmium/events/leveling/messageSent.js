const { Events } = require('discord.js');
const { messages } = require('../messages.json');
const { getServerConfig } = require('../../utils/server/getServerConfig');
const { getUserData } = require('../../utils/user/getUserData');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const serverConfig = getServerConfig();
        const userData = getUserData();

        if (serverConfig.xp_enabled) {
            console.log(message.createdTimestamp);
        }
    },
};