Every {@link Chat| ```Chat``` } channel within an instance of ChatEngine is prepended with the ```global``` chat room string ```'chat-engine#'```. This allows developers to create multi-tenant apps without overlap. For example, a developer may want to support multiple organizations with different top level ids. Every organization would require a unique ```global``` channel.

By default, the ```global``` chat room is called ```'chat-engine'```. Global channels can be accessed by calling ```ChatEngine.global```.

```js
console.log(ChatEngine.global.channel);
// ---> ChatEngine.global.channel == 'chat-engine'
```
