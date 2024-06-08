const { Guild } = require("discord.js");

module.exports = async (client, guildId) => {
    let applicationCommands;
    if(guildId){
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = await guild.commands;
    }else{
        applicationCommands = await client.guild.commands;
    }
    await applicationCommands.fetch()
    return applicationCommands;
}