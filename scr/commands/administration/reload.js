const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { testServer } = require('../../../config.json');
const { loadCommands } = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');
const path = require('path');

module.exports = {
    deleted: false,
    name: 'reload',
    description: 'Reloads a bot command',
    devOnly: true,
    testOnly: true,
    options: [
        {
            name: 'command-name',
            description: 'The command to reload',
            required: true,
            type: ApplicationCommandOptionType.String,
        }
    ],
    callback: async (client, interaction) => {
        try {
            await interaction.deferReply();
            
            const commandName = interaction.options.getString('command-name').toLowerCase();
            
            if (commandName === 'reload') {
                return interaction.editReply('❌ You cannot reload the reload command!');
            }

            const localCommands = await getLocalCommands();
            
            const commandToReload = localCommands.find(
                (cmd) => cmd.name.toLowerCase() === commandName
            );

            if (!commandToReload) {
                return interaction.editReply(
                    `❌ Could not find command \`${commandName}\`!`
                );
            }

            // Define possible category folders
            const categories = ['administration', 'moderation', 'misc', 'utility', 'ai'];
            let commandPath = null;

            // Search for the command file in each category
            for (const category of categories) {
                const possiblePath = path.join(__dirname, '..', category, `${commandName}.js`);
                try {
                    require.resolve(possiblePath);
                    commandPath = possiblePath;
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!commandPath) {
                return interaction.editReply(
                    `❌ Could not find the file for command \`${commandName}\`!`
                );
            }

            // Delete command from cache
            delete require.cache[require.resolve(commandPath)];
            
            try {
                const newCommand = require(commandPath);
                
                // Update application commands
                const applicationCommands = await client.application.commands;
                const existingCommand = await applicationCommands.cache.find(
                    (cmd) => cmd.name === commandName
                );

                if (existingCommand) {
                    await applicationCommands.edit(existingCommand.id, {
                        name: newCommand.name,
                        description: newCommand.description,
                        options: newCommand.options,
                    });
                }

                await interaction.editReply(
                    `✅ Successfully reloaded \`${commandName}\` command!`
                );
                console.log(`🔄 Reloaded command: ${commandName}`);
            } catch (error) {
                console.error(`Error reloading command ${commandName}:`, error);
                return interaction.editReply(
                    `❌ Error reloading \`${commandName}\`: ${error.message}`
                );
            }
        } catch (error) {
            console.error('Error in reload command:', error);
            return interaction.editReply(
                '❌ There was an error while reloading the command!'
            );
        }
    },
};