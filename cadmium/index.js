require('dotenv').config();
const initDatabase = require('./db/init');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const getFiles = require('./utils/getFiles');
const loadCommands = require('./utils/loadCommands');

initDatabase()
  .then(() => {
    console.log('Tables are ready');
    startBot();
  })
  .catch(err => {
    console.error('Error initializing database:', err);
  });

function startBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commands = loadCommands(commandsPath);
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = getFiles(eventsPath);

  for (const filePath of eventFiles) {
    console.log(`[LOADING] ${filePath}`);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  client.login(process.env.TOKEN)
}