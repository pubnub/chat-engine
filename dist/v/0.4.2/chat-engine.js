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
;
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

            if(typeof payload == "object") {

                // restore chat in payload
                if(!payload.chat) {
                    payload.chat = this;
                }

                // turn a uuid found in payload.sender to a real user
                if(payload.sender && ChatEngine.users[payload.sender]) {
                    payload.sender = ChatEngine.users[payload.sender];
                }

            }

            // let plugins modify the event
            this.runPluginQueue('on', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // emit this event to any listener
                this._emit(event, payload);

            });

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
                state: this.users[uuid].state(this)
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

            console.log('user found as leaving', this.channel, 'with uuid', uuid)

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
                    channels: [this.channel]
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
                console.log('got here')
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
            A map of the User's state in each {@link Chat}. Stays in sync automatically.

            @private
            @type Object
            */
            this.states = {};

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

            this.direct.on('$.server.chat.created', (payload) => {
                ChatEngine.addChatToSession(payload.chat);
            });


            this.direct.on('$.server.chat.deleted', (payload) => {

                ChatEngine.removeChatFromSession(payload.chat);
            });

            // update this user's state in it's created context
            this.assign(state, chat)

        }

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
        state(chat = ChatEngine.global) {
            return this.states[chat.channel] || {};
        }

        /**
        * @private
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state, chat = ChatEngine.global) {
            let chatState = this.state(chat) || {};
            this.states[chat.channel] = Object.assign(chatState, state);
        }

        /**
        this is only called from network updates

        @private
        */
        assign(state, chat) {
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
            chat.setState(state);

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
                        let map = {
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

                        let eventName = ['$', 'network', map[statusEvent.category]|| 'undefined'].join('.');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvaW50ZXJuYWwvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9vbmx5T25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy93YXRlcmZhbGwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J0b2EuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvY29uc3RhbnQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbm9vcC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcHVibnViL2Rpc3Qvd2ViL3B1Ym51Yi5taW4uanMiLCJzcmMvaW5kZXguanMiLCJzcmMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hvREE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gb25jZTtcbmZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIGNhbGxGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBvbmx5T25jZTtcbmZ1bmN0aW9uIG9ubHlPbmNlKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICB2YXIgY2FsbEZuID0gZm47XG4gICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9ICgwLCBfb25jZTIuZGVmYXVsdCkoY2FsbGJhY2sgfHwgX25vb3AyLmRlZmF1bHQpO1xuICAgIGlmICghKDAsIF9pc0FycmF5Mi5kZWZhdWx0KSh0YXNrcykpIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHdhdGVyZmFsbCBtdXN0IGJlIGFuIGFycmF5IG9mIGZ1bmN0aW9ucycpKTtcbiAgICBpZiAoIXRhc2tzLmxlbmd0aCkgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgdmFyIHRhc2tJbmRleCA9IDA7XG5cbiAgICBmdW5jdGlvbiBuZXh0VGFzayhhcmdzKSB7XG4gICAgICAgIGlmICh0YXNrSW5kZXggPT09IHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtudWxsXS5jb25jYXQoYXJncykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9ICgwLCBfb25seU9uY2UyLmRlZmF1bHQpKCgwLCBfYmFzZVJlc3QyLmRlZmF1bHQpKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5leHRUYXNrKGFyZ3MpO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgYXJncy5wdXNoKHRhc2tDYWxsYmFjayk7XG5cbiAgICAgICAgdmFyIHRhc2sgPSB0YXNrc1t0YXNrSW5kZXgrK107XG4gICAgICAgIHRhc2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuXG4gICAgbmV4dFRhc2soW10pO1xufTtcblxudmFyIF9pc0FycmF5ID0gcmVxdWlyZSgnbG9kYXNoL2lzQXJyYXknKTtcblxudmFyIF9pc0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzQXJyYXkpO1xuXG52YXIgX25vb3AgPSByZXF1aXJlKCdsb2Rhc2gvbm9vcCcpO1xuXG52YXIgX25vb3AyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbm9vcCk7XG5cbnZhciBfb25jZSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvb25jZScpO1xuXG52YXIgX29uY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfb25jZSk7XG5cbnZhciBfYmFzZVJlc3QgPSByZXF1aXJlKCdsb2Rhc2gvX2Jhc2VSZXN0Jyk7XG5cbnZhciBfYmFzZVJlc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmFzZVJlc3QpO1xuXG52YXIgX29ubHlPbmNlID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9vbmx5T25jZScpO1xuXG52YXIgX29ubHlPbmNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29ubHlPbmNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKlxuICogUnVucyB0aGUgYHRhc2tzYCBhcnJheSBvZiBmdW5jdGlvbnMgaW4gc2VyaWVzLCBlYWNoIHBhc3NpbmcgdGhlaXIgcmVzdWx0cyB0b1xuICogdGhlIG5leHQgaW4gdGhlIGFycmF5LiBIb3dldmVyLCBpZiBhbnkgb2YgdGhlIGB0YXNrc2AgcGFzcyBhbiBlcnJvciB0byB0aGVpclxuICogb3duIGNhbGxiYWNrLCB0aGUgbmV4dCBmdW5jdGlvbiBpcyBub3QgZXhlY3V0ZWQsIGFuZCB0aGUgbWFpbiBgY2FsbGJhY2tgIGlzXG4gKiBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGUgZXJyb3IuXG4gKlxuICogQG5hbWUgd2F0ZXJmYWxsXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgbW9kdWxlOkNvbnRyb2xGbG93XG4gKiBAbWV0aG9kXG4gKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gKiBAcGFyYW0ge0FycmF5fSB0YXNrcyAtIEFuIGFycmF5IG9mIGZ1bmN0aW9ucyB0byBydW4sIGVhY2ggZnVuY3Rpb24gaXMgcGFzc2VkXG4gKiBhIGBjYWxsYmFjayhlcnIsIHJlc3VsdDEsIHJlc3VsdDIsIC4uLilgIGl0IG11c3QgY2FsbCBvbiBjb21wbGV0aW9uLiBUaGVcbiAqIGZpcnN0IGFyZ3VtZW50IGlzIGFuIGVycm9yICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzXG4gKiB3aWxsIGJlIHBhc3NlZCBhcyBhcmd1bWVudHMgaW4gb3JkZXIgdG8gdGhlIG5leHQgdGFzay5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBbiBvcHRpb25hbCBjYWxsYmFjayB0byBydW4gb25jZSBhbGwgdGhlXG4gKiBmdW5jdGlvbnMgaGF2ZSBjb21wbGV0ZWQuIFRoaXMgd2lsbCBiZSBwYXNzZWQgdGhlIHJlc3VsdHMgb2YgdGhlIGxhc3QgdGFzaydzXG4gKiBjYWxsYmFjay4gSW52b2tlZCB3aXRoIChlcnIsIFtyZXN1bHRzXSkuXG4gKiBAcmV0dXJucyB1bmRlZmluZWRcbiAqIEBleGFtcGxlXG4gKlxuICogYXN5bmMud2F0ZXJmYWxsKFtcbiAqICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICogICAgICAgICBjYWxsYmFjayhudWxsLCAnb25lJywgJ3R3bycpO1xuICogICAgIH0sXG4gKiAgICAgZnVuY3Rpb24oYXJnMSwgYXJnMiwgY2FsbGJhY2spIHtcbiAqICAgICAgICAgLy8gYXJnMSBub3cgZXF1YWxzICdvbmUnIGFuZCBhcmcyIG5vdyBlcXVhbHMgJ3R3bydcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ3RocmVlJyk7XG4gKiAgICAgfSxcbiAqICAgICBmdW5jdGlvbihhcmcxLCBjYWxsYmFjaykge1xuICogICAgICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ3RocmVlJ1xuICogICAgICAgICBjYWxsYmFjayhudWxsLCAnZG9uZScpO1xuICogICAgIH1cbiAqIF0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICogICAgIC8vIHJlc3VsdCBub3cgZXF1YWxzICdkb25lJ1xuICogfSk7XG4gKlxuICogLy8gT3IsIHdpdGggbmFtZWQgZnVuY3Rpb25zOlxuICogYXN5bmMud2F0ZXJmYWxsKFtcbiAqICAgICBteUZpcnN0RnVuY3Rpb24sXG4gKiAgICAgbXlTZWNvbmRGdW5jdGlvbixcbiAqICAgICBteUxhc3RGdW5jdGlvbixcbiAqIF0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICogICAgIC8vIHJlc3VsdCBub3cgZXF1YWxzICdkb25lJ1xuICogfSk7XG4gKiBmdW5jdGlvbiBteUZpcnN0RnVuY3Rpb24oY2FsbGJhY2spIHtcbiAqICAgICBjYWxsYmFjayhudWxsLCAnb25lJywgJ3R3bycpO1xuICogfVxuICogZnVuY3Rpb24gbXlTZWNvbmRGdW5jdGlvbihhcmcxLCBhcmcyLCBjYWxsYmFjaykge1xuICogICAgIC8vIGFyZzEgbm93IGVxdWFscyAnb25lJyBhbmQgYXJnMiBub3cgZXF1YWxzICd0d28nXG4gKiAgICAgY2FsbGJhY2sobnVsbCwgJ3RocmVlJyk7XG4gKiB9XG4gKiBmdW5jdGlvbiBteUxhc3RGdW5jdGlvbihhcmcxLCBjYWxsYmFjaykge1xuICogICAgIC8vIGFyZzEgbm93IGVxdWFscyAndGhyZWUnXG4gKiAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAqIH1cbiAqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIGJ0b2EgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmJ0b2EgJiYgd2luZG93LmJ0b2EuYmluZCh3aW5kb3cpKSB8fCByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnRvYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHZhciBsb2FkRXZlbnQgPSAnb25yZWFkeXN0YXRlY2hhbmdlJztcbiAgICB2YXIgeERvbWFpbiA9IGZhbHNlO1xuXG4gICAgLy8gRm9yIElFIDgvOSBDT1JTIHN1cHBvcnRcbiAgICAvLyBPbmx5IHN1cHBvcnRzIFBPU1QgYW5kIEdFVCBjYWxscyBhbmQgZG9lc24ndCByZXR1cm5zIHRoZSByZXNwb25zZSBoZWFkZXJzLlxuICAgIC8vIERPTidUIGRvIHRoaXMgZm9yIHRlc3RpbmcgYi9jIFhNTEh0dHBSZXF1ZXN0IGlzIG1vY2tlZCwgbm90IFhEb21haW5SZXF1ZXN0LlxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnICYmXG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHdpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKCd3aXRoQ3JlZGVudGlhbHMnIGluIHJlcXVlc3QpICYmXG4gICAgICAgICFpc1VSTFNhbWVPcmlnaW4oY29uZmlnLnVybCkpIHtcbiAgICAgIHJlcXVlc3QgPSBuZXcgd2luZG93LlhEb21haW5SZXF1ZXN0KCk7XG4gICAgICBsb2FkRXZlbnQgPSAnb25sb2FkJztcbiAgICAgIHhEb21haW4gPSB0cnVlO1xuICAgICAgcmVxdWVzdC5vbnByb2dyZXNzID0gZnVuY3Rpb24gaGFuZGxlUHJvZ3Jlc3MoKSB7fTtcbiAgICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHt9O1xuICAgIH1cblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgfHwgJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3RbbG9hZEV2ZW50XSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgKHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCAmJiAheERvbWFpbikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgLy8gSUUgc2VuZHMgMTIyMyBpbnN0ZWFkIG9mIDIwNCAoaHR0cHM6Ly9naXRodWIuY29tL216YWJyaXNraWUvYXhpb3MvaXNzdWVzLzIwMSlcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/ICdObyBDb250ZW50JyA6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgdmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xuXG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oY29uZmlnLnVybCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLndpdGhDcmVkZW50aWFscykge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3REYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UodXRpbHMubWVyZ2UoZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSB1dGlscy5tZXJnZSh7XG4gICAgICB1cmw6IGFyZ3VtZW50c1swXVxuICAgIH0sIGFyZ3VtZW50c1sxXSk7XG4gIH1cblxuICBjb25maWcgPSB1dGlscy5tZXJnZShkZWZhdWx0cywgdGhpcy5kZWZhdWx0cywgeyBtZXRob2Q6ICdnZXQnIH0sIGNvbmZpZyk7XG4gIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gU3VwcG9ydCBiYXNlVVJMIGNvbmZpZ1xuICBpZiAoY29uZmlnLmJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwoY29uZmlnLnVybCkpIHtcbiAgICBjb25maWcudXJsID0gY29tYmluZVVSTHMoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHV0aWxzLm1lcmdlKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybFxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzIHx8IHt9XG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIC8vIE5vdGU6IHN0YXR1cyBpcyBub3QgZXhwb3NlZCBieSBYRG9tYWluUmVxdWVzdFxuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIElnbm9yZSAqLyB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gYnRvYSBwb2x5ZmlsbCBmb3IgSUU8MTAgY291cnRlc3kgaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkY2hhbWJlcnMvQmFzZTY0LmpzXG5cbnZhciBjaGFycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG5cbmZ1bmN0aW9uIEUoKSB7XG4gIHRoaXMubWVzc2FnZSA9ICdTdHJpbmcgY29udGFpbnMgYW4gaW52YWxpZCBjaGFyYWN0ZXInO1xufVxuRS5wcm90b3R5cGUgPSBuZXcgRXJyb3I7XG5FLnByb3RvdHlwZS5jb2RlID0gNTtcbkUucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuZnVuY3Rpb24gYnRvYShpbnB1dCkge1xuICB2YXIgc3RyID0gU3RyaW5nKGlucHV0KTtcbiAgdmFyIG91dHB1dCA9ICcnO1xuICBmb3IgKFxuICAgIC8vIGluaXRpYWxpemUgcmVzdWx0IGFuZCBjb3VudGVyXG4gICAgdmFyIGJsb2NrLCBjaGFyQ29kZSwgaWR4ID0gMCwgbWFwID0gY2hhcnM7XG4gICAgLy8gaWYgdGhlIG5leHQgc3RyIGluZGV4IGRvZXMgbm90IGV4aXN0OlxuICAgIC8vICAgY2hhbmdlIHRoZSBtYXBwaW5nIHRhYmxlIHRvIFwiPVwiXG4gICAgLy8gICBjaGVjayBpZiBkIGhhcyBubyBmcmFjdGlvbmFsIGRpZ2l0c1xuICAgIHN0ci5jaGFyQXQoaWR4IHwgMCkgfHwgKG1hcCA9ICc9JywgaWR4ICUgMSk7XG4gICAgLy8gXCI4IC0gaWR4ICUgMSAqIDhcIiBnZW5lcmF0ZXMgdGhlIHNlcXVlbmNlIDIsIDQsIDYsIDhcbiAgICBvdXRwdXQgKz0gbWFwLmNoYXJBdCg2MyAmIGJsb2NrID4+IDggLSBpZHggJSAxICogOClcbiAgKSB7XG4gICAgY2hhckNvZGUgPSBzdHIuY2hhckNvZGVBdChpZHggKz0gMyAvIDQpO1xuICAgIGlmIChjaGFyQ29kZSA+IDB4RkYpIHtcbiAgICAgIHRocm93IG5ldyBFKCk7XG4gICAgfVxuICAgIGJsb2NrID0gYmxvY2sgPDwgOCB8IGNoYXJDb2RlO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnRvYTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lNDAvZ2ksICdAJykuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgfSxcblxuICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgdmFyIG9yaWdpblVSTDtcblxuICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICB9XG5cbiAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBpc0J1ZmZlciA9IHJlcXVpcmUoJ2lzLWJ1ZmZlcicpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgIWlzQXJyYXkob2JqKSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHR5cGVvZiByZXN1bHRba2V5XSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW1cbn07XG4iLCIvKiFcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBCdWZmZXJcbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG4vLyBUaGUgX2lzQnVmZmVyIGNoZWNrIGlzIGZvciBTYWZhcmkgNS03IHN1cHBvcnQsIGJlY2F1c2UgaXQncyBtaXNzaW5nXG4vLyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yLiBSZW1vdmUgdGhpcyBldmVudHVhbGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIChpc0J1ZmZlcihvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcilcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKG9iaikge1xuICByZXR1cm4gISFvYmouY29uc3RydWN0b3IgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKVxufVxuXG4vLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LlxuZnVuY3Rpb24gaXNTbG93QnVmZmVyIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmoucmVhZEZsb2F0TEUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5zbGljZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0J1ZmZlcihvYmouc2xpY2UoMCwgMCkpXG59XG4iLCIvKiFcclxuICogRXZlbnRFbWl0dGVyMlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vaGlqMW54L0V2ZW50RW1pdHRlcjJcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDEzIGhpajFueFxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqL1xyXG47IWZ1bmN0aW9uKHVuZGVmaW5lZCkge1xyXG5cclxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gX2lzQXJyYXkob2JqKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuICB9O1xyXG4gIHZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIGlmICh0aGlzLl9jb25mKSB7XHJcbiAgICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIHRoaXMuX2NvbmYpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlndXJlKGNvbmYpIHtcclxuICAgIGlmIChjb25mKSB7XHJcbiAgICAgIHRoaXMuX2NvbmYgPSBjb25mO1xyXG5cclxuICAgICAgY29uZi5kZWxpbWl0ZXIgJiYgKHRoaXMuZGVsaW1pdGVyID0gY29uZi5kZWxpbWl0ZXIpO1xyXG4gICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gY29uZi5tYXhMaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCA/IGNvbmYubWF4TGlzdGVuZXJzIDogZGVmYXVsdE1heExpc3RlbmVycztcclxuICAgICAgY29uZi53aWxkY2FyZCAmJiAodGhpcy53aWxkY2FyZCA9IGNvbmYud2lsZGNhcmQpO1xyXG4gICAgICBjb25mLm5ld0xpc3RlbmVyICYmICh0aGlzLm5ld0xpc3RlbmVyID0gY29uZi5uZXdMaXN0ZW5lcik7XHJcbiAgICAgIGNvbmYudmVyYm9zZU1lbW9yeUxlYWsgJiYgKHRoaXMudmVyYm9zZU1lbW9yeUxlYWsgPSBjb25mLnZlcmJvc2VNZW1vcnlMZWFrKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lclRyZWUgPSB7fTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2dQb3NzaWJsZU1lbW9yeUxlYWsoY291bnQsIGV2ZW50TmFtZSkge1xyXG4gICAgdmFyIGVycm9yTXNnID0gJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xyXG4gICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xyXG4gICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nO1xyXG5cclxuICAgIGlmKHRoaXMudmVyYm9zZU1lbW9yeUxlYWspe1xyXG4gICAgICBlcnJvck1zZyArPSAnIEV2ZW50IG5hbWU6ICVzLic7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGNvdW50LCBldmVudE5hbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvck1zZywgY291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb25zb2xlLnRyYWNlKXtcclxuICAgICAgY29uc29sZS50cmFjZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKGNvbmYpIHtcclxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xyXG4gICAgdGhpcy5uZXdMaXN0ZW5lciA9IGZhbHNlO1xyXG4gICAgdGhpcy52ZXJib3NlTWVtb3J5TGVhayA9IGZhbHNlO1xyXG4gICAgY29uZmlndXJlLmNhbGwodGhpcywgY29uZik7XHJcbiAgfVxyXG4gIEV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyOyAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBmb3IgZXhwb3J0aW5nIEV2ZW50RW1pdHRlciBwcm9wZXJ0eVxyXG5cclxuICAvL1xyXG4gIC8vIEF0dGVudGlvbiwgZnVuY3Rpb24gcmV0dXJuIHR5cGUgbm93IGlzIGFycmF5LCBhbHdheXMgIVxyXG4gIC8vIEl0IGhhcyB6ZXJvIGVsZW1lbnRzIGlmIG5vIGFueSBtYXRjaGVzIGZvdW5kIGFuZCBvbmUgb3IgbW9yZVxyXG4gIC8vIGVsZW1lbnRzIChsZWFmcykgaWYgdGhlcmUgYXJlIG1hdGNoZXNcclxuICAvL1xyXG4gIGZ1bmN0aW9uIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgaSkge1xyXG4gICAgaWYgKCF0cmVlKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHZhciBsaXN0ZW5lcnM9W10sIGxlYWYsIGxlbiwgYnJhbmNoLCB4VHJlZSwgeHhUcmVlLCBpc29sYXRlZEJyYW5jaCwgZW5kUmVhY2hlZCxcclxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZS5sZW5ndGgsIGN1cnJlbnRUeXBlID0gdHlwZVtpXSwgbmV4dFR5cGUgPSB0eXBlW2krMV07XHJcbiAgICBpZiAoaSA9PT0gdHlwZUxlbmd0aCAmJiB0cmVlLl9saXN0ZW5lcnMpIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgZXZlbnQocykgbGlzdCBhbmQgdGhlIHRyZWUgaGFzIGxpc3RlbmVyc1xyXG4gICAgICAvLyBpbnZva2UgdGhvc2UgbGlzdGVuZXJzLlxyXG4gICAgICAvL1xyXG4gICAgICBpZiAodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzKTtcclxuICAgICAgICByZXR1cm4gW3RyZWVdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAobGVhZiA9IDAsIGxlbiA9IHRyZWUuX2xpc3RlbmVycy5sZW5ndGg7IGxlYWYgPCBsZW47IGxlYWYrKykge1xyXG4gICAgICAgICAgaGFuZGxlcnMgJiYgaGFuZGxlcnMucHVzaCh0cmVlLl9saXN0ZW5lcnNbbGVhZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3RyZWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChjdXJyZW50VHlwZSA9PT0gJyonIHx8IGN1cnJlbnRUeXBlID09PSAnKionKSB8fCB0cmVlW2N1cnJlbnRUeXBlXSkge1xyXG4gICAgICAvL1xyXG4gICAgICAvLyBJZiB0aGUgZXZlbnQgZW1pdHRlZCBpcyAnKicgYXQgdGhpcyBwYXJ0XHJcbiAgICAgIC8vIG9yIHRoZXJlIGlzIGEgY29uY3JldGUgbWF0Y2ggYXQgdGhpcyBwYXRjaFxyXG4gICAgICAvL1xyXG4gICAgICBpZiAoY3VycmVudFR5cGUgPT09ICcqJykge1xyXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcclxuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsxKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICAgIH0gZWxzZSBpZihjdXJyZW50VHlwZSA9PT0gJyoqJykge1xyXG4gICAgICAgIGVuZFJlYWNoZWQgPSAoaSsxID09PSB0eXBlTGVuZ3RoIHx8IChpKzIgPT09IHR5cGVMZW5ndGggJiYgbmV4dFR5cGUgPT09ICcqJykpO1xyXG4gICAgICAgIGlmKGVuZFJlYWNoZWQgJiYgdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAvLyBUaGUgbmV4dCBlbGVtZW50IGhhcyBhIF9saXN0ZW5lcnMsIGFkZCBpdCB0byB0aGUgaGFuZGxlcnMuXHJcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgdHlwZUxlbmd0aCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChicmFuY2ggaW4gdHJlZSkge1xyXG4gICAgICAgICAgaWYgKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHRyZWUuaGFzT3duUHJvcGVydHkoYnJhbmNoKSkge1xyXG4gICAgICAgICAgICBpZihicmFuY2ggPT09ICcqJyB8fCBicmFuY2ggPT09ICcqKicpIHtcclxuICAgICAgICAgICAgICBpZih0cmVlW2JyYW5jaF0uX2xpc3RlbmVycyAmJiAhZW5kUmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgdHlwZUxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IG5leHRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsyKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gTm8gbWF0Y2ggb24gdGhpcyBvbmUsIHNoaWZ0IGludG8gdGhlIHRyZWUgYnV0IG5vdCBpbiB0aGUgdHlwZSBhcnJheS5cclxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgICAgfVxyXG5cclxuICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbY3VycmVudFR5cGVdLCBpKzEpKTtcclxuICAgIH1cclxuXHJcbiAgICB4VHJlZSA9IHRyZWVbJyonXTtcclxuICAgIGlmICh4VHJlZSkge1xyXG4gICAgICAvL1xyXG4gICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgdHJlZSB3aWxsIGFsbG93IGFueSBtYXRjaCBmb3IgdGhpcyBwYXJ0LFxyXG4gICAgICAvLyB0aGVuIHJlY3Vyc2l2ZWx5IGV4cGxvcmUgYWxsIGJyYW5jaGVzIG9mIHRoZSB0cmVlXHJcbiAgICAgIC8vXHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeFRyZWUsIGkrMSk7XHJcbiAgICB9XHJcblxyXG4gICAgeHhUcmVlID0gdHJlZVsnKionXTtcclxuICAgIGlmKHh4VHJlZSkge1xyXG4gICAgICBpZihpIDwgdHlwZUxlbmd0aCkge1xyXG4gICAgICAgIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbGlzdGVuZXIgb24gYSAnKionLCBpdCB3aWxsIGNhdGNoIGFsbCwgc28gYWRkIGl0cyBoYW5kbGVyLlxyXG4gICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgYXJyYXlzIG9mIG1hdGNoaW5nIG5leHQgYnJhbmNoZXMgYW5kIG90aGVycy5cclxuICAgICAgICBmb3IoYnJhbmNoIGluIHh4VHJlZSkge1xyXG4gICAgICAgICAgaWYoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgeHhUcmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xyXG4gICAgICAgICAgICAgIC8vIFdlIGtub3cgdGhlIG5leHQgZWxlbWVudCB3aWxsIG1hdGNoLCBzbyBqdW1wIHR3aWNlLlxyXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlW2JyYW5jaF0sIGkrMik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IGN1cnJlbnRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgLy8gQ3VycmVudCBub2RlIG1hdGNoZXMsIG1vdmUgaW50byB0aGUgdHJlZS5cclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoID0ge307XHJcbiAgICAgICAgICAgICAgaXNvbGF0ZWRCcmFuY2hbYnJhbmNoXSA9IHh4VHJlZVticmFuY2hdO1xyXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeyAnKionOiBpc29sYXRlZEJyYW5jaCB9LCBpKzEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYoeHhUcmVlLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICAvLyBXZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBhbmQgc3RpbGwgb24gYSAnKionXHJcbiAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xyXG4gICAgICB9IGVsc2UgaWYoeHhUcmVlWycqJ10gJiYgeHhUcmVlWycqJ10uX2xpc3RlbmVycykge1xyXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlWycqJ10sIHR5cGVMZW5ndGgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGxpc3RlbmVycztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdyb3dMaXN0ZW5lclRyZWUodHlwZSwgbGlzdGVuZXIpIHtcclxuXHJcbiAgICB0eXBlID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIExvb2tzIGZvciB0d28gY29uc2VjdXRpdmUgJyoqJywgaWYgc28sIGRvbid0IGFkZCB0aGUgZXZlbnQgYXQgYWxsLlxyXG4gICAgLy9cclxuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHR5cGUubGVuZ3RoOyBpKzEgPCBsZW47IGkrKykge1xyXG4gICAgICBpZih0eXBlW2ldID09PSAnKionICYmIHR5cGVbaSsxXSA9PT0gJyoqJykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0cmVlID0gdGhpcy5saXN0ZW5lclRyZWU7XHJcbiAgICB2YXIgbmFtZSA9IHR5cGUuc2hpZnQoKTtcclxuXHJcbiAgICB3aGlsZSAobmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICBpZiAoIXRyZWVbbmFtZV0pIHtcclxuICAgICAgICB0cmVlW25hbWVdID0ge307XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyZWUgPSB0cmVlW25hbWVdO1xyXG5cclxuICAgICAgaWYgKHR5cGUubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgIGlmICghdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBsaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBbdHJlZS5fbGlzdGVuZXJzXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAhdHJlZS5fbGlzdGVuZXJzLndhcm5lZCAmJlxyXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID4gMCAmJlxyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoID4gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVyc1xyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRyZWUuX2xpc3RlbmVycy53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBsb2dQb3NzaWJsZU1lbW9yeUxlYWsuY2FsbCh0aGlzLCB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoLCBuYW1lKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgbmFtZSA9IHR5cGUuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhblxyXG4gIC8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxyXG4gIC8vIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxyXG4gIC8vXHJcbiAgLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXHJcbiAgLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZGVsaW1pdGVyID0gJy4nO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcclxuICAgIGlmIChuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IG47XHJcbiAgICAgIGlmICghdGhpcy5fY29uZikgdGhpcy5fY29uZiA9IHt9O1xyXG4gICAgICB0aGlzLl9jb25mLm1heExpc3RlbmVycyA9IG47XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudCA9ICcnO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pIHtcclxuICAgIHRoaXMubWFueShldmVudCwgMSwgZm4pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5tYW55ID0gZnVuY3Rpb24oZXZlbnQsIHR0bCwgZm4pIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XHJcbiAgICAgIGlmICgtLXR0bCA9PT0gMCkge1xyXG4gICAgICAgIHNlbGYub2ZmKGV2ZW50LCBsaXN0ZW5lcik7XHJcbiAgICAgIH1cclxuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lci5fb3JpZ2luID0gZm47XHJcblxyXG4gICAgdGhpcy5vbihldmVudCwgbGlzdGVuZXIpO1xyXG5cclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgaWYgKCF0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgYWwgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgdmFyIGFyZ3MsbCxpLGo7XHJcbiAgICB2YXIgaGFuZGxlcjtcclxuXHJcbiAgICBpZiAodGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGgpIHtcclxuICAgICAgaGFuZGxlciA9IHRoaXMuX2FsbC5zbGljZSgpO1xyXG4gICAgICBpZiAoYWwgPiAzKSB7XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCk7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGFsOyBqKyspIGFyZ3Nbal0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBoYW5kbGVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzLCB0eXBlLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICBoYW5kbGVyID0gW107XHJcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVyLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsIC0gMSk7XHJcbiAgICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIGlmIChoYW5kbGVyKSB7XHJcbiAgICAgICAgLy8gbmVlZCB0byBtYWtlIGNvcHkgb2YgaGFuZGxlcnMgYmVjYXVzZSBsaXN0IGNhbiBjaGFuZ2UgaW4gdGhlIG1pZGRsZVxyXG4gICAgICAgIC8vIG9mIGVtaXQgY2FsbFxyXG4gICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLmxlbmd0aCkge1xyXG4gICAgICBpZiAoYWwgPiAzKSB7XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gaGFuZGxlci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fYWxsICYmIHR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICEhdGhpcy5fYWxsO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEFzeW5jID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1swXTtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ25ld0xpc3RlbmVyJyAmJiAhdGhpcy5uZXdMaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUoW2ZhbHNlXSk7IH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvbWlzZXM9IFtdO1xyXG5cclxuICAgIHZhciBhbCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICB2YXIgYXJncyxsLGksajtcclxuICAgIHZhciBoYW5kbGVyO1xyXG5cclxuICAgIGlmICh0aGlzLl9hbGwpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2pdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLl9hbGwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLl9hbGxbaV0uY2FsbCh0aGlzLCB0eXBlLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5hcHBseSh0aGlzLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgaGFuZGxlciA9IFtdO1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5sZW5ndGgpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChpID0gMCwgbCA9IGhhbmRsZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyW2ldLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fYWxsICYmIHR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGFyZ3VtZW50c1sxXSk7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcclxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLm9uQW55KHR5cGUpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignb24gb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09IFwibmV3TGlzdGVuZXJzXCIhIEJlZm9yZVxyXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lcnNcIi5cclxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgZ3Jvd0xpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcclxuICAgICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXHJcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fZXZlbnRzW3R5cGVdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gQ2hhbmdlIHRvIGFycmF5LlxyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXHJcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXHJcbiAgICAgIGlmIChcclxuICAgICAgICAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPiAwICYmXHJcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnNcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XHJcbiAgICAgICAgbG9nUG9zc2libGVNZW1vcnlMZWFrLmNhbGwodGhpcywgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCwgdHlwZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uQW55ID0gZnVuY3Rpb24oZm4pIHtcclxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbkFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9hbGwpIHtcclxuICAgICAgdGhpcy5fYWxsID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBmdW5jdGlvbiB0byB0aGUgZXZlbnQgbGlzdGVuZXIgY29sbGVjdGlvbi5cclxuICAgIHRoaXMuX2FsbC5wdXNoKGZuKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFuZGxlcnMsbGVhZnM9W107XHJcblxyXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgbGVhZnMgPSBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBudWxsLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxyXG4gICAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICBsZWFmcy5wdXNoKHtfbGlzdGVuZXJzOmhhbmRsZXJzfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaUxlYWY9MDsgaUxlYWY8bGVhZnMubGVuZ3RoOyBpTGVhZisrKSB7XHJcbiAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xyXG4gICAgICBoYW5kbGVycyA9IGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgaWYgKGlzQXJyYXkoaGFuZGxlcnMpKSB7XHJcblxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChoYW5kbGVyc1tpXSA9PT0gbGlzdGVuZXIgfHxcclxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLmxpc3RlbmVyICYmIGhhbmRsZXJzW2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikgfHxcclxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLl9vcmlnaW4gJiYgaGFuZGxlcnNbaV0uX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgIGxlYWYuX2xpc3RlbmVycy5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgICAgICBkZWxldGUgbGVhZi5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lclwiLCB0eXBlLCBsaXN0ZW5lcik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGhhbmRsZXJzID09PSBsaXN0ZW5lciB8fFxyXG4gICAgICAgIChoYW5kbGVycy5saXN0ZW5lciAmJiBoYW5kbGVycy5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XHJcbiAgICAgICAgKGhhbmRsZXJzLl9vcmlnaW4gJiYgaGFuZGxlcnMuX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XHJcbiAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlTGlzdGVuZXJcIiwgdHlwZSwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVjdXJzaXZlbHlHYXJiYWdlQ29sbGVjdChyb290KSB7XHJcbiAgICAgIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb290KTtcclxuICAgICAgZm9yICh2YXIgaSBpbiBrZXlzKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIG9iaiA9IHJvb3Rba2V5XTtcclxuICAgICAgICBpZiAoKG9iaiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB8fCAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikgfHwgKG9iaiA9PT0gbnVsbCkpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICByZWN1cnNpdmVseUdhcmJhZ2VDb2xsZWN0KHJvb3Rba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgZGVsZXRlIHJvb3Rba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlY3Vyc2l2ZWx5R2FyYmFnZUNvbGxlY3QodGhpcy5saXN0ZW5lclRyZWUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmQW55ID0gZnVuY3Rpb24oZm4pIHtcclxuICAgIHZhciBpID0gMCwgbCA9IDAsIGZucztcclxuICAgIGlmIChmbiAmJiB0aGlzLl9hbGwgJiYgdGhpcy5fYWxsLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm5zID0gdGhpcy5fYWxsO1xyXG4gICAgICBmb3IoaSA9IDAsIGwgPSBmbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYoZm4gPT09IGZuc1tpXSkge1xyXG4gICAgICAgICAgZm5zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyQW55XCIsIGZuKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm5zID0gdGhpcy5fYWxsO1xyXG4gICAgICBmb3IoaSA9IDAsIGwgPSBmbnMubGVuZ3RoOyBpIDwgbDsgaSsrKVxyXG4gICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyQW55XCIsIGZuc1tpXSk7XHJcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICF0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgdmFyIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xyXG4gICAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xyXG4gICAgICAgIGxlYWYuX2xpc3RlbmVycyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50cykge1xyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgaGFuZGxlcnMgPSBbXTtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXJzLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgICByZXR1cm4gaGFuZGxlcnM7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gW107XHJcbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyc0FueSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmKHRoaXMuX2FsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fYWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAvLyBDb21tb25KU1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gQnJvd3NlciBnbG9iYWwuXHJcbiAgICB3aW5kb3cuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcclxuICB9XHJcbn0oKTtcclxuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgdmFsdWUgPSBPYmplY3QodmFsdWUpO1xuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIHZhbHVlKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuIiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpLFxuICAgIG92ZXJSZXN0ID0gcmVxdWlyZSgnLi9fb3ZlclJlc3QnKSxcbiAgICBzZXRUb1N0cmluZyA9IHJlcXVpcmUoJy4vX3NldFRvU3RyaW5nJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VSZXN0O1xuIiwidmFyIGNvbnN0YW50ID0gcmVxdWlyZSgnLi9jb25zdGFudCcpLFxuICAgIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNldFRvU3RyaW5nO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZUpzRGF0YTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lUHJvcGVydHk7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlclJlc3Q7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgYmFzZVNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fYmFzZVNldFRvU3RyaW5nJyksXG4gICAgc2hvcnRPdXQgPSByZXF1aXJlKCcuL19zaG9ydE91dCcpO1xuXG4vKipcbiAqIFNldHMgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIG9mIGBmdW5jYCB0byByZXR1cm4gYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgc2V0VG9TdHJpbmcgPSBzaG9ydE91dChiYXNlU2V0VG9TdHJpbmcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvU3RyaW5nO1xuIiwiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3J0T3V0O1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHMpO1xuICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0c1swXSA9PT0gb2JqZWN0c1sxXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uc3RhbnQ7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8ubm9vcCk7XG4gKiAvLyA9PiBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIE5vIG9wZXJhdGlvbiBwZXJmb3JtZWQuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIhZnVuY3Rpb24oZSx0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9leHBvcnRzLlB1Yk51Yj10KCk6ZS5QdWJOdWI9dCgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQocil7aWYobltyXSlyZXR1cm4gbltyXS5leHBvcnRzO3ZhciBpPW5bcl09e2V4cG9ydHM6e30saWQ6cixsb2FkZWQ6ITF9O3JldHVybiBlW3JdLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLHQpLGkubG9hZGVkPSEwLGkuZXhwb3J0c312YXIgbj17fTtyZXR1cm4gdC5tPWUsdC5jPW4sdC5wPVwiXCIsdCgwKX0oW2Z1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBvKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gcyhlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfWZ1bmN0aW9uIGEoZSl7aWYoIW5hdmlnYXRvcnx8IW5hdmlnYXRvci5zZW5kQmVhY29uKXJldHVybiExO25hdmlnYXRvci5zZW5kQmVhY29uKGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciB1PW4oMSksYz1yKHUpLGw9big0MCksaD1yKGwpLGY9big0MSksZD1yKGYpLHA9big0MiksZz0obig4KSxmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUpe2kodGhpcyx0KTt2YXIgbj1lLmxpc3RlblRvQnJvd3Nlck5ldHdvcmtFdmVudHMscj12b2lkIDA9PT1ufHxuO2UuZGI9ZC5kZWZhdWx0LGUuc2RrRmFtaWx5PVwiV2ViXCIsZS5uZXR3b3JraW5nPW5ldyBoLmRlZmF1bHQoe2dldDpwLmdldCxwb3N0OnAucG9zdCxzZW5kQmVhY29uOmF9KTt2YXIgcz1vKHRoaXMsKHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwodGhpcyxlKSk7cmV0dXJuIHImJih3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9mZmxpbmVcIixmdW5jdGlvbigpe3MubmV0d29ya0Rvd25EZXRlY3RlZCgpfSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmxpbmVcIixmdW5jdGlvbigpe3MubmV0d29ya1VwRGV0ZWN0ZWQoKX0pKSxzfXJldHVybiBzKHQsZSksdH0oYy5kZWZhdWx0KSk7dC5kZWZhdWx0PWcsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBuIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbikmJih0W25dPWVbbl0pO3JldHVybiB0LmRlZmF1bHQ9ZSx0fWZ1bmN0aW9uIGkoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIG8oZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksYT1uKDIpLHU9aShhKSxjPW4oNyksbD1pKGMpLGg9big5KSxmPWkoaCksZD1uKDExKSxwPWkoZCksZz1uKDEyKSx5PWkoZyksdj1uKDE4KSxiPWkodiksXz1uKDE5KSxtPXIoXyksaz1uKDIwKSxQPXIoayksUz1uKDIxKSx3PXIoUyksTz1uKDIyKSxUPXIoTyksQz1uKDIzKSxNPXIoQyksRT1uKDI0KSx4PXIoRSksTj1uKDI1KSxSPXIoTiksSz1uKDI2KSxBPXIoSyksaj1uKDI3KSxEPXIoaiksRz1uKDI4KSxVPXIoRyksQj1uKDI5KSxJPXIoQiksSD1uKDMwKSxMPXIoSCkscT1uKDMxKSxGPXIocSksej1uKDMyKSxYPXIoeiksVz1uKDMzKSxWPXIoVyksSj1uKDM0KSwkPXIoSiksUT1uKDM1KSxZPXIoUSksWj1uKDM2KSxlZT1yKFopLHRlPW4oMzcpLG5lPXIodGUpLHJlPW4oMzgpLGllPXIocmUpLG9lPW4oMTUpLHNlPXIob2UpLGFlPW4oMzkpLHVlPXIoYWUpLGNlPW4oMTYpLGxlPWkoY2UpLGhlPW4oMTMpLGZlPWkoaGUpLGRlPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10aGlzO28odGhpcyxlKTt2YXIgcj10LmRiLGk9dC5uZXR3b3JraW5nLHM9dGhpcy5fY29uZmlnPW5ldyBsLmRlZmF1bHQoe3NldHVwOnQsZGI6cn0pLGE9bmV3IGYuZGVmYXVsdCh7Y29uZmlnOnN9KTtpLmluaXQocyk7dmFyIHU9e2NvbmZpZzpzLG5ldHdvcmtpbmc6aSxjcnlwdG86YX0sYz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsc2UpLGg9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFUpLGQ9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEwpLGc9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFgpLHY9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHVlKSxfPXRoaXMuX2xpc3RlbmVyTWFuYWdlcj1uZXcgeS5kZWZhdWx0LGs9bmV3IHAuZGVmYXVsdCh7dGltZUVuZHBvaW50OmMsbGVhdmVFbmRwb2ludDpoLGhlYXJ0YmVhdEVuZHBvaW50OmQsc2V0U3RhdGVFbmRwb2ludDpnLHN1YnNjcmliZUVuZHBvaW50OnYsY3J5cHRvOnUuY3J5cHRvLGNvbmZpZzp1LmNvbmZpZyxsaXN0ZW5lck1hbmFnZXI6X30pO3RoaXMuYWRkTGlzdGVuZXI9Xy5hZGRMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlTGlzdGVuZXI9Xy5yZW1vdmVMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzPV8ucmVtb3ZlQWxsTGlzdGVuZXJzLmJpbmQoXyksdGhpcy5jaGFubmVsR3JvdXBzPXtsaXN0R3JvdXBzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxUKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LE0pLGFkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxtKSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUCksZGVsZXRlR3JvdXA6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHcpfSx0aGlzLnB1c2g9e2FkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSx4KSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUiksZGVsZXRlRGV2aWNlOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxEKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEEpfSx0aGlzLmhlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFYpLHRoaXMud2hlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEkpLHRoaXMuZ2V0U3RhdGU9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEYpLHRoaXMuc2V0U3RhdGU9ay5hZGFwdFN0YXRlQ2hhbmdlLmJpbmQoayksdGhpcy5ncmFudD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsWSksdGhpcy5hdWRpdD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsJCksdGhpcy5wdWJsaXNoPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxlZSksdGhpcy5maXJlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUucmVwbGljYXRlPSExLGUuc3RvcmVJbkhpc3Rvcnk9ITEsbi5wdWJsaXNoKGUsdCl9LHRoaXMuaGlzdG9yeT1iLmRlZmF1bHQuYmluZCh0aGlzLHUsbmUpLHRoaXMuZmV0Y2hNZXNzYWdlcz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsaWUpLHRoaXMudGltZT1jLHRoaXMuc3Vic2NyaWJlPWsuYWRhcHRTdWJzY3JpYmVDaGFuZ2UuYmluZChrKSx0aGlzLnVuc3Vic2NyaWJlPWsuYWRhcHRVbnN1YnNjcmliZUNoYW5nZS5iaW5kKGspLHRoaXMuZGlzY29ubmVjdD1rLmRpc2Nvbm5lY3QuYmluZChrKSx0aGlzLnJlY29ubmVjdD1rLnJlY29ubmVjdC5iaW5kKGspLHRoaXMuZGVzdHJveT1mdW5jdGlvbihlKXtrLnVuc3Vic2NyaWJlQWxsKGUpLGsuZGlzY29ubmVjdCgpfSx0aGlzLnN0b3A9dGhpcy5kZXN0cm95LHRoaXMudW5zdWJzY3JpYmVBbGw9ay51bnN1YnNjcmliZUFsbC5iaW5kKGspLHRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxzPWsuZ2V0U3Vic2NyaWJlZENoYW5uZWxzLmJpbmQoayksdGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwcz1rLmdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzLmJpbmQoayksdGhpcy5lbmNyeXB0PWEuZW5jcnlwdC5iaW5kKGEpLHRoaXMuZGVjcnlwdD1hLmRlY3J5cHQuYmluZChhKSx0aGlzLmdldEF1dGhLZXk9dS5jb25maWcuZ2V0QXV0aEtleS5iaW5kKHUuY29uZmlnKSx0aGlzLnNldEF1dGhLZXk9dS5jb25maWcuc2V0QXV0aEtleS5iaW5kKHUuY29uZmlnKSx0aGlzLnNldENpcGhlcktleT11LmNvbmZpZy5zZXRDaXBoZXJLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5nZXRVVUlEPXUuY29uZmlnLmdldFVVSUQuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRVVUlEPXUuY29uZmlnLnNldFVVSUQuYmluZCh1LmNvbmZpZyksdGhpcy5nZXRGaWx0ZXJFeHByZXNzaW9uPXUuY29uZmlnLmdldEZpbHRlckV4cHJlc3Npb24uYmluZCh1LmNvbmZpZyksdGhpcy5zZXRGaWx0ZXJFeHByZXNzaW9uPXUuY29uZmlnLnNldEZpbHRlckV4cHJlc3Npb24uYmluZCh1LmNvbmZpZyl9cmV0dXJuIHMoZSxbe2tleTpcImdldFZlcnNpb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jb25maWcuZ2V0VmVyc2lvbigpfX0se2tleTpcIm5ldHdvcmtEb3duRGV0ZWN0ZWRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtEb3duKCksdGhpcy5fY29uZmlnLnJlc3RvcmU/dGhpcy5kaXNjb25uZWN0KCk6dGhpcy5kZXN0cm95KCEwKX19LHtrZXk6XCJuZXR3b3JrVXBEZXRlY3RlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTmV0d29ya1VwKCksdGhpcy5yZWNvbm5lY3QoKX19XSxbe2tleTpcImdlbmVyYXRlVVVJRFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHUuZGVmYXVsdC52NCgpfX1dKSxlfSgpKTtkZS5PUEVSQVRJT05TPWxlLmRlZmF1bHQsZGUuQ0FURUdPUklFUz1mZS5kZWZhdWx0LHQuZGVmYXVsdD1kZSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7dmFyIHI9bigzKSxpPW4oNiksbz1pO28udjE9cixvLnY0PWksZS5leHBvcnRzPW99LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKGUsdCxuKXt2YXIgcj10JiZufHwwLGk9dHx8W107ZT1lfHx7fTt2YXIgcz12b2lkIDAhPT1lLmNsb2Nrc2VxP2UuY2xvY2tzZXE6dSxoPXZvaWQgMCE9PWUubXNlY3M/ZS5tc2VjczoobmV3IERhdGUpLmdldFRpbWUoKSxmPXZvaWQgMCE9PWUubnNlY3M/ZS5uc2VjczpsKzEsZD1oLWMrKGYtbCkvMWU0O2lmKGQ8MCYmdm9pZCAwPT09ZS5jbG9ja3NlcSYmKHM9cysxJjE2MzgzKSwoZDwwfHxoPmMpJiZ2b2lkIDA9PT1lLm5zZWNzJiYoZj0wKSxmPj0xZTQpdGhyb3cgbmV3IEVycm9yKFwidXVpZC52MSgpOiBDYW4ndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWNcIik7Yz1oLGw9Zix1PXMsaCs9MTIyMTkyOTI4ZTU7dmFyIHA9KDFlNCooMjY4NDM1NDU1JmgpK2YpJTQyOTQ5NjcyOTY7aVtyKytdPXA+Pj4yNCYyNTUsaVtyKytdPXA+Pj4xNiYyNTUsaVtyKytdPXA+Pj44JjI1NSxpW3IrK109MjU1JnA7dmFyIGc9aC80Mjk0OTY3Mjk2KjFlNCYyNjg0MzU0NTU7aVtyKytdPWc+Pj44JjI1NSxpW3IrK109MjU1JmcsaVtyKytdPWc+Pj4yNCYxNXwxNixpW3IrK109Zz4+PjE2JjI1NSxpW3IrK109cz4+Pjh8MTI4LGlbcisrXT0yNTUmcztmb3IodmFyIHk9ZS5ub2RlfHxhLHY9MDt2PDY7Kyt2KWlbcit2XT15W3ZdO3JldHVybiB0fHxvKGkpfXZhciBpPW4oNCksbz1uKDUpLHM9aSgpLGE9WzF8c1swXSxzWzFdLHNbMl0sc1szXSxzWzRdLHNbNV1dLHU9MTYzODMmKHNbNl08PDh8c1s3XSksYz0wLGw9MDtlLmV4cG9ydHM9cn0sZnVuY3Rpb24oZSx0KXsoZnVuY3Rpb24odCl7dmFyIG4scj10LmNyeXB0b3x8dC5tc0NyeXB0bztpZihyJiZyLmdldFJhbmRvbVZhbHVlcyl7dmFyIGk9bmV3IFVpbnQ4QXJyYXkoMTYpO249ZnVuY3Rpb24oKXtyZXR1cm4gci5nZXRSYW5kb21WYWx1ZXMoaSksaX19aWYoIW4pe3ZhciBvPW5ldyBBcnJheSgxNik7bj1mdW5jdGlvbigpe2Zvcih2YXIgZSx0PTA7dDwxNjt0KyspMD09KDMmdCkmJihlPTQyOTQ5NjcyOTYqTWF0aC5yYW5kb20oKSksb1t0XT1lPj4+KCgzJnQpPDwzKSYyNTU7cmV0dXJuIG99fWUuZXhwb3J0cz1ufSkuY2FsbCh0LGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KCkpfSxmdW5jdGlvbihlLHQpe2Z1bmN0aW9uIG4oZSx0KXt2YXIgbj10fHwwLGk9cjtyZXR1cm4gaVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dfWZvcih2YXIgcj1bXSxpPTA7aTwyNTY7KytpKXJbaV09KGkrMjU2KS50b1N0cmluZygxNikuc3Vic3RyKDEpO2UuZXhwb3J0cz1ufSxmdW5jdGlvbihlLHQsbil7ZnVuY3Rpb24gcihlLHQsbil7dmFyIHI9dCYmbnx8MDtcInN0cmluZ1wiPT10eXBlb2YgZSYmKHQ9XCJiaW5hcnlcIj09ZT9uZXcgQXJyYXkoMTYpOm51bGwsZT1udWxsKSxlPWV8fHt9O3ZhciBzPWUucmFuZG9tfHwoZS5ybmd8fGkpKCk7aWYoc1s2XT0xNSZzWzZdfDY0LHNbOF09NjMmc1s4XXwxMjgsdClmb3IodmFyIGE9MDthPDE2OysrYSl0W3IrYV09c1thXTtyZXR1cm4gdHx8byhzKX12YXIgaT1uKDQpLG89big1KTtlLmV4cG9ydHM9cn0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBpPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz1uKDIpLHM9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShvKSxhPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LnNldHVwLGk9dC5kYjtyKHRoaXMsZSksdGhpcy5fZGI9aSx0aGlzLmluc3RhbmNlSWQ9XCJwbi1cIitzLmRlZmF1bHQudjQoKSx0aGlzLnNlY3JldEtleT1uLnNlY3JldEtleXx8bi5zZWNyZXRfa2V5LHRoaXMuc3Vic2NyaWJlS2V5PW4uc3Vic2NyaWJlS2V5fHxuLnN1YnNjcmliZV9rZXksdGhpcy5wdWJsaXNoS2V5PW4ucHVibGlzaEtleXx8bi5wdWJsaXNoX2tleSx0aGlzLnNka0ZhbWlseT1uLnNka0ZhbWlseSx0aGlzLnBhcnRuZXJJZD1uLnBhcnRuZXJJZCx0aGlzLnNldEF1dGhLZXkobi5hdXRoS2V5KSx0aGlzLnNldENpcGhlcktleShuLmNpcGhlcktleSksdGhpcy5zZXRGaWx0ZXJFeHByZXNzaW9uKG4uZmlsdGVyRXhwcmVzc2lvbiksdGhpcy5vcmlnaW49bi5vcmlnaW58fFwicHVic3ViLnB1Ym51Yi5jb21cIix0aGlzLnNlY3VyZT1uLnNzbHx8ITEsdGhpcy5yZXN0b3JlPW4ucmVzdG9yZXx8ITEsdGhpcy5wcm94eT1uLnByb3h5LHRoaXMua2VlcEFsaXZlPW4ua2VlcEFsaXZlLHRoaXMua2VlcEFsaXZlU2V0dGluZ3M9bi5rZWVwQWxpdmVTZXR0aW5ncyx0aGlzLmF1dG9OZXR3b3JrRGV0ZWN0aW9uPW4uYXV0b05ldHdvcmtEZXRlY3Rpb258fCExLHRoaXMuY3VzdG9tRW5jcnlwdD1uLmN1c3RvbUVuY3J5cHQsdGhpcy5jdXN0b21EZWNyeXB0PW4uY3VzdG9tRGVjcnlwdCxcInVuZGVmaW5lZFwiIT10eXBlb2YgbG9jYXRpb24mJlwiaHR0cHM6XCI9PT1sb2NhdGlvbi5wcm90b2NvbCYmKHRoaXMuc2VjdXJlPSEwKSx0aGlzLmxvZ1ZlcmJvc2l0eT1uLmxvZ1ZlcmJvc2l0eXx8ITEsdGhpcy5zdXBwcmVzc0xlYXZlRXZlbnRzPW4uc3VwcHJlc3NMZWF2ZUV2ZW50c3x8ITEsdGhpcy5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHM9bi5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHN8fCEwLHRoaXMuYW5ub3VuY2VTdWNjZXNzZnVsSGVhcnRiZWF0cz1uLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHN8fCExLHRoaXMudXNlSW5zdGFuY2VJZD1uLnVzZUluc3RhbmNlSWR8fCExLHRoaXMudXNlUmVxdWVzdElkPW4udXNlUmVxdWVzdElkfHwhMSx0aGlzLnJlcXVlc3RNZXNzYWdlQ291bnRUaHJlc2hvbGQ9bi5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkLHRoaXMuc2V0VHJhbnNhY3Rpb25UaW1lb3V0KG4udHJhbnNhY3Rpb25hbFJlcXVlc3RUaW1lb3V0fHwxNWUzKSx0aGlzLnNldFN1YnNjcmliZVRpbWVvdXQobi5zdWJzY3JpYmVSZXF1ZXN0VGltZW91dHx8MzFlNCksdGhpcy5zZXRTZW5kQmVhY29uQ29uZmlnKG4udXNlU2VuZEJlYWNvbnx8ITApLHRoaXMuc2V0UHJlc2VuY2VUaW1lb3V0KG4ucHJlc2VuY2VUaW1lb3V0fHwzMDApLG4uaGVhcnRiZWF0SW50ZXJ2YWwmJnRoaXMuc2V0SGVhcnRiZWF0SW50ZXJ2YWwobi5oZWFydGJlYXRJbnRlcnZhbCksdGhpcy5zZXRVVUlEKHRoaXMuX2RlY2lkZVVVSUQobi51dWlkKSl9cmV0dXJuIGkoZSxbe2tleTpcImdldEF1dGhLZXlcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmF1dGhLZXl9fSx7a2V5Olwic2V0QXV0aEtleVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmF1dGhLZXk9ZSx0aGlzfX0se2tleTpcInNldENpcGhlcktleVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmNpcGhlcktleT1lLHRoaXN9fSx7a2V5OlwiZ2V0VVVJRFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuVVVJRH19LHtrZXk6XCJzZXRVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2RiJiZ0aGlzLl9kYi5zZXQmJnRoaXMuX2RiLnNldCh0aGlzLnN1YnNjcmliZUtleStcInV1aWRcIixlKSx0aGlzLlVVSUQ9ZSx0aGlzfX0se2tleTpcImdldEZpbHRlckV4cHJlc3Npb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZpbHRlckV4cHJlc3Npb259fSx7a2V5Olwic2V0RmlsdGVyRXhwcmVzc2lvblwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmZpbHRlckV4cHJlc3Npb249ZSx0aGlzfX0se2tleTpcImdldFByZXNlbmNlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ByZXNlbmNlVGltZW91dH19LHtrZXk6XCJzZXRQcmVzZW5jZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcHJlc2VuY2VUaW1lb3V0PWUsdGhpcy5zZXRIZWFydGJlYXRJbnRlcnZhbCh0aGlzLl9wcmVzZW5jZVRpbWVvdXQvMi0xKSx0aGlzfX0se2tleTpcImdldEhlYXJ0YmVhdEludGVydmFsXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWx9fSx7a2V5Olwic2V0SGVhcnRiZWF0SW50ZXJ2YWxcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWw9ZSx0aGlzfX0se2tleTpcImdldFN1YnNjcmliZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdWJzY3JpYmVSZXF1ZXN0VGltZW91dH19LHtrZXk6XCJzZXRTdWJzY3JpYmVUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3N1YnNjcmliZVJlcXVlc3RUaW1lb3V0PWUsdGhpc319LHtrZXk6XCJnZXRUcmFuc2FjdGlvblRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl90cmFuc2FjdGlvbmFsUmVxdWVzdFRpbWVvdXR9fSx7a2V5Olwic2V0VHJhbnNhY3Rpb25UaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3RyYW5zYWN0aW9uYWxSZXF1ZXN0VGltZW91dD1lLHRoaXN9fSx7a2V5OlwiaXNTZW5kQmVhY29uRW5hYmxlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3VzZVNlbmRCZWFjb259fSx7a2V5Olwic2V0U2VuZEJlYWNvbkNvbmZpZ1wiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl91c2VTZW5kQmVhY29uPWUsdGhpc319LHtrZXk6XCJnZXRWZXJzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm5cIjQuMTMuMFwifX0se2tleTpcIl9kZWNpZGVVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIGV8fCh0aGlzLl9kYiYmdGhpcy5fZGIuZ2V0JiZ0aGlzLl9kYi5nZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIpP3RoaXMuX2RiLmdldCh0aGlzLnN1YnNjcmliZUtleStcInV1aWRcIik6XCJwbi1cIitzLmRlZmF1bHQudjQoKSl9fV0pLGV9KCkpO3QuZGVmYXVsdD1hLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZS5leHBvcnRzPXt9fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oNyksYT0ocihzKSxuKDEwKSksdT1yKGEpLGM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuY29uZmlnO2kodGhpcyxlKSx0aGlzLl9jb25maWc9bix0aGlzLl9pdj1cIjAxMjM0NTY3ODkwMTIzNDVcIix0aGlzLl9hbGxvd2VkS2V5RW5jb2RpbmdzPVtcImhleFwiLFwidXRmOFwiLFwiYmFzZTY0XCIsXCJiaW5hcnlcIl0sdGhpcy5fYWxsb3dlZEtleUxlbmd0aHM9WzEyOCwyNTZdLHRoaXMuX2FsbG93ZWRNb2Rlcz1bXCJlY2JcIixcImNiY1wiXSx0aGlzLl9kZWZhdWx0T3B0aW9ucz17ZW5jcnlwdEtleTohMCxrZXlFbmNvZGluZzpcInV0ZjhcIixrZXlMZW5ndGg6MjU2LG1vZGU6XCJjYmNcIn19cmV0dXJuIG8oZSxbe2tleTpcIkhNQUNTSEEyNTZcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdS5kZWZhdWx0LkhtYWNTSEEyNTYoZSx0aGlzLl9jb25maWcuc2VjcmV0S2V5KS50b1N0cmluZyh1LmRlZmF1bHQuZW5jLkJhc2U2NCl9fSx7a2V5OlwiU0hBMjU2XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHUuZGVmYXVsdC5TSEEyNTYoZSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5IZXgpfX0se2tleTpcIl9wYXJzZU9wdGlvbnNcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1lfHx7fTtyZXR1cm4gdC5oYXNPd25Qcm9wZXJ0eShcImVuY3J5cHRLZXlcIil8fCh0LmVuY3J5cHRLZXk9dGhpcy5fZGVmYXVsdE9wdGlvbnMuZW5jcnlwdEtleSksdC5oYXNPd25Qcm9wZXJ0eShcImtleUVuY29kaW5nXCIpfHwodC5rZXlFbmNvZGluZz10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlFbmNvZGluZyksdC5oYXNPd25Qcm9wZXJ0eShcImtleUxlbmd0aFwiKXx8KHQua2V5TGVuZ3RoPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUxlbmd0aCksdC5oYXNPd25Qcm9wZXJ0eShcIm1vZGVcIil8fCh0Lm1vZGU9dGhpcy5fZGVmYXVsdE9wdGlvbnMubW9kZSksLTE9PT10aGlzLl9hbGxvd2VkS2V5RW5jb2RpbmdzLmluZGV4T2YodC5rZXlFbmNvZGluZy50b0xvd2VyQ2FzZSgpKSYmKHQua2V5RW5jb2Rpbmc9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5RW5jb2RpbmcpLC0xPT09dGhpcy5fYWxsb3dlZEtleUxlbmd0aHMuaW5kZXhPZihwYXJzZUludCh0LmtleUxlbmd0aCwxMCkpJiYodC5rZXlMZW5ndGg9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5TGVuZ3RoKSwtMT09PXRoaXMuX2FsbG93ZWRNb2Rlcy5pbmRleE9mKHQubW9kZS50b0xvd2VyQ2FzZSgpKSYmKHQubW9kZT10aGlzLl9kZWZhdWx0T3B0aW9ucy5tb2RlKSx0fX0se2tleTpcIl9kZWNvZGVLZXlcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3JldHVyblwiYmFzZTY0XCI9PT10LmtleUVuY29kaW5nP3UuZGVmYXVsdC5lbmMuQmFzZTY0LnBhcnNlKGUpOlwiaGV4XCI9PT10LmtleUVuY29kaW5nP3UuZGVmYXVsdC5lbmMuSGV4LnBhcnNlKGUpOmV9fSx7a2V5OlwiX2dldFBhZGRlZEtleVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIGU9dGhpcy5fZGVjb2RlS2V5KGUsdCksdC5lbmNyeXB0S2V5P3UuZGVmYXVsdC5lbmMuVXRmOC5wYXJzZSh0aGlzLlNIQTI1NihlKS5zbGljZSgwLDMyKSk6ZX19LHtrZXk6XCJfZ2V0TW9kZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVyblwiZWNiXCI9PT1lLm1vZGU/dS5kZWZhdWx0Lm1vZGUuRUNCOnUuZGVmYXVsdC5tb2RlLkNCQ319LHtrZXk6XCJfZ2V0SVZcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm5cImNiY1wiPT09ZS5tb2RlP3UuZGVmYXVsdC5lbmMuVXRmOC5wYXJzZSh0aGlzLl9pdik6bnVsbH19LHtrZXk6XCJlbmNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9jb25maWcuY3VzdG9tRW5jcnlwdD90aGlzLl9jb25maWcuY3VzdG9tRW5jcnlwdChlKTp0aGlzLnBuRW5jcnlwdChlLHQsbil9fSx7a2V5OlwiZGVjcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fY29uZmlnLmN1c3RvbURlY3J5cHQ/dGhpcy5fY29uZmlnLmN1c3RvbURlY3J5cHQoZSk6dGhpcy5wbkRlY3J5cHQoZSx0LG4pfX0se2tleTpcInBuRW5jcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtpZighdCYmIXRoaXMuX2NvbmZpZy5jaXBoZXJLZXkpcmV0dXJuIGU7bj10aGlzLl9wYXJzZU9wdGlvbnMobik7dmFyIHI9dGhpcy5fZ2V0SVYobiksaT10aGlzLl9nZXRNb2RlKG4pLG89dGhpcy5fZ2V0UGFkZGVkS2V5KHR8fHRoaXMuX2NvbmZpZy5jaXBoZXJLZXksbik7cmV0dXJuIHUuZGVmYXVsdC5BRVMuZW5jcnlwdChlLG8se2l2OnIsbW9kZTppfSkuY2lwaGVydGV4dC50b1N0cmluZyh1LmRlZmF1bHQuZW5jLkJhc2U2NCl8fGV9fSx7a2V5OlwicG5EZWNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe2lmKCF0JiYhdGhpcy5fY29uZmlnLmNpcGhlcktleSlyZXR1cm4gZTtuPXRoaXMuX3BhcnNlT3B0aW9ucyhuKTt2YXIgcj10aGlzLl9nZXRJVihuKSxpPXRoaXMuX2dldE1vZGUobiksbz10aGlzLl9nZXRQYWRkZWRLZXkodHx8dGhpcy5fY29uZmlnLmNpcGhlcktleSxuKTt0cnl7dmFyIHM9dS5kZWZhdWx0LmVuYy5CYXNlNjQucGFyc2UoZSksYT11LmRlZmF1bHQuQUVTLmRlY3J5cHQoe2NpcGhlcnRleHQ6c30sbyx7aXY6cixtb2RlOml9KS50b1N0cmluZyh1LmRlZmF1bHQuZW5jLlV0ZjgpO3JldHVybiBKU09OLnBhcnNlKGEpfWNhdGNoKGUpe3JldHVybiBudWxsfX19XSksZX0oKTt0LmRlZmF1bHQ9YyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO3ZhciBuPW58fGZ1bmN0aW9uKGUsdCl7dmFyIG49e30scj1uLmxpYj17fSxpPWZ1bmN0aW9uKCl7fSxvPXIuQmFzZT17ZXh0ZW5kOmZ1bmN0aW9uKGUpe2kucHJvdG90eXBlPXRoaXM7dmFyIHQ9bmV3IGk7cmV0dXJuIGUmJnQubWl4SW4oZSksdC5oYXNPd25Qcm9wZXJ0eShcImluaXRcIil8fCh0LmluaXQ9ZnVuY3Rpb24oKXt0LiRzdXBlci5pbml0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0pLHQuaW5pdC5wcm90b3R5cGU9dCx0LiRzdXBlcj10aGlzLHR9LGNyZWF0ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuZXh0ZW5kKCk7cmV0dXJuIGUuaW5pdC5hcHBseShlLGFyZ3VtZW50cyksZX0saW5pdDpmdW5jdGlvbigpe30sbWl4SW46ZnVuY3Rpb24oZSl7Zm9yKHZhciB0IGluIGUpZS5oYXNPd25Qcm9wZXJ0eSh0KSYmKHRoaXNbdF09ZVt0XSk7ZS5oYXNPd25Qcm9wZXJ0eShcInRvU3RyaW5nXCIpJiYodGhpcy50b1N0cmluZz1lLnRvU3RyaW5nKX0sY2xvbmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbml0LnByb3RvdHlwZS5leHRlbmQodGhpcyl9fSxzPXIuV29yZEFycmF5PW8uZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUsdCl7ZT10aGlzLndvcmRzPWV8fFtdLHRoaXMuc2lnQnl0ZXM9dm9pZCAwIT10P3Q6NCplLmxlbmd0aH0sdG9TdHJpbmc6ZnVuY3Rpb24oZSl7cmV0dXJuKGV8fHUpLnN0cmluZ2lmeSh0aGlzKX0sY29uY2F0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMud29yZHMsbj1lLndvcmRzLHI9dGhpcy5zaWdCeXRlcztpZihlPWUuc2lnQnl0ZXMsdGhpcy5jbGFtcCgpLHIlNClmb3IodmFyIGk9MDtpPGU7aSsrKXRbcitpPj4+Ml18PShuW2k+Pj4yXT4+PjI0LWklNCo4JjI1NSk8PDI0LShyK2kpJTQqODtlbHNlIGlmKDY1NTM1PG4ubGVuZ3RoKWZvcihpPTA7aTxlO2krPTQpdFtyK2k+Pj4yXT1uW2k+Pj4yXTtlbHNlIHQucHVzaC5hcHBseSh0LG4pO3JldHVybiB0aGlzLnNpZ0J5dGVzKz1lLHRoaXN9LGNsYW1wOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy53b3JkcyxuPXRoaXMuc2lnQnl0ZXM7dFtuPj4+Ml0mPTQyOTQ5NjcyOTU8PDMyLW4lNCo4LHQubGVuZ3RoPWUuY2VpbChuLzQpfSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPW8uY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS53b3Jkcz10aGlzLndvcmRzLnNsaWNlKDApLGV9LHJhbmRvbTpmdW5jdGlvbih0KXtmb3IodmFyIG49W10scj0wO3I8dDtyKz00KW4ucHVzaCg0Mjk0OTY3Mjk2KmUucmFuZG9tKCl8MCk7cmV0dXJuIG5ldyBzLmluaXQobix0KX19KSxhPW4uZW5jPXt9LHU9YS5IZXg9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzO2U9ZS5zaWdCeXRlcztmb3IodmFyIG49W10scj0wO3I8ZTtyKyspe3ZhciBpPXRbcj4+PjJdPj4+MjQtciU0KjgmMjU1O24ucHVzaCgoaT4+PjQpLnRvU3RyaW5nKDE2KSksbi5wdXNoKCgxNSZpKS50b1N0cmluZygxNikpfXJldHVybiBuLmpvaW4oXCJcIil9LHBhcnNlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1lLmxlbmd0aCxuPVtdLHI9MDtyPHQ7cis9MiluW3I+Pj4zXXw9cGFyc2VJbnQoZS5zdWJzdHIociwyKSwxNik8PDI0LXIlOCo0O3JldHVybiBuZXcgcy5pbml0KG4sdC8yKX19LGM9YS5MYXRpbjE9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzO2U9ZS5zaWdCeXRlcztmb3IodmFyIG49W10scj0wO3I8ZTtyKyspbi5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUodFtyPj4+Ml0+Pj4yNC1yJTQqOCYyNTUpKTtyZXR1cm4gbi5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXtmb3IodmFyIHQ9ZS5sZW5ndGgsbj1bXSxyPTA7cjx0O3IrKyluW3I+Pj4yXXw9KDI1NSZlLmNoYXJDb2RlQXQocikpPDwyNC1yJTQqODtyZXR1cm4gbmV3IHMuaW5pdChuLHQpfX0sbD1hLlV0Zjg9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt0cnl7cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoYy5zdHJpbmdpZnkoZSkpKX1jYXRjaChlKXt0aHJvdyBFcnJvcihcIk1hbGZvcm1lZCBVVEYtOCBkYXRhXCIpfX0scGFyc2U6ZnVuY3Rpb24oZSl7cmV0dXJuIGMucGFyc2UodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGUpKSl9fSxoPXIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobT1vLmV4dGVuZCh7cmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9kYXRhPW5ldyBzLmluaXQsdGhpcy5fbkRhdGFCeXRlcz0wfSxfYXBwZW5kOmZ1bmN0aW9uKGUpe1wic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT1sLnBhcnNlKGUpKSx0aGlzLl9kYXRhLmNvbmNhdChlKSx0aGlzLl9uRGF0YUJ5dGVzKz1lLnNpZ0J5dGVzfSxfcHJvY2VzczpmdW5jdGlvbih0KXt2YXIgbj10aGlzLl9kYXRhLHI9bi53b3JkcyxpPW4uc2lnQnl0ZXMsbz10aGlzLmJsb2NrU2l6ZSxhPWkvKDQqbyksYT10P2UuY2VpbChhKTplLm1heCgoMHxhKS10aGlzLl9taW5CdWZmZXJTaXplLDApO2lmKHQ9YSpvLGk9ZS5taW4oNCp0LGkpLHQpe2Zvcih2YXIgdT0wO3U8dDt1Kz1vKXRoaXMuX2RvUHJvY2Vzc0Jsb2NrKHIsdSk7dT1yLnNwbGljZSgwLHQpLG4uc2lnQnl0ZXMtPWl9cmV0dXJuIG5ldyBzLmluaXQodSxpKX0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1vLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2RhdGE9dGhpcy5fZGF0YS5jbG9uZSgpLGV9LF9taW5CdWZmZXJTaXplOjB9KTtyLkhhc2hlcj1oLmV4dGVuZCh7Y2ZnOm8uZXh0ZW5kKCksaW5pdDpmdW5jdGlvbihlKXt0aGlzLmNmZz10aGlzLmNmZy5leHRlbmQoZSksdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe2gucmVzZXQuY2FsbCh0aGlzKSx0aGlzLl9kb1Jlc2V0KCl9LHVwZGF0ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fYXBwZW5kKGUpLHRoaXMuX3Byb2Nlc3MoKSx0aGlzfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmdGhpcy5fYXBwZW5kKGUpLHRoaXMuX2RvRmluYWxpemUoKX0sYmxvY2tTaXplOjE2LF9jcmVhdGVIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsbil7cmV0dXJuIG5ldyBlLmluaXQobikuZmluYWxpemUodCl9fSxfY3JlYXRlSG1hY0hlbHBlcjpmdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24odCxuKXtyZXR1cm4gbmV3IGYuSE1BQy5pbml0KGUsbikuZmluYWxpemUodCl9fX0pO3ZhciBmPW4uYWxnbz17fTtyZXR1cm4gbn0oTWF0aCk7IWZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1uLHI9dC5saWIsaT1yLldvcmRBcnJheSxvPXIuSGFzaGVyLHI9dC5hbGdvLHM9W10sYT1bXSx1PWZ1bmN0aW9uKGUpe3JldHVybiA0Mjk0OTY3Mjk2KihlLSgwfGUpKXwwfSxjPTIsbD0wOzY0Pmw7KXt2YXIgaDtlOntoPWM7Zm9yKHZhciBmPWUuc3FydChoKSxkPTI7ZDw9ZjtkKyspaWYoIShoJWQpKXtoPSExO2JyZWFrIGV9aD0hMH1oJiYoOD5sJiYoc1tsXT11KGUucG93KGMsLjUpKSksYVtsXT11KGUucG93KGMsMS8zKSksbCsrKSxjKyt9dmFyIHA9W10scj1yLlNIQTI1Nj1vLmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9oYXNoPW5ldyBpLmluaXQocy5zbGljZSgwKSl9LF9kb1Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj10aGlzLl9oYXNoLndvcmRzLHI9blswXSxpPW5bMV0sbz1uWzJdLHM9blszXSx1PW5bNF0sYz1uWzVdLGw9bls2XSxoPW5bN10sZj0wOzY0PmY7ZisrKXtpZigxNj5mKXBbZl09MHxlW3QrZl07ZWxzZXt2YXIgZD1wW2YtMTVdLGc9cFtmLTJdO3BbZl09KChkPDwyNXxkPj4+NyleKGQ8PDE0fGQ+Pj4xOCleZD4+PjMpK3BbZi03XSsoKGc8PDE1fGc+Pj4xNyleKGc8PDEzfGc+Pj4xOSleZz4+PjEwKStwW2YtMTZdfWQ9aCsoKHU8PDI2fHU+Pj42KV4odTw8MjF8dT4+PjExKV4odTw8N3x1Pj4+MjUpKSsodSZjXn51JmwpK2FbZl0rcFtmXSxnPSgocjw8MzB8cj4+PjIpXihyPDwxOXxyPj4+MTMpXihyPDwxMHxyPj4+MjIpKSsociZpXnImb15pJm8pLGg9bCxsPWMsYz11LHU9cytkfDAscz1vLG89aSxpPXIscj1kK2d8MH1uWzBdPW5bMF0rcnwwLG5bMV09blsxXStpfDAsblsyXT1uWzJdK298MCxuWzNdPW5bM10rc3wwLG5bNF09bls0XSt1fDAsbls1XT1uWzVdK2N8MCxuWzZdPW5bNl0rbHwwLG5bN109bls3XStofDB9LF9kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fZGF0YSxuPXQud29yZHMscj04KnRoaXMuX25EYXRhQnl0ZXMsaT04KnQuc2lnQnl0ZXM7cmV0dXJuIG5baT4+PjVdfD0xMjg8PDI0LWklMzIsblsxNCsoaSs2ND4+Pjk8PDQpXT1lLmZsb29yKHIvNDI5NDk2NzI5NiksblsxNSsoaSs2ND4+Pjk8PDQpXT1yLHQuc2lnQnl0ZXM9NCpuLmxlbmd0aCx0aGlzLl9wcm9jZXNzKCksdGhpcy5faGFzaH0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1vLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2hhc2g9dGhpcy5faGFzaC5jbG9uZSgpLGV9fSk7dC5TSEEyNTY9by5fY3JlYXRlSGVscGVyKHIpLHQuSG1hY1NIQTI1Nj1vLl9jcmVhdGVIbWFjSGVscGVyKHIpfShNYXRoKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmVuYy5VdGY4O2UuYWxnby5ITUFDPWUubGliLkJhc2UuZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUsbil7ZT10aGlzLl9oYXNoZXI9bmV3IGUuaW5pdCxcInN0cmluZ1wiPT10eXBlb2YgbiYmKG49dC5wYXJzZShuKSk7dmFyIHI9ZS5ibG9ja1NpemUsaT00KnI7bi5zaWdCeXRlcz5pJiYobj1lLmZpbmFsaXplKG4pKSxuLmNsYW1wKCk7Zm9yKHZhciBvPXRoaXMuX29LZXk9bi5jbG9uZSgpLHM9dGhpcy5faUtleT1uLmNsb25lKCksYT1vLndvcmRzLHU9cy53b3JkcyxjPTA7YzxyO2MrKylhW2NdXj0xNTQ5NTU2ODI4LHVbY11ePTkwOTUyMjQ4NjtvLnNpZ0J5dGVzPXMuc2lnQnl0ZXM9aSx0aGlzLnJlc2V0KCl9LHJlc2V0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5faGFzaGVyO2UucmVzZXQoKSxlLnVwZGF0ZSh0aGlzLl9pS2V5KX0sdXBkYXRlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9oYXNoZXIudXBkYXRlKGUpLHRoaXN9LGZpbmFsaXplOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuX2hhc2hlcjtyZXR1cm4gZT10LmZpbmFsaXplKGUpLHQucmVzZXQoKSx0LmZpbmFsaXplKHRoaXMuX29LZXkuY2xvbmUoKS5jb25jYXQoZSkpfX0pfSgpLGZ1bmN0aW9uKCl7dmFyIGU9bix0PWUubGliLldvcmRBcnJheTtlLmVuYy5CYXNlNjQ9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzLG49ZS5zaWdCeXRlcyxyPXRoaXMuX21hcDtlLmNsYW1wKCksZT1bXTtmb3IodmFyIGk9MDtpPG47aSs9Mylmb3IodmFyIG89KHRbaT4+PjJdPj4+MjQtaSU0KjgmMjU1KTw8MTZ8KHRbaSsxPj4+Ml0+Pj4yNC0oaSsxKSU0KjgmMjU1KTw8OHx0W2krMj4+PjJdPj4+MjQtKGkrMiklNCo4JjI1NSxzPTA7ND5zJiZpKy43NSpzPG47cysrKWUucHVzaChyLmNoYXJBdChvPj4+NiooMy1zKSY2MykpO2lmKHQ9ci5jaGFyQXQoNjQpKWZvcig7ZS5sZW5ndGglNDspZS5wdXNoKHQpO3JldHVybiBlLmpvaW4oXCJcIil9LHBhcnNlOmZ1bmN0aW9uKGUpe3ZhciBuPWUubGVuZ3RoLHI9dGhpcy5fbWFwLGk9ci5jaGFyQXQoNjQpO2kmJi0xIT0oaT1lLmluZGV4T2YoaSkpJiYobj1pKTtmb3IodmFyIGk9W10sbz0wLHM9MDtzPG47cysrKWlmKHMlNCl7dmFyIGE9ci5pbmRleE9mKGUuY2hhckF0KHMtMSkpPDxzJTQqMix1PXIuaW5kZXhPZihlLmNoYXJBdChzKSk+Pj42LXMlNCoyO2lbbz4+PjJdfD0oYXx1KTw8MjQtbyU0KjgsbysrfXJldHVybiB0LmNyZWF0ZShpLG8pfSxfbWFwOlwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIn19KCksZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlLHQsbixyLGksbyxzKXtyZXR1cm4oKGU9ZSsodCZufH50JnIpK2krcyk8PG98ZT4+PjMyLW8pK3R9ZnVuY3Rpb24gcihlLHQsbixyLGksbyxzKXtyZXR1cm4oKGU9ZSsodCZyfG4mfnIpK2krcyk8PG98ZT4+PjMyLW8pK3R9ZnVuY3Rpb24gaShlLHQsbixyLGksbyxzKXtyZXR1cm4oKGU9ZSsodF5uXnIpK2krcyk8PG98ZT4+PjMyLW8pK3R9ZnVuY3Rpb24gbyhlLHQsbixyLGksbyxzKXtyZXR1cm4oKGU9ZSsobl4odHx+cikpK2krcyk8PG98ZT4+PjMyLW8pK3R9Zm9yKHZhciBzPW4sYT1zLmxpYix1PWEuV29yZEFycmF5LGM9YS5IYXNoZXIsYT1zLmFsZ28sbD1bXSxoPTA7NjQ+aDtoKyspbFtoXT00Mjk0OTY3Mjk2KmUuYWJzKGUuc2luKGgrMSkpfDA7YT1hLk1ENT1jLmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9oYXNoPW5ldyB1LmluaXQoWzE3MzI1ODQxOTMsNDAyMzIzMzQxNywyNTYyMzgzMTAyLDI3MTczMzg3OF0pfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSxuKXtmb3IodmFyIHM9MDsxNj5zO3MrKyl7dmFyIGE9bitzLHU9ZVthXTtlW2FdPTE2NzExOTM1Jih1PDw4fHU+Pj4yNCl8NDI3ODI1NTM2MCYodTw8MjR8dT4+PjgpfXZhciBzPXRoaXMuX2hhc2gud29yZHMsYT1lW24rMF0sdT1lW24rMV0sYz1lW24rMl0saD1lW24rM10sZj1lW24rNF0sZD1lW24rNV0scD1lW24rNl0sZz1lW24rN10seT1lW24rOF0sdj1lW24rOV0sYj1lW24rMTBdLF89ZVtuKzExXSxtPWVbbisxMl0saz1lW24rMTNdLFA9ZVtuKzE0XSxTPWVbbisxNV0sdz1zWzBdLE89c1sxXSxUPXNbMl0sQz1zWzNdLHc9dCh3LE8sVCxDLGEsNyxsWzBdKSxDPXQoQyx3LE8sVCx1LDEyLGxbMV0pLFQ9dChULEMsdyxPLGMsMTcsbFsyXSksTz10KE8sVCxDLHcsaCwyMixsWzNdKSx3PXQodyxPLFQsQyxmLDcsbFs0XSksQz10KEMsdyxPLFQsZCwxMixsWzVdKSxUPXQoVCxDLHcsTyxwLDE3LGxbNl0pLE89dChPLFQsQyx3LGcsMjIsbFs3XSksdz10KHcsTyxULEMseSw3LGxbOF0pLEM9dChDLHcsTyxULHYsMTIsbFs5XSksVD10KFQsQyx3LE8sYiwxNyxsWzEwXSksTz10KE8sVCxDLHcsXywyMixsWzExXSksdz10KHcsTyxULEMsbSw3LGxbMTJdKSxDPXQoQyx3LE8sVCxrLDEyLGxbMTNdKSxUPXQoVCxDLHcsTyxQLDE3LGxbMTRdKSxPPXQoTyxULEMsdyxTLDIyLGxbMTVdKSx3PXIodyxPLFQsQyx1LDUsbFsxNl0pLEM9cihDLHcsTyxULHAsOSxsWzE3XSksVD1yKFQsQyx3LE8sXywxNCxsWzE4XSksTz1yKE8sVCxDLHcsYSwyMCxsWzE5XSksdz1yKHcsTyxULEMsZCw1LGxbMjBdKSxDPXIoQyx3LE8sVCxiLDksbFsyMV0pLFQ9cihULEMsdyxPLFMsMTQsbFsyMl0pLE89cihPLFQsQyx3LGYsMjAsbFsyM10pLHc9cih3LE8sVCxDLHYsNSxsWzI0XSksQz1yKEMsdyxPLFQsUCw5LGxbMjVdKSxUPXIoVCxDLHcsTyxoLDE0LGxbMjZdKSxPPXIoTyxULEMsdyx5LDIwLGxbMjddKSx3PXIodyxPLFQsQyxrLDUsbFsyOF0pLEM9cihDLHcsTyxULGMsOSxsWzI5XSksVD1yKFQsQyx3LE8sZywxNCxsWzMwXSksTz1yKE8sVCxDLHcsbSwyMCxsWzMxXSksdz1pKHcsTyxULEMsZCw0LGxbMzJdKSxDPWkoQyx3LE8sVCx5LDExLGxbMzNdKSxUPWkoVCxDLHcsTyxfLDE2LGxbMzRdKSxPPWkoTyxULEMsdyxQLDIzLGxbMzVdKSx3PWkodyxPLFQsQyx1LDQsbFszNl0pLEM9aShDLHcsTyxULGYsMTEsbFszN10pLFQ9aShULEMsdyxPLGcsMTYsbFszOF0pLE89aShPLFQsQyx3LGIsMjMsbFszOV0pLHc9aSh3LE8sVCxDLGssNCxsWzQwXSksQz1pKEMsdyxPLFQsYSwxMSxsWzQxXSksVD1pKFQsQyx3LE8saCwxNixsWzQyXSksTz1pKE8sVCxDLHcscCwyMyxsWzQzXSksdz1pKHcsTyxULEMsdiw0LGxbNDRdKSxDPWkoQyx3LE8sVCxtLDExLGxbNDVdKSxUPWkoVCxDLHcsTyxTLDE2LGxbNDZdKSxPPWkoTyxULEMsdyxjLDIzLGxbNDddKSx3PW8odyxPLFQsQyxhLDYsbFs0OF0pLEM9byhDLHcsTyxULGcsMTAsbFs0OV0pLFQ9byhULEMsdyxPLFAsMTUsbFs1MF0pLE89byhPLFQsQyx3LGQsMjEsbFs1MV0pLHc9byh3LE8sVCxDLG0sNixsWzUyXSksQz1vKEMsdyxPLFQsaCwxMCxsWzUzXSksVD1vKFQsQyx3LE8sYiwxNSxsWzU0XSksTz1vKE8sVCxDLHcsdSwyMSxsWzU1XSksdz1vKHcsTyxULEMseSw2LGxbNTZdKSxDPW8oQyx3LE8sVCxTLDEwLGxbNTddKSxUPW8oVCxDLHcsTyxwLDE1LGxbNThdKSxPPW8oTyxULEMsdyxrLDIxLGxbNTldKSx3PW8odyxPLFQsQyxmLDYsbFs2MF0pLEM9byhDLHcsTyxULF8sMTAsbFs2MV0pLFQ9byhULEMsdyxPLGMsMTUsbFs2Ml0pLE89byhPLFQsQyx3LHYsMjEsbFs2M10pO3NbMF09c1swXSt3fDAsc1sxXT1zWzFdK098MCxzWzJdPXNbMl0rVHwwLHNbM109c1szXStDfDB9LF9kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fZGF0YSxuPXQud29yZHMscj04KnRoaXMuX25EYXRhQnl0ZXMsaT04KnQuc2lnQnl0ZXM7bltpPj4+NV18PTEyODw8MjQtaSUzMjt2YXIgbz1lLmZsb29yKHIvNDI5NDk2NzI5Nik7Zm9yKG5bMTUrKGkrNjQ+Pj45PDw0KV09MTY3MTE5MzUmKG88PDh8bz4+PjI0KXw0Mjc4MjU1MzYwJihvPDwyNHxvPj4+OCksblsxNCsoaSs2ND4+Pjk8PDQpXT0xNjcxMTkzNSYocjw8OHxyPj4+MjQpfDQyNzgyNTUzNjAmKHI8PDI0fHI+Pj44KSx0LnNpZ0J5dGVzPTQqKG4ubGVuZ3RoKzEpLHRoaXMuX3Byb2Nlc3MoKSx0PXRoaXMuX2hhc2gsbj10LndvcmRzLHI9MDs0PnI7cisrKWk9bltyXSxuW3JdPTE2NzExOTM1JihpPDw4fGk+Pj4yNCl8NDI3ODI1NTM2MCYoaTw8MjR8aT4+PjgpO3JldHVybiB0fSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPWMuY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS5faGFzaD10aGlzLl9oYXNoLmNsb25lKCksZX19KSxzLk1ENT1jLl9jcmVhdGVIZWxwZXIoYSkscy5IbWFjTUQ1PWMuX2NyZWF0ZUhtYWNIZWxwZXIoYSl9KE1hdGgpLGZ1bmN0aW9uKCl7dmFyIGU9bix0PWUubGliLHI9dC5CYXNlLGk9dC5Xb3JkQXJyYXksdD1lLmFsZ28sbz10LkV2cEtERj1yLmV4dGVuZCh7Y2ZnOnIuZXh0ZW5kKHtrZXlTaXplOjQsaGFzaGVyOnQuTUQ1LGl0ZXJhdGlvbnM6MX0pLGluaXQ6ZnVuY3Rpb24oZSl7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKGUpfSxjb21wdXRlOmZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPXRoaXMuY2ZnLHI9bi5oYXNoZXIuY3JlYXRlKCksbz1pLmNyZWF0ZSgpLHM9by53b3JkcyxhPW4ua2V5U2l6ZSxuPW4uaXRlcmF0aW9ucztzLmxlbmd0aDxhOyl7dSYmci51cGRhdGUodSk7dmFyIHU9ci51cGRhdGUoZSkuZmluYWxpemUodCk7ci5yZXNldCgpO2Zvcih2YXIgYz0xO2M8bjtjKyspdT1yLmZpbmFsaXplKHUpLHIucmVzZXQoKTtvLmNvbmNhdCh1KX1yZXR1cm4gby5zaWdCeXRlcz00KmEsb319KTtlLkV2cEtERj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIG8uY3JlYXRlKG4pLmNvbXB1dGUoZSx0KX19KCksbi5saWIuQ2lwaGVyfHxmdW5jdGlvbihlKXt2YXIgdD1uLHI9dC5saWIsaT1yLkJhc2Usbz1yLldvcmRBcnJheSxzPXIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobSxhPXQuZW5jLkJhc2U2NCx1PXQuYWxnby5FdnBLREYsYz1yLkNpcGhlcj1zLmV4dGVuZCh7Y2ZnOmkuZXh0ZW5kKCksY3JlYXRlRW5jcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuY3JlYXRlKHRoaXMuX0VOQ19YRk9STV9NT0RFLGUsdCl9LGNyZWF0ZURlY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLmNyZWF0ZSh0aGlzLl9ERUNfWEZPUk1fTU9ERSxlLHQpfSxpbml0OmZ1bmN0aW9uKGUsdCxuKXt0aGlzLmNmZz10aGlzLmNmZy5leHRlbmQobiksdGhpcy5feGZvcm1Nb2RlPWUsdGhpcy5fa2V5PXQsdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe3MucmVzZXQuY2FsbCh0aGlzKSx0aGlzLl9kb1Jlc2V0KCl9LHByb2Nlc3M6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2FwcGVuZChlKSx0aGlzLl9wcm9jZXNzKCl9LGZpbmFsaXplOmZ1bmN0aW9uKGUpe3JldHVybiBlJiZ0aGlzLl9hcHBlbmQoZSksdGhpcy5fZG9GaW5hbGl6ZSgpfSxrZXlTaXplOjQsaXZTaXplOjQsX0VOQ19YRk9STV9NT0RFOjEsX0RFQ19YRk9STV9NT0RFOjIsX2NyZWF0ZUhlbHBlcjpmdW5jdGlvbihlKXtyZXR1cm57ZW5jcnlwdDpmdW5jdGlvbih0LG4scil7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiBuP2c6cCkuZW5jcnlwdChlLHQsbixyKX0sZGVjcnlwdDpmdW5jdGlvbih0LG4scil7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiBuP2c6cCkuZGVjcnlwdChlLHQsbixyKX19fX0pO3IuU3RyZWFtQ2lwaGVyPWMuZXh0ZW5kKHtfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wcm9jZXNzKCEwKX0sYmxvY2tTaXplOjF9KTt2YXIgbD10Lm1vZGU9e30saD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dGhpcy5faXY7cj90aGlzLl9pdj12b2lkIDA6cj10aGlzLl9wcmV2QmxvY2s7Zm9yKHZhciBpPTA7aTxuO2krKyllW3QraV1ePXJbaV19LGY9KHIuQmxvY2tDaXBoZXJNb2RlPWkuZXh0ZW5kKHtjcmVhdGVFbmNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5FbmNyeXB0b3IuY3JlYXRlKGUsdCl9LGNyZWF0ZURlY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLkRlY3J5cHRvci5jcmVhdGUoZSx0KX0saW5pdDpmdW5jdGlvbihlLHQpe3RoaXMuX2NpcGhlcj1lLHRoaXMuX2l2PXR9fSkpLmV4dGVuZCgpO2YuRW5jcnlwdG9yPWYuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jaXBoZXIscj1uLmJsb2NrU2l6ZTtoLmNhbGwodGhpcyxlLHQsciksbi5lbmNyeXB0QmxvY2soZSx0KSx0aGlzLl9wcmV2QmxvY2s9ZS5zbGljZSh0LHQrcil9fSksZi5EZWNyeXB0b3I9Zi5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMuX2NpcGhlcixyPW4uYmxvY2tTaXplLGk9ZS5zbGljZSh0LHQrcik7bi5kZWNyeXB0QmxvY2soZSx0KSxoLmNhbGwodGhpcyxlLHQsciksdGhpcy5fcHJldkJsb2NrPWl9fSksbD1sLkNCQz1mLGY9KHQucGFkPXt9KS5Qa2NzNz17cGFkOmZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPTQqdCxuPW4tZS5zaWdCeXRlcyVuLHI9bjw8MjR8bjw8MTZ8bjw8OHxuLGk9W10scz0wO3M8bjtzKz00KWkucHVzaChyKTtuPW8uY3JlYXRlKGksbiksZS5jb25jYXQobil9LHVucGFkOmZ1bmN0aW9uKGUpe2Uuc2lnQnl0ZXMtPTI1NSZlLndvcmRzW2Uuc2lnQnl0ZXMtMT4+PjJdfX0sci5CbG9ja0NpcGhlcj1jLmV4dGVuZCh7Y2ZnOmMuY2ZnLmV4dGVuZCh7bW9kZTpsLHBhZGRpbmc6Zn0pLHJlc2V0OmZ1bmN0aW9uKCl7Yy5yZXNldC5jYWxsKHRoaXMpO3ZhciBlPXRoaXMuY2ZnLHQ9ZS5pdixlPWUubW9kZTtpZih0aGlzLl94Zm9ybU1vZGU9PXRoaXMuX0VOQ19YRk9STV9NT0RFKXZhciBuPWUuY3JlYXRlRW5jcnlwdG9yO2Vsc2Ugbj1lLmNyZWF0ZURlY3J5cHRvcix0aGlzLl9taW5CdWZmZXJTaXplPTE7dGhpcy5fbW9kZT1uLmNhbGwoZSx0aGlzLHQmJnQud29yZHMpfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9tb2RlLnByb2Nlc3NCbG9jayhlLHQpfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuY2ZnLnBhZGRpbmc7aWYodGhpcy5feGZvcm1Nb2RlPT10aGlzLl9FTkNfWEZPUk1fTU9ERSl7ZS5wYWQodGhpcy5fZGF0YSx0aGlzLmJsb2NrU2l6ZSk7dmFyIHQ9dGhpcy5fcHJvY2VzcyghMCl9ZWxzZSB0PXRoaXMuX3Byb2Nlc3MoITApLGUudW5wYWQodCk7cmV0dXJuIHR9LGJsb2NrU2l6ZTo0fSk7dmFyIGQ9ci5DaXBoZXJQYXJhbXM9aS5leHRlbmQoe2luaXQ6ZnVuY3Rpb24oZSl7dGhpcy5taXhJbihlKX0sdG9TdHJpbmc6ZnVuY3Rpb24oZSl7cmV0dXJuKGV8fHRoaXMuZm9ybWF0dGVyKS5zdHJpbmdpZnkodGhpcyl9fSksbD0odC5mb3JtYXQ9e30pLk9wZW5TU0w9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLmNpcGhlcnRleHQ7cmV0dXJuIGU9ZS5zYWx0LChlP28uY3JlYXRlKFsxMzk4ODkzNjg0LDE3MDEwNzY4MzFdKS5jb25jYXQoZSkuY29uY2F0KHQpOnQpLnRvU3RyaW5nKGEpfSxwYXJzZTpmdW5jdGlvbihlKXtlPWEucGFyc2UoZSk7dmFyIHQ9ZS53b3JkcztpZigxMzk4ODkzNjg0PT10WzBdJiYxNzAxMDc2ODMxPT10WzFdKXt2YXIgbj1vLmNyZWF0ZSh0LnNsaWNlKDIsNCkpO3Quc3BsaWNlKDAsNCksZS5zaWdCeXRlcy09MTZ9cmV0dXJuIGQuY3JlYXRlKHtjaXBoZXJ0ZXh0OmUsc2FsdDpufSl9fSxwPXIuU2VyaWFsaXphYmxlQ2lwaGVyPWkuZXh0ZW5kKHtjZmc6aS5leHRlbmQoe2Zvcm1hdDpsfSksZW5jcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyPXRoaXMuY2ZnLmV4dGVuZChyKTt2YXIgaT1lLmNyZWF0ZUVuY3J5cHRvcihuLHIpO3JldHVybiB0PWkuZmluYWxpemUodCksaT1pLmNmZyxkLmNyZWF0ZSh7Y2lwaGVydGV4dDp0LGtleTpuLGl2OmkuaXYsYWxnb3JpdGhtOmUsbW9kZTppLm1vZGUscGFkZGluZzppLnBhZGRpbmcsYmxvY2tTaXplOmUuYmxvY2tTaXplLGZvcm1hdHRlcjpyLmZvcm1hdH0pfSxkZWNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSx0PXRoaXMuX3BhcnNlKHQsci5mb3JtYXQpLGUuY3JlYXRlRGVjcnlwdG9yKG4scikuZmluYWxpemUodC5jaXBoZXJ0ZXh0KX0sX3BhcnNlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/dC5wYXJzZShlLHRoaXMpOmV9fSksdD0odC5rZGY9e30pLk9wZW5TU0w9e2V4ZWN1dGU6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHJ8fChyPW8ucmFuZG9tKDgpKSxlPXUuY3JlYXRlKHtrZXlTaXplOnQrbn0pLmNvbXB1dGUoZSxyKSxuPW8uY3JlYXRlKGUud29yZHMuc2xpY2UodCksNCpuKSxlLnNpZ0J5dGVzPTQqdCxkLmNyZWF0ZSh7a2V5OmUsaXY6bixzYWx0OnJ9KX19LGc9ci5QYXNzd29yZEJhc2VkQ2lwaGVyPXAuZXh0ZW5kKHtjZmc6cC5jZmcuZXh0ZW5kKHtrZGY6dH0pLGVuY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHI9dGhpcy5jZmcuZXh0ZW5kKHIpLG49ci5rZGYuZXhlY3V0ZShuLGUua2V5U2l6ZSxlLml2U2l6ZSksci5pdj1uLml2LGU9cC5lbmNyeXB0LmNhbGwodGhpcyxlLHQsbi5rZXksciksZS5taXhJbihuKSxlfSxkZWNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSx0PXRoaXMuX3BhcnNlKHQsci5mb3JtYXQpLG49ci5rZGYuZXhlY3V0ZShuLGUua2V5U2l6ZSxlLml2U2l6ZSx0LnNhbHQpLHIuaXY9bi5pdixwLmRlY3J5cHQuY2FsbCh0aGlzLGUsdCxuLmtleSxyKX19KX0oKSxmdW5jdGlvbigpe2Zvcih2YXIgZT1uLHQ9ZS5saWIuQmxvY2tDaXBoZXIscj1lLmFsZ28saT1bXSxvPVtdLHM9W10sYT1bXSx1PVtdLGM9W10sbD1bXSxoPVtdLGY9W10sZD1bXSxwPVtdLGc9MDsyNTY+ZztnKyspcFtnXT0xMjg+Zz9nPDwxOmc8PDFeMjgzO2Zvcih2YXIgeT0wLHY9MCxnPTA7MjU2Pmc7ZysrKXt2YXIgYj12XnY8PDFedjw8Ml52PDwzXnY8PDQsYj1iPj4+OF4yNTUmYl45OTtpW3ldPWIsb1tiXT15O3ZhciBfPXBbeV0sbT1wW19dLGs9cFttXSxQPTI1NypwW2JdXjE2ODQzMDA4KmI7c1t5XT1QPDwyNHxQPj4+OCxhW3ldPVA8PDE2fFA+Pj4xNix1W3ldPVA8PDh8UD4+PjI0LGNbeV09UCxQPTE2ODQzMDA5KmteNjU1MzcqbV4yNTcqX14xNjg0MzAwOCp5LGxbYl09UDw8MjR8UD4+PjgsaFtiXT1QPDwxNnxQPj4+MTYsZltiXT1QPDw4fFA+Pj4yNCxkW2JdPVAseT8oeT1fXnBbcFtwW2teX11dXSx2Xj1wW3Bbdl1dKTp5PXY9MX12YXIgUz1bMCwxLDIsNCw4LDE2LDMyLDY0LDEyOCwyNyw1NF0scj1yLkFFUz10LmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXtmb3IodmFyIGU9dGhpcy5fa2V5LHQ9ZS53b3JkcyxuPWUuc2lnQnl0ZXMvNCxlPTQqKCh0aGlzLl9uUm91bmRzPW4rNikrMSkscj10aGlzLl9rZXlTY2hlZHVsZT1bXSxvPTA7bzxlO28rKylpZihvPG4pcltvXT10W29dO2Vsc2V7dmFyIHM9cltvLTFdO28lbj82PG4mJjQ9PW8lbiYmKHM9aVtzPj4+MjRdPDwyNHxpW3M+Pj4xNiYyNTVdPDwxNnxpW3M+Pj44JjI1NV08PDh8aVsyNTUmc10pOihzPXM8PDh8cz4+PjI0LHM9aVtzPj4+MjRdPDwyNHxpW3M+Pj4xNiYyNTVdPDwxNnxpW3M+Pj44JjI1NV08PDh8aVsyNTUmc10sc149U1tvL258MF08PDI0KSxyW29dPXJbby1uXV5zfWZvcih0PXRoaXMuX2ludktleVNjaGVkdWxlPVtdLG49MDtuPGU7bisrKW89ZS1uLHM9biU0P3Jbb106cltvLTRdLHRbbl09ND5ufHw0Pj1vP3M6bFtpW3M+Pj4yNF1dXmhbaVtzPj4+MTYmMjU1XV1eZltpW3M+Pj44JjI1NV1dXmRbaVsyNTUmc11dfSxlbmNyeXB0QmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9kb0NyeXB0QmxvY2soZSx0LHRoaXMuX2tleVNjaGVkdWxlLHMsYSx1LGMsaSl9LGRlY3J5cHRCbG9jazpmdW5jdGlvbihlLHQpe3ZhciBuPWVbdCsxXTtlW3QrMV09ZVt0KzNdLGVbdCszXT1uLHRoaXMuX2RvQ3J5cHRCbG9jayhlLHQsdGhpcy5faW52S2V5U2NoZWR1bGUsbCxoLGYsZCxvKSxuPWVbdCsxXSxlW3QrMV09ZVt0KzNdLGVbdCszXT1ufSxfZG9DcnlwdEJsb2NrOmZ1bmN0aW9uKGUsdCxuLHIsaSxvLHMsYSl7Zm9yKHZhciB1PXRoaXMuX25Sb3VuZHMsYz1lW3RdXm5bMF0sbD1lW3QrMV1eblsxXSxoPWVbdCsyXV5uWzJdLGY9ZVt0KzNdXm5bM10sZD00LHA9MTtwPHU7cCsrKXZhciBnPXJbYz4+PjI0XV5pW2w+Pj4xNiYyNTVdXm9baD4+PjgmMjU1XV5zWzI1NSZmXV5uW2QrK10seT1yW2w+Pj4yNF1eaVtoPj4+MTYmMjU1XV5vW2Y+Pj44JjI1NV1ec1syNTUmY11ebltkKytdLHY9cltoPj4+MjRdXmlbZj4+PjE2JjI1NV1eb1tjPj4+OCYyNTVdXnNbMjU1JmxdXm5bZCsrXSxmPXJbZj4+PjI0XV5pW2M+Pj4xNiYyNTVdXm9bbD4+PjgmMjU1XV5zWzI1NSZoXV5uW2QrK10sYz1nLGw9eSxoPXY7Zz0oYVtjPj4+MjRdPDwyNHxhW2w+Pj4xNiYyNTVdPDwxNnxhW2g+Pj44JjI1NV08PDh8YVsyNTUmZl0pXm5bZCsrXSx5PShhW2w+Pj4yNF08PDI0fGFbaD4+PjE2JjI1NV08PDE2fGFbZj4+PjgmMjU1XTw8OHxhWzI1NSZjXSlebltkKytdLHY9KGFbaD4+PjI0XTw8MjR8YVtmPj4+MTYmMjU1XTw8MTZ8YVtjPj4+OCYyNTVdPDw4fGFbMjU1JmxdKV5uW2QrK10sZj0oYVtmPj4+MjRdPDwyNHxhW2M+Pj4xNiYyNTVdPDwxNnxhW2w+Pj44JjI1NV08PDh8YVsyNTUmaF0pXm5bZCsrXSxlW3RdPWcsZVt0KzFdPXksZVt0KzJdPXYsZVt0KzNdPWZ9LGtleVNpemU6OH0pO2UuQUVTPXQuX2NyZWF0ZUhlbHBlcihyKX0oKSxuLm1vZGUuRUNCPWZ1bmN0aW9uKCl7dmFyIGU9bi5saWIuQmxvY2tDaXBoZXJNb2RlLmV4dGVuZCgpO3JldHVybiBlLkVuY3J5cHRvcj1lLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fY2lwaGVyLmVuY3J5cHRCbG9jayhlLHQpfX0pLGUuRGVjcnlwdG9yPWUuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9jaXBoZXIuZGVjcnlwdEJsb2NrKGUsdCl9fSksZX0oKSxlLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCkscz1uKDkpLGE9KHIocyksbig3KSksdT0ocihhKSxuKDEyKSksYz0ocih1KSxuKDE0KSksbD1yKGMpLGg9bigxNyksZj1yKGgpLGQ9KG4oOCksbigxMykpLHA9cihkKSxnPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LnN1YnNjcmliZUVuZHBvaW50LHI9dC5sZWF2ZUVuZHBvaW50LG89dC5oZWFydGJlYXRFbmRwb2ludCxzPXQuc2V0U3RhdGVFbmRwb2ludCxhPXQudGltZUVuZHBvaW50LHU9dC5jb25maWcsYz10LmNyeXB0byxoPXQubGlzdGVuZXJNYW5hZ2VyO2kodGhpcyxlKSx0aGlzLl9saXN0ZW5lck1hbmFnZXI9aCx0aGlzLl9jb25maWc9dSx0aGlzLl9sZWF2ZUVuZHBvaW50PXIsdGhpcy5faGVhcnRiZWF0RW5kcG9pbnQ9byx0aGlzLl9zZXRTdGF0ZUVuZHBvaW50PXMsdGhpcy5fc3Vic2NyaWJlRW5kcG9pbnQ9bix0aGlzLl9jcnlwdG89Yyx0aGlzLl9jaGFubmVscz17fSx0aGlzLl9wcmVzZW5jZUNoYW5uZWxzPXt9LHRoaXMuX2NoYW5uZWxHcm91cHM9e30sdGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzPXt9LHRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9jdXJyZW50VGltZXRva2VuPTAsdGhpcy5fbGFzdFRpbWV0b2tlbj0wLHRoaXMuX3N0b3JlZFRpbWV0b2tlbj1udWxsLHRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMSx0aGlzLl9pc09ubGluZT0hMCx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyPW5ldyBsLmRlZmF1bHQoe3RpbWVFbmRwb2ludDphfSl9cmV0dXJuIG8oZSxbe2tleTpcImFkYXB0U3RhdGVDaGFuZ2VcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMscj1lLnN0YXRlLGk9ZS5jaGFubmVscyxvPXZvaWQgMD09PWk/W106aSxzPWUuY2hhbm5lbEdyb3VwcyxhPXZvaWQgMD09PXM/W106cztyZXR1cm4gby5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UgaW4gbi5fY2hhbm5lbHMmJihuLl9jaGFubmVsc1tlXS5zdGF0ZT1yKX0pLGEuZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxHcm91cHMmJihuLl9jaGFubmVsR3JvdXBzW2VdLnN0YXRlPXIpfSksdGhpcy5fc2V0U3RhdGVFbmRwb2ludCh7c3RhdGU6cixjaGFubmVsczpvLGNoYW5uZWxHcm91cHM6YX0sdCl9fSx7a2V5OlwiYWRhcHRTdWJzY3JpYmVDaGFuZ2VcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLG49ZS50aW1ldG9rZW4scj1lLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89ZS5jaGFubmVsR3JvdXBzLHM9dm9pZCAwPT09bz9bXTpvLGE9ZS53aXRoUHJlc2VuY2UsdT12b2lkIDAhPT1hJiZhO2lmKCF0aGlzLl9jb25maWcuc3Vic2NyaWJlS2V5fHxcIlwiPT09dGhpcy5fY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm4gdm9pZChjb25zb2xlJiZjb25zb2xlLmxvZyYmY29uc29sZS5sb2coXCJzdWJzY3JpYmUga2V5IG1pc3Npbmc7IGFib3J0aW5nIHN1YnNjcmliZVwiKSk7biYmKHRoaXMuX2xhc3RUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPW4pLFwiMFwiIT09dGhpcy5fY3VycmVudFRpbWV0b2tlbiYmKHRoaXMuX3N0b3JlZFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49MCksaS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuX2NoYW5uZWxzW2VdPXtzdGF0ZTp7fX0sdSYmKHQuX3ByZXNlbmNlQ2hhbm5lbHNbZV09e30pLHQuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucy5wdXNoKGUpfSkscy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuX2NoYW5uZWxHcm91cHNbZV09e3N0YXRlOnt9fSx1JiYodC5fcHJlc2VuY2VDaGFubmVsR3JvdXBzW2VdPXt9KSx0Ll9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucy5wdXNoKGUpfSksdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSExLHRoaXMucmVjb25uZWN0KCl9fSx7a2V5OlwiYWRhcHRVbnN1YnNjcmliZUNoYW5nZVwiLFxudmFsdWU6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLHI9ZS5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPWUuY2hhbm5lbEdyb3VwcyxzPXZvaWQgMD09PW8/W106bztpLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVscyYmZGVsZXRlIG4uX2NoYW5uZWxzW2VdLGUgaW4gbi5fcHJlc2VuY2VDaGFubmVscyYmZGVsZXRlIG4uX3ByZXNlbmNlQ2hhbm5lbHNbZV19KSxzLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVsR3JvdXBzJiZkZWxldGUgbi5fY2hhbm5lbEdyb3Vwc1tlXSxlIGluIG4uX3ByZXNlbmNlQ2hhbm5lbEdyb3VwcyYmZGVsZXRlIG4uX2NoYW5uZWxHcm91cHNbZV19KSwhMSE9PXRoaXMuX2NvbmZpZy5zdXBwcmVzc0xlYXZlRXZlbnRzfHx0fHx0aGlzLl9sZWF2ZUVuZHBvaW50KHtjaGFubmVsczppLGNoYW5uZWxHcm91cHM6c30sZnVuY3Rpb24oZSl7ZS5hZmZlY3RlZENoYW5uZWxzPWksZS5hZmZlY3RlZENoYW5uZWxHcm91cHM9cyxlLmN1cnJlbnRUaW1ldG9rZW49bi5fY3VycmVudFRpbWV0b2tlbixlLmxhc3RUaW1ldG9rZW49bi5fbGFzdFRpbWV0b2tlbixuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSl9KSwwPT09T2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbEdyb3VwcykubGVuZ3RoJiYodGhpcy5fbGFzdFRpbWV0b2tlbj0wLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49MCx0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCx0aGlzLl9yZWdpb249bnVsbCx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLnN0b3BQb2xsaW5nKCkpLHRoaXMucmVjb25uZWN0KCl9fSx7a2V5OlwidW5zdWJzY3JpYmVBbGxcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLmFkYXB0VW5zdWJzY3JpYmVDaGFuZ2Uoe2NoYW5uZWxzOnRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxzKCksY2hhbm5lbEdyb3Vwczp0aGlzLmdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzKCl9LGUpfX0se2tleTpcImdldFN1YnNjcmliZWRDaGFubmVsc1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKX19LHtrZXk6XCJnZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwc1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpfX0se2tleTpcInJlY29ubmVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCksdGhpcy5fcmVnaXN0ZXJIZWFydGJlYXRUaW1lcigpfX0se2tleTpcImRpc2Nvbm5lY3RcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BTdWJzY3JpYmVMb29wKCksdGhpcy5fc3RvcEhlYXJ0YmVhdFRpbWVyKCksdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdG9wUG9sbGluZygpfX0se2tleTpcIl9yZWdpc3RlckhlYXJ0YmVhdFRpbWVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9wZXJmb3JtSGVhcnRiZWF0TG9vcCgpLHRoaXMuX2hlYXJ0YmVhdFRpbWVyPXNldEludGVydmFsKHRoaXMuX3BlcmZvcm1IZWFydGJlYXRMb29wLmJpbmQodGhpcyksMWUzKnRoaXMuX2NvbmZpZy5nZXRIZWFydGJlYXRJbnRlcnZhbCgpKX19LHtrZXk6XCJfc3RvcEhlYXJ0YmVhdFRpbWVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9oZWFydGJlYXRUaW1lciYmKGNsZWFySW50ZXJ2YWwodGhpcy5faGVhcnRiZWF0VGltZXIpLHRoaXMuX2hlYXJ0YmVhdFRpbWVyPW51bGwpfX0se2tleTpcIl9wZXJmb3JtSGVhcnRiZWF0TG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcyx0PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKSxuPU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLHI9e307aWYoMCE9PXQubGVuZ3RofHwwIT09bi5sZW5ndGgpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgbj1lLl9jaGFubmVsc1t0XS5zdGF0ZTtPYmplY3Qua2V5cyhuKS5sZW5ndGgmJihyW3RdPW4pfSksbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBuPWUuX2NoYW5uZWxHcm91cHNbdF0uc3RhdGU7T2JqZWN0LmtleXMobikubGVuZ3RoJiYoclt0XT1uKX0pO3ZhciBpPWZ1bmN0aW9uKHQpe3QuZXJyb3ImJmUuX2NvbmZpZy5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KSx0LmVycm9yJiZlLl9jb25maWcuYXV0b05ldHdvcmtEZXRlY3Rpb24mJmUuX2lzT25saW5lJiYoZS5faXNPbmxpbmU9ITEsZS5kaXNjb25uZWN0KCksZS5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTmV0d29ya0Rvd24oKSxlLnJlY29ubmVjdCgpKSwhdC5lcnJvciYmZS5fY29uZmlnLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KX07dGhpcy5faGVhcnRiZWF0RW5kcG9pbnQoe2NoYW5uZWxzOnQsY2hhbm5lbEdyb3VwczpuLHN0YXRlOnJ9LGkuYmluZCh0aGlzKSl9fX0se2tleTpcIl9zdGFydFN1YnNjcmliZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BTdWJzY3JpYmVMb29wKCk7dmFyIGU9W10sdD1bXTtpZihPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQrXCItcG5wcmVzXCIpfSksT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3VwcykuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZStcIi1wbnByZXNcIil9KSwwIT09ZS5sZW5ndGh8fDAhPT10Lmxlbmd0aCl7dmFyIG49e2NoYW5uZWxzOmUsY2hhbm5lbEdyb3Vwczp0LHRpbWV0b2tlbjp0aGlzLl9jdXJyZW50VGltZXRva2VuLGZpbHRlckV4cHJlc3Npb246dGhpcy5fY29uZmlnLmZpbHRlckV4cHJlc3Npb24scmVnaW9uOnRoaXMuX3JlZ2lvbn07dGhpcy5fc3Vic2NyaWJlQ2FsbD10aGlzLl9zdWJzY3JpYmVFbmRwb2ludChuLHRoaXMuX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZS5iaW5kKHRoaXMpKX19fSx7a2V5OlwiX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcztpZihlLmVycm9yKXJldHVybiB2b2lkKGUuY2F0ZWdvcnk9PT1wLmRlZmF1bHQuUE5UaW1lb3V0Q2F0ZWdvcnk/dGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCk6ZS5jYXRlZ29yeT09PXAuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeT8odGhpcy5kaXNjb25uZWN0KCksZS5lcnJvciYmdGhpcy5fY29uZmlnLmF1dG9OZXR3b3JrRGV0ZWN0aW9uJiZ0aGlzLl9pc09ubGluZSYmKHRoaXMuX2lzT25saW5lPSExLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtEb3duKCkpLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIub25SZWNvbm5lY3Rpb24oZnVuY3Rpb24oKXtuLl9jb25maWcuYXV0b05ldHdvcmtEZXRlY3Rpb24mJiFuLl9pc09ubGluZSYmKG4uX2lzT25saW5lPSEwLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtVcCgpKSxuLnJlY29ubmVjdCgpLG4uX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMDt2YXIgdD17Y2F0ZWdvcnk6cC5kZWZhdWx0LlBOUmVjb25uZWN0ZWRDYXRlZ29yeSxvcGVyYXRpb246ZS5vcGVyYXRpb24sbGFzdFRpbWV0b2tlbjpuLl9sYXN0VGltZXRva2VuLGN1cnJlbnRUaW1ldG9rZW46bi5fY3VycmVudFRpbWV0b2tlbn07bi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHQpfSksdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdGFydFBvbGxpbmcoKSx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSkpOmUuY2F0ZWdvcnk9PT1wLmRlZmF1bHQuUE5CYWRSZXF1ZXN0Q2F0ZWdvcnk/KHRoaXMuX3N0b3BIZWFydGJlYXRUaW1lcigpLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKSk6dGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpKTtpZih0aGlzLl9zdG9yZWRUaW1ldG9rZW4/KHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49dGhpcy5fc3RvcmVkVGltZXRva2VuLHRoaXMuX3N0b3JlZFRpbWV0b2tlbj1udWxsKToodGhpcy5fbGFzdFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49dC5tZXRhZGF0YS50aW1ldG9rZW4pLCF0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQpe3ZhciByPXt9O3IuY2F0ZWdvcnk9cC5kZWZhdWx0LlBOQ29ubmVjdGVkQ2F0ZWdvcnksci5vcGVyYXRpb249ZS5vcGVyYXRpb24sci5hZmZlY3RlZENoYW5uZWxzPXRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucyxyLnN1YnNjcmliZWRDaGFubmVscz10aGlzLmdldFN1YnNjcmliZWRDaGFubmVscygpLHIuYWZmZWN0ZWRDaGFubmVsR3JvdXBzPXRoaXMuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zLHIubGFzdFRpbWV0b2tlbj10aGlzLl9sYXN0VGltZXRva2VuLHIuY3VycmVudFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMCx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMociksdGhpcy5fcGVuZGluZ0NoYW5uZWxTdWJzY3JpcHRpb25zPVtdLHRoaXMuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zPVtdfXZhciBpPXQubWVzc2FnZXN8fFtdLG89dGhpcy5fY29uZmlnLnJlcXVlc3RNZXNzYWdlQ291bnRUaHJlc2hvbGQ7aWYobyYmaS5sZW5ndGg+PW8pe3ZhciBzPXt9O3MuY2F0ZWdvcnk9cC5kZWZhdWx0LlBOUmVxdWVzdE1lc3NhZ2VDb3VudEV4Y2VlZGVkQ2F0ZWdvcnkscy5vcGVyYXRpb249ZS5vcGVyYXRpb24sdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHMpfWkuZm9yRWFjaChmdW5jdGlvbihlKXt2YXIgdD1lLmNoYW5uZWwscj1lLnN1YnNjcmlwdGlvbk1hdGNoLGk9ZS5wdWJsaXNoTWV0YURhdGE7aWYodD09PXImJihyPW51bGwpLGYuZGVmYXVsdC5lbmRzV2l0aChlLmNoYW5uZWwsXCItcG5wcmVzXCIpKXt2YXIgbz17fTtvLmNoYW5uZWw9bnVsbCxvLnN1YnNjcmlwdGlvbj1udWxsLG8uYWN0dWFsQ2hhbm5lbD1udWxsIT1yP3Q6bnVsbCxvLnN1YnNjcmliZWRDaGFubmVsPW51bGwhPXI/cjp0LHQmJihvLmNoYW5uZWw9dC5zdWJzdHJpbmcoMCx0Lmxhc3RJbmRleE9mKFwiLXBucHJlc1wiKSkpLHImJihvLnN1YnNjcmlwdGlvbj1yLnN1YnN0cmluZygwLHIubGFzdEluZGV4T2YoXCItcG5wcmVzXCIpKSksby5hY3Rpb249ZS5wYXlsb2FkLmFjdGlvbixvLnN0YXRlPWUucGF5bG9hZC5kYXRhLG8udGltZXRva2VuPWkucHVibGlzaFRpbWV0b2tlbixvLm9jY3VwYW5jeT1lLnBheWxvYWQub2NjdXBhbmN5LG8udXVpZD1lLnBheWxvYWQudXVpZCxvLnRpbWVzdGFtcD1lLnBheWxvYWQudGltZXN0YW1wLGUucGF5bG9hZC5qb2luJiYoby5qb2luPWUucGF5bG9hZC5qb2luKSxlLnBheWxvYWQubGVhdmUmJihvLmxlYXZlPWUucGF5bG9hZC5sZWF2ZSksZS5wYXlsb2FkLnRpbWVvdXQmJihvLnRpbWVvdXQ9ZS5wYXlsb2FkLnRpbWVvdXQpLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVByZXNlbmNlKG8pfWVsc2V7dmFyIHM9e307cy5jaGFubmVsPW51bGwscy5zdWJzY3JpcHRpb249bnVsbCxzLmFjdHVhbENoYW5uZWw9bnVsbCE9cj90Om51bGwscy5zdWJzY3JpYmVkQ2hhbm5lbD1udWxsIT1yP3I6dCxzLmNoYW5uZWw9dCxzLnN1YnNjcmlwdGlvbj1yLHMudGltZXRva2VuPWkucHVibGlzaFRpbWV0b2tlbixzLnB1Ymxpc2hlcj1lLmlzc3VpbmdDbGllbnRJZCxlLnVzZXJNZXRhZGF0YSYmKHMudXNlck1ldGFkYXRhPWUudXNlck1ldGFkYXRhKSxuLl9jb25maWcuY2lwaGVyS2V5P3MubWVzc2FnZT1uLl9jcnlwdG8uZGVjcnlwdChlLnBheWxvYWQpOnMubWVzc2FnZT1lLnBheWxvYWQsbi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTWVzc2FnZShzKX19KSx0aGlzLl9yZWdpb249dC5tZXRhZGF0YS5yZWdpb24sdGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCl9fSx7a2V5OlwiX3N0b3BTdWJzY3JpYmVMb29wXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdWJzY3JpYmVDYWxsJiYodGhpcy5fc3Vic2NyaWJlQ2FsbC5hYm9ydCgpLHRoaXMuX3N1YnNjcmliZUNhbGw9bnVsbCl9fV0pLGV9KCk7dC5kZWZhdWx0PWcsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBpPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz0obig4KSxuKDEzKSkscz1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KG8pLGE9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKCl7cih0aGlzLGUpLHRoaXMuX2xpc3RlbmVycz1bXX1yZXR1cm4gaShlLFt7a2V5OlwiYWRkTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMucHVzaChlKX19LHtrZXk6XCJyZW1vdmVMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PVtdO3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKG4pe24hPT1lJiZ0LnB1c2gobil9KSx0aGlzLl9saXN0ZW5lcnM9dH19LHtrZXk6XCJyZW1vdmVBbGxMaXN0ZW5lcnNcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xpc3RlbmVycz1bXX19LHtrZXk6XCJhbm5vdW5jZVByZXNlbmNlXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24odCl7dC5wcmVzZW5jZSYmdC5wcmVzZW5jZShlKX0pfX0se2tleTpcImFubm91bmNlU3RhdHVzXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24odCl7dC5zdGF0dXMmJnQuc3RhdHVzKGUpfSl9fSx7a2V5OlwiYW5ub3VuY2VNZXNzYWdlXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24odCl7dC5tZXNzYWdlJiZ0Lm1lc3NhZ2UoZSl9KX19LHtrZXk6XCJhbm5vdW5jZU5ldHdvcmtVcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9e307ZS5jYXRlZ29yeT1zLmRlZmF1bHQuUE5OZXR3b3JrVXBDYXRlZ29yeSx0aGlzLmFubm91bmNlU3RhdHVzKGUpfX0se2tleTpcImFubm91bmNlTmV0d29ya0Rvd25cIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXt9O2UuY2F0ZWdvcnk9cy5kZWZhdWx0LlBOTmV0d29ya0Rvd25DYXRlZ29yeSx0aGlzLmFubm91bmNlU3RhdHVzKGUpfX1dKSxlfSgpO3QuZGVmYXVsdD1hLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXtQTk5ldHdvcmtVcENhdGVnb3J5OlwiUE5OZXR3b3JrVXBDYXRlZ29yeVwiLFBOTmV0d29ya0Rvd25DYXRlZ29yeTpcIlBOTmV0d29ya0Rvd25DYXRlZ29yeVwiLFBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5OlwiUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnlcIixQTlRpbWVvdXRDYXRlZ29yeTpcIlBOVGltZW91dENhdGVnb3J5XCIsUE5CYWRSZXF1ZXN0Q2F0ZWdvcnk6XCJQTkJhZFJlcXVlc3RDYXRlZ29yeVwiLFBOQWNjZXNzRGVuaWVkQ2F0ZWdvcnk6XCJQTkFjY2Vzc0RlbmllZENhdGVnb3J5XCIsUE5Vbmtub3duQ2F0ZWdvcnk6XCJQTlVua25vd25DYXRlZ29yeVwiLFBOUmVjb25uZWN0ZWRDYXRlZ29yeTpcIlBOUmVjb25uZWN0ZWRDYXRlZ29yeVwiLFBOQ29ubmVjdGVkQ2F0ZWdvcnk6XCJQTkNvbm5lY3RlZENhdGVnb3J5XCIsUE5SZXF1ZXN0TWVzc2FnZUNvdW50RXhjZWVkZWRDYXRlZ29yeTpcIlBOUmVxdWVzdE1lc3NhZ2VDb3VudEV4Y2VlZGVkQ2F0ZWdvcnlcIn0sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBpPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz1uKDE1KSxzPShmdW5jdGlvbihlKXtlJiZlLl9fZXNNb2R1bGV9KG8pLG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQudGltZUVuZHBvaW50O3IodGhpcyxlKSx0aGlzLl90aW1lRW5kcG9pbnQ9bn1yZXR1cm4gaShlLFt7a2V5Olwib25SZWNvbm5lY3Rpb25cIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9yZWNvbm5lY3Rpb25DYWxsYmFjaz1lfX0se2tleTpcInN0YXJ0UG9sbGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fdGltZVRpbWVyPXNldEludGVydmFsKHRoaXMuX3BlcmZvcm1UaW1lTG9vcC5iaW5kKHRoaXMpLDNlMyl9fSx7a2V5Olwic3RvcFBvbGxpbmdcIix2YWx1ZTpmdW5jdGlvbigpe2NsZWFySW50ZXJ2YWwodGhpcy5fdGltZVRpbWVyKX19LHtrZXk6XCJfcGVyZm9ybVRpbWVMb29wXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzO3RoaXMuX3RpbWVFbmRwb2ludChmdW5jdGlvbih0KXt0LmVycm9yfHwoY2xlYXJJbnRlcnZhbChlLl90aW1lVGltZXIpLGUuX3JlY29ubmVjdGlvbkNhbGxiYWNrKCkpfSl9fV0pLGV9KCkpO3QuZGVmYXVsdD1zLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlRpbWVPcGVyYXRpb259ZnVuY3Rpb24gaSgpe3JldHVyblwiL3RpbWUvMFwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHMoKXtyZXR1cm57fX1mdW5jdGlvbiBhKCl7cmV0dXJuITF9ZnVuY3Rpb24gdShlLHQpe3JldHVybnt0aW1ldG9rZW46dFswXX19ZnVuY3Rpb24gYygpe31PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQuZ2V0VVJMPWksdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQucHJlcGFyZVBhcmFtcz1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5oYW5kbGVSZXNwb25zZT11LHQudmFsaWRhdGVQYXJhbXM9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD17UE5UaW1lT3BlcmF0aW9uOlwiUE5UaW1lT3BlcmF0aW9uXCIsUE5IaXN0b3J5T3BlcmF0aW9uOlwiUE5IaXN0b3J5T3BlcmF0aW9uXCIsUE5GZXRjaE1lc3NhZ2VzT3BlcmF0aW9uOlwiUE5GZXRjaE1lc3NhZ2VzT3BlcmF0aW9uXCIsUE5TdWJzY3JpYmVPcGVyYXRpb246XCJQTlN1YnNjcmliZU9wZXJhdGlvblwiLFBOVW5zdWJzY3JpYmVPcGVyYXRpb246XCJQTlVuc3Vic2NyaWJlT3BlcmF0aW9uXCIsUE5QdWJsaXNoT3BlcmF0aW9uOlwiUE5QdWJsaXNoT3BlcmF0aW9uXCIsUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9uOlwiUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9uXCIsUE5SZW1vdmVBbGxQdXNoTm90aWZpY2F0aW9uc09wZXJhdGlvbjpcIlBOUmVtb3ZlQWxsUHVzaE5vdGlmaWNhdGlvbnNPcGVyYXRpb25cIixQTldoZXJlTm93T3BlcmF0aW9uOlwiUE5XaGVyZU5vd09wZXJhdGlvblwiLFBOU2V0U3RhdGVPcGVyYXRpb246XCJQTlNldFN0YXRlT3BlcmF0aW9uXCIsUE5IZXJlTm93T3BlcmF0aW9uOlwiUE5IZXJlTm93T3BlcmF0aW9uXCIsUE5HZXRTdGF0ZU9wZXJhdGlvbjpcIlBOR2V0U3RhdGVPcGVyYXRpb25cIixQTkhlYXJ0YmVhdE9wZXJhdGlvbjpcIlBOSGVhcnRiZWF0T3BlcmF0aW9uXCIsUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9uOlwiUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9uXCIsUE5SZW1vdmVHcm91cE9wZXJhdGlvbjpcIlBOUmVtb3ZlR3JvdXBPcGVyYXRpb25cIixQTkNoYW5uZWxzRm9yR3JvdXBPcGVyYXRpb246XCJQTkNoYW5uZWxzRm9yR3JvdXBPcGVyYXRpb25cIixQTkFkZENoYW5uZWxzVG9Hcm91cE9wZXJhdGlvbjpcIlBOQWRkQ2hhbm5lbHNUb0dyb3VwT3BlcmF0aW9uXCIsUE5SZW1vdmVDaGFubmVsc0Zyb21Hcm91cE9wZXJhdGlvbjpcIlBOUmVtb3ZlQ2hhbm5lbHNGcm9tR3JvdXBPcGVyYXRpb25cIixQTkFjY2Vzc01hbmFnZXJHcmFudDpcIlBOQWNjZXNzTWFuYWdlckdyYW50XCIsUE5BY2Nlc3NNYW5hZ2VyQXVkaXQ6XCJQTkFjY2Vzc01hbmFnZXJBdWRpdFwifSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSl7dmFyIHQ9W107cmV0dXJuIE9iamVjdC5rZXlzKGUpLmZvckVhY2goZnVuY3Rpb24oZSl7cmV0dXJuIHQucHVzaChlKX0pLHR9ZnVuY3Rpb24gcihlKXtyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGUpLnJlcGxhY2UoL1shfionKCldL2csZnVuY3Rpb24oZSl7cmV0dXJuXCIlXCIrZS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfSl9ZnVuY3Rpb24gaShlKXtyZXR1cm4gbihlKS5zb3J0KCl9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gaShlKS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQrXCI9XCIrcihlW3RdKX0pLmpvaW4oXCImXCIpfWZ1bmN0aW9uIHMoZSx0KXtyZXR1cm4tMSE9PWUuaW5kZXhPZih0LHRoaXMubGVuZ3RoLXQubGVuZ3RoKX1mdW5jdGlvbiBhKCl7dmFyIGU9dm9pZCAwLHQ9dm9pZCAwO3JldHVybntwcm9taXNlOm5ldyBQcm9taXNlKGZ1bmN0aW9uKG4scil7ZT1uLHQ9cn0pLHJlamVjdDp0LGZ1bGZpbGw6ZX19ZS5leHBvcnRzPXtzaWduUGFtRnJvbVBhcmFtczpvLGVuZHNXaXRoOnMsY3JlYXRlUHJvbWlzZTphLGVuY29kZVN0cmluZzpyfX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIG8oZSx0KXtpZighZSl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIXR8fFwib2JqZWN0XCIhPXR5cGVvZiB0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiB0P2U6dH1mdW5jdGlvbiBzKGUsdCl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCYmbnVsbCE9PXQpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIrdHlwZW9mIHQpO2UucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodCYmdC5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTplLGVudW1lcmFibGU6ITEsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLHQmJihPYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LnNldFByb3RvdHlwZU9mKGUsdCk6ZS5fX3Byb3RvX189dCl9ZnVuY3Rpb24gYShlLHQpe3JldHVybiBlLnR5cGU9dCxlLmVycm9yPSEwLGV9ZnVuY3Rpb24gdShlKXtyZXR1cm4gYSh7bWVzc2FnZTplfSxcInZhbGlkYXRpb25FcnJvclwiKX1mdW5jdGlvbiBjKGUsdCxuKXtyZXR1cm4gZS51c2VQb3N0JiZlLnVzZVBvc3QodCxuKT9lLnBvc3RVUkwodCxuKTplLmdldFVSTCh0LG4pfWZ1bmN0aW9uIGwoZSl7dmFyIHQ9XCJQdWJOdWItSlMtXCIrZS5zZGtGYW1pbHk7cmV0dXJuIGUucGFydG5lcklkJiYodCs9XCItXCIrZS5wYXJ0bmVySWQpLHQrPVwiL1wiK2UuZ2V0VmVyc2lvbigpfWZ1bmN0aW9uIGgoZSx0LG4pe3ZhciByPWUuY29uZmlnLGk9ZS5jcnlwdG87bi50aW1lc3RhbXA9TWF0aC5mbG9vcigobmV3IERhdGUpLmdldFRpbWUoKS8xZTMpO3ZhciBvPXIuc3Vic2NyaWJlS2V5K1wiXFxuXCIrci5wdWJsaXNoS2V5K1wiXFxuXCIrdCtcIlxcblwiO28rPWcuZGVmYXVsdC5zaWduUGFtRnJvbVBhcmFtcyhuKTt2YXIgcz1pLkhNQUNTSEEyNTYobyk7cz1zLnJlcGxhY2UoL1xcKy9nLFwiLVwiKSxzPXMucmVwbGFjZSgvXFwvL2csXCJfXCIpLG4uc2lnbmF0dXJlPXN9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PWZ1bmN0aW9uKGUsdCl7dmFyIG49ZS5uZXR3b3JraW5nLHI9ZS5jb25maWcsaT1udWxsLG89bnVsbCxzPXt9O3QuZ2V0T3BlcmF0aW9uKCk9PT1iLmRlZmF1bHQuUE5UaW1lT3BlcmF0aW9ufHx0LmdldE9wZXJhdGlvbigpPT09Yi5kZWZhdWx0LlBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvbj9pPWFyZ3VtZW50cy5sZW5ndGg8PTI/dm9pZCAwOmFyZ3VtZW50c1syXToocz1hcmd1bWVudHMubGVuZ3RoPD0yP3ZvaWQgMDphcmd1bWVudHNbMl0saT1hcmd1bWVudHMubGVuZ3RoPD0zP3ZvaWQgMDphcmd1bWVudHNbM10pLFwidW5kZWZpbmVkXCI9PXR5cGVvZiBQcm9taXNlfHxpfHwobz1nLmRlZmF1bHQuY3JlYXRlUHJvbWlzZSgpKTt2YXIgYT10LnZhbGlkYXRlUGFyYW1zKGUscyk7aWYoIWEpe3ZhciBmPXQucHJlcGFyZVBhcmFtcyhlLHMpLHA9Yyh0LGUscykseT12b2lkIDAsdj17dXJsOnAsb3BlcmF0aW9uOnQuZ2V0T3BlcmF0aW9uKCksdGltZW91dDp0LmdldFJlcXVlc3RUaW1lb3V0KGUpfTtmLnV1aWQ9ci5VVUlELGYucG5zZGs9bChyKSxyLnVzZUluc3RhbmNlSWQmJihmLmluc3RhbmNlaWQ9ci5pbnN0YW5jZUlkKSxyLnVzZVJlcXVlc3RJZCYmKGYucmVxdWVzdGlkPWQuZGVmYXVsdC52NCgpKSx0LmlzQXV0aFN1cHBvcnRlZCgpJiZyLmdldEF1dGhLZXkoKSYmKGYuYXV0aD1yLmdldEF1dGhLZXkoKSksci5zZWNyZXRLZXkmJmgoZSxwLGYpO3ZhciBtPWZ1bmN0aW9uKG4scil7aWYobi5lcnJvcilyZXR1cm4gdm9pZChpP2kobik6byYmby5yZWplY3QobmV3IF8oXCJQdWJOdWIgY2FsbCBmYWlsZWQsIGNoZWNrIHN0YXR1cyBmb3IgZGV0YWlsc1wiLG4pKSk7dmFyIGE9dC5oYW5kbGVSZXNwb25zZShlLHIscyk7aT9pKG4sYSk6byYmby5mdWxmaWxsKGEpfTtpZih0LnVzZVBvc3QmJnQudXNlUG9zdChlLHMpKXt2YXIgaz10LnBvc3RQYXlsb2FkKGUscyk7eT1uLlBPU1QoZixrLHYsbSl9ZWxzZSB5PW4uR0VUKGYsdixtKTtyZXR1cm4gdC5nZXRPcGVyYXRpb24oKT09PWIuZGVmYXVsdC5QTlN1YnNjcmliZU9wZXJhdGlvbj95Om8/by5wcm9taXNlOnZvaWQgMH1yZXR1cm4gaT9pKHUoYSkpOm8/KG8ucmVqZWN0KG5ldyBfKFwiVmFsaWRhdGlvbiBmYWlsZWQsIGNoZWNrIHN0YXR1cyBmb3IgZGV0YWlsc1wiLHUoYSkpKSxvLnByb21pc2UpOnZvaWQgMH07dmFyIGY9bigyKSxkPXIoZikscD0obig4KSxuKDE3KSksZz1yKHApLHk9big3KSx2PShyKHkpLG4oMTYpKSxiPXIodiksXz1mdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUsbil7aSh0aGlzLHQpO3ZhciByPW8odGhpcywodC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KSkuY2FsbCh0aGlzLGUpKTtyZXR1cm4gci5uYW1lPXIuY29uc3RydWN0b3IubmFtZSxyLnN0YXR1cz1uLHIubWVzc2FnZT1lLHJ9cmV0dXJuIHModCxlKSx0fShFcnJvcik7ZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOQWRkQ2hhbm5lbHNUb0dyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9dC5jaGFubmVsR3JvdXAsaT1lLmNvbmZpZztyZXR1cm4gcj9uJiYwIT09bi5sZW5ndGg/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVscztyZXR1cm57YWRkOih2b2lkIDA9PT1uP1tdOm4pLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOUmVtb3ZlQ2hhbm5lbHNGcm9tR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj10LmNoYW5uZWxHcm91cCxpPWUuY29uZmlnO3JldHVybiByP24mJjAhPT1uLmxlbmd0aD9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbHNcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxzO3JldHVybntyZW1vdmU6KHZvaWQgMD09PW4/W106bikuam9pbihcIixcIil9fWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5SZW1vdmVHcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXAscj1lLmNvbmZpZztyZXR1cm4gbj9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobikrXCIvcmVtb3ZlXCJ9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUpe3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXBcIn1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdSgpe3JldHVybnt9fWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm57Z3JvdXBzOnQucGF5bG9hZC5ncm91cHN9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkNoYW5uZWxzRm9yR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwLHI9ZS5jb25maWc7cmV0dXJuIG4/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKCl7cmV0dXJue319ZnVuY3Rpb24gbChlLHQpe3JldHVybntjaGFubmVsczp0LnBheWxvYWQuY2hhbm5lbHN9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb259ZnVuY3Rpb24gaShlLHQpe3ZhciBuPXQuZGV2aWNlLHI9dC5wdXNoR2F0ZXdheSxpPXQuY2hhbm5lbHMsbz1lLmNvbmZpZztyZXR1cm4gbj9yP2kmJjAhPT1pLmxlbmd0aD9vLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbHNcIjpcIk1pc3NpbmcgR1cgVHlwZSAocHVzaEdhdGV3YXk6IGdjbSBvciBhcG5zKVwiOlwiTWlzc2luZyBEZXZpY2UgSUQgKGRldmljZSlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5kZXZpY2U7cmV0dXJuXCIvdjEvcHVzaC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9kZXZpY2VzL1wiK259ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj10LnB1c2hHYXRld2F5LHI9dC5jaGFubmVscztyZXR1cm57dHlwZTpuLGFkZDoodm9pZCAwPT09cj9bXTpyKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gYygpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb259ZnVuY3Rpb24gaShlLHQpe3ZhciBuPXQuZGV2aWNlLHI9dC5wdXNoR2F0ZXdheSxpPXQuY2hhbm5lbHMsbz1lLmNvbmZpZztyZXR1cm4gbj9yP2kmJjAhPT1pLmxlbmd0aD9vLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbHNcIjpcIk1pc3NpbmcgR1cgVHlwZSAocHVzaEdhdGV3YXk6IGdjbSBvciBhcG5zKVwiOlwiTWlzc2luZyBEZXZpY2UgSUQgKGRldmljZSlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5kZXZpY2U7cmV0dXJuXCIvdjEvcHVzaC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9kZXZpY2VzL1wiK259ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj10LnB1c2hHYXRld2F5LHI9dC5jaGFubmVscztyZXR1cm57dHlwZTpuLHJlbW92ZToodm9pZCAwPT09cj9bXTpyKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gYygpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb259ZnVuY3Rpb24gaShlLHQpe3ZhciBuPXQuZGV2aWNlLHI9dC5wdXNoR2F0ZXdheSxpPWUuY29uZmlnO3JldHVybiBuP3I/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIitufWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7cmV0dXJue3R5cGU6dC5wdXNoR2F0ZXdheX19ZnVuY3Rpb24gYyhlLHQpe3JldHVybntjaGFubmVsczp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5SZW1vdmVBbGxQdXNoTm90aWZpY2F0aW9uc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9ZS5jb25maWc7cmV0dXJuIG4/cj9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgR1cgVHlwZSAocHVzaEdhdGV3YXk6IGdjbSBvciBhcG5zKVwiOlwiTWlzc2luZyBEZXZpY2UgSUQgKGRldmljZSlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5kZXZpY2U7cmV0dXJuXCIvdjEvcHVzaC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9kZXZpY2VzL1wiK24rXCIvcmVtb3ZlXCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSx0KXtyZXR1cm57dHlwZTp0LnB1c2hHYXRld2F5fX1mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOVW5zdWJzY3JpYmVPcGVyYXRpb259ZnVuY3Rpb24gbyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixvPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhvKStcIi9sZWF2ZVwifWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9e307cmV0dXJuIHIubGVuZ3RoPjAmJihpW1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSxpfWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5XaGVyZU5vd09wZXJhdGlvbn1mdW5jdGlvbiBpKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LnV1aWQsaT12b2lkIDA9PT1yP24uVVVJRDpyO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvdXVpZC9cIitpfWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KCl7cmV0dXJue319ZnVuY3Rpb24gYyhlLHQpe3JldHVybntjaGFubmVsczp0LnBheWxvYWQuY2hhbm5lbHN9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1zLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkhlYXJ0YmVhdE9wZXJhdGlvbn1mdW5jdGlvbiBvKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG8pK1wiL2hlYXJ0YmVhdFwifWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9dC5zdGF0ZSxvPXZvaWQgMD09PWk/e306aSxzPWUuY29uZmlnLGE9e307cmV0dXJuIHIubGVuZ3RoPjAmJihhW1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSxhLnN0YXRlPUpTT04uc3RyaW5naWZ5KG8pLGEuaGVhcnRiZWF0PXMuZ2V0UHJlc2VuY2VUaW1lb3V0KCksYX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOR2V0U3RhdGVPcGVyYXRpb259ZnVuY3Rpb24gbyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC51dWlkLGk9dm9pZCAwPT09cj9uLlVVSUQ6cixvPXQuY2hhbm5lbHMscz12b2lkIDA9PT1vP1tdOm8sYT1zLmxlbmd0aD4wP3Muam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcoYSkrXCIvdXVpZC9cIitpfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9e307cmV0dXJuIHIubGVuZ3RoPjAmJihpW1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSxpfWZ1bmN0aW9uIGwoZSx0LG4pe3ZhciByPW4uY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIsbz1uLmNoYW5uZWxHcm91cHMscz12b2lkIDA9PT1vP1tdOm8sYT17fTtyZXR1cm4gMT09PWkubGVuZ3RoJiYwPT09cy5sZW5ndGg/YVtpWzBdXT10LnBheWxvYWQ6YT10LnBheWxvYWQse2NoYW5uZWxzOmF9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1vLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlNldFN0YXRlT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuc3RhdGUsaT10LmNoYW5uZWxzLG89dm9pZCAwPT09aT9bXTppLHM9dC5jaGFubmVsR3JvdXBzLGE9dm9pZCAwPT09cz9bXTpzO3JldHVybiByP24uc3Vic2NyaWJlS2V5PzA9PT1vLmxlbmd0aCYmMD09PWEubGVuZ3RoP1wiUGxlYXNlIHByb3ZpZGUgYSBsaXN0IG9mIGNoYW5uZWxzIGFuZC9vciBjaGFubmVsLWdyb3Vwc1wiOnZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBTdGF0ZVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIsbz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobykrXCIvdXVpZC9cIituLlVVSUQrXCIvZGF0YVwifWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5zdGF0ZSxyPXQuY2hhbm5lbEdyb3VwcyxpPXZvaWQgMD09PXI/W106cixvPXt9O3JldHVybiBvLnN0YXRlPUpTT04uc3RyaW5naWZ5KG4pLGkubGVuZ3RoPjAmJihvW1wiY2hhbm5lbC1ncm91cFwiXT1pLmpvaW4oXCIsXCIpKSxvfWZ1bmN0aW9uIGwoZSx0KXtyZXR1cm57c3RhdGU6dC5wYXlsb2FkfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5IZXJlTm93T3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIsbz10LmNoYW5uZWxHcm91cHMscz12b2lkIDA9PT1vP1tdOm8sYT1cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5O2lmKGkubGVuZ3RoPjB8fHMubGVuZ3RoPjApe3ZhciB1PWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjthKz1cIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcodSl9cmV0dXJuIGF9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT10LmluY2x1ZGVVVUlEcyxvPXZvaWQgMD09PWl8fGkscz10LmluY2x1ZGVTdGF0ZSxhPXZvaWQgMCE9PXMmJnMsdT17fTtyZXR1cm4gb3x8KHUuZGlzYWJsZV91dWlkcz0xKSxhJiYodS5zdGF0ZT0xKSxyLmxlbmd0aD4wJiYodVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksdX1mdW5jdGlvbiBsKGUsdCxuKXt2YXIgcj1uLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89bi5jaGFubmVsR3JvdXBzLHM9dm9pZCAwPT09bz9bXTpvLGE9bi5pbmNsdWRlVVVJRHMsdT12b2lkIDA9PT1hfHxhLGM9bi5pbmNsdWRlU3RhdGUsbD12b2lkIDAhPT1jJiZjO3JldHVybiBpLmxlbmd0aD4xfHxzLmxlbmd0aD4wfHwwPT09cy5sZW5ndGgmJjA9PT1pLmxlbmd0aD9mdW5jdGlvbigpe3ZhciBlPXt9O3JldHVybiBlLnRvdGFsQ2hhbm5lbHM9dC5wYXlsb2FkLnRvdGFsX2NoYW5uZWxzLGUudG90YWxPY2N1cGFuY3k9dC5wYXlsb2FkLnRvdGFsX29jY3VwYW5jeSxlLmNoYW5uZWxzPXt9LE9iamVjdC5rZXlzKHQucGF5bG9hZC5jaGFubmVscykuZm9yRWFjaChmdW5jdGlvbihuKXt2YXIgcj10LnBheWxvYWQuY2hhbm5lbHNbbl0saT1bXTtyZXR1cm4gZS5jaGFubmVsc1tuXT17b2NjdXBhbnRzOmksbmFtZTpuLG9jY3VwYW5jeTpyLm9jY3VwYW5jeX0sdSYmci51dWlkcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2w/aS5wdXNoKHtzdGF0ZTplLnN0YXRlLHV1aWQ6ZS51dWlkfSk6aS5wdXNoKHtzdGF0ZTpudWxsLHV1aWQ6ZX0pfSksZX0pLGV9KCk6ZnVuY3Rpb24oKXt2YXIgZT17fSxuPVtdO3JldHVybiBlLnRvdGFsQ2hhbm5lbHM9MSxlLnRvdGFsT2NjdXBhbmN5PXQub2NjdXBhbmN5LGUuY2hhbm5lbHM9e30sZS5jaGFubmVsc1tpWzBdXT17b2NjdXBhbnRzOm4sbmFtZTppWzBdLG9jY3VwYW5jeTp0Lm9jY3VwYW5jeX0sdSYmdC51dWlkcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2w/bi5wdXNoKHtzdGF0ZTplLnN0YXRlLHV1aWQ6ZS51dWlkfSk6bi5wdXNoKHtzdGF0ZTpudWxsLHV1aWQ6ZX0pfSksZX0oKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5BY2Nlc3NNYW5hZ2VyQXVkaXR9ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlKXtyZXR1cm5cIi92Mi9hdXRoL2F1ZGl0L3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5fWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5jaGFubmVsLHI9dC5jaGFubmVsR3JvdXAsaT10LmF1dGhLZXlzLG89dm9pZCAwPT09aT9bXTppLHM9e307cmV0dXJuIG4mJihzLmNoYW5uZWw9biksciYmKHNbXCJjaGFubmVsLWdyb3VwXCJdPXIpLG8ubGVuZ3RoPjAmJihzLmF1dGg9by5qb2luKFwiLFwiKSksc31mdW5jdGlvbiBjKGUsdCl7cmV0dXJuIHQucGF5bG9hZH1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5BY2Nlc3NNYW5hZ2VyR3JhbnR9ZnVuY3Rpb24gaShlKXt2YXIgdD1lLmNvbmZpZztyZXR1cm4gdC5zdWJzY3JpYmVLZXk/dC5wdWJsaXNoS2V5P3Quc2VjcmV0S2V5P3ZvaWQgMDpcIk1pc3NpbmcgU2VjcmV0IEtleVwiOlwiTWlzc2luZyBQdWJsaXNoIEtleVwiOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlKXtyZXR1cm5cIi92Mi9hdXRoL2dyYW50L3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5fWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXZvaWQgMD09PW4/W106bixpPXQuY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PWk/W106aSxzPXQudHRsLGE9dC5yZWFkLHU9dm9pZCAwIT09YSYmYSxjPXQud3JpdGUsbD12b2lkIDAhPT1jJiZjLGg9dC5tYW5hZ2UsZj12b2lkIDAhPT1oJiZoLGQ9dC5hdXRoS2V5cyxwPXZvaWQgMD09PWQ/W106ZCxnPXt9O3JldHVybiBnLnI9dT9cIjFcIjpcIjBcIixnLnc9bD9cIjFcIjpcIjBcIixnLm09Zj9cIjFcIjpcIjBcIixyLmxlbmd0aD4wJiYoZy5jaGFubmVsPXIuam9pbihcIixcIikpLG8ubGVuZ3RoPjAmJihnW1wiY2hhbm5lbC1ncm91cFwiXT1vLmpvaW4oXCIsXCIpKSxwLmxlbmd0aD4wJiYoZy5hdXRoPXAuam9pbihcIixcIikpLChzfHwwPT09cykmJihnLnR0bD1zKSxnfWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe3ZhciBuPWUuY3J5cHRvLHI9ZS5jb25maWcsaT1KU09OLnN0cmluZ2lmeSh0KTtyZXR1cm4gci5jaXBoZXJLZXkmJihpPW4uZW5jcnlwdChpKSxpPUpTT04uc3RyaW5naWZ5KGkpKSxpfWZ1bmN0aW9uIG8oKXtyZXR1cm4gdi5kZWZhdWx0LlBOUHVibGlzaE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10Lm1lc3NhZ2U7cmV0dXJuIHQuY2hhbm5lbD9yP24uc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBNZXNzYWdlXCI6XCJNaXNzaW5nIENoYW5uZWxcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5zZW5kQnlQb3N0O3JldHVybiB2b2lkIDAhPT1uJiZufWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbCxvPXQubWVzc2FnZSxzPWkoZSxvKTtyZXR1cm5cIi9wdWJsaXNoL1wiK24ucHVibGlzaEtleStcIi9cIituLnN1YnNjcmliZUtleStcIi8wL1wiK18uZGVmYXVsdC5lbmNvZGVTdHJpbmcocikrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbDtyZXR1cm5cIi9wdWJsaXNoL1wiK24ucHVibGlzaEtleStcIi9cIituLnN1YnNjcmliZUtleStcIi8wL1wiK18uZGVmYXVsdC5lbmNvZGVTdHJpbmcocikrXCIvMFwifWZ1bmN0aW9uIGwoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGgoKXtyZXR1cm4hMH1mdW5jdGlvbiBmKGUsdCl7cmV0dXJuIGkoZSx0Lm1lc3NhZ2UpfWZ1bmN0aW9uIGQoZSx0KXt2YXIgbj10Lm1ldGEscj10LnJlcGxpY2F0ZSxpPXZvaWQgMD09PXJ8fHIsbz10LnN0b3JlSW5IaXN0b3J5LHM9dC50dGwsYT17fTtyZXR1cm4gbnVsbCE9byYmKGEuc3RvcmU9bz9cIjFcIjpcIjBcIikscyYmKGEudHRsPXMpLCExPT09aSYmKGEubm9yZXA9XCJ0cnVlXCIpLG4mJlwib2JqZWN0XCI9PT0odm9pZCAwPT09bj9cInVuZGVmaW5lZFwiOmcobikpJiYoYS5tZXRhPUpTT04uc3RyaW5naWZ5KG4pKSxhfWZ1bmN0aW9uIHAoZSx0KXtyZXR1cm57dGltZXRva2VuOnRbMl19fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBnPVwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmXCJzeW1ib2xcIj09dHlwZW9mIFN5bWJvbC5pdGVyYXRvcj9mdW5jdGlvbihlKXtyZXR1cm4gdHlwZW9mIGV9OmZ1bmN0aW9uKGUpe3JldHVybiBlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJmUuY29uc3RydWN0b3I9PT1TeW1ib2wmJmUhPT1TeW1ib2wucHJvdG90eXBlP1wic3ltYm9sXCI6dHlwZW9mIGV9O3QuZ2V0T3BlcmF0aW9uPW8sdC52YWxpZGF0ZVBhcmFtcz1zLHQudXNlUG9zdD1hLHQuZ2V0VVJMPXUsdC5wb3N0VVJMPWMsdC5nZXRSZXF1ZXN0VGltZW91dD1sLHQuaXNBdXRoU3VwcG9ydGVkPWgsdC5wb3N0UGF5bG9hZD1mLHQucHJlcGFyZVBhcmFtcz1kLHQuaGFuZGxlUmVzcG9uc2U9cDt2YXIgeT0obig4KSxuKDE2KSksdj1yKHkpLGI9bigxNyksXz1yKGIpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe3ZhciBuPWUuY29uZmlnLHI9ZS5jcnlwdG87aWYoIW4uY2lwaGVyS2V5KXJldHVybiB0O3RyeXtyZXR1cm4gci5kZWNyeXB0KHQpfWNhdGNoKGUpe3JldHVybiB0fX1mdW5jdGlvbiBvKCl7cmV0dXJuIGQuZGVmYXVsdC5QTkhpc3RvcnlPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbCxyPWUuY29uZmlnO3JldHVybiBuP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBjaGFubmVsXCJ9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQuY2hhbm5lbDtyZXR1cm5cIi92Mi9oaXN0b3J5L3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrZy5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKCl7cmV0dXJuITB9ZnVuY3Rpb24gbChlLHQpe3ZhciBuPXQuc3RhcnQscj10LmVuZCxpPXQucmV2ZXJzZSxvPXQuY291bnQscz12b2lkIDA9PT1vPzEwMDpvLGE9dC5zdHJpbmdpZmllZFRpbWVUb2tlbix1PXZvaWQgMCE9PWEmJmEsYz17aW5jbHVkZV90b2tlbjpcInRydWVcIn07cmV0dXJuIGMuY291bnQ9cyxuJiYoYy5zdGFydD1uKSxyJiYoYy5lbmQ9ciksdSYmKGMuc3RyaW5nX21lc3NhZ2VfdG9rZW49XCJ0cnVlXCIpLFxubnVsbCE9aSYmKGMucmV2ZXJzZT1pLnRvU3RyaW5nKCkpLGN9ZnVuY3Rpb24gaChlLHQpe3ZhciBuPXttZXNzYWdlczpbXSxzdGFydFRpbWVUb2tlbjp0WzFdLGVuZFRpbWVUb2tlbjp0WzJdfTtyZXR1cm4gdFswXS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciByPXt0aW1ldG9rZW46dC50aW1ldG9rZW4sZW50cnk6aShlLHQubWVzc2FnZSl9O24ubWVzc2FnZXMucHVzaChyKX0pLG59T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249byx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5pc0F1dGhTdXBwb3J0ZWQ9Yyx0LnByZXBhcmVQYXJhbXM9bCx0LmhhbmRsZVJlc3BvbnNlPWg7dmFyIGY9KG4oOCksbigxNikpLGQ9cihmKSxwPW4oMTcpLGc9cihwKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPWUuY3J5cHRvO2lmKCFuLmNpcGhlcktleSlyZXR1cm4gdDt0cnl7cmV0dXJuIHIuZGVjcnlwdCh0KX1jYXRjaChlKXtyZXR1cm4gdH19ZnVuY3Rpb24gbygpe3JldHVybiBkLmRlZmF1bHQuUE5GZXRjaE1lc3NhZ2VzT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9ZS5jb25maWc7cmV0dXJuIG4mJjAhPT1uLmxlbmd0aD9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgY2hhbm5lbHNcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXZvaWQgMD09PW4/W106bixpPWUuY29uZmlnLG89ci5sZW5ndGg+MD9yLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YzL2hpc3Rvcnkvc3ViLWtleS9cIitpLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK2cuZGVmYXVsdC5lbmNvZGVTdHJpbmcobyl9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybiEwfWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj10LnN0YXJ0LHI9dC5lbmQsaT10LmNvdW50LG89e307cmV0dXJuIGkmJihvLm1heD1pKSxuJiYoby5zdGFydD1uKSxyJiYoby5lbmQ9ciksb31mdW5jdGlvbiBoKGUsdCl7dmFyIG49e2NoYW5uZWxzOnt9fTtyZXR1cm4gT2JqZWN0LmtleXModC5jaGFubmVsc3x8e30pLmZvckVhY2goZnVuY3Rpb24ocil7bi5jaGFubmVsc1tyXT1bXSwodC5jaGFubmVsc1tyXXx8W10pLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIG89e307by5jaGFubmVsPXIsby5zdWJzY3JpcHRpb249bnVsbCxvLnRpbWV0b2tlbj10LnRpbWV0b2tlbixvLm1lc3NhZ2U9aShlLHQubWVzc2FnZSksbi5jaGFubmVsc1tyXS5wdXNoKG8pfSl9KSxufU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPW8sdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQuaXNBdXRoU3VwcG9ydGVkPWMsdC5wcmVwYXJlUGFyYW1zPWwsdC5oYW5kbGVSZXNwb25zZT1oO3ZhciBmPShuKDgpLG4oMTYpKSxkPXIoZikscD1uKDE3KSxnPXIocCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlN1YnNjcmliZU9wZXJhdGlvbn1mdW5jdGlvbiBvKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLG89aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3N1YnNjcmliZS9cIituLnN1YnNjcmliZUtleStcIi9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG8pK1wiLzBcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRTdWJzY3JpYmVUaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbEdyb3VwcyxpPXZvaWQgMD09PXI/W106cixvPXQudGltZXRva2VuLHM9dC5maWx0ZXJFeHByZXNzaW9uLGE9dC5yZWdpb24sdT17aGVhcnRiZWF0Om4uZ2V0UHJlc2VuY2VUaW1lb3V0KCl9O3JldHVybiBpLmxlbmd0aD4wJiYodVtcImNoYW5uZWwtZ3JvdXBcIl09aS5qb2luKFwiLFwiKSkscyYmcy5sZW5ndGg+MCYmKHVbXCJmaWx0ZXItZXhwclwiXT1zKSxvJiYodS50dD1vKSxhJiYodS50cj1hKSx1fWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj1bXTt0Lm0uZm9yRWFjaChmdW5jdGlvbihlKXt2YXIgdD17cHVibGlzaFRpbWV0b2tlbjplLnAudCxyZWdpb246ZS5wLnJ9LHI9e3NoYXJkOnBhcnNlSW50KGUuYSwxMCksc3Vic2NyaXB0aW9uTWF0Y2g6ZS5iLGNoYW5uZWw6ZS5jLHBheWxvYWQ6ZS5kLGZsYWdzOmUuZixpc3N1aW5nQ2xpZW50SWQ6ZS5pLHN1YnNjcmliZUtleTplLmssb3JpZ2luYXRpb25UaW1ldG9rZW46ZS5vLHVzZXJNZXRhZGF0YTplLnUscHVibGlzaE1ldGFEYXRhOnR9O24ucHVzaChyKX0pO3ZhciByPXt0aW1ldG9rZW46dC50LnQscmVnaW9uOnQudC5yfTtyZXR1cm57bWVzc2FnZXM6bixtZXRhZGF0YTpyfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oNyksYT0ocihzKSxuKDEzKSksdT1yKGEpLGM9KG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXRoaXM7aSh0aGlzLGUpLHRoaXMuX21vZHVsZXM9e30sT2JqZWN0LmtleXModCkuZm9yRWFjaChmdW5jdGlvbihlKXtuLl9tb2R1bGVzW2VdPXRbZV0uYmluZChuKX0pfXJldHVybiBvKGUsW3trZXk6XCJpbml0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fY29uZmlnPWUsdGhpcy5fbWF4U3ViRG9tYWluPTIwLHRoaXMuX2N1cnJlbnRTdWJEb21haW49TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRoaXMuX21heFN1YkRvbWFpbiksdGhpcy5fcHJvdmlkZWRGUUROPSh0aGlzLl9jb25maWcuc2VjdXJlP1wiaHR0cHM6Ly9cIjpcImh0dHA6Ly9cIikrdGhpcy5fY29uZmlnLm9yaWdpbix0aGlzLl9jb3JlUGFyYW1zPXt9LHRoaXMuc2hpZnRTdGFuZGFyZE9yaWdpbigpfX0se2tleTpcIm5leHRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe2lmKC0xPT09dGhpcy5fcHJvdmlkZWRGUUROLmluZGV4T2YoXCJwdWJzdWIuXCIpKXJldHVybiB0aGlzLl9wcm92aWRlZEZRRE47dmFyIGU9dm9pZCAwO3JldHVybiB0aGlzLl9jdXJyZW50U3ViRG9tYWluPXRoaXMuX2N1cnJlbnRTdWJEb21haW4rMSx0aGlzLl9jdXJyZW50U3ViRG9tYWluPj10aGlzLl9tYXhTdWJEb21haW4mJih0aGlzLl9jdXJyZW50U3ViRG9tYWluPTEpLGU9dGhpcy5fY3VycmVudFN1YkRvbWFpbi50b1N0cmluZygpLHRoaXMuX3Byb3ZpZGVkRlFETi5yZXBsYWNlKFwicHVic3ViXCIsXCJwc1wiK2UpfX0se2tleTpcInNoaWZ0U3RhbmRhcmRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdJiZhcmd1bWVudHNbMF07cmV0dXJuIHRoaXMuX3N0YW5kYXJkT3JpZ2luPXRoaXMubmV4dE9yaWdpbihlKSx0aGlzLl9zdGFuZGFyZE9yaWdpbn19LHtrZXk6XCJnZXRTdGFuZGFyZE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N0YW5kYXJkT3JpZ2lufX0se2tleTpcIlBPU1RcIix2YWx1ZTpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gdGhpcy5fbW9kdWxlcy5wb3N0KGUsdCxuLHIpfX0se2tleTpcIkdFVFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fbW9kdWxlcy5nZXQoZSx0LG4pfX0se2tleTpcIl9kZXRlY3RFcnJvckNhdGVnb3J5XCIsdmFsdWU6ZnVuY3Rpb24oZSl7aWYoXCJFTk9URk9VTkRcIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKFwiRUNPTk5SRUZVU0VEXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVDT05OUkVTRVRcIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKFwiRUFJX0FHQUlOXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZigwPT09ZS5zdGF0dXN8fGUuaGFzT3duUHJvcGVydHkoXCJzdGF0dXNcIikmJnZvaWQgMD09PWUuc3RhdHVzKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoZS50aW1lb3V0KXJldHVybiB1LmRlZmF1bHQuUE5UaW1lb3V0Q2F0ZWdvcnk7aWYoZS5yZXNwb25zZSl7aWYoZS5yZXNwb25zZS5iYWRSZXF1ZXN0KXJldHVybiB1LmRlZmF1bHQuUE5CYWRSZXF1ZXN0Q2F0ZWdvcnk7aWYoZS5yZXNwb25zZS5mb3JiaWRkZW4pcmV0dXJuIHUuZGVmYXVsdC5QTkFjY2Vzc0RlbmllZENhdGVnb3J5fXJldHVybiB1LmRlZmF1bHQuUE5Vbmtub3duQ2F0ZWdvcnl9fV0pLGV9KCkpO3QuZGVmYXVsdD1jLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXtnZXQ6ZnVuY3Rpb24oZSl7dHJ5e3JldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShlKX1jYXRjaChlKXtyZXR1cm4gbnVsbH19LHNldDpmdW5jdGlvbihlLHQpe3RyeXtyZXR1cm4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oZSx0KX1jYXRjaChlKXtyZXR1cm4gbnVsbH19fSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXt2YXIgdD0obmV3IERhdGUpLmdldFRpbWUoKSxuPShuZXcgRGF0ZSkudG9JU09TdHJpbmcoKSxyPWZ1bmN0aW9uKCl7cmV0dXJuIGNvbnNvbGUmJmNvbnNvbGUubG9nP2NvbnNvbGU6d2luZG93JiZ3aW5kb3cuY29uc29sZSYmd2luZG93LmNvbnNvbGUubG9nP3dpbmRvdy5jb25zb2xlOmNvbnNvbGV9KCk7ci5sb2coXCI8PDw8PFwiKSxyLmxvZyhcIltcIituK1wiXVwiLFwiXFxuXCIsZS51cmwsXCJcXG5cIixlLnFzKSxyLmxvZyhcIi0tLS0tXCIpLGUub24oXCJyZXNwb25zZVwiLGZ1bmN0aW9uKG4pe3ZhciBpPShuZXcgRGF0ZSkuZ2V0VGltZSgpLG89aS10LHM9KG5ldyBEYXRlKS50b0lTT1N0cmluZygpO3IubG9nKFwiPj4+Pj4+XCIpLHIubG9nKFwiW1wiK3MrXCIgLyBcIitvK1wiXVwiLFwiXFxuXCIsZS51cmwsXCJcXG5cIixlLnFzLFwiXFxuXCIsbi50ZXh0KSxyLmxvZyhcIi0tLS0tXCIpfSl9ZnVuY3Rpb24gaShlLHQsbil7dmFyIGk9dGhpcztyZXR1cm4gdGhpcy5fY29uZmlnLmxvZ1ZlcmJvc2l0eSYmKGU9ZS51c2UocikpLHRoaXMuX2NvbmZpZy5wcm94eSYmdGhpcy5fbW9kdWxlcy5wcm94eSYmKGU9dGhpcy5fbW9kdWxlcy5wcm94eS5jYWxsKHRoaXMsZSkpLHRoaXMuX2NvbmZpZy5rZWVwQWxpdmUmJnRoaXMuX21vZHVsZXMua2VlcEFsaXZlJiYoZT10aGlzLl9tb2R1bGUua2VlcEFsaXZlKGUpKSxlLnRpbWVvdXQodC50aW1lb3V0KS5lbmQoZnVuY3Rpb24oZSxyKXt2YXIgbz17fTtpZihvLmVycm9yPW51bGwhPT1lLG8ub3BlcmF0aW9uPXQub3BlcmF0aW9uLHImJnIuc3RhdHVzJiYoby5zdGF0dXNDb2RlPXIuc3RhdHVzKSxlKXJldHVybiBvLmVycm9yRGF0YT1lLG8uY2F0ZWdvcnk9aS5fZGV0ZWN0RXJyb3JDYXRlZ29yeShlKSxuKG8sbnVsbCk7dmFyIHM9SlNPTi5wYXJzZShyLnRleHQpO3JldHVybiBzLmVycm9yJiYxPT09cy5lcnJvciYmcy5zdGF0dXMmJnMubWVzc2FnZSYmcy5zZXJ2aWNlPyhvLmVycm9yRGF0YT1zLG8uc3RhdHVzQ29kZT1zLnN0YXR1cyxvLmVycm9yPSEwLG8uY2F0ZWdvcnk9aS5fZGV0ZWN0RXJyb3JDYXRlZ29yeShvKSxuKG8sbnVsbCkpOm4obyxzKX0pfWZ1bmN0aW9uIG8oZSx0LG4pe3ZhciByPXUuZGVmYXVsdC5nZXQodGhpcy5nZXRTdGFuZGFyZE9yaWdpbigpK3QudXJsKS5xdWVyeShlKTtyZXR1cm4gaS5jYWxsKHRoaXMscix0LG4pfWZ1bmN0aW9uIHMoZSx0LG4scil7dmFyIG89dS5kZWZhdWx0LnBvc3QodGhpcy5nZXRTdGFuZGFyZE9yaWdpbigpK24udXJsKS5xdWVyeShlKS5zZW5kKHQpO3JldHVybiBpLmNhbGwodGhpcyxvLG4scil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXQ9byx0LnBvc3Q9czt2YXIgYT1uKDQzKSx1PWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0oYSk7big4KX0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoKXt9ZnVuY3Rpb24gaShlKXtpZighdihlKSlyZXR1cm4gZTt2YXIgdD1bXTtmb3IodmFyIG4gaW4gZSlvKHQsbixlW25dKTtyZXR1cm4gdC5qb2luKFwiJlwiKX1mdW5jdGlvbiBvKGUsdCxuKXtpZihudWxsIT1uKWlmKEFycmF5LmlzQXJyYXkobikpbi5mb3JFYWNoKGZ1bmN0aW9uKG4pe28oZSx0LG4pfSk7ZWxzZSBpZih2KG4pKWZvcih2YXIgciBpbiBuKW8oZSx0K1wiW1wiK3IrXCJdXCIsbltyXSk7ZWxzZSBlLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHQpK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudChuKSk7ZWxzZSBudWxsPT09biYmZS5wdXNoKGVuY29kZVVSSUNvbXBvbmVudCh0KSl9ZnVuY3Rpb24gcyhlKXtmb3IodmFyIHQsbixyPXt9LGk9ZS5zcGxpdChcIiZcIiksbz0wLHM9aS5sZW5ndGg7bzxzOysrbyl0PWlbb10sbj10LmluZGV4T2YoXCI9XCIpLC0xPT1uP3JbZGVjb2RlVVJJQ29tcG9uZW50KHQpXT1cIlwiOnJbZGVjb2RlVVJJQ29tcG9uZW50KHQuc2xpY2UoMCxuKSldPWRlY29kZVVSSUNvbXBvbmVudCh0LnNsaWNlKG4rMSkpO3JldHVybiByfWZ1bmN0aW9uIGEoZSl7dmFyIHQsbixyLGksbz1lLnNwbGl0KC9cXHI/XFxuLykscz17fTtvLnBvcCgpO2Zvcih2YXIgYT0wLHU9by5sZW5ndGg7YTx1OysrYSluPW9bYV0sdD1uLmluZGV4T2YoXCI6XCIpLHI9bi5zbGljZSgwLHQpLnRvTG93ZXJDYXNlKCksaT1fKG4uc2xpY2UodCsxKSksc1tyXT1pO3JldHVybiBzfWZ1bmN0aW9uIHUoZSl7cmV0dXJuL1tcXC8rXWpzb25cXGIvLnRlc3QoZSl9ZnVuY3Rpb24gYyhlKXtyZXR1cm4gZS5zcGxpdCgvICo7ICovKS5zaGlmdCgpfWZ1bmN0aW9uIGwoZSl7cmV0dXJuIGUuc3BsaXQoLyAqOyAqLykucmVkdWNlKGZ1bmN0aW9uKGUsdCl7dmFyIG49dC5zcGxpdCgvICo9ICovKSxyPW4uc2hpZnQoKSxpPW4uc2hpZnQoKTtyZXR1cm4gciYmaSYmKGVbcl09aSksZX0se30pfWZ1bmN0aW9uIGgoZSx0KXt0PXR8fHt9LHRoaXMucmVxPWUsdGhpcy54aHI9dGhpcy5yZXEueGhyLHRoaXMudGV4dD1cIkhFQURcIiE9dGhpcy5yZXEubWV0aG9kJiYoXCJcIj09PXRoaXMueGhyLnJlc3BvbnNlVHlwZXx8XCJ0ZXh0XCI9PT10aGlzLnhoci5yZXNwb25zZVR5cGUpfHx2b2lkIDA9PT10aGlzLnhoci5yZXNwb25zZVR5cGU/dGhpcy54aHIucmVzcG9uc2VUZXh0Om51bGwsdGhpcy5zdGF0dXNUZXh0PXRoaXMucmVxLnhoci5zdGF0dXNUZXh0LHRoaXMuX3NldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKSx0aGlzLmhlYWRlcj10aGlzLmhlYWRlcnM9YSh0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSksdGhpcy5oZWFkZXJbXCJjb250ZW50LXR5cGVcIl09dGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJjb250ZW50LXR5cGVcIiksdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlciksdGhpcy5ib2R5PVwiSEVBRFwiIT10aGlzLnJlcS5tZXRob2Q/dGhpcy5fcGFyc2VCb2R5KHRoaXMudGV4dD90aGlzLnRleHQ6dGhpcy54aHIucmVzcG9uc2UpOm51bGx9ZnVuY3Rpb24gZihlLHQpe3ZhciBuPXRoaXM7dGhpcy5fcXVlcnk9dGhpcy5fcXVlcnl8fFtdLHRoaXMubWV0aG9kPWUsdGhpcy51cmw9dCx0aGlzLmhlYWRlcj17fSx0aGlzLl9oZWFkZXI9e30sdGhpcy5vbihcImVuZFwiLGZ1bmN0aW9uKCl7dmFyIGU9bnVsbCx0PW51bGw7dHJ5e3Q9bmV3IGgobil9Y2F0Y2godCl7cmV0dXJuIGU9bmV3IEVycm9yKFwiUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2VcIiksZS5wYXJzZT0hMCxlLm9yaWdpbmFsPXQsZS5yYXdSZXNwb25zZT1uLnhociYmbi54aHIucmVzcG9uc2VUZXh0P24ueGhyLnJlc3BvbnNlVGV4dDpudWxsLGUuc3RhdHVzQ29kZT1uLnhociYmbi54aHIuc3RhdHVzP24ueGhyLnN0YXR1czpudWxsLG4uY2FsbGJhY2soZSl9bi5lbWl0KFwicmVzcG9uc2VcIix0KTt2YXIgcjt0cnl7KHQuc3RhdHVzPDIwMHx8dC5zdGF0dXM+PTMwMCkmJihyPW5ldyBFcnJvcih0LnN0YXR1c1RleHR8fFwiVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2VcIiksci5vcmlnaW5hbD1lLHIucmVzcG9uc2U9dCxyLnN0YXR1cz10LnN0YXR1cyl9Y2F0Y2goZSl7cj1lfXI/bi5jYWxsYmFjayhyLHQpOm4uY2FsbGJhY2sobnVsbCx0KX0pfWZ1bmN0aW9uIGQoZSx0KXt2YXIgbj1iKFwiREVMRVRFXCIsZSk7cmV0dXJuIHQmJm4uZW5kKHQpLG59dmFyIHA7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9wPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9wPXNlbGY6KGNvbnNvbGUud2FybihcIlVzaW5nIGJyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIikscD10aGlzKTt2YXIgZz1uKDQ0KSx5PW4oNDUpLHY9big0NiksYj1lLmV4cG9ydHM9big0NykuYmluZChudWxsLGYpO2IuZ2V0WEhSPWZ1bmN0aW9uKCl7aWYoISghcC5YTUxIdHRwUmVxdWVzdHx8cC5sb2NhdGlvbiYmXCJmaWxlOlwiPT1wLmxvY2F0aW9uLnByb3RvY29sJiZwLkFjdGl2ZVhPYmplY3QpKXJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuNi4wXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFBcIil9Y2F0Y2goZSl7fXRocm93IEVycm9yKFwiQnJvd3Nlci1vbmx5IHZlcmlzb24gb2Ygc3VwZXJhZ2VudCBjb3VsZCBub3QgZmluZCBYSFJcIil9O3ZhciBfPVwiXCIudHJpbT9mdW5jdGlvbihlKXtyZXR1cm4gZS50cmltKCl9OmZ1bmN0aW9uKGUpe3JldHVybiBlLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZyxcIlwiKX07Yi5zZXJpYWxpemVPYmplY3Q9aSxiLnBhcnNlU3RyaW5nPXMsYi50eXBlcz17aHRtbDpcInRleHQvaHRtbFwiLGpzb246XCJhcHBsaWNhdGlvbi9qc29uXCIseG1sOlwiYXBwbGljYXRpb24veG1sXCIsdXJsZW5jb2RlZDpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLGZvcm06XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcImZvcm0tZGF0YVwiOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJ9LGIuc2VyaWFsaXplPXtcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOmksXCJhcHBsaWNhdGlvbi9qc29uXCI6SlNPTi5zdHJpbmdpZnl9LGIucGFyc2U9e1wiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6cyxcImFwcGxpY2F0aW9uL2pzb25cIjpKU09OLnBhcnNlfSxoLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuaGVhZGVyW2UudG9Mb3dlckNhc2UoKV19LGgucHJvdG90eXBlLl9zZXRIZWFkZXJQcm9wZXJ0aWVzPWZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuaGVhZGVyW1wiY29udGVudC10eXBlXCJdfHxcIlwiO3RoaXMudHlwZT1jKHQpO3ZhciBuPWwodCk7Zm9yKHZhciByIGluIG4pdGhpc1tyXT1uW3JdfSxoLnByb3RvdHlwZS5fcGFyc2VCb2R5PWZ1bmN0aW9uKGUpe3ZhciB0PWIucGFyc2VbdGhpcy50eXBlXTtyZXR1cm4hdCYmdSh0aGlzLnR5cGUpJiYodD1iLnBhcnNlW1wiYXBwbGljYXRpb24vanNvblwiXSksdCYmZSYmKGUubGVuZ3RofHxlIGluc3RhbmNlb2YgT2JqZWN0KT90KGUpOm51bGx9LGgucHJvdG90eXBlLl9zZXRTdGF0dXNQcm9wZXJ0aWVzPWZ1bmN0aW9uKGUpezEyMjM9PT1lJiYoZT0yMDQpO3ZhciB0PWUvMTAwfDA7dGhpcy5zdGF0dXM9dGhpcy5zdGF0dXNDb2RlPWUsdGhpcy5zdGF0dXNUeXBlPXQsdGhpcy5pbmZvPTE9PXQsdGhpcy5vaz0yPT10LHRoaXMuY2xpZW50RXJyb3I9ND09dCx0aGlzLnNlcnZlckVycm9yPTU9PXQsdGhpcy5lcnJvcj0oND09dHx8NT09dCkmJnRoaXMudG9FcnJvcigpLHRoaXMuYWNjZXB0ZWQ9MjAyPT1lLHRoaXMubm9Db250ZW50PTIwND09ZSx0aGlzLmJhZFJlcXVlc3Q9NDAwPT1lLHRoaXMudW5hdXRob3JpemVkPTQwMT09ZSx0aGlzLm5vdEFjY2VwdGFibGU9NDA2PT1lLHRoaXMubm90Rm91bmQ9NDA0PT1lLHRoaXMuZm9yYmlkZGVuPTQwMz09ZX0saC5wcm90b3R5cGUudG9FcnJvcj1mdW5jdGlvbigpe3ZhciBlPXRoaXMucmVxLHQ9ZS5tZXRob2Qsbj1lLnVybCxyPVwiY2Fubm90IFwiK3QrXCIgXCIrbitcIiAoXCIrdGhpcy5zdGF0dXMrXCIpXCIsaT1uZXcgRXJyb3Iocik7cmV0dXJuIGkuc3RhdHVzPXRoaXMuc3RhdHVzLGkubWV0aG9kPXQsaS51cmw9bixpfSxiLlJlc3BvbnNlPWgsZyhmLnByb3RvdHlwZSk7Zm9yKHZhciBtIGluIHkpZi5wcm90b3R5cGVbbV09eVttXTtmLnByb3RvdHlwZS50eXBlPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnNldChcIkNvbnRlbnQtVHlwZVwiLGIudHlwZXNbZV18fGUpLHRoaXN9LGYucHJvdG90eXBlLnJlc3BvbnNlVHlwZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcmVzcG9uc2VUeXBlPWUsdGhpc30sZi5wcm90b3R5cGUuYWNjZXB0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnNldChcIkFjY2VwdFwiLGIudHlwZXNbZV18fGUpLHRoaXN9LGYucHJvdG90eXBlLmF1dGg9ZnVuY3Rpb24oZSx0LG4pe3N3aXRjaChufHwobj17dHlwZTpcImJhc2ljXCJ9KSxuLnR5cGUpe2Nhc2VcImJhc2ljXCI6dmFyIHI9YnRvYShlK1wiOlwiK3QpO3RoaXMuc2V0KFwiQXV0aG9yaXphdGlvblwiLFwiQmFzaWMgXCIrcik7YnJlYWs7Y2FzZVwiYXV0b1wiOnRoaXMudXNlcm5hbWU9ZSx0aGlzLnBhc3N3b3JkPXR9cmV0dXJuIHRoaXN9LGYucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGUpe3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBlJiYoZT1pKGUpKSxlJiZ0aGlzLl9xdWVyeS5wdXNoKGUpLHRoaXN9LGYucHJvdG90eXBlLmF0dGFjaD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGUsdCxufHx0Lm5hbWUpLHRoaXN9LGYucHJvdG90eXBlLl9nZXRGb3JtRGF0YT1mdW5jdGlvbigpe3JldHVybiB0aGlzLl9mb3JtRGF0YXx8KHRoaXMuX2Zvcm1EYXRhPW5ldyBwLkZvcm1EYXRhKSx0aGlzLl9mb3JtRGF0YX0sZi5wcm90b3R5cGUuY2FsbGJhY2s9ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jYWxsYmFjazt0aGlzLmNsZWFyVGltZW91dCgpLG4oZSx0KX0sZi5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvcj1mdW5jdGlvbigpe3ZhciBlPW5ldyBFcnJvcihcIlJlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy5cIik7ZS5jcm9zc0RvbWFpbj0hMCxlLnN0YXR1cz10aGlzLnN0YXR1cyxlLm1ldGhvZD10aGlzLm1ldGhvZCxlLnVybD10aGlzLnVybCx0aGlzLmNhbGxiYWNrKGUpfSxmLnByb3RvdHlwZS5fdGltZW91dEVycm9yPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5fdGltZW91dCx0PW5ldyBFcnJvcihcInRpbWVvdXQgb2YgXCIrZStcIm1zIGV4Y2VlZGVkXCIpO3QudGltZW91dD1lLHRoaXMuY2FsbGJhY2sodCl9LGYucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZz1mdW5jdGlvbigpe3ZhciBlPXRoaXMuX3F1ZXJ5LmpvaW4oXCImXCIpO2UmJih0aGlzLnVybCs9fnRoaXMudXJsLmluZGV4T2YoXCI/XCIpP1wiJlwiK2U6XCI/XCIrZSl9LGYucHJvdG90eXBlLmVuZD1mdW5jdGlvbihlKXt2YXIgdD10aGlzLG49dGhpcy54aHI9Yi5nZXRYSFIoKSxpPXRoaXMuX3RpbWVvdXQsbz10aGlzLl9mb3JtRGF0YXx8dGhpcy5fZGF0YTt0aGlzLl9jYWxsYmFjaz1lfHxyLG4ub25yZWFkeXN0YXRlY2hhbmdlPWZ1bmN0aW9uKCl7aWYoND09bi5yZWFkeVN0YXRlKXt2YXIgZTt0cnl7ZT1uLnN0YXR1c31jYXRjaCh0KXtlPTB9aWYoMD09ZSl7aWYodC50aW1lZG91dClyZXR1cm4gdC5fdGltZW91dEVycm9yKCk7aWYodC5fYWJvcnRlZClyZXR1cm47cmV0dXJuIHQuY3Jvc3NEb21haW5FcnJvcigpfXQuZW1pdChcImVuZFwiKX19O3ZhciBzPWZ1bmN0aW9uKGUsbil7bi50b3RhbD4wJiYobi5wZXJjZW50PW4ubG9hZGVkL24udG90YWwqMTAwKSxuLmRpcmVjdGlvbj1lLHQuZW1pdChcInByb2dyZXNzXCIsbil9O2lmKHRoaXMuaGFzTGlzdGVuZXJzKFwicHJvZ3Jlc3NcIikpdHJ5e24ub25wcm9ncmVzcz1zLmJpbmQobnVsbCxcImRvd25sb2FkXCIpLG4udXBsb2FkJiYobi51cGxvYWQub25wcm9ncmVzcz1zLmJpbmQobnVsbCxcInVwbG9hZFwiKSl9Y2F0Y2goZSl7fWlmKGkmJiF0aGlzLl90aW1lciYmKHRoaXMuX3RpbWVyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LnRpbWVkb3V0PSEwLHQuYWJvcnQoKX0saSkpLHRoaXMuX2FwcGVuZFF1ZXJ5U3RyaW5nKCksdGhpcy51c2VybmFtZSYmdGhpcy5wYXNzd29yZD9uLm9wZW4odGhpcy5tZXRob2QsdGhpcy51cmwsITAsdGhpcy51c2VybmFtZSx0aGlzLnBhc3N3b3JkKTpuLm9wZW4odGhpcy5tZXRob2QsdGhpcy51cmwsITApLHRoaXMuX3dpdGhDcmVkZW50aWFscyYmKG4ud2l0aENyZWRlbnRpYWxzPSEwKSxcIkdFVFwiIT10aGlzLm1ldGhvZCYmXCJIRUFEXCIhPXRoaXMubWV0aG9kJiZcInN0cmluZ1wiIT10eXBlb2YgbyYmIXRoaXMuX2lzSG9zdChvKSl7dmFyIGE9dGhpcy5faGVhZGVyW1wiY29udGVudC10eXBlXCJdLGM9dGhpcy5fc2VyaWFsaXplcnx8Yi5zZXJpYWxpemVbYT9hLnNwbGl0KFwiO1wiKVswXTpcIlwiXTshYyYmdShhKSYmKGM9Yi5zZXJpYWxpemVbXCJhcHBsaWNhdGlvbi9qc29uXCJdKSxjJiYobz1jKG8pKX1mb3IodmFyIGwgaW4gdGhpcy5oZWFkZXIpbnVsbCE9dGhpcy5oZWFkZXJbbF0mJm4uc2V0UmVxdWVzdEhlYWRlcihsLHRoaXMuaGVhZGVyW2xdKTtyZXR1cm4gdGhpcy5fcmVzcG9uc2VUeXBlJiYobi5yZXNwb25zZVR5cGU9dGhpcy5fcmVzcG9uc2VUeXBlKSx0aGlzLmVtaXQoXCJyZXF1ZXN0XCIsdGhpcyksbi5zZW5kKHZvaWQgMCE9PW8/bzpudWxsKSx0aGlzfSxiLlJlcXVlc3Q9ZixiLmdldD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIkdFVFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnF1ZXJ5KHQpLG4mJnIuZW5kKG4pLHJ9LGIuaGVhZD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIkhFQURcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIub3B0aW9ucz1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIk9QVElPTlNcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIuZGVsPWQsYi5kZWxldGU9ZCxiLnBhdGNoPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiUEFUQ0hcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIucG9zdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBPU1RcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIucHV0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiUFVUXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfX0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSl7aWYoZSlyZXR1cm4gaShlKX1mdW5jdGlvbiBpKGUpe2Zvcih2YXIgdCBpbiByLnByb3RvdHlwZSllW3RdPXIucHJvdG90eXBlW3RdO3JldHVybiBlfWUuZXhwb3J0cz1yLHIucHJvdG90eXBlLm9uPXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sKHRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXT10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV18fFtdKS5wdXNoKHQpLHRoaXN9LHIucHJvdG90eXBlLm9uY2U9ZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKCl7dGhpcy5vZmYoZSxuKSx0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gbi5mbj10LHRoaXMub24oZSxuKSx0aGlzfSxyLnByb3RvdHlwZS5vZmY9ci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI9ci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzPXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oZSx0KXtpZih0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSwwPT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9jYWxsYmFja3M9e30sdGhpczt2YXIgbj10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV07aWYoIW4pcmV0dXJuIHRoaXM7aWYoMT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXSx0aGlzO2Zvcih2YXIgcixpPTA7aTxuLmxlbmd0aDtpKyspaWYoKHI9bltpXSk9PT10fHxyLmZuPT09dCl7bi5zcGxpY2UoaSwxKTticmVha31yZXR1cm4gdGhpc30sci5wcm90b3R5cGUuZW1pdD1mdW5jdGlvbihlKXt0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fTt2YXIgdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSxuPXRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXTtpZihuKXtuPW4uc2xpY2UoMCk7Zm9yKHZhciByPTAsaT1uLmxlbmd0aDtyPGk7KytyKW5bcl0uYXBwbHkodGhpcyx0KX1yZXR1cm4gdGhpc30sci5wcm90b3R5cGUubGlzdGVuZXJzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSx0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV18fFtdfSxyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnM9ZnVuY3Rpb24oZSl7cmV0dXJuISF0aGlzLmxpc3RlbmVycyhlKS5sZW5ndGh9fSxmdW5jdGlvbihlLHQsbil7dmFyIHI9big0Nik7dC5jbGVhclRpbWVvdXQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdGltZW91dD0wLGNsZWFyVGltZW91dCh0aGlzLl90aW1lciksdGhpc30sdC5wYXJzZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcGFyc2VyPWUsdGhpc30sdC5zZXJpYWxpemU9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3NlcmlhbGl6ZXI9ZSx0aGlzfSx0LnRpbWVvdXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3RpbWVvdXQ9ZSx0aGlzfSx0LnRoZW49ZnVuY3Rpb24oZSx0KXtpZighdGhpcy5fZnVsbGZpbGxlZFByb21pc2Upe3ZhciBuPXRoaXM7dGhpcy5fZnVsbGZpbGxlZFByb21pc2U9bmV3IFByb21pc2UoZnVuY3Rpb24oZSx0KXtuLmVuZChmdW5jdGlvbihuLHIpe24/dChuKTplKHIpfSl9KX1yZXR1cm4gdGhpcy5fZnVsbGZpbGxlZFByb21pc2UudGhlbihlLHQpfSx0LmNhdGNoPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnRoZW4odm9pZCAwLGUpfSx0LnVzZT1mdW5jdGlvbihlKXtyZXR1cm4gZSh0aGlzKSx0aGlzfSx0LmdldD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV19LHQuZ2V0SGVhZGVyPXQuZ2V0LHQuc2V0PWZ1bmN0aW9uKGUsdCl7aWYocihlKSl7Zm9yKHZhciBuIGluIGUpdGhpcy5zZXQobixlW25dKTtyZXR1cm4gdGhpc31yZXR1cm4gdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV09dCx0aGlzLmhlYWRlcltlXT10LHRoaXN9LHQudW5zZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZS50b0xvd2VyQ2FzZSgpXSxkZWxldGUgdGhpcy5oZWFkZXJbZV0sdGhpc30sdC5maWVsZD1mdW5jdGlvbihlLHQpe2lmKG51bGw9PT1lfHx2b2lkIDA9PT1lKXRocm93IG5ldyBFcnJvcihcIi5maWVsZChuYW1lLCB2YWwpIG5hbWUgY2FuIG5vdCBiZSBlbXB0eVwiKTtpZihyKGUpKXtmb3IodmFyIG4gaW4gZSl0aGlzLmZpZWxkKG4sZVtuXSk7cmV0dXJuIHRoaXN9aWYobnVsbD09PXR8fHZvaWQgMD09PXQpdGhyb3cgbmV3IEVycm9yKFwiLmZpZWxkKG5hbWUsIHZhbCkgdmFsIGNhbiBub3QgYmUgZW1wdHlcIik7cmV0dXJuIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGUsdCksdGhpc30sdC5hYm9ydD1mdW5jdGlvbigpe3JldHVybiB0aGlzLl9hYm9ydGVkP3RoaXM6KHRoaXMuX2Fib3J0ZWQ9ITAsdGhpcy54aHImJnRoaXMueGhyLmFib3J0KCksdGhpcy5yZXEmJnRoaXMucmVxLmFib3J0KCksdGhpcy5jbGVhclRpbWVvdXQoKSx0aGlzLmVtaXQoXCJhYm9ydFwiKSx0aGlzKX0sdC53aXRoQ3JlZGVudGlhbHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd2l0aENyZWRlbnRpYWxzPSEwLHRoaXN9LHQucmVkaXJlY3RzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9tYXhSZWRpcmVjdHM9ZSx0aGlzfSx0LnRvSlNPTj1mdW5jdGlvbigpe3JldHVybnttZXRob2Q6dGhpcy5tZXRob2QsdXJsOnRoaXMudXJsLGRhdGE6dGhpcy5fZGF0YSxoZWFkZXJzOnRoaXMuX2hlYWRlcn19LHQuX2lzSG9zdD1mdW5jdGlvbihlKXtzd2l0Y2goe30udG9TdHJpbmcuY2FsbChlKSl7Y2FzZVwiW29iamVjdCBGaWxlXVwiOmNhc2VcIltvYmplY3QgQmxvYl1cIjpjYXNlXCJbb2JqZWN0IEZvcm1EYXRhXVwiOnJldHVybiEwO2RlZmF1bHQ6cmV0dXJuITF9fSx0LnNlbmQ9ZnVuY3Rpb24oZSl7dmFyIHQ9cihlKSxuPXRoaXMuX2hlYWRlcltcImNvbnRlbnQtdHlwZVwiXTtpZih0JiZyKHRoaXMuX2RhdGEpKWZvcih2YXIgaSBpbiBlKXRoaXMuX2RhdGFbaV09ZVtpXTtlbHNlXCJzdHJpbmdcIj09dHlwZW9mIGU/KG58fHRoaXMudHlwZShcImZvcm1cIiksbj10aGlzLl9oZWFkZXJbXCJjb250ZW50LXR5cGVcIl0sdGhpcy5fZGF0YT1cImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiPT1uP3RoaXMuX2RhdGE/dGhpcy5fZGF0YStcIiZcIitlOmU6KHRoaXMuX2RhdGF8fFwiXCIpK2UpOnRoaXMuX2RhdGE9ZTtyZXR1cm4hdHx8dGhpcy5faXNIb3N0KGUpP3RoaXM6KG58fHRoaXMudHlwZShcImpzb25cIiksdGhpcyl9fSxmdW5jdGlvbihlLHQpe2Z1bmN0aW9uIG4oZSl7cmV0dXJuIG51bGwhPT1lJiZcIm9iamVjdFwiPT10eXBlb2YgZX1lLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUsdCxuKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuP25ldyBlKFwiR0VUXCIsdCkuZW5kKG4pOjI9PWFyZ3VtZW50cy5sZW5ndGg/bmV3IGUoXCJHRVRcIix0KTpuZXcgZSh0LG4pfWUuZXhwb3J0cz1ufV0pfSk7IiwiLy8gQWxsb3dzIHVzIHRvIGNyZWF0ZSBhbmQgYmluZCB0byBldmVudHMuIEV2ZXJ5dGhpbmcgaW4gQ2hhdEVuZ2luZSBpcyBhbiBldmVudFxuLy8gZW1pdHRlclxuY29uc3QgRXZlbnRFbWl0dGVyMiA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjInKS5FdmVudEVtaXR0ZXIyO1xuXG5jb25zdCBQdWJOdWIgPSByZXF1aXJlKCdwdWJudWInKTtcblxuLy8gYWxsb3dzIGFzeW5jaHJvbm91cyBleGVjdXRpb24gZmxvdy5cbmNvbnN0IHdhdGVyZmFsbCA9IHJlcXVpcmUoJ2FzeW5jL3dhdGVyZmFsbCcpO1xuXG4vLyByZXF1aXJlZCB0byBtYWtlIEFKQVggY2FsbHMgZm9yIGF1dGhcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSgnYXhpb3MnKTtcblxuLyoqXG5HbG9iYWwgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIHtAbGluayBDaGF0RW5naW5lfS5cblxuQGFsaWFzIENoYXRFbmdpbmVDb3JlXG5AcGFyYW0gcG5Db25maWcge09iamVjdH0gQ2hhdEVuZ2luZSBpcyBiYXNlZCBvZmYgUHViTnViLiBTdXBwbHkgeW91ciBQdWJOdWIgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzIGhlcmUuIFNlZSB0aGUgZ2V0dGluZyBzdGFydGVkIHR1dG9yaWFsIGFuZCBbdGhlIFB1Yk51YiBkb2NzXShodHRwczovL3d3dy5wdWJudWIuY29tL2RvY3MvamF2YS1zZS1qYXZhL2FwaS1yZWZlcmVuY2UtY29uZmlndXJhdGlvbikuXG5AcGFyYW0gY2VDb25maWcge09iamVjdH0gQSBsaXN0IG9mIGNoYXQgZW5naW5lIHNwZWNpZmljIGNvbmZpZyBvcHRpb25zLlxuQHBhcmFtIFtjZUNvbmZpZy5nbG9iYWxDaGFubmVsPWNoYXQtZW5naW5lXSB7U3RyaW5nfSBUaGUgcm9vdCBjaGFubmVsLiBTZWUge0BsaW5rIENoYXRFbmdpbmUuZ2xvYmFsfVxuQHBhcmFtIFtjZUNvbmZpZy5hdXRoVXJsXSB7U3RyaW5nfSBUaGUgcm9vdCBVUkwgdXNlZCB0byBtYW5hZ2UgcGVybWlzc2lvbnMgZm9yIHByaXZhdGUgY2hhbm5lbHMuIE9taXR0aW5nIHRoaXMgZm9yY2VzIGluc2VjdXJlIG1vZGUuXG5AcGFyYW0gW2NlQ29uZmlnLnRocm93RXJyb3JzPXRydWVdIHtCb29sZWFufSBUaHJvd3MgZXJyb3JzIGluIEpTIGNvbnNvbGUuXG5AcGFyYW0gW2NlQ29uZmlnLmluc2VjdXJlPXRydWVdIHtCb29sZWFufSBGb3JjZSBpbnRvIGluc2VjdXJlIG1vZGUuIFdpbGwgaWdub3JlIGF1dGhVcmwgYW5kIGFsbCBDaGF0cyB3aWxsIGJlIHB1YmxpYy5cbkByZXR1cm4ge0NoYXRFbmdpbmV9IFJldHVybnMgYW4gaW5zdGFuY2Ugb2Yge0BsaW5rIENoYXRFbmdpbmV9XG5AZXhhbXBsZVxuQ2hhdEVuZ2luZSA9IENoYXRFbmdpbmVDb3JlLmNyZWF0ZSh7XG4gICAgcHVibGlzaEtleTogJ2RlbW8nLFxuICAgIHN1YnNjcmliZUtleTogJ2RlbW8nXG59LCB7XG4gICAgYXV0aFVybDogJ2h0dHA6Ly9sb2NhbGhvc3QvYXV0aCcsXG4gICAgZ2xvYmFsQ2hhbm5lbDogJ2NoYXQtZW5naW5lLWdsb2JhbC1jaGFubmVsJ1xufSk7XG4qL1xuY29uc3QgY3JlYXRlID0gZnVuY3Rpb24ocG5Db25maWcsIGNlQ29uZmlnID0ge30pIHtcblxuICAgIGxldCBDaGF0RW5naW5lID0gZmFsc2U7XG5cbiAgICBpZihjZUNvbmZpZy5nbG9iYWxDaGFubmVsKSB7XG4gICAgICAgIGNlQ29uZmlnLmdsb2JhbENoYW5uZWwgPSBjZUNvbmZpZy5nbG9iYWxDaGFubmVsLnRvU3RyaW5nKClcbiAgICB9IGVsc2Uge1xuICAgICAgICBjZUNvbmZpZy5nbG9iYWxDaGFubmVsID0gJ2NoYXQtZW5naW5lJztcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgY2VDb25maWcudGhyb3dFcnJvcnMgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBjZUNvbmZpZy50aHJvd0Vycm9ycyA9IHRydWU7XG4gICAgfVxuXG4gICAgY2VDb25maWcuaW5zZWN1cmUgPSBjZUNvbmZpZy5pbnNlY3VyZSB8fCBmYWxzZTtcbiAgICBpZighY2VDb25maWcuYXV0aFVybCkge1xuICAgICAgICBjb25zb2xlLmluZm8oJ0NoYXRFbmdpbmUgaXMgcnVubmluZyBpbiBpbnNlY3VyZSBtb2RlLiBTdXBwbHkgYSBhdXRoVXJsIHRvIHJ1biBpbiBzZWN1cmUgbW9kZS4nKTtcbiAgICAgICAgY2VDb25maWcuaW5zZWN1cmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHRocm93RXJyb3IgPSBmdW5jdGlvbihzZWxmLCBjYiwga2V5LCBjZUVycm9yLCBwYXlsb2FkID0ge30pIHtcblxuICAgICAgICBpZihjZUNvbmZpZy50aHJvd0Vycm9ycykge1xuICAgICAgICAgICAgLy8gdGhyb3cgY2VFcnJvcjtcbiAgICAgICAgICAgIHRocm93IGNlRXJyb3I7XG4gICAgICAgIH1cblxuICAgICAgICBwYXlsb2FkLmNlRXJyb3IgPSBjZUVycm9yLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgc2VsZltjYl0oWyckJywgJ2Vycm9yJywga2V5XS5qb2luKCcuJyksIHBheWxvYWQpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBUaGUge0BsaW5rIENoYXRFbmdpbmV9IG9iamVjdCBpcyBhIFJvb3RFbWl0dGVyLiBDb25maWd1cmVzIGFuIGV2ZW50IGVtaXR0ZXIgdGhhdCBvdGhlciBDaGF0RW5naW5lIG9iamVjdHMgaW5oZXJpdC4gQWRkcyBzaG9ydGN1dCBtZXRob2RzIGZvclxuICAgICogYGBgdGhpcy5vbigpYGBgLCBgYGB0aGlzLmVtaXQoKWBgYCwgZXRjLlxuICAgICovXG4gICAgY2xhc3MgUm9vdEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIENyZWF0ZSBhIG5ldyBFdmVudEVtaXR0ZXIyIG9iamVjdCBmb3IgdGhpcyBjbGFzcy5cblxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyMih7XG4gICAgICAgICAgICAgIHdpbGRjYXJkOiB0cnVlLFxuICAgICAgICAgICAgICBuZXdMaXN0ZW5lcjogdHJ1ZSxcbiAgICAgICAgICAgICAgbWF4TGlzdGVuZXJzOiA1MCxcbiAgICAgICAgICAgICAgdmVyYm9zZU1lbW9yeUxlYWs6IHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB3ZSBiaW5kIHRvIG1ha2Ugc3VyZSB3aWxkY2FyZHMgd29ya1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FzeW5jbHkvRXZlbnRFbWl0dGVyMi9pc3N1ZXMvMTg2XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgUHJpdmF0ZSBlbWl0IG1ldGhvZCB0aGF0IGJyb2FkY2FzdHMgdGhlIGV2ZW50IHRvIGxpc3RlbmVycyBvbiB0aGlzIHBhZ2UuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgIEBwYXJhbSB7T2JqZWN0fSB0aGUgZXZlbnQgcGF5bG9hZFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuX2VtaXQgPSB0aGlzLmVtaXR0ZXIuZW1pdC5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgTGlzdGVuIGZvciBhIHNwZWNpZmljIGV2ZW50IGFuZCBmaXJlIGEgY2FsbGJhY2sgd2hlbiBpdCdzIGVtaXR0ZWQuIFRoaXMgaXMgcmVzZXJ2ZWQgaW4gY2FzZSBgYGB0aGlzLm9uYGBgIGlzIG92ZXJ3cml0dGVuLlxuXG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWRcbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuX29uID0gdGhpcy5lbWl0dGVyLm9uLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIExpc3RlbiBmb3IgYSBzcGVjaWZpYyBldmVudCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkLiBTdXBwb3J0cyB3aWxkY2FyZCBtYXRjaGluZy5cbiAgICAgICAgICAgICogQG1ldGhvZFxuICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIEdldCBub3RpZmllZCB3aGVuZXZlciBzb21lb25lIGpvaW5zIHRoZSByb29tXG4gICAgICAgICAgICAqIG9iamVjdC5vbignZXZlbnQnLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2V2ZW50IHdhcyBmaXJlZCcpLlxuICAgICAgICAgICAgKiB9KVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBHZXQgbm90aWZpZWQgb2YgZXZlbnQuYSBhbmQgZXZlbnQuYlxuICAgICAgICAgICAgKiBvYmplY3Qub24oJ2V2ZW50LionLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ2V2ZW50LmEgb3IgZXZlbnQuYiB3YXMgZmlyZWQnKS47XG4gICAgICAgICAgICAqIH0pXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbiA9IHRoaXMuZW1pdHRlci5vbi5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBTdG9wIGEgY2FsbGJhY2sgZnJvbSBsaXN0ZW5pbmcgdG8gYW4gZXZlbnQuXG4gICAgICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uKHBheWxvYWQ7KSB7XG4gICAgICAgICAgICAqICAgIGNvbnNvbGUubG9nKCdzb21ldGhpbmcgaGFwcGVuZCEnKTtcbiAgICAgICAgICAgICogfTtcbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudCcsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICogLy8gLi4uXG4gICAgICAgICAgICAqIG9iamVjdC5vZmYoJ2V2ZW50JywgY2FsbGJhY2spO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub2ZmID0gdGhpcy5lbWl0dGVyLm9mZi5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGFueSBldmVudCBvbiB0aGlzIG9iamVjdCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkXG4gICAgICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIGFueSBldmVudCBpcyBlbWl0dGVkLiBGaXJzdCBwYXJhbWV0ZXIgaXMgdGhlIGV2ZW50IG5hbWUgYW5kIHNlY29uZCBpcyB0aGUgcGF5bG9hZC5cbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogb2JqZWN0Lm9uQW55KChldmVudCwgcGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ0FsbCBldmVudHMgdHJpZ2dlciB0aGlzLicpO1xuICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uQW55ID0gdGhpcy5lbWl0dGVyLm9uQW55LmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIExpc3RlbiBmb3IgYW4gZXZlbnQgYW5kIG9ubHkgZmlyZSB0aGUgY2FsbGJhY2sgYSBzaW5nbGUgdGltZVxuICAgICAgICAgICAgKiBAbWV0aG9kXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gcnVuIG9uY2VcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogb2JqZWN0Lm9uY2UoJ21lc3NhZ2UnLCA9PiAoZXZlbnQsIHBheWxvYWQpIHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdUaGlzIGlzIG9ubHkgZmlyZWQgb25jZSEnKTtcbiAgICAgICAgICAgICogfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbmNlID0gdGhpcy5lbWl0dGVyLm9uY2UuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgIFJlcHJlc2VudHMgYW4gZXZlbnQgdGhhdCBtYXkgYmUgZW1pdHRlZCBvciBzdWJzY3JpYmVkIHRvLlxuICAgICovXG4gICAgY2xhc3MgRXZlbnQge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGNoYXQsIGV2ZW50KSB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgRXZlbnRzIGFyZSBhbHdheXMgYSBwcm9wZXJ0eSBvZiBhIHtAbGluayBDaGF0fS4gUmVzcG9uc2libGUgZm9yXG4gICAgICAgICAgICBsaXN0ZW5pbmcgdG8gc3BlY2lmaWMgZXZlbnRzIGFuZCBmaXJpbmcgZXZlbnRzIHdoZW4gdGhleSBvY2N1ci5cbjtcbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgQHR5cGUgU3RyaW5nXG4gICAgICAgICAgICBAc2VlIFtQdWJOdWIgQ2hhbm5lbHNdKGh0dHBzOi8vc3VwcG9ydC5wdWJudWIuY29tL3N1cHBvcnQvc29sdXRpb25zL2FydGljbGVzLzE0MDAwMDQ1MTgyLXdoYXQtaXMtYS1jaGFubmVsLSlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGF0LmNoYW5uZWw7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgUHVibGlzaGVzIHRoZSBldmVudCBvdmVyIHRoZSBQdWJOdWIgbmV0d29yayB0byB0aGUge0BsaW5rIEV2ZW50fSBjaGFubmVsXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2ggPSAobSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbS5ldmVudCA9IGV2ZW50O1xuXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIucHVibGlzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG0sXG4gICAgICAgICAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbFxuICAgICAgICAgICAgICAgIH0sIChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc3RhdHVzLnN0YXR1c0NvZGUgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0LnRyaWdnZXIoJyQucHVibGlzaC5zdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIHB1Ymxpc2hpbmcgb3ZlciB0aGUgUHViTnViIG5ldHdvcmsuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cImVycm9yXCIuXCJwdWJsaXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcihjaGF0LCAndHJpZ2dlcicsICdwdWJsaXNoJywgbmV3IEVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIHB1Ymxpc2hpbmcgb3ZlciB0aGUgUHViTnViIG5ldHdvcmsuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHN0YXR1cy5lcnJvckRhdGEucmVzcG9uc2UudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc3RhdHVzLmVycm9yRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgRm9yd2FyZHMgZXZlbnRzIHRvIHRoZSBDaGF0IHRoYXQgcmVnaXN0ZXJlZCB0aGUgZXZlbnQge0BsaW5rIENoYXR9XG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZSA9IChtKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLmNoYW5uZWwgPT0gbS5jaGFubmVsICYmIG0ubWVzc2FnZS5ldmVudCA9PSBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjaGF0LnRyaWdnZXIobS5tZXNzYWdlLmV2ZW50LCBtLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjYWxsIG9uTWVzc2FnZSB3aGVuIFB1Yk51YiByZWNlaXZlcyBhbiBldmVudFxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMub25NZXNzYWdlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICBBbiBDaGF0RW5naW5lIGdlbmVyaWMgZW1pdHRlciB0aGF0IHN1cHBvcnRzIHBsdWdpbnMgYW5kIGZvcndhcmRzXG4gICAgZXZlbnRzIHRvIHRoZSByb290IGVtaXR0ZXIuXG4gICAgQGV4dGVuZHMgUm9vdEVtaXR0ZXJcbiAgICAqL1xuICAgIGNsYXNzIEVtaXR0ZXIgZXh0ZW5kcyBSb290RW1pdHRlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgRW1pdCBldmVudHMgbG9jYWxseS5cblxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9lbWl0ID0gKGV2ZW50LCBkYXRhKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBhbGwgZXZlbnRzIGFyZSBmb3J3YXJkZWQgdG8gQ2hhdEVuZ2luZSBvYmplY3RcbiAgICAgICAgICAgICAgICAvLyBzbyB5b3UgY2FuIGdsb2JhbGx5IGJpbmQgdG8gZXZlbnRzIHdpdGggQ2hhdEVuZ2luZS5vbigpXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5fZW1pdChldmVudCwgZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBlbWl0IHRoZSBldmVudCBmcm9tIHRoZSBvYmplY3QgdGhhdCBjcmVhdGVkIGl0XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGEgc3BlY2lmaWMgZXZlbnQgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZC4gU3VwcG9ydHMgd2lsZGNhcmQgbWF0Y2hpbmcuXG4gICAgICAgICAgICAqIEBtZXRob2RcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgZXZlbnQgaXMgZW1pdHRlZFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBHZXQgbm90aWZpZWQgd2hlbmV2ZXIgc29tZW9uZSBqb2lucyB0aGUgcm9vbVxuICAgICAgICAgICAgKiBvYmplY3Qub24oJ2V2ZW50JywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudCB3YXMgZmlyZWQnKS5cbiAgICAgICAgICAgICogfSlcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gR2V0IG5vdGlmaWVkIG9mIGV2ZW50LmEgYW5kIGV2ZW50LmJcbiAgICAgICAgICAgICogb2JqZWN0Lm9uKCdldmVudC4qJywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdldmVudC5hIG9yIGV2ZW50LmIgd2FzIGZpcmVkJykuO1xuICAgICAgICAgICAgKiB9KVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub24gPSAoZXZlbnQsIGNiKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIGFsbCBldmVudHMgb24gdGhpcyBlbWl0dGVyXG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gdGhpcy5ldmVudHNbZXZlbnRdIHx8IG5ldyBFdmVudCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICAvLyBjYWxsIHRoZSBwcml2YXRlIF9vbiBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHRoaXMuX29uKGV2ZW50LCBjYik7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgU3RvcmVzIGEgbGlzdCBvZiBwbHVnaW5zIGJvdW5kIHRvIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMucGx1Z2lucyA9IFtdO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgIEJpbmRzIGEgcGx1Z2luIHRvIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gbW9kdWxlIFRoZSBwbHVnaW4gbW9kdWxlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblxuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGlzIHBsdWdpbiB0byBhIGxpc3Qgb2YgcGx1Z2lucyBmb3IgdGhpcyBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnMucHVzaChtb2R1bGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJucyB0aGUgbmFtZSBvZiB0aGlzIGNsYXNzXG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcblxuICAgICAgICAgICAgICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgcGx1Z2lucyB0byBhdHRhY2ggdG8gdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgIGlmKG1vZHVsZS5leHRlbmRzICYmIG1vZHVsZS5leHRlbmRzW2NsYXNzTmFtZV0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHBsdWdpbnMgdG8gdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAvLyB1bmRlciB0aGVpciBuYW1lc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGlsZCh0aGlzLCBtb2R1bGUubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG1vZHVsZS5leHRlbmRzW2NsYXNzTmFtZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uQ2hhdEVuZ2luZSA9IENoYXRFbmdpbmU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHBsdWdpbiBoYXMgYSBzcGVjaWFsIGNvbnN0cnVjdCBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBydW4gaXRcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpc1ttb2R1bGUubmFtZXNwYWNlXS5jb25zdHJ1Y3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uY29uc3RydWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgVGhpcyBpcyB0aGUgcm9vdCB7QGxpbmsgQ2hhdH0gY2xhc3MgdGhhdCByZXByZXNlbnRzIGEgY2hhdCByb29tXG5cbiAgICBAcGFyYW0ge1N0cmluZ30gW2NoYW5uZWw9bmV3IERhdGUoKS5nZXRUaW1lKCldIEEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgY2hhdCB7QGxpbmsgQ2hhdH0uIFRoZSBjaGFubmVsIGlzIHRoZSB1bmlxdWUgbmFtZSBvZiBhIHtAbGluayBDaGF0fSwgYW5kIGlzIHVzdWFsbHkgc29tZXRoaW5nIGxpa2UgXCJUaGUgV2F0ZXJjb29sZXJcIiwgXCJTdXBwb3J0XCIsIG9yIFwiT2ZmIFRvcGljXCIuIFNlZSBbUHViTnViIENoYW5uZWxzXShodHRwczovL3N1cHBvcnQucHVibnViLmNvbS9zdXBwb3J0L3NvbHV0aW9ucy9hcnRpY2xlcy8xNDAwMDA0NTE4Mi13aGF0LWlzLWEtY2hhbm5lbC0pLlxuICAgIEBwYXJhbSB7Qm9vbGVhbn0gW2F1dG9Db25uZWN0PXRydWVdIENvbm5lY3QgdG8gdGhpcyBjaGF0IGFzIHNvb24gYXMgaXRzIGluaXRpYXRlZC4gSWYgc2V0IHRvIGBgYGZhbHNlYGBgLCBjYWxsIHRoZSB7QGxpbmsgQ2hhdCNjb25uZWN0fSBtZXRob2QgdG8gY29ubmVjdCB0byB0aGlzIHtAbGluayBDaGF0fS5cbiAgICBAcGFyYW0ge0Jvb2xlYW59IFtuZWVkR3JhbnQ9dHJ1ZV0gVGhpcyBDaGF0IGhhcyByZXN0cmljdGVkIHBlcm1pc3Npb25zIGFuZCB3ZSBuZWVkIHRvIGF1dGhlbnRpY2F0ZSBvdXJzZWx2ZXMgaW4gb3JkZXIgdG8gY29ubmVjdC5cbiAgICBAZXh0ZW5kcyBFbWl0dGVyXG4gICAgQGZpcmVzIENoYXQjJFwiLlwicmVhZHlcbiAgICBAZmlyZXMgQ2hhdCMkXCIuXCJzdGF0ZVxuICAgIEBmaXJlcyBDaGF0IyRcIi5cIm9ubGluZVxuICAgIEBmaXJlcyBDaGF0IyRcIi5cIm9mZmxpbmVcbiAgICAqL1xuICAgIGNsYXNzIENoYXQgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjaGFubmVsID0gbmV3IERhdGUoKS5nZXRUaW1lKCksIG5lZWRHcmFudCA9IHRydWUsIGF1dG9Db25uZWN0ID0gdHJ1ZSwgZ3JvdXAgPSAnZGVmYXVsdCcpIHtcblxuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgaWYoY2VDb25maWcuaW5zZWN1cmUpIHtcbiAgICAgICAgICAgICAgICBuZWVkR3JhbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEEgc3RyaW5nIGlkZW50aWZpZXIgZm9yIHRoZSBDaGF0IHJvb20uXG4gICAgICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICAgICogQHNlZSBbUHViTnViIENoYW5uZWxzXShodHRwczovL3N1cHBvcnQucHVibnViLmNvbS9zdXBwb3J0L3NvbHV0aW9ucy9hcnRpY2xlcy8xNDAwMDA0NTE4Mi13aGF0LWlzLWEtY2hhbm5lbC0pXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBsZXQgY2hhblByaXZTdHJpbmcgPSAncHVibGljLic7XG4gICAgICAgICAgICBpZihuZWVkR3JhbnQpIHtcbiAgICAgICAgICAgICAgICBjaGFuUHJpdlN0cmluZyA9ICdwcml2YXRlLic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMuY2hhbm5lbC5pbmRleE9mKGNlQ29uZmlnLmdsb2JhbENoYW5uZWwpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gW2NlQ29uZmlnLmdsb2JhbENoYW5uZWwsICdjaGF0JywgY2hhblByaXZTdHJpbmcsIGNoYW5uZWxdLmpvaW4oJyMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pc1ByaXZhdGUgPSBuZWVkR3JhbnQ7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBBIGxpc3Qgb2YgdXNlcnMgaW4gdGhpcyB7QGxpbmsgQ2hhdH0uIEF1dG9tYXRpY2FsbHkga2VwdCBpbiBzeW5jIGFzIHVzZXJzIGpvaW4gYW5kIGxlYXZlIHRoZSBjaGF0LlxuICAgICAgICAgICAgVXNlIFskLmpvaW5dKC9DaGF0Lmh0bWwjZXZlbnQ6JCUyNTIyLiUyNTIyam9pbikgYW5kIHJlbGF0ZWQgZXZlbnRzIHRvIGdldCBub3RpZmllZCB3aGVuIHRoaXMgY2hhbmdlc1xuXG4gICAgICAgICAgICBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudXNlcnMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBBIG1hcCBvZiB7QGxpbmsgRXZlbnR9IGJvdW5kIHRvIHRoaXMge0BsaW5rIENoYXR9XG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZXZlbnRzID0ge31cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBVcGRhdGVzIGxpc3Qgb2Yge0BsaW5rIFVzZXJ9cyBpbiB0aGlzIHtAbGluayBDaGF0fVxuICAgICAgICAgICAgYmFzZWQgb24gd2hvIGlzIG9ubGluZSBub3cuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAcGFyYW0ge09iamVjdH0gc3RhdHVzIFRoZSByZXNwb25zZSBzdGF0dXNcbiAgICAgICAgICAgIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uSGVyZU5vdyA9IChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZihzdGF0dXMuZXJyb3IpIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHRoZSBwcmVzZW5jZSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwicHJlc2VuY2VcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcih0aGlzLCAndHJpZ2dlcicsICdwcmVzZW5jZScsIG5ldyBFcnJvcignR2V0dGluZyBwcmVzZW5jZSBvZiB0aGlzIENoYXQuIE1ha2Ugc3VyZSBQdWJOdWIgcHJlc2VuY2UgaXMgZW5hYmxlZCBmb3IgdGhpcyBrZXknKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvckRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHN0YXR1cy5lcnJvckRhdGEucmVzcG9uc2UudGV4dFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9jY3VwYW50cyBpbiB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9jY3VwYW50cyA9IHJlc3BvbnNlLmNoYW5uZWxzW3RoaXMuY2hhbm5lbF0ub2NjdXBhbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCB0aGUgdXNlckxpc3QgZm9yIHJsdG0uanMgc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIG9jY3VwYW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKG9jY3VwYW50c1tpXS51dWlkLCBvY2N1cGFudHNbaV0uc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBHZXQgbWVzc2FnZXMgdGhhdCBoYXZlIGJlZW4gcHVibGlzaGVkIHRvIHRoZSBuZXR3b3JrIGJlZm9yZSB0aGlzIGNsaWVudCB3YXMgY29ubmVjdGVkLlxuICAgICAgICAgICAgKiBFdmVudHMgYXJlIHB1Ymxpc2hlZCB3aXRoIHRoZSBgYGAkaGlzdG9yeWBgYCBwcmVmaXguIFNvIGZvciBleGFtcGxlLCBpZiB5b3UgaGFkIHRoZSBldmVudCBgYGBtZXNzYWdlYGBgLFxuICAgICAgICAgICAgKiB5b3Ugd291bGQgY2FsbCBgYGBDaGF0Lmhpc3RvcnkoJ21lc3NhZ2UnKWBgYCBhbmQgc3Vic2NyaWJlIHRvIGhpc3RvcnkgZXZlbnRzIHZpYSBgYGBjaGF0Lm9uKCckaGlzdG9yeS5tZXNzYWdlJywgKGRhdGEpID0+IHt9KWBgYC5cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudCB3ZSdyZSBnZXR0aW5nIGhpc3RvcnkgZm9yXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnXSBUaGUgUHViTnViIGhpc3RvcnkgY29uZmlnIGZvciB0aGlzIGNhbGxcbiAgICAgICAgICAgICogQHR1dG9yaWFsIGhpc3RvcnlcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkgPSAoZXZlbnQsIGNvbmZpZyA9IHt9KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdGhlIGV2ZW50IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gdGhpcy5ldmVudHNbZXZlbnRdIHx8IG5ldyBFdmVudCh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIFB1Yk51YiBjb25maWd1cmVkIGNoYW5uZWwgdG8gdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSB0aGlzLmV2ZW50c1tldmVudF0uY2hhbm5lbDtcblxuICAgICAgICAgICAgICAgIC8vIHJ1biB0aGUgUHViTnViIGhpc3RvcnkgbWV0aG9kIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuaGlzdG9yeShjb25maWcsIChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc3RhdHVzLmVycm9yKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIHRoZSBoaXN0b3J5IG9mIHRoaXMgY2hhdFxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJlcnJvclwiLlwiaGlzdG9yeVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnaGlzdG9yeScsIG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyB0aGUgaGlzdG9yeS4gTWFrZSBzdXJlIGhpc3RvcnkgaXMgZW5hYmxlZCBmb3IgdGhpcyBQdWJOdWIga2V5LicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBzdGF0dXMuZXJyb3JEYXRhLnJlc3BvbnNlLnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLm1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1lc3NhZ2UuZW50cnkuZXZlbnQgPT0gZXZlbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlZCBieSB0aGUge0BsaW5rIENoYXQjaGlzdG9yeX0gY2FsbC4gRW1pdHMgb2xkIGV2ZW50cyBhZ2Fpbi4gRXZlbnRzIGFyZSBwcmVwZW5kZWQgd2l0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGBgYCQuaGlzdG9yeS5gYGAgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSB0aGUgb3JpZ2luYWwgbGl2ZSBldmVudHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwiaGlzdG9yeVwiLlwiKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEB0dXRvcmlhbCBoaXN0b3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFsnJCcsICdoaXN0b3J5JywgZXZlbnRdLmpvaW4oJy4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuZW50cnkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9iamVjdGlmeSA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHRoaXMuZ3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRoaXMuaXNQcml2YXRlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBJbnZpdGUgYSB1c2VyIHRvIHRoaXMgQ2hhdC4gQXV0aG9yaXplcyB0aGUgaW52aXRlZCB1c2VyIGluIHRoZSBDaGF0IGFuZCBzZW5kcyB0aGVtIGFuIGludml0ZSB2aWEge0BsaW5rIFVzZXIjZGlyZWN0fS5cbiAgICAgICAgICAgICogQHBhcmFtIHtVc2VyfSB1c2VyIFRoZSB7QGxpbmsgVXNlcn0gdG8gaW52aXRlIHRvIHRoaXMgY2hhdHJvb20uXG4gICAgICAgICAgICAqIEBmaXJlcyBNZSNldmVudDokXCIuXCJpbnZpdGVcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICogLy8gb25lIHVzZXIgcnVubmluZyBDaGF0RW5naW5lXG4gICAgICAgICAgICAqIGxldCBzZWNyZXRDaGF0ID0gbmV3IENoYXRFbmdpbmUuQ2hhdCgnc2VjcmV0LWNoYW5uZWwnKTtcbiAgICAgICAgICAgICogc2VjcmV0Q2hhdC5pbnZpdGUoc29tZW9uZUVsc2UpO1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiAvLyBzb21lb25lRWxzZSBpbiBhbm90aGVyIGluc3RhbmNlIG9mIENoYXRFbmdpbmVcbiAgICAgICAgICAgICogbWUuZGlyZWN0Lm9uKCckLmludml0ZScsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAqICAgICBsZXQgc2VjcmV0Q2hhdCA9IG5ldyBDaGF0RW5naW5lLkNoYXQocGF5bG9hZC5kYXRhLmNoYW5uZWwpO1xuICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmludml0ZSA9ICh1c2VyKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgY29tcGxldGUgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBOb3RpZmllcyB7QGxpbmsgTWV9IHRoYXQgdGhleSd2ZSBiZWVuIGludml0ZWQgdG8gYSBuZXcgcHJpdmF0ZSB7QGxpbmsgQ2hhdH0uXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEZpcmVkIGJ5IHRoZSB7QGxpbmsgQ2hhdCNpbnZpdGV9IG1ldGhvZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IE1lIyRcIi5cImludml0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAdHV0b3JpYWwgcHJpdmF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICAgICAgICAgKiBtZS5kaXJlY3Qub24oJyQuaW52aXRlJywgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICogICAgbGV0IHByaXZDaGF0ID0gbmV3IENoYXRFbmdpbmUuQ2hhdChwYXlsb2FkLmRhdGEuY2hhbm5lbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmRpcmVjdC5lbWl0KCckLmludml0ZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZighdXNlci5kaXJlY3QuY29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmRpcmVjdC5jb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmRpcmVjdC5vbignJC5jb25uZWN0ZWQnLCBzZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoY2VDb25maWcuaW5zZWN1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGF4aW9zLnBvc3QoY2VDb25maWcuYXV0aFVybCArICcvY2hhdC9pbnZpdGUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoS2V5OiBwbkNvbmZpZy5hdXRoS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogdXNlci51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXlVVUlEOiBDaGF0RW5naW5lLm1lLnV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoRGF0YTogQ2hhdEVuZ2luZS5tZS5hdXRoRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXQ6IHRoaXMub2JqZWN0aWZ5KClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnYXV0aCcsIG5ldyBFcnJvcignU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgbWFraW5nIGEgcmVxdWVzdCB0byBhdXRoZW50aWNhdGlvbiBzZXJ2ZXIuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBLZWVwIHRyYWNrIG9mIHtAbGluayBVc2VyfXMgaW4gdGhlIHJvb20gYnkgc3Vic2NyaWJpbmcgdG8gUHViTnViIHByZXNlbmNlIGV2ZW50cy5cblxuICAgICAgICAgICAgQHByaXZhdGVcbiAgICAgICAgICAgIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBQdWJOdWIgcHJlc2VuY2UgcmVzcG9uc2UgZm9yIHRoaXMgZXZlbnRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uUHJlc2VuY2UgPSAocHJlc2VuY2VFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIGNoYW5uZWwgbWF0Y2hlcyB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICBpZih0aGlzLmNoYW5uZWwgPT0gcHJlc2VuY2VFdmVudC5jaGFubmVsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBqb2lucyBjaGFubmVsXG4gICAgICAgICAgICAgICAgICAgIGlmKHByZXNlbmNlRXZlbnQuYWN0aW9uID09IFwiam9pblwiKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1c2VyID0gdGhpcy5jcmVhdGVVc2VyKHByZXNlbmNlRXZlbnQudXVpZCwgcHJlc2VuY2VFdmVudC5zdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBGaXJlZCB3aGVuIGEge0BsaW5rIFVzZXJ9IGhhcyBqb2luZWQgdGhlIHJvb20uXG4gICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cIm9ubGluZVwiLlwiam9pblxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgcGF5bG9hZCByZXR1cm5lZCBieSB0aGUgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtVc2VyfSBkYXRhLnVzZXIgVGhlIHtAbGluayBVc2VyfSB0aGF0IGNhbWUgb25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAqIGNoYXQub24oJyQuam9pbicsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVXNlciBoYXMgam9pbmVkIHRoZSByb29tIScsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5vbmxpbmUuam9pbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiB1c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBsZWF2ZXMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcImxlYXZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlckxlYXZlKHByZXNlbmNlRXZlbnQudXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIHRpbWVzb3V0XG4gICAgICAgICAgICAgICAgICAgIGlmKHByZXNlbmNlRXZlbnQuYWN0aW9uID09IFwidGltZW91dFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJEaXNjb25uZWN0KHByZXNlbmNlRXZlbnQudXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lJ3Mgc3RhdGUgaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcInN0YXRlLWNoYW5nZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJVcGRhdGUocHJlc2VuY2VFdmVudC51dWlkLCBwcmVzZW5jZUV2ZW50LnN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJvb2xlYW4gdmFsdWUgdGhhdCBpbmRpY2F0ZXMgb2YgdGhlIENoYXQgaXMgY29ubmVjdGVkIHRvIHRoZSBuZXR3b3JrXG4gICAgICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uUHJlcCA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmNvbm5lY3RlZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCFDaGF0RW5naW5lLnB1Ym51Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcih0aGlzLCAndHJpZ2dlcicsICdzZXR1cCcsIG5ldyBFcnJvcignWW91IG11c3QgY2FsbCBDaGF0RW5naW5lLmNvbm5lY3QoKSBhbmQgd2FpdCBmb3IgdGhlICQucmVhZHkgZXZlbnQgYmVmb3JlIGNyZWF0aW5nIG5ldyBDaGF0cy4nKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBsaXN0ZW4gdG8gYWxsIFB1Yk51YiBldmVudHMgZm9yIHRoaXMgQ2hhdFxuICAgICAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm9uTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiB0aGlzLm9uUHJlc2VuY2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc3Vic2NyaWJlIHRvIHRoZSBQdWJOdWIgY2hhbm5lbCBmb3IgdGhpcyBDaGF0XG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3aXRoUHJlc2VuY2U6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdyYW50ID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IGNyZWF0ZUNoYXQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgYXhpb3MucG9zdChjZUNvbmZpZy5hdXRoVXJsICsgJy9jaGF0cycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbENoYW5uZWw6IGNlQ29uZmlnLmdsb2JhbENoYW5uZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoS2V5OiBwbkNvbmZpZy5hdXRoS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogcG5Db25maWcudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhEYXRhOiBDaGF0RW5naW5lLm1lLmF1dGhEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdDogdGhpcy5vYmplY3RpZnkoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25QcmVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dFcnJvcih0aGlzLCAndHJpZ2dlcicsICdhdXRoJywgbmV3IEVycm9yKCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBtYWtpbmcgYSByZXF1ZXN0IHRvIGF1dGhlbnRpY2F0aW9uIHNlcnZlci4nKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZihjZUNvbmZpZy5pbnNlY3VyZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ2hhdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgYXhpb3MucG9zdChjZUNvbmZpZy5hdXRoVXJsICsgJy9jaGF0L2dyYW50Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsQ2hhbm5lbDogY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhLZXk6IHBuQ29uZmlnLmF1dGhLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBwbkNvbmZpZy51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE6IENoYXRFbmdpbmUubWUuYXV0aERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0OiB0aGlzLm9iamVjdGlmeSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ2hhdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IodGhpcywgJ3RyaWdnZXInLCAnYXV0aCcsIG5ldyBFcnJvcignU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgbWFraW5nIGEgcmVxdWVzdCB0byBhdXRoZW50aWNhdGlvbiBzZXJ2ZXIuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBDb25uZWN0IHRvIFB1Yk51YiBzZXJ2ZXJzIHRvIGluaXRpYWxpemUgdGhlIGNoYXQuXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIC8vIGNyZWF0ZSBhIG5ldyBjaGF0cm9vbSwgYnV0IGRvbid0IGNvbm5lY3QgdG8gaXQgYXV0b21hdGljYWxseVxuICAgICAgICAgICAgKiBsZXQgY2hhdCA9IG5ldyBDaGF0KCdzb21lLWNoYXQnLCBmYWxzZSlcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gY29ubmVjdCB0byB0aGUgY2hhdCB3aGVuIHdlIGZlZWwgbGlrZSBpdFxuICAgICAgICAgICAgKiBjaGF0LmNvbm5lY3QoKTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFudCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYoYXV0b0Nvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyYW50KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIENoYXRFbmdpbmUuY2hhdHNbdGhpcy5jaGFubmVsXSA9IHRoaXM7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFNlbmQgZXZlbnRzIHRvIG90aGVyIGNsaWVudHMgaW4gdGhpcyB7QGxpbmsgVXNlcn0uXG4gICAgICAgICogRXZlbnRzIGFyZSB0cmlnZ2VyIG92ZXIgdGhlIG5ldHdvcmsgIGFuZCBhbGwgZXZlbnRzIGFyZSBtYWRlXG4gICAgICAgICogb24gYmVoYWxmIG9mIHtAbGluayBNZX1cbiAgICAgICAgKlxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBldmVudCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICogY2hhdC5lbWl0KCdjdXN0b20tZXZlbnQnLCB7dmFsdWU6IHRydWV9KTtcbiAgICAgICAgKiBjaGF0Lm9uKCdjdXN0b20tZXZlbnQnLCAocGF5bG9hZCkgPT4ge1xuICAgICAgICAqICAgICBjb25zb2xlLmxvZyhwYXlsb2FkLnNlbmRlci51dWlkLCAnZW1pdHRlZCB0aGUgdmFsdWUnLCBwYXlsb2FkLmRhdGEudmFsdWUpO1xuICAgICAgICAqIH0pO1xuICAgICAgICAqL1xuICAgICAgICBlbWl0KGV2ZW50LCBkYXRhKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHN0YW5kYXJkaXplZCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB7XG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSwgICAgICAgICAgICAvLyB0aGUgZGF0YSBzdXBwbGllZCBmcm9tIHBhcmFtc1xuICAgICAgICAgICAgICAgIHNlbmRlcjogQ2hhdEVuZ2luZS5tZS51dWlkLCAgIC8vIG15IG93biB1dWlkXG4gICAgICAgICAgICAgICAgY2hhdDogdGhpcywgICAgICAgICAgICAvLyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHJ1biB0aGUgcGx1Z2luIHF1ZXVlIHRvIG1vZGlmeSB0aGUgZXZlbnRcbiAgICAgICAgICAgIHRoaXMucnVuUGx1Z2luUXVldWUoJ2VtaXQnLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNoYXQgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIHNlcmlhbGl6ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkLCBpdCdzIHJlYnVpbHQgb24gdGhlIG90aGVyIGVuZC5cbiAgICAgICAgICAgICAgICAvLyBzZWUgdGhpcy50cmlnZ2VyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2hhdDtcblxuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2ggdGhlIGV2ZW50IGFuZCBkYXRhIG92ZXIgdGhlIGNvbmZpZ3VyZWQgY2hhbm5lbFxuXG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoZSBldmVudCBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0gfHwgbmV3IEV2ZW50KHRoaXMsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5wdWJsaXNoKHBheWxvYWQpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIEJyb2FkY2FzdHMgYW4gZXZlbnQgbG9jYWxseSB0byBhbGwgbGlzdGVuZXJzLlxuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICBAcGFyYW0ge09iamVjdH0gcGF5bG9hZCBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgKi9cbiAgICAgICAgdHJpZ2dlcihldmVudCwgcGF5bG9hZCkge1xuXG4gICAgICAgICAgICBpZih0eXBlb2YgcGF5bG9hZCA9PSBcIm9iamVjdFwiKSB7XG5cbiAgICAgICAgICAgICAgICAvLyByZXN0b3JlIGNoYXQgaW4gcGF5bG9hZFxuICAgICAgICAgICAgICAgIGlmKCFwYXlsb2FkLmNoYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5jaGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0dXJuIGEgdXVpZCBmb3VuZCBpbiBwYXlsb2FkLnNlbmRlciB0byBhIHJlYWwgdXNlclxuICAgICAgICAgICAgICAgIGlmKHBheWxvYWQuc2VuZGVyICYmIENoYXRFbmdpbmUudXNlcnNbcGF5bG9hZC5zZW5kZXJdKSB7XG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuc2VuZGVyID0gQ2hhdEVuZ2luZS51c2Vyc1twYXlsb2FkLnNlbmRlcl07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGxldCBwbHVnaW5zIG1vZGlmeSB0aGUgZXZlbnRcbiAgICAgICAgICAgIHRoaXMucnVuUGx1Z2luUXVldWUoJ29uJywgZXZlbnQsIChuZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCBwYXlsb2FkKTtcbiAgICAgICAgICAgIH0sIChlcnIsIHBheWxvYWQpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIGVtaXQgdGhpcyBldmVudCB0byBhbnkgbGlzdGVuZXJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbWl0KGV2ZW50LCBwYXlsb2FkKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBBZGQgYSB1c2VyIHRvIHRoZSB7QGxpbmsgQ2hhdH0sIGNyZWF0aW5nIGl0IGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBleGlzdC5cblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXNlciB1dWlkXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgdXNlciBpbml0aWFsIHN0YXRlXG4gICAgICAgIEBwYXJhbSB7Qm9vbGVhbn0gdHJpZ2dlciBGb3JjZSBhIHRyaWdnZXIgdGhhdCB0aGlzIHVzZXIgaXMgb25saW5lXG4gICAgICAgICovXG4gICAgICAgIGNyZWF0ZVVzZXIodXVpZCwgc3RhdGUpIHtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhpcyB1c2VyIGV4aXN0cyBpbiB0aGUgZ2xvYmFsIGxpc3RcbiAgICAgICAgICAgIC8vIHNvIHdlIGNhbiByZWZlcmVuY2UgaXQgZnJvbSBoZXJlIG91dFxuICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IENoYXRFbmdpbmUudXNlcnNbdXVpZF0gfHwgbmV3IFVzZXIodXVpZCk7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGlzIGNoYXRyb29tIHRvIHRoZSB1c2VyJ3MgbGlzdCBvZiBjaGF0c1xuICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXS5hZGRDaGF0KHRoaXMsIHN0YXRlKTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgam9pbiBldmVudCBvdmVyIHRoaXMgY2hhdHJvb21cbiAgICAgICAgICAgIGlmKCF0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIEJyb2FkY2FzdCB0aGF0IGEge0BsaW5rIFVzZXJ9IGhhcyBjb21lIG9ubGluZS4gVGhpcyBpcyB3aGVuXG4gICAgICAgICAgICAgICAgKiB0aGUgZnJhbWV3b3JrIGZpcnN0cyBsZWFybiBvZiBhIHVzZXIuIFRoaXMgY2FuIGJlIHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICogYnksIGBgYCQuam9pbmBgYCwgb3Igb3RoZXIgbmV0d29yayBldmVudHMgdGhhdFxuICAgICAgICAgICAgICAgICogbm90aWZ5IHRoZSBmcmFtZXdvcmsgb2YgYSBuZXcgdXNlci5cbiAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvbmxpbmVcIi5cImhlcmVcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBwYXlsb2FkIHJldHVybmVkIGJ5IHRoZSBldmVudFxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtVc2VyfSBkYXRhLnVzZXIgVGhlIHtAbGluayBVc2VyfSB0aGF0IGNhbWUgb25saW5lXG4gICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICogY2hhdC5vbignJC5vbmxpbmUuaGVyZScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgaGFzIGNvbWUgb25saW5lOicsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5vbmxpbmUuaGVyZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoaXMgdXNlciBpbiB0aGUgY2hhdHJvb21cbiAgICAgICAgICAgIHRoaXMudXNlcnNbdXVpZF0gPSBDaGF0RW5naW5lLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIGluc3RhbmNlIG9mIHRoaXMgdXNlclxuICAgICAgICAgICAgcmV0dXJuIENoYXRFbmdpbmUudXNlcnNbdXVpZF07XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFVwZGF0ZSBhIHVzZXIncyBzdGF0ZSB3aXRoaW4gdGhpcyB7QGxpbmsgQ2hhdH0uXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUge0BsaW5rIFVzZXJ9IHV1aWRcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgU3RhdGUgdG8gdXBkYXRlIGZvciB0aGUgdXNlclxuICAgICAgICAqL1xuICAgICAgICB1c2VyVXBkYXRlKHV1aWQsIHN0YXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgdXNlciBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgIENoYXRFbmdpbmUudXNlcnNbdXVpZF0gPSBDaGF0RW5naW5lLnVzZXJzW3V1aWRdIHx8IG5ldyBVc2VyKHV1aWQpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBkb24ndCBrbm93IGFib3V0IHRoaXMgdXNlclxuICAgICAgICAgICAgaWYoIXRoaXMudXNlcnNbdXVpZF0pIHtcbiAgICAgICAgICAgICAgICAvLyBkbyB0aGUgd2hvbGUgam9pbiB0aGluZ1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVXNlcih1dWlkLCBzdGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiB0aGlzIGNoYXRyb29tXG4gICAgICAgICAgICB0aGlzLnVzZXJzW3V1aWRdLmFzc2lnbihzdGF0ZSwgdGhpcyk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBCcm9hZGNhc3QgdGhhdCBhIHtAbGluayBVc2VyfSBoYXMgY2hhbmdlZCBzdGF0ZS5cbiAgICAgICAgICAgICogQGV2ZW50IENoYXQjJFwiLlwic3RhdGVcbiAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgVGhlIHBheWxvYWQgcmV0dXJuZWQgYnkgdGhlIGV2ZW50XG4gICAgICAgICAgICAqIEBwYXJhbSB7VXNlcn0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBjaGFuZ2VkIHN0YXRlXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhLnN0YXRlIFRoZSBuZXcgdXNlciBzdGF0ZSBmb3IgdGhpcyBgYGBDaGF0YGBgXG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIGNoYXQub24oJyQuc3RhdGUnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgaGFzIGNoYW5nZWQgc3RhdGU6JywgZGF0YS51c2VyLCAnbmV3IHN0YXRlOicsIGRhdGEuc3RhdGUpO1xuICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQuc3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgdXNlcjogdGhpcy51c2Vyc1t1dWlkXSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy51c2Vyc1t1dWlkXS5zdGF0ZSh0aGlzKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIExlYXZlIGZyb20gdGhlIHtAbGluayBDaGF0fSBvbiBiZWhhbGYgb2Yge0BsaW5rIE1lfS5cbiAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAqIGNoYXQubGVhdmUoKTtcbiAgICAgICAgKi9cbiAgICAgICAgbGVhdmUoKSB7XG5cbiAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLnVuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBheGlvcy5kZWxldGUoY2VDb25maWcuYXV0aFVybCArICcvY2hhdHMnLCB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdsb2JhbENoYW5uZWw6IGNlQ29uZmlnLmdsb2JhbENoYW5uZWwsXG4gICAgICAgICAgICAgICAgYXV0aEtleTogcG5Db25maWcuYXV0aEtleSxcbiAgICAgICAgICAgICAgICB1dWlkOiBwbkNvbmZpZy51dWlkLFxuICAgICAgICAgICAgICAgIGF1dGhEYXRhOiBDaGF0RW5naW5lLm1lLmF1dGhEYXRhLFxuICAgICAgICAgICAgICAgIGNoYXQ6IHRoaXMub2JqZWN0aWZ5KClcbiAgICAgICAgICAgIH19KVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHRoaXMsICd0cmlnZ2VyJywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIG1ha2luZyBhIHJlcXVlc3QgdG8gY2hhdCBzZXJ2ZXIuJyksIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgUGVyZm9ybSB1cGRhdGVzIHdoZW4gYSB1c2VyIGhhcyBsZWZ0IHRoZSB7QGxpbmsgQ2hhdH0uXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgKi9cbiAgICAgICAgdXNlckxlYXZlKHV1aWQpIHtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3VzZXIgZm91bmQgYXMgbGVhdmluZycsIHRoaXMuY2hhbm5lbCwgJ3dpdGggdXVpZCcsIHV1aWQpXG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhIHVzZXIgbGVhdmVzLCB0cmlnZ2VyIHRoZSBldmVudFxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBGaXJlZCB3aGVuIGEge0BsaW5rIFVzZXJ9IGludGVudGlvbmFsbHkgbGVhdmVzIGEge0BsaW5rIENoYXR9LlxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cIm9mZmxpbmVcIi5cImxlYXZlXG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBwYXlsb2FkIGZyb20gdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge1VzZXJ9IHVzZXIgVGhlIHtAbGluayBVc2VyfSB0aGF0IGhhcyBsZWZ0IHRoZSByb29tXG4gICAgICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICAgICogY2hhdC5vbignJC5vZmZsaW5lLmxlYXZlJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAqICAgICBjb25zb2xlLmxvZygnVXNlciBsZWZ0IHRoZSByb29tIG1hbnVhbGx5OicsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5vZmZsaW5lLmxlYXZlJywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiB0aGlzLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgbG9jYWwgbGlzdCBvZiB1c2Vyc1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgcmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlIGdsb2JhbCBsaXN0LFxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhleSBtYXkgYmUgb25saW5lIGluIG90aGVyIGNoYW5uZWxzXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGF0IHVzZXIgaXNuJ3QgaW4gdGhlIHVzZXIgbGlzdFxuICAgICAgICAgICAgICAgIC8vIHdlIG5ldmVyIGtuZXcgYWJvdXQgdGhpcyB1c2VyIG9yIHRoZXkgYWxyZWFkeSBsZWZ0XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXNlciBhbHJlYWR5IGxlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBGaXJlZCB3aGVuIGEgdXNlciBkaXNjb25uZWN0cyBmcm9tIHRoZSB7QGxpbmsgQ2hhdH1cblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBvZiB0aGUge0BsaW5rIENoYXR9IHRoYXQgbGVmdFxuICAgICAgICAqL1xuICAgICAgICB1c2VyRGlzY29ubmVjdCh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIEZpcmVkIHNwZWNpZmljYWxseSB3aGVuIGEge0BsaW5rIFVzZXJ9IGxvb3NlcyBuZXR3b3JrIGNvbm5lY3Rpb25cbiAgICAgICAgICAgICAgICAqIHRvIHRoZSB7QGxpbmsgQ2hhdH0gaW52b2x1bnRhcmlseS5cbiAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdCMkXCIuXCJvZmZsaW5lXCIuXCJkaXNjb25uZWN0XG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUge0BsaW5rIFVzZXJ9IHRoYXQgZGlzY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YS51c2VyIFRoZSB7QGxpbmsgVXNlcn0gdGhhdCBkaXNjb25uZWN0ZWRcbiAgICAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgICAgKiBjaGF0Lm9uKCckLm9mZmxpbmUuZGlzY29ubmVjdCcsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgKiAgICAgY29uc29sZS5sb2coJ1VzZXIgZGlzY29ubmVjdGVkIGZyb20gdGhlIG5ldHdvcms6JywgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub2ZmbGluZS5kaXNjb25uZWN0Jywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiB0aGlzLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIExvYWQgcGx1Z2lucyBhbmQgYXR0YWNoIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIGV4ZWN1dGUgYmVmb3JlIGFuZFxuICAgICAgICBhZnRlciBldmVudHMgYXJlIHRyaWdnZXIgb3IgcmVjZWl2ZWQuXG5cbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGxvY2F0aW9uIFdoZXJlIGluIHRoZSBtaWRkbGVld2FyZSB0aGUgZXZlbnQgc2hvdWxkIHJ1biAoZW1pdCwgdHJpZ2dlcilcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBmaXJzdCBUaGUgZmlyc3QgZnVuY3Rpb24gdG8gcnVuIGJlZm9yZSB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gbGFzdCBUaGUgbGFzdCBmdW5jdGlvbiB0byBydW4gYWZ0ZXIgdGhlIHBsdWdpbnMgaGF2ZSBydW5cbiAgICAgICAgKi9cbiAgICAgICAgcnVuUGx1Z2luUXVldWUobG9jYXRpb24sIGV2ZW50LCBmaXJzdCwgbGFzdCkge1xuXG4gICAgICAgICAgICAvLyB0aGlzIGFzc2VtYmxlcyBhIHF1ZXVlIG9mIGZ1bmN0aW9ucyB0byBydW4gYXMgbWlkZGxld2FyZVxuICAgICAgICAgICAgLy8gZXZlbnQgaXMgYSB0cmlnZ2VyZWQgZXZlbnQga2V5XG4gICAgICAgICAgICBsZXQgcGx1Z2luX3F1ZXVlID0gW107XG5cbiAgICAgICAgICAgIC8vIHRoZSBmaXJzdCBmdW5jdGlvbiBpcyBhbHdheXMgcmVxdWlyZWRcbiAgICAgICAgICAgIHBsdWdpbl9xdWV1ZS5wdXNoKGZpcnN0KTtcblxuICAgICAgICAgICAgLy8gbG9vayB0aHJvdWdoIHRoZSBjb25maWd1cmVkIHBsdWdpbnNcbiAgICAgICAgICAgIGZvcihsZXQgaSBpbiB0aGlzLnBsdWdpbnMpIHtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXkgaGF2ZSBkZWZpbmVkIGEgZnVuY3Rpb24gdG8gcnVuIHNwZWNpZmljYWxseVxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGlzIGV2ZW50XG4gICAgICAgICAgICAgICAgaWYodGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVcbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dXG4gICAgICAgICAgICAgICAgICAgICYmIHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlW2xvY2F0aW9uXVtldmVudF0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5fcXVldWUucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luc1tpXS5taWRkbGV3YXJlW2xvY2F0aW9uXVtldmVudF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3YXRlcmZhbGwgcnVucyB0aGUgZnVuY3Rpb25zIGluIGFzc2lnbmVkIG9yZGVyXG4gICAgICAgICAgICAvLyB3YWl0aW5nIGZvciBvbmUgdG8gY29tcGxldGUgYmVmb3JlIG1vdmluZyB0byB0aGUgbmV4dFxuICAgICAgICAgICAgLy8gd2hlbiBpdCdzIGRvbmUsIHRoZSBgYGBsYXN0YGBgIHBhcmFtZXRlciBpcyBjYWxsZWRcbiAgICAgICAgICAgIHdhdGVyZmFsbChwbHVnaW5fcXVldWUsIGxhc3QpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgU2V0IHRoZSBzdGF0ZSBmb3Ige0BsaW5rIE1lfSB3aXRoaW4gdGhpcyB7QGxpbmsgVXNlcn0uXG4gICAgICAgIEJyb2FkY2FzdHMgdGhlIGBgYCQuc3RhdGVgYGAgZXZlbnQgb24gb3RoZXIgY2xpZW50c1xuXG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIHtAbGluayBNZX0gd2lsbCBoYXZlIHdpdGhpbiB0aGlzIHtAbGluayBVc2VyfVxuICAgICAgICAqL1xuICAgICAgICBzZXRTdGF0ZShzdGF0ZSkge1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5zZXRTdGF0ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBoYW5kbGUgc3RhdHVzLCByZXNwb25zZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIG9uQ29ubmVjdGlvblJlYWR5KCkge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgdGhlIHtAbGluayBDaGF0fSBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmsuXG4gICAgICAgICAgICAqIEBldmVudCBDaGF0IyRcIi5cImNvbm5lY3RlZFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiBjaGF0Lm9uKCckLmNvbm5lY3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKCdjaGF0IGlzIHJlYWR5IHRvIGdvIScpO1xuICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIGdldCBhIGxpc3Qgb2YgdXNlcnMgb25saW5lIG5vd1xuICAgICAgICAgICAgLy8gYXNrIFB1Yk51YiBmb3IgaW5mb3JtYXRpb24gYWJvdXQgY29ubmVjdGVkIHVzZXJzIGluIHRoaXMgY2hhbm5lbFxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuaGVyZU5vdyh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVVVUlEczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU3RhdGU6IHRydWVcbiAgICAgICAgICAgIH0sIChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvdCBoZXJlJylcbiAgICAgICAgICAgICAgICB0aGlzLm9uSGVyZU5vdyhzdGF0dXMsIHJlc3BvbnNlKVxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5jb25uZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAvKipcbiAgICBUaGlzIGlzIG91ciBVc2VyIGNsYXNzIHdoaWNoIHJlcHJlc2VudHMgYSBjb25uZWN0ZWQgY2xpZW50LiBVc2VyJ3MgYXJlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBhbmQgbWFuYWdlZCBieSB7QGxpbmsgQ2hhdH1zLCBidXQgeW91IGNhbiBhbHNvIGluc3RhbnRpYXRlIHRoZW0geW91cnNlbGYuXG4gICAgSWYgYSBVc2VyIGhhcyBiZWVuIGNyZWF0ZWQgYnV0IGhhcyBuZXZlciBiZWVuIGF1dGhlbnRpY2F0ZWQsIHlvdSB3aWxsIHJlY2lldmUgNDAzcyB3aGVuIGNvbm5lY3RpbmcgdG8gdGhlaXIgZmVlZCBvciBkaXJlY3QgQ2hhdHMuXG4gICAgQGNsYXNzXG4gICAgQGV4dGVuZHMgRW1pdHRlclxuICAgIEBwYXJhbSB1dWlkXG4gICAgQHBhcmFtIHN0YXRlXG4gICAgQHBhcmFtIGNoYXRcbiAgICAqL1xuICAgIGNsYXNzIFVzZXIgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih1dWlkLCBzdGF0ZSA9IHt9LCBjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWwpIHtcblxuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBUaGUgVXNlcidzIHVuaXF1ZSBpZGVudGlmaWVyLCB1c3VhbGx5IGEgZGV2aWNlIHV1aWQuIFRoaXMgaGVscHMgQ2hhdEVuZ2luZSBpZGVudGlmeSB0aGUgdXNlciBiZXR3ZWVuIGV2ZW50cy4gVGhpcyBpcyBwdWJsaWMgaWQgZXhwb3NlZCB0byB0aGUgbmV0d29yay5cbiAgICAgICAgICAgIENoZWNrIG91dCBbdGhlIHdpa2lwZWRpYSBwYWdlIG9uIFVVSURzXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbml2ZXJzYWxseV91bmlxdWVfaWRlbnRpZmllcikuXG5cbiAgICAgICAgICAgIEByZWFkb25seVxuICAgICAgICAgICAgQHR5cGUgU3RyaW5nXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy51dWlkID0gdXVpZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICBBIG1hcCBvZiB0aGUgVXNlcidzIHN0YXRlIGluIGVhY2gge0BsaW5rIENoYXR9LiBTdGF5cyBpbiBzeW5jIGF1dG9tYXRpY2FsbHkuXG5cbiAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnN0YXRlcyA9IHt9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIENoYXRzIHRoaXMge0BsaW5rIFVzZXJ9IGlzIGN1cnJlbnRseSBpbi4gVGhlIGtleSBvZiBlYWNoIGl0ZW0gaW4gdGhlIG9iamVjdCBpcyB0aGUge0BsaW5rIENoYXQuY2hhbm5lbH0gYW5kIHRoZSB2YWx1ZSBpcyB0aGUge0BsaW5rIENoYXR9IG9iamVjdC4gTm90ZSB0aGF0IGZvciBwcml2YWN5LCB0aGlzIG1hcCB3aWxsIG9ubHkgY29udGFpbiB7QGxpbmsgQ2hhdH1zIHRoYXQgdGhlIGNsaWVudCAoe0BsaW5rIE1lfSkgaXMgYWxzbyBjb25uZWN0ZWQgdG8uXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICp7XG4gICAgICAgICAgICAqICAgIFwiZ2xvYmFsQ2hhbm5lbFwiOiB7XG4gICAgICAgICAgICAqICAgICAgICBjaGFubmVsOiBcImdsb2JhbENoYW5uZWxcIixcbiAgICAgICAgICAgICogICAgICAgIHVzZXJzOiB7XG4gICAgICAgICAgICAqICAgICAgICAgICAgLy8uLi5cbiAgICAgICAgICAgICogICAgICAgIH0sXG4gICAgICAgICAgICAqICAgIH0sXG4gICAgICAgICAgICAqICAgIC8vIC4uLlxuICAgICAgICAgICAgKiB9XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGF0cyA9IHt9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmVlZCBpcyBhIENoYXQgdGhhdCBvbmx5IHN0cmVhbXMgdGhpbmdzIGEgVXNlciBkb2VzLCBsaWtlXG4gICAgICAgICAgICAqICdzdGFydFR5cGluZycgb3IgJ2lkbGUnIGV2ZW50cyBmb3IgZXhhbXBsZS4gQW55Ym9keSBjYW4gc3Vic2NyaWJlXG4gICAgICAgICAgICAqIHRvIGEgVXNlcidzIGZlZWQsIGJ1dCBvbmx5IHRoZSBVc2VyIGNhbiBwdWJsaXNoIHRvIGl0LiBVc2VycyB3aWxsXG4gICAgICAgICAgICAqIG5vdCBiZSBhYmxlIHRvIGNvbnZlcnNlIGluIHRoaXMgY2hhbm5lbC5cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHR5cGUgQ2hhdFxuICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgKiAvLyBtZVxuICAgICAgICAgICAgKiBtZS5mZWVkLmVtaXQoJ3VwZGF0ZScsICdJIG1heSBiZSBhd2F5IGZyb20gbXkgY29tcHV0ZXIgcmlnaHQgbm93Jyk7XG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIC8vIGFub3RoZXIgaW5zdGFuY2VcbiAgICAgICAgICAgICogdGhlbS5mZWVkLmNvbm5lY3QoKTtcbiAgICAgICAgICAgICogdGhlbS5mZWVkLm9uKCd1cGRhdGUnLCAocGF5bG9hZCkgPT4ge30pXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBncmFudHMgZm9yIHRoZXNlIGNoYXRzIGFyZSBkb25lIG9uIGF1dGguIEV2ZW4gdGhvdWdoIHRoZXkncmUgbWFya2VkIHByaXZhdGUsIHRoZXkgYXJlIGxvY2tlZCBkb3duIHZpYSB0aGUgc2VydmVyXG4gICAgICAgICAgICB0aGlzLmZlZWQgPSBuZXcgQ2hhdChcbiAgICAgICAgICAgICAgICBbQ2hhdEVuZ2luZS5nbG9iYWwuY2hhbm5lbCwgJ3VzZXInLCB1dWlkLCAncmVhZC4nLCAnZmVlZCddLmpvaW4oJyMnKSwgZmFsc2UsIHRoaXMuY29uc3RydWN0b3IubmFtZSA9PSBcIk1lXCIsICdmZWVkJyk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBEaXJlY3QgaXMgYSBwcml2YXRlIGNoYW5uZWwgdGhhdCBhbnlib2R5IGNhbiBwdWJsaXNoIHRvIGJ1dCBvbmx5XG4gICAgICAgICAgICAqIHRoZSB1c2VyIGNhbiBzdWJzY3JpYmUgdG8uIEdyZWF0IGZvciBwdXNoaW5nIG5vdGlmaWNhdGlvbnMgb3JcbiAgICAgICAgICAgICogaW52aXRpbmcgdG8gb3RoZXIgY2hhdHMuIFVzZXJzIHdpbGwgbm90IGJlIGFibGUgdG8gY29tbXVuaWNhdGVcbiAgICAgICAgICAgICogd2l0aCBvbmUgYW5vdGhlciBpbnNpZGUgb2YgdGhpcyBjaGF0LiBDaGVjayBvdXQgdGhlXG4gICAgICAgICAgICAqIHtAbGluayBDaGF0I2ludml0ZX0gbWV0aG9kIGZvciBwcml2YXRlIGNoYXRzIHV0aWxpemluZ1xuICAgICAgICAgICAgKiB7QGxpbmsgVXNlciNkaXJlY3R9LlxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAdHlwZSBDaGF0XG4gICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAqIC8vIG1lXG4gICAgICAgICAgICAqIG1lLmRpcmVjdC5vbigncHJpdmF0ZS1tZXNzYWdlJywgKHBheWxvYWQpIC0+IHtcbiAgICAgICAgICAgICogICAgIGNvbnNvbGUubG9nKHBheWxvYWQuc2VuZGVyLnV1aWQsICdzZW50IHlvdXIgYSBkaXJlY3QgbWVzc2FnZScpO1xuICAgICAgICAgICAgKiB9KTtcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogLy8gYW5vdGhlciBpbnN0YW5jZVxuICAgICAgICAgICAgKiB0aGVtLmRpcmVjdC5jb25uZWN0KCk7XG4gICAgICAgICAgICAqIHRoZW0uZGlyZWN0LmVtaXQoJ3ByaXZhdGUtbWVzc2FnZScsIHtzZWNyZXQ6IDQyfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5kaXJlY3QgPSBuZXcgQ2hhdChcbiAgICAgICAgICAgICAgICBbQ2hhdEVuZ2luZS5nbG9iYWwuY2hhbm5lbCwgJ3VzZXInLCB1dWlkLCAnd3JpdGUuJywgJ2RpcmVjdCddLmpvaW4oJyMnKSwgZmFsc2UsIHRoaXMuY29uc3RydWN0b3IubmFtZSA9PSBcIk1lXCIsICdkaXJlY3QnKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgZG9lcyBub3QgZXhpc3QgYXQgYWxsIGFuZCB3ZSBnZXQgZW5vdWdoXG4gICAgICAgICAgICAvLyBpbmZvcm1hdGlvbiB0byBidWlsZCB0aGUgdXNlclxuICAgICAgICAgICAgaWYoIUNoYXRFbmdpbmUudXNlcnNbdXVpZF0pIHtcbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnVzZXJzW3V1aWRdID0gdGhpcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5kaXJlY3Qub24oJyQuc2VydmVyLmNoYXQuY3JlYXRlZCcsIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGF0VG9TZXNzaW9uKHBheWxvYWQuY2hhdCk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICB0aGlzLmRpcmVjdC5vbignJC5zZXJ2ZXIuY2hhdC5kZWxldGVkJywgKHBheWxvYWQpID0+IHtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucmVtb3ZlQ2hhdEZyb21TZXNzaW9uKHBheWxvYWQuY2hhdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoaXMgdXNlcidzIHN0YXRlIGluIGl0J3MgY3JlYXRlZCBjb250ZXh0XG4gICAgICAgICAgICB0aGlzLmFzc2lnbihzdGF0ZSwgY2hhdClcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogR2V0cyB0aGUgdXNlciBzdGF0ZSBpbiBhIHtAbGluayBDaGF0fS4gU2VlIHtAbGluayBNZSN1cGRhdGV9IGZvciBob3cgdG8gYXNzaWduIHN0YXRlIHZhbHVlcy5cbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQ2hhdHJvb20gdG8gcmV0cmlldmUgc3RhdGUgZnJvbVxuICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhIGdlbmVyaWMgSlNPTiBvYmplY3QgY29udGFpbmluZyBzdGF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAqXG4gICAgICAgICogLy8gR2xvYmFsIFN0YXRlXG4gICAgICAgICogbGV0IGdsb2JhbFN0YXRlID0gdXNlci5zdGF0ZSgpO1xuICAgICAgICAqXG4gICAgICAgICogLy8gU3RhdGUgaW4gc29tZSBjaGFubmVsXG4gICAgICAgICogbGV0IHNvbWVDaGF0ID0gbmV3IENoYXRFbmdpbmUuQ2hhdCgnc29tZS1jaGFubmVsJyk7XG4gICAgICAgICogbGV0IHNvbWVDaGF0U3RhdGUgPSB1c2VyLnN0YXRlKHNvbWVDaGF0KTtzXG4gICAgICAgICovXG4gICAgICAgIHN0YXRlKGNoYXQgPSBDaGF0RW5naW5lLmdsb2JhbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGVzW2NoYXQuY2hhbm5lbF0gfHwge307XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIGZvciB0aGUgdXNlclxuICAgICAgICAqIEBwYXJhbSB7Q2hhdH0gY2hhdCBDaGF0cm9vbSB0byByZXRyaWV2ZSBzdGF0ZSBmcm9tXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZShzdGF0ZSwgY2hhdCA9IENoYXRFbmdpbmUuZ2xvYmFsKSB7XG4gICAgICAgICAgICBsZXQgY2hhdFN0YXRlID0gdGhpcy5zdGF0ZShjaGF0KSB8fCB7fTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzW2NoYXQuY2hhbm5lbF0gPSBPYmplY3QuYXNzaWduKGNoYXRTdGF0ZSwgc3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgIHRoaXMgaXMgb25seSBjYWxsZWQgZnJvbSBuZXR3b3JrIHVwZGF0ZXNcblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAqL1xuICAgICAgICBhc3NpZ24oc3RhdGUsIGNoYXQpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0YXRlLCBjaGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICBhZGRzIGEgY2hhdCB0byB0aGlzIHVzZXJcblxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICAqL1xuICAgICAgICBhZGRDaGF0KGNoYXQsIHN0YXRlKSB7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBjaGF0IGluIHRoaXMgdXNlciBvYmplY3RcbiAgICAgICAgICAgIHRoaXMuY2hhdHNbY2hhdC5jaGFubmVsXSA9IGNoYXQ7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZXMgdGhlIHVzZXIncyBzdGF0ZSBpbiB0aGF0IGNoYXRyb29tXG4gICAgICAgICAgICB0aGlzLmFzc2lnbihzdGF0ZSwgY2hhdCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgIFJlcHJlc2VudHMgdGhlIGNsaWVudCBjb25uZWN0aW9uIGFzIGEgc3BlY2lhbCB7QGxpbmsgVXNlcn0gd2l0aCB3cml0ZSBwZXJtaXNzaW9ucy5cbiAgICBIYXMgdGhlIGFiaWxpdHkgdG8gdXBkYXRlIGl0J3Mgc3RhdGUgb24gdGhlIG5ldHdvcmsuIEFuIGluc3RhbmNlIG9mXG4gICAge0BsaW5rIE1lfSBpcyByZXR1cm5lZCBieSB0aGUgYGBgQ2hhdEVuZ2luZS5jb25uZWN0KClgYGBcbiAgICBtZXRob2QuXG5cbiAgICBAY2xhc3MgTWVcbiAgICBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBvZiB0aGlzIHVzZXJcbiAgICBAZXh0ZW5kcyBVc2VyXG4gICAgKi9cbiAgICBjbGFzcyBNZSBleHRlbmRzIFVzZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHV1aWQsIGF1dGhEYXRhKSB7XG5cbiAgICAgICAgICAgIC8vIGNhbGwgdGhlIFVzZXIgY29uc3RydWN0b3JcbiAgICAgICAgICAgIHN1cGVyKHV1aWQpO1xuXG4gICAgICAgICAgICB0aGlzLmF1dGhEYXRhID0gYXV0aERhdGE7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFzc2lnbiB1cGRhdGVzIGZyb20gbmV0d29ya1xuICAgICAgICBhc3NpZ24oc3RhdGUsIGNoYXQpIHtcbiAgICAgICAgICAgIC8vIHdlIGNhbGwgXCJ1cGRhdGVcIiBiZWNhdXNlIGNhbGxpbmcgXCJzdXBlci5hc3NpZ25cIlxuICAgICAgICAgICAgLy8gd2lsbCBkaXJlY3QgYmFjayB0byBcInRoaXMudXBkYXRlXCIgd2hpY2ggY3JlYXRlc1xuICAgICAgICAgICAgLy8gYSBsb29wIG9mIG5ldHdvcmsgdXBkYXRlc1xuICAgICAgICAgICAgc3VwZXIudXBkYXRlKHN0YXRlLCBjaGF0KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVXBkYXRlIHtAbGluayBNZX0ncyBzdGF0ZSBpbiBhIHtAbGluayBDaGF0fS4gQWxsIHtAbGluayBVc2VyfXMgaW5cbiAgICAgICAgKiB0aGUge0BsaW5rIENoYXR9IHdpbGwgYmUgbm90aWZpZWQgb2YgdGhpcyBjaGFuZ2UgdmlhICgkLnVwZGF0ZSlbQ2hhdC5odG1sI2V2ZW50OiQlMjUyMi4lMjUyMnN0YXRlXS5cbiAgICAgICAgKiBSZXRyaWV2ZSBzdGF0ZSBhdCBhbnkgdGltZSB3aXRoIHtAbGluayBVc2VyI3N0YXRlfS5cbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSBmb3Ige0BsaW5rIE1lfVxuICAgICAgICAqIEBwYXJhbSB7Q2hhdH0gY2hhdCBBbiBpbnN0YW5jZSBvZiB0aGUge0BsaW5rIENoYXR9IHdoZXJlIHN0YXRlIHdpbGwgYmUgdXBkYXRlZC5cbiAgICAgICAgKiBEZWZhdWx0cyB0byBgYGBDaGF0RW5naW5lLmdsb2JhbGBgYC5cbiAgICAgICAgKiBAZmlyZXMgQ2hhdCNldmVudDokXCIuXCJzdGF0ZVxuICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICogLy8gdXBkYXRlIGdsb2JhbCBzdGF0ZVxuICAgICAgICAqIG1lLnVwZGF0ZSh7dmFsdWU6IHRydWV9KTtcbiAgICAgICAgKlxuICAgICAgICAqIC8vIHVwZGF0ZSBzdGF0ZSBpbiBzcGVjaWZpYyBjaGF0XG4gICAgICAgICogbGV0IGNoYXQgPSBuZXcgQ2hhdEVuZ2luZS5DaGF0KCdzb21lLWNoYXQnKTtcbiAgICAgICAgKiBtZS51cGRhdGUoe3ZhbHVlOiB0cnVlfSwgY2hhdCk7XG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZShzdGF0ZSwgY2hhdCA9IENoYXRFbmdpbmUuZ2xvYmFsKSB7XG5cbiAgICAgICAgICAgIC8vIHJ1biB0aGUgcm9vdCB1cGRhdGUgZnVuY3Rpb25cbiAgICAgICAgICAgIHN1cGVyLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG5cbiAgICAgICAgICAgIC8vIHB1Ymxpc2ggdGhlIHVwZGF0ZSBvdmVyIHRoZSBnbG9iYWwgY2hhbm5lbFxuICAgICAgICAgICAgY2hhdC5zZXRTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgUHJvdmlkZXMgdGhlIGJhc2UgV2lkZ2V0IGNsYXNzLi4uXG5cbiAgICBAY2xhc3MgQ2hhdEVuZ2luZVxuICAgIEBleHRlbmRzIFJvb3RFbWl0dGVyXG4gICAgICovXG4gICAgY29uc3QgaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcm9vdCBDaGF0RW5naW5lIG9iamVjdFxuICAgICAgICBDaGF0RW5naW5lID0gbmV3IFJvb3RFbWl0dGVyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEEgbWFwIG9mIGFsbCBrbm93biB7QGxpbmsgVXNlcn1zIGluIHRoaXMgaW5zdGFuY2Ugb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUudXNlcnMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBBIG1hcCBvZiBhbGwga25vd24ge0BsaW5rIENoYXR9cyBpbiB0aGlzIGluc3RhbmNlIG9mIENoYXRFbmdpbmVcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLmNoYXRzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQSBnbG9iYWwge0BsaW5rIENoYXR9IHRoYXQgYWxsIHtAbGluayBVc2VyfXMgam9pbiB3aGVuIHRoZXkgY29ubmVjdCB0byBDaGF0RW5naW5lLiBVc2VmdWwgZm9yIGFubm91bmNlbWVudHMsIGFsZXJ0cywgYW5kIGdsb2JhbCBldmVudHMuXG4gICAgICAgICogQG1lbWJlciB7Q2hhdH0gZ2xvYmFsXG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5nbG9iYWwgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBUaGlzIGluc3RhbmNlIG9mIENoYXRFbmdpbmUgcmVwcmVzZW50ZWQgYXMgYSBzcGVjaWFsIHtAbGluayBVc2VyfSBrbm93IGFzIHtAbGluayBNZX1cbiAgICAgICAgKiBAbWVtYmVyIHtNZX0gbWVcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqL1xuICAgICAgICBDaGF0RW5naW5lLm1lID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQW4gaW5zdGFuY2Ugb2YgUHViTnViLCB0aGUgbmV0d29ya2luZyBpbmZyYXN0cnVjdHVyZSB0aGF0IHBvd2VycyB0aGUgcmVhbHRpbWUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHtAbGluayBVc2VyfXMgaW4ge0BsaW5rIENoYXRzfS5cbiAgICAgICAgKiBAbWVtYmVyIHtPYmplY3R9IHB1Ym51YlxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUucHVibnViID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogSW5kaWNhdGVzIGlmIENoYXRFbmdpbmUgaGFzIGZpcmVkIHRoZSB7QGxpbmsgQ2hhdEVuZ2luZSMkXCIuXCJyZWFkeX0gZXZlbnRcbiAgICAgICAgKiBAbWVtYmVyIHtPYmplY3R9IHJlYWR5XG4gICAgICAgICogQG1lbWJlcm9mIENoYXRFbmdpbmVcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5yZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgIENoYXRFbmdpbmUuc2Vzc2lvbiA9IHt9O1xuXG4gICAgICAgIENoYXRFbmdpbmUuYWRkQ2hhdFRvU2Vzc2lvbiA9IGZ1bmN0aW9uKGNoYXQpIHtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5zZXNzaW9uW2NoYXQuZ3JvdXBdID0gQ2hhdEVuZ2luZS5zZXNzaW9uW2NoYXQuZ3JvdXBdIHx8IHt9O1xuXG4gICAgICAgICAgICBsZXQgZXhpc3RpbmdDaGF0ID0gQ2hhdEVuZ2luZS5jaGF0c1tjaGF0LmNoYW5uZWxdO1xuXG4gICAgICAgICAgICBpZihleGlzdGluZ0NoYXQpIHtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuc2Vzc2lvbltjaGF0Lmdyb3VwXVtjaGF0LmNoYW5uZWxdID0gZXhpc3RpbmdDaGF0O1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5zZXNzaW9uW2NoYXQuZ3JvdXBdW2NoYXQuY2hhbm5lbF0gPSBuZXcgQ2hhdChjaGF0LmNoYW5uZWwsIGNoYXQucHJpdmF0ZSwgZmFsc2UsIGNoYXQuZ3JvdXApO1xuXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5fZW1pdCgnJC5zZXNzaW9uLmNoYXQuam9pbicsIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdDogQ2hhdEVuZ2luZS5zZXNzaW9uW2NoYXQuZ3JvdXBdW2NoYXQuY2hhbm5lbF1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBDaGF0RW5naW5lLnJlbW92ZUNoYXRGcm9tU2Vzc2lvbiA9IGZ1bmN0aW9uKGNoYXQpIHtcblxuICAgICAgICAgICAgbGV0IHRhcmdldENoYXQgPSBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF1bY2hhdC5jaGFubmVsXSB8fCBjaGF0O1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLl9lbWl0KCckLnNlc3Npb24uY2hhdC5sZWF2ZScsIHtcbiAgICAgICAgICAgICAgICBjaGF0OiB0YXJnZXRDaGF0XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZG9uJ3QgZGVsZXRlIGZyb20gY2hhdGVuZ2luZS5jaGF0cywgYmVjYXVzZSB3ZSBjYW4gc3RpbGwgZ2V0IGV2ZW50cyBmcm9tIHRoaXMgY2hhdFxuICAgICAgICAgICAgZGVsZXRlIENoYXRFbmdpbmUuY2hhdHNbY2hhdC5jaGFubmVsXTtcbiAgICAgICAgICAgIGRlbGV0ZSBDaGF0RW5naW5lLnNlc3Npb25bY2hhdC5ncm91cF1bY2hhdC5jaGFubmVsXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQ29ubmVjdCB0byByZWFsdGltZSBzZXJ2aWNlIGFuZCBjcmVhdGUgaW5zdGFuY2Ugb2Yge0BsaW5rIE1lfVxuICAgICAgICAqIEBtZXRob2QgQ2hhdEVuZ2luZSNjb25uZWN0XG4gICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHV1aWQgQSB1bmlxdWUgc3RyaW5nIGZvciB7QGxpbmsgTWV9LiBJdCBjYW4gYmUgYSBkZXZpY2UgaWQsIHVzZXJuYW1lLCB1c2VyIGlkLCBlbWFpbCwgZXRjLlxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBBbiBvYmplY3QgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIGNsaWVudCAoe0BsaW5rIE1lfSkuIFRoaXMgSlNPTiBvYmplY3QgaXMgc2VudCB0byBhbGwgb3RoZXIgY2xpZW50cyBvbiB0aGUgbmV0d29yaywgc28gbm8gcGFzc3dvcmRzIVxuICAgICAgICAqICogQHBhcmFtIHtTdHJ1bmd9IGF1dGhLZXkgQSBhdXRoZW50aWNhdGlvbiBzZWNyZXQuIFdpbGwgYmUgc2VudCB0byBhdXRoZW50aWNhdGlvbiBiYWNrZW5kIGZvciB2YWxpZGF0aW9uLiBUaGlzIGlzIHVzdWFsbHkgYW4gYWNjZXNzIHRva2VuIG9yIHBhc3N3b3JkLiBUaGlzIGlzIGRpZmZlcmVudCBmcm9tIFVVSUQgYXMgYSB1c2VyIGNhbiBoYXZlIGEgc2luZ2xlIFVVSUQgYnV0IG11bHRpcGxlIGF1dGgga2V5cy5cbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F1dGhEYXRhXSBBZGRpdGlvbmFsIGRhdGEgdG8gc2VuZCB0byB0aGUgYXV0aGVudGljYXRpb24gZW5kcG9pbnQuIE5vdCB1c2VkIGJ5IENoYXRFbmdpbmUgU0RLLlxuICAgICAgICAqIEBmaXJlcyAkXCIuXCJjb25uZWN0ZWRcbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5jb25uZWN0ID0gZnVuY3Rpb24odXVpZCwgc3RhdGUgPSB7fSwgYXV0aEtleSA9IGZhbHNlLCBhdXRoRGF0YSkge1xuXG4gICAgICAgICAgICAvLyB0aGlzIGNyZWF0ZXMgYSB1c2VyIGtub3duIGFzIE1lIGFuZFxuICAgICAgICAgICAgLy8gY29ubmVjdHMgdG8gdGhlIGdsb2JhbCBjaGF0cm9vbVxuXG4gICAgICAgICAgICBwbkNvbmZpZy51dWlkID0gdXVpZDtcblxuICAgICAgICAgICAgbGV0IGNvbXBsZXRlID0gKGNoYXREYXRhKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51YiA9IG5ldyBQdWJOdWIocG5Db25maWcpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGNoYXQgdG8gdXNlIGFzIGdsb2JhbCBjaGF0XG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgZG8gYXV0aCBvbiB0aGlzIG9uZSBiZWNhdXNlaXQncyBhc3N1bWVkIHRvIGJlIGRvbmUgd2l0aCB0aGUgL2F1dGggcmVxdWVzdCBiZWxvd1xuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuZ2xvYmFsID0gbmV3IENoYXQoY2VDb25maWcuZ2xvYmFsQ2hhbm5lbCwgZmFsc2UsIHRydWUsICdnbG9iYWwnKTtcblxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyB1c2VyIHRoYXQgcmVwcmVzZW50cyB0aGlzIGNsaWVudFxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUubWUgPSBuZXcgTWUocG5Db25maWcudXVpZCwgYXV0aERhdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIE1lIHVzaW5nIGlucHV0IHBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLmdsb2JhbC5jcmVhdGVVc2VyKHBuQ29uZmlnLnV1aWQsIHN0YXRlKTtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUubWUudXBkYXRlKHN0YXRlKTtcblxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogRmlyZWQgd2hlbiBDaGF0RW5naW5lIGlzIGNvbm5lY3RlZCB0byB0aGUgaW50ZXJuZXQgYW5kIHJlYWR5IHRvIGdvIVxuICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cInJlYWR5XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5nbG9iYWwub24oJyQuY29ubmVjdGVkJywgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIENoYXRFbmdpbmUuX2VtaXQoJyQucmVhZHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZTogQ2hhdEVuZ2luZS5tZVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBDaGF0RW5naW5lLnJlYWR5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGtleSBpbiBjaGF0RGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGF0VG9TZXNzaW9uKGNoYXREYXRhW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoYXRzLnNlc3Npb24gPVxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgRmlyZXMgd2hlbiBQdWJOdWIgbmV0d29yayBjb25uZWN0aW9uIGNoYW5nZXNcblxuICAgICAgICAgICAgICAgIEBwcml2YXRlXG4gICAgICAgICAgICAgICAgQHBhcmFtIHtPYmplY3R9IHN0YXR1c0V2ZW50IFRoZSByZXNwb25zZSBzdGF0dXNcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAoc3RhdHVzRXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFNESyBkZXRlY3RlZCB0aGF0IG5ldHdvcmsgaXMgb25saW5lLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJ1cFwiLlwib25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogU0RLIGRldGVjdGVkIHRoYXQgbmV0d29yayBpcyBkb3duLlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJvZmZsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogQSBzdWJzY3JpYmUgZXZlbnQgZXhwZXJpZW5jZWQgYW4gZXhjZXB0aW9uIHdoZW4gcnVubmluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwiaXNzdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBTREsgd2FzIGFibGUgdG8gcmVjb25uZWN0IHRvIHB1Ym51Yi5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwidXBcIi5cInJlY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogU0RLIHN1YnNjcmliZWQgd2l0aCBhIG5ldyBtaXggb2YgY2hhbm5lbHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cIm5ldHdvcmtcIi5cInVwXCIuXCJjb25uZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBKU09OIHBhcnNpbmcgY3Jhc2hlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwibWFsZm9ybWVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogU2VydmVyIHJlamVjdGVkIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJiYWRyZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogSWYgdXNpbmcgZGVjcnlwdGlvbiBzdHJhdGVnaWVzIGFuZCB0aGUgZGVjcnlwdGlvbiBmYWlscy5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwiZGVjcnlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIFJlcXVlc3QgdGltZWQgb3V0LlxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJuZXR3b3JrXCIuXCJkb3duXCIuXCJ0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogUEFNIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENoYXRFbmdpbmUjJFwiLlwibmV0d29ya1wiLlwiZG93blwiLlwiZGVuaWVkXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXAgdGhlIHB1Ym51YiBldmVudHMgaW50byBjaGF0IGVuZ2luZSBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOTmV0d29ya1VwQ2F0ZWdvcnknOiAndXAub25saW5lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUE5OZXR3b3JrRG93bkNhdGVnb3J5JzogJ2Rvd24ub2ZmbGluZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOTmV0d29ya0lzc3Vlc0NhdGVnb3J5JzogJ2Rvd24uaXNzdWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTlJlY29ubmVjdGVkQ2F0ZWdvcnknOiAndXAucmVjb25uZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkNvbm5lY3RlZENhdGVnb3J5JzogJ3VwLmNvbm5lY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOQWNjZXNzRGVuaWVkQ2F0ZWdvcnknOiAnZG93bi5kZW5pZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTk1hbGZvcm1lZFJlc3BvbnNlQ2F0ZWdvcnknOiAnZG93bi5tYWxmb3JtZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkJhZFJlcXVlc3RDYXRlZ29yeSc6ICdkb3duLmJhZHJlcXVlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQTkRlY3J5cHRpb25FcnJvckNhdGVnb3J5JzogJ2Rvd24uZGVjcnlwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BOVGltZW91dENhdGVnb3J5JzogJ2Rvd24udGltZW91dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudE5hbWUgPSBbJyQnLCAnbmV0d29yaycsIG1hcFtzdGF0dXNFdmVudC5jYXRlZ29yeV18fCAndW5kZWZpbmVkJ10uam9pbignLicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzdGF0dXNFdmVudC5hZmZlY3RlZENoYW5uZWxzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXNFdmVudC5hZmZlY3RlZENoYW5uZWxzLmZvckVhY2goKGNoYW5uZWwpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hhdCA9IENoYXRFbmdpbmUuY2hhdHNbY2hhbm5lbF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY2hhdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25uZWN0ZWQgY2F0ZWdvcnkgdGVsbHMgdXMgdGhlIGNoYXQgaXMgcmVhZHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXNFdmVudC5jYXRlZ29yeSA9PT0gXCJQTkNvbm5lY3RlZENhdGVnb3J5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGF0Lm9uQ29ubmVjdGlvblJlYWR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgdGhlIG5ldHdvcmsgZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGF0LnRyaWdnZXIoZXZlbnROYW1lLCBzdGF0dXNFdmVudCk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaGF0RW5naW5lLl9lbWl0KGV2ZW50TmFtZSwgc3RhdHVzRXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5fZW1pdChldmVudE5hbWUsIHN0YXR1c0V2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBnZXRDaGF0cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgYXhpb3MuZ2V0KGNlQ29uZmlnLmF1dGhVcmwgKyAnL2NoYXRzP3V1aWQ9JyArIHBuQ29uZmlnLnV1aWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAqIFRoZXJlIHdhcyBhIHByb2JsZW0gbG9nZ2luZyBpblxuICAgICAgICAgICAgICAgICAgICAqIEBldmVudCBDaGF0RW5naW5lIyRcIi5cImVycm9yXCIuXCJhdXRoXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3IoQ2hhdEVuZ2luZSwgJ19lbWl0JywgJ2F1dGgnLCBuZXcgRXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gbG9nZ2luZyBpbnRvIHRoZSBhdXRoIHNlcnZlciAoJytjZUNvbmZpZy5hdXRoVXJsKycpLicpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihjZUNvbmZpZy5pbnNlY3VyZSkge1xuICAgICAgICAgICAgICAgIGdldENoYXRzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcG5Db25maWcuYXV0aEtleSA9IGF1dGhLZXk7XG5cbiAgICAgICAgICAgICAgICBheGlvcy5wb3N0KGNlQ29uZmlnLmF1dGhVcmwgKyAnL2dyYW50Jywge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBwbkNvbmZpZy51dWlkLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiBjZUNvbmZpZy5nbG9iYWxDaGFubmVsLFxuICAgICAgICAgICAgICAgICAgICBhdXRoRGF0YTogQ2hhdEVuZ2luZS5tZS5hdXRoRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgYXV0aEtleTogcG5Db25maWcuYXV0aEtleVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2V0Q2hhdHMocmVzcG9uc2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgKiBUaGVyZSB3YXMgYSBwcm9ibGVtIGxvZ2dpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ2hhdEVuZ2luZSMkXCIuXCJlcnJvclwiLlwiYXV0aFxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKENoYXRFbmdpbmUsICdfZW1pdCcsICdhdXRoJywgbmV3IEVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIGxvZ2dpbmcgaW50byB0aGUgYXV0aCBzZXJ2ZXIgKCcrY2VDb25maWcuYXV0aFVybCsnKS4nKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoZSB7QGxpbmsgQ2hhdH0gY2xhc3MuXG4gICAgICAgICogQG1lbWJlciB7Q2hhdH0gQ2hhdFxuICAgICAgICAqIEBtZW1iZXJvZiBDaGF0RW5naW5lXG4gICAgICAgICogQHNlZSB7QGxpbmsgQ2hhdH1cbiAgICAgICAgKi9cbiAgICAgICAgQ2hhdEVuZ2luZS5DaGF0ID0gQ2hhdDtcblxuICAgICAgICAvKipcbiAgICAgICAgKiBUaGUge0BsaW5rIFVzZXJ9IGNsYXNzLlxuICAgICAgICAqIEBtZW1iZXIge1VzZXJ9IFVzZXJcbiAgICAgICAgKiBAbWVtYmVyb2YgQ2hhdEVuZ2luZVxuICAgICAgICAqIEBzZWUge0BsaW5rIFVzZXJ9XG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUuVXNlciA9IFVzZXI7XG5cbiAgICAgICAgLy8gYWRkIGFuIG9iamVjdCBhcyBhIHN1Ym9iamVjdCB1bmRlciBhIG5hbWVzcG9hY2VcbiAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGlsZCA9IChvYiwgY2hpbGROYW1lLCBjaGlsZE9iKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIGFzc2lnbiB0aGUgbmV3IGNoaWxkIG9iamVjdCBhcyBhIHByb3BlcnR5IG9mIHBhcmVudCB1bmRlciB0aGVcbiAgICAgICAgICAgIC8vIGdpdmVuIG5hbWVzcGFjZVxuICAgICAgICAgICAgb2JbY2hpbGROYW1lXSA9IGNoaWxkT2I7XG5cbiAgICAgICAgICAgIC8vIHRoZSBuZXcgb2JqZWN0IGNhbiB1c2UgYGBgdGhpcy5wYXJlbnRgYGAgdG8gYWNjZXNzXG4gICAgICAgICAgICAvLyB0aGUgcm9vdCBjbGFzc1xuICAgICAgICAgICAgY2hpbGRPYi5wYXJlbnQgPSBvYjtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIENoYXRFbmdpbmU7XG5cbiAgICB9XG5cbiAgICAvLyByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgQ2hhdEVuZ2luZVxuICAgIHJldHVybiBpbml0KCk7XG5cbn1cblxuLy8gZXhwb3J0IHRoZSBDaGF0RW5naW5lIGFwaVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGx1Z2luOiB7fSwgIC8vIGxlYXZlIGEgc3BvdCBmb3IgcGx1Z2lucyB0byBleGlzdFxuICAgIGNyZWF0ZTogY3JlYXRlXG59O1xuIiwid2luZG93LkNoYXRFbmdpbmVDb3JlID0gd2luZG93LkNoYXRFbmdpbmVDb3JlIHx8IHJlcXVpcmUoJy4vaW5kZXguanMnKTtcbiJdfQ==
