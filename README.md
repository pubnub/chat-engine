
# PubNub ChatEngine

PubNub ChatEngine is an object oriented event emitter based framework for building chat applications in Javascript. It reduces the time to build chat applications drastically and provides essential components like typing indicators, online presence monitoring and message history out of the box.

The real time server component is provided by PubNub. ChatEngine is designed to be extensible and includes a plugin framework to make adding new features simple.

# New in v0.7.0

- {@link Chat#search New Search (History) Class}
    - ```chat.search({event: 'message'}).on('messsage', () => {})```.
    - Search returns event emitter for superior code quality
    - Search now pages to iterate over complete history
    - Ability to search between dates
    - Events for {@link Search#event:$"."search"."start $.search.start} and {@link Search#event:$"."page"."request $.page.request}
- Functions auto setup in setup.js
- Unit testing coverage
- Ability to subscribe to events indicating a class was created locally
    - {@link ChatEngine#event:$"."created"."chat ChatEngine#$.created.chat}
    - {@link ChatEngine#event:$"."created"."user ChatEngine#$.created.user}
    - {@link ChatEngine#event:$"."created"."me ChatEngine#$.created.me}
- Source of ```ChatEngine``` events available as second param in callback.
    - ```ChatEngine.on('$.created.chat', (payload, chat) => {})```;
- Full es6 class syntax
- protoPlugin() -> {@link ChatEngine#proto}
- Docs updated
    - Docs rendering repaired
    - Docs migrated from 0.4.x -> 0.6.x
    - Improved hyperlinks between events and methods
    - Docs build process in gulp (```compile_docs```, ```watch_docs```, ```serve_docs```, and ```docs_dev``` to do all three).

# Getting Started

Check out [the getting started guide](https://github.com/pubnub/chat-engine/tree/master/getting-started.md).

#   Docs

You can find the full docs on [the full documentation website](https://chat-engine-docs.surge.sh/docs/).

# Examples

## SDKs

### Javascript

* [Chat](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/chat.html)
* [Online List](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/online-list.html)
* [Friends List](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/friends-list.html)

### NodeJS

* [Bot](https://github.com/pubnub/chat-engine-examples/tree/master/nodejs)

### jQuery

* [jQuery Simple](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/simple)
* [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink)

### Angular

* [Angular Simple](https://github.com/pubnub/chat-engine-examples/tree/master/angular/simple)
* [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron)

### React

* [React](https://github.com/pubnub/chat-engine-examples/tree/master/react)

## 3rd Party Authentication

* [Facebook Login](https://github.com/pubnub/chat-engine-examples/blob/master/javascript/facebook-login.html)

## Chatbot

* [NodeJS ChatBot](https://pubnub.github.io/chat-engine/examples/bot.js)

## Plugins

Check out the [jQuery Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/jquery/kitchen-sink) and [Angular Kitchen Sink](https://github.com/pubnub/chat-engine-examples/tree/master/angular/flowtron) examples to see plugins in action.

- [Unread Messages](https://github.com/pubnub/chat-engine-unread-messages)
- [Typing Indicator](https://github.com/pubnub/chat-engine-typing-indicator)
- [Random Usernames](https://github.com/pubnub/chat-engine-random-username)
- [Desktop Notifications](https://github.com/pubnub/chat-engine-desktop-notifications)
- [Online User Search](https://github.com/pubnub/chat-engine-online-user-search)
- [Image Uploads](https://github.com/pubnub/chat-engine-uploadcare)
- [Persistent Message History](https://github.com/pubnub/chat-engine-history)
- [Markdown Support](https://github.com/pubnub/chat-engine-markdown)
- [Emoji Support](https://github.com/pubnub/chat-engine-emoji)
- [Gravatar Support](https://github.com/pubnub/chat-engine-gravatar)

## Other usage examples

[Test.js](test.js) includes some usage examples



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
chat-engine-gravatar
chat-engine-markdown
chat-engine-marketing
chat-engine-online-user-search
chat-engine-plugin
chat-engine-random-username
chat-engine-tutorial
chat-engine-typing-indicator
chat-engine-unread-messages
chat-engine-uploadcare
```

## Setting up environment

```
nvm use v6
```

run ```http-server``` from my ```/development``` directory which has all chat-engine repos:


```cd chat-engine```

```node server.js```

load http://localhost:8080 in browser and navigate to /chat-engine-examples/jquery/kitchen-sink


## Running Anything

1. Must have ```server.js``` running.
2. If working with history, deploy the code in ```/functions``` to PubNub blocks. See ```/functions/readme.md```.

## Compiling

Run ```gulp``` to compile, but you should probably run ```gulp watch``` to get consistent changes.

## Running Tests

Run ```gulp test```.

## Releasing a patch (chat engine and plugins)

```
npm version patch && git push origin master --tags
```
