ChatEngine generates {@link Chat#event:$"."online"."here| ```$.online.*``` } and {@link Chat#event:$"."offline"."disconnect|  ```$.offline.*``` } events for each user when they {@link Chat#event:$"."online"."join| ```join``` } or {@link Chat#event:$"."offline"."leave| ```leave``` } chat rooms. These events can be consumed by other users in the chat room to show ```online```/```offline``` status.

- When a new user joins a chat room, a  {@link Chat#event:$"."online"."join| ```$.online.join``` } event is emitted.
- When an existing user joins a chat room, a {@link Chat#event:$"."online"."here| ```$.online.here``` } event is emitted.
- When a user intentionally {@link Chat#leave| leaves } a chat room, a {@link Chat#event:$"."offline"."leave| ```$.offline.leave``` } event is emitted.
- When a user loses network connectivity, a {@link Chat#event:$"."offline"."disconnect| ```$.offline.disconnect``` } event is generated.

Listen to {@link Chat#event:$"."online"."join| ```$.online``` } events

```js
ChatEngine.on('$.online.*', (payload) => {
    appendMessage('Status', payload.user.uuid + ' is in this room!');
});
```

Listen to {@link Chat#event:$"."offline"."disconnect| ```$.offline``` } events

```js
chat.on('$.offline.*', (payload) => {
    console.log('User left the room:', payload.user);
});
```
