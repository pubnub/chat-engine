## Reconnect to ChatEngine

If the ```autoNetworkDetection``` flag is set to ```true``` when ChatEngine is initialized,
the client will receive  ```$.network.down.*``` and ```$.network.up.*``` events when the
browser detects network changes.

The {@link ChatEngine#reconnect| ```reconnect()```} method allows you to reconnect a user 
to ChatEngine when the ```$.network.up``` event is received and the network connection is
stored. 

```js
ChatEngine.on('$.network.up.*', (data) => {
    //reconnect to ChatEngine
    ChatEngine.reconnect();
});
```

### Reconnect to Existing Chats

ChatEngine automatically reconnects the user to existing chats if the 
```enableSync``` flag is set to ```true``` when ChatEngine is initialized. You can 
use ```ChatEngine.me.session.chats``` to retrieve a list of chats that the user
has connected to before. The list is kept in sync as users join and leave
chat rooms.

```js
ChatEngine.me.session.on('$.group.restored', (payload) => {
    if (payload.group === 'default') {
        console.log('Chats:', ChatEngine.me.session.chats);
    }
});
```
