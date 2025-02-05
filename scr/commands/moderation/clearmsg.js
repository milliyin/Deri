const { 
    ApplicationCommandOptionType, 
    PermissionFlagsBits,
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'clearmsg',
    description: 'Clear a specified number of messages from the channel',
    // devOnly: false,
    // testOnly: false,
    options: [
        {
            name: 'amount',
            description: 'Number of messages to delete (1-100)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxValue: 100
        },
        {
            name: 'reason',
            description: 'Reason for clearing messages',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.ManageMessages],
    botPermissions: [PermissionFlagsBits.ManageMessages],

    callback: async (client, interaction) => {
        try {
            const amount = interaction.options.getInteger('amount');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            await interaction.deferReply({ ephemeral: true });

            // Fetch messages
            const messages = await interaction.channel.messages.fetch({
                limit: amount,
            });

            // Filter out messages older than 14 days (Discord limitation)
            const filteredMessages = messages.filter(msg => {
                return Date.now() - msg.createdTimestamp < 1209600000; // 14 days in milliseconds
            });

            if (filteredMessages.size === 0) {
                return interaction.editReply({
                    content: '❌ No messages found that can be deleted (messages must be newer than 14 days).',
                    ephemeral: true
                });
            }

            // Delete messages
            const deleted = await interaction.channel.bulkDelete(filteredMessages, true)
                .catch(error => {
                    console.error('Error deleting messages:', error);
                    throw new Error('Failed to delete messages.');
                });

            // Create success embed
            const embed = new EmbedBuilder()
                .setTitle('🧹 Messages Cleared')
                .setColor('#00ff00')
                .addFields(
                    {
                        name: 'Messages Deleted',
                        value: `${deleted.size} messages`,
                        inline: true
                    },
                    {
                        name: 'Channel',
                        value: `${interaction.channel}`,
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: `Action by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // If some messages couldn't be deleted due to age
            if (deleted.size < amount) {
                embed.addFields({
                    name: 'Note',
                    value: '⚠️ Some messages could not be deleted because they were older than 14 days.',
                    inline: false
                });
            }

            await interaction.editReply({ 
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in clearmsg command:', error);
            return interaction.editReply({
                content: '❌ There was an error while trying to clear messages. Make sure the messages are not older than 14 days and I have the necessary permissions.',
                ephemeral: true
            });
        }
    },
}; 