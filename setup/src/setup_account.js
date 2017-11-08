const ProvisionBlocks = require('./setup_blocks.js');

module.exports = (api, userId, callback = () => {}, status = () => {}) => {
    api.request('get', ['api', 'accounts'], {
        data: {
            user_id: userId
        }
    }, (err, response) => {

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
        }, (err, response) => {

            if (err) {
                return callback('Could not create new PubNub app. Please contact support@pubnub.com.');
            }

            let app = response.result;

            status('Getting PubNub keys...');

            api.request('get', ['api', 'apps'], {
                data: {
                    owner_id: account.id
                }
            }, (err, response) => {

                if (err) {
                    return callback('Could not get PubNub keys. Please contact support@pubnub.com.');
                }

                let apps = response.result;
                let key;

                apps.forEach((item) => {
                    if (item.id === app.id) {
                        key = item.keys[0];
                    }
                });

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
                }, (err, response) => {

                    if (err) {
                        callback('Could not enable PubNub features. Please contact support@pubnub.com.');
                    }

                    ProvisionBlocks(api, userId, key, callback, status);

                });
            });
        });
    });
};
