# Chat Rooms

Also referred to as {@link Chat}s, are the core object in ChatEngine. Chats are rooms of connected
ChatEngine {@link User}s.

## Join a Chat Room

The {@link Chat| ```ChatEngine.Chat()``` } method allows a user to create a new chat room. All chat rooms are created as public by default. A user may want to create a {@link Chat#isPrivate| private chat } that no other users can access.

The {@link Chat| ```Chat()``` }  method can also define chat {@link Chat#meta| ```metadata``` } for a chat room. Chat ```metadata``` is persisted on the server and can be access by calling {@link Chat#meta| ```chat.meta``` }.

### Public Chat

```js
let pubChat = new ChatEngine.Chat('public-chat');
```

The chat will automatically connect when created. Then, the client will be
in a {@link Chat} with every other client that has a copy of that chat on their
machine.

You can get notified of when a chat is connected by subscribing to the {@link Chat#event:$"."connected} event.

```js
pubChat.on('$.connected', () => {
    console.log('The chat is connected!');
});
```


### Private Chat

```js
let privChat = new ChatEngine.Chat('private-chat', true);
```

Once chat rooms are created, users can join any public chat room by going through {@link ChatEngine#chats| ```ChatEngine.chats``` }. They can only join a private chat room if they are explicitly invited to it. They can also find a particular chat room by calling  ```ChatEngine.chats[‘channel’]```.


## Leave a Chat Room

The {@link Chat#leave| ```Chat.leave()``` } method allows a user to leave a chat room and stop receiving messages.

```js
Chat.leave();
```

// TODO: does this event exist???

Listen to {@link Chat#disconnect| ```$.DISCONNECTED``` } event.

A $.disconnected event is generated when a user leaves the chat room:

```js
chat.on('$.disconnected', () => {
    done();
});
```

## Invite Users to Chat Room

The {@link Chat#invite| ```chat.invite()``` } method allows a user to invite other users to a chat room.

```js
otherUser = ChatEngine.users['adam-UUID'];
chat.invite(otherUser);
```

Listen for a {@link Chat#invite|```$.INVITE```} event.

Users can listen to {@link Chat#invite| ```$.invite```} events on their direct channel to receive invites for chats. If the user is offline, they can call search on their direct channel to retrieve missed invites.

```js
me.direct.on('$.invite', (payload) => {
    let invitedChat = new ChatEngine.Chat(payload.data.channel);
});
```

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
