const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Add help command
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Link to support server').setDMPermission(true),
  async execute(interaction) {
    // Create an embed
    const embed = new EmbedBuilder().setTitle('Help').setDescription('If you need help, join the support server: https://discord.gg/BgqHYkG').setColor(0x00ff00);
    // Send the embed
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply({ embeds: [embed] });
  },
};
