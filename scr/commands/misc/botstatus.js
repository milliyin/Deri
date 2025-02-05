const { 
    EmbedBuilder,
    version: discordJSVersion 
} = require('discord.js');
const os = require('os');

module.exports = {
    name: 'botstatus',
    description: 'Shows detailed information about the bot',
    // devOnly: false,
    // testOnly: false,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        // Calculate memory usage
        const used = process.memoryUsage();
        const memory = {
            total: (os.totalmem() / 1024 / 1024).toFixed(2),
            used: (used.heapUsed / 1024 / 1024).toFixed(2)
        };

        // Get system information
        const systemInfo = {
            processor: os.cpus()[0].model,
            platform: `${os.type()} ${os.release()}`,
            uptime: Math.floor(os.uptime() / 3600) // in hours
        };

        // Get bot statistics
        const botStats = {
            servers: client.guilds.cache.size,
            users: client.users.cache.size,
            channels: client.channels.cache.size,
            commands: client.application.commands.cache.size
        };

        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot Status')
            .setColor('#00ff00')
            .addFields(
                {
                    name: '📊 Bot Statistics',
                    value: [
                        `**Servers:** ${botStats.servers}`,
                        `**Users:** ${botStats.users}`,
                        `**Channels:** ${botStats.channels}`,
                        `**Commands:** ${botStats.commands}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💻 System Information',
                    value: [
                        `**Memory:** ${memory.used}MB / ${memory.total}MB`,
                        `**Platform:** ${systemInfo.platform}`,
                        `**Processor:** ${systemInfo.processor.split(' ')[0]}`,
                        `**System Uptime:** ${systemInfo.uptime} hours`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔧 Version Information',
                    value: [
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${discordJSVersion}`,
                        `**Bot Version:** 1.0.0`
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
}; 