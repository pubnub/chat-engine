## Private Channel

All private chats are created under the ```globalChannel + '#chat#private.*'``` namespace. This namespace is locked down and no users have read or write access. They must be granted them.

```js
let privateChat = new Chat('private-channel', true);
console.log(privateChat.channel);
// privateChat.channel == "chat-engine#chat#private.#private-channel"
```
