The {@link Chat#invite| ```chat.invite()``` } method allows you to invite other users to a private chat room.

```js
let adam = new ChatEngine.user('adam-UUID');
privateChat.invite(adam);
```

## Listen to {@link Me#event:$"."invite| ```$.invite``` } Event

An {@link Me#event:$"."invite| ```$.invite``` } event is emitted on the invited user’s {@link Me#direct| ```direct``` } chat when they are invited to a private chat room. The user can listen to these events or retrieve them later by using {@link Search| ```chat.search()``` } on their direct chat channel.

```js
me.direct.on('$.invite', (payload) => {
    let invitedChat = new ChatEngine.Chat(payload.data.channel);
});
```
