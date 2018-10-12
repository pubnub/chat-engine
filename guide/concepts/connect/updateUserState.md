You can update state on the {@link Me| ```Me``` } object by calling the {@link Me#update| ```me.update()``` } method. When you update user state, another ```$.state``` event is triggered to other users in the global chat room.

```js
me.update({
    name: 'John Doe',
    color: 'green'
});
```
