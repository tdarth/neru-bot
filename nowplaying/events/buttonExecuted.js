const { Events } = require('discord.js');
const path = require('path');
const getJsFiles = require('../utils/getFiles');

const buttonFiles = getJsFiles(path.join(__dirname, '..', 'buttons'));
const buttons = new Map();

for (const file of buttonFiles) {
    const button = require(file);
    if (button.id && button.execute) {
        buttons.set(button.id, button.execute);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const [prefix, handler] = [...buttons.entries()].find(([id]) => 
            interaction.customId.startsWith(id)
        ) || [];

        if (!handler) return;

        const id = interaction.customId.slice(prefix.length);

        try {
            await handler(interaction, id);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this button!', ephemeral: true });
        }
    },
};