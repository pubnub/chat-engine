## Connect ChatEngine.Global

When a user initializes CE, the client tries to first perform a connection handshake. A series of four ```ChatEngine.request()``` are made in order to connect the user to the default set of CE channels. These channels are generated based on the ```ChatEngine.global```  and the user's ```UUID``` strings.

Each request made to the PubNub CE Function controller sets up ACLs for either ```channels``` _or_ ```channelGroups``` array. Granting either ```read``` and or ```write``` access to an array of ```channels```. Effectively, these requests make up basic CE user authorization.

| HTTP method | controller\* |  read | write | channels| channelGroups| authKeys | ttl [sec]|
|:-----------:|:----------:|:--------:|:----:|:-----|:-----|:-----:|:-------:|
| ```POST``` | ```bootstrap``` | ```true``` | ```true``` | [```global```,<br>```global-pnpres```,<br>```global#chat#public.*```,<br>```global#user#UUID#me.*```,<br>```global#user#UUID#read.*```,<br>```global#user#UUID#write.*```]| | [```request.body.authKey```]| ```request.body.ttl```<br>_or_<br>```10800``` |
|  ```POST``` | ```user_read``` | ```true``` | ```false``` | ```global#user#UUID#read.*```| | |```request.body.ttl```<br>_or_<br>```10800``` | |
|  ```POST``` | ```user_write``` | ```false``` | ```true``` | ```global#user#UUID#write.*``` || | ```request.body.ttl```<br>_or_<br>```10800``` ||
|  ```POST``` | ```group``` | ```true``` |  | | [```global#UUID#rooms```,<br>```global#UUID#rooms-pnpres```,<br>```global#UUID#system```,<br>```global#UUID#system-pnpres```,<br>```global#UUID#custom```,<br>```global#UUID#custom-pnpres```] | [```request.body.authKey```] | ```request.body.ttl```<br>_or_<br>```10800``` |

> \* ```controller``` field used to properly route grant requests within the PubNub CE Function
> <br>If field left blank, argument was not used with ```pubnub.grant()```function.

Once all of the above requests have made, CE.global awaits a ```$.connected``` event to be emitted, signaling a successful CE connection to the default global chats.
