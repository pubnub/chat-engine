# Automagic PubNub Setup

Login below with your PubNub credentials. This will automatically create a new ChatEngine App in your PubNub account, an new key pair, and enable all the PubNub features required for ChatEngine to work properly.

<iframe src="../setup/" width="100%" height="400" /></iframe>

# Manual PubNub Setup

Navigate to http://admin.pubnub.com and login or create an account. Don't worry, it's free!

https://admin.pubnub.com

Click "New App."

![](/guide/getting-started/assets/README-ddad3667.png)

Give your new app a name and click "Create."

![](/guide/getting-started/assets/README-a6e543f2.png)

Click on your keyset.

![](/guide/getting-started/assets/README-84f858cd.png)

Copy and paste those keys into your ```app.js```.

```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
```

![](/guide/getting-started/assets/README-943bee9f.png)


Scroll down and enable PubNub Presence.

![](/guide/getting-started/assets/README-29b7db60.png)

> Not yet supported.
Enable PubNub Access Manager.
![](/guide/getting-started/assets/README-ad7eda0b.png)

Scroll down and enable PubNub Storage and Playback. "Retention" is how long messages will be stored in chatrooms.

![](/guide/getting-started/assets/README-755671fd.png)

Click "Save Changes."

![](/guide/getting-started/assets/README-8e5db3c0.png)
