The {@link ChatEngine#connect| ```ChatEngine.connect()``` } method allows a you to connect to ChatEngine with a {@link User#uuid| ```uuid``` } that uniquely identifies the User.

```js
ChatEngine.connect('john-UUID');
```

## LISTEN TO {@link ChatEngine#event:$"."ready| ```$.READY```} EVENT

A {@link ChatEngine#event:$"."ready| ```$.ready``` } event is triggered when a user is successfully connected to ChatEngine. The event payload includes a {@link Me| ```Me``` } object that represents the {@link User| ```User``` } that has been connected.

```js
ChatEngine.on('$.ready', (payload) => {
    let me = payload.me;
    console.log(me.uuid)
});
```

When the user connects to ChatEngine, it joins a global chat accessed via {@link ChatEngine#.global| ```ChatEngine.global```}. The user also automatically joins its own direct chat called {@link Me#direct| ```me.direct``` } and feed chat called {@link Me#feed| ```me.feed``` }. Refer to Channel Topology.

# TODO: Link to ChatEngine.connect() method
