'use strict';
const {Permissions, MessageEmbed} = require('discord.js');
var mysql      = require('mysql');
const { v4: uuidv4 } = require('uuid');
var env = require('node-env-file');
env('../.env');
var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

module.exports = class RolePicker{

    static load(client){
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.partial) {
                await reaction.fetch();
            }
            if(user.id == client.user.id){ return; }
            // // Ajout du role
            connection.query('SELECT uuid FROM pickers WHERE channel_id = ?', [reaction.message.channel.id], (err, res, fie) => {
                if(err != null || res.length == 0){
                    console.log(err);
                    return;
                }

                let emote = null;
                if(reaction.emoji.id == null){
                    // global emote
                    emote = reaction.emoji.name
                }else{
                    // custom emote
                    emote = reaction.emoji.id
                }

                let channel = client.channels.cache.get(reaction.message.channel.id);
                let guild = channel.guild;

                connection.query('SELECT * FROM picker_roles WHERE picker = ?', [res[0].uuid], (error, results, fields) => {
                    if(error != null || results.length == 0){
                        console.log(error);
                        return;
                    }

                    for (let i = 0; i < results.length; i++) {
                        const el = results[i];
                        if(Buffer.from(el.emote, 'base64').toString('utf-8') == emote){
                            let roleID  = el.role;
                            guild.members.fetch(user.id).then(member => {
                                member.roles.add(roleID, "L'utilisateur a demandé le role " + Buffer.from(el.title, 'base64').toString('utf-8'))
                                    .catch(e => {
                                        console.log(e)
                                    });
                            })
                            
                        }
                    }

                })

            })
        })
        client.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.partial) {
                await reaction.fetch();
            }
            if(user.id == client.user.id){ return; }
            // Suppression du role
            connection.query('SELECT uuid FROM pickers WHERE channel_id = ?', [reaction.message.channel.id], (err, res, fie) => {
                if(err != null || res.length == 0){
                    console.log(error);
                    return;
                }

                let emote = null;
                if(reaction.emoji.id == null){
                    // global emote
                    emote = reaction.emoji.name
                }else{
                    // custom emote
                    emote = reaction.emoji.id
                }

                let channel = client.channels.cache.get(reaction.message.channel.id);
                let guild = channel.guild;

                connection.query('SELECT * FROM picker_roles WHERE picker = ?', [res[0].uuid], (error, results, fields) => {
                    if(error != null || results.length == 0){
                        console.log(error);
                        return;
                    }

                    for (let i = 0; i < results.length; i++) {
                        const el = results[i];
                        if(Buffer.from(el.emote, 'base64').toString('utf-8') == emote){
                            let roleID  = el.role;
                            guild.members.fetch(user.id).then(member => {
                                member.roles.remove(roleID, "L'utilisateur ne veux plus le role " + Buffer.from(el.title, 'base64').toString('utf-8'))
                                    .catch(e => {
                                        console.log(e)
                                    });
                            })
                            
                        }
                    }

                })

            })
        })

        client.on('message', (message) => {
            if(!message.content.startsWith("!")){
                return;
            }

            if(message.member.hasPermission(Permissions.FLAGS.MANAGE_ROLES)){
                if(message.content.startsWith("!picker")){

                    let args = message.content.split(" ");
                    args.shift();

                    if(args.length < 1){
                        message.reply("Utilisation: !picker Titre").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        })
                        message.delete();
                        return;
                    }

                    let title = args.join(" ");

                    connection.query("SELECT uuid FROM pickers WHERE channel_id = ?", [message.channel.id], (err, res, fi) => {
                        if(err != null){
                            console.error(err);
                            return;
                        }

                        if(res.length == 0){
                            // Create
                            connection.query('INSERT INTO pickers SET uuid = ?, name = ?, channel_id = ?', [
                                uuidv4(),
                                Buffer.from(title, 'utf-8').toString('base64'),
                                message.channel.id,
                            ], (e1, r1, f1) => {
                                console.log(e1, r1)
                                RolePicker.updateOrSendMessage(message, client);
                            });
                        }else{
                            // Update
                            connection.query('UPDATE pickers SET name = ? WHERE channel_id = ?', [
                                Buffer.from(title, 'utf-8').toString('base64'),
                                message.channel.id
                            ], (e2, r2, f2) => {
                                console.log(e2, r2)
                                RolePicker.updateOrSendMessage(message, client);
                            });
                        }

                    });

                    message.delete();
                }
                if(message.content.startsWith("!role")){
                    // !role <@role> <Emoji> <Titre>
                    let args = message.content.split(" ");
                    args.shift();

                    if(args.length < 3){
                        message.reply("Utilisation: !role \@role \:emoji\: Titre").then(msg => {
                            msg.delete({
                                timeout: 3000
                            })
                        })
                        message.delete();
                        return;
                    }

                    let role = args[0];
                    args.shift();

                    let emote = args[0];
                    args.shift();

                    let RoleTitle = args.join(" ");

                    role = role.replace("<@&", "");
                    role = role.replace(">", "");

                    if(emote.includes("<")){
                        emote = emote.split(":");
                        emote = emote[2];
                        emote = emote.replace(">", "")

                        emote = message.guild.emojis.resolve(emote)
                        if(emote == null){
                            message.reply("Veuillez utiliser un emoji venant de ce serveur discord.").then(msg => {
                                msg.delete({
                                    timeout: 3000
                                })
                            })
                            message.delete();
                            return;
                        }
                        emote = emote.id;
                    }

                    connection.query("SELECT uuid FROM pickers WHERE channel_id = ?", [message.channel.id], (err, res, fi) => {
                        if(err != null || res.length == 0){
                            console.error(err);
                            return;
                        }

                        connection.query("INSERT INTO picker_roles SET ?", {
                            uuid: uuidv4(),
                            picker: res[0].uuid,
                            role: role,
                            title: Buffer.from(RoleTitle, 'utf-8').toString('base64'),
                            emote: Buffer.from(emote, 'utf-8').toString('base64'),
                        }, (e1, r1, f1) => {
                            RolePicker.updateOrSendMessage(message, client);
                        })

                    });

                    message.delete();
                    // !role @UCA :worldwide:  Test
                }
            }

        })
    }

    static updateOrSendMessage(message, client){
        message.channel.messages.fetch()
            .then(async (messages) => {
                let hasPicker = false;
                let pickerMessage = null;
                messages.forEach(el => {
                    if(el.author.id == client.user.id && (!el.content.includes("!picker") || !el.content.includes("!role"))){
                        pickerMessage = el;
                        hasPicker = true;
                    }   
                })
                if(hasPicker){
                    // Edit
                    let em = await RolePicker.getPickerEmbed(client, message.channel);
                    pickerMessage.edit(em)
                        .then(msg => {RolePicker.updateReactions(msg)})
                }else{
                    // Add
                    let em = await RolePicker.getPickerEmbed(client, message.channel)
                    message.channel.send(em)
                        .then(msg => {RolePicker.updateReactions(msg)})
                }
            })
    }

    static getPickerEmbed(client, channel){
        return new Promise((resolve) => {
            let embed = new MessageEmbed();

            embed.setDescription("Cliquez sur les réactions pour obtenir les rôles correspondants.");
            embed.setAuthor(client.user.username, client.user.avatarURL());

            connection.query('SELECT * FROM pickers WHERE channel_id = ?', [channel.id], (err, results, fields) => {
                if(err != null || results.length == 0){
                    console.error("Error ", err);
                    return;
                }

                let em = results[0];
                embed.setTitle(Buffer.from(em.name, 'base64').toString('utf-8'));

                connection.query('SELECT * FROM picker_roles WHERE picker = ?', [em.uuid], (error, result, f) => {  
                    if(error != null){
                        console.error(error);
                        return; 
                    }

                    if(result.length > 0){
                        // Add the differents roles
                        result.forEach(role => {
                            let str = null;
                            if(!(new RegExp("^[0-9]+$").test(Buffer.from(role.emote, 'base64').toString('utf-8')))){
                                str = Buffer.from(role.emote, 'base64').toString('utf-8').replace("@", "");
                            }else{
                                let emote = channel.guild.emojis.resolve(Buffer.from(role.emote, 'base64').toString('utf-8'))
                                str = "<:" + emote.name + ":" + emote.id + ">";
                            }
                            embed.addField(Buffer.from(role.title, 'base64').toString('utf-8'), "Cliquez sur " + str + ".", false)
                        })
                    }

                    resolve(embed);
                })
            })            
        });
    }

    static updateReactions(message){
        connection.query('SELECT uuid FROM pickers WHERE channel_id = ?', [message.channel.id], (err, results, fields) => {
            if(err != null || results.length == 0){
                console.error(err);
                return;
            }

            let uuid = results[0].uuid;
            
            connection.query('SELECT * FROM picker_roles WHERE picker = ?', [uuid], (error, result, f) => {  
                if(error != null || result.length == 0){
                    console.error(error);
                    return; 
                }

                result.forEach(role => {

                    let testAgainst = null;
                    if(new RegExp("^[0-9]+$").test(Buffer.from(role.emote, 'base64').toString('utf-8'))){
                        // C'est une emote custom
                        let emote = message.channel.guild.emojis.resolve(Buffer.from(role.emote, 'base64').toString('utf-8'))
                        testAgainst = emote.id;
                    }else{
                        // C'est pas une emote custom
                        testAgainst = Buffer.from(role.emote, 'base64').toString('utf-8').replace('@', '');
                    }
    
                    let has = false;
                    
                    message.reactions.cache.forEach(reac => {
                        if(reac.id == null){
                            // Emoji global
                            if(reac._emoji.name == testAgainst){
                                has = true;
                            }
                        }else{
                            // Emoji custom
                            if(reac.id == testAgainst){
                                has = true;
                            }
                        }
                    });
                    
                    if(!has){
                        message.react(testAgainst)
                    }
    
                })
            });

        });
    }

}