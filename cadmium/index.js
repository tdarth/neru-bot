require('dotenv').config();
const { initDatabase } = require('./db/init');
const { verifyServerColumns } = require('./utils/server/verifyServerColumns');
const { spawn } = require('child_process');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const getFiles = require('./utils/getFiles');
const loadCommands = require('./utils/loadCommands');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();

module.exports = { client };

(async () => {
    try {
        await initDatabase();
        console.log('Tables are ready');

        await verifyServerColumns();

        startBot();
    } catch (err) {
        console.error('Error initializing database:', err);
    }
})();

function startBot() {
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

process.stdin.setEncoding('utf8');
process.stdin.resume();

process.stdin.on('data', (input) => {
    const trimmed = input.toString().trim();

    if (trimmed === 'cadmiumReload') {
        console.log('[CADMIUM] Running deploy-commands.js...');

        const child = spawn('node', ['./deploy-commands.js'], { stdio: 'inherit' });

        child.on('close', (code) => {
            console.log(`[CADMIUM] deploy-commands.js exited with code ${code}`);
        });
    }
});