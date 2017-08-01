ChatEngine.globalChat is a global {@link Chat} room that all instances of {@link ChatEngine} connect to by default.
It is a convenience property that provides some handy utility.

It makes it easy to send a message to all connected clients:

```
ChatEngine.globalChat.send('message', 'Sale going on now!');
```

We also get a list of all online users connected to this instance of ChatEngine.

```js
// everyone online in all chatrooms
console.log(ChatEngine.globalChat.users);
```

So how does it work?

* All {@link User}s connect to ChatEngine.globalChat by default (during ```connect()```)
* User.state() and Me.update() use ChatEngine.globalChat as the default input. See: {@tutorial users}
