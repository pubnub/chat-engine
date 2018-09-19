To get started, install the ChatEngine dependencies. Copy and paste the following line HTML before your main JavaScript file reference:

```HTML
<script src="https://cdn.jsdelivr.net/npm/chat-engine@0.9.19/dist/chat-engine.min.js"></script>
```

Or in NodeJS:

```
let ChatEngineCore = require('chat-engine');
```

## Initialization

Create an instance of the {@link ChatEngine| ```ChatEngineCore``` } object.
This function must be called before attempting to utilize any API functionality in order to establish account level credentials such as publishKey and subscribeKey.

```js
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey"
});
```

### Parameters

| Name | Type | Description |
|:----:|:----:|:-----------|
| [```pnConfig```](tutorial-initializationOptions.html##pnConfig) | ```Object``` | ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See [properties]( https://www.pubnub.com/docs/chat-engine/global#overridden-pnconfig). |
| [```ceConfig```](tutorial-initializationOptions.html##ceConfig) | ```Object``` | A list of ChatEngine specific configuration options. See [properties](https://www.pubnub.com/docs/chat-engine/global#global-properties) |

An example of adding parameters to a [```ceConfig```](tutorial-initializationOptions.html##ceConfig), one may initialize the {@link ChatEngine| ```ChatEngineCore``` } object with specific arguments such as ```{ 'ssl': true }``` or ```{ 'debug': true }```. Apply arguments in the following manner:

```
let ChatEngine = ChatEngineCore.create({
    //...
}, {
    debug: true,
    ssl: true
});
```

Advanced ChatEngine initialization concepts:
 - <a href=tutorial-security.html#Authorization>Authorization</a>
 - <a href=tutorial-security.html#Transport Security Layer>TLS</a>
 - <a href=tutorial-security.html#AES>AES Encryption</a>
 - <a href=tutorial-authentication.html>Authentication</a>
 - <a href=tutorial-initializationOptions.html##pnConfig>Additional ```pnConfig``` parameters</a>
 - <a href=tutorial-initializationOptions.html##ceConfig>Additional ```ceConfig``` parameters</a>

### Client Initialization

The ChatEngine architecture consists of a client side running ChatEngine client code and a backend side (PubNub Functions) handling various server-side ops such as authorization via PAM. For an in-depth dive into how ChatEngine initializes its connections, [click here](tutorial-connect.html).
