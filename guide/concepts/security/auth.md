ChatEngine supports full permissions based management supported by PubNub PAM.

## Fresh

When you first set up your PubNub keys, all PubNub channels are locked down and
nobody can read or write anything.

## Setup

When we first set up ChatEngine, we supply an ```authUrl```.

const ChatEngine = ChatEngineCore.create({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
}, {
    authUrl: 'http://localhost:3000/insecure'
});

The supplied ```authUrl``` is responsible for validating authentication information
and authorizing the user on appropriate namespaces. See {@tutorial topology}.

## Authorize {@link Me}

In order to gain access to the locked channels, we call {@link ChatEngine#create}.
This will hit the server at ```authUrl + '/auth'```. This endpoint grants PubNub
PAM permissions on all read and write channels. See {@tutorial topology}.

```js
ChatEngine.connect(username, {}, 'auth-key');
```

When the endpoint responds and ChatEngine successfully connects to PubNub, {@link ChatEngine}
emits the ```$.ready``` event.

If the call to ```/auth``` fails, {@link ChatEngine} emits ```$.error.auth```.

If the call is successful but {@link ChatEngine} can not connect to PubNub,
{@link ChatEngine} will emit a ```$.network.down.*``` event.

See {@tutorial private} for more information about how to utilize secure private chats.
