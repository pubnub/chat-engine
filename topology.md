PubNub Channel Topology:

```
ChatEngine.globalChat.channel
demo
```

demo.ian.feed
demo.ian.direct
demo.ian.direct.private-invite

demo.privChat
demo.privChat.message
demo.privChat.$typingIndicator.startTyping
```


"demo" == ;
"ian" = new User('ian').uuid;

"feed" == ian.feed.channel;
"direct" == ian.direct.channel;

"private-invite" -= ian.direct.send('private-invite');

"privChat" == chat.channel == new Chat('private-chat').channel;

"message" = chat.send('message');

"$typingIndicator" == chat.plugin(typingIndicator()); chat.on('$typingIndicator.startTyping');

```
