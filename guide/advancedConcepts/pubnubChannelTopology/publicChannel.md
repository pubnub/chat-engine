## Public Channel

All ```public``` {@link Chat| ```Chats``` } are created under the ```globalChannel + '#chat#public.*'``` namespace. All {@link User| ```User```s } have read and write access to this channel.

```js
let chat = new Chat('custom-channel')
console.log(chat.channel);
// chat.channel == "chat-engine#chat#public.#custom-channel"
```
