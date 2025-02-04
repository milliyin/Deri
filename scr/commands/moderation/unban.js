const { 
    ApplicationCommandOptionType, 
    PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unbans a user from the server',
    // devOnly: false,
    // testOnly: false,
    options: [
        {
            name: 'user-id',
            description: 'The ID of the user to unban',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for unbanning the user',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    callback: async (client, interaction) => {
        const userId = interaction.options.getString('user-id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Defer the reply since this might take a moment
            await interaction.deferReply();

            // Check if the user ID is valid
            if (!/^\d+$/.test(userId)) {
                return interaction.editReply({
                    content: '❌ Please provide a valid user ID',
                    ephemeral: true
                });
            }

            // Try to unban the user
            try {
                await interaction.guild.members.unban(userId, reason);
                
                return interaction.editReply({
                    content: `✅ Successfully unbanned user with ID: ${userId}\nReason: ${reason}`
                });
            } catch (error) {
                if (error.code === 10026) { // Unknown Ban error code
                    return interaction.editReply({
                        content: '❌ This user is not banned from this server.',
                        ephemeral: true
                    });
                }
                
                throw error; // Re-throw other errors to be caught by outer try-catch
            }

        } catch (error) {
            console.error(`Error in unban command:`, error);
            return interaction.editReply({
                content: '❌ There was an error while trying to unban the user. Make sure the ID is valid and I have the necessary permissions.',
                ephemeral: true
            });
        }
    }
}; 