ChatEngine supports full permissions based management supported by PubNub PAM.

## Fresh

When you first set up your PubNub keys, all PubNub channels are locked down and
nobody can read or write anything.

## Authentication

When {@link ChatEngine#connect} is called, it connects to PubNub functions and authorizes the user to access all public channels, and their own channels.

```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'demo',
    subscribeKey: 'demo'
});

ChatEngine.connect(username, {}, 'auth-key');
```

It authorizes PubNub PAM permissions for the supplied authentication key on all read and write channels. See {@tutorial topology}.


When the endpoint responds and ChatEngine successfully connects to PubNub, {@link ChatEngine}
emits the ```$.ready``` event.

If the authentication call fails, {@link ChatEngine} emits ```$.error.auth```.

If the call is successful but {@link ChatEngine} can not connect to PubNub,
{@link ChatEngine} will emit a ```$.network.down.*``` event.

See {@tutorial private} for more information about how to utilize secure private chats.
