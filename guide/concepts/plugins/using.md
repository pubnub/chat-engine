### Using Plugins

#### Node

It's super easy to use plugins in NodeJs. Just include the file like any other
dependency and attach it to your ChatEngine objects.

```js
// include the plugin from the remote file
const myPlugin = require('plugin.js');

// create a new chatroom
let someChatroom = new ChatEngine.Chat('new-channel');

// attach the plugin to the new chatroom
someChatroom.plugin(myPlugin(config));
```

#### Web

You'll need the ```chat-engine-plugin``` tool described in the next section to
build the package for web.

Once you build the pckage you would include the plugin with a ```<script>``` tag like:

```html
<script src="/web/plugin.js"></script>
```

And the plugin will be available under ```ChatEngineCore.plugin[namespace]```.
The namespace is defined in package.json and you can learn more about it in the
next section.

Once the plugin is available, you can attach it to ChatEngine objects like we do in the
Node version.

```js
let someChatroom = new ChatEngine.Chat('new-channel');
someChatroom.plugin(ChatEngineCore.plugin.myPlugin(config));
```

## Open Chat Framework Plugin Tool

This is a build tool for Open Chat Framework plugins. Because ChatEngine works
on the front and back end, the plugin system requires a standardized method
for building for web.

This build process assures us that the plugin can be used identically on
both web and nodeJS. It uses browserify to compile assets.

It's main features are:

- Name spacing plugins to avoid collisions
- Preventing global scope leak in browser
- Consistent API for integration on web and node
- Singular tests for web and node

## Setup

Install the tool globally.

```sh
npm install chat-engine-plugin -g
```

When used in a browser, this will provide your plugin as a property of the
global ```ChatEngineCore.plugin``` property.

```ChatEngineCore.plugin.emoji```.

This helps to avoid collisions with
global variables. Be careful to avoid collisions with other ChatEngine plugins!

## Run chat-engine-plugin

Then, just run ```chat-engine-plugin``` from the command line. This will bundle your
```plugin.js``` file and it's dependencies so it can be used on the web.
