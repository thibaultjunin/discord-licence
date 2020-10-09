'use strict';
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
let frLang = {
    labels: require('../Data/fr_sentiment.json'),
    scoringStrategy: {
        apply: function(tokens, cursor, tokenScore) {
            if (cursor > 0) {
                var prevtoken = tokens[cursor - 1];
                if (prevtoken === 'pas') {
                    tokenScore = -tokenScore;
                }
            }
            return tokenScore;
        }
    }
}
sentiment.registerLanguage('fr', frLang);


module.exports = class Sentiment{

    static load(client){
        client.on('message', (message) => {
            if(message.author.id == client.user.id){
                return;
            }

            let resultFr = sentiment.analyze(message.content, { language: 'fr' });
            console.log(resultFr);
            if(resultFr.score < -1){
                message.react(`😔`);
            }

        })
    }

}