## Transport Security Layer

With TLS and SSL encryption enabled, user data remains encrypted while traveling through the public internet. While only decrypting, processing, and encrypting again when the data travels through PubNub's secure network. The lack of end-to-end encryption is an limitation of TLS/SSL.

To enable TLS/SSL feature within CE, be sure to include the ```ssl: true``` parameter to CE's initialization code.

```js
ChatEngine = new ChatEngineCore.create({
    subscribeKey: "mySubscribeKey",
    publishKey: "myPublishKey",
    ssl: true
});
```

## AES
