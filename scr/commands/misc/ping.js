module.exports = {
    name: 'ping',
    description: 'Pong!',
    // devOnly: Boolean,
    testOnly: true,
    // Options: Object[],
    // deleted: Boolean,
    callback:( client, interaction ) => {
        interaction.reply(`PONG! ${client.ws.ping}ms`);
    },
}