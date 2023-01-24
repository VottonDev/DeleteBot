const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

// Add command to check if the bot misses permissions on a channel
module.exports = {
  data : new SlashCommandBuilder()
           .setName('checkmissingperm')
           .setDescription('Check if the bot misses permissions on a channel')
           .addChannelOption(
               (option) =>
                   option.setName('channel')
                       .setDescription('The channel to check permissions on.')
                       .setRequired(true)),
       async execute(interaction) {
         // Check if the user has permission to manage channels
         if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
           await interaction.reply(
               'You do not have permission to manage channels.');
         } else {
           // Get channel
           let channel = interaction.options.getChannel('channel');
           // Check if the bot can delete messages in the channel
           if (!channel.permissionsFor(interaction.client.user)
                    .has('MANAGE_MESSAGES')) {
             // Create an embed
             const embed =
                 new EmbedBuilder()
                     .setTitle('Check Missing Permissions')
                     .setDescription(
                         `The bot misses permissions to delete messages in ${
                             channel}.`)
                     .setColor(0xff0000);
             // Send the embed
             await interaction.reply({embeds : [ embed ]});
           } else {
             // Create an embed
             const embed =
                 new EmbedBuilder()
                     .setTitle('Check Missing Permissions')
                     .setDescription(
                         `The bot has permissions to delete messages in ${
                             channel}.`)
                     .setColor(0x00ff00);
             // Send the embed
             await interaction.reply({embeds : [ embed ]});
           }
         }
       },
};
