## Disconnect from ChatEngine

The {@link ChatEngine#disconnect| ```disconnect()```} method allows you to disconnect
 a user from ChatEngine. You should call the method before exiting the application so 
 connections with PubNub are closed gracefully. 

```js
ChatEngine.disconnect();
```
