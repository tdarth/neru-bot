const { Events } = require('discord.js');
const ContainerMessage = require('../utils/classes/ContainerMessage');
const { setup } = require('../utils/setupFunc');
const { songs } = require('../songs.json')

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        try {
            if (interaction.customId === "setup_confirm") {
                await interaction.deferUpdate();
                await interaction.editReply(new ContainerMessage(`:hourglass: **Cache guild members.**\n:hourglass: \`(0/${Math.ceil(songs.length / 50)})\` **Create channel categories.**\n:hourglass: \`(0/${songs.length})\` **Create song channels.**`).isEphemeral().build());

                await setup(interaction);
            }

            if (interaction.customId === "setup_cancel") {
                await interaction.deferUpdate();
                await interaction.deleteReply();
            }
        } catch (e) {
            console.log(e);
        }

    },
};