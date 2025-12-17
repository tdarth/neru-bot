require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const path = require('node:path');
const fs = require('fs');

const clientId = process.env.CLIENT_ID;

const commandsPath = path.join(__dirname, 'commands');

function loadCommands(commandsPath) {
  const commands = [];

  const entries = fs.readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(commandsPath, entry.name);

    if (entry.isDirectory()) {
      const subcommands = new Map();
      const subFiles = fs.readdirSync(entryPath).filter(f => f.endsWith('.js'));

      for (const file of subFiles) {
        const sub = require(path.join(entryPath, file));
        if (sub?.data?.name && typeof sub.execute === 'function') {
          subcommands.set(sub.data.name, sub);
        } else {
          console.log(`[WARNING] The subcommand at ${path.join(entry.name, file)} is missing "data" or "execute"`);
        }
      }

      if (subcommands.size === 0) continue;

      const data = new SlashCommandBuilder()
        .setName(entry.name.toLowerCase())
        .setDescription(`Commands related to ${entry.name}`)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]);

      for (const sub of subcommands.values()) {
        data.addSubcommand(sub.data);
      }

      commands.push({
        data,
        async execute(interaction) {
          const subName = interaction.options.getSubcommand();
          const sub = subcommands.get(subName);
          if (!sub) {
            return interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
          }
          await sub.execute(interaction);
        }
      });

      for (const subName of subcommands.keys()) {
        console.log(`Registering command: /${entry.name.toLowerCase()} ${subName}`);
      }
    } else if (entry.name.endsWith('.js')) {
      const command = require(entryPath);
      if (command?.data?.name && typeof command.execute === 'function') {
        commands.push(command);
        console.log(`Registering command: /${command.data.name}`);
      } else {
        console.log(`[WARNING] The command at ${entry.name} is missing "data" or "execute"`);
      }
    }
  }

  return commands;
}

const commands = loadCommands(commandsPath);

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(cmd => cmd.data.toJSON()) }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();