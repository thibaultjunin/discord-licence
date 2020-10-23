const Utils = require('../Utils/Utils');
var connection = Utils.getConnection();

module.exports = class Logging {

    static load(client) {
        client.on('guildBanAdd', (guild, user) => {
            // When a user is banned
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [guild.id, user.id, "guildBanAdd"]);
        });
        client.on('guildBanRemove', (guild, user) => {
            // when a user is unbanned
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [guild.id, user.id, "guildBanRemove"]);
        });
        client.on('guildMemberAdd', (member) => {
            // when a user joins the discord server
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [member.guild.id, member.user.id, "guildMemberAdd"]);
        });
        client.on('guildMemberRemove', (member) => {
            // when a user leaves the discord server
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [member.guild.id, member.user.id, "guildMemberRemove"]);
        });
        client.on('guildMemberUpdate', (oldMember, newMember) => {
            // when a user is updated (example: nickname change)
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                newMember.guild.id,
                newMember.user.id,
                "guildMemberUpdate",
                Buffer.from(JSON.stringify({
                    from: oldMember,
                    to: newMember
                }), 'utf-8').toString('base64')
            ]);
        });
        client.on('message', (message) => {
            if (message.channel.type == "dm") { return; }
            // When a message is sent
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                message.guild.id,
                message.author.id,
                "message",
                Buffer.from(JSON.stringify(message), 'utf-8').toString('base64'),
            ]);
        });
        client.on('messageDelete', (message) => {
            if (message.channel.type == "dm") { return; }
            // When a message is deleted
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                message.guild.id,
                message.author.id,
                "messageDelete",
                message.id,
            ]);
        });
        client.on('messageUpdate', (oldMember, newMember) => {
            if (message.channel.type == "dm") { return; }
            // when a message is updated
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                newMember.guild.id,
                "Unknown",
                "messageUpdate",
                Buffer.from(JSON.stringify(newMember), 'utf-8').toString('base64')
            ]);
        });
    }

}