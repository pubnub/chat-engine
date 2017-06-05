# Table of Contents
<!-- MarkdownTOC -->

- Quick Setup
    - Create Instance
    - Connect to OCF Network
- Using OCF
    - Create a Chat
    - Send a message to Chat
    - Receive a message from Chat
    - Create a bot that automatically replies to a message
    - Subscribing to wildcard events
- Classes
    - Chats
    - Users
    - Me
- Plugins
    - Event Middleware Plugin
    - Registering Plugin
- Server Side Logic
- Development
    - Install Rltm
    - Install dependencies
    - Run Stephen Bot
    - Load up example chat page
- Develop / Build for Web

<!-- /MarkdownTOC -->

# Quick Setup

## Create Instance

There are two require fields for initializing OCF.

* ```pubnub``` - Your PubNub configuration.
* ```globalChannel``` - This is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.

### Create

```js
const OCF = OpenChatFramework.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
```

## Connect

Now we're going to connect to the PubNub network. In order to connect, we need to identify ourselves to the network.

```
me = OCF.connect(uuid, {username: username});
```

The parameter ```uuid``` is a unique identifier for this client. It can be a user name, user id, email, etc.

The second parameter is a JSON object containing information about this client. This JSON object is sent to all other clients on the network, so no passwords!

This instance of OCF will make all further requests on behalf of the ```uuid``` you supplied. This is commonly called ```me```.

# Using OCF

## Create a Chat

Once OCF is set up, creating and connecting to a chatroom is as simple as:

```js
let chat = new OCF.Chat('channel');
```

This will automatically connect to the chat room.

## Send a message to Chat

You can send a message to the chat by using the ```send()``` method to broadcast an event over the network.

```js
chat.emit('message', 'my message');
```

The first parameter is the event to send, and the second parameter is the message payload.

## Receive a message from Chat

You can listen for messages from the chat by subscribing to the ```message``` event using the ```on()``` method. This works over the network, so it'll catch events sent from other clients. That's the whole point right ;)

```js
chat.on('message', (payload) => {
    alert('message: ', payload.data.text);
});
```

The first parameter is the ```event``` you're listening for. Some event names are reserved (more on that later), but for the most part they can be anything.

The ```payload``` in the event callback is not the raw data you supplied while using ```send```. The payload is augmented with the ```Chat``` that the message was sent from, and the ```User``` that sent it (as defined in ```OCF.connect()```).

```js
{
    chat: Chat,
    data: {
        text: 'my message'
    },
    sender: User
}
```

## Create a bot that automatically replies to a message

Creating a bot is super easy and we can do it using everything we learned previously.

First, the bot will subscribe to the ```message``` network event.

When a message comes it, it checks the payload to see if the message was sent by itself (to prevent infinite loops).

If it was not sent by itself, it sends a message back to the chatroom repeating the original message that was sent to it.

```js
chat.on('message', (payload) => {

    // make sure this is not a message this client sent myself
    if(payload.user.data.uuid !== me.data.uuid) {

        // send a message back to the chat that sent it
        payload.chat.send('message', {
            text: 'did you say "' + payload.data.text + '"?';
        });

    }

});
```

## Subscribing to wildcard events

You can subscribe to all events a namespace emits by using the ```*``` operator.

```js
chat.on('$ocf.*', (event) => {
});
```

You can get any event a chat emits by using the ```onAny``` method.

```js
chat.onAny(() => {

});
```

# Classes

## Chats

Chats are objects that emit events. You can subscribe to a chat event with ```chat.on('eventName', () => {})``` or fire a new event with ```chat.emit('eventName', {data})```.

You can get a list of users with ```chat.users```.

## Users

Users represent connected clients. Every user has their own public chatroom called ```feed``` which only that user can publish to as well as a room called ```direct``` which only this user can subscribe to.

## Me

A subclass of ```User```. ```Me``` is returned when you run ```OCF.connect```. Me is the only user that allows the client to set it's own state with ```me.update()```.

# Plugins

Plugins can be registered to do cool things with OCF for free.

An plugin is a typical npm module. Here is an example of a plugin that sets a property on
```Me``` called ```float``` which is equal to some random number.

```js
return {
    namespace: '$yourPluginNamespace',
    extends: {
        Me: {
            construct: function() {
                // set the parent's username as random integer
                this.parent.update({
                    float: new Math.random()
                });
            },
            getName: function() {
                return this.parent.state().float;
            }
        }
    }
}
```

Every plugin needs to be kept in some ```namespace``` for reasons that will make sense later :).

The property ```extends``` tells OCF what classes this plugin is going to extend. In this example the plugin is extending ```Me```, and you can see that because the key ```Me``` is supplied.

The object supplied as the value for the key ```Me``` configures new methods for the the ```Me``` object.

The method ```construct``` is a unique method that will be run whenever a new ```Me``` is created. The ```construct``` functions and all functions supplied in the plugin run in the context of the object in which they are extending. We can call ```this.parent``` to get access to the instance of ```Me```.

In the example above we use ```this.parent.update()``` to set a value of the user. This state is set
across the network and all other clients will get notified that this client has a new value.

The method ```getName()``` is a generic method that gets added to all instances of ```Me``` under the namespace ```$yourPluginNamespace```. From outside the plugin, you could call ```Me.$yourPluginNamespace.getName()``` to return the value.

## Event Middleware Plugin

It's also possible to register middleware to run before events are sent or received.

The following example registers a function that runs before the event ```message``` is sent over the network.

```js
// middleware tells the framework to use these functions when
// messages are sent
return {
    namespace: '$yourPluginNamespace',
    middleware: {
        send: {
            message: function(payload, next) {

                // append config.send to the text supplied in the event
                payload.data.text += ' appended';

                // continue along middleware
                next(null, payload);

            }
        }
    }
}
```

The property ```middleware``` tells OCF to run these functions during the event cycle.

The property ```send``` tells OCF to run this specific set of functions before the message
is sent over the network.

The property ```message``` tells OCF to run this function only when the ```send``` event is emitted;

To fire this event, you would do:

```js
chat.send('message', {text: 'something'});
```

Before the event is broadcast to the chat room, the text ```something``` would be run through
the ```message``` function which would turn it into ```something appended```.

The plugin must call the ```next()``` function with the complete payload when complete.

If there was an error, call ```next('there was an error');

## Registering Plugin

Plugins must be configured to work with OCF.

```js
OCF.loadPlugin(OpenChatFramework.plugin.typingIndicator({
    timeout: 5000
}));
```
The config options supplied here are available as the first parameter in the plugin definition.

# Server Side Logic

If you want to do something like fire a SMS on the server side, you can use PubNub blocks.

You can find an example block in [/examples/javascript/pubnub.block.js](/examples/javascript/pubnub.block.js) which sends an sms message using clicksend every time a message is sent to the [raw javascript chat example](/examples/javascript/chat.html).

# Development

## Install Rltm

Rltm must be installed in sibling directory.

```sh
cd ../
git clone https://github.com/pubnub/rltm
```

## Install dependencies

Install gulp and project dependencies.

```sh
npm install
```

## Run Stephen Bot

```sh
node examples/bot.js
```

## Load up example chat page

You can use file or localhost. Supply a username in the query string param to make it work properly.

Example:

```
./open-chat-framework/examples/web.html?username=ian#
```

# Develop / Build for Web

Compiled using browserify through gulp

```sh
npm install only=dev
npm install gulp -g

Run build task and watch for browser

```sh
gulp && gulp watch
```
