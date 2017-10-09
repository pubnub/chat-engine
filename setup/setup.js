let api = new Client({
    debug: false,
    endpoint: 'https://admin.pubnub.com'
});

let Provision = (email, password, callback = function() {}, status = function() {}) => {

    status('Logging user in...');

    api.init({
        email: email,
        password: password
    }, (err, response) => {

        if (err) {
            return callback('Incorrect email or password. Reset your password <a href="https://admin.pubnub.com/#/forgot-password/">here</a>.');
        }

        status('Getting user accounts...');

        let login = response.result;

        api.request('get', ['api', 'accounts'], {
            data: {
                user_id: login.user.id
            }
        }, function(err, response) {

            if (err) {
                return callback('Could not get PubNub accounts. Please contact support@pubnub.com.');
            }

            let account = response.result.accounts[0];

            status('Using account ' + account.properties.company + ', if this is incorrent deploy manually or log in as another user');
            status('Creating new PubNub app...');

            api.request('post', ['api', 'apps'], {
                data: {
                    name: 'ChatEngine App',
                    owner_id: account.id,
                    properties: {}
                }
            }, function(err, response) {

                if (err) {
                    return callback('Could not create new PubNub app. Please contact support@pubnub.com.');
                }

                let app = response.result;

                status('Getting PubNub keys...');

                api.request('get', ['api', 'apps'], {
                    data: {
                        owner_id: account.id
                    }
                }, function(err, response) {

                    if (err) {
                        return callback('Could not get PubNub keys. Please contact support@pubnub.com.');
                    }

                    let apps = response.result;
                    let key;

                    for (item of apps) {
                        if (item.id == app.id) {
                            key = item.keys[0]
                        }
                    }

                    status('Enabling PubNub features...');

                    key.properties.name = 'ChatEngine Keyset';
                    key.properties.presence = 1;
                    key.properties.history = 1;
                    key.properties.message_storage_ttl = 7;
                    key.properties.multiplexing = 1;
                    key.properties.presence_announce_max = 20;
                    key.properties.presence_debounce = 2;
                    key.properties.presence_global_here_now = 1;
                    key.properties.presence_interval = 10;
                    key.properties.presence_leave_on_disconnect = 0;
                    key.properties.blocks = 1;
                    key.properties.uls = 1;
                    key.properties.wildcardsubscribe = 1;

                    api.request('put', ['api', 'keys', key.id], {
                        data: key
                    }, function(err, response) {

                        if (err) {
                            callback('Could not enable PubNub features. Please contact support@pubnub.com.');
                        }

                        status('Creating new PubNub Function...');

                        api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block'], {
                            data: {
                                name: 'ChatEngine Function',
                                key_id: key.id
                            }
                        }, function(err, response) {

                            if (err) {
                                callback('Could not create new PubNub Function. Please contact support@pubnub.com.');
                            }

                            let block = response.payload;

                            status('Creating new after-presence Event Handler...');

                            $.get('functions/state-to-kv.js', function(code) {

                                api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                                    data: {
                                        key_id: key.id,
                                        block_id: block.id,
                                        type: 'js',
                                        event: 'js-after-presence',
                                        channels: 'global',
                                        name: 'state-to-kv',
                                        code: code,
                                        output: 'output-0.5823105682419438'
                                    }
                                }, function(err, response) {

                                    if (err) {
                                        callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
                                    }

                                    status('Creating new after-publish Event Handler...');

                                    $.get('functions/get-kv-state.js', function(code) {

                                        api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                                            data: {
                                                key_id: key.id,
                                                block_id: block.id,
                                                type: 'js',
                                                event: 'js-after-publish',
                                                channels: 'global',
                                                name: 'get-kv-state',
                                                code: code,
                                                output: 'output-0.5823105682419438'
                                            }
                                        }, function(err, response) {

                                            if (err) {
                                                callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
                                            }

                                            status('Starting Pubnub Function...');

                                            api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block', block.id, 'start'], {
                                                data: {
                                                    block_id: block.id,
                                                    key_id: key.id,
                                                    action: 'start'
                                                }
                                            }, function(err, response) {

                                                if (err) {
                                                    callback('Could not start PubNub Function. Please contact support@pubnub.com.');
                                                }

                                                status('Done!');

                                                callback(null, { pub: key.publish_key, sub: key.subscribe_key });
                                            });
                                        });
                                    }, 'text');
                                });
                            }, 'text');
                        });
                    });
                });
            });
        });
    });
}
/*
        let session = body.result;

         api.request('post', ['api', 'apps'], {
            data: {
                name: 'ChatEngine App',
                owner_id: session.user.id,
                properties: {}
            }
        }, function (err, created) {

            if(err) {
                return callback('Could not create new PubNub app. Please contact support@pubnub.com.');
            }

            status('Creating new PubNub keys...');
            
             api.request('get', ['api', 'apps'], {
                data: {
                    owner_id: session.user.id,
                }
            }, function (err, data) {

                if(err) {
                    return callback('Could not fetch PubNub apps. Please contact support@pubnub.com.');
                }

                status('Enabling PubNub features...');

                let result = false;

                data.result.forEach((res) => {
                    if(res.id == created.result.id) {
                        result = res;
                    }
                });

                let key = result.keys[0];

                key.properties.name = 'ChatEngine Keyset';
                key.properties.presence = 1;
                key.properties.history = 1;
                key.properties.message_storage_ttl = 7;
                key.properties.multiplexing = 1;
                key.properties.presence_announce_max = 20;
                key.properties.presence_debounce = 2;
                key.properties.presence_global_here_now = 1;
                key.properties.presence_interval = 10;
                key.properties.presence_leave_on_disconnect = 0;
                key.properties.blocks = 1;
                key.properties.uls = 1;
                key.properties.wildcardsubscribe = 1;

                api.request('put', ['api', 'keys', key.id], {
                    data: key
                }, function (err, data) {

                    if(err) {
                        return callback('Could not create a new key. Please contact support@pubnub.com.');
                    }

                    status('Done!');

                    callback(null, data);

                });

            });

        });

    });

}*/