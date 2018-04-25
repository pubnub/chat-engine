![](logo.png)

PubNub ChatEngine is an object oriented event emitter based framework for building chat applications in Javascript. It reduces the time to build chat applications drastically and provides essential components like typing indicators, online presence monitoring and message history out of the box.

The real time server component is provided by PubNub. ChatEngine is designed to be extensible and includes a plugin framework to make adding new features simple.

[![](https://data.jsdelivr.com/v1/package/npm/chat-engine/badge)](https://www.jsdelivr.com/package/npm/chat-engine)
[![Build Status](https://travis-ci.org/pubnub/chat-engine.svg?branch=master)](https://travis-ci.org/pubnub/chat-engine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d8b6e41d61164170873bb8fe79bab020)](https://www.codacy.com/app/PubNub/chat-engine?utm_source=github.com&utm_medium=referral&utm_content=pubnub/chat-engine&utm_campaign=badger)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d8b6e41d61164170873bb8fe79bab020)](https://www.codacy.com/app/PubNub/chat-engine?utm_source=github.com&utm_medium=referral&utm_content=pubnub/chat-engine&utm_campaign=badger)

# Getting Started

Check out [the getting started guide](https://github.com/pubnub/chat-engine-tutorial).

# Docs

You can find the full docs on [the full documentation website](https://www.pubnub.com/docs/chat-engine/getting-started). Concepts are linked below for convenience.

# Concepts

* [Me](https://www.pubnub.com/docs/chat-engine/me) - It's you dummy. The user that represents the current application.
* [Users and State](https://www.pubnub.com/docs/chat-engine/users-and-state) - Explains how to interact with other users using ChatEngine and get additional information about them.
* [Chats](https://www.pubnub.com/docs/chat-engine/chats) - ChatEngine's bread and butter. These are isolated rooms that users can talk to each other in.
* [Events](https://www.pubnub.com/docs/chat-engine/events) - Events are things that happen in a chat. Like ```message``` or ```image_upload``` for example.
* [Event Payload](https://www.pubnub.com/docs/chat-engine/event-payload) - The data that comes with an event. Includes things like who sent the event and what chat it was sent to.
* [Namespaces](https://www.pubnub.com/docs/chat-engine/namespaces) - ChatEngine has a lot of events, so we use name spacing to isolate them.
* [Wildcards](https://www.pubnub.com/docs/chat-engine/wildcards) - Get all the events of a single namespace, like $.online.* to get all types of online events.
* [Search](https://www.pubnub.com/docs/chat-engine/search) - Retrieve old events that happened in the past. Usually done when your application boots up to show what happened before.
* [Global Chat](https://www.pubnub.com/docs/chat-engine/global-chat) - The chat that all users connect to. It's used for state management and application wide events.
* [Online List](https://www.pubnub.com/docs/chat-engine/online-list) - Get all the users online in the chat room.
* [Authentication](https://www.pubnub.com/docs/chat-engine/authentication) - How to use auth keys to identify your users and protect access to channels.
* [Privacy](https://www.pubnub.com/docs/chat-engine/privacy) - Every user has a special feed chat that only they can publish to, and a direct chat that nobody else can read from. Outlines other ways of handling permissions as well.
* [Private Chats](https://www.pubnub.com/docs/chat-engine/private-chat) - Create private chats that nobody else can join.
* [Templating](https://www.pubnub.com/docs/chat-engine/templating) - How ChatEngine works with other frameworks like React, Angular, jQuery, and plain ol' Javascript.
* [Errors](https://www.pubnub.com/docs/chat-engine/errors) - Sometimes things don't go as planned, here's how you can catch errors gracefully.
* [Debugging](https://github.com/pubnub/chat-engine/blob/master/guide/concepts/events/debugging.md) - How to use the built-in utilities for logging events and network requests.
* [Plugins](https://www.pubnub.com/docs/chat-engine/plugins) - Drop in extra functionality, like emojii or typing indicators with plugins.
* [Building a Plugin](https://www.pubnub.com/docs/chat-engine/build-a-plugin) - If what you need doesn't exist, it's easy to build yourself. Share it with us!
* [PubNub Functions](https://www.pubnub.com/docs/chat-engine/pubnub-functions) - ChatEngine uses PubNub functions as a server component and details about that can be found here.
* [PubNub Channel Topology](https://www.pubnub.com/docs/chat-engine/pubnub-channel-topology) - Describes what PubNub channels ChatEngine is using under the hood.

# Examples

## SDKs

### Javascript

* [Chat](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/chat.html)
* [Friends List](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/friends-list.html)
* [Online List](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/online-list.html)

### jQuery

* [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink)
* [jQuery Simple](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/simple)

### Angular

* [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron)
* [Angular Simple](https://github.com/pubnub/chat-engine-examples/tree/master/angular/simple)

### React

* [React](https://github.com/pubnub/chat-engine-examples/tree/master/react)

## 3rd Party Authentication

* [Facebook Login](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/facebook-login.html)

## NodeJS + Chatbot

* [NodeJS ChatBot](https://github.com/pubnub/chat-engine-examples/blob/master/nodejs/bot.js)

## Plugins

Check out the [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink) and [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron) examples to see plugins in action.

- [Desktop Notifications](https://github.com/pubnub/chat-engine-desktop-notifications)
- [Emoji Support](https://github.com/pubnub/chat-engine-emoji)
- [Event Status and Read Receipts](https://github.com/pubnub/chat-engine-event-status)
- [Gravatar Support](https://github.com/pubnub/chat-engine-gravatar)
- [Image Uploads](https://github.com/pubnub/chat-engine-uploadcare)
- [Markdown Support](https://github.com/pubnub/chat-engine-markdown)
- [Mute Users](https://github.com/pubnub/chat-engine-muter)
- [Online User Search](https://github.com/pubnub/chat-engine-online-user-search)
- [Persistent Message History](https://github.com/pubnub/chat-engine-history)
- [Random Usernames](https://github.com/pubnub/chat-engine-random-username)
- [Typing Indicator](https://github.com/pubnub/chat-engine-typing-indicator)
- [Unread Messages](https://github.com/pubnub/chat-engine-unread-messages)

## Other usage examples

The integration tests in ```test/integration``` includes some usage examples.

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

## Setting up environment

```
nvm use v6
```

run ```http-server``` from my ```/development``` directory which has all chat-engine repos:


```cd chat-engine```

```node server.js```

load http://localhost:8080 in browser and navigate to /chat-engine-examples/jquery/kitchen-sink

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

## PubNub Functions and Account Setup

You can find the scripts for the [PubNub Automagic Setup](https://www.pubnub.com/docs/chat-engine/getting-started) here:
[https://github.com/pubnub/chat-engine-setup](https://github.com/pubnub/chat-engine-setup).

## Releasing a patch (chat engine and plugins)

```
npm version patch && git push origin master --tags
```
