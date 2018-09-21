## Global Channel

Every chat created within an instanced of ChatEngine is prepended with the global chat room string chat-engine#. This allows you to create multi-tenant apps without overlap. For example, you may want to support multiple organizations with different top level ids. Every organization would have a unique global channel.

By default, the global chat room is called chat-engine. Global channels can be accessed by calling ```ChatEngine.global```.

```js
console.log(ChatEngine.global.channel);
// ChatEngine.global.channel == "chat-engine"
```
