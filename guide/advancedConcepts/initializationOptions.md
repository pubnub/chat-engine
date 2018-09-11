When <a href=tutorial-configuration.html#Initialization>initializing</a> {@link ChatEngine | ```ChatEngine``` }, one may add the following configuration options to modify the ChatEngine runtime.

## pnConfig

## ceConfig

Properties

{@link ChatEngine#connect}

{@link ChatEngine#.global| ```globalChannel``` }

| Name	|    Type    |   Attributes  |   Default |   Description |
|:-----:|:----------:|:-------------:|:---------:|:--------------|
|  | ```string``` | _optional_ | ```chat-engine``` | The root channel. See  {@link ChatEngine#[2]| ```ChatEngine.global``` }.

globalChannel	String	<optional>	chat-engine	The root channel. See ChatEngine.global
enableSync	Boolean	<optional>		Synchronizes chats between instances with the same Me#uuid. See Me#sync.
throwErrors	Boolean	<optional>	true	Throws errors in JS console.
endpoint	String	<optional>	'https://pubsub.pubnub.com/v1/blocks/sub-key/YOUR_SUB_KEY/chat-engine-server'	The root URL of the server used to manage permissions for private channels. Set by default to match the PubNub functions deployed to your account. See Privacy for more.
debug	Boolean	<optional>		Logs all ChatEngine events to the console This should not be enabled in production.
profile	Boolean	<optional>		Sums event counts and outputs a table to the console every few seconds.




## Debugging ChatEngine Events

## Debugging PubNub SDK Events
