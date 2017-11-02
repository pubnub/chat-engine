
export default (request, response) => {

    const kvdb = require('kvstore');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    const oneHourInMinutes = 60;

    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE";

    const requestBody = JSON.parse(request.body);

    let controllers = {};

    let addUuidToChannel = function (channel, myUuid, uuid, ttl, authKey) {

        console.log('add uuid to channel')

        ttl = ttl || oneHourInMinutes;

        let key = ['authed', channel].join(':');
        response.status = 200;

        return kvdb.get(key).then( ( retrievedKey ) => {

            let record = retrievedKey || [];

            console.log('uuids in channel', key, record)

            // The first user adds their UUID to the allowed UUIDs for the channel
            if (record.length === 0) {
                record.push(myUuid);
                return kvdb.set(key, record, ttl).then(( storeError ) => {
                    if ( storeError ) {
                        console.log('KVStore error: ', storeError);
                        response.status = 500;
                        return response.send('Internal Server Error');
                    }
                    else {
                        console.log('uuid added to channel', key, record)
                        return grantReadWrite(channel, uuid, authKey, ttl);
                    }
                });
            }

            // The first user allows the UUID of another user to the private chat
            // Only the first UUID in the list of allowed UUIDs can add others
            if (record.length > 0 && record.indexOf(myUuid) === 0 && myUuid.length > 1) {

                // If the initial UUID tries to allow themself again, return 200
                if (!uuid || uuid === myUuid) {
                    return response.send();
                }

                // Add the invited UUID to the list of allowed UUIDs
                record.push(uuid);
                return kvdb.set(key, record, ttl).then(( storeError ) => {
                    if ( storeError ) {
                        console.log('KVStore error: ', storeError);
                        response.status = 500;
                        return response.send('Internal Server Error');
                    }
                    else {
                        return grantReadWrite(channel, uuid, authKey, ttl);
                    }
                });
            }

            console.log('add uuid 401');
            response.status = 401;
            return response.send();
        });
    }

    let grantReadWrite = function (channel, myUuid, myAuthKey, ttl) {
        ttl = ttl || oneHourInMinutes;
        let key = ['authed', channel].join(':');
        response.status = 200;

        // Check the list of allowed UUIDs for the channel
        return kvdb.get(key).then( ( retrievedKey ) => {
            let record = retrievedKey || [];

            let uuidNotAllowed = record.indexOf(myUuid) === -1;

            if (uuidNotAllowed) {
                console.log('read write 401', myUuid, channel)
                response.status = 401;
                return response.send();
            }

            let chanReadWrite = [
                channel,
                channel + '-pnpres',
                channel + '#user#' + myUuid + '#read.*',
                channel + '#user#' + myUuid + '#write.*'
            ];

            return pubnub.grant({
                channels: chanReadWrite,
                read: true,
                write: true,
                authKeys: [myAuthKey],
                ttl: ttl
            }).then( ( status ) => {
                if (status && status.message === "Success") {
                    return response.send();
                }

                console.log(status);
                response.status = 500;
                return response.send();

            }).catch( ( err ) => {
                console.log(err);
                response.status = 500;
                return response.send();
            });

        });
    }

    let grantRead = function (channel, myUuid, myAuthKey, ttl) {
        ttl = ttl || oneHourInMinutes;
        let key = ['authed', channel].join(':');
        response.status = 200;

        // Check the list of allowed UUIDs for the channel
        return kvdb.get(key).then( ( retrievedKey ) => {
            let record = retrievedKey || [];

            let uuidNotAllowed = record.indexOf(myUuid) === -1;

            if (uuidNotAllowed) {
                console.log('read 401')
                response.status = 401;
                return response.send();
            }

            let chanRead = [
                channel + '#user:' + myUuid + '#read.*'
            ];

            return pubnub.grant({
                channels: chanRead,
                read: true,
                write: false,
                authKeys: [myAuthKey],
                ttl: ttl
            }).then( ( status ) => {
                if (status && status.message === "Success") {
                    return response.send();
                }

                console.log(status);
                response.status = 500;
                return response.send();

            }).catch( ( err ) => {
                console.log(err);
                response.status = 500;
                return response.send();
            });

        });
    }

    let grantWrite = function (channel, myUuid, myAuthKey, ttl) {
        ttl = ttl || oneHourInMinutes;
        let key = ['authed', channel].join(':');
        response.status = 200;

        // Check the list of allowed UUIDs for the channel
        return kvdb.get(key).then( ( retrievedKey ) => {
            let record = retrievedKey || [];

            let uuidNotAllowed = record.indexOf(myUuid) === -1;

            if (uuidNotAllowed) {
                console.log('write 401')
                response.status = 401;
                return response.send();
            }

            let chanWrite = [
                channel + '#user:' + myUuid + '#write.*'
            ];

            return pubnub.grant({
                channels: chanWrite,
                read: false,
                write: true,
                authKeys: [myAuthKey],
                ttl: ttl
            }).then( ( status ) => {
                if (status && status.message === "Success") {
                    return response.send();
                }

                console.log(status);
                response.status = 500;
                return response.send();

            }).catch( ( err ) => {
                console.log(err);
                response.status = 500;
                return response.send();
            });

        });
    }

    let globalGrant = function(gChan, myUUID, myAuthKey) {

        console.log('performing global grant for', myUUID)

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
                channels: chanMeRW,
                read: true, // false to disallow
                write: true, // false to disallow,
                authKeys: [myAuthKey],
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
            channels: chanEverybodyR,
            read: true, // false to disallow
            write: false,
            ttl: 0
            })
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

    controllers['grant'] = {};
    controllers['grant']['POST'] = function () {

        console.log('grant post called')

        if (!requestBody.channel || !requestBody.uuid || !requestBody.authKey) {
            console.log('422 grant post')
            response.status = 422;
            return response.send('Missing property from request parameters');
        }

        console.log('calling global grant function')

        return globalGrant(requestBody.channel, requestBody.uuid, requestBody.authKey);

    };

    // we logged in, grant
    controllers['chats'] = {};
    controllers['chats']['GET'] = function () {
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
    controllers['chats']['POST'] = function () {

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

    controllers['chats']['DELETE'] = function () {
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

    controllers['chat/grant'] = {};
    controllers['chat/grant']['POST'] = function () {

        if (!requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body');
        }

        if(!requestBody.chat.private) {
            response.status = 200;
            console.log('chat does not need auth', requestBody.chat.channel)
            return response.send('That chat does not need authentication');
        }

        let ttl = requestBody.ttl;

        if (!(typeof(ttl) === "number" || ttl === null || ttl === undefined)) {
            response.status = 422;
            return response.send('Invalid "ttl" in request body');
        }

        return addUuidToChannel(requestBody.chat.channel, requestBody.uuid, requestBody.uuid, ttl, requestBody.authkey);

    };

    controllers['chat/grant/read'] = {};
    controllers['chat/grant/read']['POST'] = function () {

        if ( !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel || !requestBody.chat.private) {
            response.status = 422;
            return response.send('Missing property from request body');
        }

        let ttl = requestBody.ttl;

        if (!(typeof(ttl) === "number" || ttl === null || ttl === undefined)) {
            response.status = 422;
            return response.send('Invalid "ttl" in request body');
        }

        return grantRead(requestBody.chat.channel, requestBody.uuid, requestBody.authKey, ttl);

    };

    controllers['chat/grant/write'] = {};
    controllers['chat/grant/write']['POST'] = function () {

        if ( !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel || !requestBody.chat.private) {
            response.status = 422;
            return response.send('Missing property from request body');
        }

        let ttl = requestBody.ttl;

        if (!(typeof(ttl) === "number" || ttl === null || ttl === undefined)) {
            response.status = 422;
            return response.send('Invalid "ttl" in request body');
        }

        return grantWrite(requestBody.chat.channel, requestBody.uuid, requestBody.authKey, ttl);

    };

    controllers['chat/invite'] = {};
    controllers['chat/invite']['POST'] = function () {

        // Used when a user is creating a private chat or inviting others to the private chat

        if (!requestBody.myUuid || !requestBody.uuid || !requestBody.authKey || !requestBody.chat || !requestBody.chat.channel) {
            response.status = 422;
            return response.send('Missing property from request body');
        }

        let ttl = requestBody.ttl;

        if (!(typeof(ttl) === "number" || ttl === null || ttl === undefined)) {
            response.status = 422;
            return response.send('Invalid "ttl" in request body');
        }

        return addUuidToChannel(requestBody.chat.channel, requestBody.myUuid, requestBody.uuid, ttl, requestBody.authKey);

    };

    // Choose route based on request.params and request.method
    // Execute the controller function in the controllers object
    const route = request.params.route;
    const method = request.method.toUpperCase();

    // GET request with empty route returns the homepage
    // If a requested route or method for a route does not exist, return 404
    if ( !route && method === 'GET' ) {
        return controllers['/index']['GET']();
    } else if ( controllers[route] && controllers[route][method] ) {
        console.log(method, route)
        return controllers[route][method]();
    } else {
        response.status = 404;
        console.log('not found');
        return response.send();
    }
};
