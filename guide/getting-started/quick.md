This is a simple tutorial that explains ChatEngine as quickly as possible.

Before following this guide, be sure to follow the setup instructions found in {@tutorial install} and {@tutorial pubnub} tutorials.

We'll be creating a simple chat lobby where you can see who's online and invite one another to private chats.

## Connection

First, we need to connect to {@link ChatEngine} via {@link ChatEngine#connect}.
The values input into {@link ChatEngine#connect} create a new {@link User} called
{@link Me} that this client will act as.

```js
ChatEngine.connect('ian', {team: 'red'});
```

This will connect to {@link ChatEngine} with {@link Me#uuid} equal to "ian a {@link Me#state} of ```{team: red}```.

## The $.ready event

Because {@link ChatEngine} must do some work to connect to the server, we must wait for it to respond before
working with {@link Chat}s and {@link User}s.

When {@link ChatEngine} is ready, it will emit {@link ChatEngine#event:$"."ready $.ready}. We can subscribe to this event with {@link ChatEngine#on}.

```js
ChatEngine.on('$.ready', (data) => {
    console.log('ChatEngine ready to go!');
});
```

The ```$``` represents a "system" event. You can read more about system events in the tutorial on {@tutorial namespaces}. You can subscribe to all system events via ```ChatEngine.on('$.*')```, read more in the tutorial on {@tutorial wildcard}.

## Me

When {@link ChatEngine#on} is fired, {@link Me} is supplied as ```data.me``` in the response.

```js
ChatEngine.connect('ian', {team: 'red'});
ChatEngine.on('$.ready', (data) => {
    let me = data.me; // ian
});
```

All calls made to {@link ChatEngine} are made on behalf of {@link Me}.

## Chats

Let's create {@link Chat} for us to join. We'll make a {@link Chat} through
which our users can communicate.

```js
let lobby = new ChatEngine.Chat('lobby');
```

This will create a new {@link Chat}. We'll be connected to it automatically.

## Users

So how do we see other other people online? Well {@link Me} is automatically
recorded as joining our {@link Chat}, and any other person who runs this program
will see 'ian' as a {@link User} online on the {@link Chat}.

You can get a list of online users via {@link Chat#users}.

```js
console.log(lobby.users);
```

Will output:

```
{
    ian: {
        // this is a User objet
    }
}
```

If we were to open another window and connect as 'stephen', we would see
'stephen' in ```lobby.users```.

ChatEngine.connect('stephen', {team: 'blue'});

Let's chat with ```stephen```.

## Sending Messages

In order to chat, all we need to do is use the {@link Chat#emit} method to
send a message over the internet to all other clients who have the program running.

```js
lobby.emit('message', {
    text: 'hey'
});
```

The first parameter, ```message```, is an event name that is just a string identifier. It helps us
tell the difference between different events. See {@tutorial events} {@tutorial namespaces} and {@tutorial wildcard} for more.

The second parameter is a JSON string that represents the message payload. This data
is sent over the internet to all subscribing parties.

## Listening for Messages

We can get notified a new message by using {@link Chat#on}. The ```text``` value
is available as ```payload.data.text```.

```js
lobby.on('message', (payload) => {
    console.log(payload.data.text)
});
```

We can also get the {@link User} that sent the ```message``` and the {@link Chat} the
message was sent to. For more on this, see {@tutorial payload}.

```js
lobby.on('message', (payload) => {
    console.log(payload.sender.uiud, 'sent a message to', payload.chat.channel, 'with value', payload.data);
});
```

## State

But hey, what if we want more information about the user that sent the ```message```. Remember how we supplied
```{team: 'red'}``` during {@link ChatEngine#connect}?

```js
ChatEngine.connect('ian', {team: 'red'});
```

We can get that value with {@link User#state}. This value will be the same
on every machine because state is synced between everybody.

```js
lobby.on('message', (payload) => {
    console.log(payload.sender.uuid, 'sent a message', payload.data.text);
    console.log('they are on team', payload.sender.state.team);
});
```

## Private Chat

What if we want to invite ```stephen``` into a private chat? We can find
```stephen``` from our list of users in the lobby. See {@link Chat#users}

We can use ```stephen```'s uuid to get his {@link User}.

```js
let stephen = lobby.users['stephen'];
```

Ok, let's make a new chat and invite him to it. We'll create a new {@link Chat}
and then fire the {@link Chat#invite} which invites a {@link User} to a {@link Chat}.

```js
let privateChat = new ChatEngine.Chat('private');
privateChat.invite(stephen);
```

So how does ```stephen``` know that he got invited? {@link Chat#invite} sends
```stephen``` a direct message that nobody else can see over a special {@link Chat}
called {@link User#direct}.

```stephen``` can find out when someone invites him by subscribing to the ```$.invite``` event
via {@link Me#direct}. The key for the new chat that we created is available as ```payload.data.channel```.

```js
me.direct.on('$.invite', (payload) => {

    let invitedChat = new $scope.ChatEngine.Chat(payload.data.channel);

    invitedChat.emit('message', {
        text: 'hello everybody!'
    });

});
```

## Using Plugins

What if we want to support [Markdown](https://en.wikipedia.org/wiki/Markdown) in our messages? We can use a ChatEngine plugin. Plugins are loaded via the {@link Chat#plugin}, {@link User#plugin}, or {@link Me#plugin}.

First we include it in the script.

```js
let ceMarkdown = require('chat-engine-markdown');
```

Then we create a new {@link Chat} and attach the plugin to it via {@link Chat#plugin}.

```js
let pluginchat = new ChatEngine.Chat('markdown-chat');
pluginchat.plugin(ceMarkdown({}));
```

And now, when someone sends a message via {@link Chat#emit}...

```
pluginchat.emit('message', {
   text: 'This is some *markdown* **for sure**.'
});
```

The markdown plugin will parse markdown and replace it as HTML.

```js
pluginchat.on('message', (payload) => {
   // payload.data.text == 'This is some <em>markdown</em> <strong>for sure</strong>.'
});
```

Check out the tutorials on {@tutorial using} and how {@tutorial build}.

## Hooking it up to a template

ChatEngine is the back end to your chat app and does not include a template system. However, the
event based system and data synchronization make it super easy to hook into
a template system.

Check out the guide on {@tutorial templating} and our examples of working with different frameworks:

* {@tutorial ng-simple}
* {@tutorial jq-kitchen}
* {@tutorial chat}
* {@tutorial online}
* {@tutorial react-simple}
* {@tutorial react-native}
