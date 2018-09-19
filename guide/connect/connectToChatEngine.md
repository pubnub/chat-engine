## User Connect

The {@link ChatEngine#connect| ```ChatEngine.connect()``` } method connects to ChatEngine with a {@link Me| ```Me``` } {@link User| ```user``` }. A {@link User| ```user``` } is required to have a {@link User#uuid| ```UUID``` } that uniquely identifies the user.

```js
ChatEngine.connect('john-UUID', {});
```

### Listen to ```$.ready``` Event

When the {@link User| ```user``` } is successfully connected and ChatEngine is ready, it will emit ```$.ready``` event with the {@link Me} object returned.

```js
ChatEngine.on('$.ready', (data) => {
    let me = data.me; // ian
});
```

When a ```user``` connects to ChatEngine, it is added to a global chat room called chat-engine. The ```user``` is also added to its own direct and feed chat channels that can be referenced by calling {@link User#direct| ```user.direct``` } and {@link User#feed| ```user.feed``` }. Refer to <a href="tutorial-pubnubChannelTopology.html">Channel Topology</a>.
