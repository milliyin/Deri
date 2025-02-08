const { 
    ApplicationCommandOptionType, 
    PermissionFlagsBits,
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'unmute',
    description: 'Unmutes a muted user',
    type: 1,  // Add this line for base type
    options: [
        {
            name: 'user',
            description: 'The user to unmute',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for unmuting',
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
            const reason = interaction.options.getString('reason') || 'No reason provided';

            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // Check if user is timed out
            if (!targetMember.isCommunicationDisabled()) {
                return interaction.editReply({
                    content: '❌ This user is not muted!',
                    ephemeral: true
                });
            }

            // Create unmute embed
            const unmuteEmbed = new EmbedBuilder()
                .setTitle('🔊 User Unmuted')
                .setColor('#00ff00')
                .addFields(
                    {
                        name: 'Unmuted User',
                        value: `${targetUser.tag} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Unmuted By',
                        value: interaction.user.tag,
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
                    content: `You have been unmuted in **${interaction.guild.name}**\nReason: ${reason}`
                });
            } catch (error) {
                console.log(`Could not DM user ${targetUser.tag}`);
                unmuteEmbed.addFields({
                    name: 'Note',
                    value: '⚠️ Could not send DM to user',
                    inline: false
                });
            }

            // Unmute the user
            await targetMember.timeout(null, reason);

            await interaction.editReply({
                embeds: [unmuteEmbed]
            });

        } catch (error) {
            console.error('Error in unmute command:', error);
            return interaction.editReply({
                content: '❌ There was an error while trying to unmute the user.',
                ephemeral: true
            });
        }
    },
}; 