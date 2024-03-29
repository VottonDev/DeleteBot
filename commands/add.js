const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Add (add) command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a channel that you want to automatically delete messages in')
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to delete messages on.').setRequired(true))
    .addIntegerOption((option) => option.setName('days').setDescription('The number of days before messages are deleted').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(interaction) {
    // Get channel
    let channel = interaction.options.getChannel('channel');
    // Check if the bot can delete messages in the channel
    if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageMessages)) {
      // Create an embed
      const embed = new EmbedBuilder().setTitle('Add').setDescription(`The bot misses permissions to delete messages in ${channel}.`).setColor(0xff0000);
      // Send the embed
      await interaction.deferReply();
      await wait(4000);
      await interaction.editReply({ embeds: [embed] });
    } else {
      // Get days
      let days = interaction.options.getInteger('days');
      // Check if days is null
      if (days == null) {
        days = 7;
      }
      // Set channel topic
      await channel.setTopic(`DeleteBot${days}`);
      // Create an embed
      const embed = new EmbedBuilder()
        .setTitle('Add')
        .setDescription(`Successfully added ${channel} to the list of channels that automatically delete messages.`)
        .setColor(0x00ff00);
      // Send the embed
      await interaction.deferReply();
      await wait(4000);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
