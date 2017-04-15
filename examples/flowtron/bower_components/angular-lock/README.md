# Auth0 Lock for Angular 1.x

This module provides a thin wrapper for version 10 of Auth0's [Lock widget](https://auth0.com/docs/libraries/lock).

> **Note:** angular-lock version 2.0 is meant to be used with Auth0Lock version 10.9 or higher. Please ensure you have auth0.js v8 or higher loaded as well.

## Installation

**Bower**

```bash
bower install angular-lock
```

Ensure that both Auth0Lock and angular-lock are loaded on the page.

```html

<script src="bower_components/auth0-lock/build/lock.js"></script>
<script src="bower_components/auth0.js/build/auth0.js"></script>
<script src="bower_components/angular-lock/build/angular-lock.js"></script>
```

## Usage

Bring in the `auth0.lock` module.

```js
var app = angular.module('myApp', ['auth0.lock']);
```

Configure Auth0Lock by using `lockProvider`. If you haven't done so yet, [sign up for Auth0](https://auth0.com/signup), create a client app, and get your clientID and domain. To learn more about Auth0Lock's API and the options it takes, see the [API documentation](https://auth0.com/docs/libraries/lock) and the list of [customization options](https://auth0.com/docs/libraries/lock/v10/customization).

```js
app.config(function(lockProvider) {
  lockProvider.init({
    clientID: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    options: LOCK_OPTIONS
  });
});
```

With Lock versions > 10.9 (and thus auth0.js versions > 8.0), the `id_token` must be signed with the RS256 algorithm. You may choose to skip `id_token` verification if you need to use HS256 as the signing algorithm.

```js
app.config(function(lockProvider) {
  lockProvider.init({
    clientID: AUTH0_CLIENT_ID,
    domain: AUTH0_DOMAIN,
    options: {
      _idTokenVerification: false
    }
  });
});
```

See the [auth0.js migration guide](https://auth0.com/docs/libraries/auth0js/migration-guide#switching-from-hs256-to-rs256) for more information.

Use `lock` in the `run` block, in a service, or in a controller. For example, show the Auth0Lock widget from a controller and associated view.

```js
app.controller('loginController', function(lock) {
  var vm = this;
  vm.lock = lock;
});
```

```html

<div ng-controller="loginController as login">

  <button ng-click="login.lock.show()">Log In</button>

</div>
```

Then, set up a listener for the `authenticated` event.

```js
app.run(function(lock) {
  
  // For use with UI Router
  lock.interceptHash();

  lock.on('authenticated', function(authResult) {
    localStorage.setItem('id_token', authResult.idToken);

    lock.getProfile(authResult.idToken, function(error, profile) {
      if (error) {
        console.log(error);
      }
      localStorage.setItem('profile', JSON.stringify(profile));
    });
  });
});
```

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, among others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [JSON Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
