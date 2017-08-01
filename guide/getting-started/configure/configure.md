Start by checking that Chat Engine has been loaded properly.

```js
console.log(ChatEngineCore);
```

Now we're all set up to create an app!

# Me / Connect / Configure

In ```app.js``` add the following lines:

```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
```

This is the PubNub Chat Engine initialization. All you need to supply is the first parameter; a set of PubNub publish and subscribe keys.

> This paramter is actually a PubNub initialization. You can read more about all possible parameters [here](https://www.pubnub.com/docs/web-javascript/api-reference#init)

> When using PubNub Chat Engine with the ```<script>``` tag, you can get the package from ```window.ChatEngineCore```.

> You can use the NodeJS package with [WebPack](https://webpack.github.io/) and ```require``` as well.

> See that ```const``` declaration? This tutorial (and PubNub Chat Engine) are in
[es6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_2015_support_in_Mozilla).

