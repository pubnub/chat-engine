## Create a Chat Room

The {@link Chat| ```ChatEngine.chat()``` } method allows a user to create a new chat room. All chat rooms are created as public by default. A user may want to create a {@link Chat#isPrivate| private chat } that no other users can access.

### Public Chat

```js
let chat = new ChatEngine.Chat('public-chat');
```

### Private Chat
```js
let privateChat = new ChatEngine.Chat('private-chat', true);
```

The {@link Chat| ```Chat()``` }  method can also define chat {@link Chat#meta| ```meta``` } data for a chat room. {@link Chat#meta| ```chat.meta``` } data is persisted on the server and can be access by calling {@link Chat#meta| ```chat.meta``` }.


### Chat ```meta``` data

The {@link Chat| ```ChatEngine.chat()``` } method can also define chat {@link Chat#meta| ```meta``` } data for a chat room. Chat ```meta``` data persists on the server and can be accessed by calling {@link Chat#meta| ```chat.meta``` }.

```js
let chat = new ChatEngine.Chat('public-chat',,,{
	group: 'Soccer meetup',
	team: 'A'
});
```

The {@link Chat#update| ```chat.update()``` } method allows a user to update chat ```meta``` data.

```js
chat.update({
	group: 'Soccer meetup',
	team: 'B'
});
```


### Parameters for {@link Chat| ```ChatEngine.chat()``` }

| Name | Type | Default | Description |
|:----:|:----:|:-------:|:------------|
| ```channel``` | ```String``` | ```new Date().getTime()``` | A ```channel``` represents a unique string identifier for a chat's namespace. |
| ```isPrivate``` | ```Boolean``` | ```false``` | Attempt to authenticate ourselves before connecting to this Chat. |
| ```autoConnect``` | ```Boolean``` | ```true``` | Connect to this chat as soon as it’s initiated. If set to false, call the Chat#connect method to connect to this Chat. |
| ```meta``` | ```Object``` | ```{}``` | Chat metadata that will be persisted on the server and populated on creation. |
| ```group``` | ```String``` | ```default``` | Groups chat into a type. This is the key which chats will be grouped into within Me.session object. |
