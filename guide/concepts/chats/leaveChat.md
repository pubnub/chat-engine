## Leave a Chat Room
The {@link Chat#leave| ```chat.leave()``` } method allows a user to leave a chat room and stop receiving messages.

```js
chat.leave();
```

## Listen to {@link Chat#event:$"."offline"."leave| ```$.offline```} Event

A {@link Chat#event:$"."offline"."leave| ```$.offline.leave``` } event is emitted when a user intentionally leaves a chat room. Other users in the chat room can listen to ```$.offline.*``` to receive all leave events and mark the user offline.

```js
chat.on('$.offline.*', (payload) => {
    console.log('User left the room:', payload.user);
});
```

## Listen to {@link Chat#event:$"."offline"."disconnect| ```$.offline.disconnect``` } Event

A {@link Chat#event:$"."offline"."disconnect| ```$.disconnected``` } event is emitted towards the user when they are successfully disconnected from the chat room. The user can listen to the event to execute additional business logic upon {@link Chat#leave| ```chat.leave()``` }.

```js
chat.on('$.disconnected', () => {
    done();
});
```
