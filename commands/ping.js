const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Add ping command
module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(interaction) {
    // Get the time when the command was executed
    const startTime = Date.now();
    // Send a message
    await interaction.reply('Pong!');
    // Get the time when the message was sent
    const endTime = Date.now();
    // Calculate the time it took to send the message
    const time = endTime - startTime;
    // Create an embed
    const embed = new EmbedBuilder().setTitle('Ping').setDescription(`Time to send message: ${time}ms`).setColor(0x00ff00);
    // Edit the message with the embed
    await interaction.editReply({ embeds: [embed] });
  },
};
