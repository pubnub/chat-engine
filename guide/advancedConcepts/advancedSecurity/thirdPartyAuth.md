# How to Use This Guide
The following guide shows ChatEngine developers how to setup 3rd party authentication. To clearly illustrate the approach, a _Facebook Login App_ is used as the authenticator. Regardless of which 3rd party service is used, the security mechanics remain the same.

> 1. ChatEngine client inputs login credentials to 3rd party authenticator
> 2. 3rd party returns authKey upon successful authentication
> 3. ChatEngine server receives authKey and grants/authorizes user access to appropriate ChatEngine channels (for time specified by authTTL) via [PAM](https://www.pubnub.com/docs/pubnub-rest-api-documentation#pubnub-access-manager-pam).


# How ChatEngine 3rd Party Authentication Works

This guide explains how to setup 3rd authentication within the ChatEngine platform. Its important to note that the following security pattern is not restricted to using the Facebook Login App service:  it can be used in conjunction with substantially any third-party authentication service.

### Login flow to 3rd Party Provider via ChatEngine (e.g. FB Login App):

![Flowchart0](./ChatEngineAuthFB1.png "Blah")

### Publish Chat Message (post-login routing):

![Flowchart1](./ChatEngineAuthMsgFlow.png "Blah")

## JS SDK connects to servers with a Facebook uuid and authToken

The Facebook JS SDK provides a method to login (and a GUI element too!). When Facebook tells us we're logged in, we boot ChatEngine with the authentication information that get from Facebook. This includes a user object, an id, and the Facebook Access Token.

Check out the docs for [Facebook Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens) and the properties for [ChatEngine.connect()](https://www.pubnub.com/docs/chat-engine/reference/chatengine#connect).

```js
function buildChatEngine(fbMe, fbAccessToken) {
    ChatEngine.connect(fbMe.id, fbMe, fbAccessToken);
};
```

Authentication information is stored in memory on the client and sent with every single ChatEngine request.

## Server Functions receives request but does not execute

ChatEngine Server Function receives the request and immediately proxies it to the Gateway Function. It will not continue unless it receives ```{ allow: true }``` from the Gateway.

The token and user information is forwarded to the Gateway function.

## The Gateway Function Authorizes (or Rejects)

The Gateway Function returns "allow" ```true``` or ```false``` depending on the policy. Authentication policies are defined on a **per route basis**. In general, a policy is in charge of "who" can do "what."

As soon as ChatEngine connect is called, it makes a request to ```/login```. This is the only open route in our authorization policy.

The login route should take the user's information and return a successful response if it is valid. The Gateway function will then store this information in it's own cache, so that 3rd party servers do not have to be contacted in the future.

In this example, notice how login needs to ```validateFBToken```. See below for what that does.

Notice how the 'grant' policy calls a different function called ```isOverAge```. This asks Facebook to validate that the user is over 13 before giving them access to any new chat (the /grant endpoint).

All the information from the original request is available in the policy gateway.

## Gateway Validates FB Token on Login

This function validates the supplied uuid and authToken to grant the user access to ChatEngine. It uses the xhr module to call Facebook's debug endpoint and validate that the user token is legitimate and that it matches who the user claims to be.

## The Server executes the business logic on good response from gateway

If the token is valid on /login, the Server Function stores the ```authKey``` in the db keyed by ```uuid```. This acts as a session cache, allowing us to validate the authToken ourselves in future requests; preventing us from hitting Facebook's servers every time we need to check if the user is valid (which is every time).


If this were the /grant endpoint, the server would grant the user access to some chat. And if it were a invite request, it might send someone else a chat invite.

# Every PubNub and Server request thereafter is validated

By comparing the uuid and the cached authToken, we can validate that the user is who they say they are. This is because Facebook told us so, and we cached that in the db.

All other ChatEngine requests will use this method rather than asking Facebook
every time.


With cached session validation and protected routes, we have a secure way allowing access to chat rooms and other functions.

# Setup

## Checkout The ChatEngine Repository

This example depends on compiled JS SDK found in the [auth-policy-refactor](https://github.com/pubnub/chat-engine/tree/auth-policy-refactor) branch.

Make sure to compile this version of ChatEngine in the sibling directory:

```
git clone git@github.com:pubnub/chat-engine.git
git checkout auth-policy-refactor
```

The remaining file assets are appended to the bottom of the guide.

## I. Facebook Login App

1. [Naviate to the following](https://developers.facebook.com/apps) and login to FB developer landing page.
2. Next select _Add a New App_ and follow the setup wizard.
3. Enter in your app's domain address into ```Site URL``` and the ```App Domain``` fields (e.g. ```https://localhost``` & ```localhost``` respectively).
![FB App Settings 1](./FB_App_settings_1.png "blah")
![FB App Settings 0](./FB_App_settings.png "blah")
4. Save settings.
5. Copy the ```appID``` value into the client code to replace the hardcoded value used by the ```FB.init()``` method in ```../chat-engine-scratch/auth-guide/index.html```.
6. Copy and save the ```App Secret``` for later use.
7. Once app has been created, copy and paste the ```appID``` inside the ```FB.init()``` method used in the file: ```../index.html```.
8. Lastly, paste the ```App Secret``` value into the ```chat-engine-gateway``` Function, should look something like: ```const appID = '<INSERT_appID>';```.


## II. Functions

The following are updated PubNub functions that implements swap-able auth policies to
work with 3rd party services (see bottom of guide for copies of Functions code).

| Function Name | Function Type | Channel Name |
|:-------------:|:-------------:|:------------:|
| rest-gateway	| On Request	| chat-engine-gateway |
| rest-sever	| On Request	| chat-engine-server  |
| msg-validator | Before Publish | *	|
> Note: Functions code appended to bottom of guide for ease of copying & pasting.

1. Copy and paste Functions code (in table above) into a Module.
2. Within the ```rest-gateway``` Function, hardcode the ```appID`` value.
3. Select the ```My Secrets``` button and input the following key-val: ```{'myFBSecret': '_COPY_PASTE_APP_SECRET_HERE_'}```, then save.
4. Restart Module.


## III. Client

1. Go to the chat-engine:auth-policy-refactor repo.
2. ```npm install```
3. Copy the index.html (at page bottom) into a directory at the same level as chat-engine repo.
4. Copy and paste ```publishKey``` & ```subscribeKey``` values into ``index.html```.
4. Ensure that ```appID``` value from FB has been set within ```../index.html```.
5. FB requires you server applications over SSL. To serve the client code over https perform the following: ```openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem```
```npm install http-server -g```
```http-server --ssl -C chat-engine-scratch/auth-preview/cert.pem -K chat-engine-scratch/auth-preview/key.pem```
6. Open ```../index.html```
7. Boom! Login to FB and chat away!


## Cost vs. Security

The above authentication heavily relies on the usage of an _onBeforePublish_ Function that is registered to listen on all channels ('*') on that subkey. Meaning, every published msg via CE will be authenticated by the _onBeforePublish_ Function. Though a costly architecture, the approach is the most secure and expensive. Any reductions to cost would subsequently lead to a less secure architecture. _Lets explore these trade-offs.._

### Option #1: Everytime: _High Cost, High Security_:
By far the most costly and secure option. On initilization of CE, user's third-party authentication information is sent to CE _login_ rest Function endpoint. The Function handles requests to a third-party authenticator and caches the response within Function's KV store for cached authentication. If successfully authenticated via third-party, all subsequent CE calls are validated by _onBeforePublish_ Function that checks message's ```authKey``` matches the associated user's ```authKey``` previously saved in the KV store.

> Configuration:
>
> 1. Follow the above guide.

### Option #2: Periodic: _Moderate Cost, Moderate Security_:
If the cost of authenticating every CE msg gives you the willies, but require more than just a single authorization (i.e. SSO), implementing a periodical authorization can offer users moderate security.

The mechanics of a periodical authorization requires SSO with some third-party credentials. Once the CE backend has determined the validity of the creds, the rest-server Function grants/authorizes users access to various channels required by CE for a given authTTL.

> Configuration:
>
> 1. Remove the _onBeforePublish_ Function;
> 2. Update chat-engine-rest.js Functions code to grant PAM access with a specified TTL which expires every X seconds.
> 3. Restart module.
> 4. Update ChatEngine client code to retry authenticating upon expired authTTL.


### Option #3:  Single Sign On: _Low Cost, Low Security_:
The least secure authentication pattern relies on a single authentication attempt at the initilization of a CE user. When initilizing CE, once a user has entered their authentication credentials into the client, a _login_ attempt is sent to CE _login_ rest Function endpoint. Once successfully authenticated, CE will then grant PAM access to the user. No further authentication occurs until user *logs in* again.

> Configuration:
>
> 1. Remove the _onBeforePublish_ Function.
> 2. Restart Module.


## Code Snippets
