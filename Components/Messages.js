'use strict';
const { Permissions } = require('discord.js');


module.exports = class Message {
    static load(client) {

        client.on('message', async (message) => {
            if (message.channel.type == "dm") { return; }
            if (message.content.startsWith("!msg")) {
                if (message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
                    // A message starting with !msg, in a guild, by a user with the administration permissions is sent
                    let args = message.content.split(" ");
                    let messages = require('../Data/messages.json');

                    // Retrieving the requested text and sending it
                    if (messages[args[1]]) {
                        message.channel.send(messages[args[1]])
                    } else {
                        message.reply("Unknown message").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        })
                    }

                    message.delete();

                }
            }
            if (message.content.startsWith("!say")) {
                if (message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
                    // A message starting with !say, in a guild, by a user with the administration permissions is sent
                    let args = message.content.split(" ");
                    args.shift();
                    // Repeating the message sent (without !say)
                    message.channel.send(args.join(" "));
                    message.delete();
                }
            }
        });
    }
}