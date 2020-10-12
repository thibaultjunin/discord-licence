'use strict';
const {Permissions} = require('discord.js');
const utils = require('../Utils/Utils');

module.exports = class Moderation {

    static load(client) {
        client.on('message', async (message) => {
            if(message.channel.type == "dm"){return;}
            if (message.content.startsWith('!warn') && message.member.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
                const m_array = message.mentions.members.array();
                const warn_role = await utils.get(message.guild.id, "avertissement");

                for (let i = 0; i < m_array.length; i++) {
                    const element = m_array[i];

                    let m = await element.fetch(true);

                    console.log(warn_role);

                    m.roles.add(warn_role, "Avertissement suite à un comportement non acceptable")
                        .catch(e => {console.error(e)});
                    m.createDM()
                        .then(channel => {
                            channel.startTyping();
                            channel.send("", {
                                embed: {
                                    title: "Avertissement",
                                    description: "Bonjour, ce message est un avertissement suite à un comportement non acceptable au vu du Discord Licence Informatique. Je te suggère d'aller regarder les <#743452204207439913>. Si ce comportement venait à réapparaître nous prendrons les mesures nécessaires comme des sanctions pouvant aller jusqu'au bannissement du serveur.",
                                    footer: {
                                        text: client.user.username,
                                        icon: client.user.avatarURL()
                                    }
                                }
                            })
                            .catch(e => {
                                console.error(e);
                            })
                            channel.stopTyping();
                        }).catch(err => {
                            console.error(err);
                        });
                }
            }
            if (message.member.roles.cache.has(await utils.get(message.guild.id, "Muet"))) {
                message.delete();
            }
        })
    }
}