'use strict';
const {Permissions, MessageEmbed} = require('discord.js');
const utils = require('./utils');

module.exports = class Moderation {

    static load(client) {
        client.on('message', async (message) => {
            if (message.content.startsWith("!warn")) {
                const m_array = message.mentions.members.array()
                const warn_role = await utils.get(message.guild.id, "Avertissement");
                for (let i = 0; i < m_array.length; i++) {
                    const element = m_array[i];
                    let m = await element.fetch(true);

                    m.roles.add(warn_role, "Avertissement suite à un comportement non acceptable")
                        .catch(e => {console.log(e)});
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
                                console.log(e);
                            })
                            channel.stopTyping();
                        });
                }
            }
            if (message.partial) {
                await message.fetch();
            }
            if (message.member.roles.cache.has(await utils.get(message.guild.id, "Muet"))) {
                message.delete();
            }
        })
    }
}