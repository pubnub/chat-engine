## Direct Channel

A direct chat channel can be used by a user to receive incoming requests from other users or alerts and notifications from a server. Any user can connect to a user’s direct channel to send messages, but only the user that owns the direct channel will have read permissions to receive messages on the channel.

Direct channels can be accessed by calling ```user.direct```.

```js
let joe = new ChatEngine.User('joe');
console.log(joe.direct.channel);
// joe.direct.channel == "chat-engine#user#joe#write#direct"
```
