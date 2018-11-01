When developing with ChatEngine, errors will be reported to let the developer know when things go wrong. By default, errors are emitted both as a {@link Chat#event:$"."error"."history| ```$.error``` } and as an {@link Event| ```Event``` } from the object that is responsible, and bubbled via throw.

## Thrown Errors
You'll notice thrown errors because they usually break Javascript execution and log a stack trace within the console.

## Errors as {@link Event| Events }
You can also subscribe to errors via the ```$.error``` ```Event```. If you'd like to subscribe to all ChatEngine errors, try the following:

```js
ChatEngine.on('$.error.*', (payload) => {
   console.log(payload);
});
```

## Errors in Production
In a production app, it is **not** a good idea to throw errors. If a developer wants to suppress errors, supply ```{ 'throwErrors' : false }``` in the ```ceConfig``` used to initialize ChatEngine.

## Example Error
Below are the errors thrown when a client tries to access a chat you don't have access to.

```js
let PrivateChat = new ChatEngine.Chat('locked-down-i-dont-have-permissions');
```

A private chat emits these events:
   * ```$.error.presence```
   * ```$.error.publish```

ChatEngine emits this event:
   * ```$.network.denied```
