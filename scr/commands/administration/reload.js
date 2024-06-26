const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');
const { testServer } = require('../../../config.json');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    deleted: false,
    name: 'reload',
    description: 'reloading the bot commands',
    devOnly: true,
    testOnly: true,
    options: [
        {
            name : 'command-name',
            description: 'the command to reload',
            required: true,
            type: ApplicationCommandOptionType.String,
        }  
    ],
    callback: async ( client, interaction ) => {
        try{

        const commandName = interaction.options.get('command-name').value.toLowerCase();
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client,testServer);
        if(commandName == 'reload'){
            return interaction.reply(`You can't this command!`);
        }
        let existingCommand;
        for(const localCommand of localCommands){
            const { name, description, options } = localCommand;
            if(name === commandName){
                existingCommand = await applicationCommands.cache.find((cmd) => cmd.name === name);
                await applicationCommands.edit(existingCommand.id, {
                    description,
                    options,
                  });
                if (existingCommand) {
                    await applicationCommands.edit(existingCommand.id, {
                      description,
                      options,
                    });
                    console.log(`🔁 Reloaded command "${name}".`);
                    return interaction.reply(`Reloaded Succefull!`);
                  }
                } else {
                  if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(
                      `⏩ While reloading, command "${name}" as it's set to delete.`
                    );
                    return interaction.reply(`While Reloading, command "${name}" as it's set to delete.`);
                  }
            }
        }
        if (!existingCommand) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

        
    }catch(error){
        console.log(`Error Reloading: ${error}`);
    }
    },
}