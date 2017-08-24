PubNub Channels in ChatEngine

## Global Chat / Channel

By default the Global Channel is called ```chat-engine```.

Every {@link Chat} created within an instanced of {@link ChatEngine} is perpended with
the string ```chat-engine#```.

This allows you to create multi-tenant apps without overlap. For example, you may want to
support multiple organizations with different top level ids. Every organization would have
a unique global channel.

Every channel created within ChatEngine thereafter is prepended with the global channel.

## Channel Namespaces

Every {@link Chat}s is created under a sub namespace dependent on the context and permissions.

#### ```globalChannel```

This is the channel for {@link ChatEngine#global}. All {@link User}s have read and write access to this channel.

```js
ChatEngine.global.on('message', () => {});

console.log(ChatEngine.global.channel);
// ChatEngine.global.channel == "chat-engine"
```

#### ```globalChannel + '#chat#public.*'```

All public {@link Chat}s are created under this namespace. All {@link User}s have read and write access to this channel.

```js
let chat = new Chat('custom-channel')

console.log(chat.channel);
// chat.channel == "chat-engine#chat#public.#custom-channel"
```

#### ```globalChannel + '#chat#private.*'```

All private {@link Chat}s are create under this namespace. This namespace is locked down and no users have
read or write access. They must be granted them.

```js
let privateChat = new Chat('private-channel', true);

console.log(privateChat.channel);
// privateChat.channel == "chat-engine#chat#private.#private-channel"
```

#### ```globalChannel + '#user#' + myUUID + '#read.*'```

This is the namespace containing {@link User} owned {@link Chat}s. The user who's {@link User#uuid} matches ```myUUID``` has all permissions, while other {@link User}s only have read permissions. {@link User#feed} belongs to this namespace.

```js
let joe = new ChatEngine.User('joe');

console.log(joe.feed.channel);
// joe.feed.channel == "chat-engine#user#joe#read#feed"
```

#### ```globalChannel + '#user#' + myUUID + '#write.*'```

This is the namespace containing {@link User} owned {@link Chat}s. The user who's {@link User#uuid} matches ```myUUID``` has all permissions, while other {@link User}s only have write permissions. {@link User#direct} belongs to this namespace.

```js
let joe = new ChatEngine.User('joe');

console.log(joe.direct.channel);
// joe.direct.channel == "chat-engine#user#joe#write#direct"
```
