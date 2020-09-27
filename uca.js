'use strict';
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const RolePicker = require('./rolepicker');
const Channels = require('./channels');
const Messages = require('./messages');
const Verification = require('./verification');
const Moderation = require('./moderation');
var env = require('node-env-file');
env('.env');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

RolePicker.load(client);
Channels.load(client);
Messages.load(client);
Verification.load(client);
Moderation.load(client);

client.login(process.env.BOT);