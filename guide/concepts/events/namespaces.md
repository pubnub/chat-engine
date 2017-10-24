## Namespaces

Event names follow a pattern that helps determine where an object originated.

### Custom Events

Custom events are events you define in your framework, like ```message``` and ```invite```. They are simply strings, but they should not include any special characters (except ```.```).

### $ - System Events

System events always begin with a ```$```. For example, {@link ChatEngine#event:$"."ready $.ready} and {@link Chat#event:$"."online"."join $.online.join} are examples of events emitted by ChatEninge. They are system events that are automatically emitted when specific things happen. System events are documented in the reference.

### $plugin - PLugin Events

Plugin events always begin with ```$pluginName```. ```$typingIndicator.startTyping``` is an example of an event emitted by the {@link module:chat-engine-typing-indicator} plugin. The ```$typingIndicator``` string is a plugin namespace and ```startTyping``` is the plugin event. Namespacing plugins helps ensure that there is no collision between plugins.

### Event Children

Dots (```.```) in an event name indicate that the event is a child of some parent. For example ```image.like``` indicates that a "like" event was fired for a specific "image". You could then subscribe to all ```image``` events by subscribing to the ```image.*``` event. See {@tutorial wildcard}.
