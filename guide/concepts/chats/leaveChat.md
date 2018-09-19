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
