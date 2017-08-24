History is a way to retrieve old events that were fired before ChatEngine
was loaded. This way, when someone reloads their page or closes the app,
they'll see the old messages the next time they log in.

You can trigger history events by calling the {@link Chat#history} method with
the event you'd like to retrieve as the first command.

```js
chat.history('message');
```

This will fire old events on the {@link Chat}. The events will have the same
payload (reprocessed by plugins at runtime) and emitted with the the
```$.history``` prefix. See {@link Chat#event:$"."history"."*}.

The above call triggers the ```$.history.message``` event
and the events can be subscribed to via:

```js
chat.on('$.history.message', (payload) => {});
```

Altogether it looks like:

```js
// when this chat gets a message
chat.on('message', function(payload) {
    console.log('live message', payload)
});

// if this chat receives a message that's not from this sessions
chat.on('$.history.message', function(payload) {
    console.log('old message', payload)
});

// trigger history messages
chat.history('message');
```
