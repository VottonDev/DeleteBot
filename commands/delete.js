const { SlashCommandBuilder, Client } = require('discord.js');

// Add delete command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a channel from the list of channels that automatically delete messages')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to delete messages on.')
                .setRequired(true)),
    async execute(interaction) {
        // Check if the user has permission to manage channels
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
            await interaction.reply('You do not have permission to manage channels.');
            return;
        } else {
            await interaction.reply('Succesfully removed channel from list of channels that automatically delete messages.');
            // Remove channel topic
            let channel = interaction.options.getChannel('channel');
            channel.setTopic(null);
        }
    },
};