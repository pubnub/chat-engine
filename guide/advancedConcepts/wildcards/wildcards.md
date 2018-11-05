You can get notified of every event that a ChatEngine ```Object``` emits by subscribing to the ```*``` wildcard {@link Event| ```Event``` } or using the ```.onAny()``` method.

```js
Chat.on('*', (event, payload) => {
    console.log('something happened', event, payload);
});
Chat.onAny((event, payload) => {
    console.log('something happened', event, payload);
});
```

## Namespaced Wildcards

Wildcards also work within {@tutorial namespaces}.

### SYSTEM EVENTS
You could subscribe to all system events with ```$.*```. See {@tutorial namespaces}.

### PLUGINS

You can get notified of all plugin events by subscribing to ```$plugin.*```.

## All Events Everywhere

All events fired by an ```Object``` in ChatEngine are also emitted from the ChatEngine ```Object```. You can get notified of every ```Event``` by subscribing to ```ChatEngine#onAny```.

This is helpful for debugging and notifying frameworks like [Angular](https://angularjs.org/) when the GUI needs to be updated.

```js
ChatEngine.onAny(function(event, payload) {
    console.log('something happened', event, payload);
});
```
