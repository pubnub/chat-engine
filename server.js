export default (request, response) => { 
    const kvdb = require('kvstore');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE";

    let controllers = {};

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
                response.status = 200;
                return response.send();
            }
        })
        .catch( ( err ) => {
            console.log("PAM Error: ", err);
            response.status = 500;
            return response.send("Internal Server Error");
        });
    }

    controllers['/index'] = {};
    controllers['/index']['GET'] = function () {
      response.status = 200;
      return response.send('Hello World!');
    };

    let authUser = (uuid, authKey, channel, forceAuth) => {

        let key = ['authed', channel].join(':');

        return kvdb.get(key).then( ( retrievedKey ) => {
            record = retrievedKey || [];

            let newChannels = [channel, channel + '-pnpres'];

            console.log('!!!!', channel, key, record)

            console.log('forceAuth?', forceAuth)
            console.log('in list of permissions?', (record.indexOf(uuid) > -1));
            console.log('auth key?',  authKey)
            console.log('people permitted in that room', record)
            console.log(channel)

            if(forceAuth || !record.length || (record.indexOf(uuid) > -1 && authKey)) {

            // if(!record.length || forceAuth || (record.indexOf(uuid) > -1 && authKey)) {

                console.log('new grant for', uuid, authKey, 'access on channel', channel)

                pubnub.grant({
                    channels: newChannels,
                    read: true, // false to disallow
                    write: true,
                    ttl: 0,
                    authKeys: [authKey]
                }).then( ( status ) => {
                    console.log('uuid', uuid, 'granted access to', key, 'with authkey', authKey)

                    if ( !status.message || status.message !== "Success" ) {
                        console.log("PAM Issue: ", status.message);
                        response.status = 500;
                    }
                    else {
                        console.log("Global Grant Successful");
                        response.status = 200;
                    }

                    if(record.indexOf(uuid) === -1) {
                        record.push(uuid);
                    }

                    return kvdb.set( key, record, 0 );
                }).then(( storeError ) => {
                    if ( storeError ) {
                        console.log('KVStore error: ', storeError);
                        response.status = 500;
                        return response.send('Internal Server Error');
                    }
                    else {
                        return response.send();
                    }
                });

            }
            else {
                kvdb.set( key, record, 0 )
                .then( ( storeError ) => {
                    if ( storeError ) {
                        console.log('KVStore error: ', storeError);
                        response.status = 500;
                        return response.send('Internal Server Error');
                    }
                    else {
                        console.log('unauthorized for that chan');
                        response.status = 401;
                        return response.send('Unauthorized');
                    }
                });
            }
        });
    }

    controllers['/insecure/grant'] = {};
    controllers['/insecure/grant']['POST'] = function () {
        if ( !request.params.channel || !request.params.uuid || !request.params.authKey) {
            response.status = 422;
            return response.send('Missing "uuid" from request parameters'); 
        }

        console.log('doing global grant')
        return globalGrant(request.body.channel, request.body.uuid, request.body.authKey);

    };

    // we logged in, grant
    controllers['/insecure/chats'] = {};
    controllers['/insecure/chats']['GET'] = function () {
        if ( !request.params.uuid ) {
            response.status = 422;
            return response.send('Missing "uuid" from request parameters'); 
        }

        let key = ['session', request.params.uuid].join(':');
        return kvdb.get(key).then( ( myPublicChats ) => {
            myPublicChats = myPublicChats || [];
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

            console.log('uuid found as', request.params.uuid);

            let chats = fixed.concat(myPublicChats);

            console.log('my chats found as', chats)

            response.status = 200;
            return response.send(chats);
        });
    };

    // new chat
    controllers['/insecure/chats']['POST'] = function () {
        if ( !request.body.uuid || !request.body.chat || !request.body.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        let key = ['session', request.body.uuid].join(':');
        let newChannel = [request.body.globalChannel, 'user', request.body.uuid, 'write.', 'direct'].join('#');
        return kvdb.get(key).then( ( chats ) => {
            chats = chats || [];
            // if the client says this is public, add them to the list of public chats for this user

            // logic goes here to tell if user can create this specific chat
            console.log('new chat created on behalf of ', request.body.uuid, request.body.authKey, 'for channel', request.body.chat.channel, 'privatE?', request.body.chat.private);

            let indexInChats = chats.findIndex( chat => chat.channel === request.body.chat.channel );
            if ( indexInChats === -1 ) {
                chats.push(request.body.chat);
            }

            return kvdb.set( key, chats, 0 );

        }).then(( storeError ) => {
            if ( storeError ) {
                console.log('KVStore error: ', storeError);
                response.status = 500;
                return response.send('Internal Server Error');
            }
            else {
                pubnub.publish({
                    channel: newChannel,
                    message: {
                        event: '$.server.chat.created',
                        chat: request.body.chat
                    }
                });

                response.status = 200;
                return response.send();
            }
        });
    };

    controllers['/insecure/chats']['DELETE'] = function () {
        if ( !request.body.uuid || !request.body.globalChannel || !request.body.chat || !request.body.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        let key = ['session', request.body.uuid].join(':');
        let channelToDelete = [request.body.globalChannel, 'user', request.body.uuid, 'write.', 'direct'].join('#');

        return kvdb.get(key).then( ( chats ) => {
            chats = chats || [];

            let indexInChats = chats.findIndex( chat => chat.channel === request.body.chat.channel );
            if ( indexInChats !== -1 ) {
                chats.splice(indexInChats, 1);
            }
            else {
                response.status = 422;
                return response.send('Requested resource unavailable or does not exist');
            }

        }).then( ( storeError ) => {
            if ( storeError ) {
                console.log('KVStore error: ', storeError);
                response.status = 500;
                return response.send('Internal Server Error');
            }
            else {
                pubnub.publish({
                    channel: channelToDelete,
                    message: {
                        event: '$.server.chat.deleted',
                        chat: request.body.chat
                    }
                });

                response.status = 200;
                return response.send();
            }
        });
    };

    controllers['/insecure/chats/grant'] = {};
    controllers['/insecure/chats/grant']['POST'] = function () {

        if ( !request.body.uuid || !request.body.authKey || !request.body.chat || !request.body.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        if ( request.body.chat.private ) {

            return authUser(request.body.uuid, request.body.authKey, request.body.chat.channel, false);

        } else {
            response.status = 200;
            return response.send();
        }

    };

    controllers['/insecure/chat/invite'] = {};
    controllers['/insecure/chat/invite']['POST'] = function () {

        // you can only invite if you're in the channel
        // grants the user permission in the channel

        if ( !request.body.uuid || !request.body.authKey || !request.body.chat || !request.body.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        // grants, grants, grants, grants, grants grants, grants everybody!
        return authUser(request.body.uuid, db['authkeys:' + request.body.uuid], request.body.chat.channel, true);

    };

    // uuids are permitted in channels
    // authKey is what is used to grant
    // server should make sure that uuid or other auth params match authKey for security
    controllers['/test'] = {};
    controllers['/test']['POST'] = function () {

        if ( !request.body.uuid || !request.body.authKey || !request.body.chat || !request.body.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        if(request.body.authKey === 'open-sesame') {

            // grants everybody!
            return globalGrant(request.body.channel, request.body.uuid, request.body.authKey);

        } else {
            response.status = 401;
            return response.send();
        }

    };

    // Reset all PAM permissions
    reset();

    // Choose route based on request.params and request.method
    // Execute the controller function in the controllers object
    const route = request.params.route;
    const method = request.method.toUpperCase();

    // GET request with empty route returns the homepage
    // If a requested route or method for a route does not exist, return 404
    if ( !route && method === 'GET' ) {
        return controllers['/index']['GET']();
    } else if ( controllers[route] && controllers[route][method] ) {
        return controllers[route][method]();
    } else {
        response.status = 404;
        return response.send();
    }
};