# CDN:

To get started using the CDN version of ChatEngine, include a reference to the minified javascript package in your HTML file.

```<script src="https://cdn.jsdelivr.net/npm/chat-engine@latest/dist/chat-engine.min.js"></script>```

The ChatEngine library will then be available as ```window.ChatEngineCore```.

### NPM:
To get started using the NodeJS version of ChatEngine, install chat-engine from npm and require it into your application:

```js
let ChatEngineCore = require('chat-engine');
```

# ChatEngine Application and Key Provisioning Guide

To setup ChatEngine on PubNub, one must first setup a new PubNub App. The following outlines how to manually setup a PubNub ChatEngine Key.

Setup an account, create a set up pubsub keys, configure these keys to

## Basic Steps
1. Navigate to [PubNub's Portal](pubnub.com), sign in, and select the _Create New App_ button at the top-right of the logged in user's app page.
2. Enter an App name (e.g. ```ChatEngine Application```) and click the _Create_ button.
3. Select the newly made App icon and navigate to the _Demo Keyset_.
4.  The following setting need to be updated on the key:

| **Presence**      | ```on``` |
|:--------------|:--------:|
| Announce Max | ```20``` |
| Interval | ```10``` |
| Presence Deltas | ```Disabled``` |
| Generate Leave on TCP FIN or FIN | ```Disabled``` |
| Global Here Now | ```Enabled``` |
| Debounce | ```2``` |
| Callback State Change | ```https://pubsub.pubnub.com/v1/blocks/sub-key/``` <br> ```__SUB_KEY__/chat-engine-server?route=user_state``` |

| **Storage & Playback** | ```on``` |
|:--------------|:--------:|
| Retention | ```7 days``` |

| **Stream Controllers** | ```on``` |
|:--------------|:--------:|
| Enable Wildcard Subscribe | ```Enabled``` |

| **PubNub Functions** | ```Enabled``` |
|:--------------|:--------:|

| **Access Manager** | ```Enabled``` |
|:--------------|:--------:|

5. See ChatEngine Server Provision Guide for Part II [Add link](#TODO)
