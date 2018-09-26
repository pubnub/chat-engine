A user can get the ```state``` of other users by retrieving the {@link User ```user```} from the list and calling {@link User#state ```user.state``` }.

```js
let joe = ChatEngine.users['joe-UUID'];
console.log(joe.state);
```
