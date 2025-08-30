require('dotenv').config();
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const getFiles = require('./utils/getFiles');
const loadCommands = require('./utils/loadCommands');

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

console.log("[TAGROLES] Attempting to login..");
client.login(token)
  .then(() => console.log("[TAGROLES] Login success"))
  .catch(err => console.error("[TAGROLES] Login error:", err));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

client.on('error', (error) => {
    console.error('Discord.js client error:', error);
});