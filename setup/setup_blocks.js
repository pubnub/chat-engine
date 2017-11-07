let ProvisionBlocks = (api, userId, key, callback = function() {}, status = function() {}) => {

  var block = null;

  status('Creating new PubNub Function...');

  var addSecretKeyToVault = function() {
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
        return;
      }

      status('Success!');

      callback(null, {
        pub: key.publish_key,
        sub: key.subscribe_key
      });
    });
  }

  var startPubNubFunction = function() {
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
        return;
      }

      addSecretKeyToVault();
    });
  }

  var onCodeFetch = function(stateCodeResult, authCodeResult, functionCodeResult) {
    status('Creating new after-publish Event Handler...');

    api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
      data: {
        key_id: key.id,
        block_id: block.id,
        type: 'js',
        event: 'js-after-presence',
        channels: 'global',
        name: 'state-to-kv',
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
            path: 'server',
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

    var stateCodeFetch = $.get({ url: 'functions/state-to-kv.js', dataType: 'text' });
    var authCodeFetch = $.get({ url: 'functions/auth.js', dataType: 'text' });
    var functionsCodeFetch = $.get({ url: 'functions/server.js', dataType: 'text' });

    $.when(stateCodeFetch, authCodeFetch, functionsCodeFetch)
      .then(onCodeFetch)
      .catch(function (err) {
        status('Failed to fetch code');
      });
  });
}
