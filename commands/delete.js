const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Add delete command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a channel from the list of channels that automatically delete messages')
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to delete messages on.').setRequired(true)),
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
        const embed = new EmbedBuilder()
          .setTitle('Lack of Permissions')
          .setDescription(`You require MANAGE_MESSAGES permission to remove the bot from ${channel}.`)
          .setColor(0xff0000);
        // Send the embed
        await interaction.reply({ embeds: [embed] });
      } else {
        // Set channel topic
        channel.setTopic(null);
        // Create an embed
        const embed = new EmbedBuilder()
          .setTitle('Delete')
          .setDescription(`Succesfully deleted ${channel} from the list of channels that automatically delete messages.`)
          .setColor(0x00ff00);
        // Send the embed
        await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
