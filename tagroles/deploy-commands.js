require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require('node:path');
const loadCommands = require('./utils/loadCommands');

const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommands(commandsPath);

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.data.toJSON()) }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();