const { Client, GatewayIntentBits, ActivityType, AttachmentBuilder } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error('No token');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content) return;
    if (message.author.id != '990500436047982602') return;

    try {
        const command = message?.content.replace(`<@${client.user.id}> `, '').trim().toLowerCase();

        if (command == 'servers') {
            let toAttach = '';

            const guilds = client.guilds.cache;

            guilds.forEach(guild => {
                toAttach += `${guild.name} (${guild.id}) - ${guild.memberCount} members\n`
            });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const attachment = new AttachmentBuilder(Buffer.from(toAttach.trimEnd()), { name: `suzuka_server_data-${timestamp}.txt` })

            return await message.reply({
                files: [attachment]
            })
        }
    } catch (e) {
        console.log(`Suzuka Error on servers: ${e}`);
    }
});

client.on('error', console.error);

client.login(TOKEN);