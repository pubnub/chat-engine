You can get notified of every event that a ChatEngine object emits by subscribing to the ```*``` wildcard event or using the ```onAny``` method.

```js
Chat.on('*', (event, payload) => {
    console.log('something happened', event, payload);
});
Chat.onAny((event, payload) => {
    console.log('something happened', event, payload);
});
```

### Namespaced Wildcards

Wildcards also work within namespaces.

#### System Events

You could subscribe to all system events with ```$.*```. See {@tutorial namespaces}.

#### Plugins

You can get notified of all plugin events by subscribing to ```$plugin.*```.

### All Events Everywhere

All events any object in ChatEngine fires is also emitted from the ChatEngine object. You can get notified of every event by subscribing to {@link ChatEngine#onAny}.

This is helpful for debugging and notifying frameworks like Angular when the GUI needs to be updated.

```js
ChatEngine.onAny(function(event, payload) {
    console.log('something happened', event, payload);
});
```
