## Private Channel

All ```private``` {@link Chat| ```Chat```s} are created under the ```globalChannel + '#chat#private.*'``` namespace. This namespace is locked down and no ```User```s have read or write access. A ```User``` must be granted them.

```js
let privateChat = new Chat('private-channel', true);
console.log(privateChat.channel);
// privateChat.channel == "chat-engine#chat#private.#private-channel"
```
