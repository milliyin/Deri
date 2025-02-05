const { 
    ApplicationCommandOptionType, 
    EmbedBuilder 
} = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = process.env.CAPTION_API_URL || 'http://localhost:8000';

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
        }
    ],

    callback: async (client, interaction) => {
        await interaction.deferReply();

        try {
            const image = interaction.options.getAttachment('image');

            // Validate if the attachment is an image
            if (!image.contentType?.startsWith('image/')) {
                return interaction.editReply({
                    content: '❌ Please provide a valid image file!',
                    ephemeral: true
                });
            }

            // Create loading message
            await interaction.editReply({
                content: '🤖 Analyzing image and generating caption...',
            });

            try {
                // Download the image
                const imageResponse = await axios.get(image.url, {
                    responseType: 'arraybuffer',
                    timeout: 5000 // 5 seconds timeout for download
                });

                // Prepare form data
                const formData = new FormData();
                formData.append('file', Buffer.from(imageResponse.data), {
                    filename: image.name,
                    contentType: image.contentType,
                });

                // Send request to the API
                const response = await axios.post(`${API_URL}/generate-caption`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                    timeout: 30000 // 30 seconds timeout for caption generation
                });

                if (response.data.status === 'success' && response.data.caption) {
                    const embed = new EmbedBuilder()
                        .setTitle('📸 Image Caption')
                        .setColor('#00ff00')
                        .setDescription([
                            '**Generated Caption:**',
                            response.data.caption
                        ].join('\n'))
                        .setImage(image.url)
                        .setFooter({ 
                            text: `Requested by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTimestamp();

                    await interaction.editReply({ 
                        content: null,
                        embeds: [embed] 
                    });
                } else {
                    throw new Error('Invalid response from caption service');
                }

            } catch (error) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Caption service is not available. Please try again later.');
                } else if (error.code === 'ETIMEDOUT') {
                    throw new Error('Request timed out. Please try again with a smaller image.');
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Error in caption command:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
            
            await interaction.editReply({
                content: `❌ ${errorMessage}`,
                ephemeral: true
            });
        }
    },
}; 