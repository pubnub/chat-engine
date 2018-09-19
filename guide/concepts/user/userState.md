## User State

The {@link ChatEngine#connect| ```ChatEngine.connect()``` } method also allows {@link Me| ```Me``` } ```user``` to include a state that can be shared with other users connected to the platform. The state is stored in PubNub for the time a user is connected and removed when the user disconnects.

```js
ChatEngine.connect('john-UUID', {
	name: 'John Doe',
    team: 'red'
});
```

### Listen to ```$.state``` Event

A ```$.state``` event is emitted to all online users when a {@link User| ```User``` } connects to ChatEngine.

```js
ChatEngine.global.on('$.state', (payload) => {
    console.log(payload.user + ' state: ' + payload.state);
});
```

### Get User State

A ```user```'s stateful information can be retrieved by calling {@link User#state| ```User.state``` } when the user is online. A user's state can also be retrieved after the user goes offline by calling ```User.getStoredState()``` (TODO: need a code ref!!!)

### Update User State

We can update Me's {@link Me#state| ```state``` } on the network with the {@link Me#update| ```Me.update()``` } method. When a ```user``` updates its {@link Me#state| ```state``` }, another ```$.state``` event is emitted.

```js
me.update({
	  name: 'John Doe',
    color: 'green'
});
```
