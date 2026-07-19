require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { DefaultWebSocketManagerOptions: { identifyProperties } } = require("@discordjs/ws");

const loadTriggers = require('./utils/triggerCommandLoader');
const splitIntoChunks = require('./utils/splitIntoChunks');

const token = process.env.TOKEN;

identifyProperties.browser = "Discord iOS";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: ["CHANNEL"]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
  const commandFolders = fs.readdirSync(foldersPath).filter(item => item !== ".DS_Store");

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    if (!fs.existsSync(commandsPath)) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[NERU] WARNING: The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
} else {
  console.log("[NERU] No commands folder found. Skipping command loading.");
}

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(`[NERU] Loading event: ${filePath}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
} else {
  console.log("[NERU] No events folder found. Skipping event loading.");
}

loadTriggers(client);

console.log("[NERU] Attempting to login..");
client.login(token)
  .then(() => console.log("[NERU] Login success"))
  .catch(err => console.error("[NERU] Login error:", err));

process.on('unhandledRejection', (reason, promise) => {
    console.error('[NERU] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[NERU] Uncaught Exception:', error);
});

client.on('error', (error) => {
    console.error('[NERU] Discord.js client error:', error);
});