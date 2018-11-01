## Direct Channel

A {@link User#direct| ```direct``` } chat channel can be used by a {@link User| ```User``` } to receive incoming requests from other ```User```s, or alerts and notifications from a server. Any ```User``` can connect to another ```User```’s {@link User#direct| ```direct```} channel to send messages, but only the ```User``` that owns the ```direct``` channel will have read permissions to receive messages on the channel.

Direct channels can be accessed by calling {@link User#direct| ```User.direct``` }.

```js
let craigb = new ChatEngine.User('craigb');
console.log(craigb.direct.channel);
// ---> craigb.direct.channel == "chat-engine#user#craigb#write#direct"
```
