// const { ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');

module.exports = {
    deleted: true,
    name: 'Ban',
    description: 'Ban a memeber from the server!',
    // devOnly: Boolean,
    // testOnly: Boolean,
    
    //  Options: [
    //     {
    //         name : 'target-user',
    //         description: 'the user to ban.',
    //         required: true,
    //         type: ApplicationCommandOptionType.Mentionable,
    //     },
    //     {
    //         name : 'reason',
    //         description: 'the reason for banning.',
    //         type: ApplicationCommandOptionType.String,
    //     }  
    // ],
    // PermissionsRequired: [PermissionFlagsBits.Administrator],
    // botPermissions: [PermissionFlagsBits.Administrator],

    callback:( client, interaction ) => {
        interaction.reply(`ban..`);
    },
}