# OCF - Open Chat Framework

With OCF you can build Slack/Flowdock/HipChat and also Skype/Snapchat/WhatsApp. The serverless component runs Socket.IO and optional PubNub microservices. Advanced capabilities with modular Add-ons system. Using PubNub BLOCKS and Socket.IO/Node.JS add-ons for user-mention notifications and data privacy with encryption.

## Install Rltm

Rltm must be installed in sibling directory.

```sh
cd ../
git clone https://github.com/pubnub/rltm
```

## Install dependencies

Install gulp and project dependencies.

```sh
npm install
```

## Run Stephen Bot

```sh
node examples/bot.js
```

## Load up example chat page

You can use file or localhost. Supply a username in the query string param to make it work properly.

Example: 

```
file:///Users/ian/Development/open-chat-framework/examples/web.html?username=ian#
```

# Develop / Build for Web

Compiled using browserify through gulp

```sh
npm install only=dev
npm install gulp -g
```

Run build task and watch for browser

```sh
gulp && gulp watch
```
