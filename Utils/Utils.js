'use strict';
var mysql      = require('mysql');
var env = require('node-env-file');
const path = require('path');
env(path.resolve(__dirname, '../.env'));
var connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});


module.exports = class Utils{

    static get(server, setting){
        console.log(server, setting);
        return new Promise((resolve) => {
            connection.query("SELECT value FROM settings WHERE server = ? AND parameter = ?", [server, setting], (error, result, fields) => {
                if(error != null){
                    return;
                }

                if(result[0] == undefined || result[0].value == undefined){
                    return;
                }

                resolve(result[0].value);

            })
        })
    }

    static getConnection(){
        return connection;
    }

}