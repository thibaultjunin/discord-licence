'use strict';
const GUILD = "747824621486866612";
const sharp = require('sharp');

module.exports = class Logo{
    static load(client){
        setTimeout(async () => {
            let base = await sharp('./base.png')
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
                .composite([{
                    input: base,
                }])
                .png()
                .toBuffer();
            
            client.guilds.fetch(GUILD).then(g => {
                g.setIcon(image)
                console.log("changed")
            })
                
        }, 3600*1000*24);
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
                g: day,
                b: Math.floor(Math.random() * Math.floor(255)), // Random is always fun
                alpha: 1
            }
        }else{

            return {
                r: 365-day,
                g: day%365,
                b: Math.floor(Math.random() * Math.floor(255)), // Random is a lot of fun
                alpha: 1
            }

        }

    }
}