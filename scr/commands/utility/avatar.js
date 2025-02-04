const { 
    ApplicationCommandOptionType, 
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Shows user\'s avatar/profile picture',
    options: [
        {
            name: 'user',
            description: 'The user whose avatar you want to see',
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setColor('#00ff00')
            .setImage(user.displayAvatarURL({ 
                size: 4096,
                dynamic: true
            }))
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // If the user has a server-specific avatar, add it to the embed
        const member = await interaction.guild.members.fetch(user.id);
        if (member.avatar) {
            embed.addFields({
                name: 'Server Specific Avatar',
                value: `[Click here for server avatar](${member.displayAvatarURL({ dynamic: true, size: 4096 })})`
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
}; 