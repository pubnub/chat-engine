## List All Users Online

A list of all online {@link ChatEngine#users| ```users``` } who have joined a chat room is available from {@link Chat#users| ```Chat.users``` }. The list is kept in sync as users join and leave the chats.

Calling {@link Chat#users| ```Chat.users``` } returns a list of users who have also joined this chat.

```js
{
  ian: {},
  craig: {},
  jill: {}
}
```

The client can also call {@link ChatEngine#users| ```ChatEngine.users``` }  to retrieve a list of all users connected to this instance of {@link ChatEngine}.


### Find a user

A particular user can be retrieved from the {@link ChatEngine#users| ```ChatEngine.users``` } list by providing the user’s {@link User#uuid| ```UUID``` } as seen below:

```js
let stephen = ChatEngine.users['stephen-UUID'];
```

ChatEngine does **not** maintain a list of offline users. Clients can however send messages to offline user using a user’s UUID if they have connected to ChatEngine in the past.

```js
let joe = new ChatEngine.User('joe-UUID');
```
