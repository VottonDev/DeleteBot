const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
      // Get channel
      let channel = interaction.options.getChannel('channel');
      // Check if the bot can delete messages in the channel
      if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
        // Create an embed
        const embed = new EmbedBuilder().setTitle('Add').setDescription(`The bot misses permissions to delete messages in ${channel}.`).setColor(0xff0000);
        // Send the embed
        await interaction.reply({ embeds: [embed] });
      } else {
        // Get days
        let days = interaction.options.getInteger('days');
        // Check if days is null
        if (days == null) {
          days = 7;
        }
        // Set channel topic
        channel.setTopic(`DeleteBot${days}`);
        // Create an embed
        const embed = new EmbedBuilder()
          .setTitle('Add')
          .setDescription(`Succesfully added ${channel} to the list of channels that automatically delete messages.`)
          .setColor(0x00ff00);
        // Send the embed
        await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
