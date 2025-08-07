const { REST, Routes } = require('discord.js');
const { clientId, guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

let commandFolders = [];
if (fs.existsSync(foldersPath)) {
    commandFolders = fs.readdirSync(foldersPath).filter(item => item !== ".DS_Store");
} else {
    console.log("Commands folder does not exist. Will unregister all commands.");
}

const token = process.env.TOKEN;

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands in guild ${guildId}`);

        let data;
        if (commands.length === 0) {
            console.log('No commands found. Clearing..');
            data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        } else {
            data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
