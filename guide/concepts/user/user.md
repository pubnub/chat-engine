## User Connect

The ChatEngine.connect() method connects to ChatEngine with a Me user. A user is required to have a UUID that uniquely identifies the user.

```js
ChatEngine.connect('john-UUID', {});
```

### Listen to ```$.ready``` Event

When the user is successfully connected and ChatEngine is ready, it will emit ```$.ready``` event with the {@link Me} object returned.

```js
ChatEngine.on('$.ready', (data) => {
    let me = data.me; // ian
});
```

When a user connects to ChatEngine, it is added to a global chat room called chat-engine. The user is also added to its own direct and feed chat channels that can be referenced by calling user.direct and user.feed. Refer to Channel Topology.


## User State

The {@link ChatEngine#connect| ```ChatEngine.connect()``` } method also allows {@link Me} user to include a state that can be shared with other users connected to the platform. The state is stored in PubNub for the time a user is connected and removed when the user disconnects.

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

A user's stateful information can be retrieved by calling {@link User#state| ```User.state``` } when the user is online. A user's state can also be retrieved after the user goes offline by calling ```User.getStoredState()``` (TODO: need a code ref!!!)

### Update User State

We can update Me's {@link Me#state| ```state``` } on the network with the {@link Me#update| ```Me.update()``` } method. When a user updates its {@link Me#state| ```state``` }, another ```$.state``` event is emitted.

```js
me.update({
	  name: 'John Doe',
    color: 'green'
});
```

## List All Users Online

A list of all online users who have joined a chat room is available from {@link Chat#users| ```Chat.users``` }. The list is kept in sync as users join and leave the chats.

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

A particular user can be retrieved from the {@link ChatEngine#users| ```ChatEngine.users``` } list by providing the user’s ```UUID``` as seen below:

```js
let stephen = ChatEngine.users['stephen-UUID'];
```

ChatEngine does **not** maintain a list of offline users. Clients can however send messages to offline user using a user’s UUID if they have connected to ChatEngine in the past.

```js
let joe = new ChatEngine.User('joe-UUID');
```
