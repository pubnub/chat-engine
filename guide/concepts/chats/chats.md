{@link Chat}s are the core object in ChatEngine. Chats are rooms of connected
ChatEngine clients.

A new chat can be made by running:

```js
let chat = new ChatEngine.Chat('tutorial-chat');
```

The chat will automatically connect when created. Then, the client will be
in a {@link Chat} with every other client that has a copy of that chat on their
machine.

## Chat Events

When two clients both join a {@link Chat} with the same string
input (```tutorial-chat``` in this case), they can communicate with one
another.

This communication happens through {@tutorial events}. To send an event to everyone
in a {@link Chat}, call the {@link Chat#emit} method.

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

## What else can Chats do?

{@link Chat}s have plenty of cool features. Check out the other tutorials:

- {@tutorial users}
- {@tutorial online-list}
- {@tutorial history}
- {@tutorial privacy}
- {@tutorial using}


For example, ```chat.users``` contains a list of all the other ```User```s online in the chat. That list of users will update automatically.
