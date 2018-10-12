While users can send messages to other users by creating private chat rooms, they can also send private messages to other users through users’ {@link User#direct| ```direct``` } chat rooms.

For instance, in the example below, the user can connect to Adam’s direct chat and send a private message.

```js
adam = ChatEngine.users['adam'];
adam.direct.connect();
adam.direct.emit('message', {text: 'hello buddy!'});
```

Adam can call {@link Chat#on| ```chat.on()``` } on his own direct chat to receive incoming messages.

```js
me.direct.on('message', (payload) => {     
    console.log(payload.sender.uuid, ' sent you a direct message');    
    console.log(payload.data.text);
});
```

Users only have write permissions to other users’ direct chat and cannot add a listener to receive messages on the chat.
