## Public Chat

```js
let pubChat = new ChatEngine.Chat('public-chat');
```

The chat will automatically connect when created. Then, the client will be
in a {@link Chat| ```chat``` } with every other client that has a copy of that chat on their
machine.

You can get notified of when a chat is connected by subscribing to the {@link Chat#event:$"."connected| ```$.connected``` } event.

```js
pubChat.on('$.connected', () => {
    console.log('The chat is connected!');
});
```

Once chat rooms are created, a user can get a list of chat rooms and join a chat room by calling {@link "ChatEngine#chats"| ```ChatEngine.chats``` } //TODO FIX CHATS REF LINK!!!

```js
pubChat = ChatEngine.chats['public-chat'];
```
