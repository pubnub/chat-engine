The {@link Chat#on| ```chat.on()``` } listener allows you to receive messages in a chat room.

```js
chat.on('message', (payload) => {
    console.log(payload.sender.uuid);
    console.log(payload.data.text);
});
```

Although you may send any valid object using {@link Chat#emit| ```chat.emit()``` }, when the same ```payload``` is received by other users, it is augmented with additional data. The original message can be retrieved by calling ```payload.data```. You can also call ```payload.chat```  and ```payload.sender``` to display chat room and sender details along with the message.
