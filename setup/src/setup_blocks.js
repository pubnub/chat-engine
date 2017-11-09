module.exports = (api, userId, key, callback = () => {}, status = () => {}) => {

    let block = null;

    status('Creating new PubNub Function...');

    let addSecretKeyToVault = () => {
        status('Adding Secret Key to Functions Vault...');

        api.storeSecretKey({ key }, (err) => {
            if (err) {
                callback('Could not add Secret Key to Functions Vault. Please contact support@pubnub.com');
                return;
            }

            status('Success!');

            callback(null, {
                pub: key.publish_key,
                sub: key.subscribe_key
            });
        });
    };

    let startPubNubFunction = () => {
        status('Starting Pubnub Function...');

        api.startFunction({ block, key }, (err) => {
            if (err) {
                callback('Could not start PubNub Function. Please contact support@pubnub.com.');
                return;
            }

            addSecretKeyToVault();
        });
    };

    let onCodeFetch = (stateCodeResult, authCodeResult, functionCodeResult) => {
        status('Creating new after-publish Event Handler...');

        api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
            data: {
                key_id: key.id,
                block_id: block.id,
                type: 'js',
                event: 'js-after-presence',
                channels: '*',
                name: 'chat-engine-state',
                code: stateCodeResult[0],
                output: 'output-state-to-kv-' + (new Date()).getTime()
            }
        }, (err, response) => {
            if (err) {
                callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
            }

            api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                data: {
                    key_id: key.id,
                    block_id: block.id,
                    type: 'js',
                    event: 'js-on-rest',
                    path: 'chat-engine-auth',
                    name: 'chat-engine-auth',
                    code: authCodeResult[0],
                    output: 'auth-' + Math.round((new Date()).getTime())
                }
            }, (err, response) => {
                if (err) {
                    callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
                }

                status('Creating new on-request Event Handler...');

                api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                    data: {
                        key_id: key.id,
                        block_id: block.id,
                        code: functionCodeResult[0],
                        type: 'js',
                        name: 'chat-engine-server',
                        path: 'chat-engine-server',
                        event: 'js-on-rest',
                        output: 'output-server-endpoint-' + Math.round((new Date()).getTime())
                    }
                }, (err, response) => {
                    if (err) {
                        callback('Could not create new Pubnub on-request Event Handler. Please contact support@pubnub.com.');
                        return;
                    }

                    startPubNubFunction();
                });
            });
        });
    };

    api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block'], {
        data: {
            name: 'ChatEngine Function',
            key_id: key.id
        }
    }, (err, response) => {

        if (err) {
            callback('Could not create new PubNub Function. Please contact support@pubnub.com.');
        }

        block = response.payload;

        let stateCodeFetch = $.get({ url: 'functions/state-to-kv.js', dataType: 'text' });
        let authCodeFetch = $.get({ url: 'functions/auth.js', dataType: 'text' });
        let functionsCodeFetch = $.get({ url: 'functions/server.js', dataType: 'text' });

        $.when(stateCodeFetch, authCodeFetch, functionsCodeFetch)
            .then(onCodeFetch)
            .catch(() => {
                status('Failed to fetch code');
            });
    });
};
