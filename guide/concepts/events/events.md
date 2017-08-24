Let's define a custom event so we can send and recieve text messages between windows.

## Broadcasting Events

First, let's ```emit()``` a simple text string as a ```message``` event over the ```Chat```.

```js
chat.emit('message', 'Hey, this is Ian!');
```

This will broadcast the ```message``` event over the internet to all other clients.

## Subscribing to Events

You can subscribe to custom events by supplying an event name as first parameter in ```on()````.

```js
chat.on('message', (payload) => {
  console.log(payload.sender.uuid, payload.data);
});
```

Anytime your or any other client uses the ```emit()``` function with the same event name, it will fire the callback defined in ```on()``` on every client subscribed to it.

![](/guide/getting-started/assets/README-316b8bd1.gif)
