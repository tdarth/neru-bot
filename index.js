require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { Client, GatewayIntentBits, Collection, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require('discord.js');
const { DefaultWebSocketManagerOptions: { identifyProperties } } = require("@discordjs/ws");

const loadTriggers = require('./utils/triggerCommandLoader');
const splitIntoChunks = require('./utils/splitIntoChunks');
const app = express();

app.use(express.json());

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;
const token = process.env.TOKEN;

app.get('/', (req, res) => res.send('https://discord.gg/nerutag'));

app.post('/newapplication', async (req, res) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth || auth !== `Bearer ${INTERNAL_API_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { username, verifyCode, application } = req.body;

    if (!username || !verifyCode) {
      return res.status(400).json({ error: "Missing username or verifyCode" });
    }

    const user = client.users.cache.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ error: "Discord user not found" });
    }

    let applicationFields = Object.entries(application)
      .map(([q, a]) => {
        const cleanQuestion = q.replace(/\s*\n\s*/g, ' ').trim();
        let cleanAnswer;

        if (Array.isArray(a)) {
          cleanAnswer = a.map(item => String(item).replace(/\*/g, '').trim()).join('\n- ');
          cleanAnswer = '- ' + cleanAnswer;
        } else {
          cleanAnswer = '- ' + String(a || '').replace(/\*/g, '').trim();
        }

        return `-# **${cleanQuestion}**\n${cleanAnswer}`;
      })
      .join("\n\n");

    const chunks = splitIntoChunks(applicationFields, 3900);

    for (const chunk of chunks) {
      await user.send({
        flags: MessageFlags.IsComponentsV2,
        components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk))]
      });
    }

    await user.send({
      flags: MessageFlags.IsComponentsV2,
      components: [new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder()
          .setContent(`:warning: If this application was sent by you, please type \`${verifyCode}\` in this DM.`))]
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in /newapplication:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

identifyProperties.browser = "Discord iOS";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
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
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
} else {
  console.log("No commands folder found. Skipping command loading.");
}

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(`Loading event: ${filePath}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
} else {
  console.log("No events folder found. Skipping event loading.");
}

loadTriggers(client);

console.log("Attempting to login..");
client.login(token)
  .then(() => console.log("Login success"))
  .catch(err => console.error("Login error:", err));