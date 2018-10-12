## TLS/SSL Encryption

ChatEngine client libraries offer built-in TLS/SSL Encryption. With TLS/SSL enabled,
your data is encrypted as it travels through the Internet. This example demonstrates
how to enable PubNub Transport Layer Encryption with SSL by setting ```ssl``` set to
 ```true``` upon initialization.

```js
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    ssl: true
});
```

## AES Encryption

To ensure the highest levels of message integrity TLS/SSL should be used in combination
with PubNub Message Level Encryption using AES to guarantee end-to-end data security.

The example below demonstrates how to enable PubNub Data Layer Encryption with AES.
When the client is initialized with a ```cipherKey```, ChatEngine will encrypt the message
payload with AES-256 encryption before it is published to the network. Data will
automatically be decrypted by the client SDK before it is displayed.

```
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    cipherKey: "myCipherKey"
});
```

For more details about setting up AES with ```cipherKey``` see PubNub Knowledge Base:
 <a href="https://support.pubnub.com/support/solutions/articles/14000043506-aes-usage-examples">AES Usage Examples</a>.
