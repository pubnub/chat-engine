## Create a Chat Room

The {@link Chat| ```ChatEngine.Chat()``` } method allows a user to create a new chat room. All chat rooms are created as public by default. A user may want to create a {@link Chat#isPrivate| private chat } that no other users can access.

### Public Chat

```js
let chat = new ChatEngine.Chat('public-chat');
```

### Private Chat
```js
let privateChat = new ChatEngine.Chat('private-chat', true);
```

The {@link Chat| ```Chat()``` }  method can also define chat {@link Chat#meta| ```metadata``` } for a chat room. Chat ```metadata``` is persisted on the server and can be access by calling {@link Chat#meta| ```chat.meta``` }.
