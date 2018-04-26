Sometimes it can be difficult to understand exactly what's happening in ChatEngine. ChatEngine
includes some handy utilities to make debugging and profiling easier.

## Debug Mode

This mode will output **every event** happening within ChatEngine system and it's
payload. The event log tells a story about what's happening inside. Events are logged
as they are triggered locally.

You can turn on debug mode by supplying ```debug: true``` within the second
configuration object in {@link ChatEngineCore#create}.

```js
let ChatEngine = ChatEngineCore.create({
    //...
}, {
    debug: true
});
```

This will output every event that occurs within ChatEngine. Note that not
every event is a network event.


![](/debugging-debug.png)

```sh
debug: newListener $.ready
debug: $.created.chat { chat: {} }
```

This is effectively the same as writing:

```js
ChatEngine.onAny((event, payload) => {
   console.log(event, payload);
});
```

**This should not be enabled in production**. It is very verbose and will have negative performance implications.

## Increase PubNub Verbosity

PubNub includes it's own verbose logging feature. This logs all network requests
made by ChatEngine to the PubNub network. You can enable it by supplying ```logVerbosity: true```
to the first configuration object in {@link ChatEngine#create}.

Check out [the PubNub JS Docs](https://www.pubnub.com/docs/web-javascript/api-reference-configuration#init-args-1) for more on ```logVerbosity```.

```js
ChatEngine = ChatEngineCore.create({
    logVerbosity: true
}, {
    //...
});
```

![](/debugging-verbosity.png)

```sh
<<<<<
[2018-02-26T20:12:20.103Z]
 https://ps12.pndsn.com/v2/subscribe/demo/%2C/0
 { heartbeat: 60,
  'channel-group': 'test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms-pnpres,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system-pnpres,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom-pnpres',
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
-----
<<<<<
[2018-02-26T20:12:20.104Z]
 https://ps12.pndsn.com/v2/presence/sub-key/demo/channel/%2C/heartbeat
 { 'channel-group': 'test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#rooms,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#system,test-v6-11-0-11519675938157#ian-v6-11-0-11519675938157#custom',
  state: '{}',
  heartbeat: 60,
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
-----
<<<<<
[2018-02-26T20:12:20.105Z]
 https://ps12.pndsn.com/v2/presence/sub-key/demo/channel/test-v6-11-0-11519675938157
 { state: 1,
  uuid: 'ian-v6-11-0-11519675938157',
  pnsdk: 'PubNub-JS-Nodejs/4.20.1',
  auth: 'ian-v6-11-0-11519675938157' }
  ```

## PubNub Functions Logging

If you suspect server side trouble, you can view your PubNub Functions
console within the [PubNub Portal Admin](https://admin.pubnub.com).

Navigate to your ChatEngine PubNub Functions and find the ChatEngine
Event Handlers. The console window will show you any errors or problems
occurring within the event handlers.

The event handlers will only log 250 console messages before disabling. Restart
your event handler to refresh this limit.

## Profiling (Browser Only)

![](/debugging-profile.png)

Another handy feature is the ability to "profile" your app. This counts
the number of times each event is triggered within ChatEngine and outputs
it as a table to the console.

This is helpful for finding memory leaks and chatty events.

You can supply this parameter in the second configuration
within {@link ChatEngine#create}.

```js
ChatEngine = ChatEngineCore.create({
    //...
}, {
    profile: true
});
```
