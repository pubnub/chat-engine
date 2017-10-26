It's possible to use awesome PubNub Functions with ChatEngine.

## Event Type

Create a new PubNub function. Select ```Before Publish or Fire``` as the
function event type.

## Channel

In the channel, enter in the chat channel you'd like to trigger the Function.
Wildcard ```*``` selection is allowed.

To run a function on all public chats (most popular), enter
```chat-engine#chat#public.*``` in the "channel" field of PubNub Functions. See
the tutorial on {@tutorial topology} for more information on ChatEngine channel names.

You may wish to create an additional Function targeting private chats:
```
chat-engine#chat#private.*
```

## Code

You can access the ChatEngine Event type via ```request.messag=e.event``` and the
event payload via ```request.message.data```.

For example, to build a simple PubNub function that replaces all sent 'message's with
pirate speak:

```js
export default (request) => {
    const kvstore = require('kvstore');
    const xhr = require('xhr');

    console.log('request',request); // Log the request envelope passed

    if(request.message.event == "message") {
        request.message.data = "Ahoy there matey!"
    }

    return request.ok(); // Return a promise when you're done
}
```
