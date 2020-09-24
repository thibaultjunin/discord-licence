var mysql      = require('mysql');
const { v4: uuidv4 } = require('uuid');
var env = require('node-env-file');
env('.env');
var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

module.exports = class Logging{

    static load(client){
        // client.on('channelCreate')
    }

}