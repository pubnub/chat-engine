export default (request, response) => { 
    const kvdb = require('kvstore');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE";

    const requestBody = JSON.parse(request.body);

    let controllers = {};

    let reset = function() {
        if ( isReset ) return;
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

        isReset = true;
    }

    let globalGrant = function(gChan, myUUID, myAuthKey) {

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
            let record = retrievedKey || [];

            let newChannels = [channel, channel + '-pnpres'];

            if(forceAuth || !record.length || (record.indexOf(uuid) > -1 && authKey)) {

                return pubnub.grant({
                    channels: newChannels,
                    read: true, // false to disallow
                    write: true,
                    ttl: 0,
                    authKeys: [authKey]
                }).then( ( status ) => {

                    if ( !status.message || status.message !== "Success" ) {
                        console.log("PAM Issue: ", status.message);
                        response.status = 500;
                    }
                    else {
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
                return kvdb.set( key, record, 0 )
                .then( ( storeError ) => {
                    if ( storeError ) {
                        console.log('KVStore error: ', storeError);
                        response.status = 500;
                        return response.send('Internal Server Error');
                    }

                    response.status = 200;
                    return response.send();
                });
            }
        });
    }

    controllers['/insecure/grant'] = {};
    controllers['/insecure/grant']['POST'] = function () {
        if ( !requestBody.channel || !requestBody.uuid || !requestBody.authKey) {
            response.status = 422;
            return response.send('Missing property from request parameters'); 
        }

        return globalGrant(requestBody.channel, requestBody.uuid, requestBody.authKey);

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

            let chats = fixed.concat(myPublicChats);

            response.status = 200;
            return response.send(chats);
        });
    };

    // new chat
    controllers['/insecure/chats']['POST'] = function () {
        if ( !requestBody.uuid || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        let key = ['session', requestBody.uuid].join(':');
        let newChannel = [requestBody.globalChannel, 'user', requestBody.uuid, 'write.', 'direct'].join('#');
        return kvdb.get(key).then( ( chats ) => {
            chats = chats || [];
            // if the client says this is public, add them to the list of public chats for this user

            // logic goes here to tell if user can create this specific chat

            let indexInChats = chats.findIndex( chat => chat.channel === requestBody.chat.channel );
            if ( indexInChats === -1 ) {
                chats.push(requestBody.chat);
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
                        chat: requestBody.chat
                    }
                });

                response.status = 200;
                return response.send();
            }
        });
    };

    controllers['/insecure/chats']['DELETE'] = function () {
        if ( !requestBody.uuid || !requestBody.globalChannel || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        let key = ['session', requestBody.uuid].join(':');
        let channelToDelete = [requestBody.globalChannel, 'user', requestBody.uuid, 'write.', 'direct'].join('#');

        return kvdb.get(key).then( ( chats ) => {
            chats = chats || [];

            let indexInChats = chats.findIndex( chat => chat.channel === requestBody.chat.channel );
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
                        chat: requestBody.chat
                    }
                });

                response.status = 200;
                return response.send();
            }
        });
    };

    controllers['/insecure/chat/grant'] = {};
    controllers['/insecure/chat/grant']['POST'] = function () {

        if ( !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        if ( requestBody.chat.private ) {

            return authUser(requestBody.uuid, requestBody.authKey, requestBody.chat.channel, false);

        } else {
            response.status = 200;
            return response.send();
        }

    };

    controllers['/insecure/chat/invite'] = {};
    controllers['/insecure/chat/invite']['POST'] = function () {

        // you can only invite if you're in the channel
        // grants the user permission in the channel

        if ( !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        // grants, grants, grants, grants, grants grants, grants everybody!
        return authUser(requestBody.uuid, db['authkeys:' + requestBody.uuid], requestBody.chat.channel, true);

    };

    // uuids are permitted in channels
    // authKey is what is used to grant
    // server should make sure that uuid or other auth params match authKey for security
    controllers['/test'] = {};
    controllers['/test']['POST'] = function () {

        if ( !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body'); 
        }

        if(requestBody.authKey === 'open-sesame') {

            // grants everybody!
            return globalGrant(requestBody.channel, requestBody.uuid, requestBody.authKey);

        } else {
            response.status = 401;
            return response.send();
        }

    };

    // Reset all PAM permissions
    // reset();

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