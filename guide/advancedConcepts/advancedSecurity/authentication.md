## Native Authentication Support

Currently, PubNub does not offer an authentication API solution (only [Authorization](security.md#authorization)).

To apply authentication logic to ChatEngine, you must update the [PubNub ChatEngine Function's](pubnubFunctions.md#PubNub CE Function) ```authPolicy()``` function to authenticate via a **3rd-Party** provider such as GitHub, Facebook, Google, etc.

## High Level Design for Supporting 3rd-Party Authentication

### Authentication Design Paradigm

ChatEngine developers must implement authentication manually. The most effective approach is to leverage a 3rd-Party authentication API. The general architectural design is as follows:

### Architectural design

When a user initializes default ChatEngine, a number of asynchronous requests are made from the ChatEngine client to the PubNub ChatEngine Function serving as the backend. Without authentication, a user would automatically be [authorized](security.md#authorization) using their ```UUID``` and, optionally, an ```authKey```.

The PubNub ChatEngine Function passes these requests through an ```authPolicy()``` function that, by default, allows any user (with the arguments specified above) to connect to ChatEngine. In order to prevent this, a ChatEngine developer must update the PubNub ChatEngine Function's ```authPolicy()``` function to make an authentication request attempt against a specified 3rd-party authentication service.

If the 3rd-party authentication attempt is successful, ChatEngine developers may add cached responses via the ```kvstore``` module. That way a ChatEngine Function (i.e. backend server) can used the cached responses rather than having to make requests to the 3rd party authentication micro-service on every published ChatEngine message.
