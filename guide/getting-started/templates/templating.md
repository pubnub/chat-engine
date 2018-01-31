ChatEngine does not contain any premade templates or GUI code as part of the
main package (they're are plenty in the example repository however).

ChatEngine leaves the design and interaction up to you. It provides events,
methods, and data but does not make any assumptions of template engines.

ChatEngine works on both the front and back ends, with popular frameworks like
jQuery, React, Angular, React Native, NodeJS, and good old Javascript.

For example, to publish a message to a {@link Chat} you may bind a DOM ```onSubmit()``` event to
the {@link Chat#emit} method.

So, let's create a chat:

```js
// create a new chat
let chat = new ChatEngine.Chat('example-chat');
```

Create a place for message  output and give the user a way to fire the event:

```html
<div id="output"></div>
<button type="submit" onclick="sendChat()">Send</button>
```

The ```sendChat()``` method fires {@link Chat#emit}.

```js
// send a message to all users in the chat
function sendChat() {

    chat.emit('message', {
        text: 'hello world!'
    });

};
```

Then, when the message is recieved by the client:

```js
// get the DOM element in Javascript
let output = document.getElementById('output');

// when the event is received
chat.on('message', (payload) => {

    output.innerHTML = output.innerHTML + payload.data.text;

});
```

## Data Binding (Angular and React)

ChatEngine has a local data system that keeps data about {@link Chat}s and {@link User}s in sync. So when working with data bound system we get some functionality for free!

For example in angular:

```
<ul id="online-list">
    <li ng-repeat="(uuid, user) in chat.users">
        <a href="#" ng-click="chat.invite(user)">{{user.state.username}}</a>
    </li>
</ul>
```

Note that binding ChatEngine data to Angular requires forcefully telling Angular that something has changed. The following is a small Angular plugin that, when loaded, will render your Angular app anytime anything changes in ChatEngine.

```js
// plugin
angular.module('my-app', [])
.service('ngChatEngine', ['$timeout', function($timeout) {

    this.bind = function(ChatEngine) {

        // updates angular when anything changes
        ChatEngine.onAny(function(event, payload) {
            $timeout(function() {});
        });

    }

}]);

// in your app
angular.module('chatApp', ['my-app'])
.run(['$rootScope', 'ngChatEngine', function($rootScope, ngChatEngine) {

    // ChatEngine Configure
    $rootScope.ChatEngine = new ChatEngineCore({});

    // bind open chat framework angular plugin
    ngChatEngine.bind($rootScope.ChatEngine);

}])

```
