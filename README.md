# OCF - Open Chat Framework

With OCF you can build Slack/Flowdock/Discord and also Skype/Snapchat/WhatsApp. The serverless component runs Socket.IO and optional PubNub microservices. Advanced capabilities with modular Add-ons system. Using PubNub BLOCKS and Socket.IO/Node.JS add-ons for user-mention notifications and data privacy with encryption.

# Notes

Open Chat Framework is currently under development. The API is subject to change.

# Examples

## Client Examples

* [Javascript](/examples/javascript/)
* [jQuery](/examples/jquery/)
* [Angular](/examples/angular/)
* [React](/examples/react/)
* [Facebook Login](/examples/3rd-party-login/facebook.html)
* [NodeJS ChatBot](/examples/bot.js)

## Plugins

* [Middleware](/plugins/append.js)
* [Message History](/plugins/messageHistory.js)
* [Search Online Users](/plugins/onlineUserSearch.js)
* [Set a Random Username](/plugins/randomUsername.js)
* [Ian Is Typing... Indicator](/plugins/typingIndicator.js)

## Other usage examples

[Test.js](test.js) includes some usage examples

# Docs

<!-- MarkdownTOC -->

- Quick Setup
- Using OCF
- Events
    - plugin events
    - Subscribing to wildcard events
- Classes
    - Root
    - Chats
    - Users
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

Config OCF to work with socket.io or pubnub and set a root channel name:

```js
let OCF = OpenChatFramework.create({
    rltm: {
        service: 'socketio', 
        config: {
            endpoint: 'http://localhost:8000',
        }
    },
    globalChannel: 'ocf-root-channel'
});
```

Or use PubNub:

```js
const OCF = OpenChatFramework.create({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'YOUR_PUB_KEY',
            subscribeKey: 'YOUR_SUB_KEY'
        }
    },
    globalChannel: 'ocf-javascript-demo'
});
```

Connect to the server as some user.

```
me = OCF.connect(uuid, {username: username});
```

# Using OCF

Once OCF is set up, creating and connecting to a chatroom is as simple as:

```js
let chat = new Chat('channel');
```

You can send a message to the new chat by defining a new message event.

```js
chat.send('message', 'my message');
```

And you can listen for message from the chat with:

```js
chat.on('message', (payload) {
    alert('message: ', payload.data.text);
});
```

The ```payload``` in the event callback includes some handy properties:

```js
{
    chat: Chat,
    data: {
        text: 'my message'
    },
    sender: User
}
```

To create a bot that automatically replies to messages:

```js
chat.on('message', (payload) {
    
    // make sure this is not a message this client sent myself
    if(payload.user.data.uuid !== me.data.uuid) {

        // send a message back to the chat that sent it
        payload.chat.send('message', {
            text: 'did you say "' + payload.data.text + '"?';
        });

    }

});
```

Get a list of all users in a chat.

```js
console.log(chat.users);
```

Directly message another user.

```js
chat.users[0].direct.send('private-invite', {
    meetingPlace: 'our-secret-channel'
});

let privateChat = new OCF.Chat(payload.data.meetingPlace);
```

Create a new chat when invited.

```js
me.direct.on('private-invite', (payload) => {
    let privateChat = new OCF.Chat(payload.data.meetingPlace);
});
```
# Events

## plugin events

All plugins use the ```$``` character followed by their namespace.

```
$pluginName.eventName
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


## Root

### OCF

An event emitter that emits all events emitted from any new classes.

```js
// log every event ever
OCF.onAny((event) => {
    console.log(event);
});
```

## Chats

Chats are objects that emit events. You can subscribe to a chat event with ```chat.on('eventName', () => {})``` or fire a new event with ```chat.emit('eventName', {data})```.

You can get a list of users with ```chat.users```.

### Chat

An instance of a chat room. Any event published to this chat will reach all other
users in the chat.

### GlobalChat

The global chat channel that all users join. Stores the user's state properties and provides a
global online list.

### Chat Events

#### $ocf.user

Emitted when a user joins the chat

#### $ocf.leave

Emitted when a user leaves the chat

## Users

Users represent connected clients. Every user has their own public chatroom called ```feed``` which only that user can publish to as well as a room called ```direct``` which only this user can subscribe to.

### User

A generic user. ```user.states``` includes all custom set data.

### Me

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
