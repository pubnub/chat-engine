## Connect to ChatEngine.Me

Once ChatEngine has connected the default global channels, ChatEngine will create a ```ChatEngine.Me``` class which extends the ```ChatEngine.User``` class.

> Note: ChatEngine.User is an extension of the ```ChatEngine.Emitter``` class.

Similar to connecting to ```ChatEngine.global```, ChatEngine then uses the PubNub ChatEngine Function controller to grant user access to their ```ChatEngine.Me``` chat channels. The access control levels defined for the {@link Me| ```Me```} chat channels restrict other {@link User| ```User```s } from reading or writing content on that channel.   


| HTTP method | controller\* |  read | write | channels| channelGroups| authKeys | ttl [sec]|
|:-----------:|:----------:|:--------:|:----:|:-----|:-----|:-----:|:-------:|
| ```POST```	| ```grant``` | ```true``` | ```true``` | [```global#user#UUID#write.#direct```,<br>```global#user#UUID#write.#direct-pnpres```] | | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```
| ```POST``` | ```grant``` |  ```true``` | ```true``` | [```global#user#UUID#read.#feed```,<br>```global#user#UUID#read.#feed-pnpres```]| | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```
| ```POST```** | ```grant``` |  ```true``` | ```true``` | [```global#user#UUID#me.#sync```,<br>```global#user#UUID#me.#sync-pnpres```]| | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800```

> \** The last row's ```grant``` request is only made if the user has configured ```ceConfig.enableSync: true```

After each grant request, ChatEngine will make a ```join``` request to the PubNub ChatEngine Function controller in order to add the above channels to the ```system``` ```channelGroup```.

Once the above has completed, ChatEngine will {@link Chat#emit| ```emit()``` } a {@link ChatEngine#event:$"."ready| ```$.ready``` } {@link Event| ```Event``` } to signal a successful connection to {@link ChatEngine#global| ```ChatEngine.global``` } and {@link Me| ```ChatEngine.Me``` }.
