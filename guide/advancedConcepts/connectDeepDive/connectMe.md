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
