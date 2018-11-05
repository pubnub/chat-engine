ChatEngine SDKs are designed to be used on client-side mobile & web applications. If you also need to build a server component that interacts with {@link User| ```User```s }, you can utilize one of the PubNub server-side [SDKs](https://www.pubnub.com/docs).

### Server-side security

Servers can connect to PubNub by providing a ```secretKey```. The example below is in ```node.js```:

```
var pubnub = require('pubnub').PubNub({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    secretKey: 'sec-c-M2U0N...'
});
```

### Server-side messages

While servers have full read/write privileges to publish messages on any {@link Chat| ```Chat``` } channels, it is important to note that the channel names and message payload need to follow a specific format to be understood by ChatEngine client-side SDKs. More info on message payload below:

```
pubnub.publish(
    {
        message: {
           'data':{'text':'hey'},
           'sender':'john-UUID',
           'event':'message',
           'chatengineSDK':'0.9.19'
        },
        channel: 'chat-engine#chat#public.#ch1'
    },
    function (status, response) {
        if (status.error) {
            // handle error
            console.log(status)
        } else {
            console.log("message Published w/ timetoken", response.timetoken)
        }
    }
);
```
