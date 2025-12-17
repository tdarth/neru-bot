const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

function loadCommands(commandsPath) {
    const commands = [];
    const entries = fs.readdirSync(commandsPath, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(commandsPath, entry.name);
        if (entry.isDirectory()) {
            const subcommands = new Map();
            const subFiles = fs.readdirSync(entryPath).filter(f => f.endsWith('.js'));
            for (const file of subFiles) {
                const sub = require(path.join(entryPath, file));
                if (sub?.data?.name && typeof sub.execute === 'function') {
                    subcommands.set(sub.data.name, sub);
                }
            }
            if (subcommands.size === 0) continue;
            const data = new SlashCommandBuilder()
                .setName(entry.name.toLowerCase())
                .setDescription(`Commands related to ${entry.name}`);
            for (const sub of subcommands.values()) {
                data.addSubcommand(sub.data);
            }
            commands.push({
                data,
                async execute(interaction) {
                    const subName = interaction.options.getSubcommand();
                    const sub = subcommands.get(subName);
                    if (!sub) {
                        return interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
                    }
                    await sub.execute(interaction);
                }
            });
        } else if (entry.name.endsWith('.js')) {
            const command = require(entryPath);
            if (command?.data?.name && typeof command.execute === 'function') {
                commands.push(command);
            }
        }
    }
    return commands;
}

module.exports = loadCommands;