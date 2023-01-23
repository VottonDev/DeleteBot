const { SlashCommandBuilder } = require('discord.js');

// List how many servers the bot is in
module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('List how many servers the bot is in'),
    async execute(interaction) {
        interaction.reply(`I am in ${interaction.client.guilds.cache.size} servers!`);
    },
};