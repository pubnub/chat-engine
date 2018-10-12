## PubNub Functions
A while back, PubNub introduced a new microservice-like feature within PubNub's PubSub architecture. PubNub Functions allows users to inject javascript logic on a specific ```channel``` which a Function is registered to.

PubNub offers a number of Function types:

1. [```On Request```](https://www.pubnub.com/docs/blocks/function-types#on-request) LINK DOES NOT HAVE ANY HELPFUL INFO.
2. [```On Before Publish or Fire```](https://www.pubnub.com/docs/blocks/function-types#sync-et-before-pub-fire)
3. [```On After Publish or Fire```](https://www.pubnub.com/docs/blocks/function-types#async-et-after-pub-fire)
4. [```On After Presence```](https://www.pubnub.com/docs/blocks/function-types#async-et-after-presence-event)

In the context of CE, only the ``onRequest`` Function is required for basic CE security. The ```onRequest``` Function operates just as any other REST API would.
