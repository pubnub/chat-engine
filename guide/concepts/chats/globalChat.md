{@link ChatEngine.global} is a global {@link Chat} room that all instances of {@link ChatEngine} connect to by default. It is a convenience property that provides some handy utility.

It makes it easy to send a message to all connected clients:

```
ChatEngine.global.send('message', 'Sale going on now!');
```

We also get a list of all online users connected to this instance of ChatEngine.

```js
// everyone online in all chatrooms
console.log(ChatEngine.global.users);
```

So how does it work?

* All {@link User}s connect to ChatEngine.global by default (during {@link ChatEngine#connect})
* {@link Me#update} and {@link User#state} operates using {@link ChatEngine#global}. See: {@tutorial users}
