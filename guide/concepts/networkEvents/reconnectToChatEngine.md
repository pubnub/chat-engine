## Reconnect to ChatEngine

The client will receive  $.network.down and $.network.up events when the browser detects network activity if autoNetworkDetection flag is set to true when ChatEngine is initialized.

The client should reconnect to ChatEngine when the network connection is restored. This method will reconnect a user to its chats automatically.

```js
ChatEngine.on('$.network.up.*', (data) => {
    //reconnect to ChatEngine
    ChatEngine.reconnect();
});
```
### Reconnect to Existing Chats

ChatEngine automatically reconnects a user to existing chats if {@link ChatEngineCore|  ``` {"ceConfig": { "enableSync": true}} ```} flag is set to true when ChatEngine is initialized. Once the user is reconnected, a list of active chats can be retrieved by calling ```ChatEngine.me.session.chats```.

```js
ChatEngine.me.session.on('$.group.restored', (data) => {
    if (data.group === 'default') {
        console.log('Chats:', ChatEngine.me.session.chats);
    }
});
```
