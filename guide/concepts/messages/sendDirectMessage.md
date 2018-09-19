## Send direct message to user

While users can send messages to other users by creating private chat rooms, they can also send direct messages to other users on their direct channels. For instance, in the example below, you can connect to Adam’s direct channel and send a private message.

```js
adam = ChatEngine.users['adam'];
adam.direct.connect();
adam.direct.emit('private-message', { text: 'hello buddy!' });
```

Other users can call chat.on listener on their own direct channel to receive incoming messages.

```js
me.direct.on('private-message', (payload) => {     
	console.log(payload.sender.uuid, 'sent your a direct message');    
	console.log(payload.data.text);
});
```

> A user only has write permissions to another user’s direct channel and will not be able to add a listener to receive messages on the chat.
