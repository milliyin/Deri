const { 
    EmbedBuilder,
    ChannelType 
} = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Shows information about the server',
    // devOnly: false,
    // testOnly: false,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const { guild } = interaction;
        const {
            members,
            channels,
            emojis,
            roles,
            stickers
        } = guild;

        // Get member stats
        const memberStats = {
            total: members.cache.size,
            users: members.cache.filter(member => !member.user.bot).size,
            bots: members.cache.filter(member => member.user.bot).size,
            online: members.cache.filter(member => member.presence?.status === 'online').size,
            boost: guild.premiumSubscriptionCount
        };

        // Get channel stats
        const channelStats = {
            total: channels.cache.size,
            text: channels.cache.filter(channel => channel.type === ChannelType.GuildText).size,
            voice: channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size,
            threads: channels.cache.filter(channel => channel.type === ChannelType.GuildPublicThread || channel.type === ChannelType.GuildPrivateThread).size,
            categories: channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size,
            stages: channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice).size,
            forums: channels.cache.filter(channel => channel.type === ChannelType.GuildForum).size,
        };

        // Create embed
        const embed = new EmbedBuilder()
            .setColor(guild.members.me.displayHexColor || '#00ff00')
            .setTitle(`${guild.name}'s Information`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '📑 General Information',
                    value: [
                        `**Name:** ${guild.name}`,
                        `**ID:** ${guild.id}`,
                        `**Owner:** <@${guild.ownerId}>`,
                        `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                        `**Boost Level:** ${guild.premiumTier || '0'}`,
                        `**Boost Count:** ${memberStats.boost}`,
                        `**Verification Level:** ${formatVerificationLevel(guild.verificationLevel)}`,
                        `**Partnered:** ${guild.partnered ? 'Yes' : 'No'}`,
                        `**Verified:** ${guild.verified ? 'Yes' : 'No'}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '👥 Member Stats',
                    value: [
                        `**Total Members:** ${memberStats.total}`,
                        `**Users:** ${memberStats.users}`,
                        `**Bots:** ${memberStats.bots}`,
                        `**Online:** ${memberStats.online}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📊 Channel Stats',
                    value: [
                        `**Total:** ${channelStats.total}`,
                        `**Text:** ${channelStats.text}`,
                        `**Voice:** ${channelStats.voice}`,
                        `**Threads:** ${channelStats.threads}`,
                        `**Categories:** ${channelStats.categories}`,
                        `**Stages:** ${channelStats.stages}`,
                        `**Forums:** ${channelStats.forums}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎨 Additional Stats',
                    value: [
                        `**Roles:** ${roles.cache.size}`,
                        `**Emojis:** ${emojis.cache.size}`,
                        `**Stickers:** ${stickers.cache.size}`,
                        `**Features:** ${formatFeatures(guild.features)}`
                    ].join('\n'),
                    inline: false
                }
            );

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ dynamic: true, size: 4096 }));
        }

        embed.setFooter({ 
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

// Helper Functions
function formatVerificationLevel(level) {
    const levels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
    };
    return levels[level] || 'Unknown';
}

function formatFeatures(features) {
    if (!features.length) return 'None';
    
    return features
        .map(feature => 
            feature
                .toLowerCase()
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        )
        .slice(0, 5)
        .join(', ') + (features.length > 5 ? `, and ${features.length - 5} more...` : '');
} 