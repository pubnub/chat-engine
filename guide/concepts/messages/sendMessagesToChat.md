## Send Messages on Chat

The {@link Chat#emit| ```chat.emit()``` } method allows users to send messages once they are connected to a chat room.

```js
chat.emit('message', {
    text: 'hey'
});
```

Although you may emit any valid JSON using {@link Chat#emit| ```chat.emit()``` }, when the same event is received by other users, it is augmented with additional data. The property {@link Chat#param:emit#data| ```chat.data``` } (i.e. payload) is the chat that event was broadcast broadcast on, and the payload.sender is the user that broadcast the message.

Below sample shows how you can read contents of a message payload.

```js
{
   'data':{
      'text':'hey'
   },
   'sender':'john-UUID',
   'event':'message',
   'chatengineSDK':'0.9.19'
}
```
