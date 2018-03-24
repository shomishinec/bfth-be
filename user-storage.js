var uuidv1 = require('uuid/v1');
var users = {};

module.exports.add = function (user) {
    var key = uuidv1();
    users[key] = user;
    return key;
};

module.exports.contains = function (key) {
    return users[key] !== undefined;
};

module.exports.get = function (key) {
    return users[key];
};


