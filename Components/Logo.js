'use strict';
const GUILD = "747824621486866612"; // FIXME: Store it in db
const sharp = require('sharp');
const {Permissions} = require('discord.js');
const path = require('path');
const ComplementaryColor = require('../Utils/ComplementaryColor');

module.exports = class Logo{
    static load(client){
        setInterval(async () => {
            let now = new Date();
            if(now.getHours() != 0 || now.getMinutes() != 0){
                return;
            }
            
            Logo.updateIcon(client);

        }, 60000);

        client.on('message', message => {
            if(message.channel.type == "dm"){return;}
            if(message.content.startsWith('!icon') && message.member.hasPermission(Permissions.FLAGS.MANAGE_GUILD)){
                Logo.updateIcon(client);
                message.reply("Done").then(msg => {
                    msg.delete({
                        timeout: 3000
                    })
                    message.delete();
                });
            }
        })
    }

    static async updateIcon(client){
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

        addon = path.resolve(__dirname, addon)

        let complementary = new ComplementaryColor();

        let backgroundColor = Logo.getDayRGB();
        let complementaryColor = complementary.RGB2HSV(backgroundColor);
        complementaryColor.hue = complementary.HueShift(complementaryColor.hue, 180.0);
        complementaryColor = complementary.HSV2RGB(complementaryColor);

        backgroundColor.alpha = 1
        complementaryColor.alpha = 1

        // Loading the addon icon, resize it to width 200px
        let icon = await sharp(addon)
            .png()
            .resize(200)
            .toBuffer();

        // Loading the base icon and add it the addon
        let base = await sharp(path.resolve(__dirname, '../Icons/base.png'))
            .composite([{
                input: icon,
            }])
            .png()
            .toBuffer();
        
        // Creating a 600x600px single color image to change the base icon's one
        let image = await sharp({
            create: {
                width: 600,
                height: 600,
                channels: 4,
                background: complementaryColor
            }
        })
            .composite([{
                input: base,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        // Loading the circle.png image
        let circle = await sharp(path.resolve(__dirname, '../Icons/circle.png'))
            .png()
            .toBuffer();
        // Creating a 600x600px single color image, to change circle.png color
        let circleColor = await sharp({
            create: {
                width: 600,
                height: 600,
                channels: 4,
                background: backgroundColor
            }
        })
            .composite([{
                input: circle,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();
            

        // Combining both images to make the final icon
        let finalIcon = await sharp(circleColor)
            .composite([{
                input: image
            }])
            .png()
            .toBuffer();
            
        client.guilds.fetch(GUILD).then(g => {
            g.setIcon(finalIcon).catch(ex1 => console.error("Set Icon", ex1))
            console.log("changed");
        }).catch(ex2 => console.error("Fetch Guild", ex2))
        client.user.setAvatar(finalIcon).catch(ex3 => console.error("Avatar", ex3));
    }

    static getDayRGB(){
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);

        if(day < 256){
            return {
                r: Math.floor(Math.random() * Math.floor(day)),
                g: Math.floor(Math.random() * Math.floor(255)), // Random is always fun
                b: Math.floor(Math.random() * Math.floor(day)),
            }
        }else{

            return {
                r: Math.floor(Math.random() * Math.floor(365-day)),
                g: Math.floor(Math.random() * Math.floor(255)), // Random is a lot of fun
                b: Math.floor(Math.random() * Math.floor(day%365)),
            }

        }

    }
}