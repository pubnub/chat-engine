export default (request, response) => {

    const db = require('kvstore');
    const pubnub = require('pubnub');
    const xhr = require('xhr');
    const crypto = require('crypto');
    const queryStringCodec = require('codec/query_string');
    const base64Codec = require('codec/base64');
    const vault = require('vault');

    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';

    // Choose route based on request.params and request.method
    // Execute the controller function in the controllers object
    const route = request.params.route;
    const method = request.method.toLowerCase();

    const body = JSON.parse(request.body);

    function quote(s) {
        return encodeURIComponent(s).replace(/[!~*'()]/g, c => `%${c.charCodeAt(0).toString(16)}`);
    }

    const signedRequest = (path, options = {}) => {

        options.timestamp = Math.floor(Date.now() / 1000);

        const params = Object.keys(options).sort().map(k => `${k}=${quote(options[k])}`).join('&');
        const signString = `${request.subkey}\n${request.pubkey}\n${path}\n${params}`;

        return vault.get('secretKey').then((secretKey) => {

            return crypto.hmac(base64Codec.btoa(secretKey), signString, crypto.ALGORITHM.HMAC_SHA256).then((signature) => {

                options.signature = signature;
                const query = queryStringCodec.stringify(options);

                return xhr.fetch(`https://ps.pndsn.com${path}?${query}`);

            });

        }).catch(() => {
            response.status = 500;
            return response.send('Internal Server Error');
        });

    };

    let controllers = {
        index: {},
        bootstrap: {},
        user_read: {},
        user_write: {},
        user_state: {},
        grant: {},
        chat: {},
        group: {},
        join: {},
        leave: {},
        invite: {},
        reset: {}
    };

    let authPolicy = () => {

        return new Promise((resolve, reject) => {

            const httpOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            };

            const url = `https://pubsub.pubnub.com/v1/blocks/sub-key/${request.subkey}/chat-engine-auth`;

            return xhr.fetch(url, httpOptions).then((res) => {
                if (res.status === 200) {
                    resolve(res);
                } else {
                    reject(res);
                }
            }).catch((err) => {
                reject(err);
            });

        });

    };

    let handleStatus = (status) => {

        if (!status.message || status.message !== 'Success') {
            console.log('PAM Issue: ', status.message);
            response.status = 500;
            return response.send('Internal Server Error');
        } else {
            return response.send();
        }

    };

    let handleError = (err) => {
        console.log('PAM Error: ', err);
        response.status = 500;
        return response.send('Internal Server Error');
    };

    controllers.index.get = () => {
        return response.send(200);
    };

    controllers.user_read.post = () => {

        let chanEverybodyR = [
            body.global + '#user:' + body.uuid + '#read.*'
        ];

        return pubnub.grant({
            channels: chanEverybodyR,
            read: true, // false to disallow
            write: false,
            ttl: 10080
        }).then(handleStatus).catch(handleError);

    };

    controllers.user_write.post = () => {

        let chanEverybodyW = [
            body.global + '#user:' + body.uuid + '#write.*'
        ];

        return pubnub.grant({
            channels: chanEverybodyW,
            write: true, // false to disallow
            read: false,
            ttl: 10080
        }).then(handleStatus).catch(handleError);

    };

    controllers.bootstrap.post = () => {

        let chanMeRW = [
            body.global,
            body.global + '-pnpres',
            body.global + '#chat#public.*',
            body.global + '#user#' + body.uuid + '#me.*',
            body.global + '#user#' + body.uuid + '#read.*',
            body.global + '#user#' + body.uuid + '#write.*'
        ];

        return pubnub.grant({
            channels: chanMeRW,
            read: true, // false to disallow
            write: true, // false to disallow,
            authKeys: [body.authKey],
            ttl: 10080
        }).then(handleStatus).catch(handleError);

    };

    controllers.group.post = () => {

        let groups = [
            body.global + '#' + body.uuid + '#rooms',
            body.global + '#' + body.uuid + '#rooms-pnpres',
            body.global + '#' + body.uuid + '#system',
            body.global + '#' + body.uuid + '#system-pnpres',
            body.global + '#' + body.uuid + '#custom',
            body.global + '#' + body.uuid + '#custom-pnpres'
        ];

        return pubnub.grant({
            channelGroups: groups,
            authKeys: [body.authkey],
            ttl: 10080,
            read: true
        }).then(handleStatus).catch(handleError);

    };

    controllers.join.post = () => {

        let group = encodeURIComponent([body.global, body.uuid, body.chat.group].join('#'));

        return signedRequest(`/v1/channel-registration/sub-key/${request.subkey}/channel-group/${group}`, {
            add: body.chat.channel,
            uuid: body.uuid
        }).then(() => {
            return response.send();
        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    };


    controllers.leave.post = () => {

        let group = encodeURIComponent([body.global, body.uuid, body.chat.group].join('#'));

        return signedRequest(`/v1/channel-registration/sub-key/${request.subkey}/channel-group/${group}`, {
            remove: body.chat.channel,
            uuid: body.uuid
        }).then(() => {
            return response.send();
        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    };

    controllers.chat.post = () => {

        return db.set('meta:' + body.chat.channel, body.chat, 525600).then(() => {
            return response.send();
        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    };

    controllers.chat.get = () => {

        return db.get('meta:' + request.params.channel).then((value) => {

            if (value) {

                return response.send({
                    found: true,
                    chat: value
                });

            } else {

                // client will create chat
                return response.send({
                    found: false
                });

            }

        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    };

    controllers.grant.post = () => {

        return pubnub.grant({
            channels: [body.chat.channel, body.chat.channel + '-pnpres'],
            read: true,
            write: true,
            authKeys: [body.authKey],
            ttl: 10080
        }).then(handleStatus).catch(handleError);

    };

    controllers.invite.post = () => {

        response.status = 200;
        return response.send();

    };

    controllers.user_state.get = () => {

        let key = request.params.global + ':' + request.params.user + ':state';

        return db.get(key).then((state) => {
            response.status = 200;
            return response.send(state || {});
        }).catch(() => {
            response.status = 500;
            return response.send();
        });

    };

    // GET request with empty route returns the homepage
    // If a requested route or method for a route does not exist, return 404
    if (!route && method === 'get') {
        return controllers.index.get();
    } else if (controllers[route] && controllers[route][method]) {

        return authPolicy().then(() => {
            return controllers[route][method]();
        }).catch(() => {
            response.status = 401;
            return response.send();
        });

    } else {
        response.status = 404;
        return response.send();
    }
};
