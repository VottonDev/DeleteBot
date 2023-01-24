const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Add a command to list the required permissions to make the bot function
module.exports = {
  data: new SlashCommandBuilder().setName('listrequiredpermissions').setDescription('List the required permissions to make the bot function').setDMPermission(true),
  async execute(interaction) {
    // Create an embed
    const embed = new EmbedBuilder()
      .setTitle('Required Permissions')
      .setDescription('The bot requires the following permissions to function:\n\n- Manage Channels\n- Manage Messages\n- Send Messages\n- Read Message History')
      .setColor(0x00ff00);
    // Send the embed
    await interaction.deferReply();
    await wait(4000);
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
