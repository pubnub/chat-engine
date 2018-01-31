## Install PubNub ChatEngine

### CDN Hotlink

You can grab the latest version of ChatEngine by hotlinking to the GitHub pages hosted version of ChatEngine

```js
<script src="https://cdn.jsdelivr.net/npm/chat-engine@0.8.4/dist/chat-engine.min.js"></script>
```

The ChatEngine library will then be available as ```window.ChatEngineCore```.

### NPM

Install PubNub ChatEngine by running:

```sh
npm install chat-engine --save
```

This will install the PubNub ChatEngine Javascript SDK into your ```node_modules``` directory.

You can then include it directly on the front end by:

```js
<script src="node_modules/chat-engine/dist/latest/chat-engine.js"></script>
```

The ChatEngine library will then be available as ```window.ChatEngineCore```.

Or in NodeJS:

```js
let ChatEngineCore = require('chat-engine');
```

