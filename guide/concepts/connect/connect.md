## Connect User to ChatEngine

<!-- ## CE Client Initialization

The CE architecture consists of a client side running CE client code and a backend side (PubNub Functions) handling various server-side ops such as authorization via PAM. -->

## Connect ChatEngine.Global

When a user initializes CE, the client tries to first perform a connection handshake. A series of four ```ChatEngine.request()``` are made in order to connect the user to the default set of CE channels. These channels are generated based on the ```ChatEngine.global```  and the user's ```UUID``` strings.

Each request made to the PubNub CE Function controller sets up ACLs for either ```channels``` _or_ ```channelGroups``` array. Granting either ```read``` and or ```write``` access to an array of ```channels```. Effectively, these requests make up basic CE user authorization.

| HTTP method | controller\* |  read | write | channels| channelGroups| authKeys | ttl [sec]|
|:-----------:|:----------:|:--------:|:----:|:-----|:-----|:-----:|:-------:|
| ```POST``` | ```bootstrap``` | ```true``` | ```true``` | [```global```,<br>```global-pnpres```,<br>```global#chat#public.*```,<br>```global#user#UUID#me.*```,<br>```global#user#UUID#read.*```,<br>```global#user#UUID#write.*```]| | [```request.body.authKey```]| ```request.body.ttl```<br>_or_<br>```10800``` |
|  ```POST``` | ```user_read``` | ```true``` | ```false``` | ```global#user#UUID#read.*```| | |```request.body.ttl```<br>_or_<br>```10800``` | || ```request.body.ttl```<br>_or_<br>```10800```|
|  ```POST``` | ```user_write``` | ```false``` | ```true``` | ```global#user#UUID#write.*``` || | ```request.body.ttl```<br>_or_<br>```10800``` ||
|  ```POST``` | ```group``` | ```true``` |  | | [```global#UUID#rooms```,<br>```global#UUID#rooms-pnpres```,<br>```global#UUID#system```,<br>```global#UUID#system-pnpres```,<br>```global#UUID#custom```,<br>```global#UUID#custom-pnpres```] | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800``` |

> \* ```controller``` field used to properly route grant requests within the PubNub CE Function
> <br>If field left blank, argument was not used with ```pubnub.grant()```function.

Once all of the above requests have made, CE.global awaits a ```$.connected``` event to be emitted, signaling a successful CE connection to the default global chats.


## Connect to ChatEngine.Me

Once CE has connected the default global channels, CE will create a ```ChatEngine.Me``` class which extends the ```ChatEngine.User``` class.

> FYI: ChatEngine.User is an extension of the ```ChatEngine.Emitter``` class.

Similar to connecting to ```ChatEngine.global```, CE then uses the PubNub CE Function controller to grant user access to their ```ChatEngine.Me``` chat channels. The ACLs defined for the ```Me``` chat channels restricts other users from reading or writing content on that channel.   


| HTTP method | controller\* |  read | write | channels| channelGroups| authKeys | ttl [sec]|
|:-----------:|:----------:|:--------:|:----:|:-----|:-----|:-----:|:-------:|
| ```POST```	| ```grant``` | ```true``` | ```true``` | [```global#user#UUID#write.#direct```,<br>```global#user#UUID#write.#direct-pnpres```] | | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```
| ```POST``` | ```grant``` |  ```true``` | ```true``` | [```global#user#UUID#read.#feed```,<br>```global#user#UUID#read.#feed-pnpres```]| | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```
| ```POST```** | ```grant``` |  ```true``` | ```true``` | [```global#user#UUID#me.#sync```,<br>```global#user#UUID#me.#sync-pnpres```]| | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```

> \** The last row's ```grant``` request only made if user has configured ```ceConfig.enableSync: true```

After each grant request, CE will make a ```join``` request to the PubNub CE Function controller in order to add the above channels to the _system_```channelGroup```.

Once the above has completed, CE will emit an ```$.ready``` event to signal a successful connection to ```ChatEngine.Global``` and ```ChatEngine.Me```.

## User State

The {@link ChatEngine#connect| ```ChatEngine.connect()``` } method also allows {@link Me} user to include a state that can be shared with other users connected to the platform. The state is stored in PubNub for the time a user is connected and removed when the user disconnects.

```js
ChatEngine.connect('john-UUID', {
	name: 'John Doe',
    team: 'red'
});
```

### Listen to ```$.state``` Event

A ```$.state``` event is emitted to all online users when a {@link User| ```User``` } connects to ChatEngine.

```js
ChatEngine.global.on('$.state', (payload) => {
    console.log(payload.user + ' state: ' + payload.state);
});
```

### Get User State

A user's stateful information can be retrieved by calling {@link User#state| ```User.state``` } when the user is online. A user's state can also be retrieved after the user goes offline by calling ```User.getStoredState()``` (TODO: need a code ref!!!)

### Update user state

We can update Me's {@link Me#state| ```state``` } on the network with the {@link Me#update| ```Me.update()``` } method. When a user updates its {@link Me#state| ```state``` }, another ```$.state``` event is emitted.

```js
me.update({
	  name: 'John Doe',
    color: 'green'
});
```

## List All Users Online

A list of all online users who have joined a chat room is available from {@link Chat#users| ```Chat.users``` }. The list is kept in sync as users join and leave the chats.

Calling {@link Chat#users| ```Chat.users``` } returns a list of users who have also joined this chat.

```js
{
  ian: {},
  craig: {},
  jill: {}
}
```

The client can also call {@link ChatEngine#users| ```ChatEngine.users``` }  to retrieve a list of all users connected to this instance of {@link ChatEngine}.


### Find a user

A particular user can be retrieved from the {@link ChatEngine#users| ```ChatEngine.users``` } list by providing the user’s ```UUID``` as seen below:

```js
let stephen = ChatEngine.users['stephen-UUID'];
```

ChatEngine does **not** maintain a list of offline users. Clients can however send messages to offline user using a user’s UUID if they have connected to ChatEngine in the past.

```js
let joe = new ChatEngine.User('joe-UUID');
```
