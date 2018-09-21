## Public Channel

All public chats are created under the ```globalChannel + '#chat#public.*'``` namespace. All Users have read and write access to this channel.

```js
let chat = new Chat('custom-channel')
console.log(chat.channel);
// chat.channel == "chat-engine#chat#public.#custom-channel"
```
