(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = once;
function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports["default"];
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = onlyOnce;
function onlyOnce(fn) {
    return function () {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}
module.exports = exports["default"];
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (tasks, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    if (!(0, _isArray2.default)(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        if (taskIndex === tasks.length) {
            return callback.apply(null, [null].concat(args));
        }

        var taskCallback = (0, _onlyOnce2.default)((0, _baseRest2.default)(function (err, args) {
            if (err) {
                return callback.apply(null, [err].concat(args));
            }
            nextTask(args);
        }));

        args.push(taskCallback);

        var task = tasks[taskIndex++];
        task.apply(null, args);
    }

    nextTask([]);
};

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('./internal/once');

var _once2 = _interopRequireDefault(_once);

var _baseRest = require('lodash/_baseRest');

var _baseRest2 = _interopRequireDefault(_baseRest);

var _onlyOnce = require('./internal/onlyOnce');

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of functions to run, each function is passed
 * a `callback(err, result1, result2, ...)` it must call on completion. The
 * first argument is an error (which can be `null`) and any further arguments
 * will be passed as arguments in order to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
},{"./internal/once":1,"./internal/onlyOnce":2,"lodash/_baseRest":35,"lodash/isArray":52,"lodash/noop":55}],4:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":6}],5:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))

},{"../core/createError":12,"./../core/settle":15,"./../helpers/btoa":19,"./../helpers/buildURL":20,"./../helpers/cookies":22,"./../helpers/isURLSameOrigin":24,"./../helpers/parseHeaders":26,"./../utils":28,"_process":56}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":7,"./cancel/CancelToken":8,"./cancel/isCancel":9,"./core/Axios":10,"./defaults":17,"./helpers/bind":18,"./helpers/spread":27,"./utils":28}],7:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],8:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":7}],9:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],10:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":17,"./../helpers/combineURLs":21,"./../helpers/isAbsoluteURL":23,"./../utils":28,"./InterceptorManager":11,"./dispatchRequest":13}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":28}],12:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":9,"../defaults":17,"./../utils":28,"./transformData":16}],14:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],15:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":12}],16:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":28}],17:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))

},{"./adapters/http":5,"./adapters/xhr":5,"./helpers/normalizeHeaderName":25,"./utils":28,"_process":56}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":28}],21:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":28}],23:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":28}],25:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":28}],26:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"./../utils":28}],27:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],28:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":18,"is-buffer":29}],29:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],30:[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
;!function(undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      this._events.maxListeners = conf.maxListeners !== undefined ? conf.maxListeners : defaultMaxListeners;
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    } else {
      this._events.maxListeners = defaultMaxListeners;
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. %d listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: %s.';
      console.error(errorMsg, count, eventName);
    } else {
      console.error(errorMsg, count);
    }

    if (console.trace){
      console.trace();
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }
  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }

    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name !== undefined) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
            !tree._listeners.warned &&
            this._events.maxListeners > 0 &&
            tree._listeners.length > this._events.maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._events || init.call(this);
      this._events.maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();
      if (al > 3) {
        args = new Array(al);
        for (j = 0; j < al; j++) args[j] = arguments[j];
      }

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    var promises= [];

    var al = arguments.length;
    var args,l,i,j;
    var handler;

    if (this._all) {
      if (al > 3) {
        args = new Array(al);
        for (j = 1; j < al; j++) args[j] = arguments[j];
      }
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, args));
        }
      }
    }

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener) {
    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._events.maxListeners > 0 &&
        this._events[type].length > this._events.maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }

        this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }

        this.emit("removeListener", type, listener);
      }
    }

    function recursivelyGarbageCollect(root) {
      if (root === undefined) {
        return;
      }
      var keys = Object.keys(root);
      for (var i in keys) {
        var key = keys[i];
        var obj = root[key];
        if ((obj instanceof Function) || (typeof obj !== "object") || (obj === null))
          continue;
        if (Object.keys(obj).length > 0) {
          recursivelyGarbageCollect(root[key]);
        }
        if (Object.keys(obj).length === 0) {
          delete root[key];
        }
      }
    }
    recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++)
        this.emit("removeListenerAny", fns[i]);
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
     // AMD. Register as an anonymous module.
    define(function() {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();

},{}],31:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":46}],32:[function(require,module,exports){
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;

},{}],33:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  value = Object(value);
  return (symToStringTag && symToStringTag in value)
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":31,"./_getRawTag":41,"./_objectToString":44}],34:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isMasked":43,"./_toSource":49,"./isFunction":53,"./isObject":54}],35:[function(require,module,exports){
var identity = require('./identity'),
    overRest = require('./_overRest'),
    setToString = require('./_setToString');

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;

},{"./_overRest":45,"./_setToString":47,"./identity":51}],36:[function(require,module,exports){
var constant = require('./constant'),
    defineProperty = require('./_defineProperty'),
    identity = require('./identity');

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;

},{"./_defineProperty":38,"./constant":50,"./identity":51}],37:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":46}],38:[function(require,module,exports){
var getNative = require('./_getNative');

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;

},{"./_getNative":40}],39:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],40:[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":34,"./_getValue":42}],41:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":31}],42:[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],43:[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":37}],44:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],45:[function(require,module,exports){
var apply = require('./_apply');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;

},{"./_apply":32}],46:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":39}],47:[function(require,module,exports){
var baseSetToString = require('./_baseSetToString'),
    shortOut = require('./_shortOut');

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;

},{"./_baseSetToString":36,"./_shortOut":48}],48:[function(require,module,exports){
/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;

},{}],49:[function(require,module,exports){
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],50:[function(require,module,exports){
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;

},{}],51:[function(require,module,exports){
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],52:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],53:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":33,"./isObject":54}],54:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],55:[function(require,module,exports){
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;

},{}],56:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],57:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.PubNub=t():e.PubNub=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){if(!navigator||!navigator.sendBeacon)return!1;navigator.sendBeacon(e)}Object.defineProperty(t,"__esModule",{value:!0});var u=n(1),c=r(u),l=n(40),h=r(l),f=n(41),d=r(f),p=n(42),g=(n(8),function(e){function t(e){i(this,t);var n=e.listenToBrowserNetworkEvents,r=void 0===n||n;e.db=d.default,e.sdkFamily="Web",e.networking=new h.default({get:p.get,post:p.post,sendBeacon:a});var s=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r&&(window.addEventListener("offline",function(){s.networkDownDetected()}),window.addEventListener("online",function(){s.networkUpDetected()})),s}return s(t,e),t}(c.default));t.default=g,e.exports=t.default},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),u=i(a),c=n(7),l=i(c),h=n(9),f=i(h),d=n(11),p=i(d),g=n(12),y=i(g),v=n(18),b=i(v),_=n(19),m=r(_),k=n(20),P=r(k),S=n(21),w=r(S),O=n(22),T=r(O),C=n(23),M=r(C),E=n(24),x=r(E),N=n(25),R=r(N),K=n(26),A=r(K),j=n(27),D=r(j),G=n(28),U=r(G),B=n(29),I=r(B),H=n(30),L=r(H),q=n(31),F=r(q),z=n(32),X=r(z),W=n(33),V=r(W),J=n(34),$=r(J),Q=n(35),Y=r(Q),Z=n(36),ee=r(Z),te=n(37),ne=r(te),re=n(38),ie=r(re),oe=n(15),se=r(oe),ae=n(39),ue=r(ae),ce=n(16),le=i(ce),he=n(13),fe=i(he),de=(n(8),function(){function e(t){var n=this;o(this,e);var r=t.db,i=t.networking,s=this._config=new l.default({setup:t,db:r}),a=new f.default({config:s});i.init(s);var u={config:s,networking:i,crypto:a},c=b.default.bind(this,u,se),h=b.default.bind(this,u,U),d=b.default.bind(this,u,L),g=b.default.bind(this,u,X),v=b.default.bind(this,u,ue),_=this._listenerManager=new y.default,k=new p.default({timeEndpoint:c,leaveEndpoint:h,heartbeatEndpoint:d,setStateEndpoint:g,subscribeEndpoint:v,crypto:u.crypto,config:u.config,listenerManager:_});this.addListener=_.addListener.bind(_),this.removeListener=_.removeListener.bind(_),this.removeAllListeners=_.removeAllListeners.bind(_),this.channelGroups={listGroups:b.default.bind(this,u,T),listChannels:b.default.bind(this,u,M),addChannels:b.default.bind(this,u,m),removeChannels:b.default.bind(this,u,P),deleteGroup:b.default.bind(this,u,w)},this.push={addChannels:b.default.bind(this,u,x),removeChannels:b.default.bind(this,u,R),deleteDevice:b.default.bind(this,u,D),listChannels:b.default.bind(this,u,A)},this.hereNow=b.default.bind(this,u,V),this.whereNow=b.default.bind(this,u,I),this.getState=b.default.bind(this,u,F),this.setState=k.adaptStateChange.bind(k),this.grant=b.default.bind(this,u,Y),this.audit=b.default.bind(this,u,$),this.publish=b.default.bind(this,u,ee),this.fire=function(e,t){return e.replicate=!1,e.storeInHistory=!1,n.publish(e,t)},this.history=b.default.bind(this,u,ne),this.fetchMessages=b.default.bind(this,u,ie),this.time=c,this.subscribe=k.adaptSubscribeChange.bind(k),this.unsubscribe=k.adaptUnsubscribeChange.bind(k),this.disconnect=k.disconnect.bind(k),this.reconnect=k.reconnect.bind(k),this.destroy=function(e){k.unsubscribeAll(e),k.disconnect()},this.stop=this.destroy,this.unsubscribeAll=k.unsubscribeAll.bind(k),this.getSubscribedChannels=k.getSubscribedChannels.bind(k),this.getSubscribedChannelGroups=k.getSubscribedChannelGroups.bind(k),this.encrypt=a.encrypt.bind(a),this.decrypt=a.decrypt.bind(a),this.getAuthKey=u.config.getAuthKey.bind(u.config),this.setAuthKey=u.config.setAuthKey.bind(u.config),this.setCipherKey=u.config.setCipherKey.bind(u.config),this.getUUID=u.config.getUUID.bind(u.config),this.setUUID=u.config.setUUID.bind(u.config),this.getFilterExpression=u.config.getFilterExpression.bind(u.config),this.setFilterExpression=u.config.setFilterExpression.bind(u.config)}return s(e,[{key:"getVersion",value:function(){return this._config.getVersion()}},{key:"networkDownDetected",value:function(){this._listenerManager.announceNetworkDown(),this._config.restore?this.disconnect():this.destroy(!0)}},{key:"networkUpDetected",value:function(){this._listenerManager.announceNetworkUp(),this.reconnect()}}],[{key:"generateUUID",value:function(){return u.default.v4()}}]),e}());de.OPERATIONS=le.default,de.CATEGORIES=fe.default,t.default=de,e.exports=t.default},function(e,t,n){var r=n(3),i=n(6),o=i;o.v1=r,o.v4=i,e.exports=o},function(e,t,n){function r(e,t,n){var r=t&&n||0,i=t||[];e=e||{};var s=void 0!==e.clockseq?e.clockseq:u,h=void 0!==e.msecs?e.msecs:(new Date).getTime(),f=void 0!==e.nsecs?e.nsecs:l+1,d=h-c+(f-l)/1e4;if(d<0&&void 0===e.clockseq&&(s=s+1&16383),(d<0||h>c)&&void 0===e.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");c=h,l=f,u=s,h+=122192928e5;var p=(1e4*(268435455&h)+f)%4294967296;i[r++]=p>>>24&255,i[r++]=p>>>16&255,i[r++]=p>>>8&255,i[r++]=255&p;var g=h/4294967296*1e4&268435455;i[r++]=g>>>8&255,i[r++]=255&g,i[r++]=g>>>24&15|16,i[r++]=g>>>16&255,i[r++]=s>>>8|128,i[r++]=255&s;for(var y=e.node||a,v=0;v<6;++v)i[r+v]=y[v];return t||o(i)}var i=n(4),o=n(5),s=i(),a=[1|s[0],s[1],s[2],s[3],s[4],s[5]],u=16383&(s[6]<<8|s[7]),c=0,l=0;e.exports=r},function(e,t){(function(t){var n,r=t.crypto||t.msCrypto;if(r&&r.getRandomValues){var i=new Uint8Array(16);n=function(){return r.getRandomValues(i),i}}if(!n){var o=new Array(16);n=function(){for(var e,t=0;t<16;t++)0==(3&t)&&(e=4294967296*Math.random()),o[t]=e>>>((3&t)<<3)&255;return o}}e.exports=n}).call(t,function(){return this}())},function(e,t){function n(e,t){var n=t||0,i=r;return i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]}for(var r=[],i=0;i<256;++i)r[i]=(i+256).toString(16).substr(1);e.exports=n},function(e,t,n){function r(e,t,n){var r=t&&n||0;"string"==typeof e&&(t="binary"==e?new Array(16):null,e=null),e=e||{};var s=e.random||(e.rng||i)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,t)for(var a=0;a<16;++a)t[r+a]=s[a];return t||o(s)}var i=n(4),o=n(5);e.exports=r},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(2),s=function(e){return e&&e.__esModule?e:{default:e}}(o),a=(n(8),function(){function e(t){var n=t.setup,i=t.db;r(this,e),this._db=i,this.instanceId="pn-"+s.default.v4(),this.secretKey=n.secretKey||n.secret_key,this.subscribeKey=n.subscribeKey||n.subscribe_key,this.publishKey=n.publishKey||n.publish_key,this.sdkFamily=n.sdkFamily,this.partnerId=n.partnerId,this.setAuthKey(n.authKey),this.setCipherKey(n.cipherKey),this.setFilterExpression(n.filterExpression),this.origin=n.origin||"pubsub.pubnub.com",this.secure=n.ssl||!1,this.restore=n.restore||!1,this.proxy=n.proxy,this.keepAlive=n.keepAlive,this.keepAliveSettings=n.keepAliveSettings,this.autoNetworkDetection=n.autoNetworkDetection||!1,this.customEncrypt=n.customEncrypt,this.customDecrypt=n.customDecrypt,"undefined"!=typeof location&&"https:"===location.protocol&&(this.secure=!0),this.logVerbosity=n.logVerbosity||!1,this.suppressLeaveEvents=n.suppressLeaveEvents||!1,this.announceFailedHeartbeats=n.announceFailedHeartbeats||!0,this.announceSuccessfulHeartbeats=n.announceSuccessfulHeartbeats||!1,this.useInstanceId=n.useInstanceId||!1,this.useRequestId=n.useRequestId||!1,this.requestMessageCountThreshold=n.requestMessageCountThreshold,this.setTransactionTimeout(n.transactionalRequestTimeout||15e3),this.setSubscribeTimeout(n.subscribeRequestTimeout||31e4),this.setSendBeaconConfig(n.useSendBeacon||!0),this.setPresenceTimeout(n.presenceTimeout||300),n.heartbeatInterval&&this.setHeartbeatInterval(n.heartbeatInterval),this.setUUID(this._decideUUID(n.uuid))}return i(e,[{key:"getAuthKey",value:function(){return this.authKey}},{key:"setAuthKey",value:function(e){return this.authKey=e,this}},{key:"setCipherKey",value:function(e){return this.cipherKey=e,this}},{key:"getUUID",value:function(){return this.UUID}},{key:"setUUID",value:function(e){return this._db&&this._db.set&&this._db.set(this.subscribeKey+"uuid",e),this.UUID=e,this}},{key:"getFilterExpression",value:function(){return this.filterExpression}},{key:"setFilterExpression",value:function(e){return this.filterExpression=e,this}},{key:"getPresenceTimeout",value:function(){return this._presenceTimeout}},{key:"setPresenceTimeout",value:function(e){return this._presenceTimeout=e,this.setHeartbeatInterval(this._presenceTimeout/2-1),this}},{key:"getHeartbeatInterval",value:function(){return this._heartbeatInterval}},{key:"setHeartbeatInterval",value:function(e){return this._heartbeatInterval=e,this}},{key:"getSubscribeTimeout",value:function(){return this._subscribeRequestTimeout}},{key:"setSubscribeTimeout",value:function(e){return this._subscribeRequestTimeout=e,this}},{key:"getTransactionTimeout",value:function(){return this._transactionalRequestTimeout}},{key:"setTransactionTimeout",value:function(e){return this._transactionalRequestTimeout=e,this}},{key:"isSendBeaconEnabled",value:function(){return this._useSendBeacon}},{key:"setSendBeaconConfig",value:function(e){return this._useSendBeacon=e,this}},{key:"getVersion",value:function(){return"4.13.0"}},{key:"_decideUUID",value:function(e){return e||(this._db&&this._db.get&&this._db.get(this.subscribeKey+"uuid")?this._db.get(this.subscribeKey+"uuid"):"pn-"+s.default.v4())}}]),e}());t.default=a,e.exports=t.default},function(e,t){"use strict";e.exports={}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(7),a=(r(s),n(10)),u=r(a),c=function(){function e(t){var n=t.config;i(this,e),this._config=n,this._iv="0123456789012345",this._allowedKeyEncodings=["hex","utf8","base64","binary"],this._allowedKeyLengths=[128,256],this._allowedModes=["ecb","cbc"],this._defaultOptions={encryptKey:!0,keyEncoding:"utf8",keyLength:256,mode:"cbc"}}return o(e,[{key:"HMACSHA256",value:function(e){return u.default.HmacSHA256(e,this._config.secretKey).toString(u.default.enc.Base64)}},{key:"SHA256",value:function(e){return u.default.SHA256(e).toString(u.default.enc.Hex)}},{key:"_parseOptions",value:function(e){var t=e||{};return t.hasOwnProperty("encryptKey")||(t.encryptKey=this._defaultOptions.encryptKey),t.hasOwnProperty("keyEncoding")||(t.keyEncoding=this._defaultOptions.keyEncoding),t.hasOwnProperty("keyLength")||(t.keyLength=this._defaultOptions.keyLength),t.hasOwnProperty("mode")||(t.mode=this._defaultOptions.mode),-1===this._allowedKeyEncodings.indexOf(t.keyEncoding.toLowerCase())&&(t.keyEncoding=this._defaultOptions.keyEncoding),-1===this._allowedKeyLengths.indexOf(parseInt(t.keyLength,10))&&(t.keyLength=this._defaultOptions.keyLength),-1===this._allowedModes.indexOf(t.mode.toLowerCase())&&(t.mode=this._defaultOptions.mode),t}},{key:"_decodeKey",value:function(e,t){return"base64"===t.keyEncoding?u.default.enc.Base64.parse(e):"hex"===t.keyEncoding?u.default.enc.Hex.parse(e):e}},{key:"_getPaddedKey",value:function(e,t){return e=this._decodeKey(e,t),t.encryptKey?u.default.enc.Utf8.parse(this.SHA256(e).slice(0,32)):e}},{key:"_getMode",value:function(e){return"ecb"===e.mode?u.default.mode.ECB:u.default.mode.CBC}},{key:"_getIV",value:function(e){return"cbc"===e.mode?u.default.enc.Utf8.parse(this._iv):null}},{key:"encrypt",value:function(e,t,n){return this._config.customEncrypt?this._config.customEncrypt(e):this.pnEncrypt(e,t,n)}},{key:"decrypt",value:function(e,t,n){return this._config.customDecrypt?this._config.customDecrypt(e):this.pnDecrypt(e,t,n)}},{key:"pnEncrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),o=this._getPaddedKey(t||this._config.cipherKey,n);return u.default.AES.encrypt(e,o,{iv:r,mode:i}).ciphertext.toString(u.default.enc.Base64)||e}},{key:"pnDecrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),o=this._getPaddedKey(t||this._config.cipherKey,n);try{var s=u.default.enc.Base64.parse(e),a=u.default.AES.decrypt({ciphertext:s},o,{iv:r,mode:i}).toString(u.default.enc.Utf8);return JSON.parse(a)}catch(e){return null}}}]),e}();t.default=c,e.exports=t.default},function(e,t){"use strict";var n=n||function(e,t){var n={},r=n.lib={},i=function(){},o=r.Base={extend:function(e){i.prototype=this;var t=new i;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},s=r.WordArray=o.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=void 0!=t?t:4*e.length},toString:function(e){return(e||u).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes;if(e=e.sigBytes,this.clamp(),r%4)for(var i=0;i<e;i++)t[r+i>>>2]|=(n[i>>>2]>>>24-i%4*8&255)<<24-(r+i)%4*8;else if(65535<n.length)for(i=0;i<e;i+=4)t[r+i>>>2]=n[i>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=o.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],r=0;r<t;r+=4)n.push(4294967296*e.random()|0);return new s.init(n,t)}}),a=n.enc={},u=a.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++){var i=t[r>>>2]>>>24-r%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new s.init(n,t/2)}},c=a.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++)n.push(String.fromCharCode(t[r>>>2]>>>24-r%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(255&e.charCodeAt(r))<<24-r%4*8;return new s.init(n,t)}},l=a.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},h=r.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=l.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n=this._data,r=n.words,i=n.sigBytes,o=this.blockSize,a=i/(4*o),a=t?e.ceil(a):e.max((0|a)-this._minBufferSize,0);if(t=a*o,i=e.min(4*t,i),t){for(var u=0;u<t;u+=o)this._doProcessBlock(r,u);u=r.splice(0,t),n.sigBytes-=i}return new s.init(u,i)},clone:function(){var e=o.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});r.Hasher=h.extend({cfg:o.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new f.HMAC.init(e,n).finalize(t)}}});var f=n.algo={};return n}(Math);!function(e){for(var t=n,r=t.lib,i=r.WordArray,o=r.Hasher,r=t.algo,s=[],a=[],u=function(e){return 4294967296*(e-(0|e))|0},c=2,l=0;64>l;){var h;e:{h=c;for(var f=e.sqrt(h),d=2;d<=f;d++)if(!(h%d)){h=!1;break e}h=!0}h&&(8>l&&(s[l]=u(e.pow(c,.5))),a[l]=u(e.pow(c,1/3)),l++),c++}var p=[],r=r.SHA256=o.extend({_doReset:function(){this._hash=new i.init(s.slice(0))},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],o=n[2],s=n[3],u=n[4],c=n[5],l=n[6],h=n[7],f=0;64>f;f++){if(16>f)p[f]=0|e[t+f];else{var d=p[f-15],g=p[f-2];p[f]=((d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3)+p[f-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+p[f-16]}d=h+((u<<26|u>>>6)^(u<<21|u>>>11)^(u<<7|u>>>25))+(u&c^~u&l)+a[f]+p[f],g=((r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22))+(r&i^r&o^i&o),h=l,l=c,c=u,u=s+d|0,s=o,o=i,i=r,r=d+g|0}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+o|0,n[3]=n[3]+s|0,n[4]=n[4]+u|0,n[5]=n[5]+c|0,n[6]=n[6]+l|0,n[7]=n[7]+h|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return n[i>>>5]|=128<<24-i%32,n[14+(i+64>>>9<<4)]=e.floor(r/4294967296),n[15+(i+64>>>9<<4)]=r,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var e=o.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=o._createHelper(r),t.HmacSHA256=o._createHmacHelper(r)}(Math),function(){var e=n,t=e.enc.Utf8;e.algo.HMAC=e.lib.Base.extend({init:function(e,n){e=this._hasher=new e.init,"string"==typeof n&&(n=t.parse(n));var r=e.blockSize,i=4*r;n.sigBytes>i&&(n=e.finalize(n)),n.clamp();for(var o=this._oKey=n.clone(),s=this._iKey=n.clone(),a=o.words,u=s.words,c=0;c<r;c++)a[c]^=1549556828,u[c]^=909522486;o.sigBytes=s.sigBytes=i,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher;return e=t.finalize(e),t.reset(),t.finalize(this._oKey.clone().concat(e))}})}(),function(){var e=n,t=e.lib.WordArray;e.enc.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp(),e=[];for(var i=0;i<n;i+=3)for(var o=(t[i>>>2]>>>24-i%4*8&255)<<16|(t[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|t[i+2>>>2]>>>24-(i+2)%4*8&255,s=0;4>s&&i+.75*s<n;s++)e.push(r.charAt(o>>>6*(3-s)&63));if(t=r.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var n=e.length,r=this._map,i=r.charAt(64);i&&-1!=(i=e.indexOf(i))&&(n=i);for(var i=[],o=0,s=0;s<n;s++)if(s%4){var a=r.indexOf(e.charAt(s-1))<<s%4*2,u=r.indexOf(e.charAt(s))>>>6-s%4*2;i[o>>>2]|=(a|u)<<24-o%4*8,o++}return t.create(i,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(e){function t(e,t,n,r,i,o,s){return((e=e+(t&n|~t&r)+i+s)<<o|e>>>32-o)+t}function r(e,t,n,r,i,o,s){return((e=e+(t&r|n&~r)+i+s)<<o|e>>>32-o)+t}function i(e,t,n,r,i,o,s){return((e=e+(t^n^r)+i+s)<<o|e>>>32-o)+t}function o(e,t,n,r,i,o,s){return((e=e+(n^(t|~r))+i+s)<<o|e>>>32-o)+t}for(var s=n,a=s.lib,u=a.WordArray,c=a.Hasher,a=s.algo,l=[],h=0;64>h;h++)l[h]=4294967296*e.abs(e.sin(h+1))|0;a=a.MD5=c.extend({_doReset:function(){this._hash=new u.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,n){for(var s=0;16>s;s++){var a=n+s,u=e[a];e[a]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8)}var s=this._hash.words,a=e[n+0],u=e[n+1],c=e[n+2],h=e[n+3],f=e[n+4],d=e[n+5],p=e[n+6],g=e[n+7],y=e[n+8],v=e[n+9],b=e[n+10],_=e[n+11],m=e[n+12],k=e[n+13],P=e[n+14],S=e[n+15],w=s[0],O=s[1],T=s[2],C=s[3],w=t(w,O,T,C,a,7,l[0]),C=t(C,w,O,T,u,12,l[1]),T=t(T,C,w,O,c,17,l[2]),O=t(O,T,C,w,h,22,l[3]),w=t(w,O,T,C,f,7,l[4]),C=t(C,w,O,T,d,12,l[5]),T=t(T,C,w,O,p,17,l[6]),O=t(O,T,C,w,g,22,l[7]),w=t(w,O,T,C,y,7,l[8]),C=t(C,w,O,T,v,12,l[9]),T=t(T,C,w,O,b,17,l[10]),O=t(O,T,C,w,_,22,l[11]),w=t(w,O,T,C,m,7,l[12]),C=t(C,w,O,T,k,12,l[13]),T=t(T,C,w,O,P,17,l[14]),O=t(O,T,C,w,S,22,l[15]),w=r(w,O,T,C,u,5,l[16]),C=r(C,w,O,T,p,9,l[17]),T=r(T,C,w,O,_,14,l[18]),O=r(O,T,C,w,a,20,l[19]),w=r(w,O,T,C,d,5,l[20]),C=r(C,w,O,T,b,9,l[21]),T=r(T,C,w,O,S,14,l[22]),O=r(O,T,C,w,f,20,l[23]),w=r(w,O,T,C,v,5,l[24]),C=r(C,w,O,T,P,9,l[25]),T=r(T,C,w,O,h,14,l[26]),O=r(O,T,C,w,y,20,l[27]),w=r(w,O,T,C,k,5,l[28]),C=r(C,w,O,T,c,9,l[29]),T=r(T,C,w,O,g,14,l[30]),O=r(O,T,C,w,m,20,l[31]),w=i(w,O,T,C,d,4,l[32]),C=i(C,w,O,T,y,11,l[33]),T=i(T,C,w,O,_,16,l[34]),O=i(O,T,C,w,P,23,l[35]),w=i(w,O,T,C,u,4,l[36]),C=i(C,w,O,T,f,11,l[37]),T=i(T,C,w,O,g,16,l[38]),O=i(O,T,C,w,b,23,l[39]),w=i(w,O,T,C,k,4,l[40]),C=i(C,w,O,T,a,11,l[41]),T=i(T,C,w,O,h,16,l[42]),O=i(O,T,C,w,p,23,l[43]),w=i(w,O,T,C,v,4,l[44]),C=i(C,w,O,T,m,11,l[45]),T=i(T,C,w,O,S,16,l[46]),O=i(O,T,C,w,c,23,l[47]),w=o(w,O,T,C,a,6,l[48]),C=o(C,w,O,T,g,10,l[49]),T=o(T,C,w,O,P,15,l[50]),O=o(O,T,C,w,d,21,l[51]),w=o(w,O,T,C,m,6,l[52]),C=o(C,w,O,T,h,10,l[53]),T=o(T,C,w,O,b,15,l[54]),O=o(O,T,C,w,u,21,l[55]),w=o(w,O,T,C,y,6,l[56]),C=o(C,w,O,T,S,10,l[57]),T=o(T,C,w,O,p,15,l[58]),O=o(O,T,C,w,k,21,l[59]),w=o(w,O,T,C,f,6,l[60]),C=o(C,w,O,T,_,10,l[61]),T=o(T,C,w,O,c,15,l[62]),O=o(O,T,C,w,v,21,l[63]);s[0]=s[0]+w|0,s[1]=s[1]+O|0,s[2]=s[2]+T|0,s[3]=s[3]+C|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;n[i>>>5]|=128<<24-i%32;var o=e.floor(r/4294967296);for(n[15+(i+64>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),n[14+(i+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(n.length+1),this._process(),t=this._hash,n=t.words,r=0;4>r;r++)i=n[r],n[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8);return t},clone:function(){var e=c.clone.call(this);return e._hash=this._hash.clone(),e}}),s.MD5=c._createHelper(a),s.HmacMD5=c._createHmacHelper(a)}(Math),function(){var e=n,t=e.lib,r=t.Base,i=t.WordArray,t=e.algo,o=t.EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n=this.cfg,r=n.hasher.create(),o=i.create(),s=o.words,a=n.keySize,n=n.iterations;s.length<a;){u&&r.update(u);var u=r.update(e).finalize(t);r.reset();for(var c=1;c<n;c++)u=r.finalize(u),r.reset();o.concat(u)}return o.sigBytes=4*a,o}});e.EvpKDF=function(e,t,n){return o.create(n).compute(e,t)}}(),n.lib.Cipher||function(e){var t=n,r=t.lib,i=r.Base,o=r.WordArray,s=r.BufferedBlockAlgorithm,a=t.enc.Base64,u=t.algo.EvpKDF,c=r.Cipher=s.extend({cfg:i.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset()},reset:function(){s.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(t,n,r){return("string"==typeof n?g:p).encrypt(e,t,n,r)},decrypt:function(t,n,r){return("string"==typeof n?g:p).decrypt(e,t,n,r)}}}});r.StreamCipher=c.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l=t.mode={},h=function(e,t,n){var r=this._iv;r?this._iv=void 0:r=this._prevBlock;for(var i=0;i<n;i++)e[t+i]^=r[i]},f=(r.BlockCipherMode=i.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}})).extend();f.Encryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize;h.call(this,e,t,r),n.encryptBlock(e,t),this._prevBlock=e.slice(t,t+r)}}),f.Decryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=e.slice(t,t+r);n.decryptBlock(e,t),h.call(this,e,t,r),this._prevBlock=i}}),l=l.CBC=f,f=(t.pad={}).Pkcs7={pad:function(e,t){for(var n=4*t,n=n-e.sigBytes%n,r=n<<24|n<<16|n<<8|n,i=[],s=0;s<n;s+=4)i.push(r);n=o.create(i,n),e.concat(n)},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2]}},r.BlockCipher=c.extend({cfg:c.cfg.extend({mode:l,padding:f}),reset:function(){c.reset.call(this);var e=this.cfg,t=e.iv,e=e.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=e.createEncryptor;else n=e.createDecryptor,this._minBufferSize=1;this._mode=n.call(e,this,t&&t.words)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){e.pad(this._data,this.blockSize);var t=this._process(!0)}else t=this._process(!0),e.unpad(t);return t},blockSize:4});var d=r.CipherParams=i.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}}),l=(t.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return e=e.salt,(e?o.create([1398893684,1701076831]).concat(e).concat(t):t).toString(a)},parse:function(e){e=a.parse(e);var t=e.words;if(1398893684==t[0]&&1701076831==t[1]){var n=o.create(t.slice(2,4));t.splice(0,4),e.sigBytes-=16}return d.create({ciphertext:e,salt:n})}},p=r.SerializableCipher=i.extend({cfg:i.extend({format:l}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r);return t=i.finalize(t),i=i.cfg,d.create({ciphertext:t,key:n,iv:i.iv,algorithm:e,mode:i.mode,padding:i.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return"string"==typeof e?t.parse(e,this):e}}),t=(t.kdf={}).OpenSSL={execute:function(e,t,n,r){return r||(r=o.random(8)),e=u.create({keySize:t+n}).compute(e,r),n=o.create(e.words.slice(t),4*n),e.sigBytes=4*t,d.create({key:e,iv:n,salt:r})}},g=r.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:t}),encrypt:function(e,t,n,r){return r=this.cfg.extend(r),n=r.kdf.execute(n,e.keySize,e.ivSize),r.iv=n.iv,e=p.encrypt.call(this,e,t,n.key,r),e.mixIn(n),e},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),n=r.kdf.execute(n,e.keySize,e.ivSize,t.salt),r.iv=n.iv,p.decrypt.call(this,e,t,n.key,r)}})}(),function(){for(var e=n,t=e.lib.BlockCipher,r=e.algo,i=[],o=[],s=[],a=[],u=[],c=[],l=[],h=[],f=[],d=[],p=[],g=0;256>g;g++)p[g]=128>g?g<<1:g<<1^283;for(var y=0,v=0,g=0;256>g;g++){var b=v^v<<1^v<<2^v<<3^v<<4,b=b>>>8^255&b^99;i[y]=b,o[b]=y;var _=p[y],m=p[_],k=p[m],P=257*p[b]^16843008*b;s[y]=P<<24|P>>>8,a[y]=P<<16|P>>>16,u[y]=P<<8|P>>>24,c[y]=P,P=16843009*k^65537*m^257*_^16843008*y,l[b]=P<<24|P>>>8,h[b]=P<<16|P>>>16,f[b]=P<<8|P>>>24,d[b]=P,y?(y=_^p[p[p[k^_]]],v^=p[p[v]]):y=v=1}var S=[0,1,2,4,8,16,32,64,128,27,54],r=r.AES=t.extend({_doReset:function(){for(var e=this._key,t=e.words,n=e.sigBytes/4,e=4*((this._nRounds=n+6)+1),r=this._keySchedule=[],o=0;o<e;o++)if(o<n)r[o]=t[o];else{var s=r[o-1];o%n?6<n&&4==o%n&&(s=i[s>>>24]<<24|i[s>>>16&255]<<16|i[s>>>8&255]<<8|i[255&s]):(s=s<<8|s>>>24,s=i[s>>>24]<<24|i[s>>>16&255]<<16|i[s>>>8&255]<<8|i[255&s],s^=S[o/n|0]<<24),r[o]=r[o-n]^s}for(t=this._invKeySchedule=[],n=0;n<e;n++)o=e-n,s=n%4?r[o]:r[o-4],t[n]=4>n||4>=o?s:l[i[s>>>24]]^h[i[s>>>16&255]]^f[i[s>>>8&255]]^d[i[255&s]]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,s,a,u,c,i)},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,l,h,f,d,o),n=e[t+1],e[t+1]=e[t+3],e[t+3]=n},_doCryptBlock:function(e,t,n,r,i,o,s,a){for(var u=this._nRounds,c=e[t]^n[0],l=e[t+1]^n[1],h=e[t+2]^n[2],f=e[t+3]^n[3],d=4,p=1;p<u;p++)var g=r[c>>>24]^i[l>>>16&255]^o[h>>>8&255]^s[255&f]^n[d++],y=r[l>>>24]^i[h>>>16&255]^o[f>>>8&255]^s[255&c]^n[d++],v=r[h>>>24]^i[f>>>16&255]^o[c>>>8&255]^s[255&l]^n[d++],f=r[f>>>24]^i[c>>>16&255]^o[l>>>8&255]^s[255&h]^n[d++],c=g,l=y,h=v;g=(a[c>>>24]<<24|a[l>>>16&255]<<16|a[h>>>8&255]<<8|a[255&f])^n[d++],y=(a[l>>>24]<<24|a[h>>>16&255]<<16|a[f>>>8&255]<<8|a[255&c])^n[d++],v=(a[h>>>24]<<24|a[f>>>16&255]<<16|a[c>>>8&255]<<8|a[255&l])^n[d++],f=(a[f>>>24]<<24|a[c>>>16&255]<<16|a[l>>>8&255]<<8|a[255&h])^n[d++],e[t]=g,e[t+1]=y,e[t+2]=v,e[t+3]=f},keySize:8});e.AES=t._createHelper(r)}(),n.mode.ECB=function(){var e=n.lib.BlockCipherMode.extend();return e.Encryptor=e.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t)}}),e.Decryptor=e.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t)}}),e}(),e.exports=n},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(9),a=(r(s),n(7)),u=(r(a),n(12)),c=(r(u),n(14)),l=r(c),h=n(17),f=r(h),d=(n(8),n(13)),p=r(d),g=function(){function e(t){var n=t.subscribeEndpoint,r=t.leaveEndpoint,o=t.heartbeatEndpoint,s=t.setStateEndpoint,a=t.timeEndpoint,u=t.config,c=t.crypto,h=t.listenerManager;i(this,e),this._listenerManager=h,this._config=u,this._leaveEndpoint=r,this._heartbeatEndpoint=o,this._setStateEndpoint=s,this._subscribeEndpoint=n,this._crypto=c,this._channels={},this._presenceChannels={},this._channelGroups={},this._presenceChannelGroups={},this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[],this._currentTimetoken=0,this._lastTimetoken=0,this._storedTimetoken=null,this._subscriptionStatusAnnounced=!1,this._isOnline=!0,this._reconnectionManager=new l.default({timeEndpoint:a})}return o(e,[{key:"adaptStateChange",value:function(e,t){var n=this,r=e.state,i=e.channels,o=void 0===i?[]:i,s=e.channelGroups,a=void 0===s?[]:s;return o.forEach(function(e){e in n._channels&&(n._channels[e].state=r)}),a.forEach(function(e){e in n._channelGroups&&(n._channelGroups[e].state=r)}),this._setStateEndpoint({state:r,channels:o,channelGroups:a},t)}},{key:"adaptSubscribeChange",value:function(e){var t=this,n=e.timetoken,r=e.channels,i=void 0===r?[]:r,o=e.channelGroups,s=void 0===o?[]:o,a=e.withPresence,u=void 0!==a&&a;if(!this._config.subscribeKey||""===this._config.subscribeKey)return void(console&&console.log&&console.log("subscribe key missing; aborting subscribe"));n&&(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=n),"0"!==this._currentTimetoken&&(this._storedTimetoken=this._currentTimetoken,this._currentTimetoken=0),i.forEach(function(e){t._channels[e]={state:{}},u&&(t._presenceChannels[e]={}),t._pendingChannelSubscriptions.push(e)}),s.forEach(function(e){t._channelGroups[e]={state:{}},u&&(t._presenceChannelGroups[e]={}),t._pendingChannelGroupSubscriptions.push(e)}),this._subscriptionStatusAnnounced=!1,this.reconnect()}},{key:"adaptUnsubscribeChange",
value:function(e,t){var n=this,r=e.channels,i=void 0===r?[]:r,o=e.channelGroups,s=void 0===o?[]:o;i.forEach(function(e){e in n._channels&&delete n._channels[e],e in n._presenceChannels&&delete n._presenceChannels[e]}),s.forEach(function(e){e in n._channelGroups&&delete n._channelGroups[e],e in n._presenceChannelGroups&&delete n._channelGroups[e]}),!1!==this._config.suppressLeaveEvents||t||this._leaveEndpoint({channels:i,channelGroups:s},function(e){e.affectedChannels=i,e.affectedChannelGroups=s,e.currentTimetoken=n._currentTimetoken,e.lastTimetoken=n._lastTimetoken,n._listenerManager.announceStatus(e)}),0===Object.keys(this._channels).length&&0===Object.keys(this._presenceChannels).length&&0===Object.keys(this._channelGroups).length&&0===Object.keys(this._presenceChannelGroups).length&&(this._lastTimetoken=0,this._currentTimetoken=0,this._storedTimetoken=null,this._region=null,this._reconnectionManager.stopPolling()),this.reconnect()}},{key:"unsubscribeAll",value:function(e){this.adaptUnsubscribeChange({channels:this.getSubscribedChannels(),channelGroups:this.getSubscribedChannelGroups()},e)}},{key:"getSubscribedChannels",value:function(){return Object.keys(this._channels)}},{key:"getSubscribedChannelGroups",value:function(){return Object.keys(this._channelGroups)}},{key:"reconnect",value:function(){this._startSubscribeLoop(),this._registerHeartbeatTimer()}},{key:"disconnect",value:function(){this._stopSubscribeLoop(),this._stopHeartbeatTimer(),this._reconnectionManager.stopPolling()}},{key:"_registerHeartbeatTimer",value:function(){this._stopHeartbeatTimer(),this._performHeartbeatLoop(),this._heartbeatTimer=setInterval(this._performHeartbeatLoop.bind(this),1e3*this._config.getHeartbeatInterval())}},{key:"_stopHeartbeatTimer",value:function(){this._heartbeatTimer&&(clearInterval(this._heartbeatTimer),this._heartbeatTimer=null)}},{key:"_performHeartbeatLoop",value:function(){var e=this,t=Object.keys(this._channels),n=Object.keys(this._channelGroups),r={};if(0!==t.length||0!==n.length){t.forEach(function(t){var n=e._channels[t].state;Object.keys(n).length&&(r[t]=n)}),n.forEach(function(t){var n=e._channelGroups[t].state;Object.keys(n).length&&(r[t]=n)});var i=function(t){t.error&&e._config.announceFailedHeartbeats&&e._listenerManager.announceStatus(t),t.error&&e._config.autoNetworkDetection&&e._isOnline&&(e._isOnline=!1,e.disconnect(),e._listenerManager.announceNetworkDown(),e.reconnect()),!t.error&&e._config.announceSuccessfulHeartbeats&&e._listenerManager.announceStatus(t)};this._heartbeatEndpoint({channels:t,channelGroups:n,state:r},i.bind(this))}}},{key:"_startSubscribeLoop",value:function(){this._stopSubscribeLoop();var e=[],t=[];if(Object.keys(this._channels).forEach(function(t){return e.push(t)}),Object.keys(this._presenceChannels).forEach(function(t){return e.push(t+"-pnpres")}),Object.keys(this._channelGroups).forEach(function(e){return t.push(e)}),Object.keys(this._presenceChannelGroups).forEach(function(e){return t.push(e+"-pnpres")}),0!==e.length||0!==t.length){var n={channels:e,channelGroups:t,timetoken:this._currentTimetoken,filterExpression:this._config.filterExpression,region:this._region};this._subscribeCall=this._subscribeEndpoint(n,this._processSubscribeResponse.bind(this))}}},{key:"_processSubscribeResponse",value:function(e,t){var n=this;if(e.error)return void(e.category===p.default.PNTimeoutCategory?this._startSubscribeLoop():e.category===p.default.PNNetworkIssuesCategory?(this.disconnect(),e.error&&this._config.autoNetworkDetection&&this._isOnline&&(this._isOnline=!1,this._listenerManager.announceNetworkDown()),this._reconnectionManager.onReconnection(function(){n._config.autoNetworkDetection&&!n._isOnline&&(n._isOnline=!0,n._listenerManager.announceNetworkUp()),n.reconnect(),n._subscriptionStatusAnnounced=!0;var t={category:p.default.PNReconnectedCategory,operation:e.operation,lastTimetoken:n._lastTimetoken,currentTimetoken:n._currentTimetoken};n._listenerManager.announceStatus(t)}),this._reconnectionManager.startPolling(),this._listenerManager.announceStatus(e)):e.category===p.default.PNBadRequestCategory?(this._stopHeartbeatTimer(),this._listenerManager.announceStatus(e)):this._listenerManager.announceStatus(e));if(this._storedTimetoken?(this._currentTimetoken=this._storedTimetoken,this._storedTimetoken=null):(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=t.metadata.timetoken),!this._subscriptionStatusAnnounced){var r={};r.category=p.default.PNConnectedCategory,r.operation=e.operation,r.affectedChannels=this._pendingChannelSubscriptions,r.subscribedChannels=this.getSubscribedChannels(),r.affectedChannelGroups=this._pendingChannelGroupSubscriptions,r.lastTimetoken=this._lastTimetoken,r.currentTimetoken=this._currentTimetoken,this._subscriptionStatusAnnounced=!0,this._listenerManager.announceStatus(r),this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[]}var i=t.messages||[],o=this._config.requestMessageCountThreshold;if(o&&i.length>=o){var s={};s.category=p.default.PNRequestMessageCountExceededCategory,s.operation=e.operation,this._listenerManager.announceStatus(s)}i.forEach(function(e){var t=e.channel,r=e.subscriptionMatch,i=e.publishMetaData;if(t===r&&(r=null),f.default.endsWith(e.channel,"-pnpres")){var o={};o.channel=null,o.subscription=null,o.actualChannel=null!=r?t:null,o.subscribedChannel=null!=r?r:t,t&&(o.channel=t.substring(0,t.lastIndexOf("-pnpres"))),r&&(o.subscription=r.substring(0,r.lastIndexOf("-pnpres"))),o.action=e.payload.action,o.state=e.payload.data,o.timetoken=i.publishTimetoken,o.occupancy=e.payload.occupancy,o.uuid=e.payload.uuid,o.timestamp=e.payload.timestamp,e.payload.join&&(o.join=e.payload.join),e.payload.leave&&(o.leave=e.payload.leave),e.payload.timeout&&(o.timeout=e.payload.timeout),n._listenerManager.announcePresence(o)}else{var s={};s.channel=null,s.subscription=null,s.actualChannel=null!=r?t:null,s.subscribedChannel=null!=r?r:t,s.channel=t,s.subscription=r,s.timetoken=i.publishTimetoken,s.publisher=e.issuingClientId,e.userMetadata&&(s.userMetadata=e.userMetadata),n._config.cipherKey?s.message=n._crypto.decrypt(e.payload):s.message=e.payload,n._listenerManager.announceMessage(s)}}),this._region=t.metadata.region,this._startSubscribeLoop()}},{key:"_stopSubscribeLoop",value:function(){this._subscribeCall&&(this._subscribeCall.abort(),this._subscribeCall=null)}}]),e}();t.default=g,e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=(n(8),n(13)),s=function(e){return e&&e.__esModule?e:{default:e}}(o),a=function(){function e(){r(this,e),this._listeners=[]}return i(e,[{key:"addListener",value:function(e){this._listeners.push(e)}},{key:"removeListener",value:function(e){var t=[];this._listeners.forEach(function(n){n!==e&&t.push(n)}),this._listeners=t}},{key:"removeAllListeners",value:function(){this._listeners=[]}},{key:"announcePresence",value:function(e){this._listeners.forEach(function(t){t.presence&&t.presence(e)})}},{key:"announceStatus",value:function(e){this._listeners.forEach(function(t){t.status&&t.status(e)})}},{key:"announceMessage",value:function(e){this._listeners.forEach(function(t){t.message&&t.message(e)})}},{key:"announceNetworkUp",value:function(){var e={};e.category=s.default.PNNetworkUpCategory,this.announceStatus(e)}},{key:"announceNetworkDown",value:function(){var e={};e.category=s.default.PNNetworkDownCategory,this.announceStatus(e)}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNNetworkUpCategory:"PNNetworkUpCategory",PNNetworkDownCategory:"PNNetworkDownCategory",PNNetworkIssuesCategory:"PNNetworkIssuesCategory",PNTimeoutCategory:"PNTimeoutCategory",PNBadRequestCategory:"PNBadRequestCategory",PNAccessDeniedCategory:"PNAccessDeniedCategory",PNUnknownCategory:"PNUnknownCategory",PNReconnectedCategory:"PNReconnectedCategory",PNConnectedCategory:"PNConnectedCategory",PNRequestMessageCountExceededCategory:"PNRequestMessageCountExceededCategory"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(15),s=(function(e){e&&e.__esModule}(o),n(8),function(){function e(t){var n=t.timeEndpoint;r(this,e),this._timeEndpoint=n}return i(e,[{key:"onReconnection",value:function(e){this._reconnectionCallback=e}},{key:"startPolling",value:function(){this._timeTimer=setInterval(this._performTimeLoop.bind(this),3e3)}},{key:"stopPolling",value:function(){clearInterval(this._timeTimer)}},{key:"_performTimeLoop",value:function(){var e=this;this._timeEndpoint(function(t){t.error||(clearInterval(e._timeTimer),e._reconnectionCallback())})}}]),e}());t.default=s,e.exports=t.default},function(e,t,n){"use strict";function r(){return h.default.PNTimeOperation}function i(){return"/time/0"}function o(e){return e.config.getTransactionTimeout()}function s(){return{}}function a(){return!1}function u(e,t){return{timetoken:t[0]}}function c(){}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.getURL=i,t.getRequestTimeout=o,t.prepareParams=s,t.isAuthSupported=a,t.handleResponse=u,t.validateParams=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNTimeOperation:"PNTimeOperation",PNHistoryOperation:"PNHistoryOperation",PNFetchMessagesOperation:"PNFetchMessagesOperation",PNSubscribeOperation:"PNSubscribeOperation",PNUnsubscribeOperation:"PNUnsubscribeOperation",PNPublishOperation:"PNPublishOperation",PNPushNotificationEnabledChannelsOperation:"PNPushNotificationEnabledChannelsOperation",PNRemoveAllPushNotificationsOperation:"PNRemoveAllPushNotificationsOperation",PNWhereNowOperation:"PNWhereNowOperation",PNSetStateOperation:"PNSetStateOperation",PNHereNowOperation:"PNHereNowOperation",PNGetStateOperation:"PNGetStateOperation",PNHeartbeatOperation:"PNHeartbeatOperation",PNChannelGroupsOperation:"PNChannelGroupsOperation",PNRemoveGroupOperation:"PNRemoveGroupOperation",PNChannelsForGroupOperation:"PNChannelsForGroupOperation",PNAddChannelsToGroupOperation:"PNAddChannelsToGroupOperation",PNRemoveChannelsFromGroupOperation:"PNRemoveChannelsFromGroupOperation",PNAccessManagerGrant:"PNAccessManagerGrant",PNAccessManagerAudit:"PNAccessManagerAudit"},e.exports=t.default},function(e,t){"use strict";function n(e){var t=[];return Object.keys(e).forEach(function(e){return t.push(e)}),t}function r(e){return encodeURIComponent(e).replace(/[!~*'()]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function i(e){return n(e).sort()}function o(e){return i(e).map(function(t){return t+"="+r(e[t])}).join("&")}function s(e,t){return-1!==e.indexOf(t,this.length-t.length)}function a(){var e=void 0,t=void 0;return{promise:new Promise(function(n,r){e=n,t=r}),reject:t,fulfill:e}}e.exports={signPamFromParams:o,endsWith:s,createPromise:a,encodeString:r}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return e.type=t,e.error=!0,e}function u(e){return a({message:e},"validationError")}function c(e,t,n){return e.usePost&&e.usePost(t,n)?e.postURL(t,n):e.getURL(t,n)}function l(e){var t="PubNub-JS-"+e.sdkFamily;return e.partnerId&&(t+="-"+e.partnerId),t+="/"+e.getVersion()}function h(e,t,n){var r=e.config,i=e.crypto;n.timestamp=Math.floor((new Date).getTime()/1e3);var o=r.subscribeKey+"\n"+r.publishKey+"\n"+t+"\n";o+=g.default.signPamFromParams(n);var s=i.HMACSHA256(o);s=s.replace(/\+/g,"-"),s=s.replace(/\//g,"_"),n.signature=s}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=e.networking,r=e.config,i=null,o=null,s={};t.getOperation()===b.default.PNTimeOperation||t.getOperation()===b.default.PNChannelGroupsOperation?i=arguments.length<=2?void 0:arguments[2]:(s=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]),"undefined"==typeof Promise||i||(o=g.default.createPromise());var a=t.validateParams(e,s);if(!a){var f=t.prepareParams(e,s),p=c(t,e,s),y=void 0,v={url:p,operation:t.getOperation(),timeout:t.getRequestTimeout(e)};f.uuid=r.UUID,f.pnsdk=l(r),r.useInstanceId&&(f.instanceid=r.instanceId),r.useRequestId&&(f.requestid=d.default.v4()),t.isAuthSupported()&&r.getAuthKey()&&(f.auth=r.getAuthKey()),r.secretKey&&h(e,p,f);var m=function(n,r){if(n.error)return void(i?i(n):o&&o.reject(new _("PubNub call failed, check status for details",n)));var a=t.handleResponse(e,r,s);i?i(n,a):o&&o.fulfill(a)};if(t.usePost&&t.usePost(e,s)){var k=t.postPayload(e,s);y=n.POST(f,k,v,m)}else y=n.GET(f,v,m);return t.getOperation()===b.default.PNSubscribeOperation?y:o?o.promise:void 0}return i?i(u(a)):o?(o.reject(new _("Validation failed, check status for details",u(a))),o.promise):void 0};var f=n(2),d=r(f),p=(n(8),n(17)),g=r(p),y=n(7),v=(r(y),n(16)),b=r(v),_=function(e){function t(e,n){i(this,t);var r=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.name=r.constructor.name,r.status=n,r.message=e,r}return s(t,e),t}(Error);e.exports=t.default},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNAddChannelsToGroupOperation}function o(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function s(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{add:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveChannelsFromGroupOperation}function o(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function s(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{remove:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveGroupOperation}function o(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function s(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)+"/remove"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(){return{}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNChannelGroupsOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e){return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group"}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{groups:t.payload.groups}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNChannelsForGroupOperation}function o(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function s(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(){return{}}function l(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,o=e.config;return n?r?i&&0!==i.length?o.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function o(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,add:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,o=e.config;return n?r?i&&0!==i.length?o.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function o(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,remove:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function o(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(e,t){return{channels:t}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNRemoveAllPushNotificationsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function o(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n+"/remove"}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNUnsubscribeOperation}function o(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(o)+"/leave"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNWhereNowOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r;return"/v2/presence/sub-key/"+n.subscribeKey+"/uuid/"+i}function s(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHeartbeatOperation}function o(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(o)+"/heartbeat"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.state,o=void 0===i?{}:i,s=e.config,a={};return r.length>0&&(a["channel-group"]=r.join(",")),a.state=JSON.stringify(o),a.heartbeat=s.getPresenceTimeout(),a}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNGetStateOperation}function o(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r,o=t.channels,s=void 0===o?[]:o,a=s.length>0?s.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(a)+"/uuid/"+i}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,o=n.channelGroups,s=void 0===o?[]:o,a={};return 1===i.length&&0===s.length?a[i[0]]=t.payload:a=t.payload,{channels:a}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSetStateOperation}function o(e,t){var n=e.config,r=t.state,i=t.channels,o=void 0===i?[]:i,s=t.channelGroups,a=void 0===s?[]:s;return r?n.subscribeKey?0===o.length&&0===a.length?"Please provide a list of channels and/or channel-groups":void 0:"Missing Subscribe Key":"Missing State"}function s(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(o)+"/uuid/"+n.UUID+"/data"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.state,r=t.channelGroups,i=void 0===r?[]:r,o={};return o.state=JSON.stringify(n),i.length>0&&(o["channel-group"]=i.join(",")),o}function l(e,t){return{state:t.payload}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHereNowOperation}function o(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=t.channelGroups,s=void 0===o?[]:o,a="/v2/presence/sub-key/"+n.subscribeKey;if(i.length>0||s.length>0){var u=i.length>0?i.join(","):",";a+="/channel/"+p.default.encodeString(u)}return a}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.includeUUIDs,o=void 0===i||i,s=t.includeState,a=void 0!==s&&s,u={};return o||(u.disable_uuids=1),a&&(u.state=1),r.length>0&&(u["channel-group"]=r.join(",")),u}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,o=n.channelGroups,s=void 0===o?[]:o,a=n.includeUUIDs,u=void 0===a||a,c=n.includeState,l=void 0!==c&&c;return i.length>1||s.length>0||0===s.length&&0===i.length?function(){var e={};return e.totalChannels=t.payload.total_channels,e.totalOccupancy=t.payload.total_occupancy,e.channels={},Object.keys(t.payload.channels).forEach(function(n){var r=t.payload.channels[n],i=[];return e.channels[n]={occupants:i,name:n,occupancy:r.occupancy},u&&r.uuids.forEach(function(e){l?i.push({state:e.state,uuid:e.uuid}):i.push({state:null,uuid:e})}),e}),e}():function(){var e={},n=[];return e.totalChannels=1,e.totalOccupancy=t.occupancy,e.channels={},e.channels[i[0]]={occupants:n,name:i[0],occupancy:t.occupancy},u&&t.uuids.forEach(function(e){l?n.push({state:e.state,uuid:e.uuid}):n.push({state:null,uuid:e})}),e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerAudit}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e){return"/v2/auth/audit/sub-key/"+e.config.subscribeKey}function s(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channel,r=t.channelGroup,i=t.authKeys,o=void 0===i?[]:i,s={};return n&&(s.channel=n),r&&(s["channel-group"]=r),o.length>0&&(s.auth=o.join(",")),s}function c(e,t){return t.payload}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerGrant}function i(e){var t=e.config;return t.subscribeKey?t.publishKey?t.secretKey?void 0:"Missing Secret Key":"Missing Publish Key":"Missing Subscribe Key"}function o(e){return"/v2/auth/grant/sub-key/"+e.config.subscribeKey}function s(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.channelGroups,o=void 0===i?[]:i,s=t.ttl,a=t.read,u=void 0!==a&&a,c=t.write,l=void 0!==c&&c,h=t.manage,f=void 0!==h&&h,d=t.authKeys,p=void 0===d?[]:d,g={};return g.r=u?"1":"0",g.w=l?"1":"0",g.m=f?"1":"0",r.length>0&&(g.channel=r.join(",")),o.length>0&&(g["channel-group"]=o.join(",")),p.length>0&&(g.auth=p.join(",")),(s||0===s)&&(g.ttl=s),g}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=o,t.getRequestTimeout=s,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i}function o(){return v.default.PNPublishOperation}function s(e,t){var n=e.config,r=t.message;return t.channel?r?n.subscribeKey?void 0:"Missing Subscribe Key":"Missing Message":"Missing Channel"}function a(e,t){var n=t.sendByPost;return void 0!==n&&n}function u(e,t){var n=e.config,r=t.channel,o=t.message,s=i(e,o);return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0/"+_.default.encodeString(s)}function c(e,t){var n=e.config,r=t.channel;return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0"}function l(e){return e.config.getTransactionTimeout()}function h(){return!0}function f(e,t){return i(e,t.message)}function d(e,t){var n=t.meta,r=t.replicate,i=void 0===r||r,o=t.storeInHistory,s=t.ttl,a={};return null!=o&&(a.store=o?"1":"0"),s&&(a.ttl=s),!1===i&&(a.norep="true"),n&&"object"===(void 0===n?"undefined":g(n))&&(a.meta=JSON.stringify(n)),a}function p(e,t){return{timetoken:t[2]}}Object.defineProperty(t,"__esModule",{value:!0});var g="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.getOperation=o,t.validateParams=s,t.usePost=a,t.getURL=u,t.postURL=c,t.getRequestTimeout=l,t.isAuthSupported=h,t.postPayload=f,t.prepareParams=d,t.handleResponse=p;var y=(n(8),n(16)),v=r(y),b=n(17),_=r(b)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function o(){return d.default.PNHistoryOperation}function s(e,t){var n=t.channel,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channel"}function a(e,t){var n=t.channel;return"/v2/history/sub-key/"+e.config.subscribeKey+"/channel/"+g.default.encodeString(n)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.reverse,o=t.count,s=void 0===o?100:o,a=t.stringifiedTimeToken,u=void 0!==a&&a,c={include_token:"true"};return c.count=s,n&&(c.start=n),r&&(c.end=r),u&&(c.string_message_token="true"),
null!=i&&(c.reverse=i.toString()),c}function h(e,t){var n={messages:[],startTimeToken:t[1],endTimeToken:t[2]};return t[0].forEach(function(t){var r={timetoken:t.timetoken,entry:i(e,t.message)};n.messages.push(r)}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=o,t.validateParams=s,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),n(16)),d=r(f),p=n(17),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function o(){return d.default.PNFetchMessagesOperation}function s(e,t){var n=t.channels,r=e.config;return n&&0!==n.length?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channels"}function a(e,t){var n=t.channels,r=void 0===n?[]:n,i=e.config,o=r.length>0?r.join(","):",";return"/v3/history/sub-key/"+i.subscribeKey+"/channel/"+g.default.encodeString(o)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.count,o={};return i&&(o.max=i),n&&(o.start=n),r&&(o.end=r),o}function h(e,t){var n={channels:{}};return Object.keys(t.channels||{}).forEach(function(r){n.channels[r]=[],(t.channels[r]||[]).forEach(function(t){var o={};o.channel=r,o.subscription=null,o.timetoken=t.timetoken,o.message=i(e,t.message),n.channels[r].push(o)})}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=o,t.validateParams=s,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),n(16)),d=r(f),p=n(17),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSubscribeOperation}function o(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=i.length>0?i.join(","):",";return"/v2/subscribe/"+n.subscribeKey+"/"+p.default.encodeString(o)+"/0"}function a(e){return e.config.getSubscribeTimeout()}function u(){return!0}function c(e,t){var n=e.config,r=t.channelGroups,i=void 0===r?[]:r,o=t.timetoken,s=t.filterExpression,a=t.region,u={heartbeat:n.getPresenceTimeout()};return i.length>0&&(u["channel-group"]=i.join(",")),s&&s.length>0&&(u["filter-expr"]=s),o&&(u.tt=o),a&&(u.tr=a),u}function l(e,t){var n=[];t.m.forEach(function(e){var t={publishTimetoken:e.p.t,region:e.p.r},r={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,userMetadata:e.u,publishMetaData:t};n.push(r)});var r={timetoken:t.t.t,region:t.t.r};return{messages:n,metadata:r}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=o,t.getURL=s,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(7),a=(r(s),n(13)),u=r(a),c=(n(8),function(){function e(t){var n=this;i(this,e),this._modules={},Object.keys(t).forEach(function(e){n._modules[e]=t[e].bind(n)})}return o(e,[{key:"init",value:function(e){this._config=e,this._maxSubDomain=20,this._currentSubDomain=Math.floor(Math.random()*this._maxSubDomain),this._providedFQDN=(this._config.secure?"https://":"http://")+this._config.origin,this._coreParams={},this.shiftStandardOrigin()}},{key:"nextOrigin",value:function(){if(-1===this._providedFQDN.indexOf("pubsub."))return this._providedFQDN;var e=void 0;return this._currentSubDomain=this._currentSubDomain+1,this._currentSubDomain>=this._maxSubDomain&&(this._currentSubDomain=1),e=this._currentSubDomain.toString(),this._providedFQDN.replace("pubsub","ps"+e)}},{key:"shiftStandardOrigin",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this._standardOrigin=this.nextOrigin(e),this._standardOrigin}},{key:"getStandardOrigin",value:function(){return this._standardOrigin}},{key:"POST",value:function(e,t,n,r){return this._modules.post(e,t,n,r)}},{key:"GET",value:function(e,t,n){return this._modules.get(e,t,n)}},{key:"_detectErrorCategory",value:function(e){if("ENOTFOUND"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNREFUSED"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNRESET"===e.code)return u.default.PNNetworkIssuesCategory;if("EAI_AGAIN"===e.code)return u.default.PNNetworkIssuesCategory;if(0===e.status||e.hasOwnProperty("status")&&void 0===e.status)return u.default.PNNetworkIssuesCategory;if(e.timeout)return u.default.PNTimeoutCategory;if(e.response){if(e.response.badRequest)return u.default.PNBadRequestCategory;if(e.response.forbidden)return u.default.PNAccessDeniedCategory}return u.default.PNUnknownCategory}}]),e}());t.default=c,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={get:function(e){try{return localStorage.getItem(e)}catch(e){return null}},set:function(e,t){try{return localStorage.setItem(e,t)}catch(e){return null}}},e.exports=t.default},function(e,t,n){"use strict";function r(e){var t=(new Date).getTime(),n=(new Date).toISOString(),r=function(){return console&&console.log?console:window&&window.console&&window.console.log?window.console:console}();r.log("<<<<<"),r.log("["+n+"]","\n",e.url,"\n",e.qs),r.log("-----"),e.on("response",function(n){var i=(new Date).getTime(),o=i-t,s=(new Date).toISOString();r.log(">>>>>>"),r.log("["+s+" / "+o+"]","\n",e.url,"\n",e.qs,"\n",n.text),r.log("-----")})}function i(e,t,n){var i=this;return this._config.logVerbosity&&(e=e.use(r)),this._config.proxy&&this._modules.proxy&&(e=this._modules.proxy.call(this,e)),this._config.keepAlive&&this._modules.keepAlive&&(e=this._module.keepAlive(e)),e.timeout(t.timeout).end(function(e,r){var o={};if(o.error=null!==e,o.operation=t.operation,r&&r.status&&(o.statusCode=r.status),e)return o.errorData=e,o.category=i._detectErrorCategory(e),n(o,null);var s=JSON.parse(r.text);return s.error&&1===s.error&&s.status&&s.message&&s.service?(o.errorData=s,o.statusCode=s.status,o.error=!0,o.category=i._detectErrorCategory(o),n(o,null)):n(o,s)})}function o(e,t,n){var r=u.default.get(this.getStandardOrigin()+t.url).query(e);return i.call(this,r,t,n)}function s(e,t,n,r){var o=u.default.post(this.getStandardOrigin()+n.url).query(e).send(t);return i.call(this,o,n,r)}Object.defineProperty(t,"__esModule",{value:!0}),t.get=o,t.post=s;var a=n(43),u=function(e){return e&&e.__esModule?e:{default:e}}(a);n(8)},function(e,t,n){function r(){}function i(e){if(!v(e))return e;var t=[];for(var n in e)o(t,n,e[n]);return t.join("&")}function o(e,t,n){if(null!=n)if(Array.isArray(n))n.forEach(function(n){o(e,t,n)});else if(v(n))for(var r in n)o(e,t+"["+r+"]",n[r]);else e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));else null===n&&e.push(encodeURIComponent(t))}function s(e){for(var t,n,r={},i=e.split("&"),o=0,s=i.length;o<s;++o)t=i[o],n=t.indexOf("="),-1==n?r[decodeURIComponent(t)]="":r[decodeURIComponent(t.slice(0,n))]=decodeURIComponent(t.slice(n+1));return r}function a(e){var t,n,r,i,o=e.split(/\r?\n/),s={};o.pop();for(var a=0,u=o.length;a<u;++a)n=o[a],t=n.indexOf(":"),r=n.slice(0,t).toLowerCase(),i=_(n.slice(t+1)),s[r]=i;return s}function u(e){return/[\/+]json\b/.test(e)}function c(e){return e.split(/ *; */).shift()}function l(e){return e.split(/ *; */).reduce(function(e,t){var n=t.split(/ *= */),r=n.shift(),i=n.shift();return r&&i&&(e[r]=i),e},{})}function h(e,t){t=t||{},this.req=e,this.xhr=this.req.xhr,this.text="HEAD"!=this.req.method&&(""===this.xhr.responseType||"text"===this.xhr.responseType)||void 0===this.xhr.responseType?this.xhr.responseText:null,this.statusText=this.req.xhr.statusText,this._setStatusProperties(this.xhr.status),this.header=this.headers=a(this.xhr.getAllResponseHeaders()),this.header["content-type"]=this.xhr.getResponseHeader("content-type"),this._setHeaderProperties(this.header),this.body="HEAD"!=this.req.method?this._parseBody(this.text?this.text:this.xhr.response):null}function f(e,t){var n=this;this._query=this._query||[],this.method=e,this.url=t,this.header={},this._header={},this.on("end",function(){var e=null,t=null;try{t=new h(n)}catch(t){return e=new Error("Parser is unable to parse the response"),e.parse=!0,e.original=t,e.rawResponse=n.xhr&&n.xhr.responseText?n.xhr.responseText:null,e.statusCode=n.xhr&&n.xhr.status?n.xhr.status:null,n.callback(e)}n.emit("response",t);var r;try{(t.status<200||t.status>=300)&&(r=new Error(t.statusText||"Unsuccessful HTTP response"),r.original=e,r.response=t,r.status=t.status)}catch(e){r=e}r?n.callback(r,t):n.callback(null,t)})}function d(e,t){var n=b("DELETE",e);return t&&n.end(t),n}var p;"undefined"!=typeof window?p=window:"undefined"!=typeof self?p=self:(console.warn("Using browser-only version of superagent in non-browser environment"),p=this);var g=n(44),y=n(45),v=n(46),b=e.exports=n(47).bind(null,f);b.getXHR=function(){if(!(!p.XMLHttpRequest||p.location&&"file:"==p.location.protocol&&p.ActiveXObject))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(e){}throw Error("Browser-only verison of superagent could not find XHR")};var _="".trim?function(e){return e.trim()}:function(e){return e.replace(/(^\s*|\s*$)/g,"")};b.serializeObject=i,b.parseString=s,b.types={html:"text/html",json:"application/json",xml:"application/xml",urlencoded:"application/x-www-form-urlencoded",form:"application/x-www-form-urlencoded","form-data":"application/x-www-form-urlencoded"},b.serialize={"application/x-www-form-urlencoded":i,"application/json":JSON.stringify},b.parse={"application/x-www-form-urlencoded":s,"application/json":JSON.parse},h.prototype.get=function(e){return this.header[e.toLowerCase()]},h.prototype._setHeaderProperties=function(e){var t=this.header["content-type"]||"";this.type=c(t);var n=l(t);for(var r in n)this[r]=n[r]},h.prototype._parseBody=function(e){var t=b.parse[this.type];return!t&&u(this.type)&&(t=b.parse["application/json"]),t&&e&&(e.length||e instanceof Object)?t(e):null},h.prototype._setStatusProperties=function(e){1223===e&&(e=204);var t=e/100|0;this.status=this.statusCode=e,this.statusType=t,this.info=1==t,this.ok=2==t,this.clientError=4==t,this.serverError=5==t,this.error=(4==t||5==t)&&this.toError(),this.accepted=202==e,this.noContent=204==e,this.badRequest=400==e,this.unauthorized=401==e,this.notAcceptable=406==e,this.notFound=404==e,this.forbidden=403==e},h.prototype.toError=function(){var e=this.req,t=e.method,n=e.url,r="cannot "+t+" "+n+" ("+this.status+")",i=new Error(r);return i.status=this.status,i.method=t,i.url=n,i},b.Response=h,g(f.prototype);for(var m in y)f.prototype[m]=y[m];f.prototype.type=function(e){return this.set("Content-Type",b.types[e]||e),this},f.prototype.responseType=function(e){return this._responseType=e,this},f.prototype.accept=function(e){return this.set("Accept",b.types[e]||e),this},f.prototype.auth=function(e,t,n){switch(n||(n={type:"basic"}),n.type){case"basic":var r=btoa(e+":"+t);this.set("Authorization","Basic "+r);break;case"auto":this.username=e,this.password=t}return this},f.prototype.query=function(e){return"string"!=typeof e&&(e=i(e)),e&&this._query.push(e),this},f.prototype.attach=function(e,t,n){return this._getFormData().append(e,t,n||t.name),this},f.prototype._getFormData=function(){return this._formData||(this._formData=new p.FormData),this._formData},f.prototype.callback=function(e,t){var n=this._callback;this.clearTimeout(),n(e,t)},f.prototype.crossDomainError=function(){var e=new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");e.crossDomain=!0,e.status=this.status,e.method=this.method,e.url=this.url,this.callback(e)},f.prototype._timeoutError=function(){var e=this._timeout,t=new Error("timeout of "+e+"ms exceeded");t.timeout=e,this.callback(t)},f.prototype._appendQueryString=function(){var e=this._query.join("&");e&&(this.url+=~this.url.indexOf("?")?"&"+e:"?"+e)},f.prototype.end=function(e){var t=this,n=this.xhr=b.getXHR(),i=this._timeout,o=this._formData||this._data;this._callback=e||r,n.onreadystatechange=function(){if(4==n.readyState){var e;try{e=n.status}catch(t){e=0}if(0==e){if(t.timedout)return t._timeoutError();if(t._aborted)return;return t.crossDomainError()}t.emit("end")}};var s=function(e,n){n.total>0&&(n.percent=n.loaded/n.total*100),n.direction=e,t.emit("progress",n)};if(this.hasListeners("progress"))try{n.onprogress=s.bind(null,"download"),n.upload&&(n.upload.onprogress=s.bind(null,"upload"))}catch(e){}if(i&&!this._timer&&(this._timer=setTimeout(function(){t.timedout=!0,t.abort()},i)),this._appendQueryString(),this.username&&this.password?n.open(this.method,this.url,!0,this.username,this.password):n.open(this.method,this.url,!0),this._withCredentials&&(n.withCredentials=!0),"GET"!=this.method&&"HEAD"!=this.method&&"string"!=typeof o&&!this._isHost(o)){var a=this._header["content-type"],c=this._serializer||b.serialize[a?a.split(";")[0]:""];!c&&u(a)&&(c=b.serialize["application/json"]),c&&(o=c(o))}for(var l in this.header)null!=this.header[l]&&n.setRequestHeader(l,this.header[l]);return this._responseType&&(n.responseType=this._responseType),this.emit("request",this),n.send(void 0!==o?o:null),this},b.Request=f,b.get=function(e,t,n){var r=b("GET",e);return"function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},b.head=function(e,t,n){var r=b("HEAD",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.options=function(e,t,n){var r=b("OPTIONS",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.del=d,b.delete=d,b.patch=function(e,t,n){var r=b("PATCH",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.post=function(e,t,n){var r=b("POST",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.put=function(e,t,n){var r=b("PUT",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}},function(e,t,n){function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+e]=this._callbacks["$"+e]||[]).push(t),this},r.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var n=this._callbacks["$"+e];if(!n)return this;if(1==arguments.length)return delete this._callbacks["$"+e],this;for(var r,i=0;i<n.length;i++)if((r=n[i])===t||r.fn===t){n.splice(i,1);break}return this},r.prototype.emit=function(e){this._callbacks=this._callbacks||{};var t=[].slice.call(arguments,1),n=this._callbacks["$"+e];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},r.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks["$"+e]||[]},r.prototype.hasListeners=function(e){return!!this.listeners(e).length}},function(e,t,n){var r=n(46);t.clearTimeout=function(){return this._timeout=0,clearTimeout(this._timer),this},t.parse=function(e){return this._parser=e,this},t.serialize=function(e){return this._serializer=e,this},t.timeout=function(e){return this._timeout=e,this},t.then=function(e,t){if(!this._fullfilledPromise){var n=this;this._fullfilledPromise=new Promise(function(e,t){n.end(function(n,r){n?t(n):e(r)})})}return this._fullfilledPromise.then(e,t)},t.catch=function(e){return this.then(void 0,e)},t.use=function(e){return e(this),this},t.get=function(e){return this._header[e.toLowerCase()]},t.getHeader=t.get,t.set=function(e,t){if(r(e)){for(var n in e)this.set(n,e[n]);return this}return this._header[e.toLowerCase()]=t,this.header[e]=t,this},t.unset=function(e){return delete this._header[e.toLowerCase()],delete this.header[e],this},t.field=function(e,t){if(null===e||void 0===e)throw new Error(".field(name, val) name can not be empty");if(r(e)){for(var n in e)this.field(n,e[n]);return this}if(null===t||void 0===t)throw new Error(".field(name, val) val can not be empty");return this._getFormData().append(e,t),this},t.abort=function(){return this._aborted?this:(this._aborted=!0,this.xhr&&this.xhr.abort(),this.req&&this.req.abort(),this.clearTimeout(),this.emit("abort"),this)},t.withCredentials=function(){return this._withCredentials=!0,this},t.redirects=function(e){return this._maxRedirects=e,this},t.toJSON=function(){return{method:this.method,url:this.url,data:this._data,headers:this._header}},t._isHost=function(e){switch({}.toString.call(e)){case"[object File]":case"[object Blob]":case"[object FormData]":return!0;default:return!1}},t.send=function(e){var t=r(e),n=this._header["content-type"];if(t&&r(this._data))for(var i in e)this._data[i]=e[i];else"string"==typeof e?(n||this.type("form"),n=this._header["content-type"],this._data="application/x-www-form-urlencoded"==n?this._data?this._data+"&"+e:e:(this._data||"")+e):this._data=e;return!t||this._isHost(e)?this:(n||this.type("json"),this)}},function(e,t){function n(e){return null!==e&&"object"==typeof e}e.exports=n},function(e,t){function n(e,t,n){return"function"==typeof n?new e("GET",t).end(n):2==arguments.length?new e("GET",t):new e(t,n)}e.exports=n}])});
},{}],58:[function(require,module,exports){
// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const PubNub = require('pubnub');

// allows asynchronous execution flow.
const waterfall = require('async/waterfall');

// required to make AJAX calls for auth
const axios = require('axios');

/**
Global object used to create an instance of {@link ChatEngine}.

@alias ChatEngineCore
@param pnConfig {Object} ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See the getting started tutorial and [the PubNub docs](https://www.pubnub.com/docs/java-se-java/api-reference-configuration).
@param ceConfig {Object} A list of chat engine specific config options.
@param [ceConfig.globalChannel=chat-engine] {String} The root channel. See {@link ChatEngine.global}
@param [ceConfig.authUrl] {String} The root URL used to manage permissions for private channels. Omitting this forces insecure mode.
@param [ceConfig.throwErrors=true] {Boolean} Throws errors in JS console.
@param [ceConfig.insecure=true] {Boolean} Force into insecure mode. Will ignore authUrl and all Chats will be public.
@return {ChatEngine} Returns an instance of {@link ChatEngine}
@example
ChatEngine = ChatEngineCore.create({
    publishKey: 'demo',
    subscribeKey: 'demo'
}, {
    authUrl: 'http://localhost/auth',
    globalChannel: 'chat-engine-global-channel'
});
*/
const create = function(pnConfig, ceConfig = {}) {

    let ChatEngine = false;

    if(ceConfig.globalChannel) {
        ceConfig.globalChannel = ceConfig.globalChannel.toString()
    } else {
        ceConfig.globalChannel = 'chat-engine';
    }

    if(typeof ceConfig.throwErrors == "undefined") {
        ceConfig.throwErrors = true;
    }

    ceConfig.insecure = ceConfig.insecure || false;
    if(!ceConfig.authUrl) {
        console.info('ChatEngine is running in insecure mode. Supply a authUrl to run in secure mode.');
        ceConfig.insecure = true;
    }

    const throwError = function(self, cb, key, ceError, payload = {}) {

        if(ceConfig.throwErrors) {
            // throw ceError;
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    }

    /**
    * The {@link ChatEngine} object is a RootEmitter. Configures an event emitter that other ChatEngine objects inherit. Adds shortcut methods for
    * ```this.on()```, ```this.emit()```, etc.
    */
    class RootEmitter {

        constructor() {

            /**
            * @private
            */
            this.events = {};

            /**
            Create a new EventEmitter2 object for this class.

            @private
            */
            this.emitter = new EventEmitter2({
              wildcard: true,
              newListener: true,
              maxListeners: 50,
              verboseMemoryLeak: true
            });

            // we bind to make sure wildcards work
            // https://github.com/asyncly/EventEmitter2/issues/186

            /**
            Private emit method that broadcasts the event to listeners on this page.

            @private
            @param {String} event The event name
            @param {Object} the event payload
            */
            this._emit = this.emitter.emit.bind(this.emitter);

            /**
            Listen for a specific event and fire a callback when it's emitted. This is reserved in case ```this.on``` is overwritten.

            @private
            @param {String} event The event name
            @param {Function} callback The function to run when the event is emitted
            */

            this._on = this.emitter.on.bind(this.emitter);

            /**
            * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
            * @method
            * @param {String} event The event name
            * @param {Function} cb The function to run when the event is emitted
            * @example
            *
            * // Get notified whenever someone joins the room
            * object.on('event', (payload) => {
            *     console.log('event was fired').
            * })
            *
            * // Get notified of event.a and event.b
            * object.on('event.*', (payload) => {
            *     console.log('event.a or event.b was fired').;
            * })
            */
            this.on = this.emitter.on.bind(this.emitter);

            /**
            * Stop a callback from listening to an event.
            * @method
            * @param {String} event The event name
            * @example
            * let callback = function(payload;) {
            *    console.log('something happend!');
            * };
            * object.on('event', callback);
            * // ...
            * object.off('event', callback);
            */
            this.off = this.emitter.off.bind(this.emitter);

            /**
            * Listen for any event on this object and fire a callback when it's emitted
            * @method
            * @param {Function} callback The function to run when any event is emitted. First parameter is the event name and second is the payload.
            * @example
            * object.onAny((event, payload) => {
            *     console.log('All events trigger this.');
            * });
            */
            this.onAny = this.emitter.onAny.bind(this.emitter);

            /**
            * Listen for an event and only fire the callback a single time
            * @method
            * @param {String} event The event name
            * @param {Function} callback The function to run once
            * @example
            * object.once('message', => (event, payload) {
            *     console.log('This is only fired once!');
            * });
            */
            this.once = this.emitter.once.bind(this.emitter);

        }

    }

    /**
    Represents an event that may be emitted or subscribed to.
    */
    class Event {

        constructor(chat, event) {

            /**
            Events are always a property of a {@link Chat}. Responsible for
            listening to specific events and firing events when they occur.
            @readonly
            @type String
            @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
            */
            this.channel = chat.channel;

            /**
            Publishes the event over the PubNub network to the {@link Event} channel

            @private
            @param {Object} data The event payload object
            */
            this.publish = (m) => {

                m.event = event;

                ChatEngine.pubnub.publish({
                    message: m,
                    channel: this.channel
                }, (status, response) => {

                    if(status.statusCode == 200) {
                        chat.trigger('$.publish.success');
                    } else {

                        /**
                        * There was a problem publishing over the PubNub network.
                        * @event Chat#$"."error"."publish
                        */
                        throwError(chat, 'trigger', 'publish', new Error('There was a problem publishing over the PubNub network.'), {
                            errorText: status.errorData.response.text,
                            error: status.errorData,
                        });

                    }

                });

            }

            /**
            Forwards events to the Chat that registered the event {@link Chat}

            @private
            @param {Object} data The event payload object
            */
            this.onMessage = (m) => {

                if(this.channel == m.channel && m.message.event == event) {
                    chat.trigger(m.message.event, m.message);
                }

            }

            // call onMessage when PubNub receives an event
            ChatEngine.pubnub.addListener({
                message: this.onMessage
            });

        }

    }

    /**
    An ChatEngine generic emitter that supports plugins and forwards
    events to the root emitter.
    @extends RootEmitter
    */
    class Emitter extends RootEmitter {

        constructor() {

            super();

            /**
            Emit events locally.

            @private
            @param {String} event The event payload object
            */
            this._emit = (event, data) => {

                // all events are forwarded to ChatEngine object
                // so you can globally bind to events with ChatEngine.on()
                ChatEngine._emit(event, data);

                // emit the event from the object that created it
                this.emitter.emit(event, data);

            }

            /**
            * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
            * @method
            * @param {String} event The event name
            * @param {Function} cb The function to run when the event is emitted
            * @example
            *
            * // Get notified whenever someone joins the room
            * object.on('event', (payload) => {
            *     console.log('event was fired').
            * })
            *
            * // Get notified of event.a and event.b
            * object.on('event.*', (payload) => {
            *     console.log('event.a or event.b was fired').;
            * })
            */
            this.on = (event, cb) => {

                // keep track of all events on this emitter
                this.events[event] = this.events[event] || new Event(this, event);

                // call the private _on property
                this._on(event, cb);

            };

            /**
            Stores a list of plugins bound to this object
            @private
            */
            this.plugins = [];

            /**
            Binds a plugin to this object
            @param {Object} module The plugin module
            */
            this.plugin = function(module) {

                // add this plugin to a list of plugins for this object
                this.plugins.push(module);

                // returns the name of this class
                let className = this.constructor.name;

                // see if there are plugins to attach to this class
                if(module.extends && module.extends[className]) {

                    // attach the plugins to this class
                    // under their namespace
                    ChatEngine.addChild(this, module.namespace,
                        new module.extends[className]);

                    this[module.namespace].ChatEngine = ChatEngine;

                    // if the plugin has a special construct function
                    // run it
                    if(this[module.namespace].construct) {
                        this[module.namespace].construct();
                    }

                }


            }

        }

    }

    /**
    This is the root {@link Chat} class that represents a chat room

    @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
    @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
    @param {Boolean} [needGrant=true] This Chat has restricted permissions and we need to authenticate ourselves in order to connect.
    @extends Emitter
    @fires Chat#$"."ready
    @fires Chat#$"."state
    @fires Chat#$"."online
    @fires Chat#$"."offline
    */
    class Chat extends Emitter {

        constructor(channel = new Date().getTime(), needGrant = true, autoConnect = true, group = 'default') {

            super();

            if(ceConfig.insecure) {
                needGrant = false;
            }

            /**
            * A string identifier for the Chat room.
            * @type String
            * @readonly
            * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
            */
            this.channel = channel.toString();

            let chanPrivString = 'public.';
            if(needGrant) {
                chanPrivString = 'private.';
            }

            if(this.channel.indexOf(ceConfig.globalChannel) == -1) {
                this.channel = [ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
            }

            this.isPrivate = needGrant;

            this.group = group;

            /**
            A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
            Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes

            @type Object
            @readonly
            */
            this.users = {};

            /**
            A map of {@link Event} bound to this {@link Chat}

            @private
            @type Object
            @readonly
            */
            this.events = {}

            /**
            Updates list of {@link User}s in this {@link Chat}
            based on who is online now.

            @private
            @param {Object} status The response status
            @param {Object} response The response payload object
            */
            this.onHereNow = (status, response) => {

                if(status.error) {

                    /**
                    * There was a problem fetching the presence of this chat
                    * @event Chat#$"."error"."presence
                    */
                    throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'), {
                        error: status.errorData,
                        errorText: status.errorData.response.text
                    });

                } else {

                    // get the list of occupants in this channel
                    let occupants = response.channels[this.channel].occupants;

                    // format the userList for rltm.js standard
                    for(let i in occupants) {
                        this.userUpdate(occupants[i].uuid, occupants[i].state);
                    }

                }

            };

            /**
            * Get messages that have been published to the network before this client was connected.
            * Events are published with the ```$history``` prefix. So for example, if you had the event ```message```,
            * you would call ```Chat.history('message')``` and subscribe to history events via ```chat.on('$history.message', (data) => {})```.
            *
            * @param {String} event The name of the event we're getting history for
            * @param {Object} [config] The PubNub history config for this call
            * @tutorial history
            */
            this.history = (event, config = {}) => {

                // create the event if it does not exist
                this.events[event] = this.events[event] || new Event(this, event);

                // set the PubNub configured channel to this channel
                config.channel = this.events[event].channel;

                // run the PubNub history method for this event
                ChatEngine.pubnub.history(config, (status, response) => {

                    if(status.error) {

                        /**
                        * There was a problem fetching the history of this chat
                        * @event Chat#$"."error"."history
                        */
                        throwError(this, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), {
                            errorText: status.errorData.response.text,
                            error: status.error,
                        });

                    } else {

                        response.messages.forEach((message) => {

                            if(message.entry.event == event) {

                                /**
                                * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                                * ```$.history.``` to distinguish it from the original live events.
                                * @event Chat#$"."history"."*
                                * @tutorial history
                                */
                                this.trigger(
                                    ['$', 'history', event].join('.'),
                                    message.entry);

                            }

                        });

                    }

                });

            }

            this.objectify = () => {

                return {
                    channel: this.channel,
                    group: this.group,
                    private: this.isPrivate
                }

            }

            /**
            * Invite a user to this Chat. Authorizes the invited user in the Chat and sends them an invite via {@link User#direct}.
            * @param {User} user The {@link User} to invite to this chatroom.
            * @fires Me#event:$"."invite
            * @example
            * // one user running ChatEngine
            * let secretChat = new ChatEngine.Chat('secret-channel');
            * secretChat.invite(someoneElse);
            *
            * // someoneElse in another instance of ChatEngine
            * me.direct.on('$.invite', (payload) => {
            *     let secretChat = new ChatEngine.Chat(payload.data.channel);
            * });
            */
            this.invite = (user) => {

                let complete = () => {

                    let send = () => {

                        /**
                        * Notifies {@link Me} that they've been invited to a new private {@link Chat}.
                        * Fired by the {@link Chat#invite} method.
                        * @event Me#$"."invite
                        * @tutorial private
                        * @example
                        * me.direct.on('$.invite', (payload) => {
                        *    let privChat = new ChatEngine.Chat(payload.data.channel));
                        * });
                        */
                        user.direct.emit('$.invite', {
                            channel: this.channel
                        });

                    }

                    if(!user.direct.connected) {
                        user.direct.connect();
                        user.direct.on('$.connected', send);
                    } else {
                        send();
                    }

                }

                if(ceConfig.insecure) {
                    complete();
                } else {

                    axios.post(ceConfig.authUrl + '/chat/invite', {
                        authKey: pnConfig.authKey,
                        uuid: user.uuid,
                        myUUID: ChatEngine.me.uuid,
                        authData: ChatEngine.me.authData,
                        chat: this.objectify()
                    })
                    .then((response) => {
                        complete();
                    })
                    .catch((error) => {

                        throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });

                    });
                }

            };

            /**
            Keep track of {@link User}s in the room by subscribing to PubNub presence events.

            @private
            @param {Object} data The PubNub presence response for this event
            */
            this.onPresence = (presenceEvent) => {

                // make sure channel matches this channel
                if(this.channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Fired when a {@link User} has joined the room.
                        *
                        * @event Chat#$"."online"."join
                        * @param {Object} data The payload returned by the event
                        * @param {User} data.user The {@link User} that came online
                        * @example
                        * chat.on('$.join', (data) => {
                        *     console.log('User has joined the room!', data.user);
                        * });
                        */
                        this.trigger('$.online.join', {
                            user: user
                        });

                    }

                    // someone leaves channel
                    if(presenceEvent.action == "leave") {
                        this.userLeave(presenceEvent.uuid);
                    }

                    // someone timesout
                    if(presenceEvent.action == "timeout") {
                        this.userDisconnect(presenceEvent.uuid);
                    }

                    // someone's state is updated
                    if(presenceEvent.action == "state-change") {
                        this.userUpdate(presenceEvent.uuid, presenceEvent.state);
                    }

                }

            };

            /**
             * Boolean value that indicates of the Chat is connected to the network
             * @type {Boolean}
             */
            this.connected = false;

            /**
             * @private
             */
            this.onPrep = () => {

                if(!this.connected) {

                    if(!ChatEngine.pubnub) {
                        throwError(this, 'trigger', 'setup', new Error('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.'));
                    }

                    // listen to all PubNub events for this Chat
                    ChatEngine.pubnub.addListener({
                        message: this.onMessage,
                        presence: this.onPresence
                    });

                    // subscribe to the PubNub channel for this Chat
                    ChatEngine.pubnub.subscribe({
                        channels: [this.channel],
                        withPresence: true
                    });

                }

            }

            /**
             * @private
             */
            this.grant = () => {

                let createChat = () => {

                    axios.post(ceConfig.authUrl + '/chats', {
                        globalChannel: ceConfig.globalChannel,
                        authKey: pnConfig.authKey,
                        uuid: pnConfig.uuid,
                        authData: ChatEngine.me.authData,
                        chat: this.objectify()
                    })
                    .then((response) => {
                        this.onPrep();
                    })
                    .catch((error) => {

                        throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });

                    });

                }

                if(ceConfig.insecure) {
                    return createChat();
                } else {

                    axios.post(ceConfig.authUrl + '/chat/grant', {
                        globalChannel: ceConfig.globalChannel,
                        authKey: pnConfig.authKey,
                        uuid: pnConfig.uuid,
                        authData: ChatEngine.me.authData,
                        chat: this.objectify()
                    })
                    .then((response) => {
                        createChat();
                    })
                    .catch((error) => {

                        throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });

                    });

                }

            }

            /**
            * Connect to PubNub servers to initialize the chat.
            * @example
            * // create a new chatroom, but don't connect to it automatically
            * let chat = new Chat('some-chat', false)
            *
            * // connect to the chat when we feel like it
            * chat.connect();
            */
            this.connect = () => {
                this.grant();
            };

            if(autoConnect) {
                this.grant();
            }

            ChatEngine.chats[this.channel] = this;

        }

        /**
        * Send events to other clients in this {@link User}.
        * Events are trigger over the network  and all events are made
        * on behalf of {@link Me}
        *
        * @param {String} event The event name
        * @param {Object} data The event payload object
        * @example
        * chat.emit('custom-event', {value: true});
        * chat.on('custom-event', (payload) => {
        *     console.log(payload.sender.uuid, 'emitted the value', payload.data.value);
        * });
        */
        emit(event, data) {

            // create a standardized payload object
            let payload = {
                data: data,            // the data supplied from params
                sender: ChatEngine.me.uuid,   // my own uuid
                chat: this,            // an instance of this chat
            };

            // run the plugin queue to modify the event
            this.runPluginQueue('emit', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // remove chat otherwise it would be serialized
                // instead, it's rebuilt on the other end.
                // see this.trigger
                delete payload.chat;

                // publish the event and data over the configured channel

                // ensure the event exists within the global space
                this.events[event] = this.events[event] || new Event(this, event);

                this.events[event].publish(payload);

            });

        }

        /**
        Broadcasts an event locally to all listeners.

        @private
        @param {String} event The event name
        @param {Object} payload The event payload object
        */

        trigger(event, payload) {

            let complete = () => {

                // let plugins modify the event
                this.runPluginQueue('on', event, (next) => {
                    next(null, payload);
                }, (err, payload) => {

                    // emit this event to any listener
                    this._emit(event, payload);

                });

            }

            // this can be made into plugin
            if(typeof payload == "object") {

                // restore chat in payload
                if(!payload.chat) {
                    payload.chat = this;
                }

                // turn a uuid found in payload.sender to a real user
                if(payload.sender) {

                    if(ChatEngine.users[payload.sender]) {
                        payload.sender = ChatEngine.users[payload.sender];
                        complete();
                    } else {

                        payload.sender = new User(payload.sender);

                        payload.sender._getState(this, () => {
                            console.log('state not set', payload.sender.state);
                            complete();
                        });

                    }

                } else {
                    complete();
                }

            } else {
                complete();
            }

        }

        /**
        Add a user to the {@link Chat}, creating it if it doesn't already exist.

        @private
        @param {String} uuid The user uuid
        @param {Object} state The user initial state
        @param {Boolean} trigger Force a trigger that this user is online
        */
        createUser(uuid, state) {

            // Ensure that this user exists in the global list
            // so we can reference it from here out
            ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            ChatEngine.users[uuid].addChat(this, state);

            // trigger the join event over this chatroom
            if(!this.users[uuid]) {

                /**
                * Broadcast that a {@link User} has come online. This is when
                * the framework firsts learn of a user. This can be triggered
                * by, ```$.join```, or other network events that
                * notify the framework of a new user.
                *
                * @event Chat#$"."online"."here
                * @param {Object} data The payload returned by the event
                * @param {User} data.user The {@link User} that came online
                * @example
                * chat.on('$.online.here', (data) => {
                *     console.log('User has come online:', data.user);
                * });
                */
                this.trigger('$.online.here', {
                    user: ChatEngine.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = ChatEngine.users[uuid];

            // return the instance of this user
            return ChatEngine.users[uuid];

        }

        /**
        * Update a user's state within this {@link Chat}.
        * @private
        * @param {String} uuid The {@link User} uuid
        * @param {Object} state State to update for the user
        */
        userUpdate(uuid, state) {

            // ensure the user exists within the global space
            ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

            // if we don't know about this user
            if(!this.users[uuid]) {
                // do the whole join thing
                this.createUser(uuid, state);
            }

            // update this user's state in this chatroom
            this.users[uuid].assign(state, this);

            /**
            * Broadcast that a {@link User} has changed state.
            * @event Chat#$"."state
            * @param {Object} data The payload returned by the event
            * @param {User} data.user The {@link User} that changed state
            * @param {Object} data.state The new user state for this ```Chat```
            * @example
            * chat.on('$.state', (data) => {
            *     console.log('User has changed state:', data.user, 'new state:', data.state);
            * });
            */
            this.trigger('$.state', {
                user: this.users[uuid],
                state: this.users[uuid].state
            });

        }

        /**
        * Leave from the {@link Chat} on behalf of {@link Me}.
        * @example
        * chat.leave();
        */
        leave() {

            ChatEngine.pubnub.unsubscribe({
                channels: [this.channel]
            });

            axios.delete(ceConfig.authUrl + '/chats', {
                data: {
                globalChannel: ceConfig.globalChannel,
                authKey: pnConfig.authKey,
                uuid: pnConfig.uuid,
                authData: ChatEngine.me.authData,
                chat: this.objectify()
            }})
            .then((response) => {

            })
            .catch((error) => {

                throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to chat server.'), {
                    error: error
                });

            });

        }

        /**
        Perform updates when a user has left the {@link Chat}.

        @private
        */
        userLeave(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                // if a user leaves, trigger the event

                /**
                * Fired when a {@link User} intentionally leaves a {@link Chat}.
                *
                * @event Chat#$"."offline"."leave
                * @param {Object} data The data payload from the event
                * @param {User} user The {@link User} that has left the room
                * @example
                * chat.on('$.offline.leave', (data) => {
                *     console.log('User left the room manually:', data.user);
                * });
                */
                this.trigger('$.offline.leave', {
                    user: this.users[uuid]
                });

                // remove the user from the local list of users
                delete this.users[uuid];

                // we don't remove the user from the global list,
                // because they may be online in other channels

            } else {

                // that user isn't in the user list
                // we never knew about this user or they already left

                // console.log('user already left');
            }
        }

        /**
        Fired when a user disconnects from the {@link Chat}

        @private
        @param {String} uuid The uuid of the {@link Chat} that left
        */
        userDisconnect(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                /**
                * Fired specifically when a {@link User} looses network connection
                * to the {@link Chat} involuntarily.
                *
                * @event Chat#$"."offline"."disconnect
                * @param {Object} data The {@link User} that disconnected
                * @param {Object} data.user The {@link User} that disconnected
                * @example
                * chat.on('$.offline.disconnect', (data) => {
                *     console.log('User disconnected from the network:', data.user);
                * });
                */

                this.trigger('$.offline.disconnect', {
                    user: this.users[uuid]
                });

            }

        }

        /**
        Load plugins and attach a queue of functions to execute before and
        after events are trigger or received.

        @private
        @param {String} location Where in the middleeware the event should run (emit, trigger)
        @param {String} event The event name
        @param {String} first The first function to run before the plugins have run
        @param {String} last The last function to run after the plugins have run
        */
        runPluginQueue(location, event, first, last) {

            // this assembles a queue of functions to run as middleware
            // event is a triggered event key
            let plugin_queue = [];

            // the first function is always required
            plugin_queue.push(first);

            // look through the configured plugins
            for(let i in this.plugins) {

                // if they have defined a function to run specifically
                // for this event
                if(this.plugins[i].middleware
                    && this.plugins[i].middleware[location]
                    && this.plugins[i].middleware[location][event]) {

                    // add the function to the queue
                    plugin_queue.push(
                        this.plugins[i].middleware[location][event]);
                }

            }

            // waterfall runs the functions in assigned order
            // waiting for one to complete before moving to the next
            // when it's done, the ```last``` parameter is called
            waterfall(plugin_queue, last);

        }

        /**
        Set the state for {@link Me} within this {@link User}.
        Broadcasts the ```$.state``` event on other clients

        @private
        @param {Object} state The new state {@link Me} will have within this {@link User}
        */
        setState(state) {

            ChatEngine.pubnub.setState(
                {
                    state: state,
                    channels: [ChatEngine.global.channel]
                },
                (status, response) => {
                    // handle status, response
                }
            );

        }

        onConnectionReady() {

            /**
            * Broadcast that the {@link Chat} is connected to the network.
            * @event Chat#$"."connected
            * @example
            * chat.on('$.connected', () => {
            *     console.log('chat is ready to go!');
            * });
            */
            this.connected = true;

            // get a list of users online now
            // ask PubNub for information about connected users in this channel
            ChatEngine.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, (status, response) => {
                this.onHereNow(status, response)
                this.trigger('$.connected');
            });

        }

    };

    /**
    This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
    If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
    @class
    @extends Emitter
    @param uuid
    @param state
    @param chat
    */
    class User extends Emitter {

        constructor(uuid, state = {}, chat = ChatEngine.global) {

            super();

            /**
            The User's unique identifier, usually a device uuid. This helps ChatEngine identify the user between events. This is public id exposed to the network.
            Check out [the wikipedia page on UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier).

            @readonly
            @type String
            */
            this.uuid = uuid;

            /**
            * Gets the user state in a {@link Chat}. See {@link Me#update} for how to assign state values.
            * @param {Chat} chat Chatroom to retrieve state from
            * @return {Object} Returns a generic JSON object containing state information.
            * @example
            *
            * // Global State
            * let globalState = user.state();
            *
            * // State in some channel
            * let someChat = new ChatEngine.Chat('some-channel');
            * let someChatState = user.state(someChat);s
            */
            this.state = {};

            /**
            * An object containing the Chats this {@link User} is currently in. The key of each item in the object is the {@link Chat.channel} and the value is the {@link Chat} object. Note that for privacy, this map will only contain {@link Chat}s that the client ({@link Me}) is also connected to.
            *
            * @readonly
            * @type Object
            * @example
            *{
            *    "globalChannel": {
            *        channel: "globalChannel",
            *        users: {
            *            //...
            *        },
            *    },
            *    // ...
            * }
            */
            this.chats = {};

            /**
            * Feed is a Chat that only streams things a User does, like
            * 'startTyping' or 'idle' events for example. Anybody can subscribe
            * to a User's feed, but only the User can publish to it. Users will
            * not be able to converse in this channel.
            *
            * @type Chat
            * @example
            * // me
            * me.feed.emit('update', 'I may be away from my computer right now');
            *
            * // another instance
            * them.feed.connect();
            * them.feed.on('update', (payload) => {})
            */

            // grants for these chats are done on auth. Even though they're marked private, they are locked down via the server
            this.feed = new Chat(
                [ChatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name == "Me", 'feed');

            /**
            * Direct is a private channel that anybody can publish to but only
            * the user can subscribe to. Great for pushing notifications or
            * inviting to other chats. Users will not be able to communicate
            * with one another inside of this chat. Check out the
            * {@link Chat#invite} method for private chats utilizing
            * {@link User#direct}.
            *
            * @type Chat
            * @example
            * // me
            * me.direct.on('private-message', (payload) -> {
            *     console.log(payload.sender.uuid, 'sent your a direct message');
            * });
            *
            * // another instance
            * them.direct.connect();
            * them.direct.emit('private-message', {secret: 42});
            */
            this.direct = new Chat(
                [ChatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name == "Me", 'direct');

            // if the user does not exist at all and we get enough
            // information to build the user
            if(!ChatEngine.users[uuid]) {
                ChatEngine.users[uuid] = this;
            }

            // update this user's state in it's created context
            this.assign(state, chat)

        }

        /**
        * @private
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state) {
            let oldState = this.state || {};
            this.state = Object.assign(oldState, state);
        }

        /**
        this is only called from network updates

        @private
        */
        assign(state, chat) {
            chat = ChatEngine.global;
            this.update(state, chat);
        }

        /**
        adds a chat to this user

        @private
        */
        addChat(chat, state) {

            // store the chat in this user object
            this.chats[chat.channel] = chat;

            // updates the user's state in that chatroom
            this.assign(state, chat);
        }

        _getState(chat, callback) {

            axios.get('https://pubsub.pubnub.com/v1/blocks/sub-key/'+pnConfig.subscribeKey+'/state?globalChannel=' + ceConfig.globalChannel + '&uuid=' + this.uuid)
            .then((response) => {
                this.assign(response.data)
                callback();
            })
            .catch((error) => {

                throwError(chat, 'trigger', 'getState', new Error('There was a problem getting state from the PubNub network.'));

            });

        }

    }

    /**
    Represents the client connection as a special {@link User} with write permissions.
    Has the ability to update it's state on the network. An instance of
    {@link Me} is returned by the ```ChatEngine.connect()```
    method.

    @class Me
    @param {String} uuid The uuid of this user
    @extends User
    */
    class Me extends User {

        constructor(uuid, authData) {

            // call the User constructor
            super(uuid);

            this.authData = authData;

            this.direct.on('$.server.chat.created', (payload) => {
                ChatEngine.addChatToSession(payload.chat);
            });


            this.direct.on('$.server.chat.deleted', (payload) => {
                ChatEngine.removeChatFromSession(payload.chat);
            });

        }

        // assign updates from network
        assign(state, chat) {
            // we call "update" because calling "super.assign"
            // will direct back to "this.update" which creates
            // a loop of network updates
            super.update(state, chat);

        }

        /**
        * Update {@link Me}'s state in a {@link Chat}. All {@link User}s in
        * the {@link Chat} will be notified of this change via ($.update)[Chat.html#event:$%2522.%2522state].
        * Retrieve state at any time with {@link User#state}.
        * @param {Object} state The new state for {@link Me}
        * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
        * Defaults to ```ChatEngine.global```.
        * @fires Chat#event:$"."state
        * @example
        * // update global state
        * me.update({value: true});
        *
        * // update state in specific chat
        * let chat = new ChatEngine.Chat('some-chat');
        * me.update({value: true}, chat);
        */
        update(state, chat = ChatEngine.global) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel

            ChatEngine.global.setState(state);

        }

    }

    /**
    Provides the base Widget class...

    @class ChatEngine
    @extends RootEmitter
     */
    const init = function() {

        // Create the root ChatEngine object
        ChatEngine = new RootEmitter;

        /**
        * A map of all known {@link User}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.users = {};

        /**
        * A map of all known {@link Chat}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.chats = {};

        /**
        * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
        * @member {Chat} global
        * @memberof ChatEngine
        */
        ChatEngine.global = false;

        /**
        * This instance of ChatEngine represented as a special {@link User} know as {@link Me}
        * @member {Me} me
        * @memberof ChatEngine
        */
        ChatEngine.me = false;

        /**
        * An instance of PubNub, the networking infrastructure that powers the realtime communication between {@link User}s in {@link Chats}.
        * @member {Object} pubnub
        * @memberof ChatEngine
        */
        ChatEngine.pubnub = false;

        /**
        * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event
        * @member {Object} ready
        * @memberof ChatEngine
        */
        ChatEngine.ready = false;

        ChatEngine.session = {};

        ChatEngine.addChatToSession = function(chat) {

            ChatEngine.session[chat.group] = ChatEngine.session[chat.group] || {};

            let existingChat = ChatEngine.chats[chat.channel];

            if(existingChat) {

                ChatEngine.session[chat.group][chat.channel] = existingChat;

            } else {

                ChatEngine.session[chat.group][chat.channel] = new Chat(chat.channel, chat.private, false, chat.group);

                ChatEngine._emit('$.session.chat.join', {
                    chat: ChatEngine.session[chat.group][chat.channel]
                });

            }

        }

        ChatEngine.removeChatFromSession = function(chat) {

            let targetChat = ChatEngine.session[chat.group][chat.channel] || chat;

            ChatEngine._emit('$.session.chat.leave', {
                chat: targetChat
            });

            // don't delete from chatengine.chats, because we can still get events from this chat
            delete ChatEngine.chats[chat.channel];
            delete ChatEngine.session[chat.group][chat.channel];

        }

        /**
        * Connect to realtime service and create instance of {@link Me}
        * @method ChatEngine#connect
        * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc.
        * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
        * * @param {Strung} authKey A authentication secret. Will be sent to authentication backend for validation. This is usually an access token or password. This is different from UUID as a user can have a single UUID but multiple auth keys.
        * @param {Object} [authData] Additional data to send to the authentication endpoint. Not used by ChatEngine SDK.
        * @fires $"."connected
        */
        ChatEngine.connect = function(uuid, state = {}, authKey = false, authData) {

            // this creates a user known as Me and
            // connects to the global chatroom

            pnConfig.uuid = uuid;

            let complete = (chatData) => {

                ChatEngine.pubnub = new PubNub(pnConfig);

                // create a new chat to use as global chat
                // we don't do auth on this one becauseit's assumed to be done with the /auth request below
                ChatEngine.global = new Chat(ceConfig.globalChannel, false, true, 'global');

                // create a new user that represents this client
                ChatEngine.me = new Me(pnConfig.uuid, authData);

                // create a new instance of Me using input parameters
                ChatEngine.global.createUser(pnConfig.uuid, state);

                ChatEngine.me.update(state);


                /**
                 * Fired when ChatEngine is connected to the internet and ready to go!
                 * @event ChatEngine#$"."ready
                 */
                ChatEngine.global.on('$.connected', () => {

                    ChatEngine._emit('$.ready', {
                        me: ChatEngine.me
                    });

                    ChatEngine.ready = true;

                    for(let key in chatData) {
                        ChatEngine.addChatToSession(chatData[key]);
                    }

                });

                // chats.session =

                /**
                Fires when PubNub network connection changes

                @private
                @param {Object} statusEvent The response status
                */
                ChatEngine.pubnub.addListener({
                    status: (statusEvent) => {

                        /**
                        * SDK detected that network is online.
                        * @event ChatEngine#$"."network"."up"."online
                        */

                        /**
                        * SDK detected that network is down.
                        * @event ChatEngine#$"."network"."down"."offline
                        */

                        /**
                        * A subscribe event experienced an exception when running.
                        * @event ChatEngine#$"."network"."down"."issue
                        */

                        /**
                        * SDK was able to reconnect to pubnub.
                        * @event ChatEngine#$"."network"."up"."reconnected
                        */

                        /**
                        * SDK subscribed with a new mix of channels.
                        * @event ChatEngine#$"."network"."up"."connected
                        */

                        /**
                        * JSON parsing crashed.
                        * @event ChatEngine#$"."network"."down"."malformed
                        */

                        /**
                        * Server rejected the request.
                        * @event ChatEngine#$"."network"."down"."badrequest
                        */

                        /**
                        * If using decryption strategies and the decryption fails.
                        * @event ChatEngine#$"."network"."down"."decryption
                        */

                        /**
                        * Request timed out.
                        * @event ChatEngine#$"."network"."down"."timeout
                        */

                        /**
                        * PAM permission failure.
                        * @event ChatEngine#$"."network"."down"."denied
                        */

                        // map the pubnub events into chat engine events
                        let categories = {
                            'PNNetworkUpCategory': 'up.online',
                            'PNNetworkDownCategory': 'down.offline',
                            'PNNetworkIssuesCategory': 'down.issue',
                            'PNReconnectedCategory': 'up.reconnected',
                            'PNConnectedCategory': 'up.connected',
                            'PNAccessDeniedCategory': 'down.denied',
                            'PNMalformedResponseCategory': 'down.malformed',
                            'PNBadRequestCategory': 'down.badrequest',
                            'PNDecryptionErrorCategory': 'down.decryption',
                            'PNTimeoutCategory': 'down.timeout'
                        };

                        let eventName = ['$', 'network', categories[statusEvent.category] || 'other'].join('.');

                        if(statusEvent.affectedChannels) {

                            statusEvent.affectedChannels.forEach((channel) => {

                                let chat = ChatEngine.chats[channel];

                                if(chat) {

                                    // connected category tells us the chat is ready
                                    if (statusEvent.category === "PNConnectedCategory") {
                                        chat.onConnectionReady();
                                    }

                                    // trigger the network events
                                    chat.trigger(eventName, statusEvent);


                                } else {

                                    ChatEngine._emit(eventName, statusEvent);

                                }

                            });

                        } else {

                            ChatEngine._emit(eventName, statusEvent);

                        }

                    }
                });


            }

            let getChats = function() {

                axios.get(ceConfig.authUrl + '/chats?uuid=' + pnConfig.uuid)
                .then((response) => {
                    complete(response.data);
                })
                .catch((error) => {

                    /**
                    * There was a problem logging in
                    * @event ChatEngine#$"."error"."auth
                    */
                    throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server ('+ceConfig.authUrl+').'), {
                        error: error
                    });

                });

            }

            if(ceConfig.insecure) {
                getChats();
            } else {

                pnConfig.authKey = authKey;

                axios.post(ceConfig.authUrl + '/grant', {
                    uuid: pnConfig.uuid,
                    channel: ceConfig.globalChannel,
                    authData: ChatEngine.me.authData,
                    authKey: pnConfig.authKey
                })
                .then((response) => {

                    getChats(response.data);

                })
                .catch((error) => {

                    /**
                    * There was a problem logging in
                    * @event ChatEngine#$"."error"."auth
                    */
                    throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server ('+ceConfig.authUrl+').'), {
                        error: error
                    });

                });

            }

        };

        /**
        * The {@link Chat} class.
        * @member {Chat} Chat
        * @memberof ChatEngine
        * @see {@link Chat}
        */
        ChatEngine.Chat = Chat;

        /**
        * The {@link User} class.
        * @member {User} User
        * @memberof ChatEngine
        * @see {@link User}
        */
        ChatEngine.User = User;

        // add an object as a subobject under a namespoace
        ChatEngine.addChild = (ob, childName, childOb) => {

            // assign the new child object as a property of parent under the
            // given namespace
            ob[childName] = childOb;

            // the new object can use ```this.parent``` to access
            // the root class
            childOb.parent = ob;

        }

        return ChatEngine;

    }

    // return an instance of ChatEngine
    return init();

}

// export the ChatEngine api
module.exports = {
    plugin: {},  // leave a spot for plugins to exist
    create: create
};

},{"async/waterfall":3,"axios":4,"eventemitter2":30,"pubnub":57}],59:[function(require,module,exports){
window.ChatEngineCore = window.ChatEngineCore || require('./index.js');

},{"./index.js":58}]},{},[59])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvaW50ZXJuYWwvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9vbmx5T25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy93YXRlcmZhbGwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J0b2EuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvY29uc3RhbnQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbm9vcC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcHVibnViL2Rpc3Qvd2ViL3B1Ym51Yi5taW4uanMiLCJzcmMvaW5kZXguanMiLCJzcmMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNscURBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG9uY2U7XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIHZhciBjYWxsRm4gPSBmbjtcbiAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICBjYWxsRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gb25seU9uY2U7XG5mdW5jdGlvbiBvbmx5T25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIGNhbGxGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSAoMCwgX29uY2UyLmRlZmF1bHQpKGNhbGxiYWNrIHx8IF9ub29wMi5kZWZhdWx0KTtcbiAgICBpZiAoISgwLCBfaXNBcnJheTIuZGVmYXVsdCkodGFza3MpKSByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKSk7XG4gICAgaWYgKCF0YXNrcy5sZW5ndGgpIHJldHVybiBjYWxsYmFjaygpO1xuICAgIHZhciB0YXNrSW5kZXggPSAwO1xuXG4gICAgZnVuY3Rpb24gbmV4dFRhc2soYXJncykge1xuICAgICAgICBpZiAodGFza0luZGV4ID09PSB0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSAoMCwgX29ubHlPbmNlMi5kZWZhdWx0KSgoMCwgX2Jhc2VSZXN0Mi5kZWZhdWx0KShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0VGFzayhhcmdzKTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGFyZ3MucHVzaCh0YXNrQ2FsbGJhY2spO1xuXG4gICAgICAgIHZhciB0YXNrID0gdGFza3NbdGFza0luZGV4KytdO1xuICAgICAgICB0YXNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH1cblxuICAgIG5leHRUYXNrKFtdKTtcbn07XG5cbnZhciBfaXNBcnJheSA9IHJlcXVpcmUoJ2xvZGFzaC9pc0FycmF5Jyk7XG5cbnZhciBfaXNBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc0FycmF5KTtcblxudmFyIF9ub29wID0gcmVxdWlyZSgnbG9kYXNoL25vb3AnKTtcblxudmFyIF9ub29wMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25vb3ApO1xuXG52YXIgX29uY2UgPSByZXF1aXJlKCcuL2ludGVybmFsL29uY2UnKTtcblxudmFyIF9vbmNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29uY2UpO1xuXG52YXIgX2Jhc2VSZXN0ID0gcmVxdWlyZSgnbG9kYXNoL19iYXNlUmVzdCcpO1xuXG52YXIgX2Jhc2VSZXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Jhc2VSZXN0KTtcblxudmFyIF9vbmx5T25jZSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvb25seU9uY2UnKTtcblxudmFyIF9vbmx5T25jZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vbmx5T25jZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKipcbiAqIFJ1bnMgdGhlIGB0YXNrc2AgYXJyYXkgb2YgZnVuY3Rpb25zIGluIHNlcmllcywgZWFjaCBwYXNzaW5nIHRoZWlyIHJlc3VsdHMgdG9cbiAqIHRoZSBuZXh0IGluIHRoZSBhcnJheS4gSG93ZXZlciwgaWYgYW55IG9mIHRoZSBgdGFza3NgIHBhc3MgYW4gZXJyb3IgdG8gdGhlaXJcbiAqIG93biBjYWxsYmFjaywgdGhlIG5leHQgZnVuY3Rpb24gaXMgbm90IGV4ZWN1dGVkLCBhbmQgdGhlIG1haW4gYGNhbGxiYWNrYCBpc1xuICogaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIGVycm9yLlxuICpcbiAqIEBuYW1lIHdhdGVyZmFsbFxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIG1vZHVsZTpDb250cm9sRmxvd1xuICogQG1ldGhvZFxuICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICogQHBhcmFtIHtBcnJheX0gdGFza3MgLSBBbiBhcnJheSBvZiBmdW5jdGlvbnMgdG8gcnVuLCBlYWNoIGZ1bmN0aW9uIGlzIHBhc3NlZFxuICogYSBgY2FsbGJhY2soZXJyLCByZXN1bHQxLCByZXN1bHQyLCAuLi4pYCBpdCBtdXN0IGNhbGwgb24gY29tcGxldGlvbi4gVGhlXG4gKiBmaXJzdCBhcmd1bWVudCBpcyBhbiBlcnJvciAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFueSBmdXJ0aGVyIGFyZ3VtZW50c1xuICogd2lsbCBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIGluIG9yZGVyIHRvIHRoZSBuZXh0IHRhc2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gcnVuIG9uY2UgYWxsIHRoZVxuICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBUaGlzIHdpbGwgYmUgcGFzc2VkIHRoZSByZXN1bHRzIG9mIHRoZSBsYXN0IHRhc2snc1xuICogY2FsbGJhY2suIEludm9rZWQgd2l0aCAoZXJyLCBbcmVzdWx0c10pLlxuICogQHJldHVybnMgdW5kZWZpbmVkXG4gKiBAZXhhbXBsZVxuICpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqICAgICB9LFxuICogICAgIGZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNhbGxiYWNrKSB7XG4gKiAgICAgICAgIC8vIGFyZzEgbm93IGVxdWFscyAnb25lJyBhbmQgYXJnMiBub3cgZXF1YWxzICd0d28nXG4gKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogICAgIH0sXG4gKiAgICAgZnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAgICAgLy8gYXJnMSBub3cgZXF1YWxzICd0aHJlZSdcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAqICAgICB9XG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICpcbiAqIC8vIE9yLCB3aXRoIG5hbWVkIGZ1bmN0aW9uczpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgbXlGaXJzdEZ1bmN0aW9uLFxuICogICAgIG15U2Vjb25kRnVuY3Rpb24sXG4gKiAgICAgbXlMYXN0RnVuY3Rpb24sXG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICogZnVuY3Rpb24gbXlGaXJzdEZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gKiAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqIH1cbiAqIGZ1bmN0aW9uIG15U2Vjb25kRnVuY3Rpb24oYXJnMSwgYXJnMiwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogfVxuICogZnVuY3Rpb24gbXlMYXN0RnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ3RocmVlJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICdkb25lJyk7XG4gKiB9XG4gKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBidG9hID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5idG9hICYmIHdpbmRvdy5idG9hLmJpbmQod2luZG93KSkgfHwgcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J0b2EnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgbG9hZEV2ZW50ID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG4gICAgdmFyIHhEb21haW4gPSBmYWxzZTtcblxuICAgIC8vIEZvciBJRSA4LzkgQ09SUyBzdXBwb3J0XG4gICAgLy8gT25seSBzdXBwb3J0cyBQT1NUIGFuZCBHRVQgY2FsbHMgYW5kIGRvZXNuJ3QgcmV0dXJucyB0aGUgcmVzcG9uc2UgaGVhZGVycy5cbiAgICAvLyBET04nVCBkbyB0aGlzIGZvciB0ZXN0aW5nIGIvYyBYTUxIdHRwUmVxdWVzdCBpcyBtb2NrZWQsIG5vdCBYRG9tYWluUmVxdWVzdC5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0JyAmJlxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB3aW5kb3cuWERvbWFpblJlcXVlc3QgJiYgISgnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0KSAmJlxuICAgICAgICAhaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSB7XG4gICAgICByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuICAgICAgbG9hZEV2ZW50ID0gJ29ubG9hZCc7XG4gICAgICB4RG9tYWluID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uIGhhbmRsZVByb2dyZXNzKCkge307XG4gICAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7fTtcbiAgICB9XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0W2xvYWRFdmVudF0gPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IChyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQgJiYgIXhEb21haW4pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIC8vIElFIHNlbmRzIDEyMjMgaW5zdGVhZCBvZiAyMDQgKGh0dHBzOi8vZ2l0aHViLmNvbS9temFicmlza2llL2F4aW9zL2lzc3Vlcy8yMDEpXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAnTm8gQ29udGVudCcgOiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIHZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcblxuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKHV0aWxzLm1lcmdlKGRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gdXRpbHMubWVyZ2Uoe1xuICAgICAgdXJsOiBhcmd1bWVudHNbMF1cbiAgICB9LCBhcmd1bWVudHNbMV0pO1xuICB9XG5cbiAgY29uZmlnID0gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIHRoaXMuZGVmYXVsdHMsIHsgbWV0aG9kOiAnZ2V0JyB9LCBjb25maWcpO1xuICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIFN1cHBvcnQgYmFzZVVSTCBjb25maWdcbiAgaWYgKGNvbmZpZy5iYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKGNvbmZpZy51cmwpKSB7XG4gICAgY29uZmlnLnVybCA9IGNvbWJpbmVVUkxzKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVycyB8fCB7fVxuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGJ0b2EgcG9seWZpbGwgZm9yIElFPDEwIGNvdXJ0ZXN5IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGNoYW1iZXJzL0Jhc2U2NC5qc1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBFKCkge1xuICB0aGlzLm1lc3NhZ2UgPSAnU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyJztcbn1cbkUucHJvdG90eXBlID0gbmV3IEVycm9yO1xuRS5wcm90b3R5cGUuY29kZSA9IDU7XG5FLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cbmZ1bmN0aW9uIGJ0b2EoaW5wdXQpIHtcbiAgdmFyIHN0ciA9IFN0cmluZyhpbnB1dCk7XG4gIHZhciBvdXRwdXQgPSAnJztcbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlclxuICAgIHZhciBibG9jaywgY2hhckNvZGUsIGlkeCA9IDAsIG1hcCA9IGNoYXJzO1xuICAgIC8vIGlmIHRoZSBuZXh0IHN0ciBpbmRleCBkb2VzIG5vdCBleGlzdDpcbiAgICAvLyAgIGNoYW5nZSB0aGUgbWFwcGluZyB0YWJsZSB0byBcIj1cIlxuICAgIC8vICAgY2hlY2sgaWYgZCBoYXMgbm8gZnJhY3Rpb25hbCBkaWdpdHNcbiAgICBzdHIuY2hhckF0KGlkeCB8IDApIHx8IChtYXAgPSAnPScsIGlkeCAlIDEpO1xuICAgIC8vIFwiOCAtIGlkeCAlIDEgKiA4XCIgZ2VuZXJhdGVzIHRoZSBzZXF1ZW5jZSAyLCA0LCA2LCA4XG4gICAgb3V0cHV0ICs9IG1hcC5jaGFyQXQoNjMgJiBibG9jayA+PiA4IC0gaWR4ICUgMSAqIDgpXG4gICkge1xuICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaWR4ICs9IDMgLyA0KTtcbiAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICB0aHJvdyBuZXcgRSgpO1xuICAgIH1cbiAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ0b2E7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgfVxuXG4gICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICB9O1xuICAgIH1cblxuICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICB9O1xuICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICFpc0FycmF5KG9iaikpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0eXBlb2YgcmVzdWx0W2tleV0gPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltXG59O1xuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwiLyohXHJcbiAqIEV2ZW50RW1pdHRlcjJcclxuICogaHR0cHM6Ly9naXRodWIuY29tL2hpajFueC9FdmVudEVtaXR0ZXIyXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMyBoaWoxbnhcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKi9cclxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcclxuXHJcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5ID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIF9pc0FycmF5KG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgfTtcclxuICB2YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgdGhpcy5fZXZlbnRzID0ge307XHJcbiAgICBpZiAodGhpcy5fY29uZikge1xyXG4gICAgICBjb25maWd1cmUuY2FsbCh0aGlzLCB0aGlzLl9jb25mKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25mKSB7XHJcbiAgICBpZiAoY29uZikge1xyXG4gICAgICB0aGlzLl9jb25mID0gY29uZjtcclxuXHJcbiAgICAgIGNvbmYuZGVsaW1pdGVyICYmICh0aGlzLmRlbGltaXRlciA9IGNvbmYuZGVsaW1pdGVyKTtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGNvbmYubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQgPyBjb25mLm1heExpc3RlbmVycyA6IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbiAgICAgIGNvbmYud2lsZGNhcmQgJiYgKHRoaXMud2lsZGNhcmQgPSBjb25mLndpbGRjYXJkKTtcclxuICAgICAgY29uZi5uZXdMaXN0ZW5lciAmJiAodGhpcy5uZXdMaXN0ZW5lciA9IGNvbmYubmV3TGlzdGVuZXIpO1xyXG4gICAgICBjb25mLnZlcmJvc2VNZW1vcnlMZWFrICYmICh0aGlzLnZlcmJvc2VNZW1vcnlMZWFrID0gY29uZi52ZXJib3NlTWVtb3J5TGVhayk7XHJcblxyXG4gICAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJUcmVlID0ge307XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9nUG9zc2libGVNZW1vcnlMZWFrKGNvdW50LCBldmVudE5hbWUpIHtcclxuICAgIHZhciBlcnJvck1zZyA9ICcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcclxuICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcclxuICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJztcclxuXHJcbiAgICBpZih0aGlzLnZlcmJvc2VNZW1vcnlMZWFrKXtcclxuICAgICAgZXJyb3JNc2cgKz0gJyBFdmVudCBuYW1lOiAlcy4nO1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnLCBjb3VudCwgZXZlbnROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29uc29sZS50cmFjZSl7XHJcbiAgICAgIGNvbnNvbGUudHJhY2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcihjb25mKSB7XHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIHRoaXMubmV3TGlzdGVuZXIgPSBmYWxzZTtcclxuICAgIHRoaXMudmVyYm9zZU1lbW9yeUxlYWsgPSBmYWxzZTtcclxuICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmYpO1xyXG4gIH1cclxuICBFdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjsgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgZm9yIGV4cG9ydGluZyBFdmVudEVtaXR0ZXIgcHJvcGVydHlcclxuXHJcbiAgLy9cclxuICAvLyBBdHRlbnRpb24sIGZ1bmN0aW9uIHJldHVybiB0eXBlIG5vdyBpcyBhcnJheSwgYWx3YXlzICFcclxuICAvLyBJdCBoYXMgemVybyBlbGVtZW50cyBpZiBubyBhbnkgbWF0Y2hlcyBmb3VuZCBhbmQgb25lIG9yIG1vcmVcclxuICAvLyBlbGVtZW50cyAobGVhZnMpIGlmIHRoZXJlIGFyZSBtYXRjaGVzXHJcbiAgLy9cclxuICBmdW5jdGlvbiBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIGkpIHtcclxuICAgIGlmICghdHJlZSkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICB2YXIgbGlzdGVuZXJzPVtdLCBsZWFmLCBsZW4sIGJyYW5jaCwgeFRyZWUsIHh4VHJlZSwgaXNvbGF0ZWRCcmFuY2gsIGVuZFJlYWNoZWQsXHJcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGUubGVuZ3RoLCBjdXJyZW50VHlwZSA9IHR5cGVbaV0sIG5leHRUeXBlID0gdHlwZVtpKzFdO1xyXG4gICAgaWYgKGkgPT09IHR5cGVMZW5ndGggJiYgdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIGV2ZW50KHMpIGxpc3QgYW5kIHRoZSB0cmVlIGhhcyBsaXN0ZW5lcnNcclxuICAgICAgLy8gaW52b2tlIHRob3NlIGxpc3RlbmVycy5cclxuICAgICAgLy9cclxuICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBoYW5kbGVycyAmJiBoYW5kbGVycy5wdXNoKHRyZWUuX2xpc3RlbmVycyk7XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGxlYWYgPSAwLCBsZW4gPSB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoOyBsZWFmIDwgbGVuOyBsZWFmKyspIHtcclxuICAgICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzW2xlYWZdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgoY3VycmVudFR5cGUgPT09ICcqJyB8fCBjdXJyZW50VHlwZSA9PT0gJyoqJykgfHwgdHJlZVtjdXJyZW50VHlwZV0pIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGV2ZW50IGVtaXR0ZWQgaXMgJyonIGF0IHRoaXMgcGFydFxyXG4gICAgICAvLyBvciB0aGVyZSBpcyBhIGNvbmNyZXRlIG1hdGNoIGF0IHRoaXMgcGF0Y2hcclxuICAgICAgLy9cclxuICAgICAgaWYgKGN1cnJlbnRUeXBlID09PSAnKicpIHtcclxuICAgICAgICBmb3IgKGJyYW5jaCBpbiB0cmVlKSB7XHJcbiAgICAgICAgICBpZiAoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgdHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgICB9IGVsc2UgaWYoY3VycmVudFR5cGUgPT09ICcqKicpIHtcclxuICAgICAgICBlbmRSZWFjaGVkID0gKGkrMSA9PT0gdHlwZUxlbmd0aCB8fCAoaSsyID09PSB0eXBlTGVuZ3RoICYmIG5leHRUeXBlID09PSAnKicpKTtcclxuICAgICAgICBpZihlbmRSZWFjaGVkICYmIHRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gVGhlIG5leHQgZWxlbWVudCBoYXMgYSBfbGlzdGVuZXJzLCBhZGQgaXQgdG8gdGhlIGhhbmRsZXJzLlxyXG4gICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcclxuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgaWYoYnJhbmNoID09PSAnKicgfHwgYnJhbmNoID09PSAnKionKSB7XHJcbiAgICAgICAgICAgICAgaWYodHJlZVticmFuY2hdLl9saXN0ZW5lcnMgJiYgIWVuZFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xyXG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIE5vIG1hdGNoIG9uIHRoaXMgb25lLCBzaGlmdCBpbnRvIHRoZSB0cmVlIGJ1dCBub3QgaW4gdGhlIHR5cGUgYXJyYXkuXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2N1cnJlbnRUeXBlXSwgaSsxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgeFRyZWUgPSB0cmVlWycqJ107XHJcbiAgICBpZiAoeFRyZWUpIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHRyZWUgd2lsbCBhbGxvdyBhbnkgbWF0Y2ggZm9yIHRoaXMgcGFydCxcclxuICAgICAgLy8gdGhlbiByZWN1cnNpdmVseSBleHBsb3JlIGFsbCBicmFuY2hlcyBvZiB0aGUgdHJlZVxyXG4gICAgICAvL1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHhUcmVlLCBpKzEpO1xyXG4gICAgfVxyXG5cclxuICAgIHh4VHJlZSA9IHRyZWVbJyoqJ107XHJcbiAgICBpZih4eFRyZWUpIHtcclxuICAgICAgaWYoaSA8IHR5cGVMZW5ndGgpIHtcclxuICAgICAgICBpZih4eFRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGxpc3RlbmVyIG9uIGEgJyoqJywgaXQgd2lsbCBjYXRjaCBhbGwsIHNvIGFkZCBpdHMgaGFuZGxlci5cclxuICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGFycmF5cyBvZiBtYXRjaGluZyBuZXh0IGJyYW5jaGVzIGFuZCBvdGhlcnMuXHJcbiAgICAgICAgZm9yKGJyYW5jaCBpbiB4eFRyZWUpIHtcclxuICAgICAgICAgIGlmKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHh4VHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGlmKGJyYW5jaCA9PT0gbmV4dFR5cGUpIHtcclxuICAgICAgICAgICAgICAvLyBXZSBrbm93IHRoZSBuZXh0IGVsZW1lbnQgd2lsbCBtYXRjaCwgc28ganVtcCB0d2ljZS5cclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBjdXJyZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgIC8vIEN1cnJlbnQgbm9kZSBtYXRjaGVzLCBtb3ZlIGludG8gdGhlIHRyZWUuXHJcbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbYnJhbmNoXSwgaSsxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpc29sYXRlZEJyYW5jaCA9IHt9O1xyXG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoW2JyYW5jaF0gPSB4eFRyZWVbYnJhbmNoXTtcclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHsgJyoqJzogaXNvbGF0ZWRCcmFuY2ggfSwgaSsxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgLy8gV2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgYW5kIHN0aWxsIG9uIGEgJyoqJ1xyXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZVsnKiddICYmIHh4VHJlZVsnKiddLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVsnKiddLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBncm93TGlzdGVuZXJUcmVlKHR5cGUsIGxpc3RlbmVyKSB7XHJcblxyXG4gICAgdHlwZSA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBMb29rcyBmb3IgdHdvIGNvbnNlY3V0aXZlICcqKicsIGlmIHNvLCBkb24ndCBhZGQgdGhlIGV2ZW50IGF0IGFsbC5cclxuICAgIC8vXHJcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0eXBlLmxlbmd0aDsgaSsxIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYodHlwZVtpXSA9PT0gJyoqJyAmJiB0eXBlW2krMV0gPT09ICcqKicpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJlZSA9IHRoaXMubGlzdGVuZXJUcmVlO1xyXG4gICAgdmFyIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcblxyXG4gICAgd2hpbGUgKG5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgaWYgKCF0cmVlW25hbWVdKSB7XHJcbiAgICAgICAgdHJlZVtuYW1lXSA9IHt9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cmVlID0gdHJlZVtuYW1lXTtcclxuXHJcbiAgICAgIGlmICh0eXBlLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICBpZiAoIXRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gbGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gW3RyZWUuX2xpc3RlbmVyc107XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG5cclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgIXRyZWUuX2xpc3RlbmVycy53YXJuZWQgJiZcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA+IDAgJiZcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCA+IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnNcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMud2FybmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbG9nUG9zc2libGVNZW1vcnlMZWFrLmNhbGwodGhpcywgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCwgbmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cclxuICAvLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcclxuICAvLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cclxuICAvL1xyXG4gIC8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xyXG4gIC8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmRlbGltaXRlciA9ICcuJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XHJcbiAgICBpZiAobiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgICBpZiAoIXRoaXMuX2NvbmYpIHRoaXMuX2NvbmYgPSB7fTtcclxuICAgICAgdGhpcy5fY29uZi5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnQgPSAnJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XHJcbiAgICB0aGlzLm1hbnkoZXZlbnQsIDEsIGZuKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubWFueSA9IGZ1bmN0aW9uKGV2ZW50LCB0dGwsIGZuKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xyXG4gICAgICBpZiAoLS10dGwgPT09IDApIHtcclxuICAgICAgICBzZWxmLm9mZihldmVudCwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXIuX29yaWdpbiA9IGZuO1xyXG5cclxuICAgIHRoaXMub24oZXZlbnQsIGxpc3RlbmVyKTtcclxuXHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHZhciB0eXBlID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIGlmICh0eXBlID09PSAnbmV3TGlzdGVuZXInICYmICF0aGlzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFsID0gYXJndW1lbnRzLmxlbmd0aDtcclxuICAgIHZhciBhcmdzLGwsaSxqO1xyXG4gICAgdmFyIGhhbmRsZXI7XHJcblxyXG4gICAgaWYgKHRoaXMuX2FsbCAmJiB0aGlzLl9hbGwubGVuZ3RoKSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9hbGwuc2xpY2UoKTtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwpO1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBhbDsgaisrKSBhcmdzW2pdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gaGFuZGxlci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgaGFuZGxlciA9IFtdO1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgIC8vIG5lZWQgdG8gbWFrZSBjb3B5IG9mIGhhbmRsZXJzIGJlY2F1c2UgbGlzdCBjYW4gY2hhbmdlIGluIHRoZSBtaWRkbGVcclxuICAgICAgICAvLyBvZiBlbWl0IGNhbGxcclxuICAgICAgICBoYW5kbGVyID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5sZW5ndGgpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChpID0gMCwgbCA9IGhhbmRsZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAhIXRoaXMuX2FsbDtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRBc3luYyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcikgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtmYWxzZV0pOyB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb21pc2VzPSBbXTtcclxuXHJcbiAgICB2YXIgYWwgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgdmFyIGFyZ3MsbCxpLGo7XHJcbiAgICB2YXIgaGFuZGxlcjtcclxuXHJcbiAgICBpZiAodGhpcy5fYWxsKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gdGhpcy5fYWxsLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLl9hbGxbaV0uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGhhbmRsZXIgPSBbXTtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXIsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcykpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsIC0gMSk7XHJcbiAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBoYW5kbGVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChhcmd1bWVudHNbMV0pOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vbkFueSh0eXBlKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29uIG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcclxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXHJcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGdyb3dMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCB0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIENoYW5nZSB0byBhcnJheS5cclxuICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgJiZcclxuICAgICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID4gMCAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgIGxvZ1Bvc3NpYmxlTWVtb3J5TGVhay5jYWxsKHRoaXMsIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgsIHR5cGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignb25Bbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fYWxsKSB7XHJcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIGV2ZW50IGxpc3RlbmVyIGNvbGxlY3Rpb24uXHJcbiAgICB0aGlzLl9hbGwucHVzaChmbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhbmRsZXJzLGxlYWZzPVtdO1xyXG5cclxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cclxuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xyXG4gICAgICBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgbGVhZnMucHVzaCh7X2xpc3RlbmVyczpoYW5kbGVyc30pO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xyXG4gICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgaGFuZGxlcnMgPSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgIGlmIChpc0FycmF5KGhhbmRsZXJzKSkge1xyXG5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAtMTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoaGFuZGxlcnNbaV0gPT09IGxpc3RlbmVyIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5saXN0ZW5lciAmJiBoYW5kbGVyc1tpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5fb3JpZ2luICYmIGhhbmRsZXJzW2ldLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgICAgICBsZWFmLl9saXN0ZW5lcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlTGlzdGVuZXJcIiwgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChoYW5kbGVycyA9PT0gbGlzdGVuZXIgfHxcclxuICAgICAgICAoaGFuZGxlcnMubGlzdGVuZXIgJiYgaGFuZGxlcnMubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB8fFxyXG4gICAgICAgIChoYW5kbGVycy5fb3JpZ2luICYmIGhhbmRsZXJzLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgIGRlbGV0ZSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyXCIsIHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5R2FyYmFnZUNvbGxlY3Qocm9vdCkge1xyXG4gICAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vdCk7XHJcbiAgICAgIGZvciAodmFyIGkgaW4ga2V5cykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciBvYmogPSByb290W2tleV07XHJcbiAgICAgICAgaWYgKChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbikgfHwgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHx8IChvYmogPT09IG51bGwpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmVjdXJzaXZlbHlHYXJiYWdlQ29sbGVjdChyb290W2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGRlbGV0ZSByb290W2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZWN1cnNpdmVseUdhcmJhZ2VDb2xsZWN0KHRoaXMubGlzdGVuZXJUcmVlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICB2YXIgaSA9IDAsIGwgPSAwLCBmbnM7XHJcbiAgICBpZiAoZm4gJiYgdGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmKGZuID09PSBmbnNbaV0pIHtcclxuICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbik7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKylcclxuICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbnNbaV0pO1xyXG4gICAgICB0aGlzLl9hbGwgPSBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAhdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHZhciBsZWFmcyA9IHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIG51bGwsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcblxyXG4gICAgICBmb3IgKHZhciBpTGVhZj0wOyBpTGVhZjxsZWFmcy5sZW5ndGg7IGlMZWFmKyspIHtcclxuICAgICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgICBsZWFmLl9saXN0ZW5lcnMgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHMpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIGhhbmRsZXJzID0gW107XHJcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVycywgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXJzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xyXG4gICAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiB0aGlzLmxpc3RlbmVycyh0eXBlKS5sZW5ndGg7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnNBbnkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZih0aGlzLl9hbGwpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FsbDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgLy8gQ29tbW9uSlNcclxuICAgIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsLlxyXG4gICAgd2luZG93LkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XHJcbiAgfVxyXG59KCk7XHJcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHk7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHZhbHVlID0gT2JqZWN0KHZhbHVlKTtcbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiB2YWx1ZSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc01hc2tlZCA9IHJlcXVpcmUoJy4vX2lzTWFza2VkJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc05hdGl2ZTtcbiIsInZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKSxcbiAgICBvdmVyUmVzdCA9IHJlcXVpcmUoJy4vX292ZXJSZXN0JyksXG4gICAgc2V0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19zZXRUb1N0cmluZycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICByZXR1cm4gc2V0VG9TdHJpbmcob3ZlclJlc3QoZnVuYywgc3RhcnQsIGlkZW50aXR5KSwgZnVuYyArICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUmVzdDtcbiIsInZhciBjb25zdGFudCA9IHJlcXVpcmUoJy4vY29uc3RhbnQnKSxcbiAgICBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTZXRUb1N0cmluZztcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBjb3JlSnNEYXRhID0gcmVxdWlyZSgnLi9fY29yZUpzRGF0YScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgYXBwbHkgPSByZXF1aXJlKCcuL19hcHBseScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJSZXN0O1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIGJhc2VTZXRUb1N0cmluZyA9IHJlcXVpcmUoJy4vX2Jhc2VTZXRUb1N0cmluZycpLFxuICAgIHNob3J0T3V0ID0gcmVxdWlyZSgnLi9fc2hvcnRPdXQnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG9ydE91dDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnN0YW50O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLm5vb3ApO1xuICogLy8gPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkXVxuICovXG5mdW5jdGlvbiBub29wKCkge1xuICAvLyBObyBvcGVyYXRpb24gcGVyZm9ybWVkLlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vb3A7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiIWZ1bmN0aW9uKGUsdCl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9dCgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sdCk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/ZXhwb3J0cy5QdWJOdWI9dCgpOmUuUHViTnViPXQoKX0odGhpcyxmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXtmdW5jdGlvbiB0KHIpe2lmKG5bcl0pcmV0dXJuIG5bcl0uZXhwb3J0czt2YXIgaT1uW3JdPXtleHBvcnRzOnt9LGlkOnIsbG9hZGVkOiExfTtyZXR1cm4gZVtyXS5jYWxsKGkuZXhwb3J0cyxpLGkuZXhwb3J0cyx0KSxpLmxvYWRlZD0hMCxpLmV4cG9ydHN9dmFyIG49e307cmV0dXJuIHQubT1lLHQuYz1uLHQucD1cIlwiLHQoMCl9KFtmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gbyhlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIHMoZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1mdW5jdGlvbiBhKGUpe2lmKCFuYXZpZ2F0b3J8fCFuYXZpZ2F0b3Iuc2VuZEJlYWNvbilyZXR1cm4hMTtuYXZpZ2F0b3Iuc2VuZEJlYWNvbihlKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgdT1uKDEpLGM9cih1KSxsPW4oNDApLGg9cihsKSxmPW4oNDEpLGQ9cihmKSxwPW4oNDIpLGc9KG4oOCksZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlKXtpKHRoaXMsdCk7dmFyIG49ZS5saXN0ZW5Ub0Jyb3dzZXJOZXR3b3JrRXZlbnRzLHI9dm9pZCAwPT09bnx8bjtlLmRiPWQuZGVmYXVsdCxlLnNka0ZhbWlseT1cIldlYlwiLGUubmV0d29ya2luZz1uZXcgaC5kZWZhdWx0KHtnZXQ6cC5nZXQscG9zdDpwLnBvc3Qsc2VuZEJlYWNvbjphfSk7dmFyIHM9byh0aGlzLCh0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsKHRoaXMsZSkpO3JldHVybiByJiYod2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvZmZsaW5lXCIsZnVuY3Rpb24oKXtzLm5ldHdvcmtEb3duRGV0ZWN0ZWQoKX0pLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib25saW5lXCIsZnVuY3Rpb24oKXtzLm5ldHdvcmtVcERldGVjdGVkKCl9KSksc31yZXR1cm4gcyh0LGUpLHR9KGMuZGVmYXVsdCkpO3QuZGVmYXVsdD1nLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe2lmKGUmJmUuX19lc01vZHVsZSlyZXR1cm4gZTt2YXIgdD17fTtpZihudWxsIT1lKWZvcih2YXIgbiBpbiBlKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG4pJiYodFtuXT1lW25dKTtyZXR1cm4gdC5kZWZhdWx0PWUsdH1mdW5jdGlvbiBpKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBvKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLGE9bigyKSx1PWkoYSksYz1uKDcpLGw9aShjKSxoPW4oOSksZj1pKGgpLGQ9bigxMSkscD1pKGQpLGc9bigxMikseT1pKGcpLHY9bigxOCksYj1pKHYpLF89bigxOSksbT1yKF8pLGs9bigyMCksUD1yKGspLFM9bigyMSksdz1yKFMpLE89bigyMiksVD1yKE8pLEM9bigyMyksTT1yKEMpLEU9bigyNCkseD1yKEUpLE49bigyNSksUj1yKE4pLEs9bigyNiksQT1yKEspLGo9bigyNyksRD1yKGopLEc9bigyOCksVT1yKEcpLEI9bigyOSksST1yKEIpLEg9bigzMCksTD1yKEgpLHE9bigzMSksRj1yKHEpLHo9bigzMiksWD1yKHopLFc9bigzMyksVj1yKFcpLEo9bigzNCksJD1yKEopLFE9bigzNSksWT1yKFEpLFo9bigzNiksZWU9cihaKSx0ZT1uKDM3KSxuZT1yKHRlKSxyZT1uKDM4KSxpZT1yKHJlKSxvZT1uKDE1KSxzZT1yKG9lKSxhZT1uKDM5KSx1ZT1yKGFlKSxjZT1uKDE2KSxsZT1pKGNlKSxoZT1uKDEzKSxmZT1pKGhlKSxkZT0obig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dGhpcztvKHRoaXMsZSk7dmFyIHI9dC5kYixpPXQubmV0d29ya2luZyxzPXRoaXMuX2NvbmZpZz1uZXcgbC5kZWZhdWx0KHtzZXR1cDp0LGRiOnJ9KSxhPW5ldyBmLmRlZmF1bHQoe2NvbmZpZzpzfSk7aS5pbml0KHMpO3ZhciB1PXtjb25maWc6cyxuZXR3b3JraW5nOmksY3J5cHRvOmF9LGM9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHNlKSxoPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxVKSxkPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxMKSxnPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxYKSx2PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSx1ZSksXz10aGlzLl9saXN0ZW5lck1hbmFnZXI9bmV3IHkuZGVmYXVsdCxrPW5ldyBwLmRlZmF1bHQoe3RpbWVFbmRwb2ludDpjLGxlYXZlRW5kcG9pbnQ6aCxoZWFydGJlYXRFbmRwb2ludDpkLHNldFN0YXRlRW5kcG9pbnQ6ZyxzdWJzY3JpYmVFbmRwb2ludDp2LGNyeXB0bzp1LmNyeXB0byxjb25maWc6dS5jb25maWcsbGlzdGVuZXJNYW5hZ2VyOl99KTt0aGlzLmFkZExpc3RlbmVyPV8uYWRkTGlzdGVuZXIuYmluZChfKSx0aGlzLnJlbW92ZUxpc3RlbmVyPV8ucmVtb3ZlTGlzdGVuZXIuYmluZChfKSx0aGlzLnJlbW92ZUFsbExpc3RlbmVycz1fLnJlbW92ZUFsbExpc3RlbmVycy5iaW5kKF8pLHRoaXMuY2hhbm5lbEdyb3Vwcz17bGlzdEdyb3VwczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsVCksbGlzdENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxNKSxhZGRDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsbSkscmVtb3ZlQ2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFApLGRlbGV0ZUdyb3VwOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSx3KX0sdGhpcy5wdXNoPXthZGRDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUseCkscmVtb3ZlQ2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFIpLGRlbGV0ZURldmljZTpiLmRlZmF1bHQuYmluZCh0aGlzLHUsRCksbGlzdENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxBKX0sdGhpcy5oZXJlTm93PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxWKSx0aGlzLndoZXJlTm93PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxJKSx0aGlzLmdldFN0YXRlPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxGKSx0aGlzLnNldFN0YXRlPWsuYWRhcHRTdGF0ZUNoYW5nZS5iaW5kKGspLHRoaXMuZ3JhbnQ9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFkpLHRoaXMuYXVkaXQ9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LCQpLHRoaXMucHVibGlzaD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsZWUpLHRoaXMuZmlyZT1mdW5jdGlvbihlLHQpe3JldHVybiBlLnJlcGxpY2F0ZT0hMSxlLnN0b3JlSW5IaXN0b3J5PSExLG4ucHVibGlzaChlLHQpfSx0aGlzLmhpc3Rvcnk9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LG5lKSx0aGlzLmZldGNoTWVzc2FnZXM9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LGllKSx0aGlzLnRpbWU9Yyx0aGlzLnN1YnNjcmliZT1rLmFkYXB0U3Vic2NyaWJlQ2hhbmdlLmJpbmQoayksdGhpcy51bnN1YnNjcmliZT1rLmFkYXB0VW5zdWJzY3JpYmVDaGFuZ2UuYmluZChrKSx0aGlzLmRpc2Nvbm5lY3Q9ay5kaXNjb25uZWN0LmJpbmQoayksdGhpcy5yZWNvbm5lY3Q9ay5yZWNvbm5lY3QuYmluZChrKSx0aGlzLmRlc3Ryb3k9ZnVuY3Rpb24oZSl7ay51bnN1YnNjcmliZUFsbChlKSxrLmRpc2Nvbm5lY3QoKX0sdGhpcy5zdG9wPXRoaXMuZGVzdHJveSx0aGlzLnVuc3Vic2NyaWJlQWxsPWsudW5zdWJzY3JpYmVBbGwuYmluZChrKSx0aGlzLmdldFN1YnNjcmliZWRDaGFubmVscz1rLmdldFN1YnNjcmliZWRDaGFubmVscy5iaW5kKGspLHRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHM9ay5nZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwcy5iaW5kKGspLHRoaXMuZW5jcnlwdD1hLmVuY3J5cHQuYmluZChhKSx0aGlzLmRlY3J5cHQ9YS5kZWNyeXB0LmJpbmQoYSksdGhpcy5nZXRBdXRoS2V5PXUuY29uZmlnLmdldEF1dGhLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRBdXRoS2V5PXUuY29uZmlnLnNldEF1dGhLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRDaXBoZXJLZXk9dS5jb25maWcuc2V0Q2lwaGVyS2V5LmJpbmQodS5jb25maWcpLHRoaXMuZ2V0VVVJRD11LmNvbmZpZy5nZXRVVUlELmJpbmQodS5jb25maWcpLHRoaXMuc2V0VVVJRD11LmNvbmZpZy5zZXRVVUlELmJpbmQodS5jb25maWcpLHRoaXMuZ2V0RmlsdGVyRXhwcmVzc2lvbj11LmNvbmZpZy5nZXRGaWx0ZXJFeHByZXNzaW9uLmJpbmQodS5jb25maWcpLHRoaXMuc2V0RmlsdGVyRXhwcmVzc2lvbj11LmNvbmZpZy5zZXRGaWx0ZXJFeHByZXNzaW9uLmJpbmQodS5jb25maWcpfXJldHVybiBzKGUsW3trZXk6XCJnZXRWZXJzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY29uZmlnLmdldFZlcnNpb24oKX19LHtrZXk6XCJuZXR3b3JrRG93bkRldGVjdGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrRG93bigpLHRoaXMuX2NvbmZpZy5yZXN0b3JlP3RoaXMuZGlzY29ubmVjdCgpOnRoaXMuZGVzdHJveSghMCl9fSx7a2V5OlwibmV0d29ya1VwRGV0ZWN0ZWRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtVcCgpLHRoaXMucmVjb25uZWN0KCl9fV0sW3trZXk6XCJnZW5lcmF0ZVVVSURcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB1LmRlZmF1bHQudjQoKX19XSksZX0oKSk7ZGUuT1BFUkFUSU9OUz1sZS5kZWZhdWx0LGRlLkNBVEVHT1JJRVM9ZmUuZGVmYXVsdCx0LmRlZmF1bHQ9ZGUsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe3ZhciByPW4oMyksaT1uKDYpLG89aTtvLnYxPXIsby52ND1pLGUuZXhwb3J0cz1vfSxmdW5jdGlvbihlLHQsbil7ZnVuY3Rpb24gcihlLHQsbil7dmFyIHI9dCYmbnx8MCxpPXR8fFtdO2U9ZXx8e307dmFyIHM9dm9pZCAwIT09ZS5jbG9ja3NlcT9lLmNsb2Nrc2VxOnUsaD12b2lkIDAhPT1lLm1zZWNzP2UubXNlY3M6KG5ldyBEYXRlKS5nZXRUaW1lKCksZj12b2lkIDAhPT1lLm5zZWNzP2UubnNlY3M6bCsxLGQ9aC1jKyhmLWwpLzFlNDtpZihkPDAmJnZvaWQgMD09PWUuY2xvY2tzZXEmJihzPXMrMSYxNjM4MyksKGQ8MHx8aD5jKSYmdm9pZCAwPT09ZS5uc2VjcyYmKGY9MCksZj49MWU0KXRocm93IG5ldyBFcnJvcihcInV1aWQudjEoKTogQ2FuJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjXCIpO2M9aCxsPWYsdT1zLGgrPTEyMjE5MjkyOGU1O3ZhciBwPSgxZTQqKDI2ODQzNTQ1NSZoKStmKSU0Mjk0OTY3Mjk2O2lbcisrXT1wPj4+MjQmMjU1LGlbcisrXT1wPj4+MTYmMjU1LGlbcisrXT1wPj4+OCYyNTUsaVtyKytdPTI1NSZwO3ZhciBnPWgvNDI5NDk2NzI5NioxZTQmMjY4NDM1NDU1O2lbcisrXT1nPj4+OCYyNTUsaVtyKytdPTI1NSZnLGlbcisrXT1nPj4+MjQmMTV8MTYsaVtyKytdPWc+Pj4xNiYyNTUsaVtyKytdPXM+Pj44fDEyOCxpW3IrK109MjU1JnM7Zm9yKHZhciB5PWUubm9kZXx8YSx2PTA7djw2OysrdilpW3Irdl09eVt2XTtyZXR1cm4gdHx8byhpKX12YXIgaT1uKDQpLG89big1KSxzPWkoKSxhPVsxfHNbMF0sc1sxXSxzWzJdLHNbM10sc1s0XSxzWzVdXSx1PTE2MzgzJihzWzZdPDw4fHNbN10pLGM9MCxsPTA7ZS5leHBvcnRzPXJ9LGZ1bmN0aW9uKGUsdCl7KGZ1bmN0aW9uKHQpe3ZhciBuLHI9dC5jcnlwdG98fHQubXNDcnlwdG87aWYociYmci5nZXRSYW5kb21WYWx1ZXMpe3ZhciBpPW5ldyBVaW50OEFycmF5KDE2KTtuPWZ1bmN0aW9uKCl7cmV0dXJuIHIuZ2V0UmFuZG9tVmFsdWVzKGkpLGl9fWlmKCFuKXt2YXIgbz1uZXcgQXJyYXkoMTYpO249ZnVuY3Rpb24oKXtmb3IodmFyIGUsdD0wO3Q8MTY7dCsrKTA9PSgzJnQpJiYoZT00Mjk0OTY3Mjk2Kk1hdGgucmFuZG9tKCkpLG9bdF09ZT4+PigoMyZ0KTw8MykmMjU1O3JldHVybiBvfX1lLmV4cG9ydHM9bn0pLmNhbGwodCxmdW5jdGlvbigpe3JldHVybiB0aGlzfSgpKX0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUsdCl7dmFyIG49dHx8MCxpPXI7cmV0dXJuIGlbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXX1mb3IodmFyIHI9W10saT0wO2k8MjU2OysraSlyW2ldPShpKzI1NikudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtlLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSx0LG4pe3ZhciByPXQmJm58fDA7XCJzdHJpbmdcIj09dHlwZW9mIGUmJih0PVwiYmluYXJ5XCI9PWU/bmV3IEFycmF5KDE2KTpudWxsLGU9bnVsbCksZT1lfHx7fTt2YXIgcz1lLnJhbmRvbXx8KGUucm5nfHxpKSgpO2lmKHNbNl09MTUmc1s2XXw2NCxzWzhdPTYzJnNbOF18MTI4LHQpZm9yKHZhciBhPTA7YTwxNjsrK2EpdFtyK2FdPXNbYV07cmV0dXJuIHR8fG8ocyl9dmFyIGk9big0KSxvPW4oNSk7ZS5leHBvcnRzPXJ9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89bigyKSxzPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obyksYT0obig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC5zZXR1cCxpPXQuZGI7cih0aGlzLGUpLHRoaXMuX2RiPWksdGhpcy5pbnN0YW5jZUlkPVwicG4tXCIrcy5kZWZhdWx0LnY0KCksdGhpcy5zZWNyZXRLZXk9bi5zZWNyZXRLZXl8fG4uc2VjcmV0X2tleSx0aGlzLnN1YnNjcmliZUtleT1uLnN1YnNjcmliZUtleXx8bi5zdWJzY3JpYmVfa2V5LHRoaXMucHVibGlzaEtleT1uLnB1Ymxpc2hLZXl8fG4ucHVibGlzaF9rZXksdGhpcy5zZGtGYW1pbHk9bi5zZGtGYW1pbHksdGhpcy5wYXJ0bmVySWQ9bi5wYXJ0bmVySWQsdGhpcy5zZXRBdXRoS2V5KG4uYXV0aEtleSksdGhpcy5zZXRDaXBoZXJLZXkobi5jaXBoZXJLZXkpLHRoaXMuc2V0RmlsdGVyRXhwcmVzc2lvbihuLmZpbHRlckV4cHJlc3Npb24pLHRoaXMub3JpZ2luPW4ub3JpZ2lufHxcInB1YnN1Yi5wdWJudWIuY29tXCIsdGhpcy5zZWN1cmU9bi5zc2x8fCExLHRoaXMucmVzdG9yZT1uLnJlc3RvcmV8fCExLHRoaXMucHJveHk9bi5wcm94eSx0aGlzLmtlZXBBbGl2ZT1uLmtlZXBBbGl2ZSx0aGlzLmtlZXBBbGl2ZVNldHRpbmdzPW4ua2VlcEFsaXZlU2V0dGluZ3MsdGhpcy5hdXRvTmV0d29ya0RldGVjdGlvbj1uLmF1dG9OZXR3b3JrRGV0ZWN0aW9ufHwhMSx0aGlzLmN1c3RvbUVuY3J5cHQ9bi5jdXN0b21FbmNyeXB0LHRoaXMuY3VzdG9tRGVjcnlwdD1uLmN1c3RvbURlY3J5cHQsXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGxvY2F0aW9uJiZcImh0dHBzOlwiPT09bG9jYXRpb24ucHJvdG9jb2wmJih0aGlzLnNlY3VyZT0hMCksdGhpcy5sb2dWZXJib3NpdHk9bi5sb2dWZXJib3NpdHl8fCExLHRoaXMuc3VwcHJlc3NMZWF2ZUV2ZW50cz1uLnN1cHByZXNzTGVhdmVFdmVudHN8fCExLHRoaXMuYW5ub3VuY2VGYWlsZWRIZWFydGJlYXRzPW4uYW5ub3VuY2VGYWlsZWRIZWFydGJlYXRzfHwhMCx0aGlzLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHM9bi5hbm5vdW5jZVN1Y2Nlc3NmdWxIZWFydGJlYXRzfHwhMSx0aGlzLnVzZUluc3RhbmNlSWQ9bi51c2VJbnN0YW5jZUlkfHwhMSx0aGlzLnVzZVJlcXVlc3RJZD1uLnVzZVJlcXVlc3RJZHx8ITEsdGhpcy5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkPW4ucmVxdWVzdE1lc3NhZ2VDb3VudFRocmVzaG9sZCx0aGlzLnNldFRyYW5zYWN0aW9uVGltZW91dChuLnRyYW5zYWN0aW9uYWxSZXF1ZXN0VGltZW91dHx8MTVlMyksdGhpcy5zZXRTdWJzY3JpYmVUaW1lb3V0KG4uc3Vic2NyaWJlUmVxdWVzdFRpbWVvdXR8fDMxZTQpLHRoaXMuc2V0U2VuZEJlYWNvbkNvbmZpZyhuLnVzZVNlbmRCZWFjb258fCEwKSx0aGlzLnNldFByZXNlbmNlVGltZW91dChuLnByZXNlbmNlVGltZW91dHx8MzAwKSxuLmhlYXJ0YmVhdEludGVydmFsJiZ0aGlzLnNldEhlYXJ0YmVhdEludGVydmFsKG4uaGVhcnRiZWF0SW50ZXJ2YWwpLHRoaXMuc2V0VVVJRCh0aGlzLl9kZWNpZGVVVUlEKG4udXVpZCkpfXJldHVybiBpKGUsW3trZXk6XCJnZXRBdXRoS2V5XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hdXRoS2V5fX0se2tleTpcInNldEF1dGhLZXlcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5hdXRoS2V5PWUsdGhpc319LHtrZXk6XCJzZXRDaXBoZXJLZXlcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5jaXBoZXJLZXk9ZSx0aGlzfX0se2tleTpcImdldFVVSURcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLlVVSUR9fSx7a2V5Olwic2V0VVVJRFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9kYiYmdGhpcy5fZGIuc2V0JiZ0aGlzLl9kYi5zZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIsZSksdGhpcy5VVUlEPWUsdGhpc319LHtrZXk6XCJnZXRGaWx0ZXJFeHByZXNzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5maWx0ZXJFeHByZXNzaW9ufX0se2tleTpcInNldEZpbHRlckV4cHJlc3Npb25cIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5maWx0ZXJFeHByZXNzaW9uPWUsdGhpc319LHtrZXk6XCJnZXRQcmVzZW5jZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wcmVzZW5jZVRpbWVvdXR9fSx7a2V5Olwic2V0UHJlc2VuY2VUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3ByZXNlbmNlVGltZW91dD1lLHRoaXMuc2V0SGVhcnRiZWF0SW50ZXJ2YWwodGhpcy5fcHJlc2VuY2VUaW1lb3V0LzItMSksdGhpc319LHtrZXk6XCJnZXRIZWFydGJlYXRJbnRlcnZhbFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2hlYXJ0YmVhdEludGVydmFsfX0se2tleTpcInNldEhlYXJ0YmVhdEludGVydmFsXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2hlYXJ0YmVhdEludGVydmFsPWUsdGhpc319LHtrZXk6XCJnZXRTdWJzY3JpYmVUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3Vic2NyaWJlUmVxdWVzdFRpbWVvdXR9fSx7a2V5Olwic2V0U3Vic2NyaWJlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9zdWJzY3JpYmVSZXF1ZXN0VGltZW91dD1lLHRoaXN9fSx7a2V5OlwiZ2V0VHJhbnNhY3Rpb25UaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdHJhbnNhY3Rpb25hbFJlcXVlc3RUaW1lb3V0fX0se2tleTpcInNldFRyYW5zYWN0aW9uVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl90cmFuc2FjdGlvbmFsUmVxdWVzdFRpbWVvdXQ9ZSx0aGlzfX0se2tleTpcImlzU2VuZEJlYWNvbkVuYWJsZWRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl91c2VTZW5kQmVhY29ufX0se2tleTpcInNldFNlbmRCZWFjb25Db25maWdcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fdXNlU2VuZEJlYWNvbj1lLHRoaXN9fSx7a2V5OlwiZ2V0VmVyc2lvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuXCI0LjEzLjBcIn19LHtrZXk6XCJfZGVjaWRlVVVJRFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiBlfHwodGhpcy5fZGImJnRoaXMuX2RiLmdldCYmdGhpcy5fZGIuZ2V0KHRoaXMuc3Vic2NyaWJlS2V5K1widXVpZFwiKT90aGlzLl9kYi5nZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIpOlwicG4tXCIrcy5kZWZhdWx0LnY0KCkpfX1dKSxlfSgpKTt0LmRlZmF1bHQ9YSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO2UuZXhwb3J0cz17fX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCkscz1uKDcpLGE9KHIocyksbigxMCkpLHU9cihhKSxjPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LmNvbmZpZztpKHRoaXMsZSksdGhpcy5fY29uZmlnPW4sdGhpcy5faXY9XCIwMTIzNDU2Nzg5MDEyMzQ1XCIsdGhpcy5fYWxsb3dlZEtleUVuY29kaW5ncz1bXCJoZXhcIixcInV0ZjhcIixcImJhc2U2NFwiLFwiYmluYXJ5XCJdLHRoaXMuX2FsbG93ZWRLZXlMZW5ndGhzPVsxMjgsMjU2XSx0aGlzLl9hbGxvd2VkTW9kZXM9W1wiZWNiXCIsXCJjYmNcIl0sdGhpcy5fZGVmYXVsdE9wdGlvbnM9e2VuY3J5cHRLZXk6ITAsa2V5RW5jb2Rpbmc6XCJ1dGY4XCIsa2V5TGVuZ3RoOjI1Nixtb2RlOlwiY2JjXCJ9fXJldHVybiBvKGUsW3trZXk6XCJITUFDU0hBMjU2XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHUuZGVmYXVsdC5IbWFjU0hBMjU2KGUsdGhpcy5fY29uZmlnLnNlY3JldEtleSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5CYXNlNjQpfX0se2tleTpcIlNIQTI1NlwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB1LmRlZmF1bHQuU0hBMjU2KGUpLnRvU3RyaW5nKHUuZGVmYXVsdC5lbmMuSGV4KX19LHtrZXk6XCJfcGFyc2VPcHRpb25zXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9ZXx8e307cmV0dXJuIHQuaGFzT3duUHJvcGVydHkoXCJlbmNyeXB0S2V5XCIpfHwodC5lbmNyeXB0S2V5PXRoaXMuX2RlZmF1bHRPcHRpb25zLmVuY3J5cHRLZXkpLHQuaGFzT3duUHJvcGVydHkoXCJrZXlFbmNvZGluZ1wiKXx8KHQua2V5RW5jb2Rpbmc9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5RW5jb2RpbmcpLHQuaGFzT3duUHJvcGVydHkoXCJrZXlMZW5ndGhcIil8fCh0LmtleUxlbmd0aD10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlMZW5ndGgpLHQuaGFzT3duUHJvcGVydHkoXCJtb2RlXCIpfHwodC5tb2RlPXRoaXMuX2RlZmF1bHRPcHRpb25zLm1vZGUpLC0xPT09dGhpcy5fYWxsb3dlZEtleUVuY29kaW5ncy5pbmRleE9mKHQua2V5RW5jb2RpbmcudG9Mb3dlckNhc2UoKSkmJih0LmtleUVuY29kaW5nPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUVuY29kaW5nKSwtMT09PXRoaXMuX2FsbG93ZWRLZXlMZW5ndGhzLmluZGV4T2YocGFyc2VJbnQodC5rZXlMZW5ndGgsMTApKSYmKHQua2V5TGVuZ3RoPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUxlbmd0aCksLTE9PT10aGlzLl9hbGxvd2VkTW9kZXMuaW5kZXhPZih0Lm1vZGUudG9Mb3dlckNhc2UoKSkmJih0Lm1vZGU9dGhpcy5fZGVmYXVsdE9wdGlvbnMubW9kZSksdH19LHtrZXk6XCJfZGVjb2RlS2V5XCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXtyZXR1cm5cImJhc2U2NFwiPT09dC5rZXlFbmNvZGluZz91LmRlZmF1bHQuZW5jLkJhc2U2NC5wYXJzZShlKTpcImhleFwiPT09dC5rZXlFbmNvZGluZz91LmRlZmF1bHQuZW5jLkhleC5wYXJzZShlKTplfX0se2tleTpcIl9nZXRQYWRkZWRLZXlcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3JldHVybiBlPXRoaXMuX2RlY29kZUtleShlLHQpLHQuZW5jcnlwdEtleT91LmRlZmF1bHQuZW5jLlV0ZjgucGFyc2UodGhpcy5TSEEyNTYoZSkuc2xpY2UoMCwzMikpOmV9fSx7a2V5OlwiX2dldE1vZGVcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm5cImVjYlwiPT09ZS5tb2RlP3UuZGVmYXVsdC5tb2RlLkVDQjp1LmRlZmF1bHQubW9kZS5DQkN9fSx7a2V5OlwiX2dldElWXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuXCJjYmNcIj09PWUubW9kZT91LmRlZmF1bHQuZW5jLlV0ZjgucGFyc2UodGhpcy5faXYpOm51bGx9fSx7a2V5OlwiZW5jcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fY29uZmlnLmN1c3RvbUVuY3J5cHQ/dGhpcy5fY29uZmlnLmN1c3RvbUVuY3J5cHQoZSk6dGhpcy5wbkVuY3J5cHQoZSx0LG4pfX0se2tleTpcImRlY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX2NvbmZpZy5jdXN0b21EZWNyeXB0P3RoaXMuX2NvbmZpZy5jdXN0b21EZWNyeXB0KGUpOnRoaXMucG5EZWNyeXB0KGUsdCxuKX19LHtrZXk6XCJwbkVuY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7aWYoIXQmJiF0aGlzLl9jb25maWcuY2lwaGVyS2V5KXJldHVybiBlO249dGhpcy5fcGFyc2VPcHRpb25zKG4pO3ZhciByPXRoaXMuX2dldElWKG4pLGk9dGhpcy5fZ2V0TW9kZShuKSxvPXRoaXMuX2dldFBhZGRlZEtleSh0fHx0aGlzLl9jb25maWcuY2lwaGVyS2V5LG4pO3JldHVybiB1LmRlZmF1bHQuQUVTLmVuY3J5cHQoZSxvLHtpdjpyLG1vZGU6aX0pLmNpcGhlcnRleHQudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5CYXNlNjQpfHxlfX0se2tleTpcInBuRGVjcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtpZighdCYmIXRoaXMuX2NvbmZpZy5jaXBoZXJLZXkpcmV0dXJuIGU7bj10aGlzLl9wYXJzZU9wdGlvbnMobik7dmFyIHI9dGhpcy5fZ2V0SVYobiksaT10aGlzLl9nZXRNb2RlKG4pLG89dGhpcy5fZ2V0UGFkZGVkS2V5KHR8fHRoaXMuX2NvbmZpZy5jaXBoZXJLZXksbik7dHJ5e3ZhciBzPXUuZGVmYXVsdC5lbmMuQmFzZTY0LnBhcnNlKGUpLGE9dS5kZWZhdWx0LkFFUy5kZWNyeXB0KHtjaXBoZXJ0ZXh0OnN9LG8se2l2OnIsbW9kZTppfSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5VdGY4KTtyZXR1cm4gSlNPTi5wYXJzZShhKX1jYXRjaChlKXtyZXR1cm4gbnVsbH19fV0pLGV9KCk7dC5kZWZhdWx0PWMsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjt2YXIgbj1ufHxmdW5jdGlvbihlLHQpe3ZhciBuPXt9LHI9bi5saWI9e30saT1mdW5jdGlvbigpe30sbz1yLkJhc2U9e2V4dGVuZDpmdW5jdGlvbihlKXtpLnByb3RvdHlwZT10aGlzO3ZhciB0PW5ldyBpO3JldHVybiBlJiZ0Lm1peEluKGUpLHQuaGFzT3duUHJvcGVydHkoXCJpbml0XCIpfHwodC5pbml0PWZ1bmN0aW9uKCl7dC4kc3VwZXIuaW5pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9KSx0LmluaXQucHJvdG90eXBlPXQsdC4kc3VwZXI9dGhpcyx0fSxjcmVhdGU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmV4dGVuZCgpO3JldHVybiBlLmluaXQuYXBwbHkoZSxhcmd1bWVudHMpLGV9LGluaXQ6ZnVuY3Rpb24oKXt9LG1peEluOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdCBpbiBlKWUuaGFzT3duUHJvcGVydHkodCkmJih0aGlzW3RdPWVbdF0pO2UuaGFzT3duUHJvcGVydHkoXCJ0b1N0cmluZ1wiKSYmKHRoaXMudG9TdHJpbmc9ZS50b1N0cmluZyl9LGNsb25lOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW5pdC5wcm90b3R5cGUuZXh0ZW5kKHRoaXMpfX0scz1yLldvcmRBcnJheT1vLmV4dGVuZCh7aW5pdDpmdW5jdGlvbihlLHQpe2U9dGhpcy53b3Jkcz1lfHxbXSx0aGlzLnNpZ0J5dGVzPXZvaWQgMCE9dD90OjQqZS5sZW5ndGh9LHRvU3RyaW5nOmZ1bmN0aW9uKGUpe3JldHVybihlfHx1KS5zdHJpbmdpZnkodGhpcyl9LGNvbmNhdDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLndvcmRzLG49ZS53b3JkcyxyPXRoaXMuc2lnQnl0ZXM7aWYoZT1lLnNpZ0J5dGVzLHRoaXMuY2xhbXAoKSxyJTQpZm9yKHZhciBpPTA7aTxlO2krKyl0W3IraT4+PjJdfD0obltpPj4+Ml0+Pj4yNC1pJTQqOCYyNTUpPDwyNC0ocitpKSU0Kjg7ZWxzZSBpZig2NTUzNTxuLmxlbmd0aClmb3IoaT0wO2k8ZTtpKz00KXRbcitpPj4+Ml09bltpPj4+Ml07ZWxzZSB0LnB1c2guYXBwbHkodCxuKTtyZXR1cm4gdGhpcy5zaWdCeXRlcys9ZSx0aGlzfSxjbGFtcDpmdW5jdGlvbigpe3ZhciB0PXRoaXMud29yZHMsbj10aGlzLnNpZ0J5dGVzO3Rbbj4+PjJdJj00Mjk0OTY3Mjk1PDwzMi1uJTQqOCx0Lmxlbmd0aD1lLmNlaWwobi80KX0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1vLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUud29yZHM9dGhpcy53b3Jkcy5zbGljZSgwKSxlfSxyYW5kb206ZnVuY3Rpb24odCl7Zm9yKHZhciBuPVtdLHI9MDtyPHQ7cis9NCluLnB1c2goNDI5NDk2NzI5NiplLnJhbmRvbSgpfDApO3JldHVybiBuZXcgcy5pbml0KG4sdCl9fSksYT1uLmVuYz17fSx1PWEuSGV4PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcztlPWUuc2lnQnl0ZXM7Zm9yKHZhciBuPVtdLHI9MDtyPGU7cisrKXt2YXIgaT10W3I+Pj4yXT4+PjI0LXIlNCo4JjI1NTtuLnB1c2goKGk+Pj40KS50b1N0cmluZygxNikpLG4ucHVzaCgoMTUmaSkudG9TdHJpbmcoMTYpKX1yZXR1cm4gbi5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXtmb3IodmFyIHQ9ZS5sZW5ndGgsbj1bXSxyPTA7cjx0O3IrPTIpbltyPj4+M118PXBhcnNlSW50KGUuc3Vic3RyKHIsMiksMTYpPDwyNC1yJTgqNDtyZXR1cm4gbmV3IHMuaW5pdChuLHQvMil9fSxjPWEuTGF0aW4xPXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcztlPWUuc2lnQnl0ZXM7Zm9yKHZhciBuPVtdLHI9MDtyPGU7cisrKW4ucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKHRbcj4+PjJdPj4+MjQtciU0KjgmMjU1KSk7cmV0dXJuIG4uam9pbihcIlwiKX0scGFyc2U6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PWUubGVuZ3RoLG49W10scj0wO3I8dDtyKyspbltyPj4+Ml18PSgyNTUmZS5jaGFyQ29kZUF0KHIpKTw8MjQtciU0Kjg7cmV0dXJuIG5ldyBzLmluaXQobix0KX19LGw9YS5VdGY4PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGMuc3RyaW5naWZ5KGUpKSl9Y2F0Y2goZSl7dGhyb3cgRXJyb3IoXCJNYWxmb3JtZWQgVVRGLTggZGF0YVwiKX19LHBhcnNlOmZ1bmN0aW9uKGUpe3JldHVybiBjLnBhcnNlKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChlKSkpfX0saD1yLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG09by5leHRlbmQoe3Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5fZGF0YT1uZXcgcy5pbml0LHRoaXMuX25EYXRhQnl0ZXM9MH0sX2FwcGVuZDpmdW5jdGlvbihlKXtcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9bC5wYXJzZShlKSksdGhpcy5fZGF0YS5jb25jYXQoZSksdGhpcy5fbkRhdGFCeXRlcys9ZS5zaWdCeXRlc30sX3Byb2Nlc3M6ZnVuY3Rpb24odCl7dmFyIG49dGhpcy5fZGF0YSxyPW4ud29yZHMsaT1uLnNpZ0J5dGVzLG89dGhpcy5ibG9ja1NpemUsYT1pLyg0Km8pLGE9dD9lLmNlaWwoYSk6ZS5tYXgoKDB8YSktdGhpcy5fbWluQnVmZmVyU2l6ZSwwKTtpZih0PWEqbyxpPWUubWluKDQqdCxpKSx0KXtmb3IodmFyIHU9MDt1PHQ7dSs9byl0aGlzLl9kb1Byb2Nlc3NCbG9jayhyLHUpO3U9ci5zcGxpY2UoMCx0KSxuLnNpZ0J5dGVzLT1pfXJldHVybiBuZXcgcy5pbml0KHUsaSl9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9by5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLl9kYXRhPXRoaXMuX2RhdGEuY2xvbmUoKSxlfSxfbWluQnVmZmVyU2l6ZTowfSk7ci5IYXNoZXI9aC5leHRlbmQoe2NmZzpvLmV4dGVuZCgpLGluaXQ6ZnVuY3Rpb24oZSl7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKGUpLHRoaXMucmVzZXQoKX0scmVzZXQ6ZnVuY3Rpb24oKXtoLnJlc2V0LmNhbGwodGhpcyksdGhpcy5fZG9SZXNldCgpfSx1cGRhdGU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2FwcGVuZChlKSx0aGlzLl9wcm9jZXNzKCksdGhpc30sZmluYWxpemU6ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJnRoaXMuX2FwcGVuZChlKSx0aGlzLl9kb0ZpbmFsaXplKCl9LGJsb2NrU2l6ZToxNixfY3JlYXRlSGVscGVyOmZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LG4pe3JldHVybiBuZXcgZS5pbml0KG4pLmZpbmFsaXplKHQpfX0sX2NyZWF0ZUhtYWNIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsbil7cmV0dXJuIG5ldyBmLkhNQUMuaW5pdChlLG4pLmZpbmFsaXplKHQpfX19KTt2YXIgZj1uLmFsZ289e307cmV0dXJuIG59KE1hdGgpOyFmdW5jdGlvbihlKXtmb3IodmFyIHQ9bixyPXQubGliLGk9ci5Xb3JkQXJyYXksbz1yLkhhc2hlcixyPXQuYWxnbyxzPVtdLGE9W10sdT1mdW5jdGlvbihlKXtyZXR1cm4gNDI5NDk2NzI5NiooZS0oMHxlKSl8MH0sYz0yLGw9MDs2ND5sOyl7dmFyIGg7ZTp7aD1jO2Zvcih2YXIgZj1lLnNxcnQoaCksZD0yO2Q8PWY7ZCsrKWlmKCEoaCVkKSl7aD0hMTticmVhayBlfWg9ITB9aCYmKDg+bCYmKHNbbF09dShlLnBvdyhjLC41KSkpLGFbbF09dShlLnBvdyhjLDEvMykpLGwrKyksYysrfXZhciBwPVtdLHI9ci5TSEEyNTY9by5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5faGFzaD1uZXcgaS5pbml0KHMuc2xpY2UoMCkpfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49dGhpcy5faGFzaC53b3JkcyxyPW5bMF0saT1uWzFdLG89blsyXSxzPW5bM10sdT1uWzRdLGM9bls1XSxsPW5bNl0saD1uWzddLGY9MDs2ND5mO2YrKyl7aWYoMTY+ZilwW2ZdPTB8ZVt0K2ZdO2Vsc2V7dmFyIGQ9cFtmLTE1XSxnPXBbZi0yXTtwW2ZdPSgoZDw8MjV8ZD4+PjcpXihkPDwxNHxkPj4+MTgpXmQ+Pj4zKStwW2YtN10rKChnPDwxNXxnPj4+MTcpXihnPDwxM3xnPj4+MTkpXmc+Pj4xMCkrcFtmLTE2XX1kPWgrKCh1PDwyNnx1Pj4+NileKHU8PDIxfHU+Pj4xMSleKHU8PDd8dT4+PjI1KSkrKHUmY15+dSZsKSthW2ZdK3BbZl0sZz0oKHI8PDMwfHI+Pj4yKV4ocjw8MTl8cj4+PjEzKV4ocjw8MTB8cj4+PjIyKSkrKHImaV5yJm9eaSZvKSxoPWwsbD1jLGM9dSx1PXMrZHwwLHM9byxvPWksaT1yLHI9ZCtnfDB9blswXT1uWzBdK3J8MCxuWzFdPW5bMV0raXwwLG5bMl09blsyXStvfDAsblszXT1uWzNdK3N8MCxuWzRdPW5bNF0rdXwwLG5bNV09bls1XStjfDAsbls2XT1uWzZdK2x8MCxuWzddPW5bN10raHwwfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2RhdGEsbj10LndvcmRzLHI9OCp0aGlzLl9uRGF0YUJ5dGVzLGk9OCp0LnNpZ0J5dGVzO3JldHVybiBuW2k+Pj41XXw9MTI4PDwyNC1pJTMyLG5bMTQrKGkrNjQ+Pj45PDw0KV09ZS5mbG9vcihyLzQyOTQ5NjcyOTYpLG5bMTUrKGkrNjQ+Pj45PDw0KV09cix0LnNpZ0J5dGVzPTQqbi5sZW5ndGgsdGhpcy5fcHJvY2VzcygpLHRoaXMuX2hhc2h9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9by5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLl9oYXNoPXRoaXMuX2hhc2guY2xvbmUoKSxlfX0pO3QuU0hBMjU2PW8uX2NyZWF0ZUhlbHBlcihyKSx0LkhtYWNTSEEyNTY9by5fY3JlYXRlSG1hY0hlbHBlcihyKX0oTWF0aCksZnVuY3Rpb24oKXt2YXIgZT1uLHQ9ZS5lbmMuVXRmODtlLmFsZ28uSE1BQz1lLmxpYi5CYXNlLmV4dGVuZCh7aW5pdDpmdW5jdGlvbihlLG4pe2U9dGhpcy5faGFzaGVyPW5ldyBlLmluaXQsXCJzdHJpbmdcIj09dHlwZW9mIG4mJihuPXQucGFyc2UobikpO3ZhciByPWUuYmxvY2tTaXplLGk9NCpyO24uc2lnQnl0ZXM+aSYmKG49ZS5maW5hbGl6ZShuKSksbi5jbGFtcCgpO2Zvcih2YXIgbz10aGlzLl9vS2V5PW4uY2xvbmUoKSxzPXRoaXMuX2lLZXk9bi5jbG9uZSgpLGE9by53b3Jkcyx1PXMud29yZHMsYz0wO2M8cjtjKyspYVtjXV49MTU0OTU1NjgyOCx1W2NdXj05MDk1MjI0ODY7by5zaWdCeXRlcz1zLnNpZ0J5dGVzPWksdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe3ZhciBlPXRoaXMuX2hhc2hlcjtlLnJlc2V0KCksZS51cGRhdGUodGhpcy5faUtleSl9LHVwZGF0ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGFzaGVyLnVwZGF0ZShlKSx0aGlzfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLl9oYXNoZXI7cmV0dXJuIGU9dC5maW5hbGl6ZShlKSx0LnJlc2V0KCksdC5maW5hbGl6ZSh0aGlzLl9vS2V5LmNsb25lKCkuY29uY2F0KGUpKX19KX0oKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmxpYi5Xb3JkQXJyYXk7ZS5lbmMuQmFzZTY0PXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS53b3JkcyxuPWUuc2lnQnl0ZXMscj10aGlzLl9tYXA7ZS5jbGFtcCgpLGU9W107Zm9yKHZhciBpPTA7aTxuO2krPTMpZm9yKHZhciBvPSh0W2k+Pj4yXT4+PjI0LWklNCo4JjI1NSk8PDE2fCh0W2krMT4+PjJdPj4+MjQtKGkrMSklNCo4JjI1NSk8PDh8dFtpKzI+Pj4yXT4+PjI0LShpKzIpJTQqOCYyNTUscz0wOzQ+cyYmaSsuNzUqczxuO3MrKyllLnB1c2goci5jaGFyQXQobz4+PjYqKDMtcykmNjMpKTtpZih0PXIuY2hhckF0KDY0KSlmb3IoO2UubGVuZ3RoJTQ7KWUucHVzaCh0KTtyZXR1cm4gZS5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXt2YXIgbj1lLmxlbmd0aCxyPXRoaXMuX21hcCxpPXIuY2hhckF0KDY0KTtpJiYtMSE9KGk9ZS5pbmRleE9mKGkpKSYmKG49aSk7Zm9yKHZhciBpPVtdLG89MCxzPTA7czxuO3MrKylpZihzJTQpe3ZhciBhPXIuaW5kZXhPZihlLmNoYXJBdChzLTEpKTw8cyU0KjIsdT1yLmluZGV4T2YoZS5jaGFyQXQocykpPj4+Ni1zJTQqMjtpW28+Pj4yXXw9KGF8dSk8PDI0LW8lNCo4LG8rK31yZXR1cm4gdC5jcmVhdGUoaSxvKX0sX21hcDpcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCJ9fSgpLGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSx0LG4scixpLG8scyl7cmV0dXJuKChlPWUrKHQmbnx+dCZyKStpK3MpPDxvfGU+Pj4zMi1vKSt0fWZ1bmN0aW9uIHIoZSx0LG4scixpLG8scyl7cmV0dXJuKChlPWUrKHQmcnxuJn5yKStpK3MpPDxvfGU+Pj4zMi1vKSt0fWZ1bmN0aW9uIGkoZSx0LG4scixpLG8scyl7cmV0dXJuKChlPWUrKHRebl5yKStpK3MpPDxvfGU+Pj4zMi1vKSt0fWZ1bmN0aW9uIG8oZSx0LG4scixpLG8scyl7cmV0dXJuKChlPWUrKG5eKHR8fnIpKStpK3MpPDxvfGU+Pj4zMi1vKSt0fWZvcih2YXIgcz1uLGE9cy5saWIsdT1hLldvcmRBcnJheSxjPWEuSGFzaGVyLGE9cy5hbGdvLGw9W10saD0wOzY0Pmg7aCsrKWxbaF09NDI5NDk2NzI5NiplLmFicyhlLnNpbihoKzEpKXwwO2E9YS5NRDU9Yy5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7dGhpcy5faGFzaD1uZXcgdS5pbml0KFsxNzMyNTg0MTkzLDQwMjMyMzM0MTcsMjU2MjM4MzEwMiwyNzE3MzM4NzhdKX0sX2RvUHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsbil7Zm9yKHZhciBzPTA7MTY+cztzKyspe3ZhciBhPW4rcyx1PWVbYV07ZVthXT0xNjcxMTkzNSYodTw8OHx1Pj4+MjQpfDQyNzgyNTUzNjAmKHU8PDI0fHU+Pj44KX12YXIgcz10aGlzLl9oYXNoLndvcmRzLGE9ZVtuKzBdLHU9ZVtuKzFdLGM9ZVtuKzJdLGg9ZVtuKzNdLGY9ZVtuKzRdLGQ9ZVtuKzVdLHA9ZVtuKzZdLGc9ZVtuKzddLHk9ZVtuKzhdLHY9ZVtuKzldLGI9ZVtuKzEwXSxfPWVbbisxMV0sbT1lW24rMTJdLGs9ZVtuKzEzXSxQPWVbbisxNF0sUz1lW24rMTVdLHc9c1swXSxPPXNbMV0sVD1zWzJdLEM9c1szXSx3PXQodyxPLFQsQyxhLDcsbFswXSksQz10KEMsdyxPLFQsdSwxMixsWzFdKSxUPXQoVCxDLHcsTyxjLDE3LGxbMl0pLE89dChPLFQsQyx3LGgsMjIsbFszXSksdz10KHcsTyxULEMsZiw3LGxbNF0pLEM9dChDLHcsTyxULGQsMTIsbFs1XSksVD10KFQsQyx3LE8scCwxNyxsWzZdKSxPPXQoTyxULEMsdyxnLDIyLGxbN10pLHc9dCh3LE8sVCxDLHksNyxsWzhdKSxDPXQoQyx3LE8sVCx2LDEyLGxbOV0pLFQ9dChULEMsdyxPLGIsMTcsbFsxMF0pLE89dChPLFQsQyx3LF8sMjIsbFsxMV0pLHc9dCh3LE8sVCxDLG0sNyxsWzEyXSksQz10KEMsdyxPLFQsaywxMixsWzEzXSksVD10KFQsQyx3LE8sUCwxNyxsWzE0XSksTz10KE8sVCxDLHcsUywyMixsWzE1XSksdz1yKHcsTyxULEMsdSw1LGxbMTZdKSxDPXIoQyx3LE8sVCxwLDksbFsxN10pLFQ9cihULEMsdyxPLF8sMTQsbFsxOF0pLE89cihPLFQsQyx3LGEsMjAsbFsxOV0pLHc9cih3LE8sVCxDLGQsNSxsWzIwXSksQz1yKEMsdyxPLFQsYiw5LGxbMjFdKSxUPXIoVCxDLHcsTyxTLDE0LGxbMjJdKSxPPXIoTyxULEMsdyxmLDIwLGxbMjNdKSx3PXIodyxPLFQsQyx2LDUsbFsyNF0pLEM9cihDLHcsTyxULFAsOSxsWzI1XSksVD1yKFQsQyx3LE8saCwxNCxsWzI2XSksTz1yKE8sVCxDLHcseSwyMCxsWzI3XSksdz1yKHcsTyxULEMsayw1LGxbMjhdKSxDPXIoQyx3LE8sVCxjLDksbFsyOV0pLFQ9cihULEMsdyxPLGcsMTQsbFszMF0pLE89cihPLFQsQyx3LG0sMjAsbFszMV0pLHc9aSh3LE8sVCxDLGQsNCxsWzMyXSksQz1pKEMsdyxPLFQseSwxMSxsWzMzXSksVD1pKFQsQyx3LE8sXywxNixsWzM0XSksTz1pKE8sVCxDLHcsUCwyMyxsWzM1XSksdz1pKHcsTyxULEMsdSw0LGxbMzZdKSxDPWkoQyx3LE8sVCxmLDExLGxbMzddKSxUPWkoVCxDLHcsTyxnLDE2LGxbMzhdKSxPPWkoTyxULEMsdyxiLDIzLGxbMzldKSx3PWkodyxPLFQsQyxrLDQsbFs0MF0pLEM9aShDLHcsTyxULGEsMTEsbFs0MV0pLFQ9aShULEMsdyxPLGgsMTYsbFs0Ml0pLE89aShPLFQsQyx3LHAsMjMsbFs0M10pLHc9aSh3LE8sVCxDLHYsNCxsWzQ0XSksQz1pKEMsdyxPLFQsbSwxMSxsWzQ1XSksVD1pKFQsQyx3LE8sUywxNixsWzQ2XSksTz1pKE8sVCxDLHcsYywyMyxsWzQ3XSksdz1vKHcsTyxULEMsYSw2LGxbNDhdKSxDPW8oQyx3LE8sVCxnLDEwLGxbNDldKSxUPW8oVCxDLHcsTyxQLDE1LGxbNTBdKSxPPW8oTyxULEMsdyxkLDIxLGxbNTFdKSx3PW8odyxPLFQsQyxtLDYsbFs1Ml0pLEM9byhDLHcsTyxULGgsMTAsbFs1M10pLFQ9byhULEMsdyxPLGIsMTUsbFs1NF0pLE89byhPLFQsQyx3LHUsMjEsbFs1NV0pLHc9byh3LE8sVCxDLHksNixsWzU2XSksQz1vKEMsdyxPLFQsUywxMCxsWzU3XSksVD1vKFQsQyx3LE8scCwxNSxsWzU4XSksTz1vKE8sVCxDLHcsaywyMSxsWzU5XSksdz1vKHcsTyxULEMsZiw2LGxbNjBdKSxDPW8oQyx3LE8sVCxfLDEwLGxbNjFdKSxUPW8oVCxDLHcsTyxjLDE1LGxbNjJdKSxPPW8oTyxULEMsdyx2LDIxLGxbNjNdKTtzWzBdPXNbMF0rd3wwLHNbMV09c1sxXStPfDAsc1syXT1zWzJdK1R8MCxzWzNdPXNbM10rQ3wwfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2RhdGEsbj10LndvcmRzLHI9OCp0aGlzLl9uRGF0YUJ5dGVzLGk9OCp0LnNpZ0J5dGVzO25baT4+PjVdfD0xMjg8PDI0LWklMzI7dmFyIG89ZS5mbG9vcihyLzQyOTQ5NjcyOTYpO2ZvcihuWzE1KyhpKzY0Pj4+OTw8NCldPTE2NzExOTM1JihvPDw4fG8+Pj4yNCl8NDI3ODI1NTM2MCYobzw8MjR8bz4+PjgpLG5bMTQrKGkrNjQ+Pj45PDw0KV09MTY3MTE5MzUmKHI8PDh8cj4+PjI0KXw0Mjc4MjU1MzYwJihyPDwyNHxyPj4+OCksdC5zaWdCeXRlcz00KihuLmxlbmd0aCsxKSx0aGlzLl9wcm9jZXNzKCksdD10aGlzLl9oYXNoLG49dC53b3JkcyxyPTA7ND5yO3IrKylpPW5bcl0sbltyXT0xNjcxMTkzNSYoaTw8OHxpPj4+MjQpfDQyNzgyNTUzNjAmKGk8PDI0fGk+Pj44KTtyZXR1cm4gdH0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1jLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2hhc2g9dGhpcy5faGFzaC5jbG9uZSgpLGV9fSkscy5NRDU9Yy5fY3JlYXRlSGVscGVyKGEpLHMuSG1hY01ENT1jLl9jcmVhdGVIbWFjSGVscGVyKGEpfShNYXRoKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmxpYixyPXQuQmFzZSxpPXQuV29yZEFycmF5LHQ9ZS5hbGdvLG89dC5FdnBLREY9ci5leHRlbmQoe2NmZzpyLmV4dGVuZCh7a2V5U2l6ZTo0LGhhc2hlcjp0Lk1ENSxpdGVyYXRpb25zOjF9KSxpbml0OmZ1bmN0aW9uKGUpe3RoaXMuY2ZnPXRoaXMuY2ZnLmV4dGVuZChlKX0sY29tcHV0ZTpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj10aGlzLmNmZyxyPW4uaGFzaGVyLmNyZWF0ZSgpLG89aS5jcmVhdGUoKSxzPW8ud29yZHMsYT1uLmtleVNpemUsbj1uLml0ZXJhdGlvbnM7cy5sZW5ndGg8YTspe3UmJnIudXBkYXRlKHUpO3ZhciB1PXIudXBkYXRlKGUpLmZpbmFsaXplKHQpO3IucmVzZXQoKTtmb3IodmFyIGM9MTtjPG47YysrKXU9ci5maW5hbGl6ZSh1KSxyLnJlc2V0KCk7by5jb25jYXQodSl9cmV0dXJuIG8uc2lnQnl0ZXM9NCphLG99fSk7ZS5FdnBLREY9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBvLmNyZWF0ZShuKS5jb21wdXRlKGUsdCl9fSgpLG4ubGliLkNpcGhlcnx8ZnVuY3Rpb24oZSl7dmFyIHQ9bixyPXQubGliLGk9ci5CYXNlLG89ci5Xb3JkQXJyYXkscz1yLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0sYT10LmVuYy5CYXNlNjQsdT10LmFsZ28uRXZwS0RGLGM9ci5DaXBoZXI9cy5leHRlbmQoe2NmZzppLmV4dGVuZCgpLGNyZWF0ZUVuY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLmNyZWF0ZSh0aGlzLl9FTkNfWEZPUk1fTU9ERSxlLHQpfSxjcmVhdGVEZWNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5jcmVhdGUodGhpcy5fREVDX1hGT1JNX01PREUsZSx0KX0saW5pdDpmdW5jdGlvbihlLHQsbil7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKG4pLHRoaXMuX3hmb3JtTW9kZT1lLHRoaXMuX2tleT10LHRoaXMucmVzZXQoKX0scmVzZXQ6ZnVuY3Rpb24oKXtzLnJlc2V0LmNhbGwodGhpcyksdGhpcy5fZG9SZXNldCgpfSxwcm9jZXNzOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9hcHBlbmQoZSksdGhpcy5fcHJvY2VzcygpfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmdGhpcy5fYXBwZW5kKGUpLHRoaXMuX2RvRmluYWxpemUoKX0sa2V5U2l6ZTo0LGl2U2l6ZTo0LF9FTkNfWEZPUk1fTU9ERToxLF9ERUNfWEZPUk1fTU9ERToyLF9jcmVhdGVIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJue2VuY3J5cHQ6ZnVuY3Rpb24odCxuLHIpe3JldHVybihcInN0cmluZ1wiPT10eXBlb2Ygbj9nOnApLmVuY3J5cHQoZSx0LG4scil9LGRlY3J5cHQ6ZnVuY3Rpb24odCxuLHIpe3JldHVybihcInN0cmluZ1wiPT10eXBlb2Ygbj9nOnApLmRlY3J5cHQoZSx0LG4scil9fX19KTtyLlN0cmVhbUNpcGhlcj1jLmV4dGVuZCh7X2RvRmluYWxpemU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcHJvY2VzcyghMCl9LGJsb2NrU2l6ZToxfSk7dmFyIGw9dC5tb2RlPXt9LGg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRoaXMuX2l2O3I/dGhpcy5faXY9dm9pZCAwOnI9dGhpcy5fcHJldkJsb2NrO2Zvcih2YXIgaT0wO2k8bjtpKyspZVt0K2ldXj1yW2ldfSxmPShyLkJsb2NrQ2lwaGVyTW9kZT1pLmV4dGVuZCh7Y3JlYXRlRW5jcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuRW5jcnlwdG9yLmNyZWF0ZShlLHQpfSxjcmVhdGVEZWNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5EZWNyeXB0b3IuY3JlYXRlKGUsdCl9LGluaXQ6ZnVuY3Rpb24oZSx0KXt0aGlzLl9jaXBoZXI9ZSx0aGlzLl9pdj10fX0pKS5leHRlbmQoKTtmLkVuY3J5cHRvcj1mLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy5fY2lwaGVyLHI9bi5ibG9ja1NpemU7aC5jYWxsKHRoaXMsZSx0LHIpLG4uZW5jcnlwdEJsb2NrKGUsdCksdGhpcy5fcHJldkJsb2NrPWUuc2xpY2UodCx0K3IpfX0pLGYuRGVjcnlwdG9yPWYuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jaXBoZXIscj1uLmJsb2NrU2l6ZSxpPWUuc2xpY2UodCx0K3IpO24uZGVjcnlwdEJsb2NrKGUsdCksaC5jYWxsKHRoaXMsZSx0LHIpLHRoaXMuX3ByZXZCbG9jaz1pfX0pLGw9bC5DQkM9ZixmPSh0LnBhZD17fSkuUGtjczc9e3BhZDpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj00KnQsbj1uLWUuc2lnQnl0ZXMlbixyPW48PDI0fG48PDE2fG48PDh8bixpPVtdLHM9MDtzPG47cys9NClpLnB1c2gocik7bj1vLmNyZWF0ZShpLG4pLGUuY29uY2F0KG4pfSx1bnBhZDpmdW5jdGlvbihlKXtlLnNpZ0J5dGVzLT0yNTUmZS53b3Jkc1tlLnNpZ0J5dGVzLTE+Pj4yXX19LHIuQmxvY2tDaXBoZXI9Yy5leHRlbmQoe2NmZzpjLmNmZy5leHRlbmQoe21vZGU6bCxwYWRkaW5nOmZ9KSxyZXNldDpmdW5jdGlvbigpe2MucmVzZXQuY2FsbCh0aGlzKTt2YXIgZT10aGlzLmNmZyx0PWUuaXYsZT1lLm1vZGU7aWYodGhpcy5feGZvcm1Nb2RlPT10aGlzLl9FTkNfWEZPUk1fTU9ERSl2YXIgbj1lLmNyZWF0ZUVuY3J5cHRvcjtlbHNlIG49ZS5jcmVhdGVEZWNyeXB0b3IsdGhpcy5fbWluQnVmZmVyU2l6ZT0xO3RoaXMuX21vZGU9bi5jYWxsKGUsdGhpcyx0JiZ0LndvcmRzKX0sX2RvUHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fbW9kZS5wcm9jZXNzQmxvY2soZSx0KX0sX2RvRmluYWxpemU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmNmZy5wYWRkaW5nO2lmKHRoaXMuX3hmb3JtTW9kZT09dGhpcy5fRU5DX1hGT1JNX01PREUpe2UucGFkKHRoaXMuX2RhdGEsdGhpcy5ibG9ja1NpemUpO3ZhciB0PXRoaXMuX3Byb2Nlc3MoITApfWVsc2UgdD10aGlzLl9wcm9jZXNzKCEwKSxlLnVucGFkKHQpO3JldHVybiB0fSxibG9ja1NpemU6NH0pO3ZhciBkPXIuQ2lwaGVyUGFyYW1zPWkuZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUpe3RoaXMubWl4SW4oZSl9LHRvU3RyaW5nOmZ1bmN0aW9uKGUpe3JldHVybihlfHx0aGlzLmZvcm1hdHRlcikuc3RyaW5naWZ5KHRoaXMpfX0pLGw9KHQuZm9ybWF0PXt9KS5PcGVuU1NMPXtzdHJpbmdpZnk6ZnVuY3Rpb24oZSl7dmFyIHQ9ZS5jaXBoZXJ0ZXh0O3JldHVybiBlPWUuc2FsdCwoZT9vLmNyZWF0ZShbMTM5ODg5MzY4NCwxNzAxMDc2ODMxXSkuY29uY2F0KGUpLmNvbmNhdCh0KTp0KS50b1N0cmluZyhhKX0scGFyc2U6ZnVuY3Rpb24oZSl7ZT1hLnBhcnNlKGUpO3ZhciB0PWUud29yZHM7aWYoMTM5ODg5MzY4ND09dFswXSYmMTcwMTA3NjgzMT09dFsxXSl7dmFyIG49by5jcmVhdGUodC5zbGljZSgyLDQpKTt0LnNwbGljZSgwLDQpLGUuc2lnQnl0ZXMtPTE2fXJldHVybiBkLmNyZWF0ZSh7Y2lwaGVydGV4dDplLHNhbHQ6bn0pfX0scD1yLlNlcmlhbGl6YWJsZUNpcGhlcj1pLmV4dGVuZCh7Y2ZnOmkuZXh0ZW5kKHtmb3JtYXQ6bH0pLGVuY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cj10aGlzLmNmZy5leHRlbmQocik7dmFyIGk9ZS5jcmVhdGVFbmNyeXB0b3IobixyKTtyZXR1cm4gdD1pLmZpbmFsaXplKHQpLGk9aS5jZmcsZC5jcmVhdGUoe2NpcGhlcnRleHQ6dCxrZXk6bixpdjppLml2LGFsZ29yaXRobTplLG1vZGU6aS5tb2RlLHBhZGRpbmc6aS5wYWRkaW5nLGJsb2NrU2l6ZTplLmJsb2NrU2l6ZSxmb3JtYXR0ZXI6ci5mb3JtYXR9KX0sZGVjcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcj10aGlzLmNmZy5leHRlbmQociksdD10aGlzLl9wYXJzZSh0LHIuZm9ybWF0KSxlLmNyZWF0ZURlY3J5cHRvcihuLHIpLmZpbmFsaXplKHQuY2lwaGVydGV4dCl9LF9wYXJzZTpmdW5jdGlvbihlLHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlP3QucGFyc2UoZSx0aGlzKTplfX0pLHQ9KHQua2RmPXt9KS5PcGVuU1NMPXtleGVjdXRlOmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByfHwocj1vLnJhbmRvbSg4KSksZT11LmNyZWF0ZSh7a2V5U2l6ZTp0K259KS5jb21wdXRlKGUsciksbj1vLmNyZWF0ZShlLndvcmRzLnNsaWNlKHQpLDQqbiksZS5zaWdCeXRlcz00KnQsZC5jcmVhdGUoe2tleTplLGl2Om4sc2FsdDpyfSl9fSxnPXIuUGFzc3dvcmRCYXNlZENpcGhlcj1wLmV4dGVuZCh7Y2ZnOnAuY2ZnLmV4dGVuZCh7a2RmOnR9KSxlbmNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSxuPXIua2RmLmV4ZWN1dGUobixlLmtleVNpemUsZS5pdlNpemUpLHIuaXY9bi5pdixlPXAuZW5jcnlwdC5jYWxsKHRoaXMsZSx0LG4ua2V5LHIpLGUubWl4SW4obiksZX0sZGVjcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcj10aGlzLmNmZy5leHRlbmQociksdD10aGlzLl9wYXJzZSh0LHIuZm9ybWF0KSxuPXIua2RmLmV4ZWN1dGUobixlLmtleVNpemUsZS5pdlNpemUsdC5zYWx0KSxyLml2PW4uaXYscC5kZWNyeXB0LmNhbGwodGhpcyxlLHQsbi5rZXkscil9fSl9KCksZnVuY3Rpb24oKXtmb3IodmFyIGU9bix0PWUubGliLkJsb2NrQ2lwaGVyLHI9ZS5hbGdvLGk9W10sbz1bXSxzPVtdLGE9W10sdT1bXSxjPVtdLGw9W10saD1bXSxmPVtdLGQ9W10scD1bXSxnPTA7MjU2Pmc7ZysrKXBbZ109MTI4Pmc/Zzw8MTpnPDwxXjI4Mztmb3IodmFyIHk9MCx2PTAsZz0wOzI1Nj5nO2crKyl7dmFyIGI9dl52PDwxXnY8PDJedjw8M152PDw0LGI9Yj4+PjheMjU1JmJeOTk7aVt5XT1iLG9bYl09eTt2YXIgXz1wW3ldLG09cFtfXSxrPXBbbV0sUD0yNTcqcFtiXV4xNjg0MzAwOCpiO3NbeV09UDw8MjR8UD4+PjgsYVt5XT1QPDwxNnxQPj4+MTYsdVt5XT1QPDw4fFA+Pj4yNCxjW3ldPVAsUD0xNjg0MzAwOSprXjY1NTM3Km1eMjU3Kl9eMTY4NDMwMDgqeSxsW2JdPVA8PDI0fFA+Pj44LGhbYl09UDw8MTZ8UD4+PjE2LGZbYl09UDw8OHxQPj4+MjQsZFtiXT1QLHk/KHk9X15wW3BbcFtrXl9dXV0sdl49cFtwW3ZdXSk6eT12PTF9dmFyIFM9WzAsMSwyLDQsOCwxNiwzMiw2NCwxMjgsMjcsNTRdLHI9ci5BRVM9dC5leHRlbmQoe19kb1Jlc2V0OmZ1bmN0aW9uKCl7Zm9yKHZhciBlPXRoaXMuX2tleSx0PWUud29yZHMsbj1lLnNpZ0J5dGVzLzQsZT00KigodGhpcy5fblJvdW5kcz1uKzYpKzEpLHI9dGhpcy5fa2V5U2NoZWR1bGU9W10sbz0wO288ZTtvKyspaWYobzxuKXJbb109dFtvXTtlbHNle3ZhciBzPXJbby0xXTtvJW4/NjxuJiY0PT1vJW4mJihzPWlbcz4+PjI0XTw8MjR8aVtzPj4+MTYmMjU1XTw8MTZ8aVtzPj4+OCYyNTVdPDw4fGlbMjU1JnNdKToocz1zPDw4fHM+Pj4yNCxzPWlbcz4+PjI0XTw8MjR8aVtzPj4+MTYmMjU1XTw8MTZ8aVtzPj4+OCYyNTVdPDw4fGlbMjU1JnNdLHNePVNbby9ufDBdPDwyNCkscltvXT1yW28tbl1ec31mb3IodD10aGlzLl9pbnZLZXlTY2hlZHVsZT1bXSxuPTA7bjxlO24rKylvPWUtbixzPW4lND9yW29dOnJbby00XSx0W25dPTQ+bnx8ND49bz9zOmxbaVtzPj4+MjRdXV5oW2lbcz4+PjE2JjI1NV1dXmZbaVtzPj4+OCYyNTVdXV5kW2lbMjU1JnNdXX0sZW5jcnlwdEJsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fZG9DcnlwdEJsb2NrKGUsdCx0aGlzLl9rZXlTY2hlZHVsZSxzLGEsdSxjLGkpfSxkZWNyeXB0QmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj1lW3QrMV07ZVt0KzFdPWVbdCszXSxlW3QrM109bix0aGlzLl9kb0NyeXB0QmxvY2soZSx0LHRoaXMuX2ludktleVNjaGVkdWxlLGwsaCxmLGQsbyksbj1lW3QrMV0sZVt0KzFdPWVbdCszXSxlW3QrM109bn0sX2RvQ3J5cHRCbG9jazpmdW5jdGlvbihlLHQsbixyLGksbyxzLGEpe2Zvcih2YXIgdT10aGlzLl9uUm91bmRzLGM9ZVt0XV5uWzBdLGw9ZVt0KzFdXm5bMV0saD1lW3QrMl1eblsyXSxmPWVbdCszXV5uWzNdLGQ9NCxwPTE7cDx1O3ArKyl2YXIgZz1yW2M+Pj4yNF1eaVtsPj4+MTYmMjU1XV5vW2g+Pj44JjI1NV1ec1syNTUmZl1ebltkKytdLHk9cltsPj4+MjRdXmlbaD4+PjE2JjI1NV1eb1tmPj4+OCYyNTVdXnNbMjU1JmNdXm5bZCsrXSx2PXJbaD4+PjI0XV5pW2Y+Pj4xNiYyNTVdXm9bYz4+PjgmMjU1XV5zWzI1NSZsXV5uW2QrK10sZj1yW2Y+Pj4yNF1eaVtjPj4+MTYmMjU1XV5vW2w+Pj44JjI1NV1ec1syNTUmaF1ebltkKytdLGM9ZyxsPXksaD12O2c9KGFbYz4+PjI0XTw8MjR8YVtsPj4+MTYmMjU1XTw8MTZ8YVtoPj4+OCYyNTVdPDw4fGFbMjU1JmZdKV5uW2QrK10seT0oYVtsPj4+MjRdPDwyNHxhW2g+Pj4xNiYyNTVdPDwxNnxhW2Y+Pj44JjI1NV08PDh8YVsyNTUmY10pXm5bZCsrXSx2PShhW2g+Pj4yNF08PDI0fGFbZj4+PjE2JjI1NV08PDE2fGFbYz4+PjgmMjU1XTw8OHxhWzI1NSZsXSlebltkKytdLGY9KGFbZj4+PjI0XTw8MjR8YVtjPj4+MTYmMjU1XTw8MTZ8YVtsPj4+OCYyNTVdPDw4fGFbMjU1JmhdKV5uW2QrK10sZVt0XT1nLGVbdCsxXT15LGVbdCsyXT12LGVbdCszXT1mfSxrZXlTaXplOjh9KTtlLkFFUz10Ll9jcmVhdGVIZWxwZXIocil9KCksbi5tb2RlLkVDQj1mdW5jdGlvbigpe3ZhciBlPW4ubGliLkJsb2NrQ2lwaGVyTW9kZS5leHRlbmQoKTtyZXR1cm4gZS5FbmNyeXB0b3I9ZS5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3RoaXMuX2NpcGhlci5lbmNyeXB0QmxvY2soZSx0KX19KSxlLkRlY3J5cHRvcj1lLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fY2lwaGVyLmRlY3J5cHRCbG9jayhlLHQpfX0pLGV9KCksZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLHM9big5KSxhPShyKHMpLG4oNykpLHU9KHIoYSksbigxMikpLGM9KHIodSksbigxNCkpLGw9cihjKSxoPW4oMTcpLGY9cihoKSxkPShuKDgpLG4oMTMpKSxwPXIoZCksZz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC5zdWJzY3JpYmVFbmRwb2ludCxyPXQubGVhdmVFbmRwb2ludCxvPXQuaGVhcnRiZWF0RW5kcG9pbnQscz10LnNldFN0YXRlRW5kcG9pbnQsYT10LnRpbWVFbmRwb2ludCx1PXQuY29uZmlnLGM9dC5jcnlwdG8saD10Lmxpc3RlbmVyTWFuYWdlcjtpKHRoaXMsZSksdGhpcy5fbGlzdGVuZXJNYW5hZ2VyPWgsdGhpcy5fY29uZmlnPXUsdGhpcy5fbGVhdmVFbmRwb2ludD1yLHRoaXMuX2hlYXJ0YmVhdEVuZHBvaW50PW8sdGhpcy5fc2V0U3RhdGVFbmRwb2ludD1zLHRoaXMuX3N1YnNjcmliZUVuZHBvaW50PW4sdGhpcy5fY3J5cHRvPWMsdGhpcy5fY2hhbm5lbHM9e30sdGhpcy5fcHJlc2VuY2VDaGFubmVscz17fSx0aGlzLl9jaGFubmVsR3JvdXBzPXt9LHRoaXMuX3ByZXNlbmNlQ2hhbm5lbEdyb3Vwcz17fSx0aGlzLl9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnM9W10sdGhpcy5fcGVuZGluZ0NoYW5uZWxHcm91cFN1YnNjcmlwdGlvbnM9W10sdGhpcy5fY3VycmVudFRpbWV0b2tlbj0wLHRoaXMuX2xhc3RUaW1ldG9rZW49MCx0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCx0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITEsdGhpcy5faXNPbmxpbmU9ITAsdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlcj1uZXcgbC5kZWZhdWx0KHt0aW1lRW5kcG9pbnQ6YX0pfXJldHVybiBvKGUsW3trZXk6XCJhZGFwdFN0YXRlQ2hhbmdlXCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLHI9ZS5zdGF0ZSxpPWUuY2hhbm5lbHMsbz12b2lkIDA9PT1pP1tdOmkscz1lLmNoYW5uZWxHcm91cHMsYT12b2lkIDA9PT1zP1tdOnM7cmV0dXJuIG8uZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxzJiYobi5fY2hhbm5lbHNbZV0uc3RhdGU9cil9KSxhLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVsR3JvdXBzJiYobi5fY2hhbm5lbEdyb3Vwc1tlXS5zdGF0ZT1yKX0pLHRoaXMuX3NldFN0YXRlRW5kcG9pbnQoe3N0YXRlOnIsY2hhbm5lbHM6byxjaGFubmVsR3JvdXBzOmF9LHQpfX0se2tleTpcImFkYXB0U3Vic2NyaWJlQ2hhbmdlXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxuPWUudGltZXRva2VuLHI9ZS5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPWUuY2hhbm5lbEdyb3VwcyxzPXZvaWQgMD09PW8/W106byxhPWUud2l0aFByZXNlbmNlLHU9dm9pZCAwIT09YSYmYTtpZighdGhpcy5fY29uZmlnLnN1YnNjcmliZUtleXx8XCJcIj09PXRoaXMuX2NvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuIHZvaWQoY29uc29sZSYmY29uc29sZS5sb2cmJmNvbnNvbGUubG9nKFwic3Vic2NyaWJlIGtleSBtaXNzaW5nOyBhYm9ydGluZyBzdWJzY3JpYmVcIikpO24mJih0aGlzLl9sYXN0VGltZXRva2VuPXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sdGhpcy5fY3VycmVudFRpbWV0b2tlbj1uKSxcIjBcIiE9PXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4mJih0aGlzLl9zdG9yZWRUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPTApLGkuZm9yRWFjaChmdW5jdGlvbihlKXt0Ll9jaGFubmVsc1tlXT17c3RhdGU6e319LHUmJih0Ll9wcmVzZW5jZUNoYW5uZWxzW2VdPXt9KSx0Ll9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnMucHVzaChlKX0pLHMuZm9yRWFjaChmdW5jdGlvbihlKXt0Ll9jaGFubmVsR3JvdXBzW2VdPXtzdGF0ZTp7fX0sdSYmKHQuX3ByZXNlbmNlQ2hhbm5lbEdyb3Vwc1tlXT17fSksdC5fcGVuZGluZ0NoYW5uZWxHcm91cFN1YnNjcmlwdGlvbnMucHVzaChlKX0pLHRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMSx0aGlzLnJlY29ubmVjdCgpfX0se2tleTpcImFkYXB0VW5zdWJzY3JpYmVDaGFuZ2VcIixcbnZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcyxyPWUuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIsbz1lLmNoYW5uZWxHcm91cHMscz12b2lkIDA9PT1vP1tdOm87aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UgaW4gbi5fY2hhbm5lbHMmJmRlbGV0ZSBuLl9jaGFubmVsc1tlXSxlIGluIG4uX3ByZXNlbmNlQ2hhbm5lbHMmJmRlbGV0ZSBuLl9wcmVzZW5jZUNoYW5uZWxzW2VdfSkscy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UgaW4gbi5fY2hhbm5lbEdyb3VwcyYmZGVsZXRlIG4uX2NoYW5uZWxHcm91cHNbZV0sZSBpbiBuLl9wcmVzZW5jZUNoYW5uZWxHcm91cHMmJmRlbGV0ZSBuLl9jaGFubmVsR3JvdXBzW2VdfSksITEhPT10aGlzLl9jb25maWcuc3VwcHJlc3NMZWF2ZUV2ZW50c3x8dHx8dGhpcy5fbGVhdmVFbmRwb2ludCh7Y2hhbm5lbHM6aSxjaGFubmVsR3JvdXBzOnN9LGZ1bmN0aW9uKGUpe2UuYWZmZWN0ZWRDaGFubmVscz1pLGUuYWZmZWN0ZWRDaGFubmVsR3JvdXBzPXMsZS5jdXJyZW50VGltZXRva2VuPW4uX2N1cnJlbnRUaW1ldG9rZW4sZS5sYXN0VGltZXRva2VuPW4uX2xhc3RUaW1ldG9rZW4sbi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpfSksMD09PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9jaGFubmVsR3JvdXBzKS5sZW5ndGgmJjA9PT1PYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxHcm91cHMpLmxlbmd0aCYmKHRoaXMuX2xhc3RUaW1ldG9rZW49MCx0aGlzLl9jdXJyZW50VGltZXRva2VuPTAsdGhpcy5fc3RvcmVkVGltZXRva2VuPW51bGwsdGhpcy5fcmVnaW9uPW51bGwsdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdG9wUG9sbGluZygpKSx0aGlzLnJlY29ubmVjdCgpfX0se2tleTpcInVuc3Vic2NyaWJlQWxsXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5hZGFwdFVuc3Vic2NyaWJlQ2hhbmdlKHtjaGFubmVsczp0aGlzLmdldFN1YnNjcmliZWRDaGFubmVscygpLGNoYW5uZWxHcm91cHM6dGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3VwcygpfSxlKX19LHtrZXk6XCJnZXRTdWJzY3JpYmVkQ2hhbm5lbHNcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscyl9fSx7a2V5OlwiZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHNcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiBPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVsR3JvdXBzKX19LHtrZXk6XCJyZWNvbm5lY3RcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0YXJ0U3Vic2NyaWJlTG9vcCgpLHRoaXMuX3JlZ2lzdGVySGVhcnRiZWF0VGltZXIoKX19LHtrZXk6XCJkaXNjb25uZWN0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdG9wU3Vic2NyaWJlTG9vcCgpLHRoaXMuX3N0b3BIZWFydGJlYXRUaW1lcigpLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIuc3RvcFBvbGxpbmcoKX19LHtrZXk6XCJfcmVnaXN0ZXJIZWFydGJlYXRUaW1lclwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RvcEhlYXJ0YmVhdFRpbWVyKCksdGhpcy5fcGVyZm9ybUhlYXJ0YmVhdExvb3AoKSx0aGlzLl9oZWFydGJlYXRUaW1lcj1zZXRJbnRlcnZhbCh0aGlzLl9wZXJmb3JtSGVhcnRiZWF0TG9vcC5iaW5kKHRoaXMpLDFlMyp0aGlzLl9jb25maWcuZ2V0SGVhcnRiZWF0SW50ZXJ2YWwoKSl9fSx7a2V5OlwiX3N0b3BIZWFydGJlYXRUaW1lclwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5faGVhcnRiZWF0VGltZXImJihjbGVhckludGVydmFsKHRoaXMuX2hlYXJ0YmVhdFRpbWVyKSx0aGlzLl9oZWFydGJlYXRUaW1lcj1udWxsKX19LHtrZXk6XCJfcGVyZm9ybUhlYXJ0YmVhdExvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMsdD1PYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscyksbj1PYmplY3Qua2V5cyh0aGlzLl9jaGFubmVsR3JvdXBzKSxyPXt9O2lmKDAhPT10Lmxlbmd0aHx8MCE9PW4ubGVuZ3RoKXt0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIG49ZS5fY2hhbm5lbHNbdF0uc3RhdGU7T2JqZWN0LmtleXMobikubGVuZ3RoJiYoclt0XT1uKX0pLG4uZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgbj1lLl9jaGFubmVsR3JvdXBzW3RdLnN0YXRlO09iamVjdC5rZXlzKG4pLmxlbmd0aCYmKHJbdF09bil9KTt2YXIgaT1mdW5jdGlvbih0KXt0LmVycm9yJiZlLl9jb25maWcuYW5ub3VuY2VGYWlsZWRIZWFydGJlYXRzJiZlLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXModCksdC5lcnJvciYmZS5fY29uZmlnLmF1dG9OZXR3b3JrRGV0ZWN0aW9uJiZlLl9pc09ubGluZSYmKGUuX2lzT25saW5lPSExLGUuZGlzY29ubmVjdCgpLGUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtEb3duKCksZS5yZWNvbm5lY3QoKSksIXQuZXJyb3ImJmUuX2NvbmZpZy5hbm5vdW5jZVN1Y2Nlc3NmdWxIZWFydGJlYXRzJiZlLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXModCl9O3RoaXMuX2hlYXJ0YmVhdEVuZHBvaW50KHtjaGFubmVsczp0LGNoYW5uZWxHcm91cHM6bixzdGF0ZTpyfSxpLmJpbmQodGhpcykpfX19LHtrZXk6XCJfc3RhcnRTdWJzY3JpYmVMb29wXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdG9wU3Vic2NyaWJlTG9vcCgpO3ZhciBlPVtdLHQ9W107aWYoT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpLmZvckVhY2goZnVuY3Rpb24odCl7cmV0dXJuIGUucHVzaCh0KX0pLE9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbHMpLmZvckVhY2goZnVuY3Rpb24odCl7cmV0dXJuIGUucHVzaCh0K1wiLXBucHJlc1wiKX0pLE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLmZvckVhY2goZnVuY3Rpb24oZSl7cmV0dXJuIHQucHVzaChlKX0pLE9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbEdyb3VwcykuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUrXCItcG5wcmVzXCIpfSksMCE9PWUubGVuZ3RofHwwIT09dC5sZW5ndGgpe3ZhciBuPXtjaGFubmVsczplLGNoYW5uZWxHcm91cHM6dCx0aW1ldG9rZW46dGhpcy5fY3VycmVudFRpbWV0b2tlbixmaWx0ZXJFeHByZXNzaW9uOnRoaXMuX2NvbmZpZy5maWx0ZXJFeHByZXNzaW9uLHJlZ2lvbjp0aGlzLl9yZWdpb259O3RoaXMuX3N1YnNjcmliZUNhbGw9dGhpcy5fc3Vic2NyaWJlRW5kcG9pbnQobix0aGlzLl9wcm9jZXNzU3Vic2NyaWJlUmVzcG9uc2UuYmluZCh0aGlzKSl9fX0se2tleTpcIl9wcm9jZXNzU3Vic2NyaWJlUmVzcG9uc2VcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXM7aWYoZS5lcnJvcilyZXR1cm4gdm9pZChlLmNhdGVnb3J5PT09cC5kZWZhdWx0LlBOVGltZW91dENhdGVnb3J5P3RoaXMuX3N0YXJ0U3Vic2NyaWJlTG9vcCgpOmUuY2F0ZWdvcnk9PT1wLmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk/KHRoaXMuZGlzY29ubmVjdCgpLGUuZXJyb3ImJnRoaXMuX2NvbmZpZy5hdXRvTmV0d29ya0RldGVjdGlvbiYmdGhpcy5faXNPbmxpbmUmJih0aGlzLl9pc09ubGluZT0hMSx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrRG93bigpKSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLm9uUmVjb25uZWN0aW9uKGZ1bmN0aW9uKCl7bi5fY29uZmlnLmF1dG9OZXR3b3JrRGV0ZWN0aW9uJiYhbi5faXNPbmxpbmUmJihuLl9pc09ubGluZT0hMCxuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrVXAoKSksbi5yZWNvbm5lY3QoKSxuLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITA7dmFyIHQ9e2NhdGVnb3J5OnAuZGVmYXVsdC5QTlJlY29ubmVjdGVkQ2F0ZWdvcnksb3BlcmF0aW9uOmUub3BlcmF0aW9uLGxhc3RUaW1ldG9rZW46bi5fbGFzdFRpbWV0b2tlbixjdXJyZW50VGltZXRva2VuOm4uX2N1cnJlbnRUaW1ldG9rZW59O24uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KX0pLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIuc3RhcnRQb2xsaW5nKCksdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpKTplLmNhdGVnb3J5PT09cC5kZWZhdWx0LlBOQmFkUmVxdWVzdENhdGVnb3J5Pyh0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSkpOnRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKSk7aWYodGhpcy5fc3RvcmVkVGltZXRva2VuPyh0aGlzLl9jdXJyZW50VGltZXRva2VuPXRoaXMuX3N0b3JlZFRpbWV0b2tlbix0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCk6KHRoaXMuX2xhc3RUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPXQubWV0YWRhdGEudGltZXRva2VuKSwhdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkKXt2YXIgcj17fTtyLmNhdGVnb3J5PXAuZGVmYXVsdC5QTkNvbm5lY3RlZENhdGVnb3J5LHIub3BlcmF0aW9uPWUub3BlcmF0aW9uLHIuYWZmZWN0ZWRDaGFubmVscz10aGlzLl9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnMsci5zdWJzY3JpYmVkQ2hhbm5lbHM9dGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbHMoKSxyLmFmZmVjdGVkQ2hhbm5lbEdyb3Vwcz10aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucyxyLmxhc3RUaW1ldG9rZW49dGhpcy5fbGFzdFRpbWV0b2tlbixyLmN1cnJlbnRUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITAsdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHIpLHRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucz1bXX12YXIgaT10Lm1lc3NhZ2VzfHxbXSxvPXRoaXMuX2NvbmZpZy5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkO2lmKG8mJmkubGVuZ3RoPj1vKXt2YXIgcz17fTtzLmNhdGVnb3J5PXAuZGVmYXVsdC5QTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5LHMub3BlcmF0aW9uPWUub3BlcmF0aW9uLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhzKX1pLmZvckVhY2goZnVuY3Rpb24oZSl7dmFyIHQ9ZS5jaGFubmVsLHI9ZS5zdWJzY3JpcHRpb25NYXRjaCxpPWUucHVibGlzaE1ldGFEYXRhO2lmKHQ9PT1yJiYocj1udWxsKSxmLmRlZmF1bHQuZW5kc1dpdGgoZS5jaGFubmVsLFwiLXBucHJlc1wiKSl7dmFyIG89e307by5jaGFubmVsPW51bGwsby5zdWJzY3JpcHRpb249bnVsbCxvLmFjdHVhbENoYW5uZWw9bnVsbCE9cj90Om51bGwsby5zdWJzY3JpYmVkQ2hhbm5lbD1udWxsIT1yP3I6dCx0JiYoby5jaGFubmVsPXQuc3Vic3RyaW5nKDAsdC5sYXN0SW5kZXhPZihcIi1wbnByZXNcIikpKSxyJiYoby5zdWJzY3JpcHRpb249ci5zdWJzdHJpbmcoMCxyLmxhc3RJbmRleE9mKFwiLXBucHJlc1wiKSkpLG8uYWN0aW9uPWUucGF5bG9hZC5hY3Rpb24sby5zdGF0ZT1lLnBheWxvYWQuZGF0YSxvLnRpbWV0b2tlbj1pLnB1Ymxpc2hUaW1ldG9rZW4sby5vY2N1cGFuY3k9ZS5wYXlsb2FkLm9jY3VwYW5jeSxvLnV1aWQ9ZS5wYXlsb2FkLnV1aWQsby50aW1lc3RhbXA9ZS5wYXlsb2FkLnRpbWVzdGFtcCxlLnBheWxvYWQuam9pbiYmKG8uam9pbj1lLnBheWxvYWQuam9pbiksZS5wYXlsb2FkLmxlYXZlJiYoby5sZWF2ZT1lLnBheWxvYWQubGVhdmUpLGUucGF5bG9hZC50aW1lb3V0JiYoby50aW1lb3V0PWUucGF5bG9hZC50aW1lb3V0KSxuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VQcmVzZW5jZShvKX1lbHNle3ZhciBzPXt9O3MuY2hhbm5lbD1udWxsLHMuc3Vic2NyaXB0aW9uPW51bGwscy5hY3R1YWxDaGFubmVsPW51bGwhPXI/dDpudWxsLHMuc3Vic2NyaWJlZENoYW5uZWw9bnVsbCE9cj9yOnQscy5jaGFubmVsPXQscy5zdWJzY3JpcHRpb249cixzLnRpbWV0b2tlbj1pLnB1Ymxpc2hUaW1ldG9rZW4scy5wdWJsaXNoZXI9ZS5pc3N1aW5nQ2xpZW50SWQsZS51c2VyTWV0YWRhdGEmJihzLnVzZXJNZXRhZGF0YT1lLnVzZXJNZXRhZGF0YSksbi5fY29uZmlnLmNpcGhlcktleT9zLm1lc3NhZ2U9bi5fY3J5cHRvLmRlY3J5cHQoZS5wYXlsb2FkKTpzLm1lc3NhZ2U9ZS5wYXlsb2FkLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU1lc3NhZ2Uocyl9fSksdGhpcy5fcmVnaW9uPXQubWV0YWRhdGEucmVnaW9uLHRoaXMuX3N0YXJ0U3Vic2NyaWJlTG9vcCgpfX0se2tleTpcIl9zdG9wU3Vic2NyaWJlTG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3Vic2NyaWJlQ2FsbCYmKHRoaXMuX3N1YnNjcmliZUNhbGwuYWJvcnQoKSx0aGlzLl9zdWJzY3JpYmVDYWxsPW51bGwpfX1dKSxlfSgpO3QuZGVmYXVsdD1nLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89KG4oOCksbigxMykpLHM9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShvKSxhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSgpe3IodGhpcyxlKSx0aGlzLl9saXN0ZW5lcnM9W119cmV0dXJuIGkoZSxbe2tleTpcImFkZExpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fbGlzdGVuZXJzLnB1c2goZSl9fSx7a2V5OlwicmVtb3ZlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1bXTt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihuKXtuIT09ZSYmdC5wdXNoKG4pfSksdGhpcy5fbGlzdGVuZXJzPXR9fSx7a2V5OlwicmVtb3ZlQWxsTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lcnM9W119fSx7a2V5OlwiYW5ub3VuY2VQcmVzZW5jZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QucHJlc2VuY2UmJnQucHJlc2VuY2UoZSl9KX19LHtrZXk6XCJhbm5vdW5jZVN0YXR1c1wiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3Quc3RhdHVzJiZ0LnN0YXR1cyhlKX0pfX0se2tleTpcImFubm91bmNlTWVzc2FnZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QubWVzc2FnZSYmdC5tZXNzYWdlKGUpfSl9fSx7a2V5OlwiYW5ub3VuY2VOZXR3b3JrVXBcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXt9O2UuY2F0ZWdvcnk9cy5kZWZhdWx0LlBOTmV0d29ya1VwQ2F0ZWdvcnksdGhpcy5hbm5vdW5jZVN0YXR1cyhlKX19LHtrZXk6XCJhbm5vdW5jZU5ldHdvcmtEb3duXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT17fTtlLmNhdGVnb3J5PXMuZGVmYXVsdC5QTk5ldHdvcmtEb3duQ2F0ZWdvcnksdGhpcy5hbm5vdW5jZVN0YXR1cyhlKX19XSksZX0oKTt0LmRlZmF1bHQ9YSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD17UE5OZXR3b3JrVXBDYXRlZ29yeTpcIlBOTmV0d29ya1VwQ2F0ZWdvcnlcIixQTk5ldHdvcmtEb3duQ2F0ZWdvcnk6XCJQTk5ldHdvcmtEb3duQ2F0ZWdvcnlcIixQTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTpcIlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5XCIsUE5UaW1lb3V0Q2F0ZWdvcnk6XCJQTlRpbWVvdXRDYXRlZ29yeVwiLFBOQmFkUmVxdWVzdENhdGVnb3J5OlwiUE5CYWRSZXF1ZXN0Q2F0ZWdvcnlcIixQTkFjY2Vzc0RlbmllZENhdGVnb3J5OlwiUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeVwiLFBOVW5rbm93bkNhdGVnb3J5OlwiUE5Vbmtub3duQ2F0ZWdvcnlcIixQTlJlY29ubmVjdGVkQ2F0ZWdvcnk6XCJQTlJlY29ubmVjdGVkQ2F0ZWdvcnlcIixQTkNvbm5lY3RlZENhdGVnb3J5OlwiUE5Db25uZWN0ZWRDYXRlZ29yeVwiLFBOUmVxdWVzdE1lc3NhZ2VDb3VudEV4Y2VlZGVkQ2F0ZWdvcnk6XCJQTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5XCJ9LGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89bigxNSkscz0oZnVuY3Rpb24oZSl7ZSYmZS5fX2VzTW9kdWxlfShvKSxuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LnRpbWVFbmRwb2ludDtyKHRoaXMsZSksdGhpcy5fdGltZUVuZHBvaW50PW59cmV0dXJuIGkoZSxbe2tleTpcIm9uUmVjb25uZWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fcmVjb25uZWN0aW9uQ2FsbGJhY2s9ZX19LHtrZXk6XCJzdGFydFBvbGxpbmdcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3RpbWVUaW1lcj1zZXRJbnRlcnZhbCh0aGlzLl9wZXJmb3JtVGltZUxvb3AuYmluZCh0aGlzKSwzZTMpfX0se2tleTpcInN0b3BQb2xsaW5nXCIsdmFsdWU6ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKHRoaXMuX3RpbWVUaW1lcil9fSx7a2V5OlwiX3BlcmZvcm1UaW1lTG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLl90aW1lRW5kcG9pbnQoZnVuY3Rpb24odCl7dC5lcnJvcnx8KGNsZWFySW50ZXJ2YWwoZS5fdGltZVRpbWVyKSxlLl9yZWNvbm5lY3Rpb25DYWxsYmFjaygpKX0pfX1dKSxlfSgpKTt0LmRlZmF1bHQ9cyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5UaW1lT3BlcmF0aW9ufWZ1bmN0aW9uIGkoKXtyZXR1cm5cIi90aW1lLzBcIn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBzKCl7cmV0dXJue319ZnVuY3Rpb24gYSgpe3JldHVybiExfWZ1bmN0aW9uIHUoZSx0KXtyZXR1cm57dGltZXRva2VuOnRbMF19fWZ1bmN0aW9uIGMoKXt9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LmdldFVSTD1pLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LnByZXBhcmVQYXJhbXM9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQuaGFuZGxlUmVzcG9uc2U9dSx0LnZhbGlkYXRlUGFyYW1zPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9e1BOVGltZU9wZXJhdGlvbjpcIlBOVGltZU9wZXJhdGlvblwiLFBOSGlzdG9yeU9wZXJhdGlvbjpcIlBOSGlzdG9yeU9wZXJhdGlvblwiLFBORmV0Y2hNZXNzYWdlc09wZXJhdGlvbjpcIlBORmV0Y2hNZXNzYWdlc09wZXJhdGlvblwiLFBOU3Vic2NyaWJlT3BlcmF0aW9uOlwiUE5TdWJzY3JpYmVPcGVyYXRpb25cIixQTlVuc3Vic2NyaWJlT3BlcmF0aW9uOlwiUE5VbnN1YnNjcmliZU9wZXJhdGlvblwiLFBOUHVibGlzaE9wZXJhdGlvbjpcIlBOUHVibGlzaE9wZXJhdGlvblwiLFBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbjpcIlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvblwiLFBOUmVtb3ZlQWxsUHVzaE5vdGlmaWNhdGlvbnNPcGVyYXRpb246XCJQTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9uXCIsUE5XaGVyZU5vd09wZXJhdGlvbjpcIlBOV2hlcmVOb3dPcGVyYXRpb25cIixQTlNldFN0YXRlT3BlcmF0aW9uOlwiUE5TZXRTdGF0ZU9wZXJhdGlvblwiLFBOSGVyZU5vd09wZXJhdGlvbjpcIlBOSGVyZU5vd09wZXJhdGlvblwiLFBOR2V0U3RhdGVPcGVyYXRpb246XCJQTkdldFN0YXRlT3BlcmF0aW9uXCIsUE5IZWFydGJlYXRPcGVyYXRpb246XCJQTkhlYXJ0YmVhdE9wZXJhdGlvblwiLFBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvbjpcIlBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvblwiLFBOUmVtb3ZlR3JvdXBPcGVyYXRpb246XCJQTlJlbW92ZUdyb3VwT3BlcmF0aW9uXCIsUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9uOlwiUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9uXCIsUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb246XCJQTkFkZENoYW5uZWxzVG9Hcm91cE9wZXJhdGlvblwiLFBOUmVtb3ZlQ2hhbm5lbHNGcm9tR3JvdXBPcGVyYXRpb246XCJQTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9uXCIsUE5BY2Nlc3NNYW5hZ2VyR3JhbnQ6XCJQTkFjY2Vzc01hbmFnZXJHcmFudFwiLFBOQWNjZXNzTWFuYWdlckF1ZGl0OlwiUE5BY2Nlc3NNYW5hZ2VyQXVkaXRcIn0sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe3ZhciB0PVtdO3JldHVybiBPYmplY3Qua2V5cyhlKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZSl9KSx0fWZ1bmN0aW9uIHIoZSl7cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChlKS5yZXBsYWNlKC9bIX4qJygpXS9nLGZ1bmN0aW9uKGUpe3JldHVyblwiJVwiK2UuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX0pfWZ1bmN0aW9uIGkoZSl7cmV0dXJuIG4oZSkuc29ydCgpfWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGkoZSkubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0K1wiPVwiK3IoZVt0XSl9KS5qb2luKFwiJlwiKX1mdW5jdGlvbiBzKGUsdCl7cmV0dXJuLTEhPT1lLmluZGV4T2YodCx0aGlzLmxlbmd0aC10Lmxlbmd0aCl9ZnVuY3Rpb24gYSgpe3ZhciBlPXZvaWQgMCx0PXZvaWQgMDtyZXR1cm57cHJvbWlzZTpuZXcgUHJvbWlzZShmdW5jdGlvbihuLHIpe2U9bix0PXJ9KSxyZWplY3Q6dCxmdWxmaWxsOmV9fWUuZXhwb3J0cz17c2lnblBhbUZyb21QYXJhbXM6byxlbmRzV2l0aDpzLGNyZWF0ZVByb21pc2U6YSxlbmNvZGVTdHJpbmc6cn19LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBvKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gcyhlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfWZ1bmN0aW9uIGEoZSx0KXtyZXR1cm4gZS50eXBlPXQsZS5lcnJvcj0hMCxlfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGEoe21lc3NhZ2U6ZX0sXCJ2YWxpZGF0aW9uRXJyb3JcIil9ZnVuY3Rpb24gYyhlLHQsbil7cmV0dXJuIGUudXNlUG9zdCYmZS51c2VQb3N0KHQsbik/ZS5wb3N0VVJMKHQsbik6ZS5nZXRVUkwodCxuKX1mdW5jdGlvbiBsKGUpe3ZhciB0PVwiUHViTnViLUpTLVwiK2Uuc2RrRmFtaWx5O3JldHVybiBlLnBhcnRuZXJJZCYmKHQrPVwiLVwiK2UucGFydG5lcklkKSx0Kz1cIi9cIitlLmdldFZlcnNpb24oKX1mdW5jdGlvbiBoKGUsdCxuKXt2YXIgcj1lLmNvbmZpZyxpPWUuY3J5cHRvO24udGltZXN0YW1wPU1hdGguZmxvb3IoKG5ldyBEYXRlKS5nZXRUaW1lKCkvMWUzKTt2YXIgbz1yLnN1YnNjcmliZUtleStcIlxcblwiK3IucHVibGlzaEtleStcIlxcblwiK3QrXCJcXG5cIjtvKz1nLmRlZmF1bHQuc2lnblBhbUZyb21QYXJhbXMobik7dmFyIHM9aS5ITUFDU0hBMjU2KG8pO3M9cy5yZXBsYWNlKC9cXCsvZyxcIi1cIikscz1zLnJlcGxhY2UoL1xcLy9nLFwiX1wiKSxuLnNpZ25hdHVyZT1zfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD1mdW5jdGlvbihlLHQpe3ZhciBuPWUubmV0d29ya2luZyxyPWUuY29uZmlnLGk9bnVsbCxvPW51bGwscz17fTt0LmdldE9wZXJhdGlvbigpPT09Yi5kZWZhdWx0LlBOVGltZU9wZXJhdGlvbnx8dC5nZXRPcGVyYXRpb24oKT09PWIuZGVmYXVsdC5QTkNoYW5uZWxHcm91cHNPcGVyYXRpb24/aT1hcmd1bWVudHMubGVuZ3RoPD0yP3ZvaWQgMDphcmd1bWVudHNbMl06KHM9YXJndW1lbnRzLmxlbmd0aDw9Mj92b2lkIDA6YXJndW1lbnRzWzJdLGk9YXJndW1lbnRzLmxlbmd0aDw9Mz92b2lkIDA6YXJndW1lbnRzWzNdKSxcInVuZGVmaW5lZFwiPT10eXBlb2YgUHJvbWlzZXx8aXx8KG89Zy5kZWZhdWx0LmNyZWF0ZVByb21pc2UoKSk7dmFyIGE9dC52YWxpZGF0ZVBhcmFtcyhlLHMpO2lmKCFhKXt2YXIgZj10LnByZXBhcmVQYXJhbXMoZSxzKSxwPWModCxlLHMpLHk9dm9pZCAwLHY9e3VybDpwLG9wZXJhdGlvbjp0LmdldE9wZXJhdGlvbigpLHRpbWVvdXQ6dC5nZXRSZXF1ZXN0VGltZW91dChlKX07Zi51dWlkPXIuVVVJRCxmLnBuc2RrPWwociksci51c2VJbnN0YW5jZUlkJiYoZi5pbnN0YW5jZWlkPXIuaW5zdGFuY2VJZCksci51c2VSZXF1ZXN0SWQmJihmLnJlcXVlc3RpZD1kLmRlZmF1bHQudjQoKSksdC5pc0F1dGhTdXBwb3J0ZWQoKSYmci5nZXRBdXRoS2V5KCkmJihmLmF1dGg9ci5nZXRBdXRoS2V5KCkpLHIuc2VjcmV0S2V5JiZoKGUscCxmKTt2YXIgbT1mdW5jdGlvbihuLHIpe2lmKG4uZXJyb3IpcmV0dXJuIHZvaWQoaT9pKG4pOm8mJm8ucmVqZWN0KG5ldyBfKFwiUHViTnViIGNhbGwgZmFpbGVkLCBjaGVjayBzdGF0dXMgZm9yIGRldGFpbHNcIixuKSkpO3ZhciBhPXQuaGFuZGxlUmVzcG9uc2UoZSxyLHMpO2k/aShuLGEpOm8mJm8uZnVsZmlsbChhKX07aWYodC51c2VQb3N0JiZ0LnVzZVBvc3QoZSxzKSl7dmFyIGs9dC5wb3N0UGF5bG9hZChlLHMpO3k9bi5QT1NUKGYsayx2LG0pfWVsc2UgeT1uLkdFVChmLHYsbSk7cmV0dXJuIHQuZ2V0T3BlcmF0aW9uKCk9PT1iLmRlZmF1bHQuUE5TdWJzY3JpYmVPcGVyYXRpb24/eTpvP28ucHJvbWlzZTp2b2lkIDB9cmV0dXJuIGk/aSh1KGEpKTpvPyhvLnJlamVjdChuZXcgXyhcIlZhbGlkYXRpb24gZmFpbGVkLCBjaGVjayBzdGF0dXMgZm9yIGRldGFpbHNcIix1KGEpKSksby5wcm9taXNlKTp2b2lkIDB9O3ZhciBmPW4oMiksZD1yKGYpLHA9KG4oOCksbigxNykpLGc9cihwKSx5PW4oNyksdj0ocih5KSxuKDE2KSksYj1yKHYpLF89ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlLG4pe2kodGhpcyx0KTt2YXIgcj1vKHRoaXMsKHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwodGhpcyxlKSk7cmV0dXJuIHIubmFtZT1yLmNvbnN0cnVjdG9yLm5hbWUsci5zdGF0dXM9bixyLm1lc3NhZ2U9ZSxyfXJldHVybiBzKHQsZSksdH0oRXJyb3IpO2UuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkFkZENoYW5uZWxzVG9Hcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXQuY2hhbm5lbEdyb3VwLGk9ZS5jb25maWc7cmV0dXJuIHI/biYmMCE9PW4ubGVuZ3RoP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbHM7cmV0dXJue2FkZDoodm9pZCAwPT09bj9bXTpuKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9dC5jaGFubmVsR3JvdXAsaT1lLmNvbmZpZztyZXR1cm4gcj9uJiYwIT09bi5sZW5ndGg/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVscztyZXR1cm57cmVtb3ZlOih2b2lkIDA9PT1uP1tdOm4pLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOUmVtb3ZlR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwLHI9ZS5jb25maWc7cmV0dXJuIG4/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pK1wiL3JlbW92ZVwifWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKCl7cmV0dXJue319ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTkNoYW5uZWxHcm91cHNPcGVyYXRpb259ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlKXtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwXCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoKXtyZXR1cm57fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJue2dyb3Vwczp0LnBheWxvYWQuZ3JvdXBzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cCxyPWUuY29uZmlnO3JldHVybiBuP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYygpe3JldHVybnt9fWZ1bmN0aW9uIGwoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dC5wYXlsb2FkLmNoYW5uZWxzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT10LmNoYW5uZWxzLG89ZS5jb25maWc7cmV0dXJuIG4/cj9pJiYwIT09aS5sZW5ndGg/by5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIitufWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5wdXNoR2F0ZXdheSxyPXQuY2hhbm5lbHM7cmV0dXJue3R5cGU6bixhZGQ6KHZvaWQgMD09PXI/W106cikuam9pbihcIixcIil9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT10LmNoYW5uZWxzLG89ZS5jb25maWc7cmV0dXJuIG4/cj9pJiYwIT09aS5sZW5ndGg/by5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIitufWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5wdXNoR2F0ZXdheSxyPXQuY2hhbm5lbHM7cmV0dXJue3R5cGU6bixyZW1vdmU6KHZvaWQgMD09PXI/W106cikuam9pbihcIixcIil9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT1lLmNvbmZpZztyZXR1cm4gbj9yP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3JldHVybnt0eXBlOnQucHVzaEdhdGV3YXl9fWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUmVtb3ZlQWxsUHVzaE5vdGlmaWNhdGlvbnNPcGVyYXRpb259ZnVuY3Rpb24gaShlLHQpe3ZhciBuPXQuZGV2aWNlLHI9dC5wdXNoR2F0ZXdheSxpPWUuY29uZmlnO3JldHVybiBuP3I/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIituK1wiL3JlbW92ZVwifWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7cmV0dXJue3R5cGU6dC5wdXNoR2F0ZXdheX19ZnVuY3Rpb24gYygpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlVuc3Vic2NyaWJlT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIsbz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobykrXCIvbGVhdmVcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXt9O3JldHVybiByLmxlbmd0aD4wJiYoaVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksaX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOV2hlcmVOb3dPcGVyYXRpb259ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC51dWlkLGk9dm9pZCAwPT09cj9uLlVVSUQ6cjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL3V1aWQvXCIraX1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdSgpe3JldHVybnt9fWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dC5wYXlsb2FkLmNoYW5uZWxzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5IZWFydGJlYXRPcGVyYXRpb259ZnVuY3Rpb24gbyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhvKStcIi9oZWFydGJlYXRcIn1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXQuc3RhdGUsbz12b2lkIDA9PT1pP3t9Omkscz1lLmNvbmZpZyxhPXt9O3JldHVybiByLmxlbmd0aD4wJiYoYVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksYS5zdGF0ZT1KU09OLnN0cmluZ2lmeShvKSxhLmhlYXJ0YmVhdD1zLmdldFByZXNlbmNlVGltZW91dCgpLGF9ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkdldFN0YXRlT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQudXVpZCxpPXZvaWQgMD09PXI/bi5VVUlEOnIsbz10LmNoYW5uZWxzLHM9dm9pZCAwPT09bz9bXTpvLGE9cy5sZW5ndGg+MD9zLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKGEpK1wiL3V1aWQvXCIraX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXt9O3JldHVybiByLmxlbmd0aD4wJiYoaVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksaX1mdW5jdGlvbiBsKGUsdCxuKXt2YXIgcj1uLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89bi5jaGFubmVsR3JvdXBzLHM9dm9pZCAwPT09bz9bXTpvLGE9e307cmV0dXJuIDE9PT1pLmxlbmd0aCYmMD09PXMubGVuZ3RoP2FbaVswXV09dC5wYXlsb2FkOmE9dC5wYXlsb2FkLHtjaGFubmVsczphfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5TZXRTdGF0ZU9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LnN0YXRlLGk9dC5jaGFubmVscyxvPXZvaWQgMD09PWk/W106aSxzPXQuY2hhbm5lbEdyb3VwcyxhPXZvaWQgMD09PXM/W106cztyZXR1cm4gcj9uLnN1YnNjcmliZUtleT8wPT09by5sZW5ndGgmJjA9PT1hLmxlbmd0aD9cIlBsZWFzZSBwcm92aWRlIGEgbGlzdCBvZiBjaGFubmVscyBhbmQvb3IgY2hhbm5lbC1ncm91cHNcIjp2b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgU3RhdGVcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG8pK1wiL3V1aWQvXCIrbi5VVUlEK1wiL2RhdGFcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuc3RhdGUscj10LmNoYW5uZWxHcm91cHMsaT12b2lkIDA9PT1yP1tdOnIsbz17fTtyZXR1cm4gby5zdGF0ZT1KU09OLnN0cmluZ2lmeShuKSxpLmxlbmd0aD4wJiYob1tcImNoYW5uZWwtZ3JvdXBcIl09aS5qb2luKFwiLFwiKSksb31mdW5jdGlvbiBsKGUsdCl7cmV0dXJue3N0YXRlOnQucGF5bG9hZH19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOSGVyZU5vd09wZXJhdGlvbn1mdW5jdGlvbiBvKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89dC5jaGFubmVsR3JvdXBzLHM9dm9pZCAwPT09bz9bXTpvLGE9XCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleTtpZihpLmxlbmd0aD4wfHxzLmxlbmd0aD4wKXt2YXIgdT1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7YSs9XCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHUpfXJldHVybiBhfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9dC5pbmNsdWRlVVVJRHMsbz12b2lkIDA9PT1pfHxpLHM9dC5pbmNsdWRlU3RhdGUsYT12b2lkIDAhPT1zJiZzLHU9e307cmV0dXJuIG98fCh1LmRpc2FibGVfdXVpZHM9MSksYSYmKHUuc3RhdGU9MSksci5sZW5ndGg+MCYmKHVbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLHV9ZnVuY3Rpb24gbChlLHQsbil7dmFyIHI9bi5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPW4uY2hhbm5lbEdyb3VwcyxzPXZvaWQgMD09PW8/W106byxhPW4uaW5jbHVkZVVVSURzLHU9dm9pZCAwPT09YXx8YSxjPW4uaW5jbHVkZVN0YXRlLGw9dm9pZCAwIT09YyYmYztyZXR1cm4gaS5sZW5ndGg+MXx8cy5sZW5ndGg+MHx8MD09PXMubGVuZ3RoJiYwPT09aS5sZW5ndGg/ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gZS50b3RhbENoYW5uZWxzPXQucGF5bG9hZC50b3RhbF9jaGFubmVscyxlLnRvdGFsT2NjdXBhbmN5PXQucGF5bG9hZC50b3RhbF9vY2N1cGFuY3ksZS5jaGFubmVscz17fSxPYmplY3Qua2V5cyh0LnBheWxvYWQuY2hhbm5lbHMpLmZvckVhY2goZnVuY3Rpb24obil7dmFyIHI9dC5wYXlsb2FkLmNoYW5uZWxzW25dLGk9W107cmV0dXJuIGUuY2hhbm5lbHNbbl09e29jY3VwYW50czppLG5hbWU6bixvY2N1cGFuY3k6ci5vY2N1cGFuY3l9LHUmJnIudXVpZHMuZm9yRWFjaChmdW5jdGlvbihlKXtsP2kucHVzaCh7c3RhdGU6ZS5zdGF0ZSx1dWlkOmUudXVpZH0pOmkucHVzaCh7c3RhdGU6bnVsbCx1dWlkOmV9KX0pLGV9KSxlfSgpOmZ1bmN0aW9uKCl7dmFyIGU9e30sbj1bXTtyZXR1cm4gZS50b3RhbENoYW5uZWxzPTEsZS50b3RhbE9jY3VwYW5jeT10Lm9jY3VwYW5jeSxlLmNoYW5uZWxzPXt9LGUuY2hhbm5lbHNbaVswXV09e29jY3VwYW50czpuLG5hbWU6aVswXSxvY2N1cGFuY3k6dC5vY2N1cGFuY3l9LHUmJnQudXVpZHMuZm9yRWFjaChmdW5jdGlvbihlKXtsP24ucHVzaCh7c3RhdGU6ZS5zdGF0ZSx1dWlkOmUudXVpZH0pOm4ucHVzaCh7c3RhdGU6bnVsbCx1dWlkOmV9KX0pLGV9KCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOQWNjZXNzTWFuYWdlckF1ZGl0fWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuXCIvdjIvYXV0aC9hdWRpdC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleX1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITF9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQuY2hhbm5lbCxyPXQuY2hhbm5lbEdyb3VwLGk9dC5hdXRoS2V5cyxvPXZvaWQgMD09PWk/W106aSxzPXt9O3JldHVybiBuJiYocy5jaGFubmVsPW4pLHImJihzW1wiY2hhbm5lbC1ncm91cFwiXT1yKSxvLmxlbmd0aD4wJiYocy5hdXRoPW8uam9pbihcIixcIikpLHN9ZnVuY3Rpb24gYyhlLHQpe3JldHVybiB0LnBheWxvYWR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOQWNjZXNzTWFuYWdlckdyYW50fWZ1bmN0aW9uIGkoZSl7dmFyIHQ9ZS5jb25maWc7cmV0dXJuIHQuc3Vic2NyaWJlS2V5P3QucHVibGlzaEtleT90LnNlY3JldEtleT92b2lkIDA6XCJNaXNzaW5nIFNlY3JldCBLZXlcIjpcIk1pc3NpbmcgUHVibGlzaCBLZXlcIjpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuXCIvdjIvYXV0aC9ncmFudC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleX1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITF9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj12b2lkIDA9PT1uP1tdOm4saT10LmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1pP1tdOmkscz10LnR0bCxhPXQucmVhZCx1PXZvaWQgMCE9PWEmJmEsYz10LndyaXRlLGw9dm9pZCAwIT09YyYmYyxoPXQubWFuYWdlLGY9dm9pZCAwIT09aCYmaCxkPXQuYXV0aEtleXMscD12b2lkIDA9PT1kP1tdOmQsZz17fTtyZXR1cm4gZy5yPXU/XCIxXCI6XCIwXCIsZy53PWw/XCIxXCI6XCIwXCIsZy5tPWY/XCIxXCI6XCIwXCIsci5sZW5ndGg+MCYmKGcuY2hhbm5lbD1yLmpvaW4oXCIsXCIpKSxvLmxlbmd0aD4wJiYoZ1tcImNoYW5uZWwtZ3JvdXBcIl09by5qb2luKFwiLFwiKSkscC5sZW5ndGg+MCYmKGcuYXV0aD1wLmpvaW4oXCIsXCIpKSwoc3x8MD09PXMpJiYoZy50dGw9cyksZ31mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNyeXB0byxyPWUuY29uZmlnLGk9SlNPTi5zdHJpbmdpZnkodCk7cmV0dXJuIHIuY2lwaGVyS2V5JiYoaT1uLmVuY3J5cHQoaSksaT1KU09OLnN0cmluZ2lmeShpKSksaX1mdW5jdGlvbiBvKCl7cmV0dXJuIHYuZGVmYXVsdC5QTlB1Ymxpc2hPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5tZXNzYWdlO3JldHVybiB0LmNoYW5uZWw/cj9uLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgTWVzc2FnZVwiOlwiTWlzc2luZyBDaGFubmVsXCJ9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQuc2VuZEJ5UG9zdDtyZXR1cm4gdm9pZCAwIT09biYmbn1mdW5jdGlvbiB1KGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWwsbz10Lm1lc3NhZ2Uscz1pKGUsbyk7cmV0dXJuXCIvcHVibGlzaC9cIituLnB1Ymxpc2hLZXkrXCIvXCIrbi5zdWJzY3JpYmVLZXkrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHIpK1wiLzAvXCIrXy5kZWZhdWx0LmVuY29kZVN0cmluZyhzKX1mdW5jdGlvbiBjKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWw7cmV0dXJuXCIvcHVibGlzaC9cIituLnB1Ymxpc2hLZXkrXCIvXCIrbi5zdWJzY3JpYmVLZXkrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHIpK1wiLzBcIn1mdW5jdGlvbiBsKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBoKCl7cmV0dXJuITB9ZnVuY3Rpb24gZihlLHQpe3JldHVybiBpKGUsdC5tZXNzYWdlKX1mdW5jdGlvbiBkKGUsdCl7dmFyIG49dC5tZXRhLHI9dC5yZXBsaWNhdGUsaT12b2lkIDA9PT1yfHxyLG89dC5zdG9yZUluSGlzdG9yeSxzPXQudHRsLGE9e307cmV0dXJuIG51bGwhPW8mJihhLnN0b3JlPW8/XCIxXCI6XCIwXCIpLHMmJihhLnR0bD1zKSwhMT09PWkmJihhLm5vcmVwPVwidHJ1ZVwiKSxuJiZcIm9iamVjdFwiPT09KHZvaWQgMD09PW4/XCJ1bmRlZmluZWRcIjpnKG4pKSYmKGEubWV0YT1KU09OLnN0cmluZ2lmeShuKSksYX1mdW5jdGlvbiBwKGUsdCl7cmV0dXJue3RpbWV0b2tlbjp0WzJdfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgZz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24oZSl7cmV0dXJuIHR5cGVvZiBlfTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZlLmNvbnN0cnVjdG9yPT09U3ltYm9sJiZlIT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiBlfTt0LmdldE9wZXJhdGlvbj1vLHQudmFsaWRhdGVQYXJhbXM9cyx0LnVzZVBvc3Q9YSx0LmdldFVSTD11LHQucG9zdFVSTD1jLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9bCx0LmlzQXV0aFN1cHBvcnRlZD1oLHQucG9zdFBheWxvYWQ9Zix0LnByZXBhcmVQYXJhbXM9ZCx0LmhhbmRsZVJlc3BvbnNlPXA7dmFyIHk9KG4oOCksbigxNikpLHY9cih5KSxiPW4oMTcpLF89cihiKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPWUuY3J5cHRvO2lmKCFuLmNpcGhlcktleSlyZXR1cm4gdDt0cnl7cmV0dXJuIHIuZGVjcnlwdCh0KX1jYXRjaChlKXtyZXR1cm4gdH19ZnVuY3Rpb24gbygpe3JldHVybiBkLmRlZmF1bHQuUE5IaXN0b3J5T3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWwscj1lLmNvbmZpZztyZXR1cm4gbj9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgY2hhbm5lbFwifWZ1bmN0aW9uIGEoZSx0KXt2YXIgbj10LmNoYW5uZWw7cmV0dXJuXCIvdjIvaGlzdG9yeS9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK2cuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybiEwfWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj10LnN0YXJ0LHI9dC5lbmQsaT10LnJldmVyc2Usbz10LmNvdW50LHM9dm9pZCAwPT09bz8xMDA6byxhPXQuc3RyaW5naWZpZWRUaW1lVG9rZW4sdT12b2lkIDAhPT1hJiZhLGM9e2luY2x1ZGVfdG9rZW46XCJ0cnVlXCJ9O3JldHVybiBjLmNvdW50PXMsbiYmKGMuc3RhcnQ9biksciYmKGMuZW5kPXIpLHUmJihjLnN0cmluZ19tZXNzYWdlX3Rva2VuPVwidHJ1ZVwiKSxcbm51bGwhPWkmJihjLnJldmVyc2U9aS50b1N0cmluZygpKSxjfWZ1bmN0aW9uIGgoZSx0KXt2YXIgbj17bWVzc2FnZXM6W10sc3RhcnRUaW1lVG9rZW46dFsxXSxlbmRUaW1lVG9rZW46dFsyXX07cmV0dXJuIHRbMF0uZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgcj17dGltZXRva2VuOnQudGltZXRva2VuLGVudHJ5OmkoZSx0Lm1lc3NhZ2UpfTtuLm1lc3NhZ2VzLnB1c2gocil9KSxufU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPW8sdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQuaXNBdXRoU3VwcG9ydGVkPWMsdC5wcmVwYXJlUGFyYW1zPWwsdC5oYW5kbGVSZXNwb25zZT1oO3ZhciBmPShuKDgpLG4oMTYpKSxkPXIoZikscD1uKDE3KSxnPXIocCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7dmFyIG49ZS5jb25maWcscj1lLmNyeXB0bztpZighbi5jaXBoZXJLZXkpcmV0dXJuIHQ7dHJ5e3JldHVybiByLmRlY3J5cHQodCl9Y2F0Y2goZSl7cmV0dXJuIHR9fWZ1bmN0aW9uIG8oKXtyZXR1cm4gZC5kZWZhdWx0LlBORmV0Y2hNZXNzYWdlc09wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPWUuY29uZmlnO3JldHVybiBuJiYwIT09bi5sZW5ndGg/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIGNoYW5uZWxzXCJ9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj12b2lkIDA9PT1uP1tdOm4saT1lLmNvbmZpZyxvPXIubGVuZ3RoPjA/ci5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92My9oaXN0b3J5L3N1Yi1rZXkvXCIraS5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitnLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG8pfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoKXtyZXR1cm4hMH1mdW5jdGlvbiBsKGUsdCl7dmFyIG49dC5zdGFydCxyPXQuZW5kLGk9dC5jb3VudCxvPXt9O3JldHVybiBpJiYoby5tYXg9aSksbiYmKG8uc3RhcnQ9biksciYmKG8uZW5kPXIpLG99ZnVuY3Rpb24gaChlLHQpe3ZhciBuPXtjaGFubmVsczp7fX07cmV0dXJuIE9iamVjdC5rZXlzKHQuY2hhbm5lbHN8fHt9KS5mb3JFYWNoKGZ1bmN0aW9uKHIpe24uY2hhbm5lbHNbcl09W10sKHQuY2hhbm5lbHNbcl18fFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBvPXt9O28uY2hhbm5lbD1yLG8uc3Vic2NyaXB0aW9uPW51bGwsby50aW1ldG9rZW49dC50aW1ldG9rZW4sby5tZXNzYWdlPWkoZSx0Lm1lc3NhZ2UpLG4uY2hhbm5lbHNbcl0ucHVzaChvKX0pfSksbn1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1vLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LmlzQXV0aFN1cHBvcnRlZD1jLHQucHJlcGFyZVBhcmFtcz1sLHQuaGFuZGxlUmVzcG9uc2U9aDt2YXIgZj0obig4KSxuKDE2KSksZD1yKGYpLHA9bigxNyksZz1yKHApfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5TdWJzY3JpYmVPcGVyYXRpb259ZnVuY3Rpb24gbyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9zdWJzY3JpYmUvXCIrbi5zdWJzY3JpYmVLZXkrXCIvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhvKStcIi8wXCJ9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0U3Vic2NyaWJlVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxHcm91cHMsaT12b2lkIDA9PT1yP1tdOnIsbz10LnRpbWV0b2tlbixzPXQuZmlsdGVyRXhwcmVzc2lvbixhPXQucmVnaW9uLHU9e2hlYXJ0YmVhdDpuLmdldFByZXNlbmNlVGltZW91dCgpfTtyZXR1cm4gaS5sZW5ndGg+MCYmKHVbXCJjaGFubmVsLWdyb3VwXCJdPWkuam9pbihcIixcIikpLHMmJnMubGVuZ3RoPjAmJih1W1wiZmlsdGVyLWV4cHJcIl09cyksbyYmKHUudHQ9byksYSYmKHUudHI9YSksdX1mdW5jdGlvbiBsKGUsdCl7dmFyIG49W107dC5tLmZvckVhY2goZnVuY3Rpb24oZSl7dmFyIHQ9e3B1Ymxpc2hUaW1ldG9rZW46ZS5wLnQscmVnaW9uOmUucC5yfSxyPXtzaGFyZDpwYXJzZUludChlLmEsMTApLHN1YnNjcmlwdGlvbk1hdGNoOmUuYixjaGFubmVsOmUuYyxwYXlsb2FkOmUuZCxmbGFnczplLmYsaXNzdWluZ0NsaWVudElkOmUuaSxzdWJzY3JpYmVLZXk6ZS5rLG9yaWdpbmF0aW9uVGltZXRva2VuOmUubyx1c2VyTWV0YWRhdGE6ZS51LHB1Ymxpc2hNZXRhRGF0YTp0fTtuLnB1c2gocil9KTt2YXIgcj17dGltZXRva2VuOnQudC50LHJlZ2lvbjp0LnQucn07cmV0dXJue21lc3NhZ2VzOm4sbWV0YWRhdGE6cn19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCkscz1uKDcpLGE9KHIocyksbigxMykpLHU9cihhKSxjPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10aGlzO2kodGhpcyxlKSx0aGlzLl9tb2R1bGVzPXt9LE9iamVjdC5rZXlzKHQpLmZvckVhY2goZnVuY3Rpb24oZSl7bi5fbW9kdWxlc1tlXT10W2VdLmJpbmQobil9KX1yZXR1cm4gbyhlLFt7a2V5OlwiaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2NvbmZpZz1lLHRoaXMuX21heFN1YkRvbWFpbj0yMCx0aGlzLl9jdXJyZW50U3ViRG9tYWluPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSp0aGlzLl9tYXhTdWJEb21haW4pLHRoaXMuX3Byb3ZpZGVkRlFETj0odGhpcy5fY29uZmlnLnNlY3VyZT9cImh0dHBzOi8vXCI6XCJodHRwOi8vXCIpK3RoaXMuX2NvbmZpZy5vcmlnaW4sdGhpcy5fY29yZVBhcmFtcz17fSx0aGlzLnNoaWZ0U3RhbmRhcmRPcmlnaW4oKX19LHtrZXk6XCJuZXh0T3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24oKXtpZigtMT09PXRoaXMuX3Byb3ZpZGVkRlFETi5pbmRleE9mKFwicHVic3ViLlwiKSlyZXR1cm4gdGhpcy5fcHJvdmlkZWRGUUROO3ZhciBlPXZvaWQgMDtyZXR1cm4gdGhpcy5fY3VycmVudFN1YkRvbWFpbj10aGlzLl9jdXJyZW50U3ViRG9tYWluKzEsdGhpcy5fY3VycmVudFN1YkRvbWFpbj49dGhpcy5fbWF4U3ViRG9tYWluJiYodGhpcy5fY3VycmVudFN1YkRvbWFpbj0xKSxlPXRoaXMuX2N1cnJlbnRTdWJEb21haW4udG9TdHJpbmcoKSx0aGlzLl9wcm92aWRlZEZRRE4ucmVwbGFjZShcInB1YnN1YlwiLFwicHNcIitlKX19LHtrZXk6XCJzaGlmdFN0YW5kYXJkT3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdO3JldHVybiB0aGlzLl9zdGFuZGFyZE9yaWdpbj10aGlzLm5leHRPcmlnaW4oZSksdGhpcy5fc3RhbmRhcmRPcmlnaW59fSx7a2V5OlwiZ2V0U3RhbmRhcmRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdGFuZGFyZE9yaWdpbn19LHtrZXk6XCJQT1NUXCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHRoaXMuX21vZHVsZXMucG9zdChlLHQsbixyKX19LHtrZXk6XCJHRVRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX21vZHVsZXMuZ2V0KGUsdCxuKX19LHtrZXk6XCJfZGV0ZWN0RXJyb3JDYXRlZ29yeVwiLHZhbHVlOmZ1bmN0aW9uKGUpe2lmKFwiRU5PVEZPVU5EXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVDT05OUkVGVVNFRFwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoXCJFQ09OTlJFU0VUXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVBSV9BR0FJTlwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoMD09PWUuc3RhdHVzfHxlLmhhc093blByb3BlcnR5KFwic3RhdHVzXCIpJiZ2b2lkIDA9PT1lLnN0YXR1cylyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKGUudGltZW91dClyZXR1cm4gdS5kZWZhdWx0LlBOVGltZW91dENhdGVnb3J5O2lmKGUucmVzcG9uc2Upe2lmKGUucmVzcG9uc2UuYmFkUmVxdWVzdClyZXR1cm4gdS5kZWZhdWx0LlBOQmFkUmVxdWVzdENhdGVnb3J5O2lmKGUucmVzcG9uc2UuZm9yYmlkZGVuKXJldHVybiB1LmRlZmF1bHQuUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeX1yZXR1cm4gdS5kZWZhdWx0LlBOVW5rbm93bkNhdGVnb3J5fX1dKSxlfSgpKTt0LmRlZmF1bHQ9YyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD17Z2V0OmZ1bmN0aW9uKGUpe3RyeXtyZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oZSl9Y2F0Y2goZSl7cmV0dXJuIG51bGx9fSxzZXQ6ZnVuY3Rpb24oZSx0KXt0cnl7cmV0dXJuIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGUsdCl9Y2F0Y2goZSl7cmV0dXJuIG51bGx9fX0sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7dmFyIHQ9KG5ldyBEYXRlKS5nZXRUaW1lKCksbj0obmV3IERhdGUpLnRvSVNPU3RyaW5nKCkscj1mdW5jdGlvbigpe3JldHVybiBjb25zb2xlJiZjb25zb2xlLmxvZz9jb25zb2xlOndpbmRvdyYmd2luZG93LmNvbnNvbGUmJndpbmRvdy5jb25zb2xlLmxvZz93aW5kb3cuY29uc29sZTpjb25zb2xlfSgpO3IubG9nKFwiPDw8PDxcIiksci5sb2coXCJbXCIrbitcIl1cIixcIlxcblwiLGUudXJsLFwiXFxuXCIsZS5xcyksci5sb2coXCItLS0tLVwiKSxlLm9uKFwicmVzcG9uc2VcIixmdW5jdGlvbihuKXt2YXIgaT0obmV3IERhdGUpLmdldFRpbWUoKSxvPWktdCxzPShuZXcgRGF0ZSkudG9JU09TdHJpbmcoKTtyLmxvZyhcIj4+Pj4+PlwiKSxyLmxvZyhcIltcIitzK1wiIC8gXCIrbytcIl1cIixcIlxcblwiLGUudXJsLFwiXFxuXCIsZS5xcyxcIlxcblwiLG4udGV4dCksci5sb2coXCItLS0tLVwiKX0pfWZ1bmN0aW9uIGkoZSx0LG4pe3ZhciBpPXRoaXM7cmV0dXJuIHRoaXMuX2NvbmZpZy5sb2dWZXJib3NpdHkmJihlPWUudXNlKHIpKSx0aGlzLl9jb25maWcucHJveHkmJnRoaXMuX21vZHVsZXMucHJveHkmJihlPXRoaXMuX21vZHVsZXMucHJveHkuY2FsbCh0aGlzLGUpKSx0aGlzLl9jb25maWcua2VlcEFsaXZlJiZ0aGlzLl9tb2R1bGVzLmtlZXBBbGl2ZSYmKGU9dGhpcy5fbW9kdWxlLmtlZXBBbGl2ZShlKSksZS50aW1lb3V0KHQudGltZW91dCkuZW5kKGZ1bmN0aW9uKGUscil7dmFyIG89e307aWYoby5lcnJvcj1udWxsIT09ZSxvLm9wZXJhdGlvbj10Lm9wZXJhdGlvbixyJiZyLnN0YXR1cyYmKG8uc3RhdHVzQ29kZT1yLnN0YXR1cyksZSlyZXR1cm4gby5lcnJvckRhdGE9ZSxvLmNhdGVnb3J5PWkuX2RldGVjdEVycm9yQ2F0ZWdvcnkoZSksbihvLG51bGwpO3ZhciBzPUpTT04ucGFyc2Uoci50ZXh0KTtyZXR1cm4gcy5lcnJvciYmMT09PXMuZXJyb3ImJnMuc3RhdHVzJiZzLm1lc3NhZ2UmJnMuc2VydmljZT8oby5lcnJvckRhdGE9cyxvLnN0YXR1c0NvZGU9cy5zdGF0dXMsby5lcnJvcj0hMCxvLmNhdGVnb3J5PWkuX2RldGVjdEVycm9yQ2F0ZWdvcnkobyksbihvLG51bGwpKTpuKG8scyl9KX1mdW5jdGlvbiBvKGUsdCxuKXt2YXIgcj11LmRlZmF1bHQuZ2V0KHRoaXMuZ2V0U3RhbmRhcmRPcmlnaW4oKSt0LnVybCkucXVlcnkoZSk7cmV0dXJuIGkuY2FsbCh0aGlzLHIsdCxuKX1mdW5jdGlvbiBzKGUsdCxuLHIpe3ZhciBvPXUuZGVmYXVsdC5wb3N0KHRoaXMuZ2V0U3RhbmRhcmRPcmlnaW4oKStuLnVybCkucXVlcnkoZSkuc2VuZCh0KTtyZXR1cm4gaS5jYWxsKHRoaXMsbyxuLHIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0PW8sdC5wb3N0PXM7dmFyIGE9big0MyksdT1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGEpO24oOCl9LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKCl7fWZ1bmN0aW9uIGkoZSl7aWYoIXYoZSkpcmV0dXJuIGU7dmFyIHQ9W107Zm9yKHZhciBuIGluIGUpbyh0LG4sZVtuXSk7cmV0dXJuIHQuam9pbihcIiZcIil9ZnVuY3Rpb24gbyhlLHQsbil7aWYobnVsbCE9bilpZihBcnJheS5pc0FycmF5KG4pKW4uZm9yRWFjaChmdW5jdGlvbihuKXtvKGUsdCxuKX0pO2Vsc2UgaWYodihuKSlmb3IodmFyIHIgaW4gbilvKGUsdCtcIltcIityK1wiXVwiLG5bcl0pO2Vsc2UgZS5wdXNoKGVuY29kZVVSSUNvbXBvbmVudCh0KStcIj1cIitlbmNvZGVVUklDb21wb25lbnQobikpO2Vsc2UgbnVsbD09PW4mJmUucHVzaChlbmNvZGVVUklDb21wb25lbnQodCkpfWZ1bmN0aW9uIHMoZSl7Zm9yKHZhciB0LG4scj17fSxpPWUuc3BsaXQoXCImXCIpLG89MCxzPWkubGVuZ3RoO288czsrK28pdD1pW29dLG49dC5pbmRleE9mKFwiPVwiKSwtMT09bj9yW2RlY29kZVVSSUNvbXBvbmVudCh0KV09XCJcIjpyW2RlY29kZVVSSUNvbXBvbmVudCh0LnNsaWNlKDAsbikpXT1kZWNvZGVVUklDb21wb25lbnQodC5zbGljZShuKzEpKTtyZXR1cm4gcn1mdW5jdGlvbiBhKGUpe3ZhciB0LG4scixpLG89ZS5zcGxpdCgvXFxyP1xcbi8pLHM9e307by5wb3AoKTtmb3IodmFyIGE9MCx1PW8ubGVuZ3RoO2E8dTsrK2Epbj1vW2FdLHQ9bi5pbmRleE9mKFwiOlwiKSxyPW4uc2xpY2UoMCx0KS50b0xvd2VyQ2FzZSgpLGk9XyhuLnNsaWNlKHQrMSkpLHNbcl09aTtyZXR1cm4gc31mdW5jdGlvbiB1KGUpe3JldHVybi9bXFwvK11qc29uXFxiLy50ZXN0KGUpfWZ1bmN0aW9uIGMoZSl7cmV0dXJuIGUuc3BsaXQoLyAqOyAqLykuc2hpZnQoKX1mdW5jdGlvbiBsKGUpe3JldHVybiBlLnNwbGl0KC8gKjsgKi8pLnJlZHVjZShmdW5jdGlvbihlLHQpe3ZhciBuPXQuc3BsaXQoLyAqPSAqLykscj1uLnNoaWZ0KCksaT1uLnNoaWZ0KCk7cmV0dXJuIHImJmkmJihlW3JdPWkpLGV9LHt9KX1mdW5jdGlvbiBoKGUsdCl7dD10fHx7fSx0aGlzLnJlcT1lLHRoaXMueGhyPXRoaXMucmVxLnhocix0aGlzLnRleHQ9XCJIRUFEXCIhPXRoaXMucmVxLm1ldGhvZCYmKFwiXCI9PT10aGlzLnhoci5yZXNwb25zZVR5cGV8fFwidGV4dFwiPT09dGhpcy54aHIucmVzcG9uc2VUeXBlKXx8dm9pZCAwPT09dGhpcy54aHIucmVzcG9uc2VUeXBlP3RoaXMueGhyLnJlc3BvbnNlVGV4dDpudWxsLHRoaXMuc3RhdHVzVGV4dD10aGlzLnJlcS54aHIuc3RhdHVzVGV4dCx0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyksdGhpcy5oZWFkZXI9dGhpcy5oZWFkZXJzPWEodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpLHRoaXMuaGVhZGVyW1wiY29udGVudC10eXBlXCJdPXRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiY29udGVudC10eXBlXCIpLHRoaXMuX3NldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpLHRoaXMuYm9keT1cIkhFQURcIiE9dGhpcy5yZXEubWV0aG9kP3RoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQ/dGhpcy50ZXh0OnRoaXMueGhyLnJlc3BvbnNlKTpudWxsfWZ1bmN0aW9uIGYoZSx0KXt2YXIgbj10aGlzO3RoaXMuX3F1ZXJ5PXRoaXMuX3F1ZXJ5fHxbXSx0aGlzLm1ldGhvZD1lLHRoaXMudXJsPXQsdGhpcy5oZWFkZXI9e30sdGhpcy5faGVhZGVyPXt9LHRoaXMub24oXCJlbmRcIixmdW5jdGlvbigpe3ZhciBlPW51bGwsdD1udWxsO3RyeXt0PW5ldyBoKG4pfWNhdGNoKHQpe3JldHVybiBlPW5ldyBFcnJvcihcIlBhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlXCIpLGUucGFyc2U9ITAsZS5vcmlnaW5hbD10LGUucmF3UmVzcG9uc2U9bi54aHImJm4ueGhyLnJlc3BvbnNlVGV4dD9uLnhoci5yZXNwb25zZVRleHQ6bnVsbCxlLnN0YXR1c0NvZGU9bi54aHImJm4ueGhyLnN0YXR1cz9uLnhoci5zdGF0dXM6bnVsbCxuLmNhbGxiYWNrKGUpfW4uZW1pdChcInJlc3BvbnNlXCIsdCk7dmFyIHI7dHJ5eyh0LnN0YXR1czwyMDB8fHQuc3RhdHVzPj0zMDApJiYocj1uZXcgRXJyb3IodC5zdGF0dXNUZXh0fHxcIlVuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlXCIpLHIub3JpZ2luYWw9ZSxyLnJlc3BvbnNlPXQsci5zdGF0dXM9dC5zdGF0dXMpfWNhdGNoKGUpe3I9ZX1yP24uY2FsbGJhY2socix0KTpuLmNhbGxiYWNrKG51bGwsdCl9KX1mdW5jdGlvbiBkKGUsdCl7dmFyIG49YihcIkRFTEVURVwiLGUpO3JldHVybiB0JiZuLmVuZCh0KSxufXZhciBwO1widW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/cD13aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/cD1zZWxmOihjb25zb2xlLndhcm4oXCJVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpLHA9dGhpcyk7dmFyIGc9big0NCkseT1uKDQ1KSx2PW4oNDYpLGI9ZS5leHBvcnRzPW4oNDcpLmJpbmQobnVsbCxmKTtiLmdldFhIUj1mdW5jdGlvbigpe2lmKCEoIXAuWE1MSHR0cFJlcXVlc3R8fHAubG9jYXRpb24mJlwiZmlsZTpcIj09cC5sb2NhdGlvbi5wcm90b2NvbCYmcC5BY3RpdmVYT2JqZWN0KSlyZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O3RyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjYuMFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQLjMuMFwiKX1jYXRjaChlKXt9dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1zeG1sMi5YTUxIVFRQXCIpfWNhdGNoKGUpe310aHJvdyBFcnJvcihcIkJyb3dzZXItb25seSB2ZXJpc29uIG9mIHN1cGVyYWdlbnQgY291bGQgbm90IGZpbmQgWEhSXCIpfTt2YXIgXz1cIlwiLnRyaW0/ZnVuY3Rpb24oZSl7cmV0dXJuIGUudHJpbSgpfTpmdW5jdGlvbihlKXtyZXR1cm4gZS5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csXCJcIil9O2Iuc2VyaWFsaXplT2JqZWN0PWksYi5wYXJzZVN0cmluZz1zLGIudHlwZXM9e2h0bWw6XCJ0ZXh0L2h0bWxcIixqc29uOlwiYXBwbGljYXRpb24vanNvblwiLHhtbDpcImFwcGxpY2F0aW9uL3htbFwiLHVybGVuY29kZWQ6XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixmb3JtOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXCJmb3JtLWRhdGFcIjpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwifSxiLnNlcmlhbGl6ZT17XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjppLFwiYXBwbGljYXRpb24vanNvblwiOkpTT04uc3RyaW5naWZ5fSxiLnBhcnNlPXtcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOnMsXCJhcHBsaWNhdGlvbi9qc29uXCI6SlNPTi5wYXJzZX0saC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmhlYWRlcltlLnRvTG93ZXJDYXNlKCldfSxoLnByb3RvdHlwZS5fc2V0SGVhZGVyUHJvcGVydGllcz1mdW5jdGlvbihlKXt2YXIgdD10aGlzLmhlYWRlcltcImNvbnRlbnQtdHlwZVwiXXx8XCJcIjt0aGlzLnR5cGU9Yyh0KTt2YXIgbj1sKHQpO2Zvcih2YXIgciBpbiBuKXRoaXNbcl09bltyXX0saC5wcm90b3R5cGUuX3BhcnNlQm9keT1mdW5jdGlvbihlKXt2YXIgdD1iLnBhcnNlW3RoaXMudHlwZV07cmV0dXJuIXQmJnUodGhpcy50eXBlKSYmKHQ9Yi5wYXJzZVtcImFwcGxpY2F0aW9uL2pzb25cIl0pLHQmJmUmJihlLmxlbmd0aHx8ZSBpbnN0YW5jZW9mIE9iamVjdCk/dChlKTpudWxsfSxoLnByb3RvdHlwZS5fc2V0U3RhdHVzUHJvcGVydGllcz1mdW5jdGlvbihlKXsxMjIzPT09ZSYmKGU9MjA0KTt2YXIgdD1lLzEwMHwwO3RoaXMuc3RhdHVzPXRoaXMuc3RhdHVzQ29kZT1lLHRoaXMuc3RhdHVzVHlwZT10LHRoaXMuaW5mbz0xPT10LHRoaXMub2s9Mj09dCx0aGlzLmNsaWVudEVycm9yPTQ9PXQsdGhpcy5zZXJ2ZXJFcnJvcj01PT10LHRoaXMuZXJyb3I9KDQ9PXR8fDU9PXQpJiZ0aGlzLnRvRXJyb3IoKSx0aGlzLmFjY2VwdGVkPTIwMj09ZSx0aGlzLm5vQ29udGVudD0yMDQ9PWUsdGhpcy5iYWRSZXF1ZXN0PTQwMD09ZSx0aGlzLnVuYXV0aG9yaXplZD00MDE9PWUsdGhpcy5ub3RBY2NlcHRhYmxlPTQwNj09ZSx0aGlzLm5vdEZvdW5kPTQwND09ZSx0aGlzLmZvcmJpZGRlbj00MDM9PWV9LGgucHJvdG90eXBlLnRvRXJyb3I9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLnJlcSx0PWUubWV0aG9kLG49ZS51cmwscj1cImNhbm5vdCBcIit0K1wiIFwiK24rXCIgKFwiK3RoaXMuc3RhdHVzK1wiKVwiLGk9bmV3IEVycm9yKHIpO3JldHVybiBpLnN0YXR1cz10aGlzLnN0YXR1cyxpLm1ldGhvZD10LGkudXJsPW4saX0sYi5SZXNwb25zZT1oLGcoZi5wcm90b3R5cGUpO2Zvcih2YXIgbSBpbiB5KWYucHJvdG90eXBlW21dPXlbbV07Zi5wcm90b3R5cGUudHlwZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5zZXQoXCJDb250ZW50LVR5cGVcIixiLnR5cGVzW2VdfHxlKSx0aGlzfSxmLnByb3RvdHlwZS5yZXNwb25zZVR5cGU9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3Jlc3BvbnNlVHlwZT1lLHRoaXN9LGYucHJvdG90eXBlLmFjY2VwdD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5zZXQoXCJBY2NlcHRcIixiLnR5cGVzW2VdfHxlKSx0aGlzfSxmLnByb3RvdHlwZS5hdXRoPWZ1bmN0aW9uKGUsdCxuKXtzd2l0Y2gobnx8KG49e3R5cGU6XCJiYXNpY1wifSksbi50eXBlKXtjYXNlXCJiYXNpY1wiOnZhciByPWJ0b2EoZStcIjpcIit0KTt0aGlzLnNldChcIkF1dGhvcml6YXRpb25cIixcIkJhc2ljIFwiK3IpO2JyZWFrO2Nhc2VcImF1dG9cIjp0aGlzLnVzZXJuYW1lPWUsdGhpcy5wYXNzd29yZD10fXJldHVybiB0aGlzfSxmLnByb3RvdHlwZS5xdWVyeT1mdW5jdGlvbihlKXtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZSYmKGU9aShlKSksZSYmdGhpcy5fcXVlcnkucHVzaChlKSx0aGlzfSxmLnByb3RvdHlwZS5hdHRhY2g9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChlLHQsbnx8dC5uYW1lKSx0aGlzfSxmLnByb3RvdHlwZS5fZ2V0Rm9ybURhdGE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZm9ybURhdGF8fCh0aGlzLl9mb3JtRGF0YT1uZXcgcC5Gb3JtRGF0YSksdGhpcy5fZm9ybURhdGF9LGYucHJvdG90eXBlLmNhbGxiYWNrPWZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy5fY2FsbGJhY2s7dGhpcy5jbGVhclRpbWVvdXQoKSxuKGUsdCl9LGYucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3I9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgRXJyb3IoXCJSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuXCIpO2UuY3Jvc3NEb21haW49ITAsZS5zdGF0dXM9dGhpcy5zdGF0dXMsZS5tZXRob2Q9dGhpcy5tZXRob2QsZS51cmw9dGhpcy51cmwsdGhpcy5jYWxsYmFjayhlKX0sZi5wcm90b3R5cGUuX3RpbWVvdXRFcnJvcj1mdW5jdGlvbigpe3ZhciBlPXRoaXMuX3RpbWVvdXQsdD1uZXcgRXJyb3IoXCJ0aW1lb3V0IG9mIFwiK2UrXCJtcyBleGNlZWRlZFwiKTt0LnRpbWVvdXQ9ZSx0aGlzLmNhbGxiYWNrKHQpfSxmLnByb3RvdHlwZS5fYXBwZW5kUXVlcnlTdHJpbmc9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLl9xdWVyeS5qb2luKFwiJlwiKTtlJiYodGhpcy51cmwrPX50aGlzLnVybC5pbmRleE9mKFwiP1wiKT9cIiZcIitlOlwiP1wiK2UpfSxmLnByb3RvdHlwZS5lbmQ9ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcyxuPXRoaXMueGhyPWIuZ2V0WEhSKCksaT10aGlzLl90aW1lb3V0LG89dGhpcy5fZm9ybURhdGF8fHRoaXMuX2RhdGE7dGhpcy5fY2FsbGJhY2s9ZXx8cixuLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2lmKDQ9PW4ucmVhZHlTdGF0ZSl7dmFyIGU7dHJ5e2U9bi5zdGF0dXN9Y2F0Y2godCl7ZT0wfWlmKDA9PWUpe2lmKHQudGltZWRvdXQpcmV0dXJuIHQuX3RpbWVvdXRFcnJvcigpO2lmKHQuX2Fib3J0ZWQpcmV0dXJuO3JldHVybiB0LmNyb3NzRG9tYWluRXJyb3IoKX10LmVtaXQoXCJlbmRcIil9fTt2YXIgcz1mdW5jdGlvbihlLG4pe24udG90YWw+MCYmKG4ucGVyY2VudD1uLmxvYWRlZC9uLnRvdGFsKjEwMCksbi5kaXJlY3Rpb249ZSx0LmVtaXQoXCJwcm9ncmVzc1wiLG4pfTtpZih0aGlzLmhhc0xpc3RlbmVycyhcInByb2dyZXNzXCIpKXRyeXtuLm9ucHJvZ3Jlc3M9cy5iaW5kKG51bGwsXCJkb3dubG9hZFwiKSxuLnVwbG9hZCYmKG4udXBsb2FkLm9ucHJvZ3Jlc3M9cy5iaW5kKG51bGwsXCJ1cGxvYWRcIikpfWNhdGNoKGUpe31pZihpJiYhdGhpcy5fdGltZXImJih0aGlzLl90aW1lcj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC50aW1lZG91dD0hMCx0LmFib3J0KCl9LGkpKSx0aGlzLl9hcHBlbmRRdWVyeVN0cmluZygpLHRoaXMudXNlcm5hbWUmJnRoaXMucGFzc3dvcmQ/bi5vcGVuKHRoaXMubWV0aG9kLHRoaXMudXJsLCEwLHRoaXMudXNlcm5hbWUsdGhpcy5wYXNzd29yZCk6bi5vcGVuKHRoaXMubWV0aG9kLHRoaXMudXJsLCEwKSx0aGlzLl93aXRoQ3JlZGVudGlhbHMmJihuLndpdGhDcmVkZW50aWFscz0hMCksXCJHRVRcIiE9dGhpcy5tZXRob2QmJlwiSEVBRFwiIT10aGlzLm1ldGhvZCYmXCJzdHJpbmdcIiE9dHlwZW9mIG8mJiF0aGlzLl9pc0hvc3Qobykpe3ZhciBhPXRoaXMuX2hlYWRlcltcImNvbnRlbnQtdHlwZVwiXSxjPXRoaXMuX3NlcmlhbGl6ZXJ8fGIuc2VyaWFsaXplW2E/YS5zcGxpdChcIjtcIilbMF06XCJcIl07IWMmJnUoYSkmJihjPWIuc2VyaWFsaXplW1wiYXBwbGljYXRpb24vanNvblwiXSksYyYmKG89YyhvKSl9Zm9yKHZhciBsIGluIHRoaXMuaGVhZGVyKW51bGwhPXRoaXMuaGVhZGVyW2xdJiZuLnNldFJlcXVlc3RIZWFkZXIobCx0aGlzLmhlYWRlcltsXSk7cmV0dXJuIHRoaXMuX3Jlc3BvbnNlVHlwZSYmKG4ucmVzcG9uc2VUeXBlPXRoaXMuX3Jlc3BvbnNlVHlwZSksdGhpcy5lbWl0KFwicmVxdWVzdFwiLHRoaXMpLG4uc2VuZCh2b2lkIDAhPT1vP286bnVsbCksdGhpc30sYi5SZXF1ZXN0PWYsYi5nZXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJHRVRcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5xdWVyeSh0KSxuJiZyLmVuZChuKSxyfSxiLmhlYWQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJIRUFEXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLm9wdGlvbnM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJPUFRJT05TXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLmRlbD1kLGIuZGVsZXRlPWQsYi5wYXRjaD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBBVENIXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLnBvc3Q9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJQT1NUXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfSxiLnB1dD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBVVFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn19LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKGUpe2lmKGUpcmV0dXJuIGkoZSl9ZnVuY3Rpb24gaShlKXtmb3IodmFyIHQgaW4gci5wcm90b3R5cGUpZVt0XT1yLnByb3RvdHlwZVt0XTtyZXR1cm4gZX1lLmV4cG9ydHM9cixyLnByb3RvdHlwZS5vbj1yLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuX2NhbGxiYWNrcz10aGlzLl9jYWxsYmFja3N8fHt9LCh0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV09dGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdfHxbXSkucHVzaCh0KSx0aGlzfSxyLnByb3RvdHlwZS5vbmNlPWZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbigpe3RoaXMub2ZmKGUsbiksdC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9cmV0dXJuIG4uZm49dCx0aGlzLm9uKGUsbiksdGhpc30sci5wcm90b3R5cGUub2ZmPXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyPXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycz1yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGUsdCl7aWYodGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sMD09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXt9LHRoaXM7dmFyIG49dGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdO2lmKCFuKXJldHVybiB0aGlzO2lmKDE9PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV0sdGhpcztmb3IodmFyIHIsaT0wO2k8bi5sZW5ndGg7aSsrKWlmKChyPW5baV0pPT09dHx8ci5mbj09PXQpe24uc3BsaWNlKGksMSk7YnJlYWt9cmV0dXJuIHRoaXN9LHIucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24oZSl7dGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e307dmFyIHQ9W10uc2xpY2UuY2FsbChhcmd1bWVudHMsMSksbj10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV07aWYobil7bj1uLnNsaWNlKDApO2Zvcih2YXIgcj0wLGk9bi5sZW5ndGg7cjxpOysrciluW3JdLmFwcGx5KHRoaXMsdCl9cmV0dXJuIHRoaXN9LHIucHJvdG90eXBlLmxpc3RlbmVycz1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sdGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdfHxbXX0sci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzPWZ1bmN0aW9uKGUpe3JldHVybiEhdGhpcy5saXN0ZW5lcnMoZSkubGVuZ3RofX0sZnVuY3Rpb24oZSx0LG4pe3ZhciByPW4oNDYpO3QuY2xlYXJUaW1lb3V0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3RpbWVvdXQ9MCxjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpLHRoaXN9LHQucGFyc2U9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3BhcnNlcj1lLHRoaXN9LHQuc2VyaWFsaXplPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9zZXJpYWxpemVyPWUsdGhpc30sdC50aW1lb3V0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl90aW1lb3V0PWUsdGhpc30sdC50aGVuPWZ1bmN0aW9uKGUsdCl7aWYoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKXt2YXIgbj10aGlzO3RoaXMuX2Z1bGxmaWxsZWRQcm9taXNlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGUsdCl7bi5lbmQoZnVuY3Rpb24obixyKXtuP3Qobik6ZShyKX0pfSl9cmV0dXJuIHRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlLnRoZW4oZSx0KX0sdC5jYXRjaD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy50aGVuKHZvaWQgMCxlKX0sdC51c2U9ZnVuY3Rpb24oZSl7cmV0dXJuIGUodGhpcyksdGhpc30sdC5nZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2hlYWRlcltlLnRvTG93ZXJDYXNlKCldfSx0LmdldEhlYWRlcj10LmdldCx0LnNldD1mdW5jdGlvbihlLHQpe2lmKHIoZSkpe2Zvcih2YXIgbiBpbiBlKXRoaXMuc2V0KG4sZVtuXSk7cmV0dXJuIHRoaXN9cmV0dXJuIHRoaXMuX2hlYWRlcltlLnRvTG93ZXJDYXNlKCldPXQsdGhpcy5oZWFkZXJbZV09dCx0aGlzfSx0LnVuc2V0PWZ1bmN0aW9uKGUpe3JldHVybiBkZWxldGUgdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV0sZGVsZXRlIHRoaXMuaGVhZGVyW2VdLHRoaXN9LHQuZmllbGQ9ZnVuY3Rpb24oZSx0KXtpZihudWxsPT09ZXx8dm9pZCAwPT09ZSl0aHJvdyBuZXcgRXJyb3IoXCIuZmllbGQobmFtZSwgdmFsKSBuYW1lIGNhbiBub3QgYmUgZW1wdHlcIik7aWYocihlKSl7Zm9yKHZhciBuIGluIGUpdGhpcy5maWVsZChuLGVbbl0pO3JldHVybiB0aGlzfWlmKG51bGw9PT10fHx2b2lkIDA9PT10KXRocm93IG5ldyBFcnJvcihcIi5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5XCIpO3JldHVybiB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChlLHQpLHRoaXN9LHQuYWJvcnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYWJvcnRlZD90aGlzOih0aGlzLl9hYm9ydGVkPSEwLHRoaXMueGhyJiZ0aGlzLnhoci5hYm9ydCgpLHRoaXMucmVxJiZ0aGlzLnJlcS5hYm9ydCgpLHRoaXMuY2xlYXJUaW1lb3V0KCksdGhpcy5lbWl0KFwiYWJvcnRcIiksdGhpcyl9LHQud2l0aENyZWRlbnRpYWxzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dpdGhDcmVkZW50aWFscz0hMCx0aGlzfSx0LnJlZGlyZWN0cz1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fbWF4UmVkaXJlY3RzPWUsdGhpc30sdC50b0pTT049ZnVuY3Rpb24oKXtyZXR1cm57bWV0aG9kOnRoaXMubWV0aG9kLHVybDp0aGlzLnVybCxkYXRhOnRoaXMuX2RhdGEsaGVhZGVyczp0aGlzLl9oZWFkZXJ9fSx0Ll9pc0hvc3Q9ZnVuY3Rpb24oZSl7c3dpdGNoKHt9LnRvU3RyaW5nLmNhbGwoZSkpe2Nhc2VcIltvYmplY3QgRmlsZV1cIjpjYXNlXCJbb2JqZWN0IEJsb2JdXCI6Y2FzZVwiW29iamVjdCBGb3JtRGF0YV1cIjpyZXR1cm4hMDtkZWZhdWx0OnJldHVybiExfX0sdC5zZW5kPWZ1bmN0aW9uKGUpe3ZhciB0PXIoZSksbj10aGlzLl9oZWFkZXJbXCJjb250ZW50LXR5cGVcIl07aWYodCYmcih0aGlzLl9kYXRhKSlmb3IodmFyIGkgaW4gZSl0aGlzLl9kYXRhW2ldPWVbaV07ZWxzZVwic3RyaW5nXCI9PXR5cGVvZiBlPyhufHx0aGlzLnR5cGUoXCJmb3JtXCIpLG49dGhpcy5faGVhZGVyW1wiY29udGVudC10eXBlXCJdLHRoaXMuX2RhdGE9XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIj09bj90aGlzLl9kYXRhP3RoaXMuX2RhdGErXCImXCIrZTplOih0aGlzLl9kYXRhfHxcIlwiKStlKTp0aGlzLl9kYXRhPWU7cmV0dXJuIXR8fHRoaXMuX2lzSG9zdChlKT90aGlzOihufHx0aGlzLnR5cGUoXCJqc29uXCIpLHRoaXMpfX0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUpe3JldHVybiBudWxsIT09ZSYmXCJvYmplY3RcIj09dHlwZW9mIGV9ZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlLHQsbil7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uZXcgZShcIkdFVFwiLHQpLmVuZChuKToyPT1hcmd1bWVudHMubGVuZ3RoP25ldyBlKFwiR0VUXCIsdCk6bmV3IGUodCxuKX1lLmV4cG9ydHM9bn1dKX0pOyIsIi8vIEFsbG93cyB1cyB0byBjcmVhdGUgYW5kIGJpbmQgdG8gZXZlbnRzLiBFdmVyeXRoaW5nIGluIENoYXRFbmdpbmUgaXMgYW4gZXZlbnRcbi8vIGVtaXR0ZXJcbmNvbnN0IEV2ZW50RW1pdHRlcjIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIyJykuRXZlbnRFbWl0dGVyMjtcblxuY29uc3QgUHViTnViID0gcmVxdWlyZSgncHVibnViJyk7XG5cbi8vIGFsbG93cyBhc3luY2hyb25vdXMgZXhlY3V0aW9uIGZsb3cuXG5jb25zdCB3YXRlcmZhbGwgPSByZXF1aXJlKCdhc3luYy93YXRlcmZhbGwnKTtcblxuLy8gcmVxdWlyZWQgdG8gbWFrZSBBSkFYIGNhbGxzIGZvciBhdXRoXG5jb25zdCBheGlvcyA9IHJlcXVpcmUoJ2F4aW9zJyk7XG5cbi8qKlxuR2xvYmFsIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgQ2hhdEVuZ2luZX0uXG5cbkBhbGlhcyBDaGF0RW5naW5lQ29yZVxuQHBhcmFtIHBuQ29uZmlnIHtPYmplY3R9IENoYXRFbmdpbmUgaXMgYmFzZWQgb2ZmIFB1Yk51Yi4gU3VwcGx5IHlvdXIgUHViTnViIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyBoZXJlLiBTZWUgdGhlIGdldHRpbmcgc3RhcnRlZCB0dXRvcmlhbCBhbmQgW3RoZSBQdWJOdWIgZG9jc10oaHR0cHM6Ly93d3cucHVibnViLmNvbS9kb2NzL2phdmEtc2UtamF2YS9hcGktcmVmZXJlbmNlLWNvbmZpZ3VyYXRpb24pLlxuQHBhcmFtIGNlQ29uZmlnIHtPYmplY3R9IEEgbGlzdCBvZiBjaGF0IGVuZ2luZSBzcGVjaWZpYyBjb25maWcgb3B0aW9ucy5cbkBwYXJhbSBbY2VDb25maWcuZ2xvYmFsQ2hhbm5lbD1jaGF0LWVuZ2luZV0ge1N0cmluZ30gVGhlIHJvb3QgY2hhbm5lbC4gU2VlIHtAbGluayBDaGF0RW5naW5lLmdsb2JhbH1cbkBwYXJhbSBbY2VDb25maWcuYXV0aFVybF0ge1N0cmluZ30gVGhlIHJvb3QgVVJMIHVzZWQgdG8gbWFuYWdlIHBlcm1pc3Npb25zIGZvciBwcml2YXRlIGNoYW5uZWxzLiBPbWl0dGluZyB0aGlzIGZvcmNlcyBpbnNlY3VyZSBtb2RlLlxuQHBhcmFtIFtjZUNvbmZpZy50aHJvd0Vycm9ycz10cnVlXSB7Qm9vbGVhbn0gVGhyb3dzIGVycm9ycyBpbiBKUyBjb25zb2xlLlxuQHBhcmFtIFtjZUNvbmZpZy5pbnNlY3VyZT10cnVlXSB7Qm9vbGVhbn0gRm9yY2UgaW50byBpbnNlY3VyZSBtb2RlLiBXaWxsIGlnbm9yZSBhdXRoVXJsIGFuZCBhbGwgQ2hhdHMgd2lsbCBiZSBwdWJsaWMuXG5AcmV0dXJuIHtDaGF0RW5naW5lfSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIHtAbGluayBDaGF0RW5naW5lfVxuQGV4YW1wbGVcbkNoYXRFbmdpbmUgPSBDaGF0RW5naW5lQ29yZS5jcmVhdGUoe1xuICAgIHB1Ymxpc2hLZXk6ICdkZW1vJyxcbiAgICBzdWJzY3JpYmVLZXk6ICdkZW1vJ1xufSwge1xuICAgIGF1dGhVcmw6ICdodHRwOi8vbG9jYWxob3N0L2F1dGgnLFxuICAgIGdsb2JhbENoYW5uZWw6ICdjaGF0LWVuZ2luZS1nbG9iYWwtY2hhbm5lbCdcbn0pO1xuKi9cbmNvbnN0IGNyZWF0ZSA9IGZ1bmN0aW9uKHBuQ29uZmlnLCBjZUNvbmZpZyA9IHt9KSB7XG5cbiAgICBsZXQgQ2hhdEVuZ2luZSA9IGZhbHNlO1xuXG4gICAgaWYoY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCkge1xuICAgICAgICBjZUNvbmZpZy5nbG9iYWxDaGFubmVsID0gY2VDb25maWcuZ2xvYmFsQ2hhbm5lbC50b1N0cmluZygpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCA9ICdjaGF0LWVuZ2luZSc7XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNlQ29uZmlnLnRocm93RXJyb3JzID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgY2VDb25maWcudGhyb3dFcnJvcnMgPSB0cnVlO1xuICAgIH1cblxuICAgIGNlQ29uZmlnLmluc2VjdXJlID0gY2VDb25maWcuaW5zZWN1cmUgfHwgZmFsc2U7XG4gICAgaWYoIWNlQ29uZmlnLmF1dGhVcmwpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdDaGF0RW5naW5lIGlzIHJ1bm5pbmcgaW4gaW5zZWN1cmUgbW9kZS4gU3VwcGx5IGEgYXV0aFVybCB0byBydW4gaW4gc2VjdXJlIG1vZGUuJyk7XG4gICAgICAgIGNlQ29uZmlnLmluc2VjdXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0aHJvd0Vycm9yID0gZnVuY3Rpb24oc2VsZiwgY2IsIGtleSwgY2VFcnJvciwgcGF5bG9hZCA9IHt9KSB7XG5cbiAgICAgICAgaWYoY2VDb25maWcudGhyb3dFcnJvcnMpIHtcbiAgICAgICAgICAgIC8vIHRocm93IGNlRXJyb3I7XG4gICAgICAgICAgICB0aHJvdyBjZUVycm9yO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF5bG9hZC5jZUVycm9yID0gY2VFcnJvci50b1N0cmluZygpO1xuXG4gICAgICAgIHNlbGZbY2JdKFsnJCcsICdlcnJvcicsIGtleV0uam9pbignLicpLCBwYXlsb2FkKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICogVGhlIHtAbGluayBDaGF0RW5naW5lfSBvYmplY3QgaXMgYSBSb290RW1pdHRlci4gQ29uZmlndXJlcyBhbiBldmVudCBlbWl0dGVyIHRoYXQgb3RoZXIgQ2hhdEVuZ2luZSBvYmplY3RzIGluaGVyaXQuIEFkZHMgc2hvcnRjdXQgbWV0aG9kcyBmb3JcbiAgICAqIGBgYHRoaXMub24oKWBgYCwgYGBgdGhpcy5lbWl0KClgYGAsIGV0Yy5cbiAgICAqL1xuICAgIGNsYXNzIFJvb3RFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBDcmVhdGUgYSBuZXcgRXZlbnRFbWl0dGVyMiBvYmplY3QgZm9yIHRoaXMgY2xhc3MuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjIoe1xuICAgICAgICAgICAgICB3aWxkY2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgbmV3TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICAgIG1heExpc3RlbmVyczogNTAsXG4gICAgICAgICAgICAgIHZlcmJvc2VNZW1vcnlMZWFrOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gd2UgYmluZCB0byBtYWtlIHN1cmUgd2lsZGNhcmRzIHdvcmtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc3luY2x5L0V2ZW50RW1pdHRlcjIvaXNzdWVzLzE4NlxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFByaXZhdGUgZW1pdCBtZXRob2QgdGhhdCBicm9hZGNhc3RzIHRoZSBldmVudCB0byBsaXN0ZW5lcnMgb24gdGhpcyBwYWdlLlxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gdGhlIGV2ZW50IHBheWxvYWRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9lbWl0ID0gdGhpcy5lbWl0dGVyLmVtaXQuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIExpc3RlbiBmb3IgYSBzcGVjaWZpYyBldmVudCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkLiBUaGlzIGlzIHJlc2VydmVkIGluIGNhc2UgYGBgdGhpcy5vbmBgYCBpcyBvdmVyd3JpdHRlbi5cblxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICB0aGlzLl9vbiA9IHRoaXMuZW1pdHRlci5vbi5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGEgc3BlY2lmaWMgZXZlbnQgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZC4gU3VwcG9ydHMgd2lsZGNhcmQgbWF0Y2hpbmcuXG4gICAgICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgZXZlbnQgaXMgZW1pdHRlZFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBHZXQgbm90aWZpZWQgd2hlbmV2ZXIgc29tZW9uZSBqb2lucyB0aGUgcm9vbVxuICAgICAgICAgICAgKiBvYmplY3Qub24oJ2V2ZW50JywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudCB3YXMgZmlyZWQnKS5cbiAgICAgICAgICAgICogfSlcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gR2V0IG5vdGlmaWVkIG9mIGV2ZW50LmEgYW5kIGV2ZW50LmJcbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudC4qJywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudC5hIG9yIGV2ZW50LmIgd2FzIGZpcmVkJykuO1xuICAgICAgICAgICAgKiB9KVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub24gPSB0aGlzLmVtaXR0ZXIub24uYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogU3RvcCBhIGNhbGxiYWNrIGZyb20gbGlzdGVuaW5nIHRvIGFuIGV2ZW50LlxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbihwYXlsb2FkOykge1xuICAgICAgICAgICAgKiAgICBjb25zb2xlLmxvZygnc29tZXRoaW5nIGhhcHBlbmQhJyk7XG4gICAgICAgICAgICAqIH07XG4gICAgICAgICAgICAqIG9iamVjdC5vbignZXZlbnQnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAqIC8vIC4uLlxuICAgICAgICAgICAgKiBvYmplY3Qub2ZmKCdldmVudCcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9mZiA9IHRoaXMuZW1pdHRlci5vZmYuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogTGlzdGVuIGZvciBhbnkgZXZlbnQgb24gdGhpcyBvYmplY3QgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZFxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiBhbnkgZXZlbnQgaXMgZW1pdHRlZC4gRmlyc3QgcGFyYW1ldGVyIGlzIHRoZSBldmVudCBuYW1lIGFuZCBzZWNvbmQgaXMgdGhlIHBheWxvYWQuXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIG9iamVjdC5vbkFueSgoZXZlbnQsIHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdBbGwgZXZlbnRzIHRyaWdnZXIgdGhpcy4nKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbkFueSA9IHRoaXMuZW1pdHRlci5vbkFueS5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGFuIGV2ZW50IGFuZCBvbmx5IGZpcmUgdGhlIGNhbGxiYWNrIGEgc2luZ2xlIHRpbWVcbiAgICAgICAgICAgICogQG1ldGhvZFxuICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biBvbmNlXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIG9iamVjdC5vbmNlKCdtZXNzYWdlJywgPT4gKGV2ZW50LCBwYXlsb2FkKSB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVGhpcyBpcyBvbmx5IGZpcmVkIG9uY2UhJyk7XG4gICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub25jZSA9IHRoaXMuZW1pdHRlci5vbmNlLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBSZXByZXNlbnRzIGFuIGV2ZW50IHRoYXQgbWF5IGJlIGVtaXR0ZWQgb3Igc3Vic2NyaWJlZCB0by5cbiAgICAqL1xuICAgIGNsYXNzIEV2ZW50IHtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjaGF0LCBldmVudCkge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEV2ZW50cyBhcmUgYWx3YXlzIGEgcHJvcGVydHkgb2YgYSB7QGxpbmsgQ2hhdH0uIFJlc3BvbnNpYmxlIGZvclxuICAgICAgICAgICAgbGlzdGVuaW5nIHRvIHNwZWNpZmljIGV2ZW50cyBhbmQgZmlyaW5nIGV2ZW50cyB3aGVuIHRoZXkgb2NjdXIuXG4gICAgICAgICAgICBAcmVhZG9ubHlcbiAgICAgICAgICAgIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgQHNlZSBbUHViTnViIENoYW5uZWxzXShodHRwczovL3N1cHBvcnQucHVibnViLmNvbS9zdXBwb3J0L3NvbHV0aW9ucy9hcnRpY2xlcy8xNDAwMDA0NTE4Mi13aGF0LWlzLWEtY2hhbm5lbC0pXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhdC5jaGFubmVsO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFB1Ymxpc2hlcyB0aGUgZXZlbnQgb3ZlciB0aGUgUHViTnViIG5ldHdvcmsgdG8gdGhlIHtAbGluayBFdmVudH0gY2hhbm5lbFxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoID0gKG0pID0+IHtcblxuICAgICAgICAgICAgICAgIG0uZXZlbnQgPSBldmVudDtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICAgICB9LCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHN0YXR1cy5zdGF0dXNDb2RlID09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKCckLnB1Ymxpc2guc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogVGhlcmUgd2FzIGEgcHJvYmxlbSBwdWJsaXNoaW5nIG92ZXIgdGhlIFB1Yk51YiBuZXR3b3JrLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwicHVibGlzaFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoY2hhdCwgJ3RyaWdnZXInLCAncHVibGlzaCcsIG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBwdWJsaXNoaW5nIG92ZXIgdGhlIFB1Yk51YiBuZXR3b3JrLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBzdGF0dXMuZXJyb3JEYXRhLnJlc3BvbnNlLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvckRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEZvcndhcmRzIGV2ZW50cyB0byB0aGUgQ2hhdCB0aGF0IHJlZ2lzdGVyZWQgdGhlIGV2ZW50IHtAbGluayBDaGF0fVxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbk1lc3NhZ2UgPSAobSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IG0uY2hhbm5lbCAmJiBtLm1lc3NhZ2UuZXZlbnQgPT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKG0ubWVzc2FnZS5ldmVudCwgbS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2FsbCBvbk1lc3NhZ2Ugd2hlbiBQdWJOdWIgcmVjZWl2ZXMgYW4gZXZlbnRcbiAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm9uTWVzc2FnZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgQW4gQ2hhdEVuZ2luZSBnZW5lcmljIGVtaXR0ZXIgdGhhdCBzdXBwb3J0cyBwbHVnaW5zIGFuZCBmb3J3YXJkc1xuICAgIGV2ZW50cyB0byB0aGUgcm9vdCBlbWl0dGVyLlxuICAgIEBleHRlbmRzIFJvb3RFbWl0dGVyXG4gICAgKi9cbiAgICBjbGFzcyBFbWl0dGVyIGV4dGVuZHMgUm9vdEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEVtaXQgZXZlbnRzIGxvY2FsbHkuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fZW1pdCA9IChldmVudCwgZGF0YSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gYWxsIGV2ZW50cyBhcmUgZm9yd2FyZGVkIHRvIENoYXRFbmdpbmUgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gc28geW91IGNhbiBnbG9iYWxseSBiaW5kIHRvIGV2ZW50cyB3aXRoIENoYXRFbmdpbmUub24oKVxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuX2VtaXQoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gZW1pdCB0aGUgZXZlbnQgZnJvbSB0aGUgb2JqZWN0IHRoYXQgY3JlYXRlZCBpdFxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KGV2ZW50LCBkYXRhKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogTGlzdGVuIGZvciBhIHNwZWNpZmljIGV2ZW50IGFuZCBmaXJlIGEgY2FsbGJhY2sgd2hlbiBpdCdzIGVtaXR0ZWQuIFN1cHBvcnRzIHdpbGRjYXJkIG1hdGNoaW5nLlxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gR2V0IG5vdGlmaWVkIHdoZW5ldmVyIHNvbWVvbmUgam9pbnMgdGhlIHJvb21cbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudCcsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZXZlbnQgd2FzIGZpcmVkJykuXG4gICAgICAgICAgICAqIH0pXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIEdldCBub3RpZmllZCBvZiBldmVudC5hIGFuZCBldmVudC5iXG4gICAgICAgICAgICAqIG9iamVjdC5vbignZXZlbnQuKicsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnZXZlbnQuYSBvciBldmVudC5iIHdhcyBmaXJlZCcpLjtcbiAgICAgICAgICAgICogfSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uID0gKGV2ZW50LCBjYikgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8ga2VlcCB0cmFjayBvZiBhbGwgZXZlbnRzIG9uIHRoaXMgZW1pdHRlclxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBuZXcgRXZlbnQodGhpcywgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2FsbCB0aGUgcHJpdmF0ZSBfb24gcHJvcGVydHlcbiAgICAgICAgICAgICAgICB0aGlzLl9vbihldmVudCwgY2IpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFN0b3JlcyBhIGxpc3Qgb2YgcGx1Z2lucyBib3VuZCB0byB0aGlzIG9iamVjdFxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnMgPSBbXTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBCaW5kcyBhIHBsdWdpbiB0byB0aGlzIG9iamVjdFxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IG1vZHVsZSBUaGUgcGx1Z2luIG1vZHVsZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMucGx1Z2luID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgdGhpcyBwbHVnaW4gdG8gYSBsaXN0IG9mIHBsdWdpbnMgZm9yIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zLnB1c2gobW9kdWxlKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIG5hbWUgb2YgdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBzZWUgaWYgdGhlcmUgYXJlIHBsdWdpbnMgdG8gYXR0YWNoIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICBpZihtb2R1bGUuZXh0ZW5kcyAmJiBtb2R1bGUuZXh0ZW5kc1tjbGFzc05hbWVdKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYXR0YWNoIHRoZSBwbHVnaW5zIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgLy8gdW5kZXIgdGhlaXIgbmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuYWRkQ2hpbGQodGhpcywgbW9kdWxlLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBtb2R1bGUuZXh0ZW5kc1tjbGFzc05hbWVdKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzW21vZHVsZS5uYW1lc3BhY2VdLkNoYXRFbmdpbmUgPSBDaGF0RW5naW5lO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBwbHVnaW4gaGFzIGEgc3BlY2lhbCBjb25zdHJ1Y3QgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gcnVuIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uY29uc3RydWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW21vZHVsZS5uYW1lc3BhY2VdLmNvbnN0cnVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgIFRoaXMgaXMgdGhlIHJvb3Qge0BsaW5rIENoYXR9IGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIGNoYXQgcm9vbVxuXG4gICAgQHBhcmFtIHtTdHJpbmd9IFtjaGFubmVsPW5ldyBEYXRlKCkuZ2V0VGltZSgpXSBBIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIGNoYXQge0BsaW5rIENoYXR9LiBUaGUgY2hhbm5lbCBpcyB0aGUgdW5pcXVlIG5hbWUgb2YgYSB7QGxpbmsgQ2hhdH0sIGFuZCBpcyB1c3VhbGx5IHNvbWV0aGluZyBsaWtlIFwiVGhlIFdhdGVyY29vbGVyXCIsIFwiU3VwcG9ydFwiLCBvciBcIk9mZiBUb3BpY1wiLiBTZWUgW1B1Yk51YiBDaGFubmVsc10oaHR0cHM6Ly9zdXBwb3J0LnB1Ym51Yi5jb20vc3VwcG9ydC9zb2x1dGlvbnMvYXJ0aWNsZXMvMTQwMDAwNDUxODItd2hhdC1pcy1hLWNoYW5uZWwtKS5cbiAgICBAcGFyYW0ge0Jvb2xlYW59IFthdXRvQ29ubmVjdD10cnVlXSBDb25uZWN0IHRvIHRoaXMgY2hhdCBhcyBzb29uIGFzIGl0cyBpbml0aWF0ZWQuIElmIHNldCB0byBgYGBmYWxzZWBgYCwgY2FsbCB0aGUge0BsaW5rIENoYXQjY29ubmVjdH0gbWV0aG9kIHRvIGNvbm5lY3QgdG8gdGhpcyB7QGxpbmsgQ2hhdH0uXG4gICAgQHBhcmFtIHtCb29sZWFufSBbbmVlZEdyYW50PXRydWVdIFRoaXMgQ2hhdCBoYXMgcmVzdHJpY3RlZCBwZXJtaXNzaW9ucyBhbmQgd2UgbmVlZCB0byBhdXRoZW50aWNhdGUgb3Vyc2VsdmVzIGluIG9yZGVyIHRvIGNvbm5lY3QuXG4gICAgQGV4dGVuZHMgRW1pdHRlclxuICAgIEBmaXJlcyBDaGF0IyRcIi5cInJlYWR5XG4gICAgQGZpcmVzIENoYXQjJFwiLlwic3RhdGVcbiAgICBAZmlyZXMgQ2hhdCMkXCIuXCJvbmxpbmVcbiAgICBAZmlyZXMgQ2hhdCMkXCIuXCJvZmZsaW5lXG4gICAgKi9cbiAgICBjbGFzcyBDaGF0IGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoY2hhbm5lbCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCBuZWVkR3JhbnQgPSB0cnVlLCBhdXRvQ29ubmVjdCA9IHRydWUsIGdyb3VwID0gJ2RlZmF1bHQnKSB7XG5cbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIGlmKGNlQ29uZmlnLmluc2VjdXJlKSB7XG4gICAgICAgICAgICAgICAgbmVlZEdyYW50ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBBIHN0cmluZyBpZGVudGlmaWVyIGZvciB0aGUgQ2hhdCByb29tLlxuICAgICAgICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAgICAqIEBzZWUgW1B1Yk51YiBDaGFubmVsc10oaHR0cHM6Ly9zdXBwb3J0LnB1Ym51Yi5jb20vc3VwcG9ydC9zb2x1dGlvbnMvYXJ0aWNsZXMvMTQwMDAwNDUxODItd2hhdC1pcy1hLWNoYW5uZWwtKVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWwudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgbGV0IGNoYW5Qcml2U3RyaW5nID0gJ3B1YmxpYy4nO1xuICAgICAgICAgICAgaWYobmVlZEdyYW50KSB7XG4gICAgICAgICAgICAgICAgY2hhblByaXZTdHJpbmcgPSAncHJpdmF0ZS4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmNoYW5uZWwuaW5kZXhPZihjZUNvbmZpZy5nbG9iYWxDaGFubmVsKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IFtjZUNvbmZpZy5nbG9iYWxDaGFubmVsLCAnY2hhdCcsIGNoYW5Qcml2U3RyaW5nLCBjaGFubmVsXS5qb2luKCcjJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXNQcml2YXRlID0gbmVlZEdyYW50O1xuXG4gICAgICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgQSBsaXN0IG9mIHVzZXJzIGluIHRoaXMge0BsaW5rIENoYXR9LiBBdXRvbWF0aWNhbGx5IGtlcHQgaW4gc3luYyBhcyB1c2VycyBqb2luIGFuZCBsZWF2ZSB0aGUgY2hhdC5cbiAgICAgICAgICAgIFVzZSBbJC5qb2luXSgvQ2hhdC5odG1sI2V2ZW50OiQlMjUyMi4lMjUyMmpvaW4pIGFuZCByZWxhdGVkIGV2ZW50cyB0byBnZXQgbm90aWZpZWQgd2hlbiB0aGlzIGNoYW5nZXNcblxuICAgICAgICAgICAgQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICBAcmVhZG9ubHlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnVzZXJzID0ge307XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgQSBtYXAgb2Yge0BsaW5rIEV2ZW50fSBib3VuZCB0byB0aGlzIHtAbGluayBDaGF0fVxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICBAcmVhZG9ubHlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IHt9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgVXBkYXRlcyBsaXN0IG9mIHtAbGluayBVc2VyfXMgaW4gdGhpcyB7QGxpbmsgQ2hhdH1cbiAgICAgICAgICAgIGJhc2VkIG9uIHdobyBpcyBvbmxpbmUgbm93LlxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IHN0YXR1cyBUaGUgcmVzcG9uc2Ugc3RhdHVzXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlIHBheWxvYWQgb2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbkhlcmVOb3cgPSAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYoc3RhdHVzLmVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICogVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB0aGUgcHJlc2VuY2Ugb2YgdGhpcyBjaGF0XG4gICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwiZXJyb3JcIi5cInByZXNlbmNlXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAncHJlc2VuY2UnLCBuZXcgRXJyb3IoJ0dldHRpbmcgcHJlc2VuY2Ugb2YgdGhpcyBDaGF0LiBNYWtlIHN1cmUgUHViTnViIHByZXNlbmNlIGlzIGVuYWJsZWQgZm9yIHRoaXMga2V5JyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzdGF0dXMuZXJyb3JEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBzdGF0dXMuZXJyb3JEYXRhLnJlc3BvbnNlLnRleHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbGlzdCBvZiBvY2N1cGFudHMgaW4gdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgICAgIGxldCBvY2N1cGFudHMgPSByZXNwb25zZS5jaGFubmVsc1t0aGlzLmNoYW5uZWxdLm9jY3VwYW50cztcblxuICAgICAgICAgICAgICAgICAgICAvLyBmb3JtYXQgdGhlIHVzZXJMaXN0IGZvciBybHRtLmpzIHN0YW5kYXJkXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBvY2N1cGFudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlclVwZGF0ZShvY2N1cGFudHNbaV0udXVpZCwgb2NjdXBhbnRzW2ldLnN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogR2V0IG1lc3NhZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1Ymxpc2hlZCB0byB0aGUgbmV0d29yayBiZWZvcmUgdGhpcyBjbGllbnQgd2FzIGNvbm5lY3RlZC5cbiAgICAgICAgICAgICogRXZlbnRzIGFyZSBwdWJsaXNoZWQgd2l0aCB0aGUgYGBgJGhpc3RvcnlgYGAgcHJlZml4LiBTbyBmb3IgZXhhbXBsZSwgaWYgeW91IGhhZCB0aGUgZXZlbnQgYGBgbWVzc2FnZWBgYCxcbiAgICAgICAgICAgICogeW91IHdvdWxkIGNhbGwgYGBgQ2hhdC5oaXN0b3J5KCdtZXNzYWdlJylgYGAgYW5kIHN1YnNjcmliZSB0byBoaXN0b3J5IGV2ZW50cyB2aWEgYGBgY2hhdC5vbignJGhpc3RvcnkubWVzc2FnZScsIChkYXRhKSA9PiB7fSlgYGAuXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgd2UncmUgZ2V0dGluZyBoaXN0b3J5IGZvclxuICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZ10gVGhlIFB1Yk51YiBoaXN0b3J5IGNvbmZpZyBmb3IgdGhpcyBjYWxsXG4gICAgICAgICAgICAqIEB0dXRvcmlhbCBoaXN0b3J5XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5oaXN0b3J5ID0gKGV2ZW50LCBjb25maWcgPSB7fSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBldmVudCBpZiBpdCBkb2VzIG5vdCBleGlzdFxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBuZXcgRXZlbnQodGhpcywgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBQdWJOdWIgY29uZmlndXJlZCBjaGFubmVsIHRvIHRoaXMgY2hhbm5lbFxuICAgICAgICAgICAgICAgIGNvbmZpZy5jaGFubmVsID0gdGhpcy5ldmVudHNbZXZlbnRdLmNoYW5uZWw7XG5cbiAgICAgICAgICAgICAgICAvLyBydW4gdGhlIFB1Yk51YiBoaXN0b3J5IG1ldGhvZCBmb3IgdGhpcyBldmVudFxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmhpc3RvcnkoY29uZmlnLCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHN0YXR1cy5lcnJvcikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB0aGUgaGlzdG9yeSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwiZXJyb3JcIi5cImhpc3RvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ2hpc3RvcnknLCBuZXcgRXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gZmV0Y2hpbmcgdGhlIGhpc3RvcnkuIE1ha2Ugc3VyZSBoaXN0b3J5IGlzIGVuYWJsZWQgZm9yIHRoaXMgUHViTnViIGtleS4nKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogc3RhdHVzLmVycm9yRGF0YS5yZXNwb25zZS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzdGF0dXMuZXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5tZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtZXNzYWdlLmVudHJ5LmV2ZW50ID09IGV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZWQgYnkgdGhlIHtAbGluayBDaGF0I2hpc3Rvcnl9IGNhbGwuIEVtaXRzIG9sZCBldmVudHMgYWdhaW4uIEV2ZW50cyBhcmUgcHJlcGVuZGVkIHdpdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBgYGAkLmhpc3RvcnkuYGBgIHRvIGRpc3Rpbmd1aXNoIGl0IGZyb20gdGhlIG9yaWdpbmFsIGxpdmUgZXZlbnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cImhpc3RvcnlcIi5cIipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBAdHV0b3JpYWwgaGlzdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbJyQnLCAnaGlzdG9yeScsIGV2ZW50XS5qb2luKCcuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmVudHJ5KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vYmplY3RpZnkgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWwsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiB0aGlzLmdyb3VwLFxuICAgICAgICAgICAgICAgICAgICBwcml2YXRlOiB0aGlzLmlzUHJpdmF0ZVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogSW52aXRlIGEgdXNlciB0byB0aGlzIENoYXQuIEF1dGhvcml6ZXMgdGhlIGludml0ZWQgdXNlciBpbiB0aGUgQ2hhdCBhbmQgc2VuZHMgdGhlbSBhbiBpbnZpdGUgdmlhIHtAbGluayBVc2VyI2RpcmVjdH0uXG4gICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gdXNlciBUaGUge0BsaW5rIFVzZXJ9IHRvIGludml0ZSB0byB0aGlzIGNoYXRyb29tLlxuICAgICAgICAgICAgKiBAZmlyZXMgTWUjZXZlbnQ6JFwiLlwiaW52aXRlXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIC8vIG9uZSB1c2VyIHJ1bm5pbmcgQ2hhdEVuZ2luZVxuICAgICAgICAgICAgKiBsZXQgc2VjcmV0Q2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQoJ3NlY3JldC1jaGFubmVsJyk7XG4gICAgICAgICAgICAqIHNlY3JldENoYXQuaW52aXRlKHNvbWVvbmVFbHNlKTtcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gc29tZW9uZUVsc2UgaW4gYW5vdGhlciBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgICAgICAgICAqIG1lLmRpcmVjdC5vbignJC5pbnZpdGUnLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgKiAgICAgbGV0IHNlY3JldENoYXQgPSBuZXcgQ2hhdEVuZ2luZS5DaGF0KHBheWxvYWQuZGF0YS5jaGFubmVsKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbnZpdGUgPSAodXNlcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IGNvbXBsZXRlID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZW5kID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogTm90aWZpZXMge0BsaW5rIE1lfSB0aGF0IHRoZXkndmUgYmVlbiBpbnZpdGVkIHRvIGEgbmV3IHByaXZhdGUge0BsaW5rIENoYXR9LlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlZCBieSB0aGUge0BsaW5rIENoYXQjaW52aXRlfSBtZXRob2QuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBNZSMkXCIuXCJpbnZpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogQHR1dG9yaWFsIHByaXZhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICogbWUuZGlyZWN0Lm9uKCckLmludml0ZScsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAqICAgIGxldCBwcml2Q2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQocGF5bG9hZC5kYXRhLmNoYW5uZWwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3QuZW1pdCgnJC5pbnZpdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jaGFubmVsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIXVzZXIuZGlyZWN0LmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3QuY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5kaXJlY3Qub24oJyQuY29ubmVjdGVkJywgc2VuZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKGNlQ29uZmlnLmluc2VjdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBheGlvcy5wb3N0KGNlQ29uZmlnLmF1dGhVcmwgKyAnL2NoYXQvaW52aXRlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aEtleTogcG5Db25maWcuYXV0aEtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHVzZXIudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG15VVVJRDogQ2hhdEVuZ2luZS5tZS51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IENoYXRFbmdpbmUubWUuYXV0aERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0OiB0aGlzLm9iamVjdGlmeSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIG1ha2luZyBhIHJlcXVlc3QgdG8gYXV0aGVudGljYXRpb24gc2VydmVyLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgS2VlcCB0cmFjayBvZiB7QGxpbmsgVXNlcn1zIGluIHRoZSByb29tIGJ5IHN1YnNjcmliaW5nIHRvIFB1Yk51YiBwcmVzZW5jZSBldmVudHMuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgUHViTnViIHByZXNlbmNlIHJlc3BvbnNlIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vblByZXNlbmNlID0gKHByZXNlbmNlRXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBjaGFubmVsIG1hdGNoZXMgdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IHByZXNlbmNlRXZlbnQuY2hhbm5lbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgam9pbnMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcImpvaW5cIikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHRoaXMuY3JlYXRlVXNlcihwcmVzZW5jZUV2ZW50LnV1aWQsIHByZXNlbmNlRXZlbnQuc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogRmlyZWQgd2hlbiBhIHtAbGluayBVc2VyfSBoYXMgam9pbmVkIHRoZSByb29tLlxuICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvbmxpbmVcIi5cImpvaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHBheWxvYWQgcmV0dXJuZWQgYnkgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBjYW1lIG9ubGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBjaGF0Lm9uKCckLmpvaW4nLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgaGFzIGpvaW5lZCB0aGUgcm9vbSEnLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub25saW5lLmpvaW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgbGVhdmVzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJsZWF2ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJMZWF2ZShwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSB0aW1lc291dFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcInRpbWVvdXRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyRGlzY29ubmVjdChwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSdzIHN0YXRlIGlzIHVwZGF0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJzdGF0ZS1jaGFuZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKHByZXNlbmNlRXZlbnQudXVpZCwgcHJlc2VuY2VFdmVudC5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCb29sZWFuIHZhbHVlIHRoYXQgaW5kaWNhdGVzIG9mIHRoZSBDaGF0IGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29ya1xuICAgICAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vblByZXAgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZighdGhpcy5jb25uZWN0ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZighQ2hhdEVuZ2luZS5wdWJudWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnc2V0dXAnLCBuZXcgRXJyb3IoJ1lvdSBtdXN0IGNhbGwgQ2hhdEVuZ2luZS5jb25uZWN0KCkgYW5kIHdhaXQgZm9yIHRoZSAkLnJlYWR5IGV2ZW50IGJlZm9yZSBjcmVhdGluZyBuZXcgQ2hhdHMuJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbGlzdGVuIHRvIGFsbCBQdWJOdWIgZXZlbnRzIGZvciB0aGlzIENoYXRcbiAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5vbk1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZTogdGhpcy5vblByZXNlbmNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHN1YnNjcmliZSB0byB0aGUgUHViTnViIGNoYW5uZWwgZm9yIHRoaXMgQ2hhdFxuICAgICAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2l0aFByZXNlbmNlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5ncmFudCA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVDaGF0ID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGF4aW9zLnBvc3QoY2VDb25maWcuYXV0aFVybCArICcvY2hhdHMnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxDaGFubmVsOiBjZUNvbmZpZy5nbG9iYWxDaGFubmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aEtleTogcG5Db25maWcuYXV0aEtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHBuQ29uZmlnLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoRGF0YTogQ2hhdEVuZ2luZS5tZS5hdXRoRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXQ6IHRoaXMub2JqZWN0aWZ5KClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUHJlcCgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnYXV0aCcsIG5ldyBFcnJvcignU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgbWFraW5nIGEgcmVxdWVzdCB0byBhdXRoZW50aWNhdGlvbiBzZXJ2ZXIuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoY2VDb25maWcuaW5zZWN1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNoYXQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGF4aW9zLnBvc3QoY2VDb25maWcuYXV0aFVybCArICcvY2hhdC9ncmFudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbENoYW5uZWw6IGNlQ29uZmlnLmdsb2JhbENoYW5uZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoS2V5OiBwbkNvbmZpZy5hdXRoS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogcG5Db25maWcudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhEYXRhOiBDaGF0RW5naW5lLm1lLmF1dGhEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdDogdGhpcy5vYmplY3RpZnkoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNoYXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIG1ha2luZyBhIHJlcXVlc3QgdG8gYXV0aGVudGljYXRpb24gc2VydmVyLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQ29ubmVjdCB0byBQdWJOdWIgc2VydmVycyB0byBpbml0aWFsaXplIHRoZSBjaGF0LlxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiAvLyBjcmVhdGUgYSBuZXcgY2hhdHJvb20sIGJ1dCBkb24ndCBjb25uZWN0IHRvIGl0IGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICogbGV0IGNoYXQgPSBuZXcgQ2hhdCgnc29tZS1jaGF0JywgZmFsc2UpXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIGNvbm5lY3QgdG8gdGhlIGNoYXQgd2hlbiB3ZSBmZWVsIGxpa2UgaXRcbiAgICAgICAgICAgICogY2hhdC5jb25uZWN0KCk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JhbnQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmKGF1dG9Db25uZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFudCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBDaGF0RW5naW5lLmNoYXRzW3RoaXMuY2hhbm5lbF0gPSB0aGlzO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBTZW5kIGV2ZW50cyB0byBvdGhlciBjbGllbnRzIGluIHRoaXMge0BsaW5rIFVzZXJ9LlxuICAgICAgICAqIEV2ZW50cyBhcmUgdHJpZ2dlciBvdmVyIHRoZSBuZXR3b3JrICBhbmQgYWxsIGV2ZW50cyBhcmUgbWFkZVxuICAgICAgICAqIG9uIGJlaGFsZiBvZiB7QGxpbmsgTWV9XG4gICAgICAgICpcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAqIGNoYXQuZW1pdCgnY3VzdG9tLWV2ZW50Jywge3ZhbHVlOiB0cnVlfSk7XG4gICAgICAgICogY2hhdC5vbignY3VzdG9tLWV2ZW50JywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgKiAgICAgY29uc29sZS5sb2cocGF5bG9hZC5zZW5kZXIudXVpZCwgJ2VtaXR0ZWQgdGhlIHZhbHVlJywgcGF5bG9hZC5kYXRhLnZhbHVlKTtcbiAgICAgICAgKiB9KTtcbiAgICAgICAgKi9cbiAgICAgICAgZW1pdChldmVudCwgZGF0YSkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBzdGFuZGFyZGl6ZWQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgIGxldCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsICAgICAgICAgICAgLy8gdGhlIGRhdGEgc3VwcGxpZWQgZnJvbSBwYXJhbXNcbiAgICAgICAgICAgICAgICBzZW5kZXI6IENoYXRFbmdpbmUubWUudXVpZCwgICAvLyBteSBvd24gdXVpZFxuICAgICAgICAgICAgICAgIGNoYXQ6IHRoaXMsICAgICAgICAgICAgLy8gYW4gaW5zdGFuY2Ugb2YgdGhpcyBjaGF0XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBydW4gdGhlIHBsdWdpbiBxdWV1ZSB0byBtb2RpZnkgdGhlIGV2ZW50XG4gICAgICAgICAgICB0aGlzLnJ1blBsdWdpblF1ZXVlKCdlbWl0JywgZXZlbnQsIChuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCBwYXlsb2FkKTtcbiAgICAgICAgICAgIH0sIChlcnIsIHBheWxvYWQpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBjaGF0IG90aGVyd2lzZSBpdCB3b3VsZCBiZSBzZXJpYWxpemVkXG4gICAgICAgICAgICAgICAgLy8gaW5zdGVhZCwgaXQncyByZWJ1aWx0IG9uIHRoZSBvdGhlciBlbmQuXG4gICAgICAgICAgICAgICAgLy8gc2VlIHRoaXMudHJpZ2dlclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXlsb2FkLmNoYXQ7XG5cbiAgICAgICAgICAgICAgICAvLyBwdWJsaXNoIHRoZSBldmVudCBhbmQgZGF0YSBvdmVyIHRoZSBjb25maWd1cmVkIGNoYW5uZWxcblxuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgZXZlbnQgZXhpc3RzIHdpdGhpbiB0aGUgZ2xvYmFsIHNwYWNlXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gdGhpcy5ldmVudHNbZXZlbnRdIHx8IG5ldyBFdmVudCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0ucHVibGlzaChwYXlsb2FkKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBCcm9hZGNhc3RzIGFuIGV2ZW50IGxvY2FsbHkgdG8gYWxsIGxpc3RlbmVycy5cblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgQHBhcmFtIHtPYmplY3R9IHBheWxvYWQgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICovXG5cbiAgICAgICAgdHJpZ2dlcihldmVudCwgcGF5bG9hZCkge1xuXG4gICAgICAgICAgICBsZXQgY29tcGxldGUgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgcGx1Z2lucyBtb2RpZnkgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5QbHVnaW5RdWV1ZSgnb24nLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dChudWxsLCBwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyLCBwYXlsb2FkKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZW1pdCB0aGlzIGV2ZW50IHRvIGFueSBsaXN0ZW5lclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0KGV2ZW50LCBwYXlsb2FkKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoaXMgY2FuIGJlIG1hZGUgaW50byBwbHVnaW5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXlsb2FkID09IFwib2JqZWN0XCIpIHtcblxuICAgICAgICAgICAgICAgIC8vIHJlc3RvcmUgY2hhdCBpbiBwYXlsb2FkXG4gICAgICAgICAgICAgICAgaWYoIXBheWxvYWQuY2hhdCkge1xuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmNoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHR1cm4gYSB1dWlkIGZvdW5kIGluIHBheWxvYWQuc2VuZGVyIHRvIGEgcmVhbCB1c2VyXG4gICAgICAgICAgICAgICAgaWYocGF5bG9hZC5zZW5kZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZihDaGF0RW5naW5lLnVzZXJzW3BheWxvYWQuc2VuZGVyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5zZW5kZXIgPSBDaGF0RW5naW5lLnVzZXJzW3BheWxvYWQuc2VuZGVyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuc2VuZGVyID0gbmV3IFVzZXIocGF5bG9hZC5zZW5kZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLnNlbmRlci5fZ2V0U3RhdGUodGhpcywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGF0ZSBub3Qgc2V0JywgcGF5bG9hZC5zZW5kZXIuc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgQWRkIGEgdXNlciB0byB0aGUge0BsaW5rIENoYXR9LCBjcmVhdGluZyBpdCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QuXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IHV1aWQgVGhlIHVzZXIgdXVpZFxuICAgICAgICBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIHVzZXIgaW5pdGlhbCBzdGF0ZVxuICAgICAgICBAcGFyYW0ge0Jvb2xlYW59IHRyaWdnZXIgRm9yY2UgYSB0cmlnZ2VyIHRoYXQgdGhpcyB1c2VyIGlzIG9ubGluZVxuICAgICAgICAqL1xuICAgICAgICBjcmVhdGVVc2VyKHV1aWQsIHN0YXRlKSB7XG5cbiAgICAgICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoaXMgdXNlciBleGlzdHMgaW4gdGhlIGdsb2JhbCBsaXN0XG4gICAgICAgICAgICAvLyBzbyB3ZSBjYW4gcmVmZXJlbmNlIGl0IGZyb20gaGVyZSBvdXRcbiAgICAgICAgICAgIENoYXRFbmdpbmUudXNlcnNbdXVpZF0gPSBDaGF0RW5naW5lLnVzZXJzW3V1aWRdIHx8IG5ldyBVc2VyKHV1aWQpO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhpcyBjaGF0cm9vbSB0byB0aGUgdXNlcidzIGxpc3Qgb2YgY2hhdHNcbiAgICAgICAgICAgIENoYXRFbmdpbmUudXNlcnNbdXVpZF0uYWRkQ2hhdCh0aGlzLCBzdGF0ZSk7XG5cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIGpvaW4gZXZlbnQgb3ZlciB0aGlzIGNoYXRyb29tXG4gICAgICAgICAgICBpZighdGhpcy51c2Vyc1t1dWlkXSkge1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgdGhhdCBhIHtAbGluayBVc2VyfSBoYXMgY29tZSBvbmxpbmUuIFRoaXMgaXMgd2hlblxuICAgICAgICAgICAgICAgICogdGhlIGZyYW1ld29yayBmaXJzdHMgbGVhcm4gb2YgYSB1c2VyLiBUaGlzIGNhbiBiZSB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAqIGJ5LCBgYGAkLmpvaW5gYGAsIG9yIG90aGVyIG5ldHdvcmsgZXZlbnRzIHRoYXRcbiAgICAgICAgICAgICAgICAqIG5vdGlmeSB0aGUgZnJhbWV3b3JrIG9mIGEgbmV3IHVzZXIuXG4gICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwib25saW5lXCIuXCJoZXJlXG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgcGF5bG9hZCByZXR1cm5lZCBieSB0aGUgZXZlbnRcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBjYW1lIG9ubGluZVxuICAgICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAgICAqIGNoYXQub24oJyQub25saW5lLmhlcmUnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdVc2VyIGhhcyBjb21lIG9ubGluZTonLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub25saW5lLmhlcmUnLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IENoYXRFbmdpbmUudXNlcnNbdXVpZF1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGlzIHVzZXIgaW4gdGhlIGNoYXRyb29tXG4gICAgICAgICAgICB0aGlzLnVzZXJzW3V1aWRdID0gQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBpbnN0YW5jZSBvZiB0aGlzIHVzZXJcbiAgICAgICAgICAgIHJldHVybiBDaGF0RW5naW5lLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBVcGRhdGUgYSB1c2VyJ3Mgc3RhdGUgd2l0aGluIHRoaXMge0BsaW5rIENoYXR9LlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHV1aWQgVGhlIHtAbGluayBVc2VyfSB1dWlkXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFN0YXRlIHRvIHVwZGF0ZSBmb3IgdGhlIHVzZXJcbiAgICAgICAgKi9cbiAgICAgICAgdXNlclVwZGF0ZSh1dWlkLCBzdGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBlbnN1cmUgdGhlIHVzZXIgZXhpc3RzIHdpdGhpbiB0aGUgZ2xvYmFsIHNwYWNlXG4gICAgICAgICAgICBDaGF0RW5naW5lLnVzZXJzW3V1aWRdID0gQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSB8fCBuZXcgVXNlcih1dWlkKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3Qga25vdyBhYm91dCB0aGlzIHVzZXJcbiAgICAgICAgICAgIGlmKCF0aGlzLnVzZXJzW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gZG8gdGhlIHdob2xlIGpvaW4gdGhpbmdcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVVzZXIodXVpZCwgc3RhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhpcyB1c2VyJ3Mgc3RhdGUgaW4gdGhpcyBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy51c2Vyc1t1dWlkXS5hc3NpZ24oc3RhdGUsIHRoaXMpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7QGxpbmsgVXNlcn0gaGFzIGNoYW5nZWQgc3RhdGUuXG4gICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cInN0YXRlXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBwYXlsb2FkIHJldHVybmVkIGJ5IHRoZSBldmVudFxuICAgICAgICAgICAgKiBAcGFyYW0ge1VzZXJ9IGRhdGEudXNlciBUaGUge0BsaW5rIFVzZXJ9IHRoYXQgY2hhbmdlZCBzdGF0ZVxuICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YS5zdGF0ZSBUaGUgbmV3IHVzZXIgc3RhdGUgZm9yIHRoaXMgYGBgQ2hhdGBgYFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiBjaGF0Lm9uKCckLnN0YXRlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdVc2VyIGhhcyBjaGFuZ2VkIHN0YXRlOicsIGRhdGEudXNlciwgJ25ldyBzdGF0ZTonLCBkYXRhLnN0YXRlKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLnN0YXRlJywge1xuICAgICAgICAgICAgICAgIHVzZXI6IHRoaXMudXNlcnNbdXVpZF0sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHRoaXMudXNlcnNbdXVpZF0uc3RhdGVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBMZWF2ZSBmcm9tIHRoZSB7QGxpbmsgQ2hhdH0gb24gYmVoYWxmIG9mIHtAbGluayBNZX0uXG4gICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgKiBjaGF0LmxlYXZlKCk7XG4gICAgICAgICovXG4gICAgICAgIGxlYXZlKCkge1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi51bnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXhpb3MuZGVsZXRlKGNlQ29uZmlnLmF1dGhVcmwgKyAnL2NoYXRzJywge1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBnbG9iYWxDaGFubmVsOiBjZUNvbmZpZy5nbG9iYWxDaGFubmVsLFxuICAgICAgICAgICAgICAgIGF1dGhLZXk6IHBuQ29uZmlnLmF1dGhLZXksXG4gICAgICAgICAgICAgICAgdXVpZDogcG5Db25maWcudXVpZCxcbiAgICAgICAgICAgICAgICBhdXRoRGF0YTogQ2hhdEVuZ2luZS5tZS5hdXRoRGF0YSxcbiAgICAgICAgICAgICAgICBjaGF0OiB0aGlzLm9iamVjdGlmeSgpXG4gICAgICAgICAgICB9fSlcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgdGhyb3dFcnJvcih0aGlzLCAndHJpZ2dlcicsICdhdXRoJywgbmV3IEVycm9yKCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBtYWtpbmcgYSByZXF1ZXN0IHRvIGNoYXQgc2VydmVyLicpLCB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIFBlcmZvcm0gdXBkYXRlcyB3aGVuIGEgdXNlciBoYXMgbGVmdCB0aGUge0BsaW5rIENoYXR9LlxuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgICovXG4gICAgICAgIHVzZXJMZWF2ZSh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhIHVzZXIgbGVhdmVzLCB0cmlnZ2VyIHRoZSBldmVudFxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBGaXJlZCB3aGVuIGEge0BsaW5rIFVzZXJ9IGludGVudGlvbmFsbHkgbGVhdmVzIGEge0BsaW5rIENoYXR9LlxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cIm9mZmxpbmVcIi5cImxlYXZlXG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBwYXlsb2FkIGZyb20gdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge1VzZXJ9IHVzZXIgVGhlIHtAbGluayBVc2VyfSB0aGF0IGhhcyBsZWZ0IHRoZSByb29tXG4gICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICogY2hhdC5vbignJC5vZmZsaW5lLmxlYXZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVXNlciBsZWZ0IHRoZSByb29tIG1hbnVhbGx5OicsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5vZmZsaW5lLmxlYXZlJywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiB0aGlzLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgbG9jYWwgbGlzdCBvZiB1c2Vyc1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgcmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlIGdsb2JhbCBsaXN0LFxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhleSBtYXkgYmUgb25saW5lIGluIG90aGVyIGNoYW5uZWxzXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGF0IHVzZXIgaXNuJ3QgaW4gdGhlIHVzZXIgbGlzdFxuICAgICAgICAgICAgICAgIC8vIHdlIG5ldmVyIGtuZXcgYWJvdXQgdGhpcyB1c2VyIG9yIHRoZXkgYWxyZWFkeSBsZWZ0XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXNlciBhbHJlYWR5IGxlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBGaXJlZCB3aGVuIGEgdXNlciBkaXNjb25uZWN0cyBmcm9tIHRoZSB7QGxpbmsgQ2hhdH1cblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBvZiB0aGUge0BsaW5rIENoYXR9IHRoYXQgbGVmdFxuICAgICAgICAqL1xuICAgICAgICB1c2VyRGlzY29ubmVjdCh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIEZpcmVkIHNwZWNpZmljYWxseSB3aGVuIGEge0BsaW5rIFVzZXJ9IGxvb3NlcyBuZXR3b3JrIGNvbm5lY3Rpb25cbiAgICAgICAgICAgICAgICAqIHRvIHRoZSB7QGxpbmsgQ2hhdH0gaW52b2x1bnRhcmlseS5cbiAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvZmZsaW5lXCIuXCJkaXNjb25uZWN0XG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUge0BsaW5rIFVzZXJ9IHRoYXQgZGlzY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBkaXNjb25uZWN0ZWRcbiAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgKiBjaGF0Lm9uKCckLm9mZmxpbmUuZGlzY29ubmVjdCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgZGlzY29ubmVjdGVkIGZyb20gdGhlIG5ldHdvcms6JywgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub2ZmbGluZS5kaXNjb25uZWN0Jywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiB0aGlzLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIExvYWQgcGx1Z2lucyBhbmQgYXR0YWNoIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIGV4ZWN1dGUgYmVmb3JlIGFuZFxuICAgICAgICBhZnRlciBldmVudHMgYXJlIHRyaWdnZXIgb3IgcmVjZWl2ZWQuXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGxvY2F0aW9uIFdoZXJlIGluIHRoZSBtaWRkbGVld2FyZSB0aGUgZXZlbnQgc2hvdWxkIHJ1biAoZW1pdCwgdHJpZ2dlcilcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBmaXJzdCBUaGUgZmlyc3QgZnVuY3Rpb24gdG8gcnVuIGJlZm9yZSB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gbGFzdCBUaGUgbGFzdCBmdW5jdGlvbiB0byBydW4gYWZ0ZXIgdGhlIHBsdWdpbnMgaGF2ZSBydW5cbiAgICAgICAgKi9cbiAgICAgICAgcnVuUGx1Z2luUXVldWUobG9jYXRpb24sIGV2ZW50LCBmaXJzdCwgbGFzdCkge1xuXG4gICAgICAgICAgICAvLyB0aGlzIGFzc2VtYmxlcyBhIHF1ZXVlIG9mIGZ1bmN0aW9ucyB0byBydW4gYXMgbWlkZGxld2FyZVxuICAgICAgICAgICAgLy8gZXZlbnQgaXMgYSB0cmlnZ2VyZWQgZXZlbnQga2V5XG4gICAgICAgICAgICBsZXQgcGx1Z2luX3F1ZXVlID0gW107XG5cbiAgICAgICAgICAgIC8vIHRoZSBmaXJzdCBmdW5jdGlvbiBpcyBhbHdheXMgcmVxdWlyZWRcbiAgICAgICAgICAgIHBsdWdpbl9xdWV1ZS5wdXNoKGZpcnN0KTtcblxuICAgICAgICAgICAgLy8gbG9vayB0aHJvdWdoIHRoZSBjb25maWd1cmVkIHBsdWdpbnNcbiAgICAgICAgICAgIGZvcihsZXQgaSBpbiB0aGlzLnBsdWdpbnMpIHtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSBkZWZpbmVkIGEgZnVuY3Rpb24gdG8gcnVuIHNwZWNpZmljYWxseVxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAgICAgaWYodGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dXG4gICAgICAgICAgICAgICAgICAgICYmIHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlW2xvY2F0aW9uXVtldmVudF0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5fcXVldWUucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlW2xvY2F0aW9uXVtldmVudF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3YXRlcmZhbGwgcnVucyB0aGUgZnVuY3Rpb25zIGluIGFzc2lnbmVkIG9yZGVyXG4gICAgICAgICAgICAvLyB3YWl0aW5nIGZvciBvbmUgdG8gY29tcGxldGUgYmVmb3JlIG1vdmluZyB0byB0aGUgbmV4dFxuICAgICAgICAgICAgLy8gd2hlbiBpdCdzIGRvbmUsIHRoZSBgYGBsYXN0YGBgIHBhcmFtZXRlciBpcyBjYWxsZWRcbiAgICAgICAgICAgIHdhdGVyZmFsbChwbHVnaW5fcXVldWUsIGxhc3QpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgU2V0IHRoZSBzdGF0ZSBmb3Ige0BsaW5rIE1lfSB3aXRoaW4gdGhpcyB7QGxpbmsgVXNlcn0uXG4gICAgICAgIEJyb2FkY2FzdHMgdGhlIGBgYCQuc3RhdGVgYGAgZXZlbnQgb24gb3RoZXIgY2xpZW50c1xuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIHtAbGluayBNZX0gd2lsbCBoYXZlIHdpdGhpbiB0aGlzIHtAbGluayBVc2VyfVxuICAgICAgICAqL1xuICAgICAgICBzZXRTdGF0ZShzdGF0ZSkge1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5zZXRTdGF0ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbHM6IFtDaGF0RW5naW5lLmdsb2JhbC5jaGFubmVsXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKHN0YXR1cywgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxlIHN0YXR1cywgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgICAgICBvbkNvbm5lY3Rpb25SZWFkeSgpIHtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEJyb2FkY2FzdCB0aGF0IHRoZSB7QGxpbmsgQ2hhdH0gaXMgY29ubmVjdGVkIHRvIHRoZSBuZXR3b3JrLlxuICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJjb25uZWN0ZWRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogY2hhdC5vbignJC5jb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnY2hhdCBpcyByZWFkeSB0byBnbyEnKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIHVzZXJzIG9ubGluZSBub3dcbiAgICAgICAgICAgIC8vIGFzayBQdWJOdWIgZm9yIGluZm9ybWF0aW9uIGFib3V0IGNvbm5lY3RlZCB1c2VycyBpbiB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmhlcmVOb3coe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlVVVJRHM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVN0YXRlOiB0cnVlXG4gICAgICAgICAgICB9LCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25IZXJlTm93KHN0YXR1cywgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLmNvbm5lY3RlZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8qKlxuICAgIFRoaXMgaXMgb3VyIFVzZXIgY2xhc3Mgd2hpY2ggcmVwcmVzZW50cyBhIGNvbm5lY3RlZCBjbGllbnQuIFVzZXIncyBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkIGFuZCBtYW5hZ2VkIGJ5IHtAbGluayBDaGF0fXMsIGJ1dCB5b3UgY2FuIGFsc28gaW5zdGFudGlhdGUgdGhlbSB5b3Vyc2VsZi5cbiAgICBJZiBhIFVzZXIgaGFzIGJlZW4gY3JlYXRlZCBidXQgaGFzIG5ldmVyIGJlZW4gYXV0aGVudGljYXRlZCwgeW91IHdpbGwgcmVjaWV2ZSA0MDNzIHdoZW4gY29ubmVjdGluZyB0byB0aGVpciBmZWVkIG9yIGRpcmVjdCBDaGF0cy5cbiAgICBAY2xhc3NcbiAgICBAZXh0ZW5kcyBFbWl0dGVyXG4gICAgQHBhcmFtIHV1aWRcbiAgICBAcGFyYW0gc3RhdGVcbiAgICBAcGFyYW0gY2hhdFxuICAgICovXG4gICAgY2xhc3MgVXNlciBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHV1aWQsIHN0YXRlID0ge30sIGNoYXQgPSBDaGF0RW5naW5lLmdsb2JhbCkge1xuXG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIFRoZSBVc2VyJ3MgdW5pcXVlIGlkZW50aWZpZXIsIHVzdWFsbHkgYSBkZXZpY2UgdXVpZC4gVGhpcyBoZWxwcyBDaGF0RW5naW5lIGlkZW50aWZ5IHRoZSB1c2VyIGJldHdlZW4gZXZlbnRzLiBUaGlzIGlzIHB1YmxpYyBpZCBleHBvc2VkIHRvIHRoZSBuZXR3b3JrLlxuICAgICAgICAgICAgQ2hlY2sgb3V0IFt0aGUgd2lraXBlZGlhIHBhZ2Ugb24gVVVJRHNdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VuaXZlcnNhbGx5X3VuaXF1ZV9pZGVudGlmaWVyKS5cblxuICAgICAgICAgICAgQHJlYWRvbmx5XG4gICAgICAgICAgICBAdHlwZSBTdHJpbmdcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnV1aWQgPSB1dWlkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogR2V0cyB0aGUgdXNlciBzdGF0ZSBpbiBhIHtAbGluayBDaGF0fS4gU2VlIHtAbGluayBNZSN1cGRhdGV9IGZvciBob3cgdG8gYXNzaWduIHN0YXRlIHZhbHVlcy5cbiAgICAgICAgICAgICogQHBhcmFtIHtDaGF0fSBjaGF0IENoYXRyb29tIHRvIHJldHJpZXZlIHN0YXRlIGZyb21cbiAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBSZXR1cm5zIGEgZ2VuZXJpYyBKU09OIG9iamVjdCBjb250YWluaW5nIHN0YXRlIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBHbG9iYWwgU3RhdGVcbiAgICAgICAgICAgICogbGV0IGdsb2JhbFN0YXRlID0gdXNlci5zdGF0ZSgpO1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBTdGF0ZSBpbiBzb21lIGNoYW5uZWxcbiAgICAgICAgICAgICogbGV0IHNvbWVDaGF0ID0gbmV3IENoYXRFbmdpbmUuQ2hhdCgnc29tZS1jaGFubmVsJyk7XG4gICAgICAgICAgICAqIGxldCBzb21lQ2hhdFN0YXRlID0gdXNlci5zdGF0ZShzb21lQ2hhdCk7c1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBDaGF0cyB0aGlzIHtAbGluayBVc2VyfSBpcyBjdXJyZW50bHkgaW4uIFRoZSBrZXkgb2YgZWFjaCBpdGVtIGluIHRoZSBvYmplY3QgaXMgdGhlIHtAbGluayBDaGF0LmNoYW5uZWx9IGFuZCB0aGUgdmFsdWUgaXMgdGhlIHtAbGluayBDaGF0fSBvYmplY3QuIE5vdGUgdGhhdCBmb3IgcHJpdmFjeSwgdGhpcyBtYXAgd2lsbCBvbmx5IGNvbnRhaW4ge0BsaW5rIENoYXR9cyB0aGF0IHRoZSBjbGllbnQgKHtAbGluayBNZX0pIGlzIGFsc28gY29ubmVjdGVkIHRvLlxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqe1xuICAgICAgICAgICAgKiAgICBcImdsb2JhbENoYW5uZWxcIjoge1xuICAgICAgICAgICAgKiAgICAgICAgY2hhbm5lbDogXCJnbG9iYWxDaGFubmVsXCIsXG4gICAgICAgICAgICAqICAgICAgICB1c2Vyczoge1xuICAgICAgICAgICAgKiAgICAgICAgICAgIC8vLi4uXG4gICAgICAgICAgICAqICAgICAgICB9LFxuICAgICAgICAgICAgKiAgICB9LFxuICAgICAgICAgICAgKiAgICAvLyAuLi5cbiAgICAgICAgICAgICogfVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hhdHMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZlZWQgaXMgYSBDaGF0IHRoYXQgb25seSBzdHJlYW1zIHRoaW5ncyBhIFVzZXIgZG9lcywgbGlrZVxuICAgICAgICAgICAgKiAnc3RhcnRUeXBpbmcnIG9yICdpZGxlJyBldmVudHMgZm9yIGV4YW1wbGUuIEFueWJvZHkgY2FuIHN1YnNjcmliZVxuICAgICAgICAgICAgKiB0byBhIFVzZXIncyBmZWVkLCBidXQgb25seSB0aGUgVXNlciBjYW4gcHVibGlzaCB0byBpdC4gVXNlcnMgd2lsbFxuICAgICAgICAgICAgKiBub3QgYmUgYWJsZSB0byBjb252ZXJzZSBpbiB0aGlzIGNoYW5uZWwuXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogLy8gbWVcbiAgICAgICAgICAgICogbWUuZmVlZC5lbWl0KCd1cGRhdGUnLCAnSSBtYXkgYmUgYXdheSBmcm9tIG15IGNvbXB1dGVyIHJpZ2h0IG5vdycpO1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBhbm90aGVyIGluc3RhbmNlXG4gICAgICAgICAgICAqIHRoZW0uZmVlZC5jb25uZWN0KCk7XG4gICAgICAgICAgICAqIHRoZW0uZmVlZC5vbigndXBkYXRlJywgKHBheWxvYWQpID0+IHt9KVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgLy8gZ3JhbnRzIGZvciB0aGVzZSBjaGF0cyBhcmUgZG9uZSBvbiBhdXRoLiBFdmVuIHRob3VnaCB0aGV5J3JlIG1hcmtlZCBwcml2YXRlLCB0aGV5IGFyZSBsb2NrZWQgZG93biB2aWEgdGhlIHNlcnZlclxuICAgICAgICAgICAgdGhpcy5mZWVkID0gbmV3IENoYXQoXG4gICAgICAgICAgICAgICAgW0NoYXRFbmdpbmUuZ2xvYmFsLmNoYW5uZWwsICd1c2VyJywgdXVpZCwgJ3JlYWQuJywgJ2ZlZWQnXS5qb2luKCcjJyksIGZhbHNlLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJNZVwiLCAnZmVlZCcpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRGlyZWN0IGlzIGEgcHJpdmF0ZSBjaGFubmVsIHRoYXQgYW55Ym9keSBjYW4gcHVibGlzaCB0byBidXQgb25seVxuICAgICAgICAgICAgKiB0aGUgdXNlciBjYW4gc3Vic2NyaWJlIHRvLiBHcmVhdCBmb3IgcHVzaGluZyBub3RpZmljYXRpb25zIG9yXG4gICAgICAgICAgICAqIGludml0aW5nIHRvIG90aGVyIGNoYXRzLiBVc2VycyB3aWxsIG5vdCBiZSBhYmxlIHRvIGNvbW11bmljYXRlXG4gICAgICAgICAgICAqIHdpdGggb25lIGFub3RoZXIgaW5zaWRlIG9mIHRoaXMgY2hhdC4gQ2hlY2sgb3V0IHRoZVxuICAgICAgICAgICAgKiB7QGxpbmsgQ2hhdCNpbnZpdGV9IG1ldGhvZCBmb3IgcHJpdmF0ZSBjaGF0cyB1dGlsaXppbmdcbiAgICAgICAgICAgICoge0BsaW5rIFVzZXIjZGlyZWN0fS5cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHR5cGUgQ2hhdFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiAvLyBtZVxuICAgICAgICAgICAgKiBtZS5kaXJlY3Qub24oJ3ByaXZhdGUtbWVzc2FnZScsIChwYXlsb2FkKSAtPiB7XG4gICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZyhwYXlsb2FkLnNlbmRlci51dWlkLCAnc2VudCB5b3VyIGEgZGlyZWN0IG1lc3NhZ2UnKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIGFub3RoZXIgaW5zdGFuY2VcbiAgICAgICAgICAgICogdGhlbS5kaXJlY3QuY29ubmVjdCgpO1xuICAgICAgICAgICAgKiB0aGVtLmRpcmVjdC5lbWl0KCdwcml2YXRlLW1lc3NhZ2UnLCB7c2VjcmV0OiA0Mn0pO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0ID0gbmV3IENoYXQoXG4gICAgICAgICAgICAgICAgW0NoYXRFbmdpbmUuZ2xvYmFsLmNoYW5uZWwsICd1c2VyJywgdXVpZCwgJ3dyaXRlLicsICdkaXJlY3QnXS5qb2luKCcjJyksIGZhbHNlLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgPT0gXCJNZVwiLCAnZGlyZWN0Jyk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGRvZXMgbm90IGV4aXN0IGF0IGFsbCBhbmQgd2UgZ2V0IGVub3VnaFxuICAgICAgICAgICAgLy8gaW5mb3JtYXRpb24gdG8gYnVpbGQgdGhlIHVzZXJcbiAgICAgICAgICAgIGlmKCFDaGF0RW5naW5lLnVzZXJzW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiBpdCdzIGNyZWF0ZWQgY29udGV4dFxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSBuZXcgc3RhdGUgZm9yIHRoZSB1c2VyXG4gICAgICAgICogQHBhcmFtIHtDaGF0fSBjaGF0IENoYXRyb29tIHRvIHJldHJpZXZlIHN0YXRlIGZyb21cbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlKHN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24ob2xkU3RhdGUsIHN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICB0aGlzIGlzIG9ubHkgY2FsbGVkIGZyb20gbmV0d29yayB1cGRhdGVzXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgKi9cbiAgICAgICAgYXNzaWduKHN0YXRlLCBjaGF0KSB7XG4gICAgICAgICAgICBjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWw7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgYWRkcyBhIGNoYXQgdG8gdGhpcyB1c2VyXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgKi9cbiAgICAgICAgYWRkQ2hhdChjaGF0LCBzdGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2hhdCBpbiB0aGlzIHVzZXIgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLmNoYXRzW2NoYXQuY2hhbm5lbF0gPSBjaGF0O1xuXG4gICAgICAgICAgICAvLyB1cGRhdGVzIHRoZSB1c2VyJ3Mgc3RhdGUgaW4gdGhhdCBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgX2dldFN0YXRlKGNoYXQsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgICAgIGF4aW9zLmdldCgnaHR0cHM6Ly9wdWJzdWIucHVibnViLmNvbS92MS9ibG9ja3Mvc3ViLWtleS8nK3BuQ29uZmlnLnN1YnNjcmliZUtleSsnL3N0YXRlP2dsb2JhbENoYW5uZWw9JyArIGNlQ29uZmlnLmdsb2JhbENoYW5uZWwgKyAnJnV1aWQ9JyArIHRoaXMudXVpZClcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzaWduKHJlc3BvbnNlLmRhdGEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKGNoYXQsICd0cmlnZ2VyJywgJ2dldFN0YXRlJywgbmV3IEVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIGdldHRpbmcgc3RhdGUgZnJvbSB0aGUgUHViTnViIG5ldHdvcmsuJykpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBSZXByZXNlbnRzIHRoZSBjbGllbnQgY29ubmVjdGlvbiBhcyBhIHNwZWNpYWwge0BsaW5rIFVzZXJ9IHdpdGggd3JpdGUgcGVybWlzc2lvbnMuXG4gICAgSGFzIHRoZSBhYmlsaXR5IHRvIHVwZGF0ZSBpdCdzIHN0YXRlIG9uIHRoZSBuZXR3b3JrLiBBbiBpbnN0YW5jZSBvZlxuICAgIHtAbGluayBNZX0gaXMgcmV0dXJuZWQgYnkgdGhlIGBgYENoYXRFbmdpbmUuY29ubmVjdCgpYGBgXG4gICAgbWV0aG9kLlxuXG4gICAgQGNsYXNzIE1lXG4gICAgQHBhcmFtIHtTdHJpbmd9IHV1aWQgVGhlIHV1aWQgb2YgdGhpcyB1c2VyXG4gICAgQGV4dGVuZHMgVXNlclxuICAgICovXG4gICAgY2xhc3MgTWUgZXh0ZW5kcyBVc2VyIHtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih1dWlkLCBhdXRoRGF0YSkge1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBVc2VyIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBzdXBlcih1dWlkKTtcblxuICAgICAgICAgICAgdGhpcy5hdXRoRGF0YSA9IGF1dGhEYXRhO1xuXG4gICAgICAgICAgICB0aGlzLmRpcmVjdC5vbignJC5zZXJ2ZXIuY2hhdC5jcmVhdGVkJywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLmFkZENoYXRUb1Nlc3Npb24ocGF5bG9hZC5jaGF0KTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0Lm9uKCckLnNlcnZlci5jaGF0LmRlbGV0ZWQnLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucmVtb3ZlQ2hhdEZyb21TZXNzaW9uKHBheWxvYWQuY2hhdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXNzaWduIHVwZGF0ZXMgZnJvbSBuZXR3b3JrXG4gICAgICAgIGFzc2lnbihzdGF0ZSwgY2hhdCkge1xuICAgICAgICAgICAgLy8gd2UgY2FsbCBcInVwZGF0ZVwiIGJlY2F1c2UgY2FsbGluZyBcInN1cGVyLmFzc2lnblwiXG4gICAgICAgICAgICAvLyB3aWxsIGRpcmVjdCBiYWNrIHRvIFwidGhpcy51cGRhdGVcIiB3aGljaCBjcmVhdGVzXG4gICAgICAgICAgICAvLyBhIGxvb3Agb2YgbmV0d29yayB1cGRhdGVzXG4gICAgICAgICAgICBzdXBlci51cGRhdGUoc3RhdGUsIGNoYXQpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBVcGRhdGUge0BsaW5rIE1lfSdzIHN0YXRlIGluIGEge0BsaW5rIENoYXR9LiBBbGwge0BsaW5rIFVzZXJ9cyBpblxuICAgICAgICAqIHRoZSB7QGxpbmsgQ2hhdH0gd2lsbCBiZSBub3RpZmllZCBvZiB0aGlzIGNoYW5nZSB2aWEgKCQudXBkYXRlKVtDaGF0Lmh0bWwjZXZlbnQ6JCUyNTIyLiUyNTIyc3RhdGVdLlxuICAgICAgICAqIFJldHJpZXZlIHN0YXRlIGF0IGFueSB0aW1lIHdpdGgge0BsaW5rIFVzZXIjc3RhdGV9LlxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIGZvciB7QGxpbmsgTWV9XG4gICAgICAgICogQHBhcmFtIHtDaGF0fSBjaGF0IEFuIGluc3RhbmNlIG9mIHRoZSB7QGxpbmsgQ2hhdH0gd2hlcmUgc3RhdGUgd2lsbCBiZSB1cGRhdGVkLlxuICAgICAgICAqIERlZmF1bHRzIHRvIGBgYENoYXRFbmdpbmUuZ2xvYmFsYGBgLlxuICAgICAgICAqIEBmaXJlcyBDaGF0I2V2ZW50OiRcIi5cInN0YXRlXG4gICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgKiAvLyB1cGRhdGUgZ2xvYmFsIHN0YXRlXG4gICAgICAgICogbWUudXBkYXRlKHt2YWx1ZTogdHJ1ZX0pO1xuICAgICAgICAqXG4gICAgICAgICogLy8gdXBkYXRlIHN0YXRlIGluIHNwZWNpZmljIGNoYXRcbiAgICAgICAgKiBsZXQgY2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQoJ3NvbWUtY2hhdCcpO1xuICAgICAgICAqIG1lLnVwZGF0ZSh7dmFsdWU6IHRydWV9LCBjaGF0KTtcbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlKHN0YXRlLCBjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWwpIHtcblxuICAgICAgICAgICAgLy8gcnVuIHRoZSByb290IHVwZGF0ZSBmdW5jdGlvblxuICAgICAgICAgICAgc3VwZXIudXBkYXRlKHN0YXRlLCBjaGF0KTtcblxuICAgICAgICAgICAgLy8gcHVibGlzaCB0aGUgdXBkYXRlIG92ZXIgdGhlIGdsb2JhbCBjaGFubmVsXG5cbiAgICAgICAgICAgIENoYXRFbmdpbmUuZ2xvYmFsLnNldFN0YXRlKHN0YXRlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBQcm92aWRlcyB0aGUgYmFzZSBXaWRnZXQgY2xhc3MuLi5cblxuICAgIEBjbGFzcyBDaGF0RW5naW5lXG4gICAgQGV4dGVuZHMgUm9vdEVtaXR0ZXJcbiAgICAgKi9cbiAgICBjb25zdCBpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSByb290IENoYXRFbmdpbmUgb2JqZWN0XG4gICAgICAgIENoYXRFbmdpbmUgPSBuZXcgUm9vdEVtaXR0ZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQSBtYXAgb2YgYWxsIGtub3duIHtAbGluayBVc2VyfXMgaW4gdGhpcyBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS51c2VycyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEEgbWFwIG9mIGFsbCBrbm93biB7QGxpbmsgQ2hhdH1zIGluIHRoaXMgaW5zdGFuY2Ugb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUuY2hhdHMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBBIGdsb2JhbCB7QGxpbmsgQ2hhdH0gdGhhdCBhbGwge0BsaW5rIFVzZXJ9cyBqb2luIHdoZW4gdGhleSBjb25uZWN0IHRvIENoYXRFbmdpbmUuIFVzZWZ1bCBmb3IgYW5ub3VuY2VtZW50cywgYWxlcnRzLCBhbmQgZ2xvYmFsIGV2ZW50cy5cbiAgICAgICAgKiBAbWVtYmVyIHtDaGF0fSBnbG9iYWxcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLmdsb2JhbCA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoaXMgaW5zdGFuY2Ugb2YgQ2hhdEVuZ2luZSByZXByZXNlbnRlZCBhcyBhIHNwZWNpYWwge0BsaW5rIFVzZXJ9IGtub3cgYXMge0BsaW5rIE1lfVxuICAgICAgICAqIEBtZW1iZXIge01lfSBtZVxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUubWUgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBBbiBpbnN0YW5jZSBvZiBQdWJOdWIsIHRoZSBuZXR3b3JraW5nIGluZnJhc3RydWN0dXJlIHRoYXQgcG93ZXJzIHRoZSByZWFsdGltZSBjb21tdW5pY2F0aW9uIGJldHdlZW4ge0BsaW5rIFVzZXJ9cyBpbiB7QGxpbmsgQ2hhdHN9LlxuICAgICAgICAqIEBtZW1iZXIge09iamVjdH0gcHVibnViXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBJbmRpY2F0ZXMgaWYgQ2hhdEVuZ2luZSBoYXMgZmlyZWQgdGhlIHtAbGluayBDaGF0RW5naW5lIyRcIi5cInJlYWR5fSBldmVudFxuICAgICAgICAqIEBtZW1iZXIge09iamVjdH0gcmVhZHlcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLnJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgQ2hhdEVuZ2luZS5zZXNzaW9uID0ge307XG5cbiAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGF0VG9TZXNzaW9uID0gZnVuY3Rpb24oY2hhdCkge1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF0gPSBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF0gfHwge307XG5cbiAgICAgICAgICAgIGxldCBleGlzdGluZ0NoYXQgPSBDaGF0RW5naW5lLmNoYXRzW2NoYXQuY2hhbm5lbF07XG5cbiAgICAgICAgICAgIGlmKGV4aXN0aW5nQ2hhdCkge1xuXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5zZXNzaW9uW2NoYXQuZ3JvdXBdW2NoYXQuY2hhbm5lbF0gPSBleGlzdGluZ0NoYXQ7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF1bY2hhdC5jaGFubmVsXSA9IG5ldyBDaGF0KGNoYXQuY2hhbm5lbCwgY2hhdC5wcml2YXRlLCBmYWxzZSwgY2hhdC5ncm91cCk7XG5cbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLl9lbWl0KCckLnNlc3Npb24uY2hhdC5qb2luJywge1xuICAgICAgICAgICAgICAgICAgICBjaGF0OiBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF1bY2hhdC5jaGFubmVsXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIENoYXRFbmdpbmUucmVtb3ZlQ2hhdEZyb21TZXNzaW9uID0gZnVuY3Rpb24oY2hhdCkge1xuXG4gICAgICAgICAgICBsZXQgdGFyZ2V0Q2hhdCA9IENoYXRFbmdpbmUuc2Vzc2lvbltjaGF0Lmdyb3VwXVtjaGF0LmNoYW5uZWxdIHx8IGNoYXQ7XG5cbiAgICAgICAgICAgIENoYXRFbmdpbmUuX2VtaXQoJyQuc2Vzc2lvbi5jaGF0LmxlYXZlJywge1xuICAgICAgICAgICAgICAgIGNoYXQ6IHRhcmdldENoYXRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBkb24ndCBkZWxldGUgZnJvbSBjaGF0ZW5naW5lLmNoYXRzLCBiZWNhdXNlIHdlIGNhbiBzdGlsbCBnZXQgZXZlbnRzIGZyb20gdGhpcyBjaGF0XG4gICAgICAgICAgICBkZWxldGUgQ2hhdEVuZ2luZS5jaGF0c1tjaGF0LmNoYW5uZWxdO1xuICAgICAgICAgICAgZGVsZXRlIENoYXRFbmdpbmUuc2Vzc2lvbltjaGF0Lmdyb3VwXVtjaGF0LmNoYW5uZWxdO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBDb25uZWN0IHRvIHJlYWx0aW1lIHNlcnZpY2UgYW5kIGNyZWF0ZSBpbnN0YW5jZSBvZiB7QGxpbmsgTWV9XG4gICAgICAgICogQG1ldGhvZCBDaGF0RW5naW5lI2Nvbm5lY3RcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBBIHVuaXF1ZSBzdHJpbmcgZm9yIHtAbGluayBNZX0uIEl0IGNhbiBiZSBhIGRldmljZSBpZCwgdXNlcm5hbWUsIHVzZXIgaWQsIGVtYWlsLCBldGMuXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgY2xpZW50ICh7QGxpbmsgTWV9KS4gVGhpcyBKU09OIG9iamVjdCBpcyBzZW50IHRvIGFsbCBvdGhlciBjbGllbnRzIG9uIHRoZSBuZXR3b3JrLCBzbyBubyBwYXNzd29yZHMhXG4gICAgICAgICogKiBAcGFyYW0ge1N0cnVuZ30gYXV0aEtleSBBIGF1dGhlbnRpY2F0aW9uIHNlY3JldC4gV2lsbCBiZSBzZW50IHRvIGF1dGhlbnRpY2F0aW9uIGJhY2tlbmQgZm9yIHZhbGlkYXRpb24uIFRoaXMgaXMgdXN1YWxseSBhbiBhY2Nlc3MgdG9rZW4gb3IgcGFzc3dvcmQuIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gVVVJRCBhcyBhIHVzZXIgY2FuIGhhdmUgYSBzaW5nbGUgVVVJRCBidXQgbXVsdGlwbGUgYXV0aCBrZXlzLlxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXV0aERhdGFdIEFkZGl0aW9uYWwgZGF0YSB0byBzZW5kIHRvIHRoZSBhdXRoZW50aWNhdGlvbiBlbmRwb2ludC4gTm90IHVzZWQgYnkgQ2hhdEVuZ2luZSBTREsuXG4gICAgICAgICogQGZpcmVzICRcIi5cImNvbm5lY3RlZFxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLmNvbm5lY3QgPSBmdW5jdGlvbih1dWlkLCBzdGF0ZSA9IHt9LCBhdXRoS2V5ID0gZmFsc2UsIGF1dGhEYXRhKSB7XG5cbiAgICAgICAgICAgIC8vIHRoaXMgY3JlYXRlcyBhIHVzZXIga25vd24gYXMgTWUgYW5kXG4gICAgICAgICAgICAvLyBjb25uZWN0cyB0byB0aGUgZ2xvYmFsIGNoYXRyb29tXG5cbiAgICAgICAgICAgIHBuQ29uZmlnLnV1aWQgPSB1dWlkO1xuXG4gICAgICAgICAgICBsZXQgY29tcGxldGUgPSAoY2hhdERhdGEpID0+IHtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViID0gbmV3IFB1Yk51YihwbkNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgY2hhdCB0byB1c2UgYXMgZ2xvYmFsIGNoYXRcbiAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBkbyBhdXRoIG9uIHRoaXMgb25lIGJlY2F1c2VpdCdzIGFzc3VtZWQgdG8gYmUgZG9uZSB3aXRoIHRoZSAvYXV0aCByZXF1ZXN0IGJlbG93XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5nbG9iYWwgPSBuZXcgQ2hhdChjZUNvbmZpZy5nbG9iYWxDaGFubmVsLCBmYWxzZSwgdHJ1ZSwgJ2dsb2JhbCcpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IHVzZXIgdGhhdCByZXByZXNlbnRzIHRoaXMgY2xpZW50XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5tZSA9IG5ldyBNZShwbkNvbmZpZy51dWlkLCBhdXRoRGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgTWUgdXNpbmcgaW5wdXQgcGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuZ2xvYmFsLmNyZWF0ZVVzZXIocG5Db25maWcudXVpZCwgc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5tZS51cGRhdGUoc3RhdGUpO1xuXG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBGaXJlZCB3aGVuIENoYXRFbmdpbmUgaXMgY29ubmVjdGVkIHRvIHRoZSBpbnRlcm5ldCBhbmQgcmVhZHkgdG8gZ28hXG4gICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwicmVhZHlcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLmdsb2JhbC5vbignJC5jb25uZWN0ZWQnLCAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5fZW1pdCgnJC5yZWFkeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lOiBDaGF0RW5naW5lLm1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucmVhZHkgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGNoYXREYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBDaGF0RW5naW5lLmFkZENoYXRUb1Nlc3Npb24oY2hhdERhdGFba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gY2hhdHMuc2Vzc2lvbiA9XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICBGaXJlcyB3aGVuIFB1Yk51YiBuZXR3b3JrIGNvbm5lY3Rpb24gY2hhbmdlc1xuXG4gICAgICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gc3RhdHVzRXZlbnQgVGhlIHJlc3BvbnNlIHN0YXR1c1xuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IChzdGF0dXNFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogU0RLIGRldGVjdGVkIHRoYXQgbmV0d29yayBpcyBvbmxpbmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cInVwXCIuXCJvbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTREsgZGV0ZWN0ZWQgdGhhdCBuZXR3b3JrIGlzIGRvd24uXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cIm9mZmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBBIHN1YnNjcmliZSBldmVudCBleHBlcmllbmNlZCBhbiBleGNlcHRpb24gd2hlbiBydW5uaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJpc3N1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNESyB3YXMgYWJsZSB0byByZWNvbm5lY3QgdG8gcHVibnViLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJ1cFwiLlwicmVjb25uZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTREsgc3Vic2NyaWJlZCB3aXRoIGEgbmV3IG1peCBvZiBjaGFubmVscy5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwidXBcIi5cImNvbm5lY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEpTT04gcGFyc2luZyBjcmFzaGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJtYWxmb3JtZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTZXJ2ZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cImJhZHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBJZiB1c2luZyBkZWNyeXB0aW9uIHN0cmF0ZWdpZXMgYW5kIHRoZSBkZWNyeXB0aW9uIGZhaWxzLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJkZWNyeXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogUmVxdWVzdCB0aW1lZCBvdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cImRvd25cIi5cInRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBQQU0gcGVybWlzc2lvbiBmYWlsdXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJkZW5pZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hcCB0aGUgcHVibnViIGV2ZW50cyBpbnRvIGNoYXQgZW5naW5lIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhdGVnb3JpZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOTmV0d29ya1VwQ2F0ZWdvcnknOiAndXAub25saW5lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5OZXR3b3JrRG93bkNhdGVnb3J5JzogJ2Rvd24ub2ZmbGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOTmV0d29ya0lzc3Vlc0NhdGVnb3J5JzogJ2Rvd24uaXNzdWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTlJlY29ubmVjdGVkQ2F0ZWdvcnknOiAndXAucmVjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkNvbm5lY3RlZENhdGVnb3J5JzogJ3VwLmNvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOQWNjZXNzRGVuaWVkQ2F0ZWdvcnknOiAnZG93bi5kZW5pZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTk1hbGZvcm1lZFJlc3BvbnNlQ2F0ZWdvcnknOiAnZG93bi5tYWxmb3JtZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkJhZFJlcXVlc3RDYXRlZ29yeSc6ICdkb3duLmJhZHJlcXVlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkRlY3J5cHRpb25FcnJvckNhdGVnb3J5JzogJ2Rvd24uZGVjcnlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOVGltZW91dENhdGVnb3J5JzogJ2Rvd24udGltZW91dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudE5hbWUgPSBbJyQnLCAnbmV0d29yaycsIGNhdGVnb3JpZXNbc3RhdHVzRXZlbnQuY2F0ZWdvcnldIHx8ICdvdGhlciddLmpvaW4oJy4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RhdHVzRXZlbnQuYWZmZWN0ZWRDaGFubmVscykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzRXZlbnQuYWZmZWN0ZWRDaGFubmVscy5mb3JFYWNoKChjaGFubmVsKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoYXQgPSBDaGF0RW5naW5lLmNoYXRzW2NoYW5uZWxdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNoYXQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29ubmVjdGVkIGNhdGVnb3J5IHRlbGxzIHVzIHRoZSBjaGF0IGlzIHJlYWR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzRXZlbnQuY2F0ZWdvcnkgPT09IFwiUE5Db25uZWN0ZWRDYXRlZ29yeVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC5vbkNvbm5lY3Rpb25SZWFkeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBuZXR3b3JrIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhdC50cmlnZ2VyKGV2ZW50TmFtZSwgc3RhdHVzRXZlbnQpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5fZW1pdChldmVudE5hbWUsIHN0YXR1c0V2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuX2VtaXQoZXZlbnROYW1lLCBzdGF0dXNFdmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZ2V0Q2hhdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGF4aW9zLmdldChjZUNvbmZpZy5hdXRoVXJsICsgJy9jaGF0cz91dWlkPScgKyBwbkNvbmZpZy51dWlkKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGxvZ2dpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJlcnJvclwiLlwiYXV0aFxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKENoYXRFbmdpbmUsICdfZW1pdCcsICdhdXRoJywgbmV3IEVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIGxvZ2dpbmcgaW50byB0aGUgYXV0aCBzZXJ2ZXIgKCcrY2VDb25maWcuYXV0aFVybCsnKS4nKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoY2VDb25maWcuaW5zZWN1cmUpIHtcbiAgICAgICAgICAgICAgICBnZXRDaGF0cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHBuQ29uZmlnLmF1dGhLZXkgPSBhdXRoS2V5O1xuXG4gICAgICAgICAgICAgICAgYXhpb3MucG9zdChjZUNvbmZpZy5hdXRoVXJsICsgJy9ncmFudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogcG5Db25maWcudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCxcbiAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IENoYXRFbmdpbmUubWUuYXV0aERhdGEsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhLZXk6IHBuQ29uZmlnLmF1dGhLZXlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGdldENoYXRzKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICogVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2dnaW5nIGluXG4gICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwiZXJyb3JcIi5cImF1dGhcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcihDaGF0RW5naW5lLCAnX2VtaXQnLCAnYXV0aCcsIG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2dnaW5nIGludG8gdGhlIGF1dGggc2VydmVyICgnK2NlQ29uZmlnLmF1dGhVcmwrJykuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBUaGUge0BsaW5rIENoYXR9IGNsYXNzLlxuICAgICAgICAqIEBtZW1iZXIge0NoYXR9IENoYXRcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqIEBzZWUge0BsaW5rIENoYXR9XG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUuQ2hhdCA9IENoYXQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVGhlIHtAbGluayBVc2VyfSBjbGFzcy5cbiAgICAgICAgKiBAbWVtYmVyIHtVc2VyfSBVc2VyXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKiBAc2VlIHtAbGluayBVc2VyfVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLlVzZXIgPSBVc2VyO1xuXG4gICAgICAgIC8vIGFkZCBhbiBvYmplY3QgYXMgYSBzdWJvYmplY3QgdW5kZXIgYSBuYW1lc3BvYWNlXG4gICAgICAgIENoYXRFbmdpbmUuYWRkQ2hpbGQgPSAob2IsIGNoaWxkTmFtZSwgY2hpbGRPYikgPT4ge1xuXG4gICAgICAgICAgICAvLyBhc3NpZ24gdGhlIG5ldyBjaGlsZCBvYmplY3QgYXMgYSBwcm9wZXJ0eSBvZiBwYXJlbnQgdW5kZXIgdGhlXG4gICAgICAgICAgICAvLyBnaXZlbiBuYW1lc3BhY2VcbiAgICAgICAgICAgIG9iW2NoaWxkTmFtZV0gPSBjaGlsZE9iO1xuXG4gICAgICAgICAgICAvLyB0aGUgbmV3IG9iamVjdCBjYW4gdXNlIGBgYHRoaXMucGFyZW50YGBgIHRvIGFjY2Vzc1xuICAgICAgICAgICAgLy8gdGhlIHJvb3QgY2xhc3NcbiAgICAgICAgICAgIGNoaWxkT2IucGFyZW50ID0gb2I7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBDaGF0RW5naW5lO1xuXG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIGFuIGluc3RhbmNlIG9mIENoYXRFbmdpbmVcbiAgICByZXR1cm4gaW5pdCgpO1xuXG59XG5cbi8vIGV4cG9ydCB0aGUgQ2hhdEVuZ2luZSBhcGlcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsdWdpbjoge30sICAvLyBsZWF2ZSBhIHNwb3QgZm9yIHBsdWdpbnMgdG8gZXhpc3RcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIndpbmRvdy5DaGF0RW5naW5lQ29yZSA9IHdpbmRvdy5DaGF0RW5naW5lQ29yZSB8fCByZXF1aXJlKCcuL2luZGV4LmpzJyk7XG4iXX0=
