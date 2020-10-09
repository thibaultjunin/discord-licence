'use strict';
const {Permissions, MessageEmbed} = require('discord.js');
const axios = require('axios');
const DomParser = require('dom-parser');
const parser = new DomParser();
const nodemailer = require("nodemailer");
var mysql      = require('mysql');
var env = require('node-env-file');
env('../.env');
var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});
const Utils = require('../Utils/Utils');

module.exports = class Verification{

    static load(client){

        client.on('guildMemberAdd', (member) => {
            connection.query("SELECT id FROM verifications WHERE user = ? AND server = ?", [member.id, member.guild.id], async (error, result, fields) => {

                if(error != null || result.length > 0){
                    let verif = await Utils.get(member.guild.id, "verification_role")
                    if(verif != undefined){
                        member.roles.add(verif, "L'utilisateur avait quitter le serveur lors d'un processus de vérification");
                    }
                }

            });
        })

        client.on('message', async (message) => {
            if(message.content.startsWith('!verification')){
                if(message.member.hasPermission(Permissions.FLAGS.KICK_MEMBERS)){
                    // Une personne demande la vérification d'une autre.
                    if(message.mentions.members){
                        const VERIF = await Utils.get(message.guild.id, "verification_role");
                        const VERIF_CHANNEL = await Utils.get(message.guild.id, "verification_channel");

                        for (let i = 0; i < message.mentions.members.array().length; i++) {
                            const element = message.mentions.members.array()[i];
                            let m = await element.fetch(true);
                            // let m = element;

                            connection.query("SELECT id FROM verifications WHERE user = ? AND server = ?", [m.id, message.guild.id], (e1, r1, f1) => {
                                console.log(e1, r1, r1.length);
                                if(e1 != null || r1.length > 0 ){
                                    message.reply("<@"+m.id+"> a déjà une demande de vérification en cours...")
                                    return;
                                }

                                m.roles.add(VERIF, "Vérification demandée")
                                    .catch(e => {console.log(e)})
                                    .then(() => {
                                        // console.log("Role verification added")
                                    })


                                for (let k = 0; k < m.roles.cache.array().length; k++) {
                                    const e = m.roles.cache.array()[k];
                                    if(e.id == VERIF || e.id == message.guild.id){ continue; }

                                    connection.query("INSERT INTO user_roles SET user = ?, server = ?, role = ?", [m.id, message.guild.id, e.id]);

                                    /* On supprime le role */
                                    m.roles.remove(e.id, "Suppression des rôles en attente de vérification").catch(e => {
                                        console.error("Remove roles: ", e);
                                    });
                                }


                                message.guild.channels.cache.get(VERIF_CHANNEL).send('<@' + m.id + '>', {
                                    embed: {
                                        title: "Vérification requise.",
                                        description: '<@' + message.author.id + '> demande à ce que vous vérifiez votre identité. Pour cela veuillez vous munir de votre numéro étudiant ou de votre login (si vous êtes personnel de l\'établissement) et suivre les instructions qui vous ont été envoyées en message priver.\n\nSi vous rencontrez des difficultés, vous pouvez échanger avec l\'administration du serveur dans ce salon.',
                                        footer: {
                                            text: client.user.username,
                                            iconURL: client.user.avatarURL()
                                        }
                                    }
                                })
                                m.createDM()
                                    .then(channel => {
                                        channel.send('', {
                                            embed: {
                                                title: "Vérification requise.",
                                                description: 'Vous devez vérifier votre identité afin d\'avoir accès au serveur discord **' + message.guild.name + "**.\n\nPour cela, veuillez envoyer, ici et sans aucun autre message votre numéro étudiant si vous êtes étudiant, sinon, votre identifiant ent.\nUne fois cette information envoyée, vous allez recevoir un code a six chiffres sur votre adresse email universitaire, une fois ce code renvoyé. Vous obtiendrez l'accès complet au serveur discord **" + message.guild.name + "**.\n\nVotre numéro étudiant, nom, prénom, identifiant et adresse email universitaire, seront stocker et traiter dans le but de procéder à cette vérification. Une fois la vérification finie, toutes vos données personnelles seront supprimées, vous pouvez consulter notre politique de confidentialité sur https://stc.re/privacy.",
                                                footer: {
                                                    text: client.user.username,
                                                    iconURL: client.user.avatarURL()
                                                }
                                            }
                                        }).catch(() => {
                                            let errorEmbed = new MessageEmbed();
                                            errorEmbed.setTitle("Vérification impossible.");
                                            errorEmbed.setDescription("La vérification de votre identité est impossible, car vous avez:\n- Désactiver les messages privés en provenance de ce serveur\n- Vous avez bloqué <@" + client.user.id + ">\n\nVeuillez résoudre ces problèmes et contacter un administrateur.");
                                            errorEmbed.setFooter(client.user.username, client.user.avatarURL());
                                            errorEmbed.setColor("RED");

                                            message.guild.channels.cache.get(VERIF_CHANNEL).send('<@' + m.id + '>', {
                                                embed: errorEmbed
                                            })
                                        })
                                    })

                                // On stocke la demande de vérification
                                connection.query("INSERT INTO verifications SET user = ?, server = ?", [m.id, message.guild.id])

                            })

                        }
                    }else{
                        message.reply("Veuillez mentionner une ou plusieurs personnes à vérifier.")
                    }
                }
            }

            if(message.author.id == client.user.id){return;}
            if(message.channel.type == "dm"){
                message.channel.messages.fetch()
                    .then(messages => {
                        messages.forEach(el => {
                            if(el.author.id == client.user.id){
                                el.delete();
                            }
                        })
                    })
                message.channel.startTyping();
                if(new RegExp("^[0-9]{8}$").test(message.content)){
                    // Le message est composé de 8 chiffres, on vérifie donc si il s'agit d'un étudiant
                    axios.get("http://annuaire.unice.fr/index.php?action=print_person&dn=uid%3D" + message.content + "%2Cou%3Detudiant%2Cou%3Dpeople%2Cdc%3Dunice%2Cdc%3Dfr&mode=ent&look=ent")
                        .then(response => {
                            let dom = parser.parseFromString(response.data);
                            let main = dom.getElementsByClassName('main-panel')[0]
                            let bolds = main.getElementsByTagName("b");
                            let notFound = false;
                            for (let i = 0; i < bolds.length; i++) {
                                const element = bolds[i];
                                if(element.innerHTML.startsWith("Pas de r&eacute;sultat")){
                                    notFound = true;
                                }
                            }

                            if(notFound){
                                // On a trouvé personne avec ce numéro...
                                message.channel.send("Numéro étudiant inconnu, veuillez réessayer.")
                                message.channel.stopTyping();
                                return;
                            }

                            // Une personne est trouvée
                            let name = main.getElementsByClassName('titre')[0].innerHTML.replace(/(<([^>]+)>)/ig, "").replace(/(?:\r\n|\r|\n)/g, '').replace('M. ', '').replace('Mme ', '');

                            let email = null;
                            let links = main.getElementsByTagName('a');
                            for (let k = 0; k < links.length; k++) {
                                const el = links[k];
                                let found = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(el.innerHTML);
                                if(found){
                                    email = el.innerHTML;
                                }
                            }

                            if(email == null){
                                message.channel.send("Oops... Une erreur est survenue, contactez un administrateur\rRaison: UnkEml");
                                message.channel.stopTyping();
                                return;
                            }

                            // On génére une code temporaire
                            let code = Verification.generateCode();

                            // On envoie le code par email
                            Verification.sendCodeEmail(email, code, client);

                            // On sauvegarde les données
                            Verification.saveUser(message.author.id, name, email, "student", code, message.content);

                            message.channel.stopTyping();

                            // On informe
                            message.channel.send('', {
                                embed: {
                                    title: name,
                                    description: 'Parfait! Vous allez recevoir un email avec un code de validation a six chiffres.\nUne fois reçu merci de l\'envoyer de la même façon que votre numéro étudiant/login.\nDès le code reçu vous aurez complété la vérification de votre identité et aurez de nouveau accès au serveur.',
                                    footer: {
                                        text: client.user.username,
                                        iconURL: client.user.avatarURL()
                                    }
                                }
                            })

                        })
                        .catch(error => {
                            console.log(error);
                            message.channel.stopTyping();
                        });
                }else if(new RegExp("^[0-9]{6}$").test(message.content)){
                    // Il s'aggit d'un code de vérification

                    // On recupère les codes et les utilisateurs

                    connection.query("SELECT * FROM verification_users WHERE discord = ?", [message.author.id], (err, res, fie) => {

                        if(err != null || res.length == 0){
                            console.log(err);
                            message.channel.stopTyping();
                            return;
                        }

                        if(message.content == res[0].code){

                            let r = "";
                            if(res[0].role == "teacher"){
                                r = "Personnel de l'université"
                            }else{
                                r = "Étudiant"
                            }

                            connection.query("SELECT * FROM verifications WHERE user = ?", [message.author.id], async (er, re, fi) => {
                                if(er != null || re.length == 0){
                                    console.log(er);
                                    message.channel.stopTyping();
                                    return;
                                }

                                for (let i = 0; i < re.length; i++) {
                                    const server = re[i].server;

                                    const VERIF = await Utils.get(server, "verification_role");

                                    client.guilds.fetch(server).then(async (guild) => {
                                        guild.members.fetch(message.author.id).then(async (member) => {
                                            member.roles.remove(VERIF, "Vérification complétée, " + Buffer.from(res[0].name, 'base64').toString('utf-8'));

                                            connection.query("SELECT * FROM user_roles WHERE user = ? AND server = ?", [message.author.id, server], (e1, r1, f1) => {
                                                if(e1 != null || r1.length == 0){
                                                    console.log(e1);
                                                    return;
                                                }

                                                r1.forEach(el => {
                                                    console.log("Adding role: ", el);
                                                    member.roles.add(el.role, "Remises des rôles originaux après vérification")
                                                })

                                            })

                                            member.roles.add(await Utils.get(server, "verified_role"), "Ajout du role vérifié").catch(e => {
                                                // console.error("Add roles ", e)
                                            })
                                            member.setNickname(Buffer.from(res[0].name, 'base64').toString('utf-8'), "Changement du nom après vérification")

                                        })
                                        guild.channels.cache.get(await Utils.get(server, "teacher_channel")).send('', {
                                            embed: {
                                                title: "Vérification de " + message.author.username,
                                                description: 'L\'utilisateur <@' + message.author.id + "> a complété le processus de vérification suite à votre demande.\n\nNous pouvons vous confirmer que cet utilisateur est un **"+r+"**.\nSuite à cette vérification, l'utilisateur dispose de nouveau des droits afin d'accéder à l'entièreté du serveur.",
                                                footer: {
                                                    text: client.user.username,
                                                    iconURL: client.user.avatarURL()
                                                },
                                                fields: [
                                                    {
                                                        name: "Numéro étudiant/Login",
                                                        value: Buffer.from(res[0].login, 'base64').toString('utf-8'),
                                                        inline: true,
                                                    },{
                                                        name: "Identité",
                                                        value: Buffer.from(res[0].name, 'base64').toString('utf-8'),
                                                        inline: true,
                                                    },{
                                                        name: "Email universitaire",
                                                        value: Buffer.from(res[0].email, 'base64').toString('utf-8')
                                                    }
                                                ],
                                                timestamp: new Date(),
                                            }
                                        })

                                        // On informe
                                        message.channel.send('', {
                                            embed: {
                                                title: Buffer.from(res[0].name, 'base64').toString('utf-8'),
                                                description: 'Parfait! La vérification de votre identité est maintenant complétée.',
                                                footer: {
                                                    text: client.user.username,
                                                    iconURL: client.user.avatarURL()
                                                }
                                            }
                                        })

                                        // On supprime toutes les données temporaires

                                        setTimeout(() => {
                                            Verification.removeUser(message.author.id);
                                        }, 120000);

                                        message.channel.stopTyping();

                                    });
                                }

                            })

                        }else{
                            // NOPE
                            // Le code n'est pas correct
                            message.channel.send('', {
                                embed: {
                                    title: Buffer.from(res[0].name, 'base64').toString('utf-8'),
                                    description: 'Ceci n\'est pas le code correct. Veuillez réessayer...',
                                    footer: {
                                        text: client.user.username,
                                        iconURL: client.user.avatarURL()
                                    }
                                }
                            })
                            message.channel.stopTyping();
                        }

                    })

                }else{

                    // il s'agit d'un personnel de l'université
                    axios.get("http://annuaire.unice.fr/index.php?action=print_person&dn=uid%3D" + message.content + "%2Cou%3Dpersonnel%2Cou%3Dpeople%2Cdc%3Dunice%2Cdc%3Dfr&mode=ent&look=ent")
                        .then(response => {
                            let dom = parser.parseFromString(response.data);
                            let main = dom.getElementsByClassName('main-panel')[0]
                            let bolds = main.getElementsByTagName("b");
                            let notFound = false;
                            for (let i = 0; i < bolds.length; i++) {
                                const element = bolds[i];
                                if(element.innerHTML.startsWith("Pas de r&eacute;sultat")){
                                    notFound = true;
                                }
                            }

                            if(notFound){
                                // login non trouvée
                                message.channel.send("Impossible de trouver cette identifiant, avez-vous rentré le bon ?")
                                message.channel.stopTyping();
                                return;
                            }

                            let name = main.getElementsByClassName('titre')[0].innerHTML.replace(/(<([^>]+)>)/ig, "").replace(/(?:\r\n|\r|\n)/g, '').replace('M. ', '').replace('Mme ', '');

                            let email = null;
                            let links = main.getElementsByTagName('a');
                            for (let k = 0; k < links.length; k++) {
                                const el = links[k];
                                let found = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(el.innerHTML);
                                if(found){
                                    email = el.innerHTML;
                                }
                            }

                            if(email == null){
                                message.channel.send("Oops... Une erreur est survenue, contactez un administrateur\rRaison: UnkEml");
                                message.channel.stopTyping();
                                return;
                            }

                            // On génére un code
                            let code = Verification.generateCode();

                            // On envoie un code
                            Verification.sendCodeEmail(email, code, client);

                            // On sauvegarde les données temporaires
                            Verification.saveUser(message.author.id, name, email, "teacher", code, message.content);

                            message.channel.stopTyping();

                            message.channel.send('', {
                                embed: {
                                    title: name,
                                    description: 'Parfait! Vous allez recevoir un email avec un code de validation a six chiffres.\nUne fois reçu merci de l\'envoyer de la même façon que votre numéro étudiant/login.\nDès le code reçu vous aurez complété la vérification de votre identité et aurez de nouveau accès au serveur.',
                                    footer: {
                                        text: client.user.username,
                                        iconURL: client.user.avatarURL()
                                    }
                                }
                            })

                        })
                        .catch(error => {
                            message.channel.stopTyping();
                        })
                }

            }

        })

    }

    static generateCode(){
        let code = Math.floor(Math.random() * (999999 - 0) + 0);
        code = code.toString();
        if(code.length < 6 && code.length != 0){
            for(var i = code.length; i < 6; i++){
                code = "0" + code;
            }
        }
        return code;
    }

    static saveUser(userID, name, email, role, code, num){
        connection.query("INSERT INTO verification_users SET ?", {
            discord: userID,
            name: Buffer.from(name, 'utf-8').toString('base64'),
            email: Buffer.from(email, 'utf-8').toString('base64'),
            role: role,
            code: code,
            login: Buffer.from(num, 'utf-8').toString('base64'),
        });
    }

    static removeUser(userID){
        connection.query("DELETE FROM verification_users WHERE discord = ?", [userID]);
        connection.query("DELETE FROM verifications WHERE user = ?", [userID]);
        connection.query("DELETE FROM user_roles WHERE user = ?", [userID]);
    }

    static async sendCodeEmail(email, code, client){
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        let info = await transporter.sendMail({
            from: process.env.EMAIL_SENDER, // sender address
            to: email, // list of receivers
            subject: "Votre code de vérification est: " + code, // Subject line
            text: "Bonjour, Votre code de vérification pour le serveur discord est: " + code + ". Envoyez le par message privée à l'utilisateur \"" + client.user.username + "\".", // plain text body
        });
    }

}