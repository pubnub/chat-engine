(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ChatEngineCore"] = factory();
	else
		root["ChatEngineCore"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(10);
var isBuffer = __webpack_require__(33);

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const waterfall = __webpack_require__(56);
const RootEmitter = __webpack_require__(5);
const Event = __webpack_require__(25);

/**
 An ChatEngine generic emitter that supports plugins and duplicates
 events on the root emitter.
 @class Emitter
 @extends RootEmitter
 */
class Emitter extends RootEmitter {

    constructor(chatEngine) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'Emitter';

        /**
         Stores a list of plugins bound to this object
         @private
         */
        this.plugins = [];

        /**
         Stores in memory keys and values
         @private
         */
        this._dataset = {};

        /**
         Emit events locally.

         @private
         @param {String} event The event payload object
         */
        this._emit = (event, data = {}) => {

            // all events are forwarded to ChatEngine object
            // so you can globally bind to events with ChatEngine.on()
            this.chatEngine._emit(event, data, this);

            // emit the event from the object that created it
            this.emitter.emit(event, data);

            return this;

        };

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
            this.events[event] = this.events[event] || new Event(this.chatEngine, this, event);

            // call the private _on property
            this._on(event, cb);

            return this;

        };

    }

    // add an object as a subobject under a namespoace
    addChild(childName, childOb) {
        // assign the new child object as a property of parent under the
        // given namespace
        this[childName] = childOb;

        // assign a data set for the namespace if it doesn't exist
        if (!this._dataset[childName]) {
            this._dataset[childName] = {};
        }

        // the new object can use ```this.parent``` to access
        // the root class
        childOb.parent = this;

        // bind get() and set() to the data set
        childOb.get = this.get.bind(this._dataset[childName]);
        childOb.set = this.set.bind(this._dataset[childName]);
    }

    get(key) {
        return this[key];
    }

    set(key, value) {
        if (this[key] && !value) {
            delete this[key];
        } else {
            this[key] = value;
        }
    }

    /**
     Binds a plugin to this object
     @param {Object} module The plugin module
     @tutorial using
     */
    plugin(module) {

        // add this plugin to a list of plugins for this object
        this.plugins.push(module);

        // see if there are plugins to attach to this class
        if (module.extends && module.extends[this.name]) {
            // attach the plugins to this class
            // under their namespace
            this.addChild(module.namespace, new module.extends[this.name]());

            this[module.namespace].ChatEngine = this.chatEngine;

            // if the plugin has a special construct function
            // run it
            if (this[module.namespace].construct) {
                this[module.namespace].construct();
            }

        }

        return this;

    }

    bindProtoPlugins() {

        if (this.chatEngine.protoPlugins[this.name]) {

            this.chatEngine.protoPlugins[this.name].forEach((module) => {
                this.plugin(module);
            });

        }

    }

    /**
     Broadcasts an event locally to all listeners.
     @private
     @param {String} event The event name
     @param {Object} payload The event payload object
     */
    trigger(event, payload = {}, done = () => {}) {

        let complete = () => {

            // let plugins modify the event
            this.runPluginQueue('on', event, (next) => {
                next(null, payload);
            }, (reject, pluginResponse) => {

                if (reject) {
                    done(reject);
                } else {
                    // emit this event to any listener
                    this._emit(event, pluginResponse);
                    done(null, event, pluginResponse);
                }

            });

        };

        // this can be made into plugin
        if (typeof payload === 'object') {

            // restore chat in payload
            if (!payload.chat) {
                payload.chat = this;
            }

            // if we should try to restore the sender property
            if (payload.sender) {

                // the user doesn't exist, create it
                payload.sender = new this.chatEngine.User(payload.sender);

                payload.sender._getState(() => {
                    complete();
                });

            } else {
                // there's no "sender" in this object, move on
                complete();
            }

        } else {
            // payload is not an object, we want nothing to do with it.
            complete();
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
        let pluginQueue = [];

        // the first function is always required
        pluginQueue.push(first);

        // look through the configured plugins
        this.plugins.forEach((pluginItem) => {

            // if they have defined a function to run specifically
            // for this event
            if (pluginItem.middleware && pluginItem.middleware[location]) {

                if (pluginItem.middleware[location][event]) {
                    // add the function to the queue
                    pluginQueue.push(pluginItem.middleware[location][event]);
                }

                if (pluginItem.middleware[location]['*']) {
                    // add the function to the queue
                    pluginQueue.push(pluginItem.middleware[location]['*']);
                }

            }

        });

        // waterfall runs the functions in assigned order
        // waiting for one to complete before moving to the next
        // when it's done, the ```last``` parameter is called
        waterfall(pluginQueue, last);

    }

    onConstructed() {

        this.bindProtoPlugins();
        this.trigger(['$', 'created', this.name.toLowerCase()].join('.'));

    }

}

module.exports = Emitter;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(0);
var normalizeHeaderName = __webpack_require__(35);

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
    adapter = __webpack_require__(11);
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(11);
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {


// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = __webpack_require__(52).EventEmitter2;

/**
* The {@link ChatEngine} object is a RootEmitter. Configures an event emitter that other ChatEngine objects inherit. Adds shortcut methods for
* ```this.on()```, ```this.emit()```, etc.
* @class RootEmitter
*/
class RootEmitter {

    constructor() {

        /**
        * @private
        */
        this.events = {};

        this.name = 'RootEmitter';

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
        this.on = (event, callback) => {

            // emit the event from the object that created it
            this.emitter.on(event, callback);

            return this;

        };

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
        this.off = (event, callback) => {

            // emit the event from the object that created it
            this.emitter.off(event, callback);

            return this;

        };

        /**
        * Listen for any event on this object and fire a callback when it's emitted
        * @method
        * @param {Function} callback The function to run when any event is emitted. First parameter is the event name and second is the payload.
        * @example
        * object.onAny((event, payload) => {
        *     console.log('All events trigger this.');
        * });
        */
        this.onAny = (event, callback) => {

            // emit the event from the object that created it
            this.emitter.onAny(event, callback);

            return this;

        };

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
        this.once = (event, callback) => {

            // emit the event from the object that created it
            this.emitter.once(event, callback);

            return this;

        };

    }

}

module.exports = RootEmitter;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(21),
    getRawTag = __webpack_require__(66),
    objectToString = __webpack_require__(67);

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
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(22);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(0);
var settle = __webpack_require__(36);
var buildURL = __webpack_require__(38);
var parseHeaders = __webpack_require__(39);
var isURLSameOrigin = __webpack_require__(40);
var createError = __webpack_require__(12);
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(41);

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
      var cookies = __webpack_require__(42);

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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(37);

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


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module, setImmediate, process) {(function (global, factory) {
     true ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.async = global.async || {})));
}(this, (function (exports) { 'use strict';

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

/** `Object#toString` result references. */
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto$1.toString;

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
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag || tag == proxyTag;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

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

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto = Object.prototype;

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

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

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

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 500;
var HOT_SPAN = 16;

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

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest$1(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

var initialParams = function (fn) {
    return baseRest$1(function (args /*..., callback*/) {
        var callback = args.pop();
        fn.call(this, args, callback);
    });
};

function applyEach$1(eachfn) {
    return baseRest$1(function (fns, args) {
        var go = initialParams(function (args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        } else {
            return go;
        }
    });
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

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

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$4.toString;

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && objectToString$1.call(value) == argsTag;
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

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

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$5.toString;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString$2.call(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$7;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$6.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? { value: coll[i], key: i } : null;
    };
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done) return null;
        i++;
        return { value: item.value, key: i };
    };
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? { value: obj[key], key: key } : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function () {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            } else if (value === breakLoop || done && running <= 0) {
                done = true;
                return callback(null);
            } else {
                replenish();
            }
        }

        function replenish() {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array. The iteratee is passed a `callback(err)` which must be called once it
 * has completed. If no error has occurred, the callback should be run without
 * arguments or with an explicit `null` argument. Invoked with
 * (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
  _eachOfLimit(limit)(coll, iteratee, callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err) {
        if (err) {
            callback(err);
        } else if (++completed === length) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array. The iteratee is passed a `callback(err)` which must be called once it
 * has completed. If no error has occurred, the callback should be run without
 * arguments or with an explicit `null` argument. Invoked with
 * (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function (coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, iteratee, callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, iteratee, callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = [];
    var counter = 0;

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines)
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed item. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of asynchronous functions
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, iteratee, callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a transformed
 * item. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed item. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of asynchronous functions to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} function - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply$2 = baseRest$1(function (fn, args) {
    return baseRest$1(function (callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2016 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function to convert to an
 * asynchronous function.
 * @returns {Function} An asynchronous wrapper of the `func`. To be invoked with
 * (callback).
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es6 example
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function (value) {
                callback(null, value);
            }, function (err) {
                callback(err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the functions in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the functions pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * Functions also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the function itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = {};

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key + '` has a non-existent dependency in ' + dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while (readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }
    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }

    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(baseRest$1(function (err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function (val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = args;
                hasError = true;
                listeners = [];

                callback(err, safeResults);
            } else {
                results[key] = args;
                taskComplete(key);
            }
        }));

        runningTasks++;
        var taskFn = task[task.length - 1];
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error('async.auto cannot execute tasks due to a recursive dependency');
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$3 = objectProto$8.toString;

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString$3.call(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange = '\\u20d0-\\u20f0';
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f\\ufe20-\\ufe23';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20f0';
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboMarksRange$1 + rsComboSymbolsRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg) {
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is a function of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;

        if (isArray(taskFn)) {
            params = copyArray(taskFn);
            taskFn = params.pop();

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (taskFn.length === 1) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            taskFn.apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return baseRest$1(function (fn, args) {
        defer(function () {
            fn.apply(null, args);
        });
    });
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function (node) {
    if (node.prev) node.prev.next = node.next;else this.head = node.next;
    if (node.next) node.next.prev = node.prev;else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = DLL;

DLL.prototype.insertAfter = function (node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function (node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function (node) {
    if (this.head) this.insertBefore(this.head, node);else setInitial(this, node);
};

DLL.prototype.push = function (node) {
    if (this.tail) this.insertAfter(this.tail, node);else setInitial(this, node);
};

DLL.prototype.shift = function () {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function () {
    return this.tail && this.removeLink(this.tail);
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    } else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function () {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    }

    function _next(tasks) {
        return baseRest$1(function (args) {
            workers -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];
                var index = baseIndexOf(workersList, task, 0);
                if (index >= 0) {
                    workersList.splice(index);
                }

                task.callback.apply(task, args);

                if (args[0] != null) {
                    q.error(args[0], task.data);
                }
            }

            if (workers <= q.concurrency - q.buffer) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        });
    }

    var workers = 0;
    var workersList = [];
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated: noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        process: function () {
            while (!q.paused && workers < q.concurrency && q._tasks.length) {
                var tasks = [],
                    data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    data.push(node.data);
                }

                if (q._tasks.length === 0) {
                    q.empty();
                }
                workers += 1;
                workersList.push(tasks[0]);

                if (workers === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                worker(data, cb);
            }
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return workers;
        },
        workersList: function () {
            return workersList;
        },
        idle: function () {
            return q._tasks.length + workers === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) {
                return;
            }
            q.paused = false;
            var resumeCount = Math.min(q.concurrency, q._tasks.length);
            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= resumeCount; w++) {
                setImmediate$1(q.process);
            }
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {Function} worker - An asynchronous function for processing an array
 * of queued tasks, which must call its `callback(err)` argument when finished,
 * with an optional `err` argument. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
  return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`. The
 * `key` is the item's key, or index in the case of an array. The iteratee is
 * passed a `callback(err)` which must be called once it has completed. If no
 * error has occurred, the callback should be run without arguments or with an
 * explicit `null` argument. Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {Function} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction. The `iteratee` is passed a
 * `callback(err, reduction)` which accepts an optional error as its first
 * argument, and the state of the reduction as the second. If an error is
 * passed to the callback, the reduction is stopped and the main `callback` is
 * immediately called with the error. Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    eachOfSeries(coll, function (x, i, callback) {
        iteratee(memo, x, function (err, v) {
            memo = v;
            callback(err);
        });
    }, function (err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...Function} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
var seq$1 = baseRest$1(function seq(functions) {
    return baseRest$1(function (args) {
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(functions, args, function (newargs, fn, cb) {
            fn.apply(that, newargs.concat([baseRest$1(function (err, nextargs) {
                cb(err, nextargs);
            })]));
        }, function (err, results) {
            cb.apply(that, [err].concat(results));
        });
    });
});

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...Function} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = baseRest$1(function (args) {
  return seq$1.apply(null, args.reverse());
});

function concat$1(eachfn, arr, fn, callback) {
    var result = [];
    eachfn(arr, function (x, index, cb) {
        fn(x, function (err, y) {
            result = result.concat(y || []);
            cb(err);
        });
    }, function (err) {
        callback(err, result);
    });
}

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, results)` which must be called once
 * it has completed with an error (which can be `null`) and an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doParallel(concat$1);

function doSeries(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOfSeries, obj, iteratee, callback);
    };
}

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, results)` which must be called once
 * it has completed with an error (which can be `null`) and an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doSeries(concat$1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {Function} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant$2 = baseRest$1(function (values) {
    var args = [null].concat(values);
    return initialParams(function (ignoredArgs, callback) {
        return callback.apply(this, args);
    });
});

function _createTester(eachfn, check, getResult) {
    return function (arr, limit, iteratee, cb) {
        function done() {
            if (cb) {
                cb(null, getResult(false));
            }
        }
        function wrappedIteratee(x, _, callback) {
            if (!cb) return callback();
            iteratee(x, function (err, v) {
                // Check cb as another iteratee may have resolved with a
                // value or error since we started this iteratee
                if (cb && (err || check(v))) {
                    if (err) cb(err);else cb(err, getResult(true, x));
                    cb = iteratee = false;
                    callback(err, breakLoop);
                } else {
                    callback();
                }
            });
        }
        if (arguments.length > 3) {
            cb = cb || noop;
            eachfn(arr, limit, wrappedIteratee, done);
        } else {
            cb = iteratee;
            cb = cb || noop;
            iteratee = limit;
            eachfn(arr, wrappedIteratee, done);
        }
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, truthValue)` which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = _createTester(eachOf, identity, _findGetResult);

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, truthValue)` which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = _createTester(eachOfLimit, identity, _findGetResult);

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, truthValue)` which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = _createTester(eachOfSeries, identity, _findGetResult);

function consoleFunc(name) {
    return baseRest$1(function (fn, args) {
        fn.apply(null, args.concat([baseRest$1(function (err, args) {
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        })]));
    });
}

/**
 * Logs the result of an `async` function to the `console` using `console.dir`
 * to display the properties of the resulting object. Only works in Node.js or
 * in browsers that support `console.dir` and `console.error` (such as FF and
 * Chrome). If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} function - The function you want to eventually apply all
 * arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {Function} fn - A function which is called each time `test` passes.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occured, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);

    var next = baseRest$1(function (err, args) {
        if (err) return callback(err);
        args.push(check);
        test.apply(this, args);
    });

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        fn(next);
    }

    check(null, true);
}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} iteratee - A function which is called each time `test`
 * passes. The function is passed a `callback(err)`, which must be called once
 * it has completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with the non-error callback results of 
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var next = baseRest$1(function (err, args) {
        if (err) return callback(err);
        if (test.apply(this, args)) return iteratee(next);
        callback.apply(null, [null].concat(args));
    });
    iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {Function} fn - A function which is called each time `test` fails.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `fn`. Invoked with the non-error callback results of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `fn`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(fn, test, callback) {
    doWhilst(fn, function () {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {Function} fn - A function which is called each time `test` passes.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occured, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);

    function next(err) {
        if (err) return callback(err);
        test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        fn(next);
    }

    test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item
 * in `coll`. The iteratee is passed a `callback(err)` which must be called once
 * it has completed. If no error has occurred, the `callback` should be run
 * without arguments or with an explicit `null` argument. The array index is not
 * passed to the iteratee. Invoked with (item, callback). If you need the index,
 * use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
  eachOf(coll, _withoutIndex(iteratee), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`. The
 * iteratee is passed a `callback(err)` which must be called once it has
 * completed. If no error has occurred, the `callback` should be run without
 * arguments or with an explicit `null` argument. The array index is not passed
 * to the iteratee. Invoked with (item, callback). If you need the index, use
 * `eachOfLimit`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
  _eachOfLimit(limit)(coll, _withoutIndex(iteratee), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The iteratee is passed a `callback(err)` which must be called
 * once it has completed. If no error has occurred, the `callback` should be run
 * without arguments or with an explicit `null` argument. The array index is
 * not passed to the iteratee. Invoked with (item, callback). If you need the
 * index, use `eachOfSeries`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {Function} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in the
 * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
 * which must be called with a  boolean argument once it has completed. Invoked
 * with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = _createTester(eachOf, notId, notId);

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in the
 * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
 * which must be called with a  boolean argument once it has completed. Invoked
 * with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = _createTester(eachOfLimit, notId, notId);

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in the
 * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
 * which must be called with a  boolean argument once it has completed. Invoked
 * with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function _filter(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    var results = [];
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({ index: index, value: x });
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the
 * callback then `errback` is called with the error, and execution stops,
 * otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} fn - a function to call repeatedly. Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = ensureAsync(fn);

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} function - The function you want to eventually apply all
 * arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each value in `obj`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed value. Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    eachOfLimit(obj, limit, function (val, key, next) {
        iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each value and key in
 * `coll`. The iteratee is passed a `callback(err, transformed)` which must be
 * called once it has completed with an error (which can be `null`) and a
 * transformed value. Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each value in `obj`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed value. Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an `async` function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {Function} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function () {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([baseRest$1(function (args) {
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            })]));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `setImmediate`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @alias setImmediate
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        task(baseRest$1(function (err, args) {
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            callback(err);
        }));
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to run.
 * Each function is passed a `callback(err, result)` which it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
  _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Collection} tasks - A collection containing functions to run.
 * Each function is passed a `callback(err, result)` which it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
  _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} worker - An asynchronous function for processing a queued
 * task, which must call its `callback(err)` argument when finished, with an
 * optional `error` as an argument.  If you want to handle errors from an
 * individual task, pass a callback to `q.push()`. Invoked with
 * (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
  return queue(function (items, cb) {
    worker(items[0], cb);
  }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {Function} worker - An asynchronous function for processing a queued
 * task, which must call its `callback(err)` argument when finished, with an
 * optional `error` as an argument.  If you want to handle errors from an
 * individual task, pass a callback to `q.push()`. Invoked with
 * (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function (worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function (data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function () {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing functions to run. Each function
 * is passed a `callback(err, result)` which it must call on completion with an
 * error `err` (which can be `null`) and an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        tasks[i](callback);
    }
}

var slice = Array.prototype.slice;

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {Function} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction. The `iteratee` is passed a
 * `callback(err, reduction)` which accepts an optional error as its first
 * argument, and the state of the reduction as the second. If an error is
 * passed to the callback, the reduction is stopped and the main `callback` is
 * immediately called with the error. Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight(array, memo, iteratee, callback) {
  var reversed = slice.call(array).reverse();
  reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the function in another function that always returns data even when it
 * errors.
 *
 * The object returned has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(baseRest$1(function callback(err, cbArgs) {
            if (err) {
                reflectCallback(null, {
                    error: err
                });
            } else {
                var value = null;
                if (cbArgs.length === 1) {
                    value = cbArgs[0];
                } else if (cbArgs.length > 1) {
                    value = cbArgs;
                }
                reflectCallback(null, {
                    value: value
                });
            }
        }));

        return fn.apply(this, args);
    });
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function (value, cb) {
        iteratee(value, function (err, v) {
            if (err) {
                cb(err);
            } else {
                cb(null, !v);
            }
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * A helper function that wraps an array or an object of functions with reflect.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array} tasks - The array of functions to wrap in `async.reflect`.
 * @returns {Array} Returns an array of functions, each function wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function (task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {Function} task - A function which receives two arguments: (1) a
 * `callback(err, result)` which must be called when finished, passing `err`
 * (which can be `null`) and the `result` of the function's execution, and (2)
 * a `results` object, containing the results of the previously executed
 * functions (if nested inside another control flow). Invoked with
 * (callback, results).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // It can also be embedded within other control flow functions to retry
 * // individual methods that are not as reliable, like this:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retry(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ? t.interval : constant(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var attempt = 1;
    function retryAttempt() {
        task(function (err) {
            if (err && attempt++ < options.times && (typeof options.errorFilter != 'function' || options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method wraps a task and makes it
 * retryable, rather than immediately calling it with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {Function} task - the asynchronous function to wrap
 * @returns {Functions} The wrapped function, which when invoked, will retry on
 * an error, based on the parameters specified in `opts`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            task.apply(null, args.concat([cb]));
        }

        if (opts) retry(opts, taskFn, callback);else retry(taskFn, callback);
    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to run, each
 * function is passed a `callback(err, result)` it must call on completion with
 * an error `err` (which can be `null`) and an optional `result` value.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
  _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in the array
 * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
 * be called with a boolean argument once it has completed. Invoked with
 * (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = _createTester(eachOf, Boolean, identity);

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in the array
 * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
 * be called with a boolean argument once it has completed. Invoked with
 * (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = _createTester(eachOfLimit, Boolean, identity);

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in the array
 * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
 * be called with a boolean argument once it has completed. Invoked with
 * (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, sortValue)` which must be called once
 * it has completed with an error (which can be `null`) and a value to use as
 * the sort criteria. Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy(coll, iteratee, callback) {
    map(coll, function (x, callback) {
        iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, { value: x, criteria: criteria });
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria,
            b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} asyncFn - The asynchronous function you want to set the
 * time limit.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {Function} Returns a wrapped function that can be used with any of
 * the control flow functions. Invoke this function with the same
 * parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var originalCallback, timer;
    var timedOut = false;

    function injectedCallback() {
        if (!timedOut) {
            originalCallback.apply(null, arguments);
            clearTimeout(timer);
        }
    }

    function timeoutCallback() {
        var name = asyncFn.name || 'anonymous';
        var error = new Error('Callback function "' + name + '" timed out.');
        error.code = 'ETIMEDOUT';
        if (info) {
            error.info = info;
        }
        timedOut = true;
        originalCallback(error);
    }

    return initialParams(function (args, origCallback) {
        originalCallback = origCallback;
        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        asyncFn.apply(null, args.concat(injectedCallback));
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax$1 = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax$1(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
  mapLimit(baseRange(0, count, 1), limit, iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {Function} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator. The `iteratee` is
 * passed a `callback(err)` which accepts an optional error as its first
 * argument. If an error is passed to the callback, the transform is stopped
 * and the main `callback` is immediately called with the error.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform(coll, accumulator, iteratee, callback) {
    if (arguments.length === 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);

    eachOf(coll, function (v, k, cb) {
        iteratee(accumulator, v, k, cb);
    }, function (err) {
        callback(err, accumulator);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {Function} fn - the memoized function
 * @returns {Function} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {Function} iteratee - A function which is called each time `test` passes.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    if (!test()) return callback(null);
    var next = baseRest$1(function (err, args) {
        if (err) return callback(err);
        if (test()) return iteratee(next);
        callback.apply(null, [null].concat(args));
    });
    iteratee(next);
}

/**
 * Repeatedly call `fn` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `fn`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `fn`. Invoked with ().
 * @param {Function} fn - A function which is called each time `test` fails.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `fn`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, fn, callback) {
    whilst(function () {
        return !test.apply(this, arguments);
    }, fn, callback);
}

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
var waterfall = function (tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        if (taskIndex === tasks.length) {
            return callback.apply(null, [null].concat(args));
        }

        var taskCallback = onlyOnce(baseRest$1(function (err, args) {
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

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 */

/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */
var index = {
  applyEach: applyEach,
  applyEachSeries: applyEachSeries,
  apply: apply$2,
  asyncify: asyncify,
  auto: auto,
  autoInject: autoInject,
  cargo: cargo,
  compose: compose,
  concat: concat,
  concatSeries: concatSeries,
  constant: constant$2,
  detect: detect,
  detectLimit: detectLimit,
  detectSeries: detectSeries,
  dir: dir,
  doDuring: doDuring,
  doUntil: doUntil,
  doWhilst: doWhilst,
  during: during,
  each: eachLimit,
  eachLimit: eachLimit$1,
  eachOf: eachOf,
  eachOfLimit: eachOfLimit,
  eachOfSeries: eachOfSeries,
  eachSeries: eachSeries,
  ensureAsync: ensureAsync,
  every: every,
  everyLimit: everyLimit,
  everySeries: everySeries,
  filter: filter,
  filterLimit: filterLimit,
  filterSeries: filterSeries,
  forever: forever,
  log: log,
  map: map,
  mapLimit: mapLimit,
  mapSeries: mapSeries,
  mapValues: mapValues,
  mapValuesLimit: mapValuesLimit,
  mapValuesSeries: mapValuesSeries,
  memoize: memoize,
  nextTick: nextTick,
  parallel: parallelLimit,
  parallelLimit: parallelLimit$1,
  priorityQueue: priorityQueue,
  queue: queue$1,
  race: race,
  reduce: reduce,
  reduceRight: reduceRight,
  reflect: reflect,
  reflectAll: reflectAll,
  reject: reject,
  rejectLimit: rejectLimit,
  rejectSeries: rejectSeries,
  retry: retry,
  retryable: retryable,
  seq: seq$1,
  series: series,
  setImmediate: setImmediate$1,
  some: some,
  someLimit: someLimit,
  someSeries: someSeries,
  sortBy: sortBy,
  timeout: timeout,
  times: times,
  timesLimit: timeLimit,
  timesSeries: timesSeries,
  transform: transform,
  unmemoize: unmemoize,
  until: until,
  waterfall: waterfall,
  whilst: whilst,

  // aliases
  all: every,
  any: some,
  forEach: eachLimit,
  forEachSeries: eachSeries,
  forEachLimit: eachLimit$1,
  forEachOf: eachOf,
  forEachOfSeries: eachOfSeries,
  forEachOfLimit: eachOfLimit,
  inject: reduce,
  foldl: reduce,
  foldr: reduceRight,
  select: filter,
  selectLimit: filterLimit,
  selectSeries: filterSeries,
  wrapSync: asyncify
};

exports['default'] = index;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.apply = apply$2;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatSeries = concatSeries;
exports.constant = constant$2;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq$1;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(6)(module), __webpack_require__(54).setImmediate, __webpack_require__(1)))

/***/ }),
/* 16 */
/***/ (function(module, exports) {

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


/***/ }),
/* 17 */
/***/ (function(module, exports) {

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


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 19 */
/***/ (function(module, exports) {

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


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(7),
    isObject = __webpack_require__(23);

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


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(8);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 23 */
/***/ (function(module, exports) {

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


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

const Emitter = __webpack_require__(5);

/**
 * @class Event
 * Represents an {@link Chat} event.
 * @fires $"."emitted
 * @extends Emitter
 * @extends RootEmitter
 */
class Event extends Emitter {

    constructor(chatEngine, chat, event) {

        super();

        /**
         * @private
         */
        this.chatEngine = chatEngine;

        /**
         * The {@link Chat#channel} that this event is registered to.
         * @type String
         * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         * @readonly
         */
        this.channel = chat.channel;

        /**
         * Events are always a property of a {@link Chat}. Responsible for
         * listening to specific events and firing events when they occur.
         * @readonly
         * @type {Chat}
         */
        this.chat = chat;

        /**
         * The string representation of the event. This is supplied as the first parameter to {@link Chat#on}
         * @type {String}
         */
        this.event = event;

        /**
         * A name that identifies this class
         * @type {String}
         */
        this.name = 'Event';

        return this;

    }

    /**
     Publishes the event over the PubNub network to the {@link Event} channel

     @private
     @param {Object} data The event payload object
     */
    publish(m) {

        m.event = this.event;

        this.chatEngine.pubnub.publish({
            message: m,
            channel: this.channel
        }, (status, response) => {

            if (status.statusCode === 200) {

                if (response) {
                    m.timetoken = response.timetoken;
                }

                /**
                 * Message successfully published
                 * @event Event#$"."emitted"
                 * @param {Object} data The message payload
                 */
                this._emit('$.emitted', m);

            } else {

                /**
                 * There was a problem publishing over the PubNub network.
                 * @event Chat#$"."error"."publish
                 */
                this.chatEngine.throwError(this, '_emit', 'emitter', new Error('There was a problem publishing over the PubNub network.'), status);
            }

        });

    }

}

module.exports = Event;



/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(20),
    isLength = __webpack_require__(27);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

const Emitter = __webpack_require__(3);

/**
This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
@class User
@extends Emitter
@extends RootEmitter
@param {User#uuid} uuid A unique identifier for this user.
@param {User#state} state The {@link User}'s state object synchronized between all clients of the chat.
 */
class User extends Emitter {

    constructor(chatEngine, uuid, state = {}) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'User';

        /**
         The User's unique identifier, usually a device uuid. This helps ChatEngine identify the user between events. This is public id exposed to the network.
         Check out [the wikipedia page on UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier).

         @readonly
         @type String
         */

        this.uuid = uuid;

        /**
         * Gets the user state. See {@link Me#update} for how to assign state values.
         * @return {Object} Returns a generic JSON object containing state information.
         * @example
         *
         * // State
         * let state = user.state;
         */
        this.state = {};

        this._stateFetched = false;

        this._stateInProgress = false;

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
        this.feed = new this.chatEngine.Chat([chatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

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
        this.direct = new this.chatEngine.Chat([chatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name === 'Me', {}, 'system');

        // if the user does not exist at all and we get enough
        // information to build the user
        if (!chatEngine.users[uuid]) {
            chatEngine.users[uuid] = this;
        }

        // update this user's state in it's created context
        this.assign(state);

        return this;

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
    assign(state) {
        this.update(state);
    }

    /**
    Get stored user state from remote server.
    @private
    */
    _getState(callback) {

        if (!this._stateFetched && !this._stateInProgress) {

            this._stateInProgress = true;

            this.chatEngine.pubnub.getState({
                uuid: this.uuid,
                channels: [this.chatEngine.global.channel]
            }, (status, response) => {

                if (status.statusCode === 200) {

                    let pnState = response.channels[this.chatEngine.global.channel];
                    if (Object.keys(pnState).length) {

                        this.assign(response.data);
                        this._stateFetched = true;
                        callback(this.state);

                    } else {

                        this.chatEngine.request('get', 'user_state', {
                            user: this.uuid
                        }).then((res) => {

                            this.assign(res.data);
                            this._stateFetched = true;
                            callback(this.state);

                        }).catch((err) => {
                            this.chatEngine.throwError(this, 'trigger', 'getState', err);
                        });

                    }

                } else {
                    this.chatEngine.throwError(this, 'trigger', 'getState', new Error('There was a problem getting user state from the PubNub network.'));
                }

            });

        } else {
            callback(this.state);
        }

    }


}

module.exports = User;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

const init = __webpack_require__(30);

/**
Global object used to create an instance of {@link ChatEngine}.

@alias ChatEngineCore
@param pnConfig {Object} ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See the getting started tutorial and [the PubNub docs](https://www.pubnub.com/docs/java-se-java/api-reference-configuration).
@param ceConfig {Object} A list of ChatEngine specific configuration options.
@param [ceConfig.globalChannel=chat-engine] {String} The root channel. See {@link ChatEngine.global}
@param [ceConfig.enableSync] {Boolean} Synchronizes chats between instances with the same {@link Me#uuid}. See {@link Me#sync}.
@param [ceConfig.throwErrors=true] {Boolean} Throws errors in JS console.
@param [ceConfig.endpoint='https://pubsub.pubnub.com/v1/blocks/sub-key/YOUR_SUB_KEY/chat-engine-server'] {String} The root URL of the server used to manage permissions for private channels. Set by default to match the PubNub functions deployed to your account. See {@tutorial privacy} for more.
@param [ceConfig.debug] {Boolean} Logs all ChatEngine events to the console.
@return {ChatEngine} Returns an instance of {@link ChatEngine}
@example
ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
*/

const create = (pnConfig, ceConfig = {}) => {

    if (ceConfig.globalChannel) {
        ceConfig.globalChannel = ceConfig.globalChannel.toString();
    } else {
        ceConfig.globalChannel = 'chat-engine';
    }

    if (typeof ceConfig.throwErrors === 'undefined') {
        ceConfig.throwErrors = true;
    }

    if (typeof ceConfig.enableSync === 'undefined') {
        ceConfig.enableSync = false;
    }

    ceConfig.endpoint = ceConfig.endpoint || 'https://pubsub.pubnub.com/v1/blocks/sub-key/' + pnConfig.subscribeKey + '/chat-engine-server';

    pnConfig.heartbeatInterval = pnConfig.heartbeatInterval || 30;
    pnConfig.presenceTimeout = pnConfig.presenceTimeout || 60;

    pnConfig.keepAlive = true;
    pnConfig.keepAliveSettings = {
        keepAlive: true,
        timeout: 5 * 1000 * 60
    };

    // return an instance of ChatEngine
    return init(ceConfig, pnConfig);

};

// export the ChatEngine api
const ChatEngineCore = {
    plugin: {},
    create: create
};

module.exports = ChatEngineCore;

module.exports.ChatEngineCore = ChatEngineCore;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(31);
const PubNub = __webpack_require__(50);
const pack = __webpack_require__(51);

const RootEmitter = __webpack_require__(5);
const Chat = __webpack_require__(53);
const Me = __webpack_require__(98);
const User = __webpack_require__(28);
const async = __webpack_require__(15);

/**
@class ChatEngine
@extends RootEmitter
@return {ChatEngine} Returns an instance of {@link ChatEngine}
*/
module.exports = (ceConfig = {}, pnConfig = {}) => {

    // Create the root ChatEngine object
    let ChatEngine = new RootEmitter();

    ChatEngine.ceConfig = ceConfig;
    ChatEngine.pnConfig = pnConfig;

    /**
     * A map of all known {@link User}s in this instance of ChatEngine.
     * @type {Object}
     * @memberof ChatEngine
     */
    ChatEngine.users = {};

    /**
     * A map of all known {@link Chat}s in this instance of ChatEngine.
     * @memberof ChatEngine
     * @type {Object}
     */
    ChatEngine.chats = {};

    /**
     * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
     * @member {Chat} global
     * @memberof ChatEngine
     */
    ChatEngine.global = false;

    /**
     * This instance of ChatEngine represented as a special {@link User} know as {@link Me}.
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
     * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event.
     * @member {Object} ready
     * @memberof ChatEngine
     */
    ChatEngine.ready = false;

    /**
     * The package.json for ChatEngine. Used mainly for detecting package version.
     * @type {Object}
     */
    ChatEngine.package = pack;

    ChatEngine.throwError = (self, cb, key, ceError, payload = {}) => {

        if (ceConfig.throwErrors) {
            // throw ceError;
            console.error(payload);
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    };

    let countObject = {};

    if (ceConfig.debug) {

        ChatEngine.onAny((event, payload) => {

            console.info('debug:', event, payload);

            countObject['event: ' + event] = countObject[event] || 0;
            countObject['event: ' + event] += 1;

        });

    }

    if (ceConfig.profiling) {

        setInterval(() => {

            countObject.chats = Object.keys(ChatEngine.chats).length;
            countObject.users = Object.keys(ChatEngine.users).length;

            console.table(countObject);

        }, 3000);

    }

    ChatEngine.protoPlugins = {};

    /**
     * Bind a plugin to all future instances of a Class.
     * @method ChatEngine#proto
     * @param  {String} className The string representation of a class to bind to
     * @param  {Class} plugin The plugin function.
     */
    ChatEngine.proto = (className, plugin) => {
        ChatEngine.protoPlugins[className] = ChatEngine.protoPlugins[className] || [];
        ChatEngine.protoPlugins[className].push(plugin);
    };

    /**
     * @private
     */
    ChatEngine.request = (method, route, inputBody = {}, inputParams = {}) => {

        let body = {
            uuid: ChatEngine.pnConfig.uuid,
            global: ceConfig.globalChannel,
            authKey: ChatEngine.pnConfig.authKey
        };

        let params = {
            route
        };

        body = Object.assign(body, inputBody);
        params = Object.assign(params, inputParams);

        if (method === 'get' || method === 'delete') {
            params = Object.assign(params, body);
            return axios[method](ceConfig.endpoint, { params });
        } else {
            return axios[method](ceConfig.endpoint, body, { params });
        }


    };

    /**
     * Parse a channel name into chat object parts
     * @private
     */
    ChatEngine.parseChannel = (channel) => {

        let info = channel.split('#');

        return {
            global: info[0],
            type: info[1],
            private: info[2] === 'private.'
        };

    };

    /**
     * Get the internal channel name of supplied string
     * @private
     */
    ChatEngine.augmentChannel = (original = new Date().getTime(), isPrivate = true) => {

        let channel = original.toString();

        // public.* has PubNub permissions for everyone to read and write
        // private.* is totally locked down and users must be granted access one by one
        let chanPrivString = 'public.';

        if (isPrivate) {
            chanPrivString = 'private.';
        }

        if (channel.indexOf(ChatEngine.ceConfig.globalChannel) === -1) {
            channel = [ChatEngine.ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
        }

        return channel;

    };

    /**
     * Initial communication with the server. Server grants permissions to
     * talk in chats, etc.
     * @private
     */
    ChatEngine.handshake = (complete) => {

        async.series([
            (next) => {
                ChatEngine.request('post', 'bootstrap').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'user_read').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'user_write').then(() => {
                    next(null);
                }).catch(next);
            },
            (next) => {
                ChatEngine.request('post', 'group').then(complete).catch(next);
            }
        ], (error) => {
            if (error) {
                ChatEngine.throwError(ChatEngine, '_emit', 'auth', new Error('There was a problem logging into the auth server (' + ceConfig.endpoint + ').' + error && error.response && error.response.data), { error });
            }
        });

    };

    /**
     * @private
     * Listen to PubNub events and forward them into ChatEngine system.
     */
    ChatEngine.listenToPubNub = () => {

        /**
         Fires when PubNub network connection changes.

         @private
         @param {Object} statusEvent The response status
         */
        ChatEngine.pubnub.addListener({
            message: (m) => {

                // assign the message timetoken as a property of the payload
                m.message.timetoken = m.timetoken;

                if (ChatEngine.chats[m.channel]) {
                    ChatEngine.chats[m.channel].trigger(m.message.event, m.message);
                }

            },
            presence: (payload) => {

                if (ChatEngine.chats[payload.channel]) {
                    ChatEngine.chats[payload.channel].onPresence(payload);
                }

            },
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

                // map the pubnub events into ChatEngine events
                let categories = {
                    PNNetworkUpCategory: 'up.online',
                    PNNetworkDownCategory: 'down.offline',
                    PNNetworkIssuesCategory: 'down.issue',
                    PNReconnectedCategory: 'up.reconnected',
                    PNConnectedCategory: 'up.connected',
                    PNAccessDeniedCategory: 'down.denied',
                    PNMalformedResponseCategory: 'down.malformed',
                    PNBadRequestCategory: 'down.badrequest',
                    PNDecryptionErrorCategory: 'down.decryption',
                    PNTimeoutCategory: 'down.timeout'
                };

                let eventName = ['$', 'network', categories[statusEvent.category] || 'other'].join('.');

                if (statusEvent.affectedChannels) {
                    statusEvent.affectedChannels.forEach((channel) => {

                        let chat = ChatEngine.chats[channel];

                        if (chat) {
                            // connected category tells us the chat is ready
                            if (statusEvent.category === 'PNConnectedCategory') {
                                chat.connectionReady();
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

    };

    /**
     * @private
     * Subscribe to PubNub and begin receiving events.
     */
    ChatEngine.subscribeToPubNub = () => {

        let chanGroups = [
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#rooms',
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#system',
            ceConfig.globalChannel + '#' + ChatEngine.me.uuid + '#custom'
        ];

        ChatEngine.pubnub.subscribe({
            channelGroups: chanGroups,
            withPresence: true
        });

    };

    /**
     * Initialize ChatEngine modules on first time boot.
     * @private
     */
    ChatEngine.firstConnect = (state) => {

        ChatEngine.pubnub = new PubNub(ChatEngine.pnConfig);

        // create a new chat to use as global chat
        // we don't do auth on this one because it's assumed to be done with the /auth request below
        ChatEngine.global = new ChatEngine.Chat(ceConfig.globalChannel, false, true, {}, 'system');

        ChatEngine.global.once('$.connected', () => {

            // build the current user
            ChatEngine.me = new Me(ChatEngine, ChatEngine.pnConfig.uuid);

            /**
            * Fired when a {@link Me} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."me
            * @example
            * ChatEngine.on('$.created.me', (data, me) => {
            *     console.log('Me was created', me);
            * });
            */
            ChatEngine.me.onConstructed();

            if (ChatEngine.ceConfig.enableSync) {
                ChatEngine.me.session.subscribe();
                ChatEngine.me.session.restore();
            }

            ChatEngine.me.update(state);

            /**
             *  Fired when ChatEngine is connected to the internet and ready to go!
             * @event ChatEngine#$"."ready
             * @example
             * ChatEngine.on('$.ready', (data) => {
             *     let me = data.me;
             * })
             */

            ChatEngine._emit('$.ready', {
                me: ChatEngine.me
            });

            ChatEngine.ready = true;

            ChatEngine.listenToPubNub();
            ChatEngine.subscribeToPubNub();

            ChatEngine.global.getUserUpdates();

        });

    };

    /**
     * Disconnect from all {@link Chat}s and mark them as asleep.
     * @example
     *
     * // create a new chat
     * let chat = new ChatEngine.Chat(new Date().getTime());
     *
     * // disconnect from ChatEngine
     * ChatEngine.disconnect();
     *
     * // every individual chat will be disconnected
     * chat.on('$.disconnected', () => {
     *     done();
     * });
     *
     * // Changing User:
     * ChatEngine.disconnect()
     * ChatEngine = new ChatEngine({}, {});
     * ChatEngine.connect()
     */
    ChatEngine.disconnect = () => {

        // Unsubscribe from all PubNub chats
        ChatEngine.pubnub.unsubscribeAll();

        // for every chat in ChatEngine.chats, signal disconnected
        Object.keys(ChatEngine.chats).forEach((key) => {
            ChatEngine.chats[key].sleep();
        });

    };

    /**
     * Performs authentication with server and restores connection
     * to all sleeping chats.
     * @example
     *
     * // create a new chat
     * let chat = new ChatEngine.Chat(new Date().getTime());
     *
     * // disconnect from ChatEngine
     * ChatEngine.disconnect();
     *
     * // reconnect sometime later
     * ChatEngine.reconnect();
     *
     */
    ChatEngine.reconnect = () => {

        // do the whole auth flow with the new authKey
        ChatEngine.handshake(() => {

            // for every chat in ChatEngine.chats, call .connect()
            Object.keys(ChatEngine.chats).forEach((key) => {
                ChatEngine.chats[key].wake();
            });

            ChatEngine.subscribeToPubNub();

        });

    };

    /**
    @private
    */
    ChatEngine.setAuth = (authKey = PubNub.generateUUID()) => {

        ChatEngine.pnConfig.authKey = authKey;
        ChatEngine.pubnub.setAuthKey(authKey);

    };

    /**
     * Disconnects, changes authentication token, performs handshake with server
     * and reconnects with new auth key. Used for extending logged in sessions
     * for active users.
     * @example
     * // early
     * ChatEngine.connect(...);
     *
     * ChatEngine.once('$.connected', () => {
     *     // first connection established
     * });
     *
     * // some time passes, session token expires
     * ChatEngine.reauthorize(authKey);
     *
     * // we are connected again
     * ChatEngine.once('$.connected', () => {
     *     // we are connected again
     * });
     */
    ChatEngine.reauthorize = (authKey = PubNub.generateUUID()) => {

        ChatEngine.global.once('$.disconnected', () => {

            ChatEngine.setAuth(authKey);
            ChatEngine.reconnect();

        });

        ChatEngine.disconnect();

    };

    /**
     * Connect to realtime service and create instance of {@link Me}
     * @method ChatEngine#connect
     * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc. Must be alphanumeric.
     * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
     * @param {String} [authKey] A authentication secret. Will be sent to authentication backend for validation. This is usually an access token. See {@tutorial auth} for more.
     * @fires $"."connected
     */
    ChatEngine.connect = (uuid, state = {}, authKey = PubNub.generateUUID()) => {

        // this creates a user known as Me and
        // connects to the global chatroom
        ChatEngine.pnConfig.uuid = uuid;
        ChatEngine.pnConfig.authKey = authKey;

        ChatEngine.handshake(() => {
            ChatEngine.firstConnect(state);
        });

    };

    ChatEngine.destroy = () => {

        Object.keys(ChatEngine.chats).forEach((chat) => {
            ChatEngine.chats[chat].emitter.removeAllListeners();
        });

        Object.keys(ChatEngine.users).forEach((user) => {
            ChatEngine.users[user].emitter.removeAllListeners();
        });

        ChatEngine.emitter.removeAllListeners();

    };

    /**
     * The {@link Chat} class. Creates a new Chat when initialized, or returns an existing instance if chat has already been created.
     * @member {Chat} Chat
     * @memberof ChatEngine
     * @see {@link Chat}
     */
    ChatEngine.Chat = function (...args) {

        let internalChannel = ChatEngine.augmentChannel(args[0], args[1]);

        if (ChatEngine.chats[internalChannel]) {
            return ChatEngine.chats[internalChannel];
        } else {

            let newChat = new Chat(ChatEngine, ...args);

            /**
            * Fired when a {@link Chat} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."chat
            * @example
            * ChatEngine.on('$.created.chat', (data, chat) => {
            *     console.log('Chat was created', chat);
            * });
            */
            newChat.onConstructed();

            return newChat;

        }

    };

    /**
     * The {@link User} class. Creates a new User when initialized, or returns an existing instance if chat has already been created.
     * @member {User} User
     * @memberof ChatEngine
     * @see {@link User}
     */
    ChatEngine.User = function (...args) {

        if (ChatEngine.me.uuid === args[0]) {
            return ChatEngine.me;
        } else if (ChatEngine.users[args[0]]) {
            return ChatEngine.users[args[0]];
        } else {

            let newUser = new User(ChatEngine, ...args);

            /**
            * Fired when a {@link User} has been created within ChatEngine.
            * @event ChatEngine#$"."created"."user
            * @example
            * ChatEngine.on('$.created.user', (data, user) => {
            *     console.log('Chat was created', user);
            * });
            */
            newUser.onConstructed();

            return newUser;

        }

    };

    return ChatEngine;

};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(32);

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);
var bind = __webpack_require__(10);
var Axios = __webpack_require__(34);
var defaults = __webpack_require__(4);

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
axios.Cancel = __webpack_require__(14);
axios.CancelToken = __webpack_require__(48);
axios.isCancel = __webpack_require__(13);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(49);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
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


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(4);
var utils = __webpack_require__(0);
var InterceptorManager = __webpack_require__(43);
var dispatchRequest = __webpack_require__(44);
var isAbsoluteURL = __webpack_require__(46);
var combineURLs = __webpack_require__(47);

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


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(12);

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


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);
var transformData = __webpack_require__(45);
var isCancel = __webpack_require__(13);
var defaults = __webpack_require__(4);

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


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

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


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(14);

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


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.PubNub=t():e.PubNub=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){if(!navigator||!navigator.sendBeacon)return!1;navigator.sendBeacon(e)}Object.defineProperty(t,"__esModule",{value:!0});var u=n(1),c=r(u),l=n(39),h=r(l),f=n(40),p=r(f),d=n(41),y=(n(5),function(e){function t(e){i(this,t);var n=e.listenToBrowserNetworkEvents,r=void 0===n||n;e.db=p.default,e.sdkFamily="Web",e.networking=new h.default({del:d.del,get:d.get,post:d.post,sendBeacon:a});var o=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r&&(window.addEventListener("offline",function(){o.networkDownDetected()}),window.addEventListener("online",function(){o.networkUpDetected()})),o}return o(t,e),t}(c.default));t.default=y,e.exports=t.default},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),u=i(a),c=n(6),l=i(c),h=n(8),f=i(h),p=n(9),d=i(p),y=n(16),g=i(y),b=n(17),v=r(b),_=n(18),m=r(_),k=n(19),P=r(k),O=n(20),S=r(O),w=n(21),T=r(w),C=n(22),M=r(C),E=n(23),x=r(E),N=n(24),R=r(N),A=n(25),D=r(A),K=n(26),j=r(K),U=n(27),G=r(U),I=n(28),H=r(I),B=n(29),L=r(B),q=n(30),F=r(q),z=n(31),X=r(z),W=n(32),$=r(W),J=n(33),V=r(J),Q=n(34),Y=r(Q),Z=n(35),ee=r(Z),te=n(36),ne=r(te),re=n(37),ie=r(re),se=n(12),oe=r(se),ae=n(38),ue=r(ae),ce=n(13),le=i(ce),he=n(10),fe=i(he),pe=(n(5),n(3)),de=i(pe),ye=function(){function e(t){var n=this;s(this,e);var r=t.db,i=t.networking,o=this._config=new u.default({setup:t,db:r}),a=new l.default({config:o});i.init(o);var c={config:o,networking:i,crypto:a},h=g.default.bind(this,c,oe),p=g.default.bind(this,c,j),y=g.default.bind(this,c,H),b=g.default.bind(this,c,F),_=g.default.bind(this,c,ue),k=this._listenerManager=new d.default,O=new f.default({timeEndpoint:h,leaveEndpoint:p,heartbeatEndpoint:y,setStateEndpoint:b,subscribeEndpoint:_,crypto:c.crypto,config:c.config,listenerManager:k});this.addListener=k.addListener.bind(k),this.removeListener=k.removeListener.bind(k),this.removeAllListeners=k.removeAllListeners.bind(k),this.channelGroups={listGroups:g.default.bind(this,c,S),listChannels:g.default.bind(this,c,T),addChannels:g.default.bind(this,c,v),removeChannels:g.default.bind(this,c,m),deleteGroup:g.default.bind(this,c,P)},this.push={addChannels:g.default.bind(this,c,M),removeChannels:g.default.bind(this,c,x),deleteDevice:g.default.bind(this,c,D),listChannels:g.default.bind(this,c,R)},this.hereNow=g.default.bind(this,c,X),this.whereNow=g.default.bind(this,c,G),this.getState=g.default.bind(this,c,L),this.setState=O.adaptStateChange.bind(O),this.grant=g.default.bind(this,c,V),this.audit=g.default.bind(this,c,$),this.publish=g.default.bind(this,c,Y),this.fire=function(e,t){return e.replicate=!1,e.storeInHistory=!1,n.publish(e,t)},this.history=g.default.bind(this,c,ee),this.deleteMessages=g.default.bind(this,c,ne),this.fetchMessages=g.default.bind(this,c,ie),this.time=h,this.subscribe=O.adaptSubscribeChange.bind(O),this.presence=O.adaptPresenceChange.bind(O),this.unsubscribe=O.adaptUnsubscribeChange.bind(O),this.disconnect=O.disconnect.bind(O),this.reconnect=O.reconnect.bind(O),this.destroy=function(e){O.unsubscribeAll(e),O.disconnect()},this.stop=this.destroy,this.unsubscribeAll=O.unsubscribeAll.bind(O),this.getSubscribedChannels=O.getSubscribedChannels.bind(O),this.getSubscribedChannelGroups=O.getSubscribedChannelGroups.bind(O),this.encrypt=a.encrypt.bind(a),this.decrypt=a.decrypt.bind(a),this.getAuthKey=c.config.getAuthKey.bind(c.config),this.setAuthKey=c.config.setAuthKey.bind(c.config),this.setCipherKey=c.config.setCipherKey.bind(c.config),this.getUUID=c.config.getUUID.bind(c.config),this.setUUID=c.config.setUUID.bind(c.config),this.getFilterExpression=c.config.getFilterExpression.bind(c.config),this.setFilterExpression=c.config.setFilterExpression.bind(c.config),this.setHeartbeatInterval=c.config.setHeartbeatInterval.bind(c.config),i.hasModule("proxy")&&(this.setProxy=function(e){c.config.setProxy(e),n.reconnect()})}return o(e,[{key:"getVersion",value:function(){return this._config.getVersion()}},{key:"networkDownDetected",value:function(){this._listenerManager.announceNetworkDown(),this._config.restore?this.disconnect():this.destroy(!0)}},{key:"networkUpDetected",value:function(){this._listenerManager.announceNetworkUp(),this.reconnect()}}],[{key:"generateUUID",value:function(){return de.default.createUUID()}}]),e}();ye.OPERATIONS=le.default,ye.CATEGORIES=fe.default,t.default=ye,e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(3),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=(n(5),function(){function e(t){var n=t.setup,i=t.db;r(this,e),this._db=i,this.instanceId="pn-"+o.default.createUUID(),this.secretKey=n.secretKey||n.secret_key,this.subscribeKey=n.subscribeKey||n.subscribe_key,this.publishKey=n.publishKey||n.publish_key,this.sdkName=n.sdkName,this.sdkFamily=n.sdkFamily,this.partnerId=n.partnerId,this.setAuthKey(n.authKey),this.setCipherKey(n.cipherKey),this.setFilterExpression(n.filterExpression),this.origin=n.origin||"pubsub.pndsn.com",this.secure=n.ssl||!1,this.restore=n.restore||!1,this.proxy=n.proxy,this.keepAlive=n.keepAlive,this.keepAliveSettings=n.keepAliveSettings,this.autoNetworkDetection=n.autoNetworkDetection||!1,this.dedupeOnSubscribe=n.dedupeOnSubscribe||!1,this.maximumCacheSize=n.maximumCacheSize||100,this.customEncrypt=n.customEncrypt,this.customDecrypt=n.customDecrypt,"undefined"!=typeof location&&"https:"===location.protocol&&(this.secure=!0),this.logVerbosity=n.logVerbosity||!1,this.suppressLeaveEvents=n.suppressLeaveEvents||!1,this.announceFailedHeartbeats=n.announceFailedHeartbeats||!0,this.announceSuccessfulHeartbeats=n.announceSuccessfulHeartbeats||!1,this.useInstanceId=n.useInstanceId||!1,this.useRequestId=n.useRequestId||!1,this.requestMessageCountThreshold=n.requestMessageCountThreshold,this.setTransactionTimeout(n.transactionalRequestTimeout||15e3),this.setSubscribeTimeout(n.subscribeRequestTimeout||31e4),this.setSendBeaconConfig(n.useSendBeacon||!0),this.setPresenceTimeout(n.presenceTimeout||300),null!=n.heartbeatInterval&&this.setHeartbeatInterval(n.heartbeatInterval),this.setUUID(this._decideUUID(n.uuid))}return i(e,[{key:"getAuthKey",value:function(){return this.authKey}},{key:"setAuthKey",value:function(e){return this.authKey=e,this}},{key:"setCipherKey",value:function(e){return this.cipherKey=e,this}},{key:"getUUID",value:function(){return this.UUID}},{key:"setUUID",value:function(e){return this._db&&this._db.set&&this._db.set(this.subscribeKey+"uuid",e),this.UUID=e,this}},{key:"getFilterExpression",value:function(){return this.filterExpression}},{key:"setFilterExpression",value:function(e){return this.filterExpression=e,this}},{key:"getPresenceTimeout",value:function(){return this._presenceTimeout}},{key:"setPresenceTimeout",value:function(e){return this._presenceTimeout=e,this.setHeartbeatInterval(this._presenceTimeout/2-1),this}},{key:"setProxy",value:function(e){this.proxy=e}},{key:"getHeartbeatInterval",value:function(){return this._heartbeatInterval}},{key:"setHeartbeatInterval",value:function(e){return this._heartbeatInterval=e,this}},{key:"getSubscribeTimeout",value:function(){return this._subscribeRequestTimeout}},{key:"setSubscribeTimeout",value:function(e){return this._subscribeRequestTimeout=e,this}},{key:"getTransactionTimeout",value:function(){return this._transactionalRequestTimeout}},{key:"setTransactionTimeout",value:function(e){return this._transactionalRequestTimeout=e,this}},{key:"isSendBeaconEnabled",value:function(){return this._useSendBeacon}},{key:"setSendBeaconConfig",value:function(e){return this._useSendBeacon=e,this}},{key:"getVersion",value:function(){return"4.20.1"}},{key:"_decideUUID",value:function(e){return e||(this._db&&this._db.get&&this._db.get(this.subscribeKey+"uuid")?this._db.get(this.subscribeKey+"uuid"):"pn-"+o.default.createUUID())}}]),e}());t.default=a,e.exports=t.default},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(4),i=function(e){return e&&e.__esModule?e:{default:e}}(r);t.default={createUUID:function(){return i.default.uuid?i.default.uuid():(0,i.default)()}},e.exports=t.default},function(e,t,n){var r,i,s;!function(n,o){i=[t],r=o,void 0!==(s="function"==typeof r?r.apply(t,i):r)&&(e.exports=s)}(0,function(e){function t(){var e,t,n="";for(e=0;e<32;e++)t=16*Math.random()|0,8!==e&&12!==e&&16!==e&&20!==e||(n+="-"),n+=(12===e?4:16===e?3&t|8:t).toString(16);return n}function n(e,t){var n=r[t||"all"];return n&&n.test(e)||!1}var r={3:/^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,4:/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,5:/^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,all:/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i};t.isUUID=n,t.VERSION="0.1.0",e.uuid=t,e.isUUID=n})},function(e,t){"use strict";e.exports={}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(2),a=(r(o),n(7)),u=r(a),c=function(){function e(t){var n=t.config;i(this,e),this._config=n,this._iv="0123456789012345",this._allowedKeyEncodings=["hex","utf8","base64","binary"],this._allowedKeyLengths=[128,256],this._allowedModes=["ecb","cbc"],this._defaultOptions={encryptKey:!0,keyEncoding:"utf8",keyLength:256,mode:"cbc"}}return s(e,[{key:"HMACSHA256",value:function(e){return u.default.HmacSHA256(e,this._config.secretKey).toString(u.default.enc.Base64)}},{key:"SHA256",value:function(e){return u.default.SHA256(e).toString(u.default.enc.Hex)}},{key:"_parseOptions",value:function(e){var t=e||{};return t.hasOwnProperty("encryptKey")||(t.encryptKey=this._defaultOptions.encryptKey),t.hasOwnProperty("keyEncoding")||(t.keyEncoding=this._defaultOptions.keyEncoding),t.hasOwnProperty("keyLength")||(t.keyLength=this._defaultOptions.keyLength),t.hasOwnProperty("mode")||(t.mode=this._defaultOptions.mode),-1===this._allowedKeyEncodings.indexOf(t.keyEncoding.toLowerCase())&&(t.keyEncoding=this._defaultOptions.keyEncoding),-1===this._allowedKeyLengths.indexOf(parseInt(t.keyLength,10))&&(t.keyLength=this._defaultOptions.keyLength),-1===this._allowedModes.indexOf(t.mode.toLowerCase())&&(t.mode=this._defaultOptions.mode),t}},{key:"_decodeKey",value:function(e,t){return"base64"===t.keyEncoding?u.default.enc.Base64.parse(e):"hex"===t.keyEncoding?u.default.enc.Hex.parse(e):e}},{key:"_getPaddedKey",value:function(e,t){return e=this._decodeKey(e,t),t.encryptKey?u.default.enc.Utf8.parse(this.SHA256(e).slice(0,32)):e}},{key:"_getMode",value:function(e){return"ecb"===e.mode?u.default.mode.ECB:u.default.mode.CBC}},{key:"_getIV",value:function(e){return"cbc"===e.mode?u.default.enc.Utf8.parse(this._iv):null}},{key:"encrypt",value:function(e,t,n){return this._config.customEncrypt?this._config.customEncrypt(e):this.pnEncrypt(e,t,n)}},{key:"decrypt",value:function(e,t,n){return this._config.customDecrypt?this._config.customDecrypt(e):this.pnDecrypt(e,t,n)}},{key:"pnEncrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);return u.default.AES.encrypt(e,s,{iv:r,mode:i}).ciphertext.toString(u.default.enc.Base64)||e}},{key:"pnDecrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);try{var o=u.default.enc.Base64.parse(e),a=u.default.AES.decrypt({ciphertext:o},s,{iv:r,mode:i}).toString(u.default.enc.Utf8);return JSON.parse(a)}catch(e){return null}}}]),e}();t.default=c,e.exports=t.default},function(e,t){"use strict";var n=n||function(e,t){var n={},r=n.lib={},i=function(){},s=r.Base={extend:function(e){i.prototype=this;var t=new i;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},o=r.WordArray=s.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=void 0!=t?t:4*e.length},toString:function(e){return(e||u).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes;if(e=e.sigBytes,this.clamp(),r%4)for(var i=0;i<e;i++)t[r+i>>>2]|=(n[i>>>2]>>>24-i%4*8&255)<<24-(r+i)%4*8;else if(65535<n.length)for(i=0;i<e;i+=4)t[r+i>>>2]=n[i>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=s.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],r=0;r<t;r+=4)n.push(4294967296*e.random()|0);return new o.init(n,t)}}),a=n.enc={},u=a.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++){var i=t[r>>>2]>>>24-r%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new o.init(n,t/2)}},c=a.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++)n.push(String.fromCharCode(t[r>>>2]>>>24-r%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(255&e.charCodeAt(r))<<24-r%4*8;return new o.init(n,t)}},l=a.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},h=r.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=l.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n=this._data,r=n.words,i=n.sigBytes,s=this.blockSize,a=i/(4*s),a=t?e.ceil(a):e.max((0|a)-this._minBufferSize,0);if(t=a*s,i=e.min(4*t,i),t){for(var u=0;u<t;u+=s)this._doProcessBlock(r,u);u=r.splice(0,t),n.sigBytes-=i}return new o.init(u,i)},clone:function(){var e=s.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});r.Hasher=h.extend({cfg:s.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new f.HMAC.init(e,n).finalize(t)}}});var f=n.algo={};return n}(Math);!function(e){for(var t=n,r=t.lib,i=r.WordArray,s=r.Hasher,r=t.algo,o=[],a=[],u=function(e){return 4294967296*(e-(0|e))|0},c=2,l=0;64>l;){var h;e:{h=c;for(var f=e.sqrt(h),p=2;p<=f;p++)if(!(h%p)){h=!1;break e}h=!0}h&&(8>l&&(o[l]=u(e.pow(c,.5))),a[l]=u(e.pow(c,1/3)),l++),c++}var d=[],r=r.SHA256=s.extend({_doReset:function(){this._hash=new i.init(o.slice(0))},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],s=n[2],o=n[3],u=n[4],c=n[5],l=n[6],h=n[7],f=0;64>f;f++){if(16>f)d[f]=0|e[t+f];else{var p=d[f-15],y=d[f-2];d[f]=((p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3)+d[f-7]+((y<<15|y>>>17)^(y<<13|y>>>19)^y>>>10)+d[f-16]}p=h+((u<<26|u>>>6)^(u<<21|u>>>11)^(u<<7|u>>>25))+(u&c^~u&l)+a[f]+d[f],y=((r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22))+(r&i^r&s^i&s),h=l,l=c,c=u,u=o+p|0,o=s,s=i,i=r,r=p+y|0}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+s|0,n[3]=n[3]+o|0,n[4]=n[4]+u|0,n[5]=n[5]+c|0,n[6]=n[6]+l|0,n[7]=n[7]+h|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return n[i>>>5]|=128<<24-i%32,n[14+(i+64>>>9<<4)]=e.floor(r/4294967296),n[15+(i+64>>>9<<4)]=r,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=s._createHelper(r),t.HmacSHA256=s._createHmacHelper(r)}(Math),function(){var e=n,t=e.enc.Utf8;e.algo.HMAC=e.lib.Base.extend({init:function(e,n){e=this._hasher=new e.init,"string"==typeof n&&(n=t.parse(n));var r=e.blockSize,i=4*r;n.sigBytes>i&&(n=e.finalize(n)),n.clamp();for(var s=this._oKey=n.clone(),o=this._iKey=n.clone(),a=s.words,u=o.words,c=0;c<r;c++)a[c]^=1549556828,u[c]^=909522486;s.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher;return e=t.finalize(e),t.reset(),t.finalize(this._oKey.clone().concat(e))}})}(),function(){var e=n,t=e.lib.WordArray;e.enc.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp(),e=[];for(var i=0;i<n;i+=3)for(var s=(t[i>>>2]>>>24-i%4*8&255)<<16|(t[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|t[i+2>>>2]>>>24-(i+2)%4*8&255,o=0;4>o&&i+.75*o<n;o++)e.push(r.charAt(s>>>6*(3-o)&63));if(t=r.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var n=e.length,r=this._map,i=r.charAt(64);i&&-1!=(i=e.indexOf(i))&&(n=i);for(var i=[],s=0,o=0;o<n;o++)if(o%4){var a=r.indexOf(e.charAt(o-1))<<o%4*2,u=r.indexOf(e.charAt(o))>>>6-o%4*2;i[s>>>2]|=(a|u)<<24-s%4*8,s++}return t.create(i,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(e){function t(e,t,n,r,i,s,o){return((e=e+(t&n|~t&r)+i+o)<<s|e>>>32-s)+t}function r(e,t,n,r,i,s,o){return((e=e+(t&r|n&~r)+i+o)<<s|e>>>32-s)+t}function i(e,t,n,r,i,s,o){return((e=e+(t^n^r)+i+o)<<s|e>>>32-s)+t}function s(e,t,n,r,i,s,o){return((e=e+(n^(t|~r))+i+o)<<s|e>>>32-s)+t}for(var o=n,a=o.lib,u=a.WordArray,c=a.Hasher,a=o.algo,l=[],h=0;64>h;h++)l[h]=4294967296*e.abs(e.sin(h+1))|0;a=a.MD5=c.extend({_doReset:function(){this._hash=new u.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,n){for(var o=0;16>o;o++){var a=n+o,u=e[a];e[a]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8)}var o=this._hash.words,a=e[n+0],u=e[n+1],c=e[n+2],h=e[n+3],f=e[n+4],p=e[n+5],d=e[n+6],y=e[n+7],g=e[n+8],b=e[n+9],v=e[n+10],_=e[n+11],m=e[n+12],k=e[n+13],P=e[n+14],O=e[n+15],S=o[0],w=o[1],T=o[2],C=o[3],S=t(S,w,T,C,a,7,l[0]),C=t(C,S,w,T,u,12,l[1]),T=t(T,C,S,w,c,17,l[2]),w=t(w,T,C,S,h,22,l[3]),S=t(S,w,T,C,f,7,l[4]),C=t(C,S,w,T,p,12,l[5]),T=t(T,C,S,w,d,17,l[6]),w=t(w,T,C,S,y,22,l[7]),S=t(S,w,T,C,g,7,l[8]),C=t(C,S,w,T,b,12,l[9]),T=t(T,C,S,w,v,17,l[10]),w=t(w,T,C,S,_,22,l[11]),S=t(S,w,T,C,m,7,l[12]),C=t(C,S,w,T,k,12,l[13]),T=t(T,C,S,w,P,17,l[14]),w=t(w,T,C,S,O,22,l[15]),S=r(S,w,T,C,u,5,l[16]),C=r(C,S,w,T,d,9,l[17]),T=r(T,C,S,w,_,14,l[18]),w=r(w,T,C,S,a,20,l[19]),S=r(S,w,T,C,p,5,l[20]),C=r(C,S,w,T,v,9,l[21]),T=r(T,C,S,w,O,14,l[22]),w=r(w,T,C,S,f,20,l[23]),S=r(S,w,T,C,b,5,l[24]),C=r(C,S,w,T,P,9,l[25]),T=r(T,C,S,w,h,14,l[26]),w=r(w,T,C,S,g,20,l[27]),S=r(S,w,T,C,k,5,l[28]),C=r(C,S,w,T,c,9,l[29]),T=r(T,C,S,w,y,14,l[30]),w=r(w,T,C,S,m,20,l[31]),S=i(S,w,T,C,p,4,l[32]),C=i(C,S,w,T,g,11,l[33]),T=i(T,C,S,w,_,16,l[34]),w=i(w,T,C,S,P,23,l[35]),S=i(S,w,T,C,u,4,l[36]),C=i(C,S,w,T,f,11,l[37]),T=i(T,C,S,w,y,16,l[38]),w=i(w,T,C,S,v,23,l[39]),S=i(S,w,T,C,k,4,l[40]),C=i(C,S,w,T,a,11,l[41]),T=i(T,C,S,w,h,16,l[42]),w=i(w,T,C,S,d,23,l[43]),S=i(S,w,T,C,b,4,l[44]),C=i(C,S,w,T,m,11,l[45]),T=i(T,C,S,w,O,16,l[46]),w=i(w,T,C,S,c,23,l[47]),S=s(S,w,T,C,a,6,l[48]),C=s(C,S,w,T,y,10,l[49]),T=s(T,C,S,w,P,15,l[50]),w=s(w,T,C,S,p,21,l[51]),S=s(S,w,T,C,m,6,l[52]),C=s(C,S,w,T,h,10,l[53]),T=s(T,C,S,w,v,15,l[54]),w=s(w,T,C,S,u,21,l[55]),S=s(S,w,T,C,g,6,l[56]),C=s(C,S,w,T,O,10,l[57]),T=s(T,C,S,w,d,15,l[58]),w=s(w,T,C,S,k,21,l[59]),S=s(S,w,T,C,f,6,l[60]),C=s(C,S,w,T,_,10,l[61]),T=s(T,C,S,w,c,15,l[62]),w=s(w,T,C,S,b,21,l[63]);o[0]=o[0]+S|0,o[1]=o[1]+w|0,o[2]=o[2]+T|0,o[3]=o[3]+C|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;n[i>>>5]|=128<<24-i%32;var s=e.floor(r/4294967296);for(n[15+(i+64>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),n[14+(i+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(n.length+1),this._process(),t=this._hash,n=t.words,r=0;4>r;r++)i=n[r],n[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8);return t},clone:function(){var e=c.clone.call(this);return e._hash=this._hash.clone(),e}}),o.MD5=c._createHelper(a),o.HmacMD5=c._createHmacHelper(a)}(Math),function(){var e=n,t=e.lib,r=t.Base,i=t.WordArray,t=e.algo,s=t.EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n=this.cfg,r=n.hasher.create(),s=i.create(),o=s.words,a=n.keySize,n=n.iterations;o.length<a;){u&&r.update(u);var u=r.update(e).finalize(t);r.reset();for(var c=1;c<n;c++)u=r.finalize(u),r.reset();s.concat(u)}return s.sigBytes=4*a,s}});e.EvpKDF=function(e,t,n){return s.create(n).compute(e,t)}}(),n.lib.Cipher||function(e){var t=n,r=t.lib,i=r.Base,s=r.WordArray,o=r.BufferedBlockAlgorithm,a=t.enc.Base64,u=t.algo.EvpKDF,c=r.Cipher=o.extend({cfg:i.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(t,n,r){return("string"==typeof n?y:d).encrypt(e,t,n,r)},decrypt:function(t,n,r){return("string"==typeof n?y:d).decrypt(e,t,n,r)}}}});r.StreamCipher=c.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l=t.mode={},h=function(e,t,n){var r=this._iv;r?this._iv=void 0:r=this._prevBlock;for(var i=0;i<n;i++)e[t+i]^=r[i]},f=(r.BlockCipherMode=i.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}})).extend();f.Encryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize;h.call(this,e,t,r),n.encryptBlock(e,t),this._prevBlock=e.slice(t,t+r)}}),f.Decryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=e.slice(t,t+r);n.decryptBlock(e,t),h.call(this,e,t,r),this._prevBlock=i}}),l=l.CBC=f,f=(t.pad={}).Pkcs7={pad:function(e,t){for(var n=4*t,n=n-e.sigBytes%n,r=n<<24|n<<16|n<<8|n,i=[],o=0;o<n;o+=4)i.push(r);n=s.create(i,n),e.concat(n)},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2]}},r.BlockCipher=c.extend({cfg:c.cfg.extend({mode:l,padding:f}),reset:function(){c.reset.call(this);var e=this.cfg,t=e.iv,e=e.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=e.createEncryptor;else n=e.createDecryptor,this._minBufferSize=1;this._mode=n.call(e,this,t&&t.words)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){e.pad(this._data,this.blockSize);var t=this._process(!0)}else t=this._process(!0),e.unpad(t);return t},blockSize:4});var p=r.CipherParams=i.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}}),l=(t.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return e=e.salt,(e?s.create([1398893684,1701076831]).concat(e).concat(t):t).toString(a)},parse:function(e){e=a.parse(e);var t=e.words;if(1398893684==t[0]&&1701076831==t[1]){var n=s.create(t.slice(2,4));t.splice(0,4),e.sigBytes-=16}return p.create({ciphertext:e,salt:n})}},d=r.SerializableCipher=i.extend({cfg:i.extend({format:l}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r);return t=i.finalize(t),i=i.cfg,p.create({ciphertext:t,key:n,iv:i.iv,algorithm:e,mode:i.mode,padding:i.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return"string"==typeof e?t.parse(e,this):e}}),t=(t.kdf={}).OpenSSL={execute:function(e,t,n,r){return r||(r=s.random(8)),e=u.create({keySize:t+n}).compute(e,r),n=s.create(e.words.slice(t),4*n),e.sigBytes=4*t,p.create({key:e,iv:n,salt:r})}},y=r.PasswordBasedCipher=d.extend({cfg:d.cfg.extend({kdf:t}),encrypt:function(e,t,n,r){return r=this.cfg.extend(r),n=r.kdf.execute(n,e.keySize,e.ivSize),r.iv=n.iv,e=d.encrypt.call(this,e,t,n.key,r),e.mixIn(n),e},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),n=r.kdf.execute(n,e.keySize,e.ivSize,t.salt),r.iv=n.iv,d.decrypt.call(this,e,t,n.key,r)}})}(),function(){for(var e=n,t=e.lib.BlockCipher,r=e.algo,i=[],s=[],o=[],a=[],u=[],c=[],l=[],h=[],f=[],p=[],d=[],y=0;256>y;y++)d[y]=128>y?y<<1:y<<1^283;for(var g=0,b=0,y=0;256>y;y++){var v=b^b<<1^b<<2^b<<3^b<<4,v=v>>>8^255&v^99;i[g]=v,s[v]=g;var _=d[g],m=d[_],k=d[m],P=257*d[v]^16843008*v;o[g]=P<<24|P>>>8,a[g]=P<<16|P>>>16,u[g]=P<<8|P>>>24,c[g]=P,P=16843009*k^65537*m^257*_^16843008*g,l[v]=P<<24|P>>>8,h[v]=P<<16|P>>>16,f[v]=P<<8|P>>>24,p[v]=P,g?(g=_^d[d[d[k^_]]],b^=d[d[b]]):g=b=1}var O=[0,1,2,4,8,16,32,64,128,27,54],r=r.AES=t.extend({_doReset:function(){for(var e=this._key,t=e.words,n=e.sigBytes/4,e=4*((this._nRounds=n+6)+1),r=this._keySchedule=[],s=0;s<e;s++)if(s<n)r[s]=t[s];else{var o=r[s-1];s%n?6<n&&4==s%n&&(o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o]):(o=o<<8|o>>>24,o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o],o^=O[s/n|0]<<24),r[s]=r[s-n]^o}for(t=this._invKeySchedule=[],n=0;n<e;n++)s=e-n,o=n%4?r[s]:r[s-4],t[n]=4>n||4>=s?o:l[i[o>>>24]]^h[i[o>>>16&255]]^f[i[o>>>8&255]]^p[i[255&o]]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,o,a,u,c,i)},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,l,h,f,p,s),n=e[t+1],e[t+1]=e[t+3],e[t+3]=n},_doCryptBlock:function(e,t,n,r,i,s,o,a){for(var u=this._nRounds,c=e[t]^n[0],l=e[t+1]^n[1],h=e[t+2]^n[2],f=e[t+3]^n[3],p=4,d=1;d<u;d++)var y=r[c>>>24]^i[l>>>16&255]^s[h>>>8&255]^o[255&f]^n[p++],g=r[l>>>24]^i[h>>>16&255]^s[f>>>8&255]^o[255&c]^n[p++],b=r[h>>>24]^i[f>>>16&255]^s[c>>>8&255]^o[255&l]^n[p++],f=r[f>>>24]^i[c>>>16&255]^s[l>>>8&255]^o[255&h]^n[p++],c=y,l=g,h=b;y=(a[c>>>24]<<24|a[l>>>16&255]<<16|a[h>>>8&255]<<8|a[255&f])^n[p++],g=(a[l>>>24]<<24|a[h>>>16&255]<<16|a[f>>>8&255]<<8|a[255&c])^n[p++],b=(a[h>>>24]<<24|a[f>>>16&255]<<16|a[c>>>8&255]<<8|a[255&l])^n[p++],f=(a[f>>>24]<<24|a[c>>>16&255]<<16|a[l>>>8&255]<<8|a[255&h])^n[p++],e[t]=y,e[t+1]=g,e[t+2]=b,e[t+3]=f},keySize:8});e.AES=t._createHelper(r)}(),n.mode.ECB=function(){var e=n.lib.BlockCipherMode.extend();return e.Encryptor=e.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t)}}),e.Decryptor=e.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t)}}),e}(),e.exports=n},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(6),a=(r(o),n(2)),u=(r(a),n(9)),c=(r(u),n(11)),l=r(c),h=n(14),f=r(h),p=n(15),d=r(p),y=(n(5),n(10)),g=r(y),b=function(){function e(t){var n=t.subscribeEndpoint,r=t.leaveEndpoint,s=t.heartbeatEndpoint,o=t.setStateEndpoint,a=t.timeEndpoint,u=t.config,c=t.crypto,h=t.listenerManager;i(this,e),this._listenerManager=h,this._config=u,this._leaveEndpoint=r,this._heartbeatEndpoint=s,this._setStateEndpoint=o,this._subscribeEndpoint=n,this._crypto=c,this._channels={},this._presenceChannels={},this._heartbeatChannels={},this._heartbeatChannelGroups={},this._channelGroups={},this._presenceChannelGroups={},this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[],this._currentTimetoken=0,this._lastTimetoken=0,this._storedTimetoken=null,this._subscriptionStatusAnnounced=!1,this._isOnline=!0,this._reconnectionManager=new l.default({timeEndpoint:a}),this._dedupingManager=new f.default({config:u})}return s(e,[{key:"adaptStateChange",value:function(e,t){var n=this,r=e.state,i=e.channels,s=void 0===i?[]:i,o=e.channelGroups,a=void 0===o?[]:o;return s.forEach(function(e){e in n._channels&&(n._channels[e].state=r)}),a.forEach(function(e){e in n._channelGroups&&(n._channelGroups[e].state=r)}),this._setStateEndpoint({state:r,channels:s,channelGroups:a},t)}},{key:"adaptPresenceChange",value:function(e){var t=this,n=e.connected,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s;n?(i.forEach(function(e){t._heartbeatChannels[e]={state:{}}}),o.forEach(function(e){t._heartbeatChannelGroups[e]={state:{}}})):(i.forEach(function(e){e in t._heartbeatChannels&&delete t._heartbeatChannels[e]}),o.forEach(function(e){e in t._heartbeatChannelGroups&&delete t._heartbeatChannelGroups[e]}),!1===this._config.suppressLeaveEvents&&this._leaveEndpoint({channels:i,channelGroups:o},function(e){t._listenerManager.announceStatus(e)})),this.reconnect()}},{key:"adaptSubscribeChange",value:function(e){var t=this,n=e.timetoken,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s,a=e.withPresence,u=void 0!==a&&a;if(!this._config.subscribeKey||""===this._config.subscribeKey)return void(console&&console.log&&console.log("subscribe key missing; aborting subscribe"));n&&(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=n),
"0"!==this._currentTimetoken&&(this._storedTimetoken=this._currentTimetoken,this._currentTimetoken=0),i.forEach(function(e){t._channels[e]={state:{}},u&&(t._presenceChannels[e]={}),t._pendingChannelSubscriptions.push(e)}),o.forEach(function(e){t._channelGroups[e]={state:{}},u&&(t._presenceChannelGroups[e]={}),t._pendingChannelGroupSubscriptions.push(e)}),this._subscriptionStatusAnnounced=!1,this.reconnect()}},{key:"adaptUnsubscribeChange",value:function(e,t){var n=this,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s,a=[],u=[];i.forEach(function(e){e in n._channels&&(delete n._channels[e],a.push(e)),e in n._presenceChannels&&(delete n._presenceChannels[e],a.push(e))}),o.forEach(function(e){e in n._channelGroups&&(delete n._channelGroups[e],u.push(e)),e in n._presenceChannelGroups&&(delete n._channelGroups[e],u.push(e))}),0===a.length&&0===u.length||(!1!==this._config.suppressLeaveEvents||t||this._leaveEndpoint({channels:a,channelGroups:u},function(e){e.affectedChannels=a,e.affectedChannelGroups=u,e.currentTimetoken=n._currentTimetoken,e.lastTimetoken=n._lastTimetoken,n._listenerManager.announceStatus(e)}),0===Object.keys(this._channels).length&&0===Object.keys(this._presenceChannels).length&&0===Object.keys(this._channelGroups).length&&0===Object.keys(this._presenceChannelGroups).length&&(this._lastTimetoken=0,this._currentTimetoken=0,this._storedTimetoken=null,this._region=null,this._reconnectionManager.stopPolling()),this.reconnect())}},{key:"unsubscribeAll",value:function(e){this.adaptUnsubscribeChange({channels:this.getSubscribedChannels(),channelGroups:this.getSubscribedChannelGroups()},e)}},{key:"getHeartbeatChannels",value:function(){return Object.keys(this._heartbeatChannels)}},{key:"getHeartbeatChannelGroups",value:function(){return Object.keys(this._heartbeatChannelGroups)}},{key:"getSubscribedChannels",value:function(){return Object.keys(this._channels)}},{key:"getSubscribedChannelGroups",value:function(){return Object.keys(this._channelGroups)}},{key:"reconnect",value:function(){this._startSubscribeLoop(),this._registerHeartbeatTimer()}},{key:"disconnect",value:function(){this._stopSubscribeLoop(),this._stopHeartbeatTimer(),this._reconnectionManager.stopPolling()}},{key:"_registerHeartbeatTimer",value:function(){this._stopHeartbeatTimer(),0!==this._config.getHeartbeatInterval()&&(this._performHeartbeatLoop(),this._heartbeatTimer=setInterval(this._performHeartbeatLoop.bind(this),1e3*this._config.getHeartbeatInterval()))}},{key:"_stopHeartbeatTimer",value:function(){this._heartbeatTimer&&(clearInterval(this._heartbeatTimer),this._heartbeatTimer=null)}},{key:"_performHeartbeatLoop",value:function(){var e=this,t=[];t=t.concat(this.getHeartbeatChannels()),t=t.concat(this.getSubscribedChannels());var n=[];n=n.concat(this.getHeartbeatChannelGroups()),n=n.concat(this.getSubscribedChannelGroups());var r={};if(0!==t.length||0!==n.length){this.getSubscribedChannels().forEach(function(t){var n=e._channels[t].state;Object.keys(n).length&&(r[t]=n)}),this.getSubscribedChannelGroups().forEach(function(t){var n=e._channelGroups[t].state;Object.keys(n).length&&(r[t]=n)});var i=function(t){t.error&&e._config.announceFailedHeartbeats&&e._listenerManager.announceStatus(t),t.error&&e._config.autoNetworkDetection&&e._isOnline&&(e._isOnline=!1,e.disconnect(),e._listenerManager.announceNetworkDown(),e.reconnect()),!t.error&&e._config.announceSuccessfulHeartbeats&&e._listenerManager.announceStatus(t)};this._heartbeatEndpoint({channels:t,channelGroups:n,state:r},i.bind(this))}}},{key:"_startSubscribeLoop",value:function(){this._stopSubscribeLoop();var e=[],t=[];if(Object.keys(this._channels).forEach(function(t){return e.push(t)}),Object.keys(this._presenceChannels).forEach(function(t){return e.push(t+"-pnpres")}),Object.keys(this._channelGroups).forEach(function(e){return t.push(e)}),Object.keys(this._presenceChannelGroups).forEach(function(e){return t.push(e+"-pnpres")}),0!==e.length||0!==t.length){var n={channels:e,channelGroups:t,timetoken:this._currentTimetoken,filterExpression:this._config.filterExpression,region:this._region};this._subscribeCall=this._subscribeEndpoint(n,this._processSubscribeResponse.bind(this))}}},{key:"_processSubscribeResponse",value:function(e,t){var n=this;if(e.error)return void(e.category===g.default.PNTimeoutCategory?this._startSubscribeLoop():e.category===g.default.PNNetworkIssuesCategory?(this.disconnect(),e.error&&this._config.autoNetworkDetection&&this._isOnline&&(this._isOnline=!1,this._listenerManager.announceNetworkDown()),this._reconnectionManager.onReconnection(function(){n._config.autoNetworkDetection&&!n._isOnline&&(n._isOnline=!0,n._listenerManager.announceNetworkUp()),n.reconnect(),n._subscriptionStatusAnnounced=!0;var t={category:g.default.PNReconnectedCategory,operation:e.operation,lastTimetoken:n._lastTimetoken,currentTimetoken:n._currentTimetoken};n._listenerManager.announceStatus(t)}),this._reconnectionManager.startPolling(),this._listenerManager.announceStatus(e)):e.category===g.default.PNBadRequestCategory?(this._stopHeartbeatTimer(),this._listenerManager.announceStatus(e)):this._listenerManager.announceStatus(e));if(this._storedTimetoken?(this._currentTimetoken=this._storedTimetoken,this._storedTimetoken=null):(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=t.metadata.timetoken),!this._subscriptionStatusAnnounced){var r={};r.category=g.default.PNConnectedCategory,r.operation=e.operation,r.affectedChannels=this._pendingChannelSubscriptions,r.subscribedChannels=this.getSubscribedChannels(),r.affectedChannelGroups=this._pendingChannelGroupSubscriptions,r.lastTimetoken=this._lastTimetoken,r.currentTimetoken=this._currentTimetoken,this._subscriptionStatusAnnounced=!0,this._listenerManager.announceStatus(r),this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[]}var i=t.messages||[],s=this._config,o=s.requestMessageCountThreshold,a=s.dedupeOnSubscribe;if(o&&i.length>=o){var u={};u.category=g.default.PNRequestMessageCountExceededCategory,u.operation=e.operation,this._listenerManager.announceStatus(u)}i.forEach(function(e){var t=e.channel,r=e.subscriptionMatch,i=e.publishMetaData;if(t===r&&(r=null),a){if(n._dedupingManager.isDuplicate(e))return;n._dedupingManager.addEntry(e)}if(d.default.endsWith(e.channel,"-pnpres")){var s={};s.channel=null,s.subscription=null,s.actualChannel=null!=r?t:null,s.subscribedChannel=null!=r?r:t,t&&(s.channel=t.substring(0,t.lastIndexOf("-pnpres"))),r&&(s.subscription=r.substring(0,r.lastIndexOf("-pnpres"))),s.action=e.payload.action,s.state=e.payload.data,s.timetoken=i.publishTimetoken,s.occupancy=e.payload.occupancy,s.uuid=e.payload.uuid,s.timestamp=e.payload.timestamp,e.payload.join&&(s.join=e.payload.join),e.payload.leave&&(s.leave=e.payload.leave),e.payload.timeout&&(s.timeout=e.payload.timeout),n._listenerManager.announcePresence(s)}else{var o={};o.channel=null,o.subscription=null,o.actualChannel=null!=r?t:null,o.subscribedChannel=null!=r?r:t,o.channel=t,o.subscription=r,o.timetoken=i.publishTimetoken,o.publisher=e.issuingClientId,e.userMetadata&&(o.userMetadata=e.userMetadata),n._config.cipherKey?o.message=n._crypto.decrypt(e.payload):o.message=e.payload,n._listenerManager.announceMessage(o)}}),this._region=t.metadata.region,this._startSubscribeLoop()}},{key:"_stopSubscribeLoop",value:function(){this._subscribeCall&&("function"==typeof this._subscribeCall.abort&&this._subscribeCall.abort(),this._subscribeCall=null)}}]),e}();t.default=b,e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=(n(5),n(10)),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=function(){function e(){r(this,e),this._listeners=[]}return i(e,[{key:"addListener",value:function(e){this._listeners.push(e)}},{key:"removeListener",value:function(e){var t=[];this._listeners.forEach(function(n){n!==e&&t.push(n)}),this._listeners=t}},{key:"removeAllListeners",value:function(){this._listeners=[]}},{key:"announcePresence",value:function(e){this._listeners.forEach(function(t){t.presence&&t.presence(e)})}},{key:"announceStatus",value:function(e){this._listeners.forEach(function(t){t.status&&t.status(e)})}},{key:"announceMessage",value:function(e){this._listeners.forEach(function(t){t.message&&t.message(e)})}},{key:"announceNetworkUp",value:function(){var e={};e.category=o.default.PNNetworkUpCategory,this.announceStatus(e)}},{key:"announceNetworkDown",value:function(){var e={};e.category=o.default.PNNetworkDownCategory,this.announceStatus(e)}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNNetworkUpCategory:"PNNetworkUpCategory",PNNetworkDownCategory:"PNNetworkDownCategory",PNNetworkIssuesCategory:"PNNetworkIssuesCategory",PNTimeoutCategory:"PNTimeoutCategory",PNBadRequestCategory:"PNBadRequestCategory",PNAccessDeniedCategory:"PNAccessDeniedCategory",PNUnknownCategory:"PNUnknownCategory",PNReconnectedCategory:"PNReconnectedCategory",PNConnectedCategory:"PNConnectedCategory",PNRequestMessageCountExceededCategory:"PNRequestMessageCountExceededCategory"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(12),o=(function(e){e&&e.__esModule}(s),n(5),function(){function e(t){var n=t.timeEndpoint;r(this,e),this._timeEndpoint=n}return i(e,[{key:"onReconnection",value:function(e){this._reconnectionCallback=e}},{key:"startPolling",value:function(){this._timeTimer=setInterval(this._performTimeLoop.bind(this),3e3)}},{key:"stopPolling",value:function(){clearInterval(this._timeTimer)}},{key:"_performTimeLoop",value:function(){var e=this;this._timeEndpoint(function(t){t.error||(clearInterval(e._timeTimer),e._reconnectionCallback())})}}]),e}());t.default=o,e.exports=t.default},function(e,t,n){"use strict";function r(){return h.default.PNTimeOperation}function i(){return"/time/0"}function s(e){return e.config.getTransactionTimeout()}function o(){return{}}function a(){return!1}function u(e,t){return{timetoken:t[0]}}function c(){}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.getURL=i,t.getRequestTimeout=s,t.prepareParams=o,t.isAuthSupported=a,t.handleResponse=u,t.validateParams=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNTimeOperation:"PNTimeOperation",PNHistoryOperation:"PNHistoryOperation",PNDeleteMessagesOperation:"PNDeleteMessagesOperation",PNFetchMessagesOperation:"PNFetchMessagesOperation",PNSubscribeOperation:"PNSubscribeOperation",PNUnsubscribeOperation:"PNUnsubscribeOperation",PNPublishOperation:"PNPublishOperation",PNPushNotificationEnabledChannelsOperation:"PNPushNotificationEnabledChannelsOperation",PNRemoveAllPushNotificationsOperation:"PNRemoveAllPushNotificationsOperation",PNWhereNowOperation:"PNWhereNowOperation",PNSetStateOperation:"PNSetStateOperation",PNHereNowOperation:"PNHereNowOperation",PNGetStateOperation:"PNGetStateOperation",PNHeartbeatOperation:"PNHeartbeatOperation",PNChannelGroupsOperation:"PNChannelGroupsOperation",PNRemoveGroupOperation:"PNRemoveGroupOperation",PNChannelsForGroupOperation:"PNChannelsForGroupOperation",PNAddChannelsToGroupOperation:"PNAddChannelsToGroupOperation",PNRemoveChannelsFromGroupOperation:"PNRemoveChannelsFromGroupOperation",PNAccessManagerGrant:"PNAccessManagerGrant",PNAccessManagerAudit:"PNAccessManagerAudit"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(2),o=(function(e){e&&e.__esModule}(s),n(5),function(e){var t=0;if(0===e.length)return t;for(var n=0;n<e.length;n+=1){t=(t<<5)-t+e.charCodeAt(n),t&=t}return t}),a=function(){function e(t){var n=t.config;r(this,e),this.hashHistory=[],this._config=n}return i(e,[{key:"getKey",value:function(e){var t=o(JSON.stringify(e.payload)).toString();return e.publishMetaData.publishTimetoken+"-"+t}},{key:"isDuplicate",value:function(e){return this.hashHistory.includes(this.getKey(e))}},{key:"addEntry",value:function(e){this.hashHistory.length>=this._config.maximumCacheSize&&this.hashHistory.shift(),this.hashHistory.push(this.getKey(e))}},{key:"clearHistory",value:function(){this.hashHistory=[]}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";function n(e){var t=[];return Object.keys(e).forEach(function(e){return t.push(e)}),t}function r(e){return encodeURIComponent(e).replace(/[!~*'()]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function i(e){return n(e).sort()}function s(e){return i(e).map(function(t){return t+"="+r(e[t])}).join("&")}function o(e,t){return-1!==e.indexOf(t,this.length-t.length)}function a(){var e=void 0,t=void 0;return{promise:new Promise(function(n,r){e=n,t=r}),reject:t,fulfill:e}}e.exports={signPamFromParams:s,endsWith:o,createPromise:a,encodeString:r}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return e.type=t,e.error=!0,e}function u(e){return a({message:e},"validationError")}function c(e,t,n){return e.usePost&&e.usePost(t,n)?e.postURL(t,n):e.getURL(t,n)}function l(e){if(e.sdkName)return e.sdkName;var t="PubNub-JS-"+e.sdkFamily;return e.partnerId&&(t+="-"+e.partnerId),t+="/"+e.getVersion()}function h(e,t,n){var r=e.config,i=e.crypto;n.timestamp=Math.floor((new Date).getTime()/1e3);var s=r.subscribeKey+"\n"+r.publishKey+"\n"+t+"\n";s+=y.default.signPamFromParams(n);var o=i.HMACSHA256(s);o=o.replace(/\+/g,"-"),o=o.replace(/\//g,"_"),n.signature=o}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=e.networking,r=e.config,i=null,s=null,o={};t.getOperation()===v.default.PNTimeOperation||t.getOperation()===v.default.PNChannelGroupsOperation?i=arguments.length<=2?void 0:arguments[2]:(o=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]),"undefined"==typeof Promise||i||(s=y.default.createPromise());var a=t.validateParams(e,o);if(!a){var f=t.prepareParams(e,o),d=c(t,e,o),g=void 0,b={url:d,operation:t.getOperation(),timeout:t.getRequestTimeout(e)};f.uuid=r.UUID,f.pnsdk=l(r),r.useInstanceId&&(f.instanceid=r.instanceId),r.useRequestId&&(f.requestid=p.default.createUUID()),t.isAuthSupported()&&r.getAuthKey()&&(f.auth=r.getAuthKey()),r.secretKey&&h(e,d,f);var m=function(n,r){if(n.error)return void(i?i(n):s&&s.reject(new _("PubNub call failed, check status for details",n)));var a=t.handleResponse(e,r,o);i?i(n,a):s&&s.fulfill(a)};if(t.usePost&&t.usePost(e,o)){var k=t.postPayload(e,o);g=n.POST(f,k,b,m)}else g=t.useDelete&&t.useDelete()?n.DELETE(f,b,m):n.GET(f,b,m);return t.getOperation()===v.default.PNSubscribeOperation?g:s?s.promise:void 0}return i?i(u(a)):s?(s.reject(new _("Validation failed, check status for details",u(a))),s.promise):void 0};var f=n(3),p=r(f),d=(n(5),n(15)),y=r(d),g=n(2),b=(r(g),n(13)),v=r(b),_=function(e){function t(e,n){i(this,t);var r=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.name=r.constructor.name,r.status=n,r.message=e,r}return o(t,e),t}(Error);e.exports=t.default},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNAddChannelsToGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+d.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{add:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveChannelsFromGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+d.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{remove:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+d.default.encodeString(n)+"/remove"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(){return{}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(){return h.default.PNChannelGroupsOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{groups:t.payload.groups}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNChannelsForGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+d.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(){return{}}function l(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,add:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,remove:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(e,t){return{channels:t}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNRemoveAllPushNotificationsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n+"/remove"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNUnsubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+d.default.encodeString(s)+"/leave"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(){return h.default.PNWhereNowOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r;return"/v2/presence/sub-key/"+n.subscribeKey+"/uuid/"+i}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return t.payload?{channels:t.payload.channels}:{channels:[]}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHeartbeatOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+d.default.encodeString(s)+"/heartbeat"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.state,s=void 0===i?{}:i,o=e.config,a={};return r.length>0&&(a["channel-group"]=r.join(",")),a.state=JSON.stringify(s),a.heartbeat=o.getPresenceTimeout(),a}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNGetStateOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r,s=t.channels,o=void 0===s?[]:s,a=o.length>0?o.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+d.default.encodeString(a)+"/uuid/"+i}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a={};return 1===i.length&&0===o.length?a[i[0]]=t.payload:a=t.payload,{channels:a}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSetStateOperation}function s(e,t){var n=e.config,r=t.state,i=t.channels,s=void 0===i?[]:i,o=t.channelGroups,a=void 0===o?[]:o;return r?n.subscribeKey?0===s.length&&0===a.length?"Please provide a list of channels and/or channel-groups":void 0:"Missing Subscribe Key":"Missing State"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+d.default.encodeString(s)+"/uuid/"+n.UUID+"/data"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.state,r=t.channelGroups,i=void 0===r?[]:r,s={};return s.state=JSON.stringify(n),i.length>0&&(s["channel-group"]=i.join(",")),s}function l(e,t){return{state:t.payload}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHereNowOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=t.channelGroups,o=void 0===s?[]:s,a="/v2/presence/sub-key/"+n.subscribeKey;if(i.length>0||o.length>0){var u=i.length>0?i.join(","):",";a+="/channel/"+d.default.encodeString(u)}return a}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.includeUUIDs,s=void 0===i||i,o=t.includeState,a=void 0!==o&&o,u={};return s||(u.disable_uuids=1),a&&(u.state=1),r.length>0&&(u["channel-group"]=r.join(",")),u}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a=n.includeUUIDs,u=void 0===a||a,c=n.includeState,l=void 0!==c&&c;return i.length>1||o.length>0||0===o.length&&0===i.length?function(){var e={};return e.totalChannels=t.payload.total_channels,e.totalOccupancy=t.payload.total_occupancy,e.channels={},Object.keys(t.payload.channels).forEach(function(n){var r=t.payload.channels[n],i=[];return e.channels[n]={occupants:i,name:n,occupancy:r.occupancy},u&&r.uuids.forEach(function(e){l?i.push({state:e.state,uuid:e.uuid}):i.push({state:null,uuid:e})}),e}),e}():function(){var e={},n=[];return e.totalChannels=1,e.totalOccupancy=t.occupancy,e.channels={},e.channels[i[0]]={occupants:n,name:i[0],occupancy:t.occupancy},u&&t.uuids&&t.uuids.forEach(function(e){l?n.push({state:e.state,uuid:e.uuid}):n.push({state:null,uuid:e})}),e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerAudit}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v2/auth/audit/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channel,r=t.channelGroup,i=t.authKeys,s=void 0===i?[]:i,o={};return n&&(o.channel=n),r&&(o["channel-group"]=r),s.length>0&&(o.auth=s.join(",")),o}function c(e,t){return t.payload}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerGrant}function i(e){var t=e.config;return t.subscribeKey?t.publishKey?t.secretKey?void 0:"Missing Secret Key":"Missing Publish Key":"Missing Subscribe Key"}function s(e){return"/v2/auth/grant/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.channelGroups,s=void 0===i?[]:i,o=t.ttl,a=t.read,u=void 0!==a&&a,c=t.write,l=void 0!==c&&c,h=t.manage,f=void 0!==h&&h,p=t.authKeys,d=void 0===p?[]:p,y={};return y.r=u?"1":"0",y.w=l?"1":"0",y.m=f?"1":"0",r.length>0&&(y.channel=r.join(",")),s.length>0&&(y["channel-group"]=s.join(",")),d.length>0&&(y.auth=d.join(",")),(o||0===o)&&(y.ttl=o),y}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(5),n(13)),h=function(e){return e&&e.__esModule?e:{
default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i}function s(){return b.default.PNPublishOperation}function o(e,t){var n=e.config,r=t.message;return t.channel?r?n.subscribeKey?void 0:"Missing Subscribe Key":"Missing Message":"Missing Channel"}function a(e,t){var n=t.sendByPost;return void 0!==n&&n}function u(e,t){var n=e.config,r=t.channel,s=t.message,o=i(e,s);return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0/"+_.default.encodeString(o)}function c(e,t){var n=e.config,r=t.channel;return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0"}function l(e){return e.config.getTransactionTimeout()}function h(){return!0}function f(e,t){return i(e,t.message)}function p(e,t){var n=t.meta,r=t.replicate,i=void 0===r||r,s=t.storeInHistory,o=t.ttl,a={};return null!=s&&(a.store=s?"1":"0"),o&&(a.ttl=o),!1===i&&(a.norep="true"),n&&"object"===(void 0===n?"undefined":y(n))&&(a.meta=JSON.stringify(n)),a}function d(e,t){return{timetoken:t[2]}}Object.defineProperty(t,"__esModule",{value:!0});var y="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.getOperation=s,t.validateParams=o,t.usePost=a,t.getURL=u,t.postURL=c,t.getRequestTimeout=l,t.isAuthSupported=h,t.postPayload=f,t.prepareParams=p,t.handleResponse=d;var g=(n(5),n(13)),b=r(g),v=n(15),_=r(v)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return p.default.PNHistoryOperation}function o(e,t){var n=t.channel,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channel"}function a(e,t){var n=t.channel;return"/v2/history/sub-key/"+e.config.subscribeKey+"/channel/"+y.default.encodeString(n)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.reverse,s=t.count,o=void 0===s?100:s,a=t.stringifiedTimeToken,u=void 0!==a&&a,c={include_token:"true"};return c.count=o,n&&(c.start=n),r&&(c.end=r),u&&(c.string_message_token="true"),null!=i&&(c.reverse=i.toString()),c}function h(e,t){var n={messages:[],startTimeToken:t[1],endTimeToken:t[2]};return t[0].forEach(function(t){var r={timetoken:t.timetoken,entry:i(e,t.message)};n.messages.push(r)}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(5),n(13)),p=r(f),d=n(15),y=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return p.default.PNDeleteMessagesOperation}function s(e,t){var n=t.channel,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channel"}function o(){return!0}function a(e,t){var n=t.channel,r=t.start,i=t.end,s=e.config,o="";return r&&(o="?start="+r),i&&(o+=(""!==o?"&":"?")+"end="+i),"/v3/history/sub-key/"+s.subscribeKey+"/channel/"+y.default.encodeString(n)+o}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i={};return n&&(i.start=n),r&&(i.end=r),{}}function h(e,t){return t.payload}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.useDelete=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(5),n(13)),p=r(f),d=n(15),y=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return p.default.PNFetchMessagesOperation}function o(e,t){var n=t.channels,r=e.config;return n&&0!==n.length?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channels"}function a(e,t){var n=t.channels,r=void 0===n?[]:n,i=e.config,s=r.length>0?r.join(","):",";return"/v3/history/sub-key/"+i.subscribeKey+"/channel/"+y.default.encodeString(s)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.count,s={};return i&&(s.max=i),n&&(s.start=n),r&&(s.end=r),s}function h(e,t){var n={channels:{}};return Object.keys(t.channels||{}).forEach(function(r){n.channels[r]=[],(t.channels[r]||[]).forEach(function(t){var s={};s.channel=r,s.subscription=null,s.timetoken=t.timetoken,s.message=i(e,t.message),n.channels[r].push(s)})}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(5),n(13)),p=r(f),d=n(15),y=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/subscribe/"+n.subscribeKey+"/"+d.default.encodeString(s)+"/0"}function a(e){return e.config.getSubscribeTimeout()}function u(){return!0}function c(e,t){var n=e.config,r=t.channelGroups,i=void 0===r?[]:r,s=t.timetoken,o=t.filterExpression,a=t.region,u={heartbeat:n.getPresenceTimeout()};return i.length>0&&(u["channel-group"]=i.join(",")),o&&o.length>0&&(u["filter-expr"]=o),s&&(u.tt=s),a&&(u.tr=a),u}function l(e,t){var n=[];t.m.forEach(function(e){var t={publishTimetoken:e.p.t,region:e.p.r},r={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,userMetadata:e.u,publishMetaData:t};n.push(r)});var r={timetoken:t.t.t,region:t.t.r};return{messages:n,metadata:r}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(5),n(13)),f=r(h),p=n(15),d=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(2),a=(r(o),n(10)),u=r(a),c=(n(5),function(){function e(t){var n=this;i(this,e),this._modules={},Object.keys(t).forEach(function(e){n._modules[e]=t[e].bind(n)})}return s(e,[{key:"init",value:function(e){this._config=e,this._maxSubDomain=20,this._currentSubDomain=Math.floor(Math.random()*this._maxSubDomain),this._providedFQDN=(this._config.secure?"https://":"http://")+this._config.origin,this._coreParams={},this.shiftStandardOrigin()}},{key:"nextOrigin",value:function(){if(-1===this._providedFQDN.indexOf("pubsub."))return this._providedFQDN;var e=void 0;return this._currentSubDomain=this._currentSubDomain+1,this._currentSubDomain>=this._maxSubDomain&&(this._currentSubDomain=1),e=this._currentSubDomain.toString(),this._providedFQDN.replace("pubsub","ps"+e)}},{key:"hasModule",value:function(e){return e in this._modules}},{key:"shiftStandardOrigin",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this._standardOrigin=this.nextOrigin(e),this._standardOrigin}},{key:"getStandardOrigin",value:function(){return this._standardOrigin}},{key:"POST",value:function(e,t,n,r){return this._modules.post(e,t,n,r)}},{key:"GET",value:function(e,t,n){return this._modules.get(e,t,n)}},{key:"DELETE",value:function(e,t,n){return this._modules.del(e,t,n)}},{key:"_detectErrorCategory",value:function(e){if("ENOTFOUND"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNREFUSED"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNRESET"===e.code)return u.default.PNNetworkIssuesCategory;if("EAI_AGAIN"===e.code)return u.default.PNNetworkIssuesCategory;if(0===e.status||e.hasOwnProperty("status")&&void 0===e.status)return u.default.PNNetworkIssuesCategory;if(e.timeout)return u.default.PNTimeoutCategory;if(e.response){if(e.response.badRequest)return u.default.PNBadRequestCategory;if(e.response.forbidden)return u.default.PNAccessDeniedCategory}return u.default.PNUnknownCategory}}]),e}());t.default=c,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={get:function(e){try{return localStorage.getItem(e)}catch(e){return null}},set:function(e,t){try{return localStorage.setItem(e,t)}catch(e){return null}}},e.exports=t.default},function(e,t,n){"use strict";function r(e){var t=(new Date).getTime(),n=(new Date).toISOString(),r=function(){return console&&console.log?console:window&&window.console&&window.console.log?window.console:console}();r.log("<<<<<"),r.log("["+n+"]","\n",e.url,"\n",e.qs),r.log("-----"),e.on("response",function(n){var i=(new Date).getTime(),s=i-t,o=(new Date).toISOString();r.log(">>>>>>"),r.log("["+o+" / "+s+"]","\n",e.url,"\n",e.qs,"\n",n.text),r.log("-----")})}function i(e,t,n){var i=this;return this._config.logVerbosity&&(e=e.use(r)),this._config.proxy&&this._modules.proxy&&(e=this._modules.proxy.call(this,e)),this._config.keepAlive&&this._modules.keepAlive&&(e=this._modules.keepAlive(e)),e.timeout(t.timeout).end(function(e,r){var s={};if(s.error=null!==e,s.operation=t.operation,r&&r.status&&(s.statusCode=r.status),e)return s.errorData=e,s.category=i._detectErrorCategory(e),n(s,null);var o=JSON.parse(r.text);return o.error&&1===o.error&&o.status&&o.message&&o.service?(s.errorData=o,s.statusCode=o.status,s.error=!0,s.category=i._detectErrorCategory(s),n(s,null)):n(s,o)})}function s(e,t,n){var r=c.default.get(this.getStandardOrigin()+t.url).query(e);return i.call(this,r,t,n)}function o(e,t,n,r){var s=c.default.post(this.getStandardOrigin()+n.url).query(e).send(t);return i.call(this,s,n,r)}function a(e,t,n){var r=c.default.delete(this.getStandardOrigin()+t.url).query(e);return i.call(this,r,t,n)}Object.defineProperty(t,"__esModule",{value:!0}),t.get=s,t.post=o,t.del=a;var u=n(42),c=function(e){return e&&e.__esModule?e:{default:e}}(u);n(5)},function(e,t,n){function r(){}function i(e){if(!y(e))return e;var t=[];for(var n in e)s(t,n,e[n]);return t.join("&")}function s(e,t,n){if(null!=n)if(Array.isArray(n))n.forEach(function(n){s(e,t,n)});else if(y(n))for(var r in n)s(e,t+"["+r+"]",n[r]);else e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));else null===n&&e.push(encodeURIComponent(t))}function o(e){for(var t,n,r={},i=e.split("&"),s=0,o=i.length;s<o;++s)t=i[s],n=t.indexOf("="),-1==n?r[decodeURIComponent(t)]="":r[decodeURIComponent(t.slice(0,n))]=decodeURIComponent(t.slice(n+1));return r}function a(e){for(var t,n,r,i,s=e.split(/\r?\n/),o={},a=0,u=s.length;a<u;++a)n=s[a],-1!==(t=n.indexOf(":"))&&(r=n.slice(0,t).toLowerCase(),i=_(n.slice(t+1)),o[r]=i);return o}function u(e){return/[\/+]json($|[^-\w])/.test(e)}function c(e){this.req=e,this.xhr=this.req.xhr,this.text="HEAD"!=this.req.method&&(""===this.xhr.responseType||"text"===this.xhr.responseType)||void 0===this.xhr.responseType?this.xhr.responseText:null,this.statusText=this.req.xhr.statusText;var t=this.xhr.status;1223===t&&(t=204),this._setStatusProperties(t),this.header=this.headers=a(this.xhr.getAllResponseHeaders()),this.header["content-type"]=this.xhr.getResponseHeader("content-type"),this._setHeaderProperties(this.header),null===this.text&&e._responseType?this.body=this.xhr.response:this.body="HEAD"!=this.req.method?this._parseBody(this.text?this.text:this.xhr.response):null}function l(e,t){var n=this;this._query=this._query||[],this.method=e,this.url=t,this.header={},this._header={},this.on("end",function(){var e=null,t=null;try{t=new c(n)}catch(t){return e=new Error("Parser is unable to parse the response"),e.parse=!0,e.original=t,n.xhr?(e.rawResponse=void 0===n.xhr.responseType?n.xhr.responseText:n.xhr.response,e.status=n.xhr.status?n.xhr.status:null,e.statusCode=e.status):(e.rawResponse=null,e.status=null),n.callback(e)}n.emit("response",t);var r;try{n._isResponseOK(t)||(r=new Error(t.statusText||"Unsuccessful HTTP response"))}catch(e){r=e}r?(r.original=e,r.response=t,r.status=t.status,n.callback(r,t)):n.callback(null,t)})}function h(e,t,n){var r=v("DELETE",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}var f;"undefined"!=typeof window?f=window:"undefined"!=typeof self?f=self:(console.warn("Using browser-only version of superagent in non-browser environment"),f=this);var p=n(43),d=n(44),y=n(45),g=n(46),b=n(48),v=t=e.exports=function(e,n){return"function"==typeof n?new t.Request("GET",e).end(n):1==arguments.length?new t.Request("GET",e):new t.Request(e,n)};t.Request=l,v.getXHR=function(){if(!(!f.XMLHttpRequest||f.location&&"file:"==f.location.protocol&&f.ActiveXObject))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(e){}throw Error("Browser-only version of superagent could not find XHR")};var _="".trim?function(e){return e.trim()}:function(e){return e.replace(/(^\s*|\s*$)/g,"")};v.serializeObject=i,v.parseString=o,v.types={html:"text/html",json:"application/json",xml:"text/xml",urlencoded:"application/x-www-form-urlencoded",form:"application/x-www-form-urlencoded","form-data":"application/x-www-form-urlencoded"},v.serialize={"application/x-www-form-urlencoded":i,"application/json":JSON.stringify},v.parse={"application/x-www-form-urlencoded":o,"application/json":JSON.parse},g(c.prototype),c.prototype._parseBody=function(e){var t=v.parse[this.type];return this.req._parser?this.req._parser(this,e):(!t&&u(this.type)&&(t=v.parse["application/json"]),t&&e&&(e.length||e instanceof Object)?t(e):null)},c.prototype.toError=function(){var e=this.req,t=e.method,n=e.url,r="cannot "+t+" "+n+" ("+this.status+")",i=new Error(r);return i.status=this.status,i.method=t,i.url=n,i},v.Response=c,p(l.prototype),d(l.prototype),l.prototype.type=function(e){return this.set("Content-Type",v.types[e]||e),this},l.prototype.accept=function(e){return this.set("Accept",v.types[e]||e),this},l.prototype.auth=function(e,t,n){1===arguments.length&&(t=""),"object"==typeof t&&null!==t&&(n=t,t=""),n||(n={type:"function"==typeof btoa?"basic":"auto"});var r=function(e){if("function"==typeof btoa)return btoa(e);throw new Error("Cannot use basic auth, btoa is not a function")};return this._auth(e,t,n,r)},l.prototype.query=function(e){return"string"!=typeof e&&(e=i(e)),e&&this._query.push(e),this},l.prototype.attach=function(e,t,n){if(t){if(this._data)throw Error("superagent can't mix .send() and .attach()");this._getFormData().append(e,t,n||t.name)}return this},l.prototype._getFormData=function(){return this._formData||(this._formData=new f.FormData),this._formData},l.prototype.callback=function(e,t){if(this._shouldRetry(e,t))return this._retry();var n=this._callback;this.clearTimeout(),e&&(this._maxRetries&&(e.retries=this._retries-1),this.emit("error",e)),n(e,t)},l.prototype.crossDomainError=function(){var e=new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");e.crossDomain=!0,e.status=this.status,e.method=this.method,e.url=this.url,this.callback(e)},l.prototype.buffer=l.prototype.ca=l.prototype.agent=function(){return console.warn("This is not supported in browser version of superagent"),this},l.prototype.pipe=l.prototype.write=function(){throw Error("Streaming is not supported in browser version of superagent")},l.prototype._isHost=function(e){return e&&"object"==typeof e&&!Array.isArray(e)&&"[object Object]"!==Object.prototype.toString.call(e)},l.prototype.end=function(e){return this._endCalled&&console.warn("Warning: .end() was called twice. This is not supported in superagent"),this._endCalled=!0,this._callback=e||r,this._finalizeQueryString(),this._end()},l.prototype._end=function(){var e=this,t=this.xhr=v.getXHR(),n=this._formData||this._data;this._setTimeouts(),t.onreadystatechange=function(){var n=t.readyState;if(n>=2&&e._responseTimeoutTimer&&clearTimeout(e._responseTimeoutTimer),4==n){var r;try{r=t.status}catch(e){r=0}if(!r){if(e.timedout||e._aborted)return;return e.crossDomainError()}e.emit("end")}};var r=function(t,n){n.total>0&&(n.percent=n.loaded/n.total*100),n.direction=t,e.emit("progress",n)};if(this.hasListeners("progress"))try{t.onprogress=r.bind(null,"download"),t.upload&&(t.upload.onprogress=r.bind(null,"upload"))}catch(e){}try{this.username&&this.password?t.open(this.method,this.url,!0,this.username,this.password):t.open(this.method,this.url,!0)}catch(e){return this.callback(e)}if(this._withCredentials&&(t.withCredentials=!0),!this._formData&&"GET"!=this.method&&"HEAD"!=this.method&&"string"!=typeof n&&!this._isHost(n)){var i=this._header["content-type"],s=this._serializer||v.serialize[i?i.split(";")[0]:""];!s&&u(i)&&(s=v.serialize["application/json"]),s&&(n=s(n))}for(var o in this.header)null!=this.header[o]&&this.header.hasOwnProperty(o)&&t.setRequestHeader(o,this.header[o]);return this._responseType&&(t.responseType=this._responseType),this.emit("request",this),t.send(void 0!==n?n:null),this},v.agent=function(){return new b},["GET","POST","OPTIONS","PATCH","PUT","DELETE"].forEach(function(e){b.prototype[e.toLowerCase()]=function(t,n){var r=new v.Request(e,t);return this._setDefaults(r),n&&r.end(n),r}}),b.prototype.del=b.prototype.delete,v.get=function(e,t,n){var r=v("GET",e);return"function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},v.head=function(e,t,n){var r=v("HEAD",e);return"function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},v.options=function(e,t,n){var r=v("OPTIONS",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},v.del=h,v.delete=h,v.patch=function(e,t,n){var r=v("PATCH",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},v.post=function(e,t,n){var r=v("POST",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},v.put=function(e,t,n){var r=v("PUT",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}},function(e,t,n){function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+e]=this._callbacks["$"+e]||[]).push(t),this},r.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var n=this._callbacks["$"+e];if(!n)return this;if(1==arguments.length)return delete this._callbacks["$"+e],this;for(var r,i=0;i<n.length;i++)if((r=n[i])===t||r.fn===t){n.splice(i,1);break}return this},r.prototype.emit=function(e){this._callbacks=this._callbacks||{};var t=[].slice.call(arguments,1),n=this._callbacks["$"+e];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},r.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks["$"+e]||[]},r.prototype.hasListeners=function(e){return!!this.listeners(e).length}},function(e,t,n){"use strict";function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}var s=n(45);e.exports=r,r.prototype.clearTimeout=function(){return clearTimeout(this._timer),clearTimeout(this._responseTimeoutTimer),delete this._timer,delete this._responseTimeoutTimer,this},r.prototype.parse=function(e){return this._parser=e,this},r.prototype.responseType=function(e){return this._responseType=e,this},r.prototype.serialize=function(e){return this._serializer=e,this},r.prototype.timeout=function(e){if(!e||"object"!=typeof e)return this._timeout=e,this._responseTimeout=0,this;for(var t in e)switch(t){case"deadline":this._timeout=e.deadline;break;case"response":this._responseTimeout=e.response;break;default:console.warn("Unknown timeout option",t)}return this},r.prototype.retry=function(e,t){return 0!==arguments.length&&!0!==e||(e=1),e<=0&&(e=0),this._maxRetries=e,this._retries=0,this._retryCallback=t,this};var o=["ECONNRESET","ETIMEDOUT","EADDRINFO","ESOCKETTIMEDOUT"];r.prototype._shouldRetry=function(e,t){if(!this._maxRetries||this._retries++>=this._maxRetries)return!1;if(this._retryCallback)try{var n=this._retryCallback(e,t);if(!0===n)return!0;if(!1===n)return!1}catch(e){console.error(e)}if(t&&t.status&&t.status>=500&&501!=t.status)return!0;if(e){if(e.code&&~o.indexOf(e.code))return!0;if(e.timeout&&"ECONNABORTED"==e.code)return!0;if(e.crossDomain)return!0}return!1},r.prototype._retry=function(){return this.clearTimeout(),this.req&&(this.req=null,this.req=this.request()),this._aborted=!1,this.timedout=!1,this._end()},r.prototype.then=function(e,t){if(!this._fullfilledPromise){var n=this;this._endCalled&&console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises"),this._fullfilledPromise=new Promise(function(e,t){n.end(function(n,r){n?t(n):e(r)})})}return this._fullfilledPromise.then(e,t)},r.prototype.catch=function(e){return this.then(void 0,e)},r.prototype.use=function(e){return e(this),this},r.prototype.ok=function(e){if("function"!=typeof e)throw Error("Callback required");return this._okCallback=e,this},r.prototype._isResponseOK=function(e){return!!e&&(this._okCallback?this._okCallback(e):e.status>=200&&e.status<300)},r.prototype.get=function(e){return this._header[e.toLowerCase()]},r.prototype.getHeader=r.prototype.get,r.prototype.set=function(e,t){if(s(e)){for(var n in e)this.set(n,e[n]);return this}return this._header[e.toLowerCase()]=t,this.header[e]=t,this},r.prototype.unset=function(e){return delete this._header[e.toLowerCase()],delete this.header[e],this},r.prototype.field=function(e,t){if(null===e||void 0===e)throw new Error(".field(name, val) name can not be empty");if(this._data&&console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()"),s(e)){for(var n in e)this.field(n,e[n]);return this}if(Array.isArray(t)){for(var r in t)this.field(e,t[r]);return this}if(null===t||void 0===t)throw new Error(".field(name, val) val can not be empty");return"boolean"==typeof t&&(t=""+t),this._getFormData().append(e,t),this},r.prototype.abort=function(){return this._aborted?this:(this._aborted=!0,this.xhr&&this.xhr.abort(),this.req&&this.req.abort(),this.clearTimeout(),this.emit("abort"),this)},r.prototype._auth=function(e,t,n,r){switch(n.type){case"basic":this.set("Authorization","Basic "+r(e+":"+t));break;case"auto":this.username=e,this.password=t;break;case"bearer":this.set("Authorization","Bearer "+e)}return this},r.prototype.withCredentials=function(e){return void 0==e&&(e=!0),this._withCredentials=e,this},r.prototype.redirects=function(e){return this._maxRedirects=e,this},r.prototype.maxResponseSize=function(e){if("number"!=typeof e)throw TypeError("Invalid argument");return this._maxResponseSize=e,this},r.prototype.toJSON=function(){return{method:this.method,url:this.url,data:this._data,headers:this._header}},r.prototype.send=function(e){var t=s(e),n=this._header["content-type"];if(this._formData&&console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()"),t&&!this._data)Array.isArray(e)?this._data=[]:this._isHost(e)||(this._data={});else if(e&&this._data&&this._isHost(this._data))throw Error("Can't merge these send calls");if(t&&s(this._data))for(var r in e)this._data[r]=e[r];else"string"==typeof e?(n||this.type("form"),n=this._header["content-type"],this._data="application/x-www-form-urlencoded"==n?this._data?this._data+"&"+e:e:(this._data||"")+e):this._data=e;return!t||this._isHost(e)?this:(n||this.type("json"),this)},r.prototype.sortQuery=function(e){return this._sort=void 0===e||e,this},r.prototype._finalizeQueryString=function(){var e=this._query.join("&");if(e&&(this.url+=(this.url.indexOf("?")>=0?"&":"?")+e),this._query.length=0,this._sort){var t=this.url.indexOf("?");if(t>=0){var n=this.url.substring(t+1).split("&");"function"==typeof this._sort?n.sort(this._sort):n.sort(),this.url=this.url.substring(0,t)+"?"+n.join("&")}}},r.prototype._appendQueryString=function(){console.trace("Unsupported")},r.prototype._timeoutError=function(e,t,n){if(!this._aborted){var r=new Error(e+t+"ms exceeded");r.timeout=t,r.code="ECONNABORTED",r.errno=n,this.timedout=!0,this.abort(),this.callback(r)}},r.prototype._setTimeouts=function(){var e=this;this._timeout&&!this._timer&&(this._timer=setTimeout(function(){e._timeoutError("Timeout of ",e._timeout,"ETIME")},this._timeout)),this._responseTimeout&&!this._responseTimeoutTimer&&(this._responseTimeoutTimer=setTimeout(function(){e._timeoutError("Response timeout of ",e._responseTimeout,"ETIMEDOUT")},this._responseTimeout))}},function(e,t){"use strict";function n(e){return null!==e&&"object"==typeof e}e.exports=n},function(e,t,n){"use strict";function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}var s=n(47);e.exports=r,r.prototype.get=function(e){return this.header[e.toLowerCase()]},r.prototype._setHeaderProperties=function(e){var t=e["content-type"]||"";this.type=s.type(t);var n=s.params(t);for(var r in n)this[r]=n[r];this.links={};try{e.link&&(this.links=s.parseLinks(e.link))}catch(e){}},r.prototype._setStatusProperties=function(e){var t=e/100|0;this.status=this.statusCode=e,this.statusType=t,this.info=1==t,this.ok=2==t,this.redirect=3==t,this.clientError=4==t,this.serverError=5==t,this.error=(4==t||5==t)&&this.toError(),this.accepted=202==e,this.noContent=204==e,this.badRequest=400==e,this.unauthorized=401==e,this.notAcceptable=406==e,this.forbidden=403==e,this.notFound=404==e}},function(e,t){"use strict";t.type=function(e){return e.split(/ *; */).shift()},t.params=function(e){return e.split(/ *; */).reduce(function(e,t){var n=t.split(/ *= */),r=n.shift(),i=n.shift();return r&&i&&(e[r]=i),e},{})},t.parseLinks=function(e){return e.split(/ *, */).reduce(function(e,t){var n=t.split(/ *; */),r=n[0].slice(1,-1);return e[n[1].split(/ *= */)[1].slice(1,-1)]=r,e},{})},t.cleanHeader=function(e,t){return delete e["content-type"],delete e["content-length"],delete e["transfer-encoding"],delete e.host,t&&(delete e.authorization,delete e.cookie),e}},function(e,t){function n(){this._defaults=[]}["use","on","once","set","query","type","accept","auth","withCredentials","sortQuery","retry","ok","redirects","timeout","buffer","serialize","parse","ca","key","pfx","cert"].forEach(function(e){n.prototype[e]=function(){return this._defaults.push({fn:e,arguments:arguments}),this}}),n.prototype._setDefaults=function(e){this._defaults.forEach(function(t){e[t.fn].apply(e,t.arguments)})},e.exports=n}])});

/***/ }),
/* 51 */
/***/ (function(module, exports) {

module.exports = {"author":"PubNub","name":"chat-engine","version":"0.9.5","description":"ChatEngine","main":"src/index.js","scripts":{"deploy":"gulp; npm publish;","docs":"jsdoc src/index.js -c jsdoc.json"},"repository":{"type":"git","url":"git+https://github.com/pubnub/chat-engine.git"},"keywords":["pubnub","chat","sdk","realtime"],"bugs":{"url":"https://github.com/pubnub/chat-engine/issues"},"homepage":"https://github.com/pubnub/chat-engine#readme","devDependencies":{"body-parser":"^1.17.2","chai":"^3.5.0","chat-engine-typing-indicator":"0.0.x","decache":"^4.3.0","docdash":"^0.4.0","es6-promise":"^4.1.1","eslint":"^4.7.1","eslint-config-airbnb":"^15.1.0","eslint-plugin-import":"^2.7.0","express":"^4.15.3","gulp":"^3.9.1","gulp-clean":"^0.3.2","gulp-eslint":"^4.0.0","gulp-istanbul":"^1.1.2","gulp-jsdoc3":"^1.0.1","gulp-mocha":"^3.0.1","gulp-rename":"^1.2.2","gulp-surge":"^0.1.0","gulp-uglify":"^2.0.0","gulp-uglify-es":"^0.1.3","http-server":"^0.10.0","isparta":"^4.0.0","jsdoc":"^3.5.5","mocha":"^3.1.2","proxyquire":"^1.8.0","pubnub-functions-mock":"^0.0.13","request":"^2.82.0","run-sequence":"^2.2.0","sinon":"^4.0.0","stats-webpack-plugin":"^0.6.1","surge":"^0.19.0","uglifyjs-webpack-plugin":"^1.0.1","webpack":"^3.6.0","webpack-stream":"^4.0.0"},"dependencies":{"async":"^2.1.2","axios":"^0.16.2","eventemitter2":"^2.2.1","pubnub":"^4.20.1"}}

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*!
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

  if (true) {
     // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return EventEmitter;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = EventEmitter;
  }
  else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
}();


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(15);
const Emitter = __webpack_require__(3);
const Event = __webpack_require__(25);
const Search = __webpack_require__(73);

/**
 This is the root {@link Chat} class that represents a chat room

 @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. Must be alphanumeric. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
 @param {Boolean} [isPrivate=true] Attempt to authenticate ourselves before connecting to this {@link Chat}.
 @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
 @param {Object} [meta={}] Chat metadata that will be persisted on the server and populated on creation.
 @param {String} [group='default'] Groups chat into a "type". This is the key which chats will be grouped into within {@link Me.session} object.
 @class Chat
 @extends Emitter
 @extends RootEmitter
 @fires Chat#$"."ready
 @fires Chat#$"."state
 @fires Chat#$"."online"."*
 @fires Chat#$"."offline"."*
 */
class Chat extends Emitter {

    constructor(chatEngine, channel = new Date().getTime(), isPrivate = false, autoConnect = true, meta = {}, group = 'custom') {

        super(chatEngine);

        this.chatEngine = chatEngine;

        this.name = 'Chat';

        /**
        * Classify the chat within some group, Valid options are 'system', 'fixed', or 'custom'.
        * @type Boolean
        * @readonly
        * @private
        */
        this.group = group;

        /**
        * Excludes all users from reading or writing to the {@link chat} unless they have been explicitly invited via {@link Chat#invite};
        * @type Boolean
        * @readonly
        */
        this.isPrivate = isPrivate;

        /**
         * Chat metadata persisted on the server. Useful for storing things like the name and description. Call {@link Chat#update} to update the remote information.
         * @type Object
         * @readonly
         */
        this.meta = meta || {};

        /**
         * A string identifier for the Chat room. Any chat with an identical channel will be able to communicate with one another.
         * @type String
         * @readonly
         * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
         */
        this.channel = this.chatEngine.augmentChannel(channel, this.isPrivate);

        /**
         A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
         Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes

         @type Object
         @readonly
         */
        this.users = {};

        /**
         * Boolean value that indicates of the Chat is connected to the network
         * @type {Boolean}
         */
        this.connected = false;

        /**
         * Keep a record if we've every successfully connected to this chat before.
         * @type {Boolean}
         */
        this.hasConnected = false;

        /**
         * If user manually disconnects via {@link ChatEngine#disconnect}, the
         * chat is put to "sleep". If a connection is reestablished
         * via {@link ChatEngine#reconnect}, sleeping chats reconnect automatically.
         * @type {Boolean}
         */
        this.asleep = false;

        this.chatEngine.chats[this.channel] = this;

        if (autoConnect) {
            this.connect();
        }

        return this;

    }

    /**
     Updates list of {@link User}s in this {@link Chat}
     based on who is online now.

     @private
     @param {Object} status The response status
     @param {Object} response The response payload object
     */
    onHereNow(status, response) {

        if (status.error) {

            /**
             * There was a problem fetching the presence of this chat
             * @event Chat#$"."error"."presence
             */
            this.chatEngine.throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'));

        } else {

            // get the list of occupants in this channel
            let occupants = response.channels[this.channel].occupants;

            // format the userList for rltm.js standard
            occupants.forEach((occupant) => {
                this.userUpdate(occupant.uuid, occupant.state);
            });

        }

    }

    /**
    * Turns a {@link Chat} into a JSON representation.
    * @return {Object}
    */
    objectify() {

        return {
            channel: this.channel,
            group: this.group,
            private: this.isPrivate,
            meta: this.meta
        };

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
    invite(user) {

        this.chatEngine.request('post', 'invite', {
            to: user.uuid,
            chat: this.objectify()
        })
            .then(() => {

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

                };

                if (!user.direct.connected) {
                    user.direct.connect();
                    user.direct.on('$.connected', send);
                } else {
                    send();
                }

            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'search', new Error('Something went wrong while making a request to authentication server.'), { error });
            });

    }

    /**
     Keep track of {@link User}s in the room by subscribing to PubNub presence events.

     @private
     @param {Object} data The PubNub presence response for this event
     */
    onPresence(presenceEvent) {

        // make sure channel matches this channel

        // someone joins channel
        if (presenceEvent.action === 'join') {

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

            // It's possible for PubNub to send us both a join and have the user appear in here_now
            // Avoid firing duplicate $.online events.
            if (!this.users[user.uuid]) {
                this.trigger('$.online.join', { user });
            }

        }

        // someone leaves channel
        if (presenceEvent.action === 'leave') {
            this.userLeave(presenceEvent.uuid);
        }

        // someone timesout
        if (presenceEvent.action === 'timeout') {
            this.userDisconnect(presenceEvent.uuid);
        }

        // someone's state is updated
        if (presenceEvent.action === 'state-change') {
            this.userUpdate(presenceEvent.uuid, presenceEvent.state);
        }

    }

    /**
     * Update the {@link Chat} metadata on the server.
     * @param  {object} data JSON object representing chat metadta.
     */
    update(data) {

        let oldMeta = this.meta || {};
        this.meta = Object.assign(oldMeta, data);

        this.chatEngine.request('post', 'chat', {
            chat: this.objectify()
        }).then(() => {
        }).catch((error) => {
            this.chatEngine.throwError(this, 'trigger', 'chat', new Error('Something went wrong while making a request to chat server.'), { error });
        });

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

        if (event === 'message' && typeof data !== 'object') {
            throw new Error('the payload has to be an object');
        }

        // create a standardized payload object
        let payload = {
            data, // the data supplied from params
            sender: this.chatEngine.me.uuid, // my own uuid
            chat: this, // an instance of this chat
            event,
            chatengineSDK: this.chatEngine.package.version
        };

        let tracer = new Event(this.chatEngine, this, event);

        // run the plugin queue to modify the event
        this.runPluginQueue('emit', event, (next) => {
            next(null, payload);
        }, (err, pluginResponse) => {

            // remove chat otherwise it would be serialized
            // instead, it's rebuilt on the other end.
            // see this.trigger
            delete pluginResponse.chat;

            // publish the event and data over the configured channel
            tracer.publish(pluginResponse);

        });

        return tracer;

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
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new this.chatEngine.User(uuid);
        this.chatEngine.users[uuid].assign(state);

        // check if the user already exists within the chatroom
        // so we know if we need to notify or not
        let userAlreadyHere = this.users[uuid];

        // assign the user to the chatroom
        this.users[uuid] = this.chatEngine.users[uuid];

        // trigger the join event over this chatroom
        if (!userAlreadyHere) {

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
                user: this.chatEngine.users[uuid]
            });

        }

        // return the instance of this user
        return this.chatEngine.users[uuid];

    }

    /**
     * Update a user's state.
     * @private
     * @param {String} uuid The {@link User} uuid
     * @param {Object} state State to update for the user
     */
    userUpdate(uuid, state) {

        // ensure the user exists within the global space
        this.chatEngine.users[uuid] = this.chatEngine.users[uuid] || new this.chatEngine.User(uuid);

        // if we don't know about this user
        if (!this.users[uuid]) {
            // do the whole join thing
            this.createUser(uuid, state);
        }

        // update this user's state in this chatroom
        this.users[uuid].assign(state);

        /**
         * Broadcast that a {@link User} has changed state.
         * @event ChatEngine#$"."state
         * @param {Object} data The payload returned by the event
         * @param {User} data.user The {@link User} that changed state
         * @param {Object} data.state The new user state
         * @example
         * ChatEngine.on('$.state', (data) => {
         *     console.log('User has changed state:', data.user, 'new state:', data.state);
         * });
         */
        this.chatEngine._emit('$.state', {
            user: this.users[uuid],
            state: this.users[uuid].state
        });

    }

    /**
     * Called by {@link ChatEngine#disconnect}. Fires disconnection notifications
     * and stores "sleep" state in memory. Sleep means the Chat was previously connected.
     * @private
     */
    sleep() {

        if (this.connected) {
            this.onDisconnected();
            this.asleep = true;
        }
    }

    /**
     * Called by {@link ChatEngine#reconnect}. Wakes the Chat up from sleep state.
     * Re-authenticates with the server, and fires connection events once established.
     * @private
     */
    wake() {

        if (this.asleep) {
            this.handshake(() => {
                this.onConnected();
            });
        }

    }

    /**
     * Fired upon successful connection to the network.
     * @private
     */
    onConnected() {
        this.connected = true;
        this.trigger('$.connected');
    }

    /**
     * Fires upon disconnection from the network through any means.
     * @private
     */
    onDisconnected() {
        this.connected = false;
        this.trigger('$.disconnected');
    }
    /**
     * Fires upon manually invoked leaving.
     * @private
     */
    onLeave() {
        this.trigger('$.left');
        this.onDisconnected();
    }

    /**
     * Leave from the {@link Chat} on behalf of {@link Me}. Disconnects from the {@link Chat} and will stop
     * receiving events.
     * @fires Chat#event:$"."offline"."leave
     * @example
     * chat.leave();
     */
    leave() {

        // unsubscribe from the channel locally
        this.chatEngine.pubnub.unsubscribe({
            channels: [this.channel]
        });

        // tell the server we left
        this.chatEngine.request('post', 'leave', { chat: this.objectify() })
            .then(() => {

                // trigger the disconnect events and update state
                this.onLeave();

                // tell the chat we've left
                this.emit('$.system.leave', { subject: this.objectify() });

                // tell session we've left
                if (this.chatEngine.me.session) {
                    this.chatEngine.me.session.leave(this);
                }

            })
            .catch((error) => {
                this.chatEngine.throwError(this, 'trigger', 'chat', new Error('Something went wrong while making a request to chat server.'), { error });
            });

    }

    /**
     Perform updates when a user has left the {@link Chat}.

     @private
     */
    userLeave(uuid) {

        let user = this.users[uuid];
        delete this.users[uuid];

        // make sure this event is real, user may have already left
        if (user) {

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
            this.trigger('$.offline.leave', { user });

            // remove the user from the local list of users
            delete this.users[uuid];

            // we don't remove the user from the global list,
            // because they may be online in other channels

        }

    }

    /**
     Fired when a user disconnects from the {@link Chat}

     @private
     @param {String} uuid The uuid of the {@link Chat} that left
     */
    userDisconnect(uuid) {

        let user = this.users[uuid];
        delete this.users[uuid];

        // make sure this event is real, user may have already left
        if (user) {

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
            this.trigger('$.offline.disconnect', { user });

        }

    }

    /**
     Set the state for {@link Me} within this {@link User}.
     Broadcasts the ```$.state``` event on other clients

     @private
     @param {Object} state The new state {@link Me} will have within this {@link User}
     */
    setState(state) {
        this.chatEngine.pubnub.setState({ state, channels: [this.chatEngine.global.channel] }, () => {
            // handle status, response
        });
    }

    /**
     Search through previously emitted events. Parameters act as AND operators. Returns an instance of the emitter based {@link History}. Will
     which will emit all old events unless ```config.event``` is supplied.
     @param {Object} [config] Our configuration for the PubNub history request. See the [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history) docs for more information on these parameters.
     @param {Event} [config.event] The {@link Event} to search for.
     @param {User} [config.sender] The {@link User} who sent the message.
     @param {Number} [config.limit=20] The maximum number of results to return that match search criteria. Search will continue operating until it returns this number of results or it reached the end of history. Limit will be ignored in case if both 'start' and 'end' timetokens has been passed in search configuration.
     @param {Number} [config.start=0] The timetoken to begin searching between.
     @param {Number} [config.end=0] The timetoken to end searching between.
     @param {Boolean} [config.reverse=false] Search oldest messages first.
     @return {Search}
     @example
    chat.search({
        event: 'my-custom-event',
        sender: ChatEngine.me,
        limit: 20
    }).on('my-custom-event', (event) => {
        console.log('this is an old event!', event);
    }).on('$.search.finish', () => {
        console.log('we have all our results!')
    });
     */
    search(config) {

        if (this.hasConnected) {
            return new Search(this.chatEngine, this, config);
        } else {
            this.chatEngine.throwError(this, 'trigger', 'search', new Error('You must wait for the $.connected event before calling Chat#search'));
        }

    }

    /**
     * Fired when the chat first connects to network.
     * @private
     */
    connectionReady() {

        this.connected = true;
        this.hasConnected = true;

        /**
         * Broadcast that the {@link Chat} is connected to the network.
         * @event Chat#$"."connected
         * @example
         * chat.on('$.connected', () => {
         *     console.log('chat is ready to go!');
         * });
         */
        this.onConnected();

        if (this.chatEngine.me.session) {
            this.chatEngine.me.session.join(this);
        }

        // add self to list of users
        this.users[this.chatEngine.me.uuid] = this.chatEngine.me;

        // trigger my own online event
        this.trigger('$.online.join', {
            user: this.chatEngine.me
        });

        // global channel updates are triggered manually, only get presence on custom chats
        if (this.channel !== this.chatEngine.global.channel && this.group === 'custom') {

            this.getUserUpdates();

            // we may miss updates, so call this again 5 seconds later
            setTimeout(() => {
                this.getUserUpdates();
            }, 5000);

        }

        this.on('$.system.leave', (payload) => {
            this.userLeave(payload.sender.uuid);
        });

    }

    /**
     * Ask PubNub for information about {@link User}s in this {@link Chat}.
     */
    getUserUpdates() {

        // get a list of users online now
        // ask PubNub for information about connected users in this channel
        this.chatEngine.pubnub.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (s, r) => {
            this.onHereNow(s, r);
        });

    }

    /**
     * Establish authentication with the server, then subscribe with PubNub.
     * @return {[type]} [description]
     */
    connect() {

        // establish good will with the server
        this.handshake((response) => {

            // asign metadata locally
            if (response.data.found) {
                this.meta = response.data.chat.meta;
            } else {
                this.update(this.meta);
            }

            // now that we've got connection, do everything else via connectionReady
            this.connectionReady();

        });

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
    handshake(callback) {

        async.waterfall([
            (next) => {
                if (!this.chatEngine.pubnub) {
                    next('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.');
                } else {
                    next();
                }
            },
            (next) => {

                this.chatEngine.request('post', 'grant', { chat: this.objectify() })
                    .then(() => {
                        next();
                    })
                    .catch(next);

            },
            (next) => {

                this.chatEngine.request('post', 'join', { chat: this.objectify() })
                    .then(() => {
                        next();
                    })
                    .catch(next);

            },
            (next) => {

                this.chatEngine.request('get', 'chat', {}, { channel: this.channel })
                    .then(callback)
                    .catch(next);

            }
        ], (error) => {
            this.chatEngine.throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), { error });
        });

    }

}

module.exports = Chat;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(55);
// On some exotic environments, it's not clear which object `setimmeidate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.
exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
                       (typeof global !== "undefined" && global.setImmediate) ||
                       (this && this.setImmediate);
exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
                         (typeof global !== "undefined" && global.clearImmediate) ||
                         (this && this.clearImmediate);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(1)))

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

