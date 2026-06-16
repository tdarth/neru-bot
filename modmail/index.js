require('dotenv').config();
const { spawn } = require('child_process');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const getFiles = require('./utils/getFiles');
const loadCommands = require('./utils/loadCommands');
const { init } = require('./db/init');

// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildMessageTyping], partials: [Partials.Channel] });
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildMessageTyping], partials: [Partials.Channel] });

client.commands = new Collection();


(async () => {
  try {
    await init();
    console.log("[MODMAIL] Database ready!");
    
    startBot();
  } catch (err) {
    console.error("[MODMAIL] Failed to initialize database:", err);
    process.exit(1);
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
    console.log(`[MODMAIL] Loading: ${filePath}`);
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

    if (trimmed === 'modmailReload') {
        console.log('[MODMAIL] Running deploy-commands.js...');

        const child = spawn('node', ['./deploy-commands.js'], { stdio: 'inherit' });

        child.on('close', (code) => {
            console.log(`[MODMAIL] deploy-commands.js exited with code ${code}`);
        });
    }
});