import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
    console.error('No token');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{
            name: 'hashire hashire',
            type: ActivityType.Custom
        }]
    });
});

client.on('error', console.error);

client.login(TOKEN);