const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

// List how many servers the bot is in
module.exports = {
  data : new SlashCommandBuilder().setName('info').setDescription(
           'List how many servers the bot is in'),
       async execute(interaction) {
         // Create an embed
         const embed =
             new EmbedBuilder()
                 .setTitle('Info')
                 .setDescription(
                     `Servers: ${interaction.client.guilds.cache.size}`)
                 .setColor(0x00ff00);
         // Send the embed
         await interaction.reply({embeds : [ embed ]});
       },
};
