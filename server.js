// TODO: refactoring for PN FUNCTIONS, not completed

export default (request, response) => { 
    const kvstore = require('kvstore');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE";

    let routes = {};

    let reset = function() {
        pubnub.grant({
            read: false,
            write: false,
            ttl: 0
        }).then( ( status ) => {
            if ( !status.message || status.message !== "Success" ) {
                console.log("PAM Issue: ", status.message);
                response.status = 500;
                return response.send("Internal Server Error");
            } else {
                console.log("All PAM permissions successfully reset.");
            }
        });
    }

    let globalGrant = function(gChan, myUUID, myAuthKey) {

        console.log('granting global access for', myUUID, 'permissions on ', gChan, 'for uuid', myUUID, 'with auth key', myAuthKey)

        let chanMeRW = [
            gChan,
            gChan + '-pnpres',
            gChan + '#chat#public.*',
            gChan + '#user#' + myUUID + '#read.*',
            gChan + '#user#' + myUUID + '#write.*'
        ];

        let chanEverybodyR = [
            gChan + '#user:' + myUUID + '#read.*'
        ];

        let chanEverybodyW = [
            gChan + '#user:' + myUUID + '#write.*'
        ];

        return pubnub.grant({
            channels: chanEverybodyR,
            read: true, // false to disallow
            write: false,
            ttl: 0
        }).then( ( status ) => {
            return pubnub.grant({
                channels: chanEverybodyW,
                write: true, // false to disallow
                read: false,
                ttl: 0
            });
        }).then( ( status ) => {
            return pubnub.grant({
                channels: chanMeRW,
                read: true, // false to disallow
                write: true, // false to disallow,
                authKeys: [myAuthKey],
                ttl: 0
            });
        })
        .then( ( status ) => {
            if ( !status.message || status.message !== "Success" ) {
                console.log("PAM Issue: ", status.message);
                response.status = 500;
                return response.send("Internal Server Error");
            } else {
                console.log("Global Grant Successful");
            }
        })
        .catch( ( err ) => {
            console.log("PAM Issue: ", err);
            response.status = 500;
            return response.send("Internal Server Error");
        });
    }

    routes['/index'] = {};
    routes['/index']['GET'] = function () {
      response.status = 200;
      return response.send('Hello World!');
    };

    let db = {};

    let authUser = (uuid, authKey, channel, forceAuth) => {

        let key = ['authed', channel].join(':');

        db[key] = db[key] || [];

        let newChannels = [channel, channel + '-pnpres'];

        console.log('!!!!', channel, key, db[key])

        console.log('forceAuth?', forceAuth)
        console.log('in list of permissions?', (db[key].indexOf(uuid) > -1));
        console.log('auth key?',  authKey)
        console.log('people permitted in that room', db[key])
        console.log(channel)

        if(forceAuth || !db[key].length || (db[key].indexOf(uuid) > -1 && authKey)) {

        // if(!db[key].length || forceAuth || (db[key].indexOf(uuid) > -1 && authKey)) {

            console.log('new grant for', uuid, authKey, 'access on channel', channel)

            pubnub.grant({
                channels: newChannels,
                read: true, // false to disallow
                write: true,
                ttl: 0,
                authKeys: [authKey]
            }).then( ( status ) => {

                console.log('uuid', uuid, 'granted access to', key, 'with authkey', authKey)

                if(db[key].indexOf(uuid) == -1) {
                    db[key].push(uuid);
                }

            }).then(( status ) => {
                console.log('chat finished auth')
                response.status = 200;
                return response.send();
            });

        } else {
            console.log('unauthorized for that chan');
            response.status = 401;
            return response.send();
        }

    }

    routes['/insecure/grant'] = {};
    routes['/insecure/grant']['POST'] = function () {

        console.log('doing global grant')
        globalGrant(request.body.channel, request.body.uuid, request.body.authKey);

    };

    // we logged in, grant
    routes['/insecure/chats'] = {};
    routes['/insecure/chats']['GET'] = function () {

        let fixed = [
            {
                channel: 'Main',
                private: false,
                group: 'fixed'
            },
            {
                channel: 'Support',
                private: false,
                group: 'fixed'
            },
            {
                channel: 'Docs',
                private: false,
                group: 'fixed'
            },
            {
                channel: 'Foolery',
                private: false,
                group: 'fixed'
            },
        ];

        console.log('uuid found as', request.query.uuid)

        key2 = ['session', request.query.uuid].join(':');
        let myPublicChats = db[key2] || [];

        let chats = fixed.concat(myPublicChats);

        console.log('my chats found as', chats)

        response.status = 200;
        return response.send(chats);

    };

    // new chat
    routes['/insecure/chats']['POST'] = function () {

        // if the client says this is public, add them to the list of public chats for this user

        // logic goes here to tell if user can create this specific chat
        console.log('new chat created on behalf of ', request.body.uuid, request.body.authKey, 'for channel', request.body.chat.channel, 'privatE?', request.body.chat.private);

        let newChan = [request.body.globalChannel, 'user', request.body.uuid, 'write.', 'direct'].join('#');

        pubnub.publish({
            channel: newChan,
            message: {
                event: '$.server.chat.created',
                chat: request.body.chat
            }
        });

        let key = ['session', request.body.uuid].join(':');
        db[key] = db[key] || [];

        let found = false;

        if(!db[key]) {
            db[key] = [];
        }

        db[key].forEach((chat) => {
            if(!found & chat.channel == request.body.chat.channel) {
                found = true;
            }
        })

        if(!found) {
            db[key].push(request.body.chat);
        }

        response.status = 200;
        return response.send();

    };

    routes['/insecure/chats']['DELETE'] = function () {

        console.log(request.body)

        console.log('chat deleted on behalf of ', request.body.uuid, request.body.authKey, 'for channel', request.body.chat.channel, 'privatE?', request.body.chat.private);

        let newChan = [request.body.globalChannel, 'user', request.body.uuid, 'write.', 'direct'].join('#');

        let key = ['session', request.body.uuid].join(':');
        db[key] = db[key] || [];

        db[key].forEach((chat, index) => {

            if(chat.channel == request.body.chat.channel) {

                console.log('FOUND FOUND FOUND')

                db[key].splice(index, 1);

                pubnub.publish({
                    channel: newChan,
                    message: {
                        event: '$.server.chat.deleted',
                        chat: request.body.chat
                    }
                }, function(a,b) {
                    console.log(a,b)
                });

            }

        });

        response.status = 200;
        return response.send();

    };

    routes['/insecure/chats/grant'] = {};
    routes['/insecure/chats/grant']['POST'] = function () {

        if(request.body.chat.private) {

            authUser(request.body.uuid, request.body.authKey, request.body.chat.channel, false);

        } else {
            response.status = 200;
            return response.send();
        }

    };

    routes['/insecure/chat/invite'] = {};
    routes['/insecure/chat/invite']['POST'] = function () {

        // you can only invite if you're in the channel
        // grants the user permission in the channel

        let key = ['authed', request.body.chat.channel].join(':');

        // grants, grants, grants, grants, grants grants, grants everybody!
        authUser(request.body.uuid, db['authkeys:' + request.body.uuid], request.body.chat.channel, true);

    };

    // uuids are permitted in channels
    // authKey is what is used to grant
    // server should make sure that uuid or other auth params match authKey for security
    routes['/test'] = {};
    routes['/test']['POST'] = function () {

        if(request.body.authKey == 'open-sesame') {

            // grants everybody!
            globalGrant(request.body.channel, request.body.uuid, request.body.authKey);

        } else {
            response.status = 401;
            return response.send();
        }

    };

    // Reset all PAM permissions
    reset();

    // Choose route based on request.params and request.method
    // Execute the controller function in the routes object
    const route = request.params.route;
    const method = request.method.toUpperCase();

    // GET request with empty route returns the homepage
    // If a requested route or method for a route does not exist, return 404
    if ( !route && method === 'GET' ) {
        return routes['/index']['GET']();
    } else if ( routes[route] && routes[route][method] ) {
        return routes[route][method]();
    } else {
        response.status = 404;
        return response.send();
    }
};