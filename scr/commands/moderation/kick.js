const { 
    ApplicationCommandOptionType, 
    PermissionFlagsBits,
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kicks a user from the server',
    type: 1,
    // devOnly: false,
    // testOnly: false,
    options: [
        {
            name: 'user',
            description: 'The user to kick',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for kicking the user',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // Check if the target user is kickable
            if (!targetMember.kickable) {
                return interaction.editReply({
                    content: '❌ I cannot kick this user! They may have higher permissions than me.',
                    ephemeral: true
                });
            }

            // Check if the target user has a higher role than the command user
            if (
                interaction.member.roles.highest.position <= 
                targetMember.roles.highest.position
            ) {
                return interaction.editReply({
                    content: '❌ You cannot kick this user! They have higher or equal roles to you.',
                    ephemeral: true
                });
            }

            // Create kick embed
            const kickEmbed = new EmbedBuilder()
                .setTitle('👢 User Kicked')
                .setColor('#ff0000')
                .addFields(
                    {
                        name: 'Kicked User',
                        value: `${targetUser.tag} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Kicked By',
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
                    content: `You have been kicked from **${interaction.guild.name}**\nReason: ${reason}`
                });
            } catch (error) {
                console.log(`Could not DM user ${targetUser.tag}`);
                kickEmbed.addFields({
                    name: 'Note',
                    value: '⚠️ Could not send DM to user',
                    inline: false
                });
            }

            // Kick the user
            await targetMember.kick(reason);

            // Send confirmation
            await interaction.editReply({
                embeds: [kickEmbed]
            });

            // Log the kick if there's a log channel
            // You can add logging functionality here

        } catch (error) {
            console.error('Error in kick command:', error);
            return interaction.editReply({
                content: '❌ There was an error while trying to kick the user.',
                ephemeral: true
            });
        }
    },
}; 