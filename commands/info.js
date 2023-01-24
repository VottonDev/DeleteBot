const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// List how many servers the bot is in
module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('List how many servers the bot is in').setDMPermission(true),
  async execute(interaction) {
    // Create an embed
    const embed = new EmbedBuilder().setTitle('Info').setDescription(`Servers: ${interaction.client.guilds.cache.size}`).setColor(0x00ff00);
    // Send the embed
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
