const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Add privacy command
module.exports = {
  data: new SlashCommandBuilder().setName('privacy').setDescription('Returns the current privacy policy of the bot').setDMPermission(true),
  async execute(interaction) {
    // Create an embed
    const embed = new EmbedBuilder()
      .setTitle('Privacy Policy')
      .setDescription('This bot does not collect nor store any data anywhere. The bot uses the channel topic to function and reads it real-time to work instead.')
      .setColor(0x00ff00);
    // Edit the message with the embed
    await interaction.deferReply();
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
