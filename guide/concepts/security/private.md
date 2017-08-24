## Private Chats

A user may want to make a private chat no other users can access. To do this,
create a new chat with the syntax:

```
let privChat = new Chat('private', true);
```

The second parameter tells ChatEngine to hit the ```/chat``` endpoint which
authorizes the user within that chat channel. Typically this endpoint will
label this user as the owner and prevent other users from creating a chat
with the same channel.

## Inviting to Private Chats

In order to securely invite other users to the chat, the client can call
the ```invite``` method.

```js
otherUser = ChatEngine.global.users['ian'];
privChat.invite(otherUser);
```

This will send ```otherUser``` a secure invite to the {@link Chat} via {@link User#direct}.

## Receiving invites to Private Chats

You can get notified of invites by subscribing to the ```'$.invite``` event.

```js
me.direct.on('$.invite', (payload) => {
    let privChat = new ChatEngine.Chat(payload.data.channel));
});
```

