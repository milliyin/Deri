const { 
    ApplicationCommandOptionType, 
    PermissionFlagsBits,
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Mutes a user for a specified time',
    type: 1,  // Add this line for base type
    options: [
        {
            name: 'user',
            description: 'The user to mute',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'duration',
            description: 'Mute duration (e.g., 1m, 1h, 1d)',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for muting',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.ModerateMembers],
    botPermissions: [PermissionFlagsBits.ModerateMembers],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser('user');
            const duration = interaction.options.getString('duration');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            // Convert duration string to milliseconds
            const durationInMs = parseDuration(duration);
            if (!durationInMs) {
                return interaction.editReply({
                    content: '❌ Invalid duration format! Use format: 1m, 1h, 1d',
                    ephemeral: true
                });
            }

            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // Check if user is mutable
            if (!targetMember.moderatable) {
                return interaction.editReply({
                    content: '❌ I cannot mute this user! They may have higher permissions than me.',
                    ephemeral: true
                });
            }

            // Check role hierarchy
            if (
                interaction.member.roles.highest.position <= 
                targetMember.roles.highest.position
            ) {
                return interaction.editReply({
                    content: '❌ You cannot mute this user! They have higher or equal roles to you.',
                    ephemeral: true
                });
            }

            // Create mute embed
            const muteEmbed = new EmbedBuilder()
                .setTitle('🔇 User Muted')
                .setColor('#ff0000')
                .addFields(
                    {
                        name: 'Muted User',
                        value: `${targetUser.tag} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Muted By',
                        value: interaction.user.tag,
                        inline: true
                    },
                    {
                        name: 'Duration',
                        value: duration,
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                )
                .setTimestamp();

            // Try to DM the user
            try {
                await targetUser.send({
                    content: `You have been muted in **${interaction.guild.name}**\nDuration: ${duration}\nReason: ${reason}`
                });
            } catch (error) {
                console.log(`Could not DM user ${targetUser.tag}`);
                muteEmbed.addFields({
                    name: 'Note',
                    value: '⚠️ Could not send DM to user',
                    inline: false
                });
            }

            // Mute the user
            await targetMember.timeout(durationInMs, reason);

            await interaction.editReply({
                embeds: [muteEmbed]
            });

        } catch (error) {
            console.error('Error in mute command:', error);
            return interaction.editReply({
                content: '❌ There was an error while trying to mute the user.',
                ephemeral: true
            });
        }
    },
};

// Helper function to parse duration
function parseDuration(duration) {
    const regex = /^(\d+)([mhd])$/;
    const match = duration.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
        'm': 60 * 1000, // minutes to milliseconds
        'h': 60 * 60 * 1000, // hours to milliseconds
        'd': 24 * 60 * 60 * 1000 // days to milliseconds
    };
    
    return value * multipliers[unit];
} 