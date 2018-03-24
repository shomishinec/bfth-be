let instapi = require('./instagram-api');
let session = null;

instapi.init();

function getMedia(resolve, reject) {
    instapi.media(userSession, function (count) {
        resolve(count);
    });
}

module.exports.run = function (config) {
    let promise = new Promise(function (resolve, reject) {
        if (session) {
            getMedia(resolve, reject);
            return;
        }
        instapi.login("lampa_shar", "ROKOLABS2015!", function (error, message) {
            if (error) {
                console.log("error occures when insta login")
                reject();
            } else {
                session = message.session;
                getMedia(resolve, reject);
            }
        })
    });
    return promise;
}

