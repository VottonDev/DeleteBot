const { SlashCommandBuilder } = require('discord.js');

// Add help command
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Link to support server'),
  async execute(interaction) {
    await interaction.reply('https://discord.gg/BgqHYkG');
  },
};
