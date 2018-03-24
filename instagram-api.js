var Client = require('instagram-private-api').V1;
var Promise = require('bluebird');

var fs = require('fs');
module.exports.init = function () {
    if (!fs.existsSync(__dirname + '/cookie')) {
        fs.mkdirSync(__dirname + '/cookie');
    }
};

module.exports.login = function (login, password, cb) {
    var device = new Client.Device(login);
    var storage = new Client.CookieFileStorage(__dirname + '/cookie/' + login + '.json');
    Client.Session.create(device, storage, login, password)
        .then(function (session) {
            cb(undefined, {
                session: session,
                message: {
                    text: "login"
                }
            });
        }).catch(function (err) {
        if (err.name === "AuthenticationError") {
            cb(err, {
                message: {
                    errorMessage: err.message,
                    errorCode: 1
                }
            })
        }
        if (err.name === "CheckpointError") {
            cb(err, {
                message: {
                    errorMessage: err.message,
                    errorCode: 2
                }
            });
            console.log(err);
        }

    });
};

module.exports.media = function (session, cb) {
    return session.getAccountId().then(function (accountId) {
        return [session, accountId];
    }).then(function (arg) {
        var feed = new Client.Feed.UserMedia(arg[0], arg[1], 1000);
        feed.get().then(function (media) {
            var count = 0;
            media.forEach(function (item, i, array) {
                count += item.getParams().likeCount;
            });
            cb(count);
        });
    });
};

module.exports.inbox = function (session, cb) {
    session.getAccountId().then(function (accountId) {
        return [session, accountId];
    }).then(function (accountId) {
        var feed = new Client.Feed.Inbox(session, accountId);
        feed.get().then(function (result) {
            var resp = {response: []};
            result.forEach(function (item, i, array) {
                var itemId = item.id;
                var threadItem = {};
                if (item.items && item.items.length > 0) {
                    var itemParams = item.items[0]._params;
                    threadItem = {
                        type: itemParams.type,
                        itemType: itemParams.itemType,
                        timeStamp: itemParams.timestamp,
                        text: itemParams.text,
                        id: itemParams.id,
                        itemId: itemParams.itemId,
                        created: itemParams.created,
                        mediaShare: itemParams.mediaShare
                    };
                    if (threadItem.mediaShare && threadItem.mediaShare.hasOwnProperty('location')) {
                        delete threadItem.mediaShare.location.location;
                    }
                }

                var threadAccountInfos = [];
                item.accounts.forEach(function (accountItem, accountIterator, accounts) {
                    var params = accountItem._params;
                    var account = {
                        id: accountItem.id,
                        fullName: params.fullName,
                        friendshipStatus: params.friendshipStatus,
                        hasAnonymousProfilePicture: params.hasAnonymousProfilePicture,
                        isPrivate: params.isPrivate,
                        isVerified: params.isVerified,
                        picture: params.picture,
                        profilePictureUrl: params.profilePicUrl,
                        profilePictureId: params.profilePicId,
                        userName: params.username,
                        threadId: item.id
                    };
                    threadAccountInfos.push(account);
                });
                resp.response.push({
                    threadAccountInfos: threadAccountInfos,
                    item: threadItem
                })

            });
            cb(resp)
        })
    })
};

function isCyclic(obj1) {
    var seenObjects = [];

    function detect(obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) {
                return true;
            }
            seenObjects.push(obj);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && detect(obj[key])) {
                    console.log(obj, 'cycle at ' + key);
                    return true;
                }
            }
        }
        return false;
    }

    return detect(obj1);
}