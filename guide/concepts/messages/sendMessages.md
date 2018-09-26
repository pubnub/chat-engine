The {@link Chat#emit| ```chat.emit()``` } method allows users to send messages once they are connected to a chat room.

```js
chat.emit('message', {
    text: 'hey'
});
```

## ```Parameters``` for {@link Chat#emit| ```chat.emit()``` }

| Name | Type | Description |
|:----:|:----:|:------------|
| ```event``` | ```String``` | The event name. |
| ```data``` | ```Object``` | The event payload object. |
