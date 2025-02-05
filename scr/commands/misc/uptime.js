const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Shows the bot\'s uptime',
    // devOnly: false,
    // testOnly: false,

    callback: async (client, interaction) => {
        const days = Math.floor(client.uptime / 86400000);
        const hours = Math.floor(client.uptime / 3600000) % 24;
        const minutes = Math.floor(client.uptime / 60000) % 60;
        const seconds = Math.floor(client.uptime / 1000) % 60;

        const embed = new EmbedBuilder()
            .setTitle('🕒 Bot Uptime')
            .setColor('#00ff00')
            .setDescription([
                '**Time Since Last Restart:**',
                `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
            ].join('\n'))
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}; 