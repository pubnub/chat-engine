(function() {
  'use strict';
  angular.module('auth0.lock', []).provider('lock', lock);

  function lock() {
    if (typeof Auth0Lock !== 'function') {
      throw new Error('Auth0Lock must be loaded.');
    }

    // Stub required functions to allow auth0-angular to initialize
    Auth0Lock.prototype.getClient = function() {
      void 0;
    };
    Auth0Lock.prototype.parseHash = function() {
      void 0;
    };

    this.init = function(config) {
      if (!config) {
        throw new Error('clientID and domain must be provided to lock');
      }
      this.clientID = config.clientID;
      this.domain = config.domain;
      this.options = config.options || {};
    };

    this.$get = [
      '$rootScope',
      '$location',
      function($rootScope, $location) {
        var Lock = new Auth0Lock(this.clientID, this.domain, this.options);
        var credentials = { clientID: this.clientID, domain: this.domain };
        var shouldVerifyIdToken = true;
        if (this.options._idTokenVerification === false)
          shouldVerifyIdToken = false;
        var lock = {};
        var functions = [];
        for (var i in Lock) {
          if (typeof Lock[i] === 'function') {
            functions.push(i);
          }
        }

        function safeApply(fn) {
          var phase = $rootScope.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            if (fn && typeof fn === 'function') {
              fn();
            }
          } else {
            $rootScope.$apply(fn);
          }
        }

        function wrapArguments(parameters) {
          var lastIndex = parameters.length - 1, func = parameters[lastIndex];
          if (typeof func === 'function') {
            parameters[lastIndex] = function() {
              var args = arguments;
              safeApply(function() {
                func.apply(Lock, args);
              });
            };
          }
          return parameters;
        }

        for (var i = 0; i < functions.length; i++) {
          lock[functions[i]] = (function(name) {
            var customFunction = function() {
              return Lock[name].apply(Lock, wrapArguments(arguments));
            };
            return customFunction;
          })(functions[i]);
        }

        lock.interceptHash = function() {
          if (typeof auth0.WebAuth !== 'function') {
            throw new Error('Auth0.js version 8 or higher must be loaded');
            return;
          }

          $rootScope.$on('$locationChangeStart', function(event, location) {
            if (/id_token=/.test(location) || /error=/.test(location)) {
              var webAuth = new auth0.WebAuth(credentials);

              var hash = $location.hash();

              webAuth.parseHash(
                { hash: hash, _idTokenVerification: shouldVerifyIdToken },
                function(err, authResult) {
                  if (err) {
                    Lock.emit('authorization_error', err);
                  }
                  if (authResult && authResult.idToken) {
                    Lock.emit('authenticated', authResult);
                  }
                }
              );
            }
          });
        };

        return lock;
      }
    ];
  }
})();
