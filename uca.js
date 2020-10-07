'use strict';
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const RolePicker = require('./rolepicker');
const Channels = require('./channels');
const Messages = require('./messages');
const Verification = require('./verification');
const Moderation = require('./moderation');
const Sentiment = require('./sentiment');
const Logging = require('./Logging');
const Logo = require('./Logo');

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