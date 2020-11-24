'use strict';


const axios = require('axios');
const requests = require("xmlhttprequest");
var env = require('node-env-file');
const path = require('path');
env(path.resolve(__dirname, '../.env'));


module.exports = class Verification {

    static load(client) {

        client.on('message', async (message) => {

            // Catch !join command
            if (message.content.startsWith('!join')) {

                // A user cannot verify multiple time his account
                if (message.member.roles.cache.some(role => role.id === process.env.VERIFIED_ROLE_ID)) {
                    await message.author.send('You are already verified on this server')
                    return
                }

                // Ask in private conversation student ID
                message.author.send(`Please type your student ID to start the verification process.\nRemember, your student ID is an 8 digits number. e.g : 21405333`)
                    .then((ask_id_msg) => {
                        ask_id_msg.channel.awaitMessages(response => response.content, {
                            max: 1, time: 1000 * 60 * 5, errors: ['time'],
                        }).then(async (collected) => {
                            let student_id = collected.first().content

                            if (student_id.length !== 8 || isNaN(parseInt(student_id))) {
                                await ask_id_msg.author.send(`Error: Given student ID \`${student_id}\` is not an 8 digits number.\nVerification procedure aborded.`)
                                return
                            }

                            let student = await this.fetchStudentInfoFromId(student_id);
                            console.log(student);
                            await ask_id_msg.channel.send(`Detected identity for \`${student_id}\`\nName: ${student['name']}\nSurname: ${student['surname']}\nVerification code will be sent on ${student['mail']}\n\nDo you confirm this identity ? (Yes, No)`)
                                // Wait for manual approbation by the user according to the detected identity
                                .then(async (ask_validation_msg) => {
                                    await ask_validation_msg.channel.awaitMessages(response => response.content, {
                                        max: 1, time: 1000 * 60 * 5, errors: ['time'],
                                    }).then(async (collected) => {
                                        let validation = collected.first().content

                                        if (validation.toUpperCase() === "YES") {
                                            let generated_code = this.generateCode().toString()
                                            await this.sendCodeEmail(student['mail'], generated_code)

                                            await ask_id_msg.channel.send(`EMAIL SENT ${student['mail']}\nPlease type your verification code :`).then(async (ask_code_msg) => {
                                                await ask_code_msg.channel.awaitMessages(response => response.content, {
                                                    max: 1, time: 1000 * 60 * 5, errors: ['time'],
                                                }).then(async (collected) => {

                                                    let given_code = collected.first().content
                                                    if (given_code === generated_code) {

                                                        await message.member.setNickname(`${student['surname'].toUpperCase()} ${student['name']} ✔`);
                                                        await message.member.roles.add(process.env.VERIFIED_ROLE_ID).catch(async (e) => console.log(e));
                                                        await message.channel.send(
                                                            `The role ${process.env.VERIFIED_ROLE_NAME} has been added to ${message.member.displayName}.`
                                                        );
                                                        await ask_code_msg.channel.send(`Account validated`);
                                                    } else {
                                                        await ask_code_msg.channel.send(`WRONG CODE, ABORTED`);
                                                    }
                                                })
                                            });
                                        } else {
                                            await ask_code_msg.channel.send(`ABORTED`);
                                        }
                                    })
                                })
                        }).catch(() => {
                            ask_id_msg.channel.send('Timeout Reach, aborted.');
                        });
                    });
            }
        });
    }

    static generateCode() {
        let code = Math.floor(Math.random() * (999999));
        code = code.toString();
        if (code.length < 6 && code.length !== 0) {
            for (let i = code.length; i < 6; i++) {
                code = "0" + code;
            }
        }
        return code;
    }

    static async fetchStudentInfoFromId(studentId) {
        let url = `http://annuaire.unice.fr/index.php?action=print_person&dn=uid=${studentId},ou=etudiant,ou=people,dc=unice,dc=fr&mode=ent&look=ent`

        // Regex used to extract email from html result of url above
        const email_regex = /<span class="field">Courriel<\/span>.*>(.*)<\/a>/ig;

        // Convert email to username
        const username_regex = /(.*)\.(.*)@/ig;

        // Fetch annuaire.unice response
        const response = await axios.get(url)
        let raw_html = response.data.toString();

        let mail_match = email_regex.exec(raw_html);
        let mail = mail_match[1]

        let extract_user_identity = username_regex.exec(mail)
        let user_name = this.capitalize(extract_user_identity[1])
        let user_surname = this.capitalize(extract_user_identity[2])

        return {"name": user_name, "surname": user_surname, "mail": mail}
    }

    static capitalize(string) {
        return string.replace(string[0], string[0].toUpperCase())
    }

    static async sendCodeEmail(email, code) {
        let flow_url = "https://prod-142.westeurope.logic.azure.com:443/workflows/5f8f7caec9c84b81b56f9179b3348a61/" +
            "triggers/manual/paths/invoke?" +
            "api-version=2016-06-01&" +
            "sp=%2Ftriggers%2Fmanual%2Frun&" +
            "sv=1.0&sig=8q22o0BWxh03Nvsh9BSe_92T_KKe0i2lQHMDaBKpCnQ"

        var xhr = new requests.XMLHttpRequest();
        xhr.open("POST", flow_url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        var data = JSON.stringify({
            "receiver_email": email,
            "code": code,
            "flow_key": "dttXSF5nqU7CsgH63K8awF53WuxRjvDe"
        });
        xhr.send(data);

    }

}