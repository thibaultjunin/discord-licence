'use strict';
const {Permissions, MessageEmbed} = require('discord.js');
const utils = require("./utils");


module.exports = class RolePicker{
    static load(client){

        client.on('message', async (message) => {
            if(message.content.startsWith("!msg")){
                if(message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)){
                    let args = message.content.split(" ");
                    let messages = require('./messages.json');

                    if(messages[args[1]]){
                        message.channel.send(messages[args[1]])
                    }else{
                        message.reply("Unknown message").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        })
                    }

                    message.delete();

                }
            }
            if(message.content.startsWith("!say")){
                if(message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)){
                    let args = message.content.split(" ");
                    args.shift();
                    message.channel.send(args.join(" "));
                    message.delete();
                }
            }
        });
    }
}