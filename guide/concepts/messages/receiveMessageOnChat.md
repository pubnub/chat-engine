## Receive messages on chat

The {@link Chat#on| ```chat.on()``` } listener allows users to receive messages in a chat room.

```js
chat.on('message', (payload) => {
    console.log(payload.sender.uuid);
    console.log(payload.data.text);
});
```

Although you may emit any valid object using {@link Chat#emit| ```chat.emit()``` }, when the same payload is received by other users, the payload is augmented with additional data. The original message can be retrieved by calling ```payload.data```. Users can also call ```payload.chat``` and ```payload.sender``` to display chat room and sender details along with the message.

The sample below shows how to read the contents of a message payload.

```js
{
   "data": {
      "text": "hey"
   },
   "sender": "john-UUID",
   "event": "message",
   "chatengineSDK": "0.9.19"
}
```
## ```Parameters``` for {@link Chat#on| ```chat.on()``` }

| Name | Type | Description |
|:----:|:----:|:------------|
| ```event``` | ```String``` | The event name. |
| ```cb```    | ```function``` | The function to run when the event is emitted. |
