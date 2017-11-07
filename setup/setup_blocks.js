let ProvisionBlocks = (api, userId, key, callback = function() {}, status = function() {}) => {
  status('Creating new PubNub Function...');

  api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block'], {
    data: {
      name: 'ChatEngine Function',
      key_id: key.id
    }
  }, (err, response) => {

    if (err) {
      callback('Could not create new PubNub Function. Please contact support@pubnub.com.');
    }

    let block = response.payload;

    status('Creating new after-presence Event Handler...');

    $.get('functions/state-to-kv.js', (code) => {

      api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
        data: {
          key_id: key.id,
          block_id: block.id,
          type: 'js',
          event: 'js-after-presence',
          channels: 'global',
          name: 'state-to-kv',
          code: code,
          output: 'output-state-to-kv-' + (new Date()).getTime()
        }
      }, (err, response) => {

        if (err) {
          callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
        }

        status('Creating new after-publish Event Handler...');

        $.get('functions/get-kv-state.js', (code) => {

          api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
            data: {
              key_id: key.id,
              block_id: block.id,
              type: 'js',
              event: 'js-on-rest',
              path: 'state',
              name: 'get-kv-state',
              code: code,
              output: 'output-get-kv-state-endpoint-' + Math.round((new Date()).getTime())
            }
          }, (err, response) => {

            if (err) {
              callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
            }

            status('Creating new on-request Event Handler...');

            $.get('functions/server.js', (code) => {

              api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                data: {
                  key_id: key.id,
                  block_id: block.id,
                  code: code,
                  type: 'js',
                  name: 'chat-engine-server',
                  path: 'server',
                  event: 'js-on-rest',
                  output: 'output-server-endpoint-' + Math.round((new Date()).getTime())
                }
              }, (err, response) => {

                if (err) {
                  callback('Could not create new Pubnub on-request Event Handler. Please contact support@pubnub.com.');
                }

                status('Starting Pubnub Function...');

                api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block', block.id, 'start'], {
                  data: {
                    block_id: block.id,
                    key_id: key.id,
                    action: 'start'
                  }
                }, (err, response) => {

                  if (err) {
                    callback('Could not start PubNub Function. Please contact support@pubnub.com.');
                  }

                  status('Adding Secret Key to Functions Vault...');

                  api.request('put', ['api', 'vault', key.subscribe_key, 'key', 'secretKey'], {
                    contentType: 'application/json',
                    data: JSON.stringify({
                      keyName: 'secretKey',
                      key_id: key.id,
                      subscribeKey: key.subscribe_key,
                      value: key.secret_key
                    })
                  }, (err, response) => {

                    if (err) {
                      callback('Could not add Secret Key to Functions Vault. Please contact support@pubnub.com');
                    }

                    status('Success!');

                    callback(null, {
                      pub: key.publish_key,
                      sub: key.subscribe_key
                    });
                  });
                });
              });
            }, 'text');
          });
        }, 'text');
      });
    }, 'text');
  });
}
