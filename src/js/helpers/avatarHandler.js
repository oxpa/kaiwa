/*global app*/
"use strict";
var crypto = require('crypto');

module.exports.getGravatar = function (jid) {
    var gID = crypto.createHash('md5').update(jid).digest('hex');
    return {
        uri: 'https://gravatar.com/avatar/' + gID + '?s=80&d=mm'
    };
};

var getGravatar = module.exports.getGravatar;

module.exports.fetch = function (jid, id, type, source, cb) {
    if (!id) {
        return cb(getGravatar(jid));
    }

    app.storage.avatars.get(id, function (err, avatar) {
        if (!err) {
            return cb(avatar);
        }

        if (!type) {
            return cb(getGravatar(jid));
        }

        app.whenConnected(function () {
            if (source == 'vcard') {
                app.api.getVCard(jid, function (err, resp) {
                    if (err) {
                        return cb(getGravatar(jid));
                    }

		    if (!resp.vCardTemp.photo) return;

                    type = resp.vCardTemp.photo.type || type;

                    var data = resp.vCardTemp.photo.data;
                    var uri = 'data:' + type + ';base64,' + data;

                    avatar = {
                        id: id,
                        type: type,
                        uri: uri
                    };

                    app.storage.avatars.add(avatar);
                    return cb(avatar);
                });
            } else {
                app.api.getAvatar(jid, id, function (err, resp) {
                    if (err) {
                        return cb(getGravatar(jid));
                    }

                    var data = resp.pubsub.retrieve.item.avatarData;
                    var uri = 'data:' + type + ';base64,' + data;

                    avatar = {
                        id: id,
                        type: type,
                        uri: uri
                    };

                    app.storage.avatars.add(avatar);
                    return cb(avatar);
                });
            }
        });
    });
};