var _isArray = __webpack_require__(16);

var _isArray2 = _interopRequireDefault(_isArray);

var _noop = __webpack_require__(17);

var _noop2 = _interopRequireDefault(_noop);

var _once = __webpack_require__(18);

var _once2 = _interopRequireDefault(_once);

var _baseRest = __webpack_require__(57);

var _baseRest2 = _interopRequireDefault(_baseRest);

var _onlyOnce = __webpack_require__(24);

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

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__(19),
    overRest = __webpack_require__(58),
    setToString = __webpack_require__(60);

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


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__(59);

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


/***/ }),
/* 59 */
/***/ (function(module, exports) {

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


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__(61),
    shortOut = __webpack_require__(72);

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


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__(62),
    defineProperty = __webpack_require__(63),
    identity = __webpack_require__(19);

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


/***/ }),
/* 62 */
/***/ (function(module, exports) {

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


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(64);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(65),
    getValue = __webpack_require__(71);

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


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(20),
    isMasked = __webpack_require__(68),
    isObject = __webpack_require__(23),
    toSource = __webpack_require__(70);

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


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(21);

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


/***/ }),
/* 67 */
/***/ (function(module, exports) {

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


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(69);

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


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(8);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

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


/***/ }),
/* 71 */
/***/ (function(module, exports) {

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


/***/ }),
/* 72 */
/***/ (function(module, exports) {

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


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

const Emitter = __webpack_require__(3);
const eachSeries = __webpack_require__(74);
/**
Returned by {@link Chat#search}. This is our Search class which allows one to search the backlog of messages.
Powered by [PubNub History](https://www.pubnub.com/docs/web-javascript/storage-and-history).
@class Search
@extends Emitter
@extends RootEmitter
@param {ChatEngine} chatEngine This instance of the {@link ChatEngine} object.
@param {Chat} chat The {@link Chat} object to search.
@param {Object} config The configuration object. See {@link Chat#search} for a list of parameters.
*/
class Search extends Emitter {

    constructor(chatEngine, chat, config = {}) {

        super();

        this.chatEngine = chatEngine;

        /**
        Handy property to identify what this class is.
        @type String
        */
        this.name = 'Search';

        /**
        The {@link Chat} used for searching.
        @type Chat
        */
        this.chat = chat;

        /**
        An object containing configuration parameters supplied by {@link Chat#search}. See {@link Chat#search} for possible parameters.
        @type {Object}
        */
        this.config = config;
        this.config.event = config.event;
        this.config.limit = config.limit || 20;
        this.config.channel = this.chat.channel;
        this.config.includeTimetoken = true;
        this.config.stringifiedTimeToken = true;
        this.config.count = this.config.count || 100;
        this.config.pages = this.config.pages || 10;

        /** @private */
        this.maxPage = this.config.pages;
        /** @private */
        this.numPage = 0;

        /** @private */
        this.referenceDate = this.config.end || 0;

        /**
         * Flag which represent whether there is potentially more data available in {@link Chat} history. This flag can
         * be used for conditional call of {@link Chat#search}.
         * @type {boolean}
         */
        this.hasMore = true;
        /** @private */
        this.messagesBetweenTimetokens = this.config.start > '0' && this.config.end > '0';
        /** @private */
        this.needleCount = 0;

        /**
         * Call PubNub history in a loop.
         * @private
         */
        this.page = (pageDone) => {
            let searchConfiguration = Object.assign({}, this.config, { start: this.referenceDate });
            delete searchConfiguration.reverse;
            delete searchConfiguration.end;

            /**
             * Requesting another page from PubNub History.
             * @event Search#$"."page"."request
             */
            this._emit('$.search.page.request');

            this.chatEngine.pubnub.history(searchConfiguration, (status, response) => {

                /**
                 * PubNub History returned a response.
                 * @event Search#$"."page"."response
                 */
                this._emit('$.search.page.response');

                if (status.error) {

                    /**
                     * There was a problem fetching the history of this chat
                     * @event Chat#$"."error"."history
                     */
                    this.chatEngine.throwError(this, 'trigger', 'search', new Error('There was a problem searching history. Make sure your request parameters are valid and history is enabled for this PubNub key.'), status);
                } else {
                    const startDate = response.startTimeToken;
                    this.referenceDate = response.startTimeToken;
                    this.hasMore = response.messages.length === this.config.count && startDate !== '0';

                    response.messages.sort((left, right) => (left.timetoken < right.timetoken ? -1 : 1));

                    if (this.config.start && startDate < this.config.start) {
                        this.hasMore = false;
                        response.messages = response.messages.filter(event => event.timetoken >= this.config.start);
                    }

                    pageDone(response);
                }

            });
        };

        let eventFilter = (event) => {
            return {
                middleware: {
                    on: {
                        '*': (payload, next) => {

                            let matches = payload && payload.event && payload.event === event;
                            next(!matches, payload);
                        }
                    }
                }
            };
        };

        let senderFilter = (user) => {
            return {
                middleware: {
                    on: {
                        '*': (payload, next) => {

                            let matches = payload && payload.sender && payload.sender.uuid === user.uuid;
                            next(!matches, payload);
                        }
                    }
                }
            };
        };

        /**
         * @private
         */
        this.triggerHistory = (message, cb) => {

            if (this.needleCount < this.config.limit || this.messagesBetweenTimetokens) {

                message.entry.timetoken = message.timetoken;

                this.trigger(message.entry.event, message.entry, (reject) => {

                    if (!reject) {
                        this.needleCount += 1;
                    }
                    cb();

                });

            } else {
                cb();
            }

        };

        this.next = () => {
            if (this.hasMore) {
                this.maxPage = this.maxPage + this.config.pages;

                this.find();
            } else {
                this._emit('$.search.finish');
            }
        };

        /**
         * @private
         */
        this.find = () => {
            this.page((response) => {
                response.messages.reverse();

                eachSeries(response.messages, this.triggerHistory, () => {
                    if (this.hasMore && this.numPage === this.maxPage) {
                        this._emit('$.search.pause');
                    } else if (this.hasMore && (this.needleCount < this.config.limit || this.messagesBetweenTimetokens)) {

                        this.numPage += 1;
                        this.find();
                    } else {
                        if (this.needleCount >= this.config.limit && !this.messagesBetweenTimetokens) {
                            this.hasMore = false;
                        }

                        /**
                         * Search has returned all results or reached the end of history.
                         * @event Search#$"."search"."finish
                         */
                        this._emit('$.search.finish');
                    }
                });
            });

            return this;
        };

        if (this.config.event) {
            this.plugin(eventFilter(this.config.event));
        }

        if (this.config.sender) {
            this.plugin(senderFilter(this.config.sender));
        }

        /**
         * Search has started.
         * @event Search#$"."search"."start
         */
        this._emit('$.search.start');
        this.find();
    }
}

module.exports = Search;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eachLimit = __webpack_require__(75);

var _eachLimit2 = _interopRequireDefault(_eachLimit);

var _doLimit = __webpack_require__(97);

var _doLimit2 = _interopRequireDefault(_doLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The iteratee is passed a `callback(err)` which must be called
 * once it has completed. If no error has occurred, the `callback` should be run
 * without arguments or with an explicit `null` argument. The array index is
 * not passed to the iteratee. Invoked with (item, callback). If you need the
 * index, use `eachOfSeries`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
exports.default = (0, _doLimit2.default)(_eachLimit2.default, 1);
module.exports = exports['default'];

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eachLimit;

var _eachOfLimit = __webpack_require__(76);

var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

var _withoutIndex = __webpack_require__(96);

var _withoutIndex2 = _interopRequireDefault(_withoutIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`. The
 * iteratee is passed a `callback(err)` which must be called once it has
 * completed. If no error has occurred, the `callback` should be run without
 * arguments or with an explicit `null` argument. The array index is not passed
 * to the iteratee. Invoked with (item, callback). If you need the index, use
 * `eachOfLimit`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit(coll, limit, iteratee, callback) {
  (0, _eachOfLimit2.default)(limit)(coll, (0, _withoutIndex2.default)(iteratee), callback);
}
module.exports = exports['default'];

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _eachOfLimit;

var _noop = __webpack_require__(17);

var _noop2 = _interopRequireDefault(_noop);

var _once = __webpack_require__(18);

var _once2 = _interopRequireDefault(_once);

var _iterator = __webpack_require__(77);

var _iterator2 = _interopRequireDefault(_iterator);

var _onlyOnce = __webpack_require__(24);

var _onlyOnce2 = _interopRequireDefault(_onlyOnce);

var _breakLoop = __webpack_require__(95);

var _breakLoop2 = _interopRequireDefault(_breakLoop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = (0, _once2.default)(callback || _noop2.default);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = (0, _iterator2.default)(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            } else if (value === _breakLoop2.default || done && running <= 0) {
                done = true;
                return callback(null);
            } else {
                replenish();
            }
        }

        function replenish() {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
            }
        }

        replenish();
    };
}
module.exports = exports['default'];

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = iterator;

var _isArrayLike = __webpack_require__(26);

var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

var _getIterator = __webpack_require__(78);

var _getIterator2 = _interopRequireDefault(_getIterator);

var _keys = __webpack_require__(79);

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? { value: coll[i], key: i } : null;
    };
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done) return null;
        i++;
        return { value: item.value, key: i };
    };
}

function createObjectIterator(obj) {
    var okeys = (0, _keys2.default)(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? { value: obj[key], key: key } : null;
    };
}

function iterator(coll) {
    if ((0, _isArrayLike2.default)(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = (0, _getIterator2.default)(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}
module.exports = exports['default'];

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

module.exports = exports['default'];

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(80),
    baseKeys = __webpack_require__(91),
    isArrayLike = __webpack_require__(26);

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(81),
    isArguments = __webpack_require__(82),
    isArray = __webpack_require__(16),
    isBuffer = __webpack_require__(84),
    isIndex = __webpack_require__(86),
    isTypedArray = __webpack_require__(87);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),
/* 81 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(83),
    isObjectLike = __webpack_require__(9);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(7),
    isObjectLike = __webpack_require__(9);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(8),
    stubFalse = __webpack_require__(85);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module)))

/***/ }),
/* 85 */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),
/* 86 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(88),
    baseUnary = __webpack_require__(89),
    nodeUtil = __webpack_require__(90);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(7),
    isLength = __webpack_require__(27),
    isObjectLike = __webpack_require__(9);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),
/* 89 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(22);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module)))

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__(92),
    nativeKeys = __webpack_require__(93);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),
/* 92 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(94);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),
/* 94 */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
exports.default = {};
module.exports = exports["default"];

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _withoutIndex;
function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}
module.exports = exports["default"];

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = doLimit;
function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}
module.exports = exports["default"];

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

const User = __webpack_require__(28);
const Session = __webpack_require__(99);
/**
 Represents the client connection as a special {@link User} with write permissions.
 Has the ability to update it's state on the network. An instance of
 {@link Me} is returned by the ```ChatEngine.connect()```
 method.

 @class Me
 @extends User
 @extends Emitter
 @extends RootEmitter
 @param {String} uuid The uuid of this user
 */
class Me extends User {

    constructor(chatEngine, uuid) {

        // call the User constructor
        super(chatEngine, uuid);

        this.chatEngine = chatEngine;

        this.session = false;

        this.name = 'Me';

        if (this.chatEngine.ceConfig.enableSync) {
            this.session = new Session(chatEngine);
        }

        return this;

    }

    /**
     * assign updates from network
     * @private
     */
    assign(state) {
        // we call "update" because calling "super.assign"
        // will direct back to "this.update" which creates
        // a loop of network updates
        super.update(state);
    }

    /**
     * Update {@link Me}'s state in a {@link Chat}. All other {@link User}s
     * will be notified of this change via ```$.state```.
     * Retrieve state at any time with {@link User#state}.
     * @param {Object} state The new state for {@link Me}
     * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
     * Defaults to ```ChatEngine.global```.
     * @fires Chat#event:$"."state
     * @example
     * // update state
     * me.update({value: true});
     */
    update(state) {

        // run the root update function
        super.update(state);

        // publish the update over the global channel
        this.chatEngine.global.setState(state);

    }

}

module.exports = Me;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

const Emitter = __webpack_require__(3);

class Session extends Emitter {

    constructor(chatEngine) {

        super(chatEngine);

        this.name = 'Session';

        this.chatEngine = chatEngine;

        /**
         * Stores a map of {@link Chat} objects that this {@link Me} has joined across all clients.
         * @type {Object}
         */
        this.chats = {};

        /**
         * The {@link Chat} that syncs session between instances. Only connects
         * if "enableSync" has been set to true in ceConfig.
         * @type {this}
         */
        this.sync = null;

    }

    /**
     * Forwards sync events from other instances into callback functions
     * @private
     */
    subscribe() {

        this.sync = new this.chatEngine.Chat([this.chatEngine.global.channel, 'user', this.chatEngine.me.uuid, 'me.', 'sync'].join('#'), false, this.chatEngine.ceConfig.enableSync, {}, 'system');

        // subscribe to the events on our sync chat and forward them
        this.sync.on('$.session.notify.chat.join', (payload) => {
            this.onJoin(payload.data.subject);
        });

        this.sync.on('$.session.notify.chat.leave', (payload) => {
            this.onleave(payload.data.subject);
        });

    }

    /**
     * Uses PubNub channel groups to restore a session for this uuid
     * @private
     */
    restore() {

        // these are custom groups that separate custom chats from system chats
        // for better fitlering
        let groups = ['custom', 'system'];

        // loop through the groups
        groups.forEach((group) => {

            // generate the channel group string for PubNub using the current uuid
            let channelGroup = [this.chatEngine.ceConfig.globalChannel, this.chatEngine.me.uuid, group].join('#');

            // ask pubnub for a list of channels for this group
            this.chatEngine.pubnub.channelGroups.listChannels({
                channelGroup
            }, (status, response) => {

                if (status.error) {
                    this.chatEngine.throwError(this.chatEngine, '_emit', 'sync', new Error('There was a problem restoring your session from PubNub servers.'), { status });
                } else {

                    // loop through the returned channels
                    response.channels.forEach((channel) => {

                        // call the same callback as if we were notified about them
                        this.onJoin({
                            channel,
                            private: this.chatEngine.parseChannel(channel).private,
                            group
                        });

                        /**
                        Fired when session has been restored at boot. Fired once per
                        session group.
                        @event Me#$"."session"."group"."restored
                        */
                        this.trigger('$.group.restored', { group });

                    });

                }

            });

        });

    }

    /**
     * Callback fired when another instance has joined a chat
     * @private
     */
    join(chat) {

        // don't rebroadcast chats in session we've already heard about
        if (!this.chats[chat.group] || !this.chats[chat.group][chat.channel]) {
            this.sync.emit('$.session.notify.chat.join', { subject: chat.objectify() });
        }

    }

    /**
     * Callback fired when another instance has left a chat
     * @private
     */
    leave(chat) {
        this.sync.emit('$.session.notify.chat.leave', { subject: chat.objectify() });
    }

    /**
    Stores {@link Chat} within ```ChatEngine.session``` keyed based on the ```chat.group``` property.
    @param {Object} chat JSON object representing {@link Chat}. Originally supplied via {@link Chat#objectify}.
    @private
    */
    onJoin(chat) {

        // create the chat group if it doesn't exist
        this.chats[chat.group] = this.chats[chat.group] || {};

        // check the chat exists within the global list but is not grouped
        let existingChat = this.chatEngine.chats[chat.channel];

        // if it exists
        if (existingChat) {

            // assign it to the group
            this.chats[chat.group][chat.channel] = existingChat;
        } else {

            // otherwise, try to recreate it with the server information
            this.chats[chat.group][chat.channel] = new this.chatEngine.Chat(chat.channel, chat.private, false, chat.meta, chat.group);

            /**
            Fired when another identical instance of {@link ChatEngine} and {@link Me} joins a {@link Chat} that this instance of {@link ChatEngine} is unaware of.
            Used to synchronize ChatEngine sessions between desktop and mobile, duplicate windows, etc.
            ChatEngine stores sessions on the server side identified by {@link User#uuid}.
            @event Me#$"."session"."chat"."join
            @example
            *
            * // Logged in as "Ian" in first window
            * ChatEngine.me.session.on('$.chat.join', (data) => {
            *     console.log('I joined a new chat in a second window!', data.chat);
            * });
            *
            * // Logged in as "Ian" in second window
            * new ChatEngine.Chat('another-chat');
            */
            this.trigger('$.chat.join', { chat: this.chats[chat.group][chat.channel] });

        }

    }

    /**
    Removes {@link Chat} within this.chats
    @private
    */
    onleave(chat) {

        if (this.chats[chat.group] && this.chats[chat.group][chat.channel]) {

            chat = this.chats[chat.group][chat.channel] || chat;

            /**
            * Fired when another identical instance of {@link ChatEngine} with an identical {@link Me} leaves a {@link Chat} via {@link Chat#leave}.
            * @event Me#$"."session"."chat"."leave
            */

            delete this.chatEngine.chats[chat.channel];
            delete this.chats[chat.group][chat.channel];

        }

        this.trigger('$.chat.leave', { chat });

    }

}

module.exports = Session;


/***/ })
/******/ ]);
});