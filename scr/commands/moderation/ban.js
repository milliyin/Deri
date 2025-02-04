const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a memeber from the server!',
    // devOnly: Boolean,
    testOnly: true,
    
    options: [
        {
            name : 'target-user',
            description: 'the user to ban.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name : 'reason',
            description: 'the reason for banning.',
            type: ApplicationCommandOptionType.String,
        }  
    ],
    PermissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async(client, interaction ) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || 'No reason provided';
        await interaction.deferReply();
        const targetUser = await interaction.guild.members.fetch(targetUserId);
            
        if(!targetUser){
            await interaction.editReply('User not found');
            return;
        }
        if( targetUser === interaction.guild.ownerId){
            await interaction.editReply('Cant ban the owner');
            return;
        }

        const targetUserRolePostion = targetUser.roles.highest.position;
        const requestUserRolePostion = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if(targetUserRolePostion >= requestUserRolePostion){
            await interaction.editReply('You cant ban this user');
            return;
        }
        if(targetUserRolePostion >= botRolePosition){
            await interaction.editReply('I cant ban this user');
            return;
        }
        //baning the user;
    try{
        await targetUser.ban({reason});
        await interaction.editReply(`Banned ${targetUser.user.tag} for ${reason}`)
    }catch(error){
        console.log(`Errror was there while banning: ${error}`);
    }   
    },
};