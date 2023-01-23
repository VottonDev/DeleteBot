const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Add help command
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Link to support server'),
  async execute(interaction) {
    // Create an embed
    const embed = new EmbedBuilder().setTitle('Help').setDescription('If you need help, join the support server: https://discord.gg/BgqHYkG').setColor(0x00ff00);
    // Send the embed
    await interaction.reply({ embeds: [embed] });
  },
};
