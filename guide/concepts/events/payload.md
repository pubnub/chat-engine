## Event Payload

Although you may emit any valid JSON using {@link Chat#emit}, when the same
event is received by other {@link User}s, it will be augmented with additional
data.

```js
{
    user: ChatEngine.User(),    // the User responsible for emitting the message
    chat: ChatEngine.Chat(),    // the Chat the event was broadcast over
    data: {}                    // anything sent to Chat.emit() shows up here
}
```

You can find the actual message contents supplied to {@link Chat#emit} within the ```payload.data``` property.

ChatEngine event payloads are augmented with additional information supplied by the framework. Most of the time these are ```payload.sender``` and ```payload.chat```.

The property ```payload.chat``` is the {@link Chat} that event was broadcast broadcast on, and the ```payload.sender``` is the {@link User} that broadcast the message via {@link Chat#emit}.

The {@link User} and {@link Chat} properties are both fully interactive instances. Therefor, you can do things like ```payload.chat.emit('message')``` to automatically reply to a message.

## Simple Example

In this demo we'll mock up a user named 'Ian' emitting the 'like' event on a user named 'Alex'.

On Ian's page:

```js
// connect with UUID 'ian' and add a user state
ChatEngine.connect('ian');

ChatEngine.on('$.ready', (data) => {

    data.me.update({fullName: 'Ian Jennings'});

    // emit a 'like' event over global chat
    ChatEngine.global.emit('like', {
        who: 'alex'
    });

});
```

On Alex's page:

```js
// connect with UUID 'alex'
ChatEngine.connect('alex');

// when we received a 'like' event on global chat
ChatEngine.global.on('like', (payload) => {

    // if that event matches 'alex'
    if(payload.data.who == 'alex') {

        // opens an alert that says "ian likes you!""
        alert(payload.sender.uuid + ' likes you!');

        // Log 'Ian Jennings' from Ian's state
        console.log('His full name is', payload.sender.state().fullName);

        // Get all the other users in the chat that emitted this event
        console.log('Other users who saw this are', payload.chat.users);

    }

});
```
