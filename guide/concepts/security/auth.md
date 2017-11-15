ChatEngine supports full permissions based management supported by PubNub Access Manager.

## Fresh

When you first set up your PubNub keys, all PubNub channels are locked down and
nobody can read or write anything.

## Authentication

When {@link ChatEngine#connect} is called, it connects to PubNub functions and authorizes the user to access all public channels, and their own channels.

```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});

ChatEngine.connect(username, {}, 'YOUR_AUTH_KEY');
```

It authorizes PubNub Access Manager permissions for the supplied authentication key on all read and write channels. See {@tutorial topology}.

```YOUR_AUTH_KEY``` is typically a session based token that should be cycled frequently. Providing a consistent auth key is not recommended.

## Successful Authentication

When the endpoint responds and ChatEngine successfully connects to PubNub, {@link ChatEngine}
emits the ```$.ready``` event.

## Authentication Failure

If the authentication call fails, {@link ChatEngine} emits ```$.error.auth```.

If the call is successful but {@link ChatEngine} can not connect to PubNub,
{@link ChatEngine} will emit a ```$.network.down.*``` event.

See {@tutorial private} for more information about how to utilize secure private chats.

## Editing Authentication Policy

* Navigate to the [PubNub Admin Portal](http://admin.pubnub.com/).
* Find your ChatEngine app
* Locate the ChatEngine PubNub Functions
* Edit the authenticationPolicy() code within the ```chat-engine-server```
