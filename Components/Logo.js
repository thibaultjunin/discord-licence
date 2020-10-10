'use strict';
const GUILD = "747824621486866612"; // FIXME: Store it in db
const sharp = require('sharp');
const {Permissions} = require('discord.js');

module.exports = class Logo{
    static load(client){
        setInterval(async () => {
            let now = new Date();
            if(now.getHours() != 0 || now.getMinutes() != 0){
                return;
            }
            
            Logo.updateIcon();

        }, 60000);

        client.on('message', message => {
            if(message.content.startsWith('!icon') && message.member.hasPermission(Permissions.FLAGS.MANAGE_GUILD)){
                Logo.updateIcon();
                message.reply("Done").then(msg => {
                    msg.delete({
                        timeout: 3000
                    })
                });
            }
        })
    }

    static async updateIcon(){
        let now = new Date();

        let addon = null;
        if(now.getMonth() == 9){
            // Halloween
            addon = "../Icons/citrouille.png"
        }else if(now.getMonth() == 11 && (now.getDate() >= 10 && now.getDate() <= 28)){
            // Noel
            addon = "../Icons/hiver.png"
        }else if(now.getMonth() == 0 && now.getDate() <= 10){
            // Nouvel an
            addon = "../Icons/nouvelan.png"
        }else if(now.getMonth() == 1 && (now.getDate() >= 13 && now.getDate() <= 15)){
            // St Valentin
            addon = "../Icons/ballonsCoeur.png"
        }else if(now.getMonth() == 3){
            // Paques
            addon = "../Icons/paques.png"
        }else if(now.getMonth() == 6 || now.getMonth() == 7){
            // Vacances
            addon = "../Icons/ete.png"
        }else{
            addon = "../Icons/ordi.png"
        }

        let icon = await sharp(addon)
            .png()
            .resize(200)
            .toBuffer();
        let base = await sharp('../Icons/base.png')
            .composite([{
                input: icon,
            }])
            .png()
            .toBuffer();
        
        let image = await sharp({
            create: {
                width: 600,
                height: 600,
                channels: 4,
                background: Logo.getDayRGB()
            }
        })
            .overlayWith('../Icons/circle.svg')
            .composite([{
                input: base,
            }])
            
            .png()
            .toBuffer();

        client.guilds.fetch(GUILD).then(g => {
            g.setIcon(image).catch(ex1 => console.error("Set Icon", ex1))
        }).catch(ex2 => console.error("Fetch Guild", ex2))
        client.user.setAvatar(image);
    }

    static getDayRGB(){
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);

        if(day < 256){
            return {
                r: day,
                g: Math.floor(Math.random() * Math.floor(255)), // Random is always fun
                b: day,
                alpha: 1
            }
        }else{

            return {
                r: 365-day,
                g: Math.floor(Math.random() * Math.floor(255)), // Random is a lot of fun
                b: day%365,
                alpha: 1
            }

        }

    }
}