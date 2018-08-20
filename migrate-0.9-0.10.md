We're proud to release the next version of ChatEngine, 0.10.20. This new
version has major focus on improving efficiency and usability.

By popular request, we've reworked the SDK to no longer require a
global Chat. The SDK will still operate with a global Chat by default
for convenience and easy setup, but power users can disable it.

# Optional Global Chat

The ChatEngine configuration has been modified to fit this new functionality.

```js
let ChatEngine = ChatEngineCore.create({}, {
    namespace: 'ce-ng-simple',
    enableGlobal: true
});
```

As ```globalChannel``` is no longer mandatory, we've renamed this
configuration option to ```namespace```.

If you'd like to disable the global chat entirely, you can supply
```enableGlobal: false``` into the config.

# State per Chat

With this change, we've also introduced the ability to introduce User state in
every Chat, not just the global. This means a User can now be set as "away" in
your "Main" channel but "here" in private chat 1-on-1. Sneaky.

This means the ```User.state``` property is now a method (```User.state()```).
The first parameter is the Chat needed to restore state, but this defaults to
the globalChat anyway. If you supply ```enableGlobal: false``` in the config,
supplying the Chat parameter becomes mandatory.

```html
<img src="{{user.state.picture}}" class="avatar">
```

```html
<img src="{{user.state().picture}}" class="avatar">
```


      - type: improvement
        text: Online and offline events fire more reliablity.
      - type: improvement
        text: $.ready returns Me rather than the object {me: Me}.
      - type: improvement
        text: Document all emitted errors, provide more accurate namespacing for error events.
      - type: feature
        text: Chat config is now a single parameter object {autoConnect: false} rather than individual parameters. This makes it easier to design flags in the future
      - type: feature
        text: .restoreState(ChatEngine.global) restores the user state from the kv-store before events are emitted. Works for both Chat and Search.
      - type: feature
        text: Adds the ability to disable globalChannel preventing transactions for users who do not use it.
      - type: feature
        text: State can be set within specific chats.
      - type: improvement
        text: Errors are properly caught by promise rejections.
      - type: improvement
        text: References to globalChannel are now called namespace.
      - type: improvement
        text: Message augmentation further isolated into plugin structure.
      - type: improvement
        text: PubNub HereNow only called a single time.
