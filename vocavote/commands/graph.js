const { SlashCommandSubcommandBuilder, AttachmentBuilder } = require('discord.js');
const { Chart, BarController, LinearScale, CategoryScale, BarElement, Tooltip, Legend } = require('chart.js');
const { retrieve } = require('../utils/store');
const { createCanvas } = require('canvas');
const ContainerMessage = require('../utils/classes/ContainerMessage');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('graph')
        .setDescription('Creates a bar graph of your vote frequency')
        .addAttachmentOption((option) => option.setName('vote-file').setDescription('Optional file to use instead'))
        .addStringOption((option) => option.setName('graph-width').setDescription('Graph width, default 1200'))
        .addStringOption((option) => option.setName('graph-height').setDescription('Graph height, default 800')),
    async execute(interaction) {
        try {
            Chart.register([
                BarController,
                BarElement,
                LinearScale,
                CategoryScale,
                Tooltip,
                Legend
            ]);

            let data = [];

            const voteFile = interaction?.options?.getAttachment('vote-file') || null;
            const width = Math.min(interaction.options.getString('graph-width'), 4000) || 1200;
            const height = Math.min(interaction.options.getString('graph-height'), 4000) || 800;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            if (voteFile) {
                const res = await fetch(dataMusic.url);
                if (!res.ok) return interaction.reply(new ContainerMessage(':x: **An error occurred.**'));
                const contents = await res.text();
                data = JSON.parse(contents);
            } else {
                const result = await retrieve('./datamusic.json', interaction?.user?.id);
                if (!result) return interaction.reply(new ContainerMessage(':x: **An error occurred.**'));
                data = result;
            }

            const votes = data.votes.map(vote => vote.vote);
            const uniqueVotes = Array.from(new Set(votes)).sort((a, b) => a - b);
            const counts = uniqueVotes.map(voteValue => votes.filter(v => v === voteValue).length);
            const labels = uniqueVotes.map(v => v.toString());
            const maxVotes = Math.max(...counts);

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Vote Counts',
                        data: counts,
                        backgroundColor: '#29a5e8ff',
                    }]
                },
                options: {
                    responsive: false,
                    animation: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Vote Score'
                            },
                            ticks: {
                                color: '#ffffffff',
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    weight: '600',
                                    size: 12,
                                },
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Votes'
                            },
                            beginAtZero: true,
                            max: maxVotes,
                            ticks: {
                                color: '#ffffffff',
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    size: 12,
                                    weight: '600',
                                },
                                stepSize: 1
                            },
                            grid: {
                                color: '#333',
                                borderColor: '#555',
                                lineWidth: 1,
                                drawBorder: false,
                                borderDash: [5, 5]
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#bbb',
                                font: {
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    weight: '600',
                                    size: 14,
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#222',
                            titleColor: '#29a5e8ff',
                            bodyColor: '#ccc',
                            borderColor: '#29a5e8ff',
                            borderWidth: 1,
                            cornerRadius: 4,
                        }
                    }
                }
            });

            const pngBuffer = canvas.toBuffer('image/png');
            chart.destroy();

            await interaction.reply({
                files: [new AttachmentBuilder(pngBuffer, { name: `${voteFile ? `${Date.now()}` : `${Date.now()}-${interaction?.user?.id}`}-graph.png` })]
            });
        } catch (e) {
            console.log(`Graph command error: ${e}`);
            await interaction.reply(new ContainerMessage(':x: **An error occurred.**\n-# Are you using the correct file type?').isEphemeral().build());
        }
    }
};