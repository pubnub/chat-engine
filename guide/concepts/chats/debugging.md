Sometimes it can be difficult to understand exactly what's happening in ChatEngine. ChatEngine
includes some handy utilities to make debugging and profiling easier.

## Debug Mode

This mode will output **every event** happening within ChatEngine system and it's
payload. The event log tells a story about what's happening inside. Events are logged
as they are triggered locally.

You can turn on debug mode by supplying ```debug: true``` within the second
configuration object in {@link ChatEngine#connect}.

```js
ChatEngine = require('../../src/index.js').create({
    //...
}, {
    debug: true
});
```

This will output every event that occurs within ChatEngine. Note that not
every event is a network event.

```sh
debug: newListener $.ready
debug: $.created.chat { chat: {} }
```

Beware that this is very verbose and should not be enabled in production as it
will slow your application considerably.

## Profiling (Browser Only)

Another handy feature is the ability to "profile" your app. This counts
the number of times each event is triggered within ChatEngine and outputs
it as a table to the console.

This is helpful for finding memory leaks and chatty events.

You can supply this parameter in the second configuration
within {@link ChatEngine#create}.

```js
ChatEngine = require('../../src/index.js').create({
    //...
}, {
    profiling: true
});
```

## Increase PubNub Verbosity

```sh
<<<<<
[2018-02-26T20:12:20.103Z]
 https://ps12.pndsn.com/v2/subscribe/sub-c-696d9116-c668-11e7-afd4-56ea5891403c/%2C/0
 { heartbeat: 60,
  'channel-group': 'test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms-pnpres,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system-pnpres,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom-pnpres',
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
-----
<<<<<
[2018-02-26T20:12:20.104Z]
 https://ps12.pndsn.com/v2/presence/sub-key/sub-c-696d9116-c668-11e7-afd4-56ea5891403c/channel/%2C/heartbeat
 { 'channel-group': 'test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom',
  state: '{}',
  heartbeat: 60,
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
-----
<<<<<
[2018-02-26T20:12:20.105Z]
 https://ps12.pndsn.com/v2/presence/sub-key/sub-c-696d9116-c668-11e7-afd4-56ea5891403c/channel/test-v6-11-0-11519675938157
 { state: 1,
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
  ```

- debug: true
- logVerbosity: true
- profiling
- console.log from pubnub functions
