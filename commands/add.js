const { SlashCommandBuilder } = require('discord.js');

// Add add command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a channel that you want to automatically delete messages on')
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to delete messages on.').setRequired(true))
    .addIntegerOption((option) => option.setName('days').setDescription('The number of days before messages are deleted').setRequired(false)),
  async execute(interaction) {
    // Check if the user has permission to manage channels
    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      await interaction.reply('You do not have permission to manage channels.');
    } else {
      await interaction.reply('Successfully added channel to list of channels that automatically delete messages.');
      // Add channel topic
      let channel = interaction.options.getChannel('channel');
      // If days is higher than 12 then reply that max is 12
      if (interaction.options.getInteger('days') > 12) {
        await interaction.reply('The max number of days is 12.');
        return;
      } else {
        channel.setTopic(`DeleteBot ${interaction.options.getInteger('days') || 7}`);
        await interaction.reply('Successfully added channel to list of channels that automatically delete messages.');
      }
    }
  },
};
