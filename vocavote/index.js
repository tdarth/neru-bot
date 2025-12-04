require('dotenv').config();
const path = require('node:path');
const { spawn } = require('child_process');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const getFiles = require('./utils/getFiles');
const loadCommands = require('./utils/loadCommands');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers] });

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

client.login(process.env.TOKEN);

process.stdin.on('data', (input) => {
    const trimmed = input.toString().trim();

    if (trimmed === 'vocaReload') {
        console.log('Running deploy-commands.js...');

        const child = spawn('node', ['./deploy-commands.js'], { stdio: 'inherit' });

        child.on('close', (code) => {
            console.log(`deploy-commands.js exited with code ${code}`);
        });
    }
});