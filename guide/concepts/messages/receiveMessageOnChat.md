## Receive messages on chat

The {@link Chat#on| ```chat.on()``` } listener allows users to receive messages in a chat room.

```js
chat.on('message', (payload) => {
    console.log(payload.sender.uuid);
    console.log(payload.data.text);
});
```
