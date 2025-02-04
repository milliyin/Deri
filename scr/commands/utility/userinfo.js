const { 
    ApplicationCommandOptionType, 
    EmbedBuilder, 
    PermissionsBitField 
} = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Shows information about a user',
    options: [
        {
            name: 'user',
            description: 'The user to get information about',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.editReply({
                content: '❌ User not found in this server.',
                ephemeral: true
            });
        }

        // Calculate join position
        const sortedMembers = [...(await interaction.guild.members.fetch()).values()]
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
        const joinPosition = sortedMembers.findIndex(m => m.id === member.id) + 1;

        // Get user roles excluding @everyone
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString());

        // Get key permissions
        const keyPermissions = Object.entries(PermissionsBitField.Flags)
            .filter(([_, bit]) => member.permissions.has(bit))
            .map(([perm]) => formatPermissionName(perm));

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${targetUser.tag}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor(member.displayHexColor || '#00ff00')
            .addFields(
                {
                    name: '👤 User Information',
                    value: [
                        `**Username:** ${targetUser.username}`,
                        `**Display Name:** ${member.displayName}`,
                        `**ID:** ${targetUser.id}`,
                        `**Account Created:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
                        `**Bot Account:** ${targetUser.bot ? 'Yes' : 'No'}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 Server Information',
                    value: [
                        `**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                        `**Join Position:** ${joinPosition}${getOrdinalSuffix(joinPosition)}`,
                        `**Nickname:** ${member.nickname || 'None'}`,
                        `**Boosting Since:** ${member.premiumSince ? `<t:${Math.floor(member.premiumSince / 1000)}:R>` : 'Not boosting'}`
                    ].join('\n'),
                    inline: false
                }
            );

        // Add roles field if user has roles
        if (roles.length > 0) {
            embed.addFields({
                name: `🎭 Roles [${roles.length}]`,
                value: roles.length > 15 
                    ? roles.slice(0, 15).join(', ') + `, and ${roles.length - 15} more...`
                    : roles.join(', ') || 'None',
                inline: false
            });
        }

        // Add key permissions field
        if (keyPermissions.length > 0) {
            embed.addFields({
                name: '🔑 Key Permissions',
                value: keyPermissions.length > 15
                    ? keyPermissions.slice(0, 15).join(', ') + `, and ${keyPermissions.length - 15} more...`
                    : keyPermissions.join(', '),
                inline: false
            });
        }

        embed.setFooter({ 
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

// Helper functions
function formatPermissionName(str) {
    return str.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
} 