Search is a way to retrieve old events that were fired before ChatEngine
was loaded. This way, when someone reloads their page or closes the app,
they'll see the old messages the next time they log in.

You can search for events by calling the {@link Chat#search} method:

```js
chat.search({
    event: 'message'
});
```

{@link Chat#search} returns an Event Emitter, so you subscribe to it's events
just like other objects in ChatEngine.

```js
let searchy = chat.search({
    event: 'message',
    limit: 50
});

searchy.on('message', (data) => {
    console.log('message found', data);
});

searchy.on('$.search.finish', () => {
    console.log('end of search');
});
```

This will search through every event emitted in the chat until 50 ```message``` events
are found or all events have been looked at. The ```searchy.on``` event emitter
augments events just like {@link Chat#on}.

{@link Chat#search} is powered by [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history) and the same parameters can be input
into the function call.

```js
chat.search({
    event: 'message',
    limit: 50,
    start: '123123123123',
    end: '123123123133'
});
```
