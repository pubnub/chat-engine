When <a href=tutorial-configuration.html#Initialization>initializing</a> {@link ChatEngine | ```ChatEngine``` }, one may add the following configuration options to modify the ChatEngine runtime.

### Initialize ChatEngine Event Debugging

Sometimes it can be difficult to understand exactly what's happening in ChatEngine. ChatEngine includes some handy utilities to make debugging and profiling easier.

### ChatEngine Debug Mode (i.e ```ceConfig```)

This mode will output every event happening within ChatEngine system and it's payload. The event log tells a story about what's happening inside. Events are logged as they are triggered locally.

You can turn on debug mode by supplying ```{ "debug": true }``` within the second configuration object in {@link ChatEngineCore#create| ```ChatEngineCore.create()```  }.

```js
ChatEngine = ChatEngineCore.create(
    {
        //...
    },
    {
        debug: true
    }
);
```

This will output every event that occurs within ChatEngine. Note that not every event is a network event.

Just to note, the ```debug``` flag is effectively the same as writing:

```js
ChatEngine.onAny((event, payload) => {
    console.log(event, payload);
});
```

Other ChatEngine debug parameters include:

| Name |	Type |	Default	| Description |
|:----:|:-------:|:--------:|:------------|
| ```globalChannel``` |	String | ```chat-engine``` | The root channel. See ChatEngine.global|
| ```enableSync```	| Boolean |	```false``` | Synchronizes chats between instances with the same Me#uuid. See Me#sync.|
| ```enableMeta``` | Boolean | ```false```	| Persists Chat#meta on the server. See Chat#update.|
| ```throwErrors``` | Boolean| ```true``` | Throws errors in JS console.|
| ```endpoint``` | String | https://pubsub.pubnub.com/v1/blocks/sub-key/YOUR_SUB_KEY/chat-engine-server | The root URL of the server used to manage permissions for private channels. Set by default to match the PubNub functions deployed to your account. See privacy for more. |
| ```debug``` |	Boolean	| ```false``` | Logs all ChatEngine events to the console This should not be enabled in production.|
| ```profile``` | Boolean | ```false``` |Sums event counts and outputs a table to the console every few seconds.|


> Note: all parameters listed above are **optional** when initializing ChatEngine.


### PubNub Debug SDK Events (i.e. ```pnConfig```)

PubNub includes it's own verbose logging feature. This logs all network requests made by ChatEngine to the PubNub network. You can enable it by supplying ```{ "logVerbosity": true }``` to the first configuration object in {@link ChatEngineCore#create| ```ChatEngineCore.create()``` }.

Check out the <a href="https://www.pubnub.com/docs/web-javascript/api-reference-configuration#init-args-1">PubNub JS Docs</a> for more on ```logVerbosity```.

```js
ChatEngine = ChatEngineCore.create(
    {
        logVerbosity: true
    },
    {
        //...
    }
);
```


### PubNub Functions Logging

If you suspect server side trouble, you can view your PubNub Functions console within the PubNub Portal Admin.

Navigate to your ChatEngine PubNub Functions and find the ChatEngine Event Handlers. The console window will show you any errors or problems occurring within the event handlers.

The event handlers will only log 250 console messages before disabling. Restart your event handler to refresh this limit.
