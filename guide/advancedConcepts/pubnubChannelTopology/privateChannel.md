## Private Channel

All ```private``` {@link Chat| ```Chat```s} are created under the ```globalChannel + '#chat#private.*'``` namespace. This namespace is locked down and no ```User```s have read or write access by default: ```User```s must be affirmatively granted access to ```private``` channels.

```js
let privateChat = new Chat('private-channel', true);
console.log(privateChat.channel);
// privateChat.channel == "chat-engine#chat#private.#private-channel"
```
