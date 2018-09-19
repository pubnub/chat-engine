# Chat Rooms

Also referred to as {@link Chat}s, are the core object in ChatEngine. Chats are rooms of connected
ChatEngine {@link User}s.

## Chat Events

When two clients both join a {@link Chat} with the same channel name
(```tutorial-chat``` in this case), they can communicate with one
another.

This communication happens through {@tutorial events}. To send an event to everyone
in a {@link Chat}, call the {@link Chat#emit| ```Chat.emit()``` } method.

```js
chat.emit('message', {text: 'Hello world!'});
```

This will send the "message" event to every other client in the {@link Chat}.

To get notified when a "message" is sent to the {@link Chat}, a client can call
the {@link Chat#on} method.

```js
chat.on('message', (payload) => {
    console.log(payload);
});
```

See {@tutorial events} for more information on events.
