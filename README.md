# [PubNub ChatEngine Framework](https://pubnub.github.io/chat-engine/)

[![](https://data.jsdelivr.com/v1/package/npm/chat-engine/badge)](https://www.jsdelivr.com/package/npm/chat-engine)
[![Build Status](https://travis-ci.org/pubnub/chat-engine.svg?branch=master)](https://travis-ci.org/pubnub/chat-engine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d8b6e41d61164170873bb8fe79bab020)](https://www.codacy.com/app/PubNub/chat-engine?utm_source=github.com&utm_medium=referral&utm_content=pubnub/chat-engine&utm_campaign=badger)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d8b6e41d61164170873bb8fe79bab020)](https://www.codacy.com/app/PubNub/chat-engine?utm_source=github.com&utm_medium=referral&utm_content=pubnub/chat-engine&utm_campaign=badger)

## Deprecation Notice
ChatEngine has been deprecated with no plans for additional releases. Support for the ChatEngine SDK will end on July 16, 2021. If you have questions about ChatEngine, please contact us at support@pubnub.com.
Please visit our newer chat product, [PubNub Chat](https://www.pubnub.com/products/pubnub-chat/). 

## ChatEngine

PubNub ChatEngine is an object-oriented event emitter based framework for building chat applications in Javascript. It reduces the time to build chat applications drastically and provides essential components like typing indicators, online presence monitoring and message history out of the box.

The real-time server component is provided by PubNub. ChatEngine is designed to be extensible and includes a plugin framework to make adding new features simple.

For more information on building chat applications with PubNub, see our 
[Chat Resource Center](http://www.pubnub.com/developers/chat-resource-center/).

# Documentation

You can find the full docs on [the documentation website](https://pubnub.github.io/chat-engine/).

# Getting Started

## Prerequisites

* NodeJS
* Twitter Bootstrap
* jQuery

## PubNub Account Set Up

To set up ChatEngine on PubNub, one must first set up a PubNub Key. The following steps outlines how to manually set up a PubNub Key to work with ChatEngine client-side SDKs.

### Sign Up for a PubNub Account
If you don't already have an account, you can create one for free [here](https://dashboard.pubnub.com/).

### Set Up the REST API Service using PubNub Functions
The ChatEngine framework and client-side SDKs interact with a REST API service that runs as a PubNub Function. 

*You'll need to set up the function on your PubNub Account before you can use the SDKs.*

[Follow the ChatEngine Server Setup Instructions](https://github.com/pubnub/chat-engine-server).

## Download Code

### Create a new NPM project

Since we'll be installing dependencies, it's helpful to create a new ```package.json``` to keep track of all of the packages we're going to install.

In your project directory, run this command to create a new package. Complete the interactive set up guide and we'll be ready to go.

```
npm init
```

That'll create a ```package.json``` in your project directory.

```json
{
  "name": "chat-engine-tutorial",
  "version": "0.0.1",
  "description": "An example PubNub ChatEngine Tutorial",
  "main": "index.js",
  "author": "Ian Jennings"
}
```

### Install PubNub ChatEngine

Alright, now for the part you've probably never done before! Install PubNub ChatEngine by running:

```sh
npm install chat-engine@latest --save
```

# Additional Resources

## Plugins

Check out the [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink) and [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron) examples to see plugins in action.

* [Image Uploads](https://github.com/pubnub/chat-engine-uploadcare) - Uses UploadCare service to upload images and render them in chats. [Example](https://raw.github.com/pubnub/chat-engine-uploadcare/master/example/).
* [Markdown Support](https://github.com/pubnub/chat-engine-markdown) - Render Markdown in HTML when receiving messages. [Example](https://raw.github.com/pubnub/chat-engine-markdown/master/example/).
* [Mute Users](https://github.com/pubnub/chat-engine-muter) - Allows the current user to stop receiving events from other users. [Example](https://raw.github.com/pubnub/chat-engine-muter/master/example/).
* [Online User Search](https://github.com/pubnub/chat-engine-online-user-search) - A simple way to search through the list of users online in the chat. [Example](https://raw.github.com/pubnub/chat-engine-online-user-search/master/example/).
* [Typing Indicator](https://github.com/pubnub/chat-engine-typing-indicator) - Provides convenience methods that fire when a user starts or stops typing. [Example](https://github.com/pubnub/chat-engine-typing-indicator/tree/master/example)
* [Unread Messages](https://github.com/pubnub/chat-engine-unread-messages) - Allows you to mark a chat as being in the background and increments a counter as events are sent to it. [Example](https://raw.github.com/pubnub/chat-engine-online-unread-messages/master/example/).
* [Desktop Notifications](https://github.com/pubnub/chat-engine-desktop-notifications) - Uses HTML5 Notification API to send "toaster" updates.
* [Emoji Support](https://github.com/pubnub/chat-engine-emoji) - Uses images as a fallback for devices that might not yet support :poop:.
* [Event Status and Read Receipts](https://github.com/pubnub/chat-engine-event-status) - Emits additional events when someone reads a receives and/or reads a message.
* [Gravatar Support](https://github.com/pubnub/chat-engine-gravatar) - Uses Gravatar service to create an avatar based on user state information.
* [Random Usernames](https://github.com/pubnub/chat-engine-random-username)- A plugin that gives every user a random username combining color and an animal.

## Videos

* [ChatEngine Intro](https://www.youtube.com/watch?v=o529w2ABH6s)
* [5 Minute ChatEngine Tutorial](https://www.youtube.com/watch?v=sUUekUsfed4)
* [Chat in 30 Lines of Code Webinar](https://www.youtube.com/watch?v=jnF9fLo7xfk)

## Tutorials

### Javascript
* [Getting Started tutorial](https://github.com/pubnub/chat-engine-tutorial).
* [Chat](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/chat.html) - Really simple chat example. The "hello world" of ChatEngine.
* [Online List](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/online-list.html) - No chats, just renders who is online. See the Kitchen Sinks for how to combine this with private chats.

### React Native + Mobile

* [React Native Example](https://github.com/pubnub/chat-engine-examples/tree/master/react-native) - Made with ```create-react-app```.
* [React Native Components](https://github.com/pubnub/chat-engine-react-native) - Premade components for rendering Chats, Messages, Users, and more.
* [Integrating into an existing iOS App](https://www.pubnub.com/docs/chat-engine/samples/ios) - Guide on adding ChatEngine React native app into iOS.
* [Integrating into an existing Android App](https://www.pubnub.com/docs/chat-engine/samples/android) - Guide on adding ChatEngine React Native app in Android.

### React

* [React](https://github.com/pubnub/chat-engine-examples/tree/master/react) - Bare bones react web example.

### Vue

* [Vue Guide](https://www.pubnub.com/blog/introducing-the-chatengine-plugin-for-vue/) - Guide on using ChatEngine and Vue together. Uses the following resources.
* [Vue Example](https://github.com/ajb413/chat-engine-vue) - Full featured ChatEngine vue example.
* [Vue Plugin](https://github.com/ajb413/vue-chat-engine) - ChatEngine plugin for vue.

### Angular

* [Angular Simple](https://github.com/pubnub/chat-engine-examples/tree/master/angular/simple) - Angular "Hello World" app. Simple app that uses a custom Angular plugin to render when anything updates.
* [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron) - The largest demo app out there, almost a complete Desktop Team Chat clone (Slack, Stride, Flowdock). Persistent URLs and renders into a real desktop app with Electron!

### jQuery

* [jQuery Simple](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/simple) - jQuery ChatEngine "Hello World" app. A simple app where everyone chats together.
* [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink) - Huge example that uses most ChatEngine features. Has an online list that spawns new chats when you click on usernames.

### 3rd Party Authentication

* [Facebook Login](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/facebook-login.html) - Use Facebook Profiles with ChatEngine.

### NodeJS + Chatbot

* [NodeJS ChatBot](https://github.com/pubnub/chat-engine-examples/blob/master/nodejs/bot.js) - An example bot that responds to messages and emulates typing. Works with the jQuery Kitchen Sink example by default.

# Development

## Cloning

Clone repos (chat-engine and plugins).

All repos should be siblings of one another. This is required for rendering docs
properly.

```
chat-engine
chat-engine-desktop-notifications
chat-engine-emoji
chat-engine-examples
//...
```

## Setting up the Environment

```
nvm use v6
```

Run ```http-server``` from my ```/development``` directory which has all chat-engine repos:


```cd chat-engine```

```node server.js```

Load http://localhost:8080 in browser and navigate to /chat-engine-examples/jquery/kitchen-sink

## Compiling

Run ```gulp``` to compile, but you should probably run ```gulp watch``` to get consistent changes.

## Running Tests

You will need to assign environment variables ```PUB_KEY_0``` and ```SUB_KEY_0``` to your own PubNub keys. Add these variables into your ```.bashrc``` or ```.zshrc```.

```sh
# pubnub chatengine keys
export PUB_KEY_0="YOUR PUBNUB PUBLISH KEY"
export SUB_KEY_0="YOUR PUBNUB SUBSCRIBE KEY"
```

Then, in the root folder run:

```
gulp test
```

## Releasing a patch (chat engine and plugins)

```
npm version patch && git push origin master --tags
```

# Support

- If you **need help**, have a **general question**, have a **feature request** or to file a **bug**, contact <support@pubnub.com>
