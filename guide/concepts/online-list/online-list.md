### See who else is online

![](/guide/getting-started/assets/README-c71c143b.png)

A list of all the clients who have joined the chatroom is available from ```chat.users```.

```js
console.log(chat.users);
```

It returns a list of ```Users``` who have also joined this chat.

```js
{
  ian: {},
  nick: {}
}
```

When a new ```User``` comes online, the ```Chat``` emits the ```$.online``` event.

```js
chat.on('$.online', (newUser) -> {
  console.log('new user', newUser);
});
```

## Hooking it up to a GUI

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
    $(`<div class="list-group-item" />`)
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));

  $('#log').append(message);

  $("#log").animate({ scrollTop: $('#log').prop("scrollHeight") }, "slow");

};
```

Then, listen for the ```$.ready``` event to find out when the client is connected to the ```Chat```.

```js
chat.on('$.ready', (payload) => {
  appendMessage('Status', 'Connected to chat!');
});
```

We can also subscribe to the ```$.online``` event to find out when other ```User```s are online.

```js
chat.on('$.online', (payload) => {
  appendMessage('Status', payload.user.uuid + ' has come online!');
});
```

You should see a message showing that ```ian``` has come online and that connection has been established.

![](/guide/getting-started/assets/README-c71c143b.png)
