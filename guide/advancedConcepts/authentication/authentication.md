## Native Authentication Support

Currently, PubNub does not offer an authentication API solution (only [Authorization](security.md#authorization)).

To apply authentication logic to ChatEngine, one must update the [PubNub CE Function's](pubnubFunctions.md#PubNub CE Function) ```authPolicy()``` function to authenticate via a **3rd-Party** provider such as GitHub, Facebook, Google, etc.

## High Level Design for Supporting 3rd-Party Authentication

### Authentication Design Paradigm

Unfortunately, at the time of writing, CE developers must manually implement authentication. Currently, CE's best option is to leverage a 3rd-Party authentication API. The general architectural design is as follows:

### Architectural design

When a user initializes default CE, a number of asynchronous requests are made from the CE client to the PubNub CE Function serving as the backend. Without authentication, a user would automatically be [authorized](security.md#authorization) using their ```UUID``` and optionally an ```authKey```.

The PubNub CE Function passes these requests through an ```authPolicy()``` function that by default allows any user (with the arguments specified above) to connect to CE. In order to prevent this, a CE developer must update the PubNub CE Function's ```authPolicy()``` function to make a authentication request attempt against some 3rd-party authentication service.

If the 3rd-party authentication attempt is successful, CE developers may add cached responses via the ```kvstore``` module. That way a CE Function (i.e. backend server) doesn't need to make requests to the 3rd party authentication micro-service on every published CE message.
