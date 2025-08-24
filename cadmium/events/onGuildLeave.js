const { deleteServerData } = require('../utils/server/deleteServerData');

module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        await deleteServerData(guild.id);
    },
};