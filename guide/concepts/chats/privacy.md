## Auth Url

ChatEngine uses PubNub Functions to handle {@link Chat} privacy.

When the {@link ChatEngine#connect} method is invoked, ChatEngine will make an authentication request to ```ceConfig.authUrl```. This url is responsible for granting the uuid permission to access the network.

### Insecure Mode

**If ```ceConfig.authUrl``` is omitted, the app is run in ```insecure``` mode**.

In insecure mode, all {@link User}s can access all {@link Chat}s and nothing is private (none of the below applies). This is not recommended and a warning will be logged to console.

## Chat Security

### Public Chat

```js
new Chat('channel', false);
```

This is a public chat any {@link User} can join.

### Private Chat

```js
new Chat('channel', true);
```

This is a private chat that a user must authenticated in. Usually this is done via {@link Chat#invite}.

## Direct Chat

{@link User#direct} is a {@link Chat} that any {@link User} can {@link Chat#emit} on, but only the user receives events on.

This is helpful for sending messages directly to users, to ping them, or challenge them to a match. This channel is only readable by said user.

```js
// me
me.direct.on('game-invite', (payload) -> {
     console.log(payload.sender.uuid, 'sent your a game invite on the map', payload.data.map);
});

// someone else
them.direct.emit('game-invite', {map: 'de_dust'});
```

## Feed Chat

{@link User#feed} is a {@link Chat} that only the {@link User} can {@link Chat#emit} to but everyone can receive events on.

{@link User}s can use this to tell others of their status. This is useful for things like updating a temporary status ("user is typing...") or letting others know you've gone idle.

For a more persistent status update, see the section in this tutorial on "state" and {@link User#state}.

```js
// me
me.feed.emit('update.away', 'I may be away from my computer right now');

// another instance
them.feed.connect();
them.feed.on('update.away', (payload) => {
    console.log(payload.sender.uuid, 'is away');
});
```


## PubNub Security

Security is controlled via [PubNub PAM](https://www.pubnub.com/docs/tutorials/pubnub-access-manager).
