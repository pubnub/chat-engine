## Chats

But what about chat rooms?

In ```app.js```, add the following:

```js
let chat = new ChatEngine.Chat('tutorial-chat');
```
This creates a new ```Chat``` object. The ```Chat``` object represents a chatroom that connects one client to another.

The ```Chat``` state is synchronized between all connected clients. When this client runs ```new ChatEngine.Chat()```, it connects to the PubNub network and gets information about that chat room.

For example, ```chat.users``` contains a list of all the other ```User```s online in the chat. That list of users will update automatically.

The client (```me```) joins ```Chat```s automatically when they are created on the client.

> Remember, those other ```User```s are ```me``` on someone else's computer. A real practice in empathy.
