'use strict';
const { Permissions } = require('discord.js');
const Utils = require('../Utils/Utils');
const fs = require("fs");
var env = require('node-env-file');
const path = require('path');
env(path.resolve(__dirname, '../.env'));

module.exports = class Channels {

    static load(client) {

        // When a message is received
        client.on('message', async (message) => {
            // if the message is sent in dms, ignore
            if (message.channel.type == "dm") { return; }

            // if the message doesn't start with `!`, ignore
            if (!message.content.startsWith("!")) {
                return;
            }

            // if the user has the `manage role` permission
            if (message.member.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {

                // if the message starts with `!cours`
                if (message.content.startsWith("!cours")) {

                    const TEACHER = await Utils.get(message.guild.id, "teacher_role");
                    if (TEACHER == undefined) {
                        // Bot not configured
                        message.reply(":x: Teacher role is undefined").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        });
                    }

                    let args = message.content.split(" ");
                    args.shift();

                    if (args.length < 1) {
                        // The title is missing
                        message.reply("Utilisation: !cours Titre").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        })
                        message.delete();
                        return;
                    }

                    let title = args.join(" ");

                    let guild = message.guild;

                    // Create a new role
                    guild.roles.create({
                        data: {
                            name: title,
                            mentionable: false,
                            permissions: [
                                Permissions.FLAGS.CREATE_INSTANT_INVITE,
                                Permissions.FLAGS.VIEW_CHANNEL,
                                Permissions.FLAGS.SEND_MESSAGES,
                                Permissions.FLAGS.EMBED_LINKS,
                                Permissions.FLAGS.ATTACH_FILES,
                                Permissions.FLAGS.READ_MESSAGE_HISTORY,
                                Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
                                Permissions.FLAGS.ADD_REACTIONS,
                                Permissions.FLAGS.CONNECT,
                                Permissions.FLAGS.SPEAK,
                                Permissions.FLAGS.STREAM,
                                Permissions.FLAGS.USE_VAD
                            ]
                        },
                        reason: 'Role pour les étudiants du cours ' + title
                    }).then(role => {
                        // Creating a new category
                        guild.channels.create(title, {
                            type: 'category',
                            reason: 'Ajout d\'un nouveau cours (' + title + ")",
                            permissionOverwrites: [
                                {
                                    id: guild.roles.everyone.id,
                                    deny: [Permissions.FLAGS.VIEW_CHANNEL]
                                },
                                {
                                    id: role.id,
                                    allow: [Permissions.FLAGS.VIEW_CHANNEL]
                                },
                                {
                                    id: TEACHER,
                                    allow: [Permissions.FLAGS.VIEW_CHANNEL]
                                }
                            ]
                        }).then(channel => {
                            // Create a announcements channel
                            guild.channels.create("annonces", {
                                type: 'news',
                                parent: channel.id,
                                reason: 'Salon des annonces pour ' + title,
                                permissionOverwrites: [
                                    {
                                        id: guild.roles.everyone.id,
                                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                                    },
                                    {
                                        id: role.id,
                                        allow: [Permissions.FLAGS.VIEW_CHANNEL],
                                        deny: [Permissions.FLAGS.SEND_MESSAGES]
                                    },
                                    {
                                        id: TEACHER,
                                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.VIEW_CHANNEL]
                                    }
                                ]
                            })

                            // Create a general channel
                            guild.channels.create("general", {
                                type: 'text',
                                parent: channel.id,
                                reason: 'Salon général pour ' + title
                            })

                            // Create a general voice channel
                            guild.channels.create("general", {
                                type: 'voice',
                                parent: channel.id,
                                reason: 'Salon général pour ' + title
                            })

                            message.reply(":ok_hand:").then(msg => {
                                msg.delete({
                                    timeout: 3000
                                })
                            })

                        });
                    })

                }
            }
        })
    }

}