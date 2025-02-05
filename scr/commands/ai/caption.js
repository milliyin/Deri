const { 
    ApplicationCommandOptionType, 
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'caption',
    description: 'Generate a caption for an image using AI',
    devOnly: true,
    testOnly: true,
    options: [
        {
            name: 'image',
            description: 'The image to generate a caption for',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
        },
        {
            name: 'style',
            description: 'The style of caption to generate',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Detailed',
                    value: 'detailed'
                },
                {
                    name: 'Concise',
                    value: 'concise'
                },
                {
                    name: 'Creative',
                    value: 'creative'
                }
            ]
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        try {
            const image = interaction.options.getAttachment('image');
            const style = interaction.options.getString('style') || 'detailed';

            // Validate if the attachment is an image
            if (!image.contentType?.startsWith('image/')) {
                return interaction.editReply({
                    content: '❌ Please provide a valid image file!',
                    ephemeral: true
                });
            }

            // TODO: Implement AI image captioning
            // This is where you'd integrate with your AI service
            // For now, we'll return a placeholder response
            const caption = "A placeholder caption for the image. AI integration coming soon!";

            const embed = new EmbedBuilder()
                .setTitle('Image Caption')
                .setColor('#00ff00')
                .setDescription(`**Generated Caption:**\n${caption}`)
                .setImage(image.url)
                .setFooter({ 
                    text: `Style: ${style.charAt(0).toUpperCase() + style.slice(1)} • Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in caption command:', error);
            await interaction.editReply({
                content: '❌ There was an error processing your request.',
                ephemeral: true
            });
        }
    },
}; 