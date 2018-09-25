## TLS/SSL Encryption

ChatEngine client libraries offer built-in TLS/SSL Encryption. With TLS/SSL enabled, your data is encrypted as it travels through the Internet. This examples demonstrates how to enable PubNub Transport Layer Encryption with SSL. Initialize the client with ```ssl``` set to ```true```.

```js
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    ssl: true
});
```

## AES Encryption

To ensure the highest levels of message integrity, TLS/SSL should be used in combination with PubNub Message Level Encryption via AES to guarantee end-to-end data security.

The example below demonstrates how to enable PubNub Data Layer Encryption via AES. Initialize the client with a ```cipherKey``` and PubNub will encrypt the message payload with AES-256 Encryption before it is published to the network. Data will automatically be decrypted by the client SDK before it is displayed.

```
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    cipherKey: "myCipherKey"
});
```

> For more details about setting up AES with cipherKey see PubNub Knowledge Base: <a href="https://support.pubnub.com/support/solutions/articles/14000043506-aes-usage-examples">AES Usage Examples</a>.
