## Namespaces

Event names follow a pattern that helps determine where an object originated.

### Custom Events

Custom events are events you define in your framework, like ```message``` and ```invite```. They are simply strings, but they should not include any special characters (except ```.```).

### $ - System Events

System events always begin with a ```$```. ```$.ready``` and ```$.online``` are examples of events emitted by ChatEninge. They are system events that are automatically emitted when specific things happen. System events are documented in the reference.

### $plugin - PLugin Events

Plugin events always begin with ```$pluginName```. ```$typingIndicator.startTyping``` is an example of an event emitted by a plugin. The ```$typingIndicator``` string is a plugin namespace and ```startTyping``` is the plugin event. Namespacing plugins helps ensure that there is no collision between plugins.

### Event Children

Dots (```.```) in an event name indicate that the event is a child of some parent. For example ```image.like``` indicates that a "like" event was fired for a specific "image". You could then subscribe to all ```image``` events by subscribing to the ```image.*``` event. See more about wildcards below.

## Wildcard

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

Wildcards also work within namespaces. For example, you could subscribe to all system events with ```$.*``` or get notified of all plugin events by subscribing to ```$plugin.*```.

### All Events Everywhere

All events any object in ChatEngine fires is also emitted from the ChatEngine object. You can get notified of every event by subscribing to ```ChatEngine.onAny()```.

This is helpful for debugging and notifying frameworks like Angular when the GUI needs to be updated.

```js
ChatEngine.onAny(function(event, payload) {
    console.log('something happened', event, payload);
});
```
