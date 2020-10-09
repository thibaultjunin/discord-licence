'use strict';
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const RolePicker = require('./Components/Rolepicker');
const Channels = require('./Components/Channels');
const Messages = require('./Components/Messages');
const Verification = require('./Components/Verification');
const Moderation = require('./Components/Moderation');
const Sentiment = require('./Components/Sentiment');
const Logging = require('./Components/Logging');
const Logo = require('./Components/Logo');

var env = require('node-env-file');
env('.env');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: 'online'
    })
});

Logging.load(client);
RolePicker.load(client);
Channels.load(client);
Messages.load(client);
Verification.load(client);
Moderation.load(client);
Sentiment.load(client);
Logo.load(client);


client.login(process.env.BOT);