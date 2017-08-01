# Plugin.js

Check out {@link module:chat-engine-markdown} and {@link module:chat-engine-typing-indicator} for some examples of plugins.

## What is a pugin?

A plugin is a NodeJS module that exports a mixin like object that augments ChatEngine objects.

# Plugin Anatomy

The plugin entry file must be a file called ```plugin.js``` in the root directory.
From this file you can require any other file as normal, but the entry must be
plugin.js

Every plugin must return an object containing the property ```namespace``` and ```middleware```
or ```extends```.

You can also ChatEngine objects and add new methods to them. For example,
this plugin adds a method called ```newMethod()``` to the {@link Chat} class.

```js
// newmethod/plugin.js
module.exports - {
    return {
        extends: {
            Chat: {
                construct: (options) => {
                    // this is called when the pugin is attached to the Chat
                    // the Chat object is available through this.parent
                    console.log('I am extending', this.parent, 'with options', options);
                },
                newMethod: () => {
                    // this is a new method that gets attached to Chat as Chat.newMethod()
                    console.log('New Method Fired - this Chat object is available as this.parent');
                }
            }
        }
    }

}
```

Then you can attach the plugin to a {@link Chat} like this:

```js
// include the plugin via require
newMethodPlugin = require('newmethod/plguin.js');

// create a chat for the plugin to attach to
chat = new ChatEngine.Chat('my-plugin-chat');

// attach the plugin to the chat
// newMethodPlugin.construct() is called and console log is fired
chat.plugin(newMethodPlugin({
    myparam: true
}));

// Console: I am extending ChatEngine.Chat with options {myParam: true}

chat.newMethod();

// Console: 'New Method Fired - this Chat object is available as this.parent

```

When the plugin is installed, every instance of ```ChatEngine.Chat``` will have a new
method called ```newMethod()```. You can call the method like ```someChat.newMethod()```.


# Middleware

Middleware allows you to transform payloads as they travel through the system.
They are executed in order they are assigned.

The only valid properties of the ```middleware``` object are ```send``` and ```broadcast```.

* ```send``` is executed before the payload is sent over the
network to the rest of the connected clients.
* ```broadcast``` is executed when the client receives a payload from another
client.

```js
// timer/plugin.js
module.exports = (config) => {

    return {
        middleware: {
            send:
                message: (payload, next) => {
                    payload.sentTime = new Date();
                    next(err, payload);
                }
            },
            broadcast:
                message: (payload, next) -> {
                    payload.receiveTime = new Date();
                    next(err, payload);
                }
            }
        }
    };

}
```

The sub properties under ```send``` and ```broadcast``` are the events
that will trigger the transformation.

For  example, the plugin above will be executed when a ```message```
event is sent from the client.

```js
// include the plugin via require
timerPlugin = require('timer/plugin.js');

chat.plugin(timerPlugin());


// send a message
someChat.send('message', {text: "This triggers the send method before it's published over the wire.});

// timerPlugin.middleware.send.message() is executed
// payload.sentTime is added to the payload

// when message is received
// timerPlugin.middleware.broadcast.message() is executed
someChat.on('message', (payload) => {

    // payload has been modified by the broadcast() method before this was called
    // payload.receiveTime has been added by the plugin
    console.log(payload.receiveTime);

});
```
