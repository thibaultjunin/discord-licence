var mysql      = require('mysql');
var env = require('node-env-file');
env('../.env');
var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

module.exports = class Logging{

    static load(client){
        client.on('guildBanAdd', (guild, user) => {
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [guild.id, user.id, "guildBanAdd"]);
        });
        client.on('guildBanRemove', (guild, user) => {
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [guild.id, user.id, "guildBanRemove"]);
        });
        client.on('guildMemberAdd', (member) => {
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [member.guild.id, member.user.id, "guildMemberAdd"]);
        });
        client.on('guildMemberRemove', (member) => {
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?", [member.guild.id, member.user.id, "guildMemberRemove"]);
        });
        client.on('guildMemberUpdate', (oldMember, newMember) => {
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
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                message.guild.id,
                message.author.id, 
                "message",
                Buffer.from(JSON.stringify(message), 'utf-8').toString('base64'),
            ]);
        });
        client.on('messageDelete', (message) => {
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                message.guild.id,
                message.author.id, 
                "messageDelete",
                message.id,
            ]);
        });
        client.on('messageUpdate', (oldMember, newMember) => {
            console.log(newMember);
            connection.query("INSERT INTO logs SET server = ?, user = ?, action = ?, content = ?", [
                newMember.guild.id,
                "Unknown", 
                "messageUpdate",
                Buffer.from(JSON.stringify(newMember), 'utf-8').toString('base64')
            ]);
        });
    }

}