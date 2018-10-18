A plugin allows developers to add nearly any functionality to ChatEngine. This functionality can be as simple as a typing indicator or searching for online users. Developers can build their own custom plugin(s) so that any functionality they might need can be added to ChatEngine!

## Plugin Anatomy
A plugin is a NodeJS module that exports a mixin-like object that augments ChatEngine objects. This effectively hooks into the events ChatEngine creates and allows the developer to do anything before or after an {@link Event| ```Event``` } happens.

The plugin entry must be a file called ```plugin.js``` in the root directory. From this file you can require any other file as normal, but the entry must be ```plugin.js``` Every plugin must return an object containing the property ```namespace``` and ```middleware``` or ```extends```. One use case would be to modify ChatEngine objects and add new methods to them. For example, this plugin adds a method called ```newMethod()``` to the {@link Chat| ```Chat``` } class.

```js
// newmethod/plugin.js
module.exports = {
  return {
      extends: {
          Chat: {
              construct: (options) => {
                 // this is called when the plugin is attached to the Chat
                 // the Chat object is available through this.parent
                  console.log('I am extending', this.parent, 'with options', options);
              },
              newMethod: () => {
                 // this is a new method that gets attached to Chat as Chat.newMethod()
                  console.log('New Method Fired - this Chat object is available as this.parent');
              }
          }
      }
  }

}
```

To actually use the plugin you can attach it to a {@link Chat| ```Chat``` } object.

```js
// include the plugin via require
newMethodPlugin = require('newmethod/plugin.js');


// create a chat for the plugin to attach to
chat = new ChatEngine.Chat('my-plugin-chat');

// attach the plugin to the chat
// newMethodPlugin.construct() is called and console log is fired
chat.plugin(newMethodPlugin({
  myparam: true
}));

// Console: I am extending ChatEngine.Chat with options {myParam: true}
chat.newMethod();

// Console: New Method Fired - this Chat object is available as this.parent
this.parent
```

When the plugin is installed, every instance of {@link Chat| ```ChatEngine.Chat``` } will have a new method called ```newMethod()```. You can call the method like ```someChat.newMethod()```.
