const { SlashCommandBuilder } = require('discord.js');

// Add add command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a channel that you want to automatically delete messages on')
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('The number of days before messages are deleted')
                .setRequired(false)),
    async execute(interaction) {
        // Check if the user has permission to manage channels
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
            await interaction.reply('You do not have permission to manage channels.');
            return;
        } else {
            await interaction.reply('Successfully added channel to list of channels that automatically delete messages.');
            // Add channel topic
            let channel = interaction.options.getChannel('channel');
            channel.setTopic(`DeleteBot ${interaction.options.getInteger('days') || 7}`);
        } 
    },
};