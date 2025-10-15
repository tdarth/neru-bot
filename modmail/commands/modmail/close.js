const { SlashCommandSubcommandBuilder, MessageFlags, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder } = require('discord.js');
const { staffRoles, modmailLogChannelId, emojis, modmailChannelType, modmailChannelForThreadId } = require('../../config.json');
const { messages } = require('../../messages.json');
const { clearChannel, getUserByChannel } = require('../../db/utils/helper');
const { getDiscUserById } = require('../../utils/getDiscUserById');
const { getChannelFromId } = require('../../utils/getChannelFromId');
const { makeTranscriptFile } = require('../../utils/makeTranscriptFile');
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('close')
        .setDescription("Closes the current ModMail channel")
        .addStringOption(option => option.setName('reason').setDescription('The reason to close the ModMail'))
        .addStringOption(option => option.setName('silent-close').setDescription('Prevent the user from being notified').addChoices({ name: 'Enable', value: 'enable' })),
    async execute(interaction) {
        if (!interaction.guild) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_IN_SERVER });
        if (!interaction.member.roles.cache.some(role => staffRoles.includes(role.id))) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.MISSING_PERMISSION });
        if (!interaction.channel.name.includes('modmail-') || (modmailChannelType == 1 && interaction.channel.parentId !== modmailChannelForThreadId)) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_MODMAIL });
        if (modmailChannelType == 0 && interaction.channel.topic.includes('CLOSED')) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.ALREADY_CLOSED });

        const user = await getDiscUserById(interaction.client, interaction.channel.topic || await getUserByChannel(process.env.GUILD_ID, interaction.channel.id) || null);
        if (!user) return await interaction.reply({ flags: MessageFlags.Ephemeral, content: messages.errors.NOT_MODMAIL });

        const reason = interaction?.options?.getString('reason') || null;
        const silentClose = interaction?.options?.getString('silent-close') || null;

        await clearChannel(process.env.GUILD_ID, interaction.channel.id);
        if (modmailChannelType == 0) await interaction.channel.edit({ topic: `CLOSED - ${interaction.channel.topic}` });

        const embed = new EmbedBuilder();
        embed.setAuthor({ name: 'Staff', iconURL: `https://cdn.discordapp.com/avatars/${interaction.client.user.id}/${interaction.client.user.avatar}.png` });
        embed.setColor('#242429');
        embed.setTimestamp(Date.now());
        embed.setDescription(`:wastebasket: \`ModMail\` closed.${reason ? `\n\`\`\`${reason}\`\`\`` : ''}`);

        if (!silentClose) await user.send({ embeds: [embed] }).catch(err => console.log(`[MODMAIL] Error on close DM: ${err}`));
        await interaction.reply(`${messages.success.MODMAIL_CLOSED}${silentClose ? ' silently' : ''}${reason ? ` (\`${reason}\`)` : ''}.\n${emojis.spinner} Transcribing...`);

        const buffer = Buffer.from(await makeTranscriptFile(interaction.client, interaction.channel.id, 1000));
        const transcriptFileName = `${interaction.channel.name}-${Date.now()}.txt`;
        // const transcript = new AttachmentBuilder(buffer, { name: transcriptFileName });

        if (modmailLogChannelId) {
            const logChannel = await getChannelFromId(interaction.client, modmailLogChannelId);

            // await logChannel.send({ files: [transcript], content: `:outbox_tray: <t:${Math.floor(Date.now() / 1000)}:f> <#${interaction.channel.id}> (**#${interaction.channel.name}**, \`${interaction.channel.id}\`) opened by <@!${user.id}> (**${user.username || 'unknown'}**, \`${user.id}\`), was closed by <@!${interaction.user.id}> (**${interaction.user.username || 'unknown'}**, \`${interaction.user.id}\`) with reason: \`${reason ? reason : 'null'}\` Closed silently? : ${silentClose ? '`true`' : '`false`'}.`, allowedMentions: { parse: [] } });

            await logChannel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`:outbox_tray: **Closed** by <@!${interaction.user.id}> (**${interaction.user.username || 'unknown'}**, \`${interaction.user.id}\`)\n> <t:${Math.floor(Date.now() / 1000)}:f>\n> Opened by: <@!${user.id}> (**${user.username || 'unknown'}**, \`${user.id}\`)\n> Reason: \`${reason}\`\n> Closed Silently: \`${silentClose}\``)
                        )
                ],
                allowedMentions: {
                    parse: []
                }
            })

            const htmlTranscript = await createTranscript(interaction.channel, {
                poweredBy: false,
                footerText: 'Viewing {number} message{s}.',
                returnType: 'string'
            })

            const response = await fetch(`https://ticket-transcript.tdarth.workers.dev/upload`, {
                method: "POST",
                body: JSON.stringify({
                    "html": htmlTranscript,
                    "apiKey": process.env.TRANSCRIPT_API_KEY
                })
            })

            if (!response.ok) {
                await logChannel.send({ files: [new AttachmentBuilder(Buffer.from(htmlTranscript, 'utf-8'), { name: "transcript.html" })] })
            } else {
                const data = await response.json();

                await logChannel.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel('Transcript')
                                    .setURL(`https://tetoscript.pages.dev/${data.url.replace('https://ticket-transcript.tdarth.workers.dev/', '')}`),
                                new ButtonBuilder()
                                    .setCustomId(`PW_${data.password}`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel('Password')
                            )
                    ]
                })
            }
        }

        const deleteButton = new ButtonBuilder()
            .setCustomId(`deleteChannel_${interaction.channel.id}`)
            .setLabel('🗑️ Delete')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(deleteButton);

        const closed = await interaction.fetchReply();
        await closed.edit({ content: closed.content.replace(`${emojis.spinner} Transcribing...`, `Transcript generated in <#${modmailLogChannelId}>.`), components: [row] });
        await interaction.channel.setName(`[${silentClose ? "SILENT " : ''}CLOSED] ${interaction.channel.name}`)
    }
};