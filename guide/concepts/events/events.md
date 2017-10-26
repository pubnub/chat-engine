Events are the life-blood of ChatEngine. Events let us know when other {@link User}s do thing in our {@link Chat}.

ChatEngine emit's some events automatically. All ChatEngine events start with ```$```, see {@tutorial namespaces} for more on that.

Our custom events can be any string, like ```message``` or ```like```. Let's define a custom event so we can send and receive text messages between windows.

## Emitting Events to Users in a Chat

First, let's ```emit()``` a simple text string as a ```message``` event over the {@link Chat}. See {@link Chat#emit} for more.

```js
chat.emit('message', 'Hey, this is Ian!');
```

This will broadcast the ```message``` event over the internet to all other clients. Subscribe to the event using {@link Chat#on} to get notified of the event.

## Subscribing to Events

You can subscribe to custom events by supplying any string as first parameter in ```on()````. The second parameter is a callback function that will be run whenever the event is emitted by ANY other user in the same {@link Chat}.

```js
chat.on('message', (payload) => {
  console.log(payload.sender.uuid, payload.data);
});
```

Anytime your or any other client uses the ```emit()``` function with the same event name, it will fire the callback defined in ```on()``` on every client subscribed to it.

Curious about ```payload.sender``` and ```payload.data```? See {@tutorial payload}.

![](/guide/getting-started/assets/README-316b8bd1.gif)
