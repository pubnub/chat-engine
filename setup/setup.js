let api = new Client({
    debug: true,
    endpoint: 'http://admin.bronze.ps.pn'
});

let Provision = (email, password, callback = function(){}, status = function(){}) => {

    status('Logging in...');

    api.init({
        email: email,
        password: password
    }, (err, body) => {

        if(err) {
            return callback('Incorrect email or password. Reset your password <a href="https://admin.pubnub.com/#/forgot-password/">here</a>.');
        }

        status('Creating new PubNub app...');

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

}
