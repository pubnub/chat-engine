{@link ChatEngine} generates {@link Chat#event:$"."online"."join ```$.online```} and  {@link Chat#event:$"."offline"."disconnect ```$.offline```} events when users ```join``` or {@link Chat#leave ```leave```} chat rooms. These events can be consumed by other users in the chat room to show ```online```/```offline``` status indicators.

- When a new user joins a chat room, a {@link Chat#event:$"."online"."here|  ```$.online.here``` } event is emitted.
- When an existing user joins a chat room, a {@link Chat#event:$"."online"."join|  ```$.online.join``` } event is emitted.
- When a user intentionally leaves a chat room, a {@link Chat#event:$"."offline"."leave|  ```$.offline.leave``` } event is emitted.
- When a user loses network connectivity, a {@link Chat#event:$"."offline"."disconnect|  ```$.offline.disconnect``` } event is generated.

## Listen to {@link Chat#event:$"."online"."join ```$.online```} Events

```js
ChatEngine.on('$.online.*', (payload) => {
  appendMessage('Status', payload.user.uuid + ' is in this room!');
});
```

## Listen to {@link Chat#event:$"."offline"."disconnect ```$.offline```} Events

```js
chat.on('$.offline.*', (data) => {
    console.log('User left the room:', data.user);
});
```
