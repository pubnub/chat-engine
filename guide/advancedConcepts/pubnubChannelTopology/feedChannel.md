## Feed Channel

A feed chat channel can be used by a user to broadcast a feed of messages to other users. For instance, the user can send out status updates or public tweets that other users can listen to. Any user can connect to feed channels and receive messages, but only the user that owns the feed channel will have write permissions to send messages on the channel.

Feed channels can be accessed by calling ```user.feed```.

```js
let joe = new ChatEngine.User('joe');
console.log(joe.feed.channel);
// joe.feed.channel == "chat-engine#user#joe#read#feed"
```
