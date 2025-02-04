const { 
    ApplicationCommandOptionType, 
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

module.exports = {
    name: 'roleinfo',
    description: 'Shows information about a role',
    options: [
        {
            name: 'role',
            description: 'The role to get information about',
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        const role = interaction.options.getRole('role');

        // Get role permissions
        const permissions = role.permissions.toArray();
        const formattedPermissions = permissions
            .map(perm => `\`${formatPermission(perm)}\``)
            .join(', ');

        // Get role members
        const memberCount = role.members.size;

        // Create timestamp from role creation date
        const createdTime = Math.floor(role.createdTimestamp / 1000);

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle('Role Information')
            .setColor(role.color || '#000000')
            .addFields(
                {
                    name: '📝 Basic Information',
                    value: [
                        `**Name:** ${role.name}`,
                        `**ID:** ${role.id}`,
                        `**Color:** ${role.hexColor.toUpperCase()}`,
                        `**Position:** ${role.position}`,
                        `**Created:** <t:${createdTime}:R>`,
                        `**Members:** ${memberCount}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚙️ Role Settings',
                    value: [
                        `**Hoisted:** ${role.hoist ? 'Yes' : 'No'}`,
                        `**Mentionable:** ${role.mentionable ? 'Yes' : 'No'}`,
                        `**Managed by Integration:** ${role.managed ? 'Yes' : 'No'}`,
                        `**Tags:** ${getRoleTags(role)}`
                    ].join('\n'),
                    inline: false
                }
            );

        // Add permissions field if the role has any
        if (permissions.length > 0) {
            embed.addFields({
                name: '🔑 Key Permissions',
                value: formattedPermissions.length > 1024 
                    ? `${formattedPermissions.slice(0, 1020)}...`
                    : formattedPermissions,
                inline: false
            });
        }

        embed.setFooter({ 
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

// Helper Functions
function formatPermission(str) {
    return str.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getRoleTags(role) {
    const tags = [];
    
    if (role.tags) {
        if (role.tags.botId) tags.push('Bot Role');
        if (role.tags.integrationId) tags.push('Integration Role');
        if (role.tags.premiumSubscriberRole) tags.push('Server Booster Role');
        if (role.tags.subscriptionListingId) tags.push('Subscription Role');
        if (role.tags.availableForPurchase) tags.push('Purchasable Role');
        if (role.tags.guildConnections) tags.push('Connected Role');
    }

    return tags.length ? tags.join(', ') : 'None';
} 