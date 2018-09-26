The {@link User ```ChatEngine.User()```} method allows you to reference a user that has previously connected to ChatEngine by providing a {@link User#uuid ```uuid```}. The method will not return a user if the {@link User#uuid ```uuid```} is not valid.

```js
let joe = new ChatEngine.User('joe-UUID');
```

A user can also retrieve a list of all online users connected to ChatEngine by calling {@link ChatEngine#"."users ```ChatEngine.users``` }. The list is kept in sync as users ```join``` and {@link Chat#leave ```leave```} the chats.

```js
console.log(ChatEngine.users); //list of online users
let stephen = ChatEngine.users['stephen-UUID'];
```
