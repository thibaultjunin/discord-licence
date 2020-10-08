'use strict';
const GUILD = "747824621486866612";
const sharp = require('sharp');

module.exports = class Logo{
    static load(client){
        setInterval(async () => {
            let now = new Date();
            if(now.getHours() != 0 && now.getMinutes() != 0){
                return;
            }

            let base = null;
            let addon = null;
            if(now.getMonth() == 9){
                // Halloween
                addon = "./icons/citrouille.png"
            }else if(now.getMonth() == 11 && (now.getDate() >= 10 && now.getDate() <= 28)){
                // Noel
                addon = "./icons/hiver.png"
            }else if(now.getMonth() == 0 && now.getDate() <= 10){
                // Nouvel an
                addon = "./icons/nouvelan.png"
            }else if(now.getMonth() == 1 && (now.getDate() >= 13 && now.getDate() <= 15)){
                // St Valentin
                addon = "./icons/ballons.png"
            }else if(now.getMonth() == 3){
                // Paques
                addon = "./icons/paques.png"
            }else if(now.getMonth() == 6 || now.getMonth() == 7){
                // Vacances
                addon = "./icons/ete.png"
            }else{
                base = await sharp('./base.png')
                    .png()
                    .toBuffer();
            }

            
            if(addon != null){
                let icon = await sharp(addon)
                    .png()
                    .resize(200)
                    .toBuffer();
                base = await sharp('./base2.png')
                    .composite([{
                        input: icon,
                    }])
                    .png()
                    .toBuffer();
            }

            if(base == null){
                console.error("oopsi")
                return;
            }
            
            let image = await sharp({
                create: {
                    width: 600,
                    height: 600,
                    channels: 4,
                    background: Logo.getDayRGB()
                }
            })
                .composite([{
                    input: base,
                }])
                .png()
                .toBuffer();

            client.guilds.fetch(GUILD).then(g => {
                g.setIcon(image).catch(ex1 => console.error("Set Icon", ex1))
            }).catch(ex2 => console.error("Fetch Guild", ex2))
            client.user.setAvatar(image);
                
        }, 60000);
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