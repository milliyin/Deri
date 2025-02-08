const { 
    ApplicationCommandOptionType, 
    EmbedBuilder 
} = require('discord.js');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    name: 'help',
    description: 'Shows all commands or info about a specific command',
    options: [
        {
            name: 'command',
            description: 'The specific command to get info about',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        const localCommands = await getLocalCommands();
        const commandName = interaction.options.getString('command');

        if (commandName) {
            // Handle specific command help
            const command = localCommands.find(
                (cmd) => cmd.name.toLowerCase() === commandName.toLowerCase()
            );

            if (!command) {
                return interaction.reply({
                    content: `❌ Could not find command \`${commandName}\``,
                    ephemeral: true,
                });
            }

            const embedCommand = new EmbedBuilder()
                .setTitle(`Command: ${command.name}`)
                .setDescription(command.description)
                .setColor('#00ff00')
                .addFields(
                    { 
                        name: 'Usage', 
                        value: `\`/${command.name}${command.options ? 
                            ' ' + command.options.map(opt => 
                                opt.required ? `<${opt.name}>` : `[${opt.name}]`
                            ).join(' ') 
                            : ''}\`` 
                    }
                );

            if (command.options) {
                const optionsDescription = command.options.map(opt => 
                    `**${opt.name}**: ${opt.description} (${opt.required ? 'Required' : 'Optional'})`
                ).join('\n');
                
                embedCommand.addFields({ 
                    name: 'Options', 
                    value: optionsDescription 
                });
            }

            return interaction.reply({ embeds: [embedCommand] });
        }

        // Handle general help (no specific command specified)
        const categories = {
            administration: [],
            moderation: [],
            utility: [],
            misc: [],
            ai: [],
        };

        // Sort commands into categories
        localCommands.forEach((cmd) => {
            const category = cmd.category || getCommandCategory(cmd.name);
            if (categories[category]) {
                categories[category].push(cmd);
            }
        });

        const embed = new EmbedBuilder()
            .setTitle('📚 Bot Commands')
            .setDescription('Here are all available commands:')
            .setColor('#0099ff')
            .setTimestamp();

        // Add fields for each category
        for (const [category, commands] of Object.entries(categories)) {
            if (commands.length > 0) {
                embed.addFields({
                    name: `${getCategoryEmoji(category)} ${capitalizeFirstLetter(category)}`,
                    value: commands.map(cmd => `\`${cmd.name}\`: ${cmd.description}`).join('\n'),
                });
            }
        }

        embed.addFields({
            name: 'ℹ️ Command Details',
            value: 'Use `/help <command>` to get detailed information about a specific command.',
        });

        return interaction.reply({ embeds: [embed] });
    },
};

// Helper functions
function getCommandCategory(commandName) {
    const categoryMappings = {
        ban: 'moderation',
        kick: 'moderation',
        unban: 'moderation',
        reload: 'administration',
        help: 'misc',
        ping: 'misc',
        userinfo: 'utility',
        serverinfo: 'utility',
        avatar: 'utility',
        roleinfo: 'utility',
        caption: 'ai',
        uptime: 'misc',
        botstatus: 'misc',
        clearmsg: 'moderation',
    };

    return categoryMappings[commandName] || 'misc';
}

function getCategoryEmoji(category) {
    const emojiMappings = {
        administration: '⚙️',
        moderation: '🛡️',
        misc: '🎮',
        utility: '🛠️',
        ai: '🤖',
    };

    return emojiMappings[category] || '📌';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 