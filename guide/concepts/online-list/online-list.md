### Online List

![](/getting-started/assets/README-c71c143b.png)

A list of all the clients who have joined the chatroom is available from {@link Chat#users}.

```js
console.log(chat.users);
```

It returns a list of {@link User}s who have also joined this {@link Chat}.

```js
{
  ian: {},
  nick: {}
}
```

This property is kept in sync as {@link User}s join and leave the {@link Chat}s. If you're using
a library like React or Angular, you can simply loop through ```chat.users```
to render list of online users.

### Online Events

The list of

* When first joining a {@link Chat}, the {@link Chat} will emit {@link Chat#event:$"."online"."here $.online.here} for every {@link User} in the room.
* Any time a new {@link User} joins, the {@link Chat} emits {@link Chat#event:$"."online"."join $.online.join}.

Here we subscribe both events with wildcard syntax (```$.online.*```).

```js
chat.on('$.online.*', (newUser) -> {
  console.log('new user', newUser);
});
```

### Hooking it up to a GUI

Let's combine the information above into a small app that logs when you and other users come online.

![](/guide/getting-started/assets/README-c71c143b.png)

First, we'll create a function to log messages into HTML.

Add the following to the ```<body>``` of ```index.html``` to build a place-holder for our log.

```html
<div class="container">
  <div class="row">
      <div class="col-sm-6 col-sm-offset-3">
        <div class="list-group" id="log">
        </div>
      </div>
  </div>
</div>
```

Next, we'll create a function that adds  ```username: text``` as a line in the log.

```js
const appendMessage = (username, text) => {

  let message =
    $('<div class="list-group-item" />')
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));

  $('#log').append(message);

  $("#log").animate({ scrollTop: $('#log').prop("scrollHeight") }, "slow");

};
```

Then, listen for the ```$.ready``` event to find out when the client is connected to the {@link Chat}.

```js
ChatEngine.on('$.ready', (payload) => {
  appendMessage('Status', 'Connected to chat!');
});
```

We subscribe to the ```$.online.*``` event to learn about online {@link User}s.

```js
ChatEngine.on('$.online.*', (payload) => {
  appendMessage('Status', payload.user.uuid + ' is in this room!');
});
```

You should see a message showing that ```ian``` has come online and that connection has been established.

![](/guide/getting-started/assets/README-c71c143b.png)
