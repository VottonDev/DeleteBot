const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Add ping command
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDMPermission(true),
  async execute(interaction) {
    // Get the time when the command was executed
    const startTime = Date.now();
    // Get the time when the message was sent
    const endTime = Date.now();
    // Calculate the time it took to send the message
    const time = endTime - startTime;
    // Create an embed
    const embed = new EmbedBuilder().setTitle('Ping').setDescription(`Time to send message: ${time}ms`).setColor(0x00ff00);
    // Edit the message with the embed
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply({ embeds: [embed] });
  },
};
