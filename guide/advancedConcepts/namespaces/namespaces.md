{@link Event| ```Event``` } names follow a pattern that helps determine where an object originated.

## Custom Events

Custom events are events you define in your framework, like ```message``` and ```invite```. They are simply ```Strings```, but events should **not** include any special characters (except ```.```).

## ```$``` - System Events

System events always begin with a ```$.``` For example, ```$.ready``` and ```$.online.join``` are examples of events emitted by ChatEngine. They are system events that are automatically emitted when specific things happen. System events are documented in the ChatEngine API reference.

## ```$plugin``` - Plugin Events

Plugin events always begin with ```$pluginName```. ```$typingIndicator.startTyping``` is an example of an {@link Event| ```Event``` } emitted by the [module:chat-engine-typing-indicator](http://www.github.com/pubnub/chat-engine-typing-indicator) plugin. The ```$typingIndicator``` string is a plugin namespace and ```startTyping``` is the plugin ```Event```. Namespacing plugins helps ensure that there are no collisions between plugins.

## Event Children

Dots (```.```) in an event name indicate that the {@link Event| ```Event``` } is a child of some parent. For example ```image.like``` indicates that a "like" ```Event``` was fired for a specific _image_. You could then ```subscribe``` to all _image_ events by subscribing to the ```image.*``` ```Event```. See {@tutorial wildcards}.
