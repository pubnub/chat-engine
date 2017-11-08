(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ChatEngineSetupCore"] = factory();
	else
		root["ChatEngineSetupCore"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Client = __webpack_require__(1);
const ProvisionAccount = __webpack_require__(2);
const utils = __webpack_require__(4);

const extractError = (err) => {
    if (err && err.responseJSON && err.responseJSON.error) {
        return err.responseJSON.error;
    }
};

module.exports = class {

    constructor() {
        this.loginElement = $('#login');
        this.provisionElement = $('#setup');
        this.loadElement = $('#load');
        this.errorElement = $('#error');
        this.errorOutElement = $('#error-out');
        this.statusElement = $('#status');
        this.codeElement = $('#code');
        this.outputElement = $('#output');
        this.emailElement = $('#email');
        this.passwordElement = $('#password');

        this.loginElement.submit(this.onLoginRegister.bind(this));
        this.provisionElement.submit(this.onSetup.bind(this));

        this.userId = utils.findCookie('pnAdminId');
        let tokenCookie = utils.findCookie('pnAdminToken');

        this.client = new Client({
            session: tokenCookie,
            debug: false,
            endpoint: 'https://admin.pubnub.com'
        });

        if (this.userId && tokenCookie) {
            this.provisionElement.show();
            this.loginElement.hide();
            analytics.identify(this.userId);
        }

    }

    displayStatus(statusText) {
        this.statusElement.show();
        this.statusElement.append($('<li class="list-group-item">' + statusText + '</li>'));
    }

    clearErrors() {
        this.errorElement.hide();
    }

    raiseError(err) {
        this.errorOutElement.html(err);
        this.errorElement.show();
    }

    onProvisionSuccess(err, data) {
        if (err) {
            this.loadElement.hide();
            this.provisionElement.show();

            this.errorOutElement.html(err);
            this.errorElement.show();
        } else {
            this.loadElement.hide();

            let output = '';
            output += '// Make sure to import ChatEngine first!\n';
            output += 'ChatEngine = ChatEngineCore.create({\n';
            output += "    publishKey: '" + data.pub + "',\n";
            output += "    subscribeKey: '" + data.sub + "'\n";
            output += '});\n';

            analytics.track('chat_engine_activation');

            this.codeElement.text(output);
            this.outputElement.show();
        }
    }

    onLoginRegister() {
        this.clearErrors();
        const email = this.emailElement.val();
        const password = this.passwordElement.val();

        if (!email || email === '') {
            this.raiseError('email not valid');
            return false;
        }

        if (!password || password === '') {
            this.raiseError('password not valid');
            return false;
        }

        this.client.init({ email, password }, (err, response) => {
            if (err) {
                this.raiseError(extractError(err));
            } else {
                this.userId = response.result.user_id;
                analytics.identify(this.userId);
                this.provisionElement.show();
                this.loginElement.hide();
            }
        });


        return false;
    }

    onSetup() {
        this.clearErrors();

        this.loadElement.show();
        this.errorElement.hide();
        this.statusElement.empty();

        ProvisionAccount(this.client, this.userId, this.onProvisionSuccess.bind(this), this.displayStatus.bind(this));

        return false;
    }

};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = class {

    constructor(options) {
        options = options || {};

        this.endpoint = options.endpoint || 'https://admin.pubnub.com';
        this.session = options.session || false;
        this.debug = options.debug || false;
    }

    errHandle(text) {
        if (this.debug) {
            console.error('API Error: ' + text);
        }
    }

    clog(input) {
        if (this.debug) {
            if (typeof (input) === 'object') {
                console.log(input);
            } else {
                console.log('API:'.yellow, input);
            }
        }
    }

    request(method, url, opts, holla) {

        if (url[1] !== 'me' && !this.session) {
            return this.errHandle('Authorize with init() first.');
        }

        opts = opts || {};

        opts.url = this.endpoint + '/' + url.join('/');
        opts.method = method;

        opts.json = true;
        opts.headers = opts.headers || {};
        // opts.headers.Authorization =
        //     'Basic cHVibnViLWJldGE6YmxvY2tzMjAxNg===';

        if (this.session) {
            opts.headers['X-Session-Token'] = this.session;
        }

        // clog('-- URL:'.yellow);
        this.clog(opts.method.red + ' ' + opts.url);
        this.clog('-- opts:'.yellow);
        this.clog(opts);

        $.ajax(opts)
            .done((data) => {
                console.log(data);
                holla(null, data);
            })
            .fail((data) => {
                console.log('fail', data);
                holla(data || data.message || data);
            });
    }

    init(input, holla) {
        this.request('post', ['api', 'me'], {
            data: {
                email: input.email || this.errHandle('No Email Supplied'),
                password: input.password || this.errHandle('No Password Supplied')
            }
        }, (err, body) => {
            if (body && body.error) {
                holla(body.error);
            } else if (err) {
                holla(err);
            } else {
                this.session = body.result.token;
                holla(null, body);
            }
        });
    }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const ProvisionBlocks = __webpack_require__(3);

module.exports = (api, userId, callback = () => {}, status = () => {}) => {
    api.request('get', ['api', 'accounts'], {
        data: {
            user_id: userId
        }
    }, (err, response) => {

        if (err) {
            return callback('Could not get PubNub accounts. Please contact support@pubnub.com.');
        }

        let account = response.result.accounts[0];

        status('Using account ' + account.properties.company + ', if this is incorrent deploy manually or log in as another user');
        status('Creating new PubNub app...');

        api.request('post', ['api', 'apps'], {
            data: {
                name: 'ChatEngine App',
                owner_id: account.id,
                properties: {}
            }
        }, (err, response) => {

            if (err) {
                return callback('Could not create new PubNub app. Please contact support@pubnub.com.');
            }

            let app = response.result;

            status('Getting PubNub keys...');

            api.request('get', ['api', 'apps'], {
                data: {
                    owner_id: account.id
                }
            }, (err, response) => {

                if (err) {
                    return callback('Could not get PubNub keys. Please contact support@pubnub.com.');
                }

                let apps = response.result;
                let key;

                apps.forEach((item) => {
                    if (item.id === app.id) {
                        key = item.keys[0];
                    }
                });

                status('Enabling PubNub features...');

                key.properties.name = 'ChatEngine Keyset';
                key.properties.presence = 1;
                key.properties.history = 1;
                key.properties.message_storage_ttl = 7;
                key.properties.multiplexing = 1;
                key.properties.presence_announce_max = 20;
                key.properties.presence_debounce = 2;
                key.properties.presence_global_here_now = 1;
                key.properties.presence_interval = 10;
                key.properties.presence_leave_on_disconnect = 0;
                key.properties.blocks = 1;
                key.properties.uls = 1;
                key.properties.wildcardsubscribe = 1;

                api.request('put', ['api', 'keys', key.id], {
                    data: key
                }, (err, response) => {

                    if (err) {
                        callback('Could not enable PubNub features. Please contact support@pubnub.com.');
                    }

                    ProvisionBlocks(api, userId, key, callback, status);

                });
            });
        });
    });
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = (api, userId, key, callback = () => {}, status = () => {}) => {

    let block = null;

    status('Creating new PubNub Function...');

    let addSecretKeyToVault = () => {
        status('Adding Secret Key to Functions Vault...');

        api.request('put', ['api', 'vault', key.subscribe_key, 'key', 'secretKey'], {
            contentType: 'application/json',
            data: JSON.stringify({
                keyName: 'secretKey',
                key_id: key.id,
                subscribeKey: key.subscribe_key,
                value: key.secret_key
            })
        }, (err, response) => {
            if (err) {
                callback('Could not add Secret Key to Functions Vault. Please contact support@pubnub.com');
                return;
            }

            status('Success!');

            callback(null, {
                pub: key.publish_key,
                sub: key.subscribe_key
            });
        });
    };

    let startPubNubFunction = () => {
        status('Starting Pubnub Function...');

        api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block', block.id, 'start'], {
            data: {
                block_id: block.id,
                key_id: key.id,
                action: 'start'
            }
        }, (err, response) => {
            if (err) {
                callback('Could not start PubNub Function. Please contact support@pubnub.com.');
                return;
            }

            addSecretKeyToVault();
        });
    };

    let onCodeFetch = (stateCodeResult, authCodeResult, functionCodeResult) => {
        status('Creating new after-publish Event Handler...');

        api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
            data: {
                key_id: key.id,
                block_id: block.id,
                type: 'js',
                event: 'js-after-presence',
                channels: 'global',
                name: 'state-to-kv',
                code: stateCodeResult[0],
                output: 'output-state-to-kv-' + (new Date()).getTime()
            }
        }, (err, response) => {
            if (err) {
                callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
            }

            api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                data: {
                    key_id: key.id,
                    block_id: block.id,
                    type: 'js',
                    event: 'js-on-rest',
                    path: 'chat-engine-auth',
                    name: 'chat-engine-auth',
                    code: authCodeResult[0],
                    output: 'auth-' + Math.round((new Date()).getTime())
                }
            }, (err, response) => {
                if (err) {
                    callback('Could not create new PubNub after-publish Event Handler. Please contact support@pubnub.com.');
                }

                status('Creating new on-request Event Handler...');

                api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'event_handler'], {
                    data: {
                        key_id: key.id,
                        block_id: block.id,
                        code: functionCodeResult[0],
                        type: 'js',
                        name: 'chat-engine-server',
                        path: 'server',
                        event: 'js-on-rest',
                        output: 'output-server-endpoint-' + Math.round((new Date()).getTime())
                    }
                }, (err, response) => {
                    if (err) {
                        callback('Could not create new Pubnub on-request Event Handler. Please contact support@pubnub.com.');
                        return;
                    }

                    startPubNubFunction();
                });
            });
        });
    };

    api.request('post', ['api', 'v1', 'blocks', 'key', key.id, 'block'], {
        data: {
            name: 'ChatEngine Function',
            key_id: key.id
        }
    }, (err, response) => {

        if (err) {
            callback('Could not create new PubNub Function. Please contact support@pubnub.com.');
        }

        block = response.payload;

        let stateCodeFetch = $.get({ url: 'functions/state-to-kv.js', dataType: 'text' });
        let authCodeFetch = $.get({ url: 'functions/auth.js', dataType: 'text' });
        let functionsCodeFetch = $.get({ url: 'functions/server.js', dataType: 'text' });

        $.when(stateCodeFetch, authCodeFetch, functionsCodeFetch)
            .then(onCodeFetch)
            .catch(() => {
                status('Failed to fetch code');
            });
    });
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {


const findCookie = (name) => {
    let cookies = document.cookie.split(';');
    let result = null;

    cookies.forEach((cookie) => {
        let cookieName = cookie.split('=')[0];
        let cookieValue = cookie.split('=')[1];

        if (cookieName.endsWith(name)) {
            result = cookieValue;
        }
    });

    return result;
};

module.exports = { findCookie };


/***/ })
/******/ ]);
});