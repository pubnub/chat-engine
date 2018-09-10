# PubNub Functions
A while back, PubNub introduced a new microservice-like feature within PubNub's PubSub architecture. PubNub Functions allows users to inject javascript logic on a specific ```channel``` which a Function is registered to.

PubNub offers a number of Function types:

1. [```On Request```](https://www.pubnub.com/docs/blocks/function-types#on-request) LINK DOES NOT HAVE ANY HELPFUL INFO.
2. [```On Before Publish or Fire```](https://www.pubnub.com/docs/blocks/function-types#sync-et-before-pub-fire)
3. [```On After Publish or Fire```](https://www.pubnub.com/docs/blocks/function-types#async-et-after-pub-fire)
4. [```On After Presence```](https://www.pubnub.com/docs/blocks/function-types#async-et-after-presence-event)

In the context of CE, only the ``onRest`` Function is required for basic CE security. The ```onRest``` Function operates just as any other REST API would.


## On Request Function
At the time of writing, no ```On Request``` docs exist so here goes.

Unlike the other PubNub Function types listed above, the ```On Request``` Function operates differently in that the ```On Request``` Function does not listen to msgs sent on a pub/sub channel. Rather, similar to any other RESTful API, an HTTP request is made to the specified Function URL which uses a string as the API URL endpoint. An example ```On Request``` Function REST url could look like the following:

## PubNub CE Functions

In the context of CE, PubNub's Functions operates as the backend server to the CE client. The PubNub CE Function includes ```controller``` logic which acts as a simple RESTful API router. The controller includes many various methods, but most importantly handles the [authorization](security.md#Authorization) of users to CE public and private chats.   
