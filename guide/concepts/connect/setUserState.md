The {@link ChatEngine#connect| ```ChatEngine.connect()``` }  method also allows you to include a user {@link User#state| ```state```} object that can be shared with other users on the platform. State is stored in PubNub. Username, location or avatar are examples of information that could be included in the state object.  The contents of the state object has no special meaning to ChatEngine or PubNub.

```js
ChatEngine.connect('john-UUID', {
    name: 'John Doe',
    team: 'red'
});
```

## Listen to ```$.state``` Event

A ```$.state``` event is triggered to all users in the {@link ChatEngine#"."global| ```global```} chat room if a user connects with a user state.

```js
ChatEngine.global.on('$.state', (payload) => {
    console.log(payload.user + ' state: ' + payload.state);
});
```
