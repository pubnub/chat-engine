## Create Private Chat

```js
let privChat = new ChatEngine.Chat('private-chat', true);
```

Once chat rooms are created, users can join any public chat room by going through {@link ChatEngine#chats| ```ChatEngine.chats``` }. They can only join a private chat room if they are explicitly invited to it. They can also find a particular chat room by calling  ```ChatEngine.chats[‘channel’]```.

## Invite Users to Chat Room

The {@link Chat#invite| ```chat.invite()``` } method allows a user to invite other users to a chat room.

```js
otherUser = ChatEngine.users['adam-UUID'];
chat.invite(otherUser);
```

Listen for a {@link Chat#invite| ```$.INVITE``` } event.

Users can listen to {@link Chat#invite| ```$.invite```} events on their direct channel to receive invites for chats. If the user is offline, they can call search on their direct channel to retrieve missed invites.

```js
me.direct.on('$.invite', (payload) => {
    let invitedChat = new ChatEngine.Chat(payload.data.channel);
});
```
