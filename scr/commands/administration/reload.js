module.exports = {
    //deleted: true,
    name: 'reload',
    description: 'reloading the bot commands',
    devOnly: true,
    testOnly: true,
    // Options: Object[],
    // deleted: Boolean,
    callback:( client, interaction ) => {
        interaction.reply(`test`);
    },
}