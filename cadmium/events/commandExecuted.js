const { Events } = require('discord.js');
const { messages } = require('../messages.json');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);

      let logCmd = `/${interaction.commandName}`;
      try {
        const sub = interaction.options.getSubcommand(false);
        if (sub) logCmd += ` ${sub}`;
      } catch { }

      console.log(`${interaction.user.tag} (${interaction.user.id}) executed ${logCmd}.`);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(new ContainerMessage(messages.errors.CATCH_ALL_ERROR_COMMAND).isEphemeral().build());
      } else {
        await interaction.reply(new ContainerMessage(messages.errors.CATCH_ALL_ERROR_COMMAND).isEphemeral().build());
      }
    }
  },
};