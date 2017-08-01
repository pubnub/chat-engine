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

# Hooking it up to a GUI

## Adding a Textbox

Let's build a textbox that will let us send our own message.

We'll add this line under the ```#log``` container.

```html
<input type="text" class="form-control" id="message" placeholder="Your message here...">
```

And then wrap the ```chat.emit()``` code in a jQuery function.

```js
$("#message").keypress(function(event) {

    if (event.which == 13) {
        chat.emit('message', $("#message").val());
        $("#message").val('');
        event.preventDefault();
    }

});
```

This function fires every time a key is pressed on the message input text area.

If the key is ```13``` (Enter or Return), we use ```chat.emit()``` to broadcast the value of the the text input to all other clients.

The text input is then cleared and we user ```event.preventDefault()``` to prevent the enter or return key from bubbling (allowing other things to happen).

## Send a Message

Now, when you type in the message input and hit "Enter", the message is sent over the network to all other machines!

Render the message by listening for the ```message``` event:

```js
chat.on('message', (payload) => {
  $('#log').append(payload.sender.uuid + ': ' + payload.data + '\n');
});
```

Try it with two browsers!

![](/guide/getting-started/assets/README-316b8bd1.gif)
