## Disconnect from ChatEngine

The client needs to {@link ChatEngine#disconnect| ```disconnect()```} from ChatEngine and close all open connections with PubNub gracefully before closing the application.

```js
ChatEngine.disconnect();
```
