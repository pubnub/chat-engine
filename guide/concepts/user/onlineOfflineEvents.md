## Online and offline events

{@link ChatEngine} generates ```$.online.*``` and ```$.offline.*``` events when users join or leave chat rooms. These events can be consumed by other users in the chat room to show online/offline status indicators.

When a new user joins a chat room, a {@link Chat.online.here| ```$.online.here``` } event is emitted.

- When an existing user joins a chat room, a ```$.online.join``` event is emitted.
- When a user intentionally leaves a chat room, a ```$.offline.leave``` event is emitted.
- When a user loses network connectivity, a ```$.offline.disconnect``` event is generated.

### Listen to ```$.ONLINE``` events

```js
ChatEngine.on('$.online.*', (payload) => {
  appendMessage('Status', payload.user.uuid + ' is in this room!');
});
```

### Listen to ```$.OFFLINE``` events

```js
chat.on('$.offline.*', (data) => {
    console.log('User left the room:', data.user);
});
```
