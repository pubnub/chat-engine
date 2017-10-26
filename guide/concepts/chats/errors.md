When developing with ChatEngine, errors will occasionally be reported to let you know when things go wrong.

By default, errors are both emitted as ```$.error``` events from the object that is responsible and bubbled via ```throw```.

## Thrown Errors

You'll notice thrown errors because they usually break Javascript execution and log a stack trace within the console.

## Errors as Events

You can also subscribe to errors via the ```$.error``` event. If you'd like to subscribe to all ChatEngine errors, try the following:

```js
ChatEngine.onAny('$.error.*', (payload) {
   console.log(payload);
});
```

## Errors in Production

In a production app, it is not a good idea to throw errors. If you'd like to suprress errors, supply ```throwErrors: false``` in your ```ceConfig```.

### Example Errors

These are the errors thrown when a client tries to access a {@link Chat} you don’t have PAM access to (see {@link privacy}):

```js
let PrivateChat = new ChatEngine.Chat(‘locked-down-i-dont-have-permissions’);
```

Private Chat Emits These Events
* $.error.presence
* $.error.publish

ChatEngine emits this event:

* $.network.denied
