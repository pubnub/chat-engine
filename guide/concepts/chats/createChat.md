The {@link Chat| ```ChatEngine.Chat()``` } class allows you to create a new chat room. The user will automatically join the chat room when it is created if the ```autoConnect``` flag is set to ```true```.

All chat rooms are created as public by default. A private chat room can be created by setting the ```isPrivate``` flag to ```true```.

## Public Chat

```js
let chat = new ChatEngine.Chat('public-chat');
```

## Private Chat

```js
let privateChat = new ChatEngine.Chat('private-chat', true);
```

You can get a list of all chat rooms by using {@link ChatEngine#"."chats| ```ChatEngine.chats``` }.

```js
console.log(ChatEngine.chats);
chat = ChatEngine.chats['public-chat'];
```

## Chat {@link Chat#meta| ```metadata```}

The {@link Chat| ```ChatEngine.Chat()``` } class can also define chat ```metadata``` for a chat room. Chat ```metadata``` persists on the server and can be accessed by calling {@link Chat#meta| ```chat.meta``` }.

```js
let chat = new ChatEngine.Chat('public-chat', false, true,{
    name: 'Soccer meetup',
    team: 'A'
});
```

The {@link Chat#update| ```chat.update()``` } method allows you to update chat ```metadata```.

```js
chat.update({
    name: 'Soccer meetup',
    team: 'B'
});
```
