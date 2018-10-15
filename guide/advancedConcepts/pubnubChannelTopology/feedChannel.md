A {@link #User#feed| ```feed``` } {@link Chat| ```Chat``` } channel can be used by a {@link User| ```User```} to broadcast a ```feed``` of messages to other ```User```s. For instance, the ```User``` can send out status updates or public tweets that other users can listen to. Any ```User``` can connect to ```feed``` channels and receive messages, but only the ```User``` that owns the ```feed``` channel will have write permissions to send messages on the channel.

Feed channels can be accessed by calling {@link User#feed| ```User.feed``` }.

```js
let craigb = new ChatEngine.User('craigb');
console.log(craigb.feed.channel);
// craigb.feed.channel == "chat-engine#user#craigb#read#feed"
```
