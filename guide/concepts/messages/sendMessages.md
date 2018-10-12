The {@link Chat#emit| ```chat.emit()``` } method allows you to send messages once a {@link User| ```user``` } is connected to a chat room. In the code below, ```‘message’``` is the event name and the ```{text: 'hey'}``` object is the event payload.

```js
chat.emit('message', {
    text: 'hey'
});
```
