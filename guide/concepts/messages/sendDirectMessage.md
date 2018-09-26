While users can send messages to other users by creating private chat rooms, they can also send private messages to other users in their {@link User#direct| ```direct``` } chat channels.

For instance, in the example below, you can connect to Adam’s {@link User#direct| ```direct``` } channel and send a private message.

```js
adam = ChatEngine.users['adam'];
adam.direct.connect();
adam.direct.emit('private-message', {text: 'hello buddy!'});
```

Adam can call {@link Chat#on| ```chat.on()``` } on his own {@link Me#direct| ```Me.direct``` } channel to receive incoming messages.

```js
me.direct.on('private-message', (payload) => {     
	console.log(payload.sender.uuid, 'sent your a direct message');    
	console.log(payload.data.text);
});
```

> A user only has write permissions to another user’s direct channel and will not be able to add a listener to receive messages on the chat.
