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
},{"./internal/once":1,"./internal/onlyOnce":2,"lodash/_baseRest":9,"lodash/isArray":26,"lodash/noop":29}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":20}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./_Symbol":5,"./_getRawTag":15,"./_objectToString":18}],8:[function(require,module,exports){
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

},{"./_isMasked":17,"./_toSource":23,"./isFunction":27,"./isObject":28}],9:[function(require,module,exports){
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

},{"./_overRest":19,"./_setToString":21,"./identity":25}],10:[function(require,module,exports){
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

},{"./_defineProperty":12,"./constant":24,"./identity":25}],11:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":20}],12:[function(require,module,exports){
var getNative = require('./_getNative');

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;

},{"./_getNative":14}],13:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
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

},{"./_baseIsNative":8,"./_getValue":16}],15:[function(require,module,exports){
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

},{"./_Symbol":5}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./_coreJsData":11}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./_apply":6}],20:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":13}],21:[function(require,module,exports){
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

},{"./_baseSetToString":10,"./_shortOut":22}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./_baseGetTag":7,"./isObject":28}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.PubNub=t():e.PubNub=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){if(!navigator||!navigator.sendBeacon)return!1;navigator.sendBeacon(e)}Object.defineProperty(t,"__esModule",{value:!0});var u=n(1),c=r(u),l=n(40),h=r(l),f=n(41),d=r(f),p=n(42),g=(n(8),function(e){function t(e){i(this,t);var n=e.listenToBrowserNetworkEvents,r=void 0===n||n;e.db=d.default,e.sdkFamily="Web",e.networking=new h.default({get:p.get,post:p.post,sendBeacon:a});var o=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r&&(window.addEventListener("offline",function(){o.networkDownDetected()}),window.addEventListener("online",function(){o.networkUpDetected()})),o}return o(t,e),t}(c.default));t.default=g,e.exports=t.default},function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function i(e){return e&&e.__esModule?e:{default:e}}function s(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),u=i(a),c=n(7),l=i(c),h=n(9),f=i(h),d=n(11),p=i(d),g=n(12),y=i(g),v=n(18),b=i(v),_=n(19),m=r(_),k=n(20),P=r(k),S=n(21),O=r(S),w=n(22),T=r(w),C=n(23),M=r(C),E=n(24),x=r(E),N=n(25),R=r(N),K=n(26),A=r(K),j=n(27),D=r(j),G=n(28),U=r(G),B=n(29),I=r(B),H=n(30),L=r(H),q=n(31),F=r(q),z=n(32),X=r(z),W=n(33),V=r(W),J=n(34),$=r(J),Q=n(35),Y=r(Q),Z=n(36),ee=r(Z),te=n(37),ne=r(te),re=n(38),ie=r(re),se=n(15),oe=r(se),ae=n(39),ue=r(ae),ce=n(16),le=i(ce),he=n(13),fe=i(he),de=(n(8),function(){function e(t){var n=this;s(this,e);var r=t.db,i=t.networking,o=this._config=new l.default({setup:t,db:r}),a=new f.default({config:o});i.init(o);var u={config:o,networking:i,crypto:a},c=b.default.bind(this,u,oe),h=b.default.bind(this,u,U),d=b.default.bind(this,u,L),g=b.default.bind(this,u,X),v=b.default.bind(this,u,ue),_=this._listenerManager=new y.default,k=new p.default({timeEndpoint:c,leaveEndpoint:h,heartbeatEndpoint:d,setStateEndpoint:g,subscribeEndpoint:v,crypto:u.crypto,config:u.config,listenerManager:_});this.addListener=_.addListener.bind(_),this.removeListener=_.removeListener.bind(_),this.removeAllListeners=_.removeAllListeners.bind(_),this.channelGroups={listGroups:b.default.bind(this,u,T),listChannels:b.default.bind(this,u,M),addChannels:b.default.bind(this,u,m),removeChannels:b.default.bind(this,u,P),deleteGroup:b.default.bind(this,u,O)},this.push={addChannels:b.default.bind(this,u,x),removeChannels:b.default.bind(this,u,R),deleteDevice:b.default.bind(this,u,D),listChannels:b.default.bind(this,u,A)},this.hereNow=b.default.bind(this,u,V),this.whereNow=b.default.bind(this,u,I),this.getState=b.default.bind(this,u,F),this.setState=k.adaptStateChange.bind(k),this.grant=b.default.bind(this,u,Y),this.audit=b.default.bind(this,u,$),this.publish=b.default.bind(this,u,ee),this.fire=function(e,t){e.replicate=!1,e.storeInHistory=!1,n.publish(e,t)},this.history=b.default.bind(this,u,ne),this.fetchMessages=b.default.bind(this,u,ie),this.time=c,this.subscribe=k.adaptSubscribeChange.bind(k),this.unsubscribe=k.adaptUnsubscribeChange.bind(k),this.disconnect=k.disconnect.bind(k),this.reconnect=k.reconnect.bind(k),this.destroy=function(e){k.unsubscribeAll(e),k.disconnect()},this.stop=this.destroy,this.unsubscribeAll=k.unsubscribeAll.bind(k),this.getSubscribedChannels=k.getSubscribedChannels.bind(k),this.getSubscribedChannelGroups=k.getSubscribedChannelGroups.bind(k),this.encrypt=a.encrypt.bind(a),this.decrypt=a.decrypt.bind(a),this.getAuthKey=u.config.getAuthKey.bind(u.config),this.setAuthKey=u.config.setAuthKey.bind(u.config),this.setCipherKey=u.config.setCipherKey.bind(u.config),this.getUUID=u.config.getUUID.bind(u.config),this.setUUID=u.config.setUUID.bind(u.config),this.getFilterExpression=u.config.getFilterExpression.bind(u.config),this.setFilterExpression=u.config.setFilterExpression.bind(u.config)}return o(e,[{key:"getVersion",value:function(){return this._config.getVersion()}},{key:"networkDownDetected",value:function(){this._listenerManager.announceNetworkDown(),this._config.restore?this.disconnect():this.destroy(!0)}},{key:"networkUpDetected",value:function(){this._listenerManager.announceNetworkUp(),this.reconnect()}}],[{key:"generateUUID",value:function(){return u.default.v4()}}]),e}());de.OPERATIONS=le.default,de.CATEGORIES=fe.default,t.default=de,e.exports=t.default},function(e,t,n){var r=n(3),i=n(6),s=i;s.v1=r,s.v4=i,e.exports=s},function(e,t,n){function r(e,t,n){var r=t&&n||0,i=t||[];e=e||{};var o=void 0!==e.clockseq?e.clockseq:u,h=void 0!==e.msecs?e.msecs:(new Date).getTime(),f=void 0!==e.nsecs?e.nsecs:l+1,d=h-c+(f-l)/1e4;if(d<0&&void 0===e.clockseq&&(o=o+1&16383),(d<0||h>c)&&void 0===e.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");c=h,l=f,u=o,h+=122192928e5;var p=(1e4*(268435455&h)+f)%4294967296;i[r++]=p>>>24&255,i[r++]=p>>>16&255,i[r++]=p>>>8&255,i[r++]=255&p;var g=h/4294967296*1e4&268435455;i[r++]=g>>>8&255,i[r++]=255&g,i[r++]=g>>>24&15|16,i[r++]=g>>>16&255,i[r++]=o>>>8|128,i[r++]=255&o;for(var y=e.node||a,v=0;v<6;++v)i[r+v]=y[v];return t||s(i)}var i=n(4),s=n(5),o=i(),a=[1|o[0],o[1],o[2],o[3],o[4],o[5]],u=16383&(o[6]<<8|o[7]),c=0,l=0;e.exports=r},function(e,t){(function(t){var n,r=t.crypto||t.msCrypto;if(r&&r.getRandomValues){var i=new Uint8Array(16);n=function(){return r.getRandomValues(i),i}}if(!n){var s=new Array(16);n=function(){for(var e,t=0;t<16;t++)0==(3&t)&&(e=4294967296*Math.random()),s[t]=e>>>((3&t)<<3)&255;return s}}e.exports=n}).call(t,function(){return this}())},function(e,t){function n(e,t){var n=t||0,i=r;return i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+"-"+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]+i[e[n++]]}for(var r=[],i=0;i<256;++i)r[i]=(i+256).toString(16).substr(1);e.exports=n},function(e,t,n){function r(e,t,n){var r=t&&n||0;"string"==typeof e&&(t="binary"==e?new Array(16):null,e=null),e=e||{};var o=e.random||(e.rng||i)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,t)for(var a=0;a<16;++a)t[r+a]=o[a];return t||s(o)}var i=n(4),s=n(5);e.exports=r},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(2),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=(n(8),function(){function e(t){var n=t.setup,i=t.db;r(this,e),this._db=i,this.instanceId="pn-"+o.default.v4(),this.secretKey=n.secretKey||n.secret_key,this.subscribeKey=n.subscribeKey||n.subscribe_key,this.publishKey=n.publishKey||n.publish_key,this.sdkFamily=n.sdkFamily,this.partnerId=n.partnerId,this.setAuthKey(n.authKey),this.setCipherKey(n.cipherKey),this.setFilterExpression(n.filterExpression),this.origin=n.origin||"pubsub.pubnub.com",this.secure=n.ssl||!1,this.restore=n.restore||!1,this.proxy=n.proxy,this.keepAlive=n.keepAlive,this.keepAliveSettings=n.keepAliveSettings,this.customEncrypt=n.customEncrypt,this.customDecrypt=n.customDecrypt,"undefined"!=typeof location&&"https:"===location.protocol&&(this.secure=!0),this.logVerbosity=n.logVerbosity||!1,this.suppressLeaveEvents=n.suppressLeaveEvents||!1,this.announceFailedHeartbeats=n.announceFailedHeartbeats||!0,this.announceSuccessfulHeartbeats=n.announceSuccessfulHeartbeats||!1,this.useInstanceId=n.useInstanceId||!1,this.useRequestId=n.useRequestId||!1,this.requestMessageCountThreshold=n.requestMessageCountThreshold,this.setTransactionTimeout(n.transactionalRequestTimeout||15e3),this.setSubscribeTimeout(n.subscribeRequestTimeout||31e4),this.setSendBeaconConfig(n.useSendBeacon||!0),this.setPresenceTimeout(n.presenceTimeout||300),n.heartbeatInterval&&this.setHeartbeatInterval(n.heartbeatInterval),this.setUUID(this._decideUUID(n.uuid))}return i(e,[{key:"getAuthKey",value:function(){return this.authKey}},{key:"setAuthKey",value:function(e){return this.authKey=e,this}},{key:"setCipherKey",value:function(e){return this.cipherKey=e,this}},{key:"getUUID",value:function(){return this.UUID}},{key:"setUUID",value:function(e){return this._db&&this._db.set&&this._db.set(this.subscribeKey+"uuid",e),this.UUID=e,this}},{key:"getFilterExpression",value:function(){return this.filterExpression}},{key:"setFilterExpression",value:function(e){return this.filterExpression=e,this}},{key:"getPresenceTimeout",value:function(){return this._presenceTimeout}},{key:"setPresenceTimeout",value:function(e){return this._presenceTimeout=e,this.setHeartbeatInterval(this._presenceTimeout/2-1),this}},{key:"getHeartbeatInterval",value:function(){return this._heartbeatInterval}},{key:"setHeartbeatInterval",value:function(e){return this._heartbeatInterval=e,this}},{key:"getSubscribeTimeout",value:function(){return this._subscribeRequestTimeout}},{key:"setSubscribeTimeout",value:function(e){return this._subscribeRequestTimeout=e,this}},{key:"getTransactionTimeout",value:function(){return this._transactionalRequestTimeout}},{key:"setTransactionTimeout",value:function(e){return this._transactionalRequestTimeout=e,this}},{key:"isSendBeaconEnabled",value:function(){return this._useSendBeacon}},{key:"setSendBeaconConfig",value:function(e){return this._useSendBeacon=e,this}},{key:"getVersion",value:function(){return"4.10.0"}},{key:"_decideUUID",value:function(e){return e||(this._db&&this._db.get&&this._db.get(this.subscribeKey+"uuid")?this._db.get(this.subscribeKey+"uuid"):"pn-"+o.default.v4())}}]),e}());t.default=a,e.exports=t.default},function(e,t){"use strict";e.exports={}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(7),a=(r(o),n(10)),u=r(a),c=function(){function e(t){var n=t.config;i(this,e),this._config=n,this._iv="0123456789012345",this._allowedKeyEncodings=["hex","utf8","base64","binary"],this._allowedKeyLengths=[128,256],this._allowedModes=["ecb","cbc"],this._defaultOptions={encryptKey:!0,keyEncoding:"utf8",keyLength:256,mode:"cbc"}}return s(e,[{key:"HMACSHA256",value:function(e){return u.default.HmacSHA256(e,this._config.secretKey).toString(u.default.enc.Base64)}},{key:"SHA256",value:function(e){return u.default.SHA256(e).toString(u.default.enc.Hex)}},{key:"_parseOptions",value:function(e){var t=e||{};return t.hasOwnProperty("encryptKey")||(t.encryptKey=this._defaultOptions.encryptKey),t.hasOwnProperty("keyEncoding")||(t.keyEncoding=this._defaultOptions.keyEncoding),t.hasOwnProperty("keyLength")||(t.keyLength=this._defaultOptions.keyLength),t.hasOwnProperty("mode")||(t.mode=this._defaultOptions.mode),-1===this._allowedKeyEncodings.indexOf(t.keyEncoding.toLowerCase())&&(t.keyEncoding=this._defaultOptions.keyEncoding),-1===this._allowedKeyLengths.indexOf(parseInt(t.keyLength,10))&&(t.keyLength=this._defaultOptions.keyLength),-1===this._allowedModes.indexOf(t.mode.toLowerCase())&&(t.mode=this._defaultOptions.mode),t}},{key:"_decodeKey",value:function(e,t){return"base64"===t.keyEncoding?u.default.enc.Base64.parse(e):"hex"===t.keyEncoding?u.default.enc.Hex.parse(e):e}},{key:"_getPaddedKey",value:function(e,t){return e=this._decodeKey(e,t),t.encryptKey?u.default.enc.Utf8.parse(this.SHA256(e).slice(0,32)):e}},{key:"_getMode",value:function(e){return"ecb"===e.mode?u.default.mode.ECB:u.default.mode.CBC}},{key:"_getIV",value:function(e){return"cbc"===e.mode?u.default.enc.Utf8.parse(this._iv):null}},{key:"encrypt",value:function(e,t,n){return this._config.customEncrypt?this._config.customEncrypt(e):this.pnEncrypt(e,t,n)}},{key:"decrypt",value:function(e,t,n){return this._config.customDecrypt?this._config.customDecrypt(e):this.pnDecrypt(e,t,n)}},{key:"pnEncrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);return u.default.AES.encrypt(e,s,{iv:r,mode:i}).ciphertext.toString(u.default.enc.Base64)||e}},{key:"pnDecrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getIV(n),i=this._getMode(n),s=this._getPaddedKey(t||this._config.cipherKey,n);try{var o=u.default.enc.Base64.parse(e),a=u.default.AES.decrypt({ciphertext:o},s,{iv:r,mode:i}).toString(u.default.enc.Utf8);return JSON.parse(a)}catch(e){return null}}}]),e}();t.default=c,e.exports=t.default},function(e,t){"use strict";var n=n||function(e,t){var n={},r=n.lib={},i=function(){},s=r.Base={extend:function(e){i.prototype=this;var t=new i;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}},o=r.WordArray=s.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=void 0!=t?t:4*e.length},toString:function(e){return(e||u).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes;if(e=e.sigBytes,this.clamp(),r%4)for(var i=0;i<e;i++)t[r+i>>>2]|=(n[i>>>2]>>>24-i%4*8&255)<<24-(r+i)%4*8;else if(65535<n.length)for(i=0;i<e;i+=4)t[r+i>>>2]=n[i>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4)},clone:function(){var e=s.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],r=0;r<t;r+=4)n.push(4294967296*e.random()|0);return new o.init(n,t)}}),a=n.enc={},u=a.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++){var i=t[r>>>2]>>>24-r%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new o.init(n,t/2)}},c=a.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++)n.push(String.fromCharCode(t[r>>>2]>>>24-r%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(255&e.charCodeAt(r))<<24-r%4*8;return new o.init(n,t)}},l=a.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},h=r.BufferedBlockAlgorithm=s.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=l.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(t){var n=this._data,r=n.words,i=n.sigBytes,s=this.blockSize,a=i/(4*s),a=t?e.ceil(a):e.max((0|a)-this._minBufferSize,0);if(t=a*s,i=e.min(4*t,i),t){for(var u=0;u<t;u+=s)this._doProcessBlock(r,u);u=r.splice(0,t),n.sigBytes-=i}return new o.init(u,i)},clone:function(){var e=s.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});r.Hasher=h.extend({cfg:s.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new f.HMAC.init(e,n).finalize(t)}}});var f=n.algo={};return n}(Math);!function(e){for(var t=n,r=t.lib,i=r.WordArray,s=r.Hasher,r=t.algo,o=[],a=[],u=function(e){return 4294967296*(e-(0|e))|0},c=2,l=0;64>l;){var h;e:{h=c;for(var f=e.sqrt(h),d=2;d<=f;d++)if(!(h%d)){h=!1;break e}h=!0}h&&(8>l&&(o[l]=u(e.pow(c,.5))),a[l]=u(e.pow(c,1/3)),l++),c++}var p=[],r=r.SHA256=s.extend({_doReset:function(){this._hash=new i.init(o.slice(0))},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],s=n[2],o=n[3],u=n[4],c=n[5],l=n[6],h=n[7],f=0;64>f;f++){if(16>f)p[f]=0|e[t+f];else{var d=p[f-15],g=p[f-2];p[f]=((d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3)+p[f-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+p[f-16]}d=h+((u<<26|u>>>6)^(u<<21|u>>>11)^(u<<7|u>>>25))+(u&c^~u&l)+a[f]+p[f],g=((r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22))+(r&i^r&s^i&s),h=l,l=c,c=u,u=o+d|0,o=s,s=i,i=r,r=d+g|0}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+s|0,n[3]=n[3]+o|0,n[4]=n[4]+u|0,n[5]=n[5]+c|0,n[6]=n[6]+l|0,n[7]=n[7]+h|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return n[i>>>5]|=128<<24-i%32,n[14+(i+64>>>9<<4)]=e.floor(r/4294967296),n[15+(i+64>>>9<<4)]=r,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var e=s.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=s._createHelper(r),t.HmacSHA256=s._createHmacHelper(r)}(Math),function(){var e=n,t=e.enc.Utf8;e.algo.HMAC=e.lib.Base.extend({init:function(e,n){e=this._hasher=new e.init,"string"==typeof n&&(n=t.parse(n));var r=e.blockSize,i=4*r;n.sigBytes>i&&(n=e.finalize(n)),n.clamp();for(var s=this._oKey=n.clone(),o=this._iKey=n.clone(),a=s.words,u=o.words,c=0;c<r;c++)a[c]^=1549556828,u[c]^=909522486;s.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher;return e=t.finalize(e),t.reset(),t.finalize(this._oKey.clone().concat(e))}})}(),function(){var e=n,t=e.lib.WordArray;e.enc.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp(),e=[];for(var i=0;i<n;i+=3)for(var s=(t[i>>>2]>>>24-i%4*8&255)<<16|(t[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|t[i+2>>>2]>>>24-(i+2)%4*8&255,o=0;4>o&&i+.75*o<n;o++)e.push(r.charAt(s>>>6*(3-o)&63));if(t=r.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var n=e.length,r=this._map,i=r.charAt(64);i&&-1!=(i=e.indexOf(i))&&(n=i);for(var i=[],s=0,o=0;o<n;o++)if(o%4){var a=r.indexOf(e.charAt(o-1))<<o%4*2,u=r.indexOf(e.charAt(o))>>>6-o%4*2;i[s>>>2]|=(a|u)<<24-s%4*8,s++}return t.create(i,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(e){function t(e,t,n,r,i,s,o){return((e=e+(t&n|~t&r)+i+o)<<s|e>>>32-s)+t}function r(e,t,n,r,i,s,o){return((e=e+(t&r|n&~r)+i+o)<<s|e>>>32-s)+t}function i(e,t,n,r,i,s,o){return((e=e+(t^n^r)+i+o)<<s|e>>>32-s)+t}function s(e,t,n,r,i,s,o){return((e=e+(n^(t|~r))+i+o)<<s|e>>>32-s)+t}for(var o=n,a=o.lib,u=a.WordArray,c=a.Hasher,a=o.algo,l=[],h=0;64>h;h++)l[h]=4294967296*e.abs(e.sin(h+1))|0;a=a.MD5=c.extend({_doReset:function(){this._hash=new u.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(e,n){for(var o=0;16>o;o++){var a=n+o,u=e[a];e[a]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8)}var o=this._hash.words,a=e[n+0],u=e[n+1],c=e[n+2],h=e[n+3],f=e[n+4],d=e[n+5],p=e[n+6],g=e[n+7],y=e[n+8],v=e[n+9],b=e[n+10],_=e[n+11],m=e[n+12],k=e[n+13],P=e[n+14],S=e[n+15],O=o[0],w=o[1],T=o[2],C=o[3],O=t(O,w,T,C,a,7,l[0]),C=t(C,O,w,T,u,12,l[1]),T=t(T,C,O,w,c,17,l[2]),w=t(w,T,C,O,h,22,l[3]),O=t(O,w,T,C,f,7,l[4]),C=t(C,O,w,T,d,12,l[5]),T=t(T,C,O,w,p,17,l[6]),w=t(w,T,C,O,g,22,l[7]),O=t(O,w,T,C,y,7,l[8]),C=t(C,O,w,T,v,12,l[9]),T=t(T,C,O,w,b,17,l[10]),w=t(w,T,C,O,_,22,l[11]),O=t(O,w,T,C,m,7,l[12]),C=t(C,O,w,T,k,12,l[13]),T=t(T,C,O,w,P,17,l[14]),w=t(w,T,C,O,S,22,l[15]),O=r(O,w,T,C,u,5,l[16]),C=r(C,O,w,T,p,9,l[17]),T=r(T,C,O,w,_,14,l[18]),w=r(w,T,C,O,a,20,l[19]),O=r(O,w,T,C,d,5,l[20]),C=r(C,O,w,T,b,9,l[21]),T=r(T,C,O,w,S,14,l[22]),w=r(w,T,C,O,f,20,l[23]),O=r(O,w,T,C,v,5,l[24]),C=r(C,O,w,T,P,9,l[25]),T=r(T,C,O,w,h,14,l[26]),w=r(w,T,C,O,y,20,l[27]),O=r(O,w,T,C,k,5,l[28]),C=r(C,O,w,T,c,9,l[29]),T=r(T,C,O,w,g,14,l[30]),w=r(w,T,C,O,m,20,l[31]),O=i(O,w,T,C,d,4,l[32]),C=i(C,O,w,T,y,11,l[33]),T=i(T,C,O,w,_,16,l[34]),w=i(w,T,C,O,P,23,l[35]),O=i(O,w,T,C,u,4,l[36]),C=i(C,O,w,T,f,11,l[37]),T=i(T,C,O,w,g,16,l[38]),w=i(w,T,C,O,b,23,l[39]),O=i(O,w,T,C,k,4,l[40]),C=i(C,O,w,T,a,11,l[41]),T=i(T,C,O,w,h,16,l[42]),w=i(w,T,C,O,p,23,l[43]),O=i(O,w,T,C,v,4,l[44]),C=i(C,O,w,T,m,11,l[45]),T=i(T,C,O,w,S,16,l[46]),w=i(w,T,C,O,c,23,l[47]),O=s(O,w,T,C,a,6,l[48]),C=s(C,O,w,T,g,10,l[49]),T=s(T,C,O,w,P,15,l[50]),w=s(w,T,C,O,d,21,l[51]),O=s(O,w,T,C,m,6,l[52]),C=s(C,O,w,T,h,10,l[53]),T=s(T,C,O,w,b,15,l[54]),w=s(w,T,C,O,u,21,l[55]),O=s(O,w,T,C,y,6,l[56]),C=s(C,O,w,T,S,10,l[57]),T=s(T,C,O,w,p,15,l[58]),w=s(w,T,C,O,k,21,l[59]),O=s(O,w,T,C,f,6,l[60]),C=s(C,O,w,T,_,10,l[61]),T=s(T,C,O,w,c,15,l[62]),w=s(w,T,C,O,v,21,l[63]);o[0]=o[0]+O|0,o[1]=o[1]+w|0,o[2]=o[2]+T|0,o[3]=o[3]+C|0},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;n[i>>>5]|=128<<24-i%32;var s=e.floor(r/4294967296);for(n[15+(i+64>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),n[14+(i+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(n.length+1),this._process(),t=this._hash,n=t.words,r=0;4>r;r++)i=n[r],n[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8);return t},clone:function(){var e=c.clone.call(this);return e._hash=this._hash.clone(),e}}),o.MD5=c._createHelper(a),o.HmacMD5=c._createHmacHelper(a)}(Math),function(){var e=n,t=e.lib,r=t.Base,i=t.WordArray,t=e.algo,s=t.EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e)},compute:function(e,t){for(var n=this.cfg,r=n.hasher.create(),s=i.create(),o=s.words,a=n.keySize,n=n.iterations;o.length<a;){u&&r.update(u);var u=r.update(e).finalize(t);r.reset();for(var c=1;c<n;c++)u=r.finalize(u),r.reset();s.concat(u)}return s.sigBytes=4*a,s}});e.EvpKDF=function(e,t,n){return s.create(n).compute(e,t)}}(),n.lib.Cipher||function(e){var t=n,r=t.lib,i=r.Base,s=r.WordArray,o=r.BufferedBlockAlgorithm,a=t.enc.Base64,u=t.algo.EvpKDF,c=r.Cipher=o.extend({cfg:i.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset()},reset:function(){o.reset.call(this),this._doReset()},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(t,n,r){return("string"==typeof n?g:p).encrypt(e,t,n,r)},decrypt:function(t,n,r){return("string"==typeof n?g:p).decrypt(e,t,n,r)}}}});r.StreamCipher=c.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l=t.mode={},h=function(e,t,n){var r=this._iv;r?this._iv=void 0:r=this._prevBlock;for(var i=0;i<n;i++)e[t+i]^=r[i]},f=(r.BlockCipherMode=i.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t}})).extend();f.Encryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize;h.call(this,e,t,r),n.encryptBlock(e,t),this._prevBlock=e.slice(t,t+r)}}),f.Decryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=e.slice(t,t+r);n.decryptBlock(e,t),h.call(this,e,t,r),this._prevBlock=i}}),l=l.CBC=f,f=(t.pad={}).Pkcs7={pad:function(e,t){for(var n=4*t,n=n-e.sigBytes%n,r=n<<24|n<<16|n<<8|n,i=[],o=0;o<n;o+=4)i.push(r);n=s.create(i,n),e.concat(n)},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2]}},r.BlockCipher=c.extend({cfg:c.cfg.extend({mode:l,padding:f}),reset:function(){c.reset.call(this);var e=this.cfg,t=e.iv,e=e.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=e.createEncryptor;else n=e.createDecryptor,this._minBufferSize=1;this._mode=n.call(e,this,t&&t.words)},_doProcessBlock:function(e,t){this._mode.processBlock(e,t)},_doFinalize:function(){var e=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){e.pad(this._data,this.blockSize);var t=this._process(!0)}else t=this._process(!0),e.unpad(t);return t},blockSize:4});var d=r.CipherParams=i.extend({init:function(e){this.mixIn(e)},toString:function(e){return(e||this.formatter).stringify(this)}}),l=(t.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return e=e.salt,(e?s.create([1398893684,1701076831]).concat(e).concat(t):t).toString(a)},parse:function(e){e=a.parse(e);var t=e.words;if(1398893684==t[0]&&1701076831==t[1]){var n=s.create(t.slice(2,4));t.splice(0,4),e.sigBytes-=16}return d.create({ciphertext:e,salt:n})}},p=r.SerializableCipher=i.extend({cfg:i.extend({format:l}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r);return t=i.finalize(t),i=i.cfg,d.create({ciphertext:t,key:n,iv:i.iv,algorithm:e,mode:i.mode,padding:i.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return"string"==typeof e?t.parse(e,this):e}}),t=(t.kdf={}).OpenSSL={execute:function(e,t,n,r){return r||(r=s.random(8)),e=u.create({keySize:t+n}).compute(e,r),n=s.create(e.words.slice(t),4*n),e.sigBytes=4*t,d.create({key:e,iv:n,salt:r})}},g=r.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:t}),encrypt:function(e,t,n,r){return r=this.cfg.extend(r),n=r.kdf.execute(n,e.keySize,e.ivSize),r.iv=n.iv,e=p.encrypt.call(this,e,t,n.key,r),e.mixIn(n),e},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),n=r.kdf.execute(n,e.keySize,e.ivSize,t.salt),r.iv=n.iv,p.decrypt.call(this,e,t,n.key,r)}})}(),function(){for(var e=n,t=e.lib.BlockCipher,r=e.algo,i=[],s=[],o=[],a=[],u=[],c=[],l=[],h=[],f=[],d=[],p=[],g=0;256>g;g++)p[g]=128>g?g<<1:g<<1^283;for(var y=0,v=0,g=0;256>g;g++){var b=v^v<<1^v<<2^v<<3^v<<4,b=b>>>8^255&b^99;i[y]=b,s[b]=y;var _=p[y],m=p[_],k=p[m],P=257*p[b]^16843008*b;o[y]=P<<24|P>>>8,a[y]=P<<16|P>>>16,u[y]=P<<8|P>>>24,c[y]=P,P=16843009*k^65537*m^257*_^16843008*y,l[b]=P<<24|P>>>8,h[b]=P<<16|P>>>16,f[b]=P<<8|P>>>24,d[b]=P,y?(y=_^p[p[p[k^_]]],v^=p[p[v]]):y=v=1}var S=[0,1,2,4,8,16,32,64,128,27,54],r=r.AES=t.extend({_doReset:function(){for(var e=this._key,t=e.words,n=e.sigBytes/4,e=4*((this._nRounds=n+6)+1),r=this._keySchedule=[],s=0;s<e;s++)if(s<n)r[s]=t[s];else{var o=r[s-1];s%n?6<n&&4==s%n&&(o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o]):(o=o<<8|o>>>24,o=i[o>>>24]<<24|i[o>>>16&255]<<16|i[o>>>8&255]<<8|i[255&o],o^=S[s/n|0]<<24),r[s]=r[s-n]^o}for(t=this._invKeySchedule=[],n=0;n<e;n++)s=e-n,o=n%4?r[s]:r[s-4],t[n]=4>n||4>=s?o:l[i[o>>>24]]^h[i[o>>>16&255]]^f[i[o>>>8&255]]^d[i[255&o]]},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,o,a,u,c,i)},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,l,h,f,d,s),n=e[t+1],e[t+1]=e[t+3],e[t+3]=n},_doCryptBlock:function(e,t,n,r,i,s,o,a){for(var u=this._nRounds,c=e[t]^n[0],l=e[t+1]^n[1],h=e[t+2]^n[2],f=e[t+3]^n[3],d=4,p=1;p<u;p++)var g=r[c>>>24]^i[l>>>16&255]^s[h>>>8&255]^o[255&f]^n[d++],y=r[l>>>24]^i[h>>>16&255]^s[f>>>8&255]^o[255&c]^n[d++],v=r[h>>>24]^i[f>>>16&255]^s[c>>>8&255]^o[255&l]^n[d++],f=r[f>>>24]^i[c>>>16&255]^s[l>>>8&255]^o[255&h]^n[d++],c=g,l=y,h=v;g=(a[c>>>24]<<24|a[l>>>16&255]<<16|a[h>>>8&255]<<8|a[255&f])^n[d++],y=(a[l>>>24]<<24|a[h>>>16&255]<<16|a[f>>>8&255]<<8|a[255&c])^n[d++],v=(a[h>>>24]<<24|a[f>>>16&255]<<16|a[c>>>8&255]<<8|a[255&l])^n[d++],f=(a[f>>>24]<<24|a[c>>>16&255]<<16|a[l>>>8&255]<<8|a[255&h])^n[d++],e[t]=g,e[t+1]=y,e[t+2]=v,e[t+3]=f},keySize:8});e.AES=t._createHelper(r)}(),n.mode.ECB=function(){var e=n.lib.BlockCipherMode.extend();return e.Encryptor=e.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t)}}),e.Decryptor=e.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t)}}),e}(),e.exports=n},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(9),a=(r(o),n(7)),u=(r(a),n(12)),c=(r(u),n(14)),l=r(c),h=n(17),f=r(h),d=(n(8),n(13)),p=r(d),g=function(){function e(t){var n=t.subscribeEndpoint,r=t.leaveEndpoint,s=t.heartbeatEndpoint,o=t.setStateEndpoint,a=t.timeEndpoint,u=t.config,c=t.crypto,h=t.listenerManager;i(this,e),this._listenerManager=h,this._config=u,this._leaveEndpoint=r,this._heartbeatEndpoint=s,this._setStateEndpoint=o,this._subscribeEndpoint=n,this._crypto=c,this._channels={},this._presenceChannels={},this._channelGroups={},this._presenceChannelGroups={},this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[],this._currentTimetoken=0,this._lastTimetoken=0,this._storedTimetoken=null,this._subscriptionStatusAnnounced=!1,this._reconnectionManager=new l.default({timeEndpoint:a})}return s(e,[{key:"adaptStateChange",value:function(e,t){var n=this,r=e.state,i=e.channels,s=void 0===i?[]:i,o=e.channelGroups,a=void 0===o?[]:o;return s.forEach(function(e){e in n._channels&&(n._channels[e].state=r)}),a.forEach(function(e){e in n._channelGroups&&(n._channelGroups[e].state=r)}),this._setStateEndpoint({state:r,channels:s,channelGroups:a},t)}},{key:"adaptSubscribeChange",value:function(e){var t=this,n=e.timetoken,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s,a=e.withPresence,u=void 0!==a&&a;if(!this._config.subscribeKey||""===this._config.subscribeKey)return void(console&&console.log&&console.log("subscribe key missing; aborting subscribe"));n&&(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=n),"0"!==this._currentTimetoken&&(this._storedTimetoken=this._currentTimetoken,this._currentTimetoken=0),i.forEach(function(e){t._channels[e]={state:{}},u&&(t._presenceChannels[e]={}),t._pendingChannelSubscriptions.push(e)}),o.forEach(function(e){t._channelGroups[e]={state:{}},u&&(t._presenceChannelGroups[e]={}),t._pendingChannelGroupSubscriptions.push(e)}),this._subscriptionStatusAnnounced=!1,this.reconnect()}},{key:"adaptUnsubscribeChange",value:function(e,t){
var n=this,r=e.channels,i=void 0===r?[]:r,s=e.channelGroups,o=void 0===s?[]:s;i.forEach(function(e){e in n._channels&&delete n._channels[e],e in n._presenceChannels&&delete n._presenceChannels[e]}),o.forEach(function(e){e in n._channelGroups&&delete n._channelGroups[e],e in n._presenceChannelGroups&&delete n._channelGroups[e]}),!1!==this._config.suppressLeaveEvents||t||this._leaveEndpoint({channels:i,channelGroups:o},function(e){e.affectedChannels=i,e.affectedChannelGroups=o,e.currentTimetoken=n._currentTimetoken,e.lastTimetoken=n._lastTimetoken,n._listenerManager.announceStatus(e)}),0===Object.keys(this._channels).length&&0===Object.keys(this._presenceChannels).length&&0===Object.keys(this._channelGroups).length&&0===Object.keys(this._presenceChannelGroups).length&&(this._lastTimetoken=0,this._currentTimetoken=0,this._storedTimetoken=null,this._region=null,this._reconnectionManager.stopPolling()),this.reconnect()}},{key:"unsubscribeAll",value:function(e){this.adaptUnsubscribeChange({channels:this.getSubscribedChannels(),channelGroups:this.getSubscribedChannelGroups()},e)}},{key:"getSubscribedChannels",value:function(){return Object.keys(this._channels)}},{key:"getSubscribedChannelGroups",value:function(){return Object.keys(this._channelGroups)}},{key:"reconnect",value:function(){this._startSubscribeLoop(),this._registerHeartbeatTimer()}},{key:"disconnect",value:function(){this._stopSubscribeLoop(),this._stopHeartbeatTimer(),this._reconnectionManager.stopPolling()}},{key:"_registerHeartbeatTimer",value:function(){this._stopHeartbeatTimer(),this._performHeartbeatLoop(),this._heartbeatTimer=setInterval(this._performHeartbeatLoop.bind(this),1e3*this._config.getHeartbeatInterval())}},{key:"_stopHeartbeatTimer",value:function(){this._heartbeatTimer&&(clearInterval(this._heartbeatTimer),this._heartbeatTimer=null)}},{key:"_performHeartbeatLoop",value:function(){var e=this,t=Object.keys(this._channels),n=Object.keys(this._channelGroups),r={};if(0!==t.length||0!==n.length){t.forEach(function(t){var n=e._channels[t].state;Object.keys(n).length&&(r[t]=n)}),n.forEach(function(t){var n=e._channelGroups[t].state;Object.keys(n).length&&(r[t]=n)});var i=function(t){t.error&&e._config.announceFailedHeartbeats&&e._listenerManager.announceStatus(t),!t.error&&e._config.announceSuccessfulHeartbeats&&e._listenerManager.announceStatus(t)};this._heartbeatEndpoint({channels:t,channelGroups:n,state:r},i.bind(this))}}},{key:"_startSubscribeLoop",value:function(){this._stopSubscribeLoop();var e=[],t=[];if(Object.keys(this._channels).forEach(function(t){return e.push(t)}),Object.keys(this._presenceChannels).forEach(function(t){return e.push(t+"-pnpres")}),Object.keys(this._channelGroups).forEach(function(e){return t.push(e)}),Object.keys(this._presenceChannelGroups).forEach(function(e){return t.push(e+"-pnpres")}),0!==e.length||0!==t.length){var n={channels:e,channelGroups:t,timetoken:this._currentTimetoken,filterExpression:this._config.filterExpression,region:this._region};this._subscribeCall=this._subscribeEndpoint(n,this._processSubscribeResponse.bind(this))}}},{key:"_processSubscribeResponse",value:function(e,t){var n=this;if(e.error)return void(e.category===p.default.PNTimeoutCategory?this._startSubscribeLoop():e.category===p.default.PNNetworkIssuesCategory?(this.disconnect(),this._reconnectionManager.onReconnection(function(){n.reconnect(),n._subscriptionStatusAnnounced=!0;var t={category:p.default.PNReconnectedCategory,operation:e.operation,lastTimetoken:n._lastTimetoken,currentTimetoken:n._currentTimetoken};n._listenerManager.announceStatus(t)}),this._reconnectionManager.startPolling(),this._listenerManager.announceStatus(e)):e.category===p.default.PNBadRequestCategory?(this._stopHeartbeatTimer(),this._listenerManager.announceStatus(e)):this._listenerManager.announceStatus(e));if(this._storedTimetoken?(this._currentTimetoken=this._storedTimetoken,this._storedTimetoken=null):(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=t.metadata.timetoken),!this._subscriptionStatusAnnounced){var r={};r.category=p.default.PNConnectedCategory,r.operation=e.operation,r.affectedChannels=this._pendingChannelSubscriptions,r.subscribedChannels=this.getSubscribedChannels(),r.affectedChannelGroups=this._pendingChannelGroupSubscriptions,r.lastTimetoken=this._lastTimetoken,r.currentTimetoken=this._currentTimetoken,this._subscriptionStatusAnnounced=!0,this._listenerManager.announceStatus(r),this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[]}var i=t.messages||[],s=this._config.requestMessageCountThreshold;if(s&&i.length>=s){var o={};o.category=p.default.PNRequestMessageCountExceededCategory,o.operation=e.operation,this._listenerManager.announceStatus(o)}i.forEach(function(e){var t=e.channel,r=e.subscriptionMatch,i=e.publishMetaData;if(t===r&&(r=null),f.default.endsWith(e.channel,"-pnpres")){var s={};s.channel=null,s.subscription=null,s.actualChannel=null!=r?t:null,s.subscribedChannel=null!=r?r:t,t&&(s.channel=t.substring(0,t.lastIndexOf("-pnpres"))),r&&(s.subscription=r.substring(0,r.lastIndexOf("-pnpres"))),s.action=e.payload.action,s.state=e.payload.data,s.timetoken=i.publishTimetoken,s.occupancy=e.payload.occupancy,s.uuid=e.payload.uuid,s.timestamp=e.payload.timestamp,e.payload.join&&(s.join=e.payload.join),e.payload.leave&&(s.leave=e.payload.leave),e.payload.timeout&&(s.timeout=e.payload.timeout),n._listenerManager.announcePresence(s)}else{var o={};o.channel=null,o.subscription=null,o.actualChannel=null!=r?t:null,o.subscribedChannel=null!=r?r:t,o.channel=t,o.subscription=r,o.timetoken=i.publishTimetoken,o.publisher=e.issuingClientId,e.userMetadata&&(o.userMetadata=e.userMetadata),n._config.cipherKey?o.message=n._crypto.decrypt(e.payload):o.message=e.payload,n._listenerManager.announceMessage(o)}}),this._region=t.metadata.region,this._startSubscribeLoop()}},{key:"_stopSubscribeLoop",value:function(){this._subscribeCall&&(this._subscribeCall.abort(),this._subscribeCall=null)}}]),e}();t.default=g,e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=(n(8),n(13)),o=function(e){return e&&e.__esModule?e:{default:e}}(s),a=function(){function e(){r(this,e),this._listeners=[]}return i(e,[{key:"addListener",value:function(e){this._listeners.push(e)}},{key:"removeListener",value:function(e){var t=[];this._listeners.forEach(function(n){n!==e&&t.push(n)}),this._listeners=t}},{key:"removeAllListeners",value:function(){this._listeners=[]}},{key:"announcePresence",value:function(e){this._listeners.forEach(function(t){t.presence&&t.presence(e)})}},{key:"announceStatus",value:function(e){this._listeners.forEach(function(t){t.status&&t.status(e)})}},{key:"announceMessage",value:function(e){this._listeners.forEach(function(t){t.message&&t.message(e)})}},{key:"announceNetworkUp",value:function(){var e={};e.category=o.default.PNNetworkUpCategory,this.announceStatus(e)}},{key:"announceNetworkDown",value:function(){var e={};e.category=o.default.PNNetworkDownCategory,this.announceStatus(e)}}]),e}();t.default=a,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNNetworkUpCategory:"PNNetworkUpCategory",PNNetworkDownCategory:"PNNetworkDownCategory",PNNetworkIssuesCategory:"PNNetworkIssuesCategory",PNTimeoutCategory:"PNTimeoutCategory",PNBadRequestCategory:"PNBadRequestCategory",PNAccessDeniedCategory:"PNAccessDeniedCategory",PNUnknownCategory:"PNUnknownCategory",PNReconnectedCategory:"PNReconnectedCategory",PNConnectedCategory:"PNConnectedCategory",PNRequestMessageCountExceededCategory:"PNRequestMessageCountExceededCategory"},e.exports=t.default},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(15),o=(function(e){e&&e.__esModule}(s),n(8),function(){function e(t){var n=t.timeEndpoint;r(this,e),this._timeEndpoint=n}return i(e,[{key:"onReconnection",value:function(e){this._reconnectionCallback=e}},{key:"startPolling",value:function(){this._timeTimer=setInterval(this._performTimeLoop.bind(this),3e3)}},{key:"stopPolling",value:function(){clearInterval(this._timeTimer)}},{key:"_performTimeLoop",value:function(){var e=this;this._timeEndpoint(function(t){t.error||(clearInterval(e._timeTimer),e._reconnectionCallback())})}}]),e}());t.default=o,e.exports=t.default},function(e,t,n){"use strict";function r(){return h.default.PNTimeOperation}function i(){return"/time/0"}function s(e){return e.config.getTransactionTimeout()}function o(){return{}}function a(){return!1}function u(e,t){return{timetoken:t[0]}}function c(){}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.getURL=i,t.getRequestTimeout=s,t.prepareParams=o,t.isAuthSupported=a,t.handleResponse=u,t.validateParams=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={PNTimeOperation:"PNTimeOperation",PNHistoryOperation:"PNHistoryOperation",PNFetchMessagesOperation:"PNFetchMessagesOperation",PNSubscribeOperation:"PNSubscribeOperation",PNUnsubscribeOperation:"PNUnsubscribeOperation",PNPublishOperation:"PNPublishOperation",PNPushNotificationEnabledChannelsOperation:"PNPushNotificationEnabledChannelsOperation",PNRemoveAllPushNotificationsOperation:"PNRemoveAllPushNotificationsOperation",PNWhereNowOperation:"PNWhereNowOperation",PNSetStateOperation:"PNSetStateOperation",PNHereNowOperation:"PNHereNowOperation",PNGetStateOperation:"PNGetStateOperation",PNHeartbeatOperation:"PNHeartbeatOperation",PNChannelGroupsOperation:"PNChannelGroupsOperation",PNRemoveGroupOperation:"PNRemoveGroupOperation",PNChannelsForGroupOperation:"PNChannelsForGroupOperation",PNAddChannelsToGroupOperation:"PNAddChannelsToGroupOperation",PNRemoveChannelsFromGroupOperation:"PNRemoveChannelsFromGroupOperation",PNAccessManagerGrant:"PNAccessManagerGrant",PNAccessManagerAudit:"PNAccessManagerAudit"},e.exports=t.default},function(e,t){"use strict";function n(e){var t=[];return Object.keys(e).forEach(function(e){return t.push(e)}),t}function r(e){return encodeURIComponent(e).replace(/[!~*'()]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function i(e){return n(e).sort()}function s(e){return i(e).map(function(t){return t+"="+r(e[t])}).join("&")}function o(e,t){return-1!==e.indexOf(t,this.length-t.length)}function a(){var e=void 0,t=void 0;return{promise:new Promise(function(n,r){e=n,t=r}),reject:t,fulfill:e}}e.exports={signPamFromParams:s,endsWith:o,createPromise:a,encodeString:r}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return e.type=t,e.error=!0,e}function u(e){return a({message:e},"validationError")}function c(e,t,n){return e.usePost&&e.usePost(t,n)?e.postURL(t,n):e.getURL(t,n)}function l(e){var t="PubNub-JS-"+e.sdkFamily;return e.partnerId&&(t+="-"+e.partnerId),t+="/"+e.getVersion()}function h(e,t,n){var r=e.config,i=e.crypto;n.timestamp=Math.floor((new Date).getTime()/1e3);var s=r.subscribeKey+"\n"+r.publishKey+"\n"+t+"\n";s+=g.default.signPamFromParams(n);var o=i.HMACSHA256(s);o=o.replace(/\+/g,"-"),o=o.replace(/\//g,"_"),n.signature=o}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=e.networking,r=e.config,i=null,s=null,o={};t.getOperation()===b.default.PNTimeOperation||t.getOperation()===b.default.PNChannelGroupsOperation?i=arguments.length<=2?void 0:arguments[2]:(o=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]),"undefined"==typeof Promise||i||(s=g.default.createPromise());var a=t.validateParams(e,o);if(!a){var f=t.prepareParams(e,o),p=c(t,e,o),y=void 0,v={url:p,operation:t.getOperation(),timeout:t.getRequestTimeout(e)};f.uuid=r.UUID,f.pnsdk=l(r),r.useInstanceId&&(f.instanceid=r.instanceId),r.useRequestId&&(f.requestid=d.default.v4()),t.isAuthSupported()&&r.getAuthKey()&&(f.auth=r.getAuthKey()),r.secretKey&&h(e,p,f);var m=function(n,r){if(n.error)return void(i?i(n):s&&s.reject(new _("PubNub call failed, check status for details",n)));var a=t.handleResponse(e,r,o);i?i(n,a):s&&s.fulfill(a)};if(t.usePost&&t.usePost(e,o)){var k=t.postPayload(e,o);y=n.POST(f,k,v,m)}else y=n.GET(f,v,m);return t.getOperation()===b.default.PNSubscribeOperation?y:s?s.promise:void 0}return i?i(u(a)):s?(s.reject(new _("Validation failed, check status for details",u(a))),s.promise):void 0};var f=n(2),d=r(f),p=(n(8),n(17)),g=r(p),y=n(7),v=(r(y),n(16)),b=r(v),_=function(e){function t(e,n){i(this,t);var r=s(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.name=r.constructor.name,r.status=n,r.message=e,r}return o(t,e),t}(Error);e.exports=t.default},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNAddChannelsToGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{add:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveChannelsFromGroupOperation}function s(e,t){var n=t.channels,r=t.channelGroup,i=e.config;return r?n&&0!==n.length?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channels;return{remove:(void 0===n?[]:n).join(",")}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNRemoveGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)+"/remove"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(){return{}}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNChannelGroupsOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{groups:t.payload.groups}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNChannelsForGroupOperation}function s(e,t){var n=t.channelGroup,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channel Group"}function o(e,t){var n=t.channelGroup;return"/v1/channel-registration/sub-key/"+e.config.subscribeKey+"/channel-group/"+p.default.encodeString(n)}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(){return{}}function l(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,add:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=t.channels,s=e.config;return n?r?i&&0!==i.length?s.subscribeKey?void 0:"Missing Subscribe Key":"Missing Channels":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){var n=t.pushGateway,r=t.channels;return{type:n,remove:(void 0===r?[]:r).join(",")}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNPushNotificationEnabledChannelsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(e,t){return{channels:t}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNRemoveAllPushNotificationsOperation}function i(e,t){var n=t.device,r=t.pushGateway,i=e.config;return n?r?i.subscribeKey?void 0:"Missing Subscribe Key":"Missing GW Type (pushGateway: gcm or apns)":"Missing Device ID (device)"}function s(e,t){var n=t.device;return"/v1/push/sub-key/"+e.config.subscribeKey+"/devices/"+n+"/remove"}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(e,t){return{type:t.pushGateway}}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNUnsubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/leave"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNWhereNowOperation}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r;return"/v2/presence/sub-key/"+n.subscribeKey+"/uuid/"+i}function o(e){return e.config.getTransactionTimeout()}function a(){return!0}function u(){return{}}function c(e,t){return{channels:t.payload.channels}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHeartbeatOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/heartbeat"}function a(){return!0}function u(e){return e.config.getTransactionTimeout()}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.state,s=void 0===i?{}:i,o=e.config,a={};return r.length>0&&(a["channel-group"]=r.join(",")),a.state=JSON.stringify(s),a.heartbeat=o.getPresenceTimeout(),a}function l(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.isAuthSupported=a,t.getRequestTimeout=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNGetStateOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r,s=t.channels,o=void 0===s?[]:s,a=o.length>0?o.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(a)+"/uuid/"+i}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};return r.length>0&&(i["channel-group"]=r.join(",")),i}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a={};return 1===i.length&&0===o.length?a[i[0]]=t.payload:a=t.payload,{channels:a}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSetStateOperation}function s(e,t){var n=e.config,r=t.state,i=t.channels,s=void 0===i?[]:i,o=t.channelGroups,a=void 0===o?[]:o;return r?n.subscribeKey?0===s.length&&0===a.length?"Please provide a list of channels and/or channel-groups":void 0:"Missing Subscribe Key":"Missing State"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/presence/sub-key/"+n.subscribeKey+"/channel/"+p.default.encodeString(s)+"/uuid/"+n.UUID+"/data"}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.state,r=t.channelGroups,i=void 0===r?[]:r,s={};return s.state=JSON.stringify(n),i.length>0&&(s["channel-group"]=i.join(",")),s}function l(e,t){return{state:t.payload}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNHereNowOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=t.channelGroups,o=void 0===s?[]:s,a="/v2/presence/sub-key/"+n.subscribeKey;if(i.length>0||o.length>0){var u=i.length>0?i.join(","):",";a+="/channel/"+p.default.encodeString(u)}return a}function a(e){return e.config.getTransactionTimeout()}function u(){return!0}function c(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.includeUUIDs,s=void 0===i||i,o=t.includeState,a=void 0!==o&&o,u={};return s||(u.disable_uuids=1),a&&(u.state=1),r.length>0&&(u["channel-group"]=r.join(",")),u}function l(e,t,n){var r=n.channels,i=void 0===r?[]:r,s=n.channelGroups,o=void 0===s?[]:s,a=n.includeUUIDs,u=void 0===a||a,c=n.includeState,l=void 0!==c&&c;return i.length>1||o.length>0||0===o.length&&0===i.length?function(){var e={};return e.totalChannels=t.payload.total_channels,e.totalOccupancy=t.payload.total_occupancy,e.channels={},Object.keys(t.payload.channels).forEach(function(n){var r=t.payload.channels[n],i=[];return e.channels[n]={occupants:i,name:n,occupancy:r.occupancy},u&&r.uuids.forEach(function(e){l?i.push({state:e.state,uuid:e.uuid}):i.push({state:null,uuid:e})}),e}),e}():function(){var e={},n=[];return e.totalChannels=1,e.totalOccupancy=t.occupancy,e.channels={},e.channels[i[0]]={occupants:n,name:i[0],occupancy:t.occupancy},u&&t.uuids.forEach(function(e){l?n.push({state:e.state,uuid:e.uuid}):n.push({state:null,uuid:e})}),e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerAudit}function i(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function s(e){return"/v2/auth/audit/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channel,r=t.channelGroup,i=t.authKeys,s=void 0===i?[]:i,o={};return n&&(o.channel=n),r&&(o["channel-group"]=r),s.length>0&&(o.auth=s.join(",")),o}function c(e,t){return t.payload}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(){return h.default.PNAccessManagerGrant}function i(e){var t=e.config;return t.subscribeKey?t.publishKey?t.secretKey?void 0:"Missing Secret Key":"Missing Publish Key":"Missing Subscribe Key"}function s(e){return"/v2/auth/grant/sub-key/"+e.config.subscribeKey}function o(e){return e.config.getTransactionTimeout()}function a(){return!1}function u(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.channelGroups,s=void 0===i?[]:i,o=t.ttl,a=t.read,u=void 0!==a&&a,c=t.write,l=void 0!==c&&c,h=t.manage,f=void 0!==h&&h,d=t.authKeys,p=void 0===d?[]:d,g={};return g.r=u?"1":"0",g.w=l?"1":"0",g.m=f?"1":"0",r.length>0&&(g.channel=r.join(",")),s.length>0&&(g["channel-group"]=s.join(",")),p.length>0&&(g.auth=p.join(",")),(o||0===o)&&(g.ttl=o),g}function c(){return{}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=r,t.validateParams=i,t.getURL=s,t.getRequestTimeout=o,t.isAuthSupported=a,t.prepareParams=u,t.handleResponse=c;var l=(n(8),n(16)),h=function(e){return e&&e.__esModule?e:{default:e}}(l)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i}function s(){return v.default.PNPublishOperation}function o(e,t){var n=e.config,r=t.message;return t.channel?r?n.subscribeKey?void 0:"Missing Subscribe Key":"Missing Message":"Missing Channel"}function a(e,t){var n=t.sendByPost;return void 0!==n&&n}function u(e,t){var n=e.config,r=t.channel,s=t.message,o=i(e,s);return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0/"+_.default.encodeString(o)}function c(e,t){var n=e.config,r=t.channel;return"/publish/"+n.publishKey+"/"+n.subscribeKey+"/0/"+_.default.encodeString(r)+"/0"}function l(e){return e.config.getTransactionTimeout()}function h(){return!0}function f(e,t){return i(e,t.message)}function d(e,t){var n=t.meta,r=t.replicate,i=void 0===r||r,s=t.storeInHistory,o=t.ttl,a={};return null!=s&&(a.store=s?"1":"0"),o&&(a.ttl=o),!1===i&&(a.norep="true"),n&&"object"===(void 0===n?"undefined":g(n))&&(a.meta=JSON.stringify(n)),a}function p(e,t){return{timetoken:t[2]}}Object.defineProperty(t,"__esModule",{value:!0});var g="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};t.getOperation=s,t.validateParams=o,t.usePost=a,t.getURL=u,t.postURL=c,t.getRequestTimeout=l,t.isAuthSupported=h,t.postPayload=f,t.prepareParams=d,t.handleResponse=p;var y=(n(8),n(16)),v=r(y),b=n(17),_=r(b)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return d.default.PNHistoryOperation}function o(e,t){var n=t.channel,r=e.config;return n?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channel"}function a(e,t){var n=t.channel;return"/v2/history/sub-key/"+e.config.subscribeKey+"/channel/"+g.default.encodeString(n)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.reverse,s=t.count,o=void 0===s?100:s,a=t.stringifiedTimeToken,u=void 0!==a&&a,c={include_token:"true"};return c.count=o,n&&(c.start=n),r&&(c.end=r),u&&(c.string_message_token="true"),null!=i&&(c.reverse=i.toString()),c}function h(e,t){var n={messages:[],startTimeToken:t[1],endTimeToken:t[2]};return t[0].forEach(function(t){var r={timetoken:t.timetoken,entry:i(e,t.message)};n.messages.push(r)}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),
n(16)),d=r(f),p=n(17),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}function s(){return d.default.PNFetchMessagesOperation}function o(e,t){var n=t.channels,r=e.config;return n&&0!==n.length?r.subscribeKey?void 0:"Missing Subscribe Key":"Missing channels"}function a(e,t){var n=t.channels,r=void 0===n?[]:n,i=e.config,s=r.length>0?r.join(","):",";return"/v3/history/sub-key/"+i.subscribeKey+"/channel/"+g.default.encodeString(s)}function u(e){return e.config.getTransactionTimeout()}function c(){return!0}function l(e,t){var n=t.start,r=t.end,i=t.count,s={};return i&&(s.max=i),n&&(s.start=n),r&&(s.end=r),s}function h(e,t){var n={channels:{}};return Object.keys(t.channels||{}).forEach(function(r){n.channels[r]=[],(t.channels[r]||[]).forEach(function(t){var s={};s.channel=r,s.subscription=null,s.timetoken=t.timetoken,s.message=i(e,t.message),n.channels[r].push(s)})}),n}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=s,t.validateParams=o,t.getURL=a,t.getRequestTimeout=u,t.isAuthSupported=c,t.prepareParams=l,t.handleResponse=h;var f=(n(8),n(16)),d=r(f),p=n(17),g=r(p)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(){return f.default.PNSubscribeOperation}function s(e){if(!e.config.subscribeKey)return"Missing Subscribe Key"}function o(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,s=i.length>0?i.join(","):",";return"/v2/subscribe/"+n.subscribeKey+"/"+p.default.encodeString(s)+"/0"}function a(e){return e.config.getSubscribeTimeout()}function u(){return!0}function c(e,t){var n=e.config,r=t.channelGroups,i=void 0===r?[]:r,s=t.timetoken,o=t.filterExpression,a=t.region,u={heartbeat:n.getPresenceTimeout()};return i.length>0&&(u["channel-group"]=i.join(",")),o&&o.length>0&&(u["filter-expr"]=o),s&&(u.tt=s),a&&(u.tr=a),u}function l(e,t){var n=[];t.m.forEach(function(e){var t={publishTimetoken:e.p.t,region:e.p.r},r={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,userMetadata:e.u,publishMetaData:t};n.push(r)});var r={timetoken:t.t.t,region:t.t.r};return{messages:n,metadata:r}}Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=i,t.validateParams=s,t.getURL=o,t.getRequestTimeout=a,t.isAuthSupported=u,t.prepareParams=c,t.handleResponse=l;var h=(n(8),n(16)),f=r(h),d=n(17),p=r(d)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(7),a=(r(o),n(13)),u=r(a),c=(n(8),function(){function e(t){var n=this;i(this,e),this._modules={},Object.keys(t).forEach(function(e){n._modules[e]=t[e].bind(n)})}return s(e,[{key:"init",value:function(e){this._config=e,this._maxSubDomain=20,this._currentSubDomain=Math.floor(Math.random()*this._maxSubDomain),this._providedFQDN=(this._config.secure?"https://":"http://")+this._config.origin,this._coreParams={},this.shiftStandardOrigin()}},{key:"nextOrigin",value:function(){if(-1===this._providedFQDN.indexOf("pubsub."))return this._providedFQDN;var e=void 0;return this._currentSubDomain=this._currentSubDomain+1,this._currentSubDomain>=this._maxSubDomain&&(this._currentSubDomain=1),e=this._currentSubDomain.toString(),this._providedFQDN.replace("pubsub","ps"+e)}},{key:"shiftStandardOrigin",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return this._standardOrigin=this.nextOrigin(e),this._standardOrigin}},{key:"getStandardOrigin",value:function(){return this._standardOrigin}},{key:"POST",value:function(e,t,n,r){return this._modules.post(e,t,n,r)}},{key:"GET",value:function(e,t,n){return this._modules.get(e,t,n)}},{key:"_detectErrorCategory",value:function(e){if("ENOTFOUND"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNREFUSED"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNRESET"===e.code)return u.default.PNNetworkIssuesCategory;if("EAI_AGAIN"===e.code)return u.default.PNNetworkIssuesCategory;if(0===e.status||e.hasOwnProperty("status")&&void 0===e.status)return u.default.PNNetworkIssuesCategory;if(e.timeout)return u.default.PNTimeoutCategory;if(e.response){if(e.response.badRequest)return u.default.PNBadRequestCategory;if(e.response.forbidden)return u.default.PNAccessDeniedCategory}return u.default.PNUnknownCategory}}]),e}());t.default=c,e.exports=t.default},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={get:function(e){try{return localStorage.getItem(e)}catch(e){return null}},set:function(e,t){try{return localStorage.setItem(e,t)}catch(e){return null}}},e.exports=t.default},function(e,t,n){"use strict";function r(e){var t=(new Date).getTime(),n=(new Date).toISOString(),r=function(){return console&&console.log?console:window&&window.console&&window.console.log?window.console:console}();r.log("<<<<<"),r.log("["+n+"]","\n",e.url,"\n",e.qs),r.log("-----"),e.on("response",function(n){var i=(new Date).getTime(),s=i-t,o=(new Date).toISOString();r.log(">>>>>>"),r.log("["+o+" / "+s+"]","\n",e.url,"\n",e.qs,"\n",n.text),r.log("-----")})}function i(e,t,n){var i=this;return this._config.logVerbosity&&(e=e.use(r)),this._config.proxy&&this._modules.proxy&&(e=this._modules.proxy.call(this,e)),this._config.keepAlive&&this._modules.keepAlive&&(e=this._module.keepAlive(e)),e.timeout(t.timeout).end(function(e,r){var s={};if(s.error=null!==e,s.operation=t.operation,r&&r.status&&(s.statusCode=r.status),e)return s.errorData=e,s.category=i._detectErrorCategory(e),n(s,null);var o=JSON.parse(r.text);return n(s,o)})}function s(e,t,n){var r=u.default.get(this.getStandardOrigin()+t.url).query(e);return i.call(this,r,t,n)}function o(e,t,n,r){var s=u.default.post(this.getStandardOrigin()+n.url).query(e).send(t);return i.call(this,s,n,r)}Object.defineProperty(t,"__esModule",{value:!0}),t.get=s,t.post=o;var a=n(43),u=function(e){return e&&e.__esModule?e:{default:e}}(a);n(8)},function(e,t,n){function r(){}function i(e){if(!v(e))return e;var t=[];for(var n in e)s(t,n,e[n]);return t.join("&")}function s(e,t,n){if(null!=n)if(Array.isArray(n))n.forEach(function(n){s(e,t,n)});else if(v(n))for(var r in n)s(e,t+"["+r+"]",n[r]);else e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));else null===n&&e.push(encodeURIComponent(t))}function o(e){for(var t,n,r={},i=e.split("&"),s=0,o=i.length;s<o;++s)t=i[s],n=t.indexOf("="),-1==n?r[decodeURIComponent(t)]="":r[decodeURIComponent(t.slice(0,n))]=decodeURIComponent(t.slice(n+1));return r}function a(e){var t,n,r,i,s=e.split(/\r?\n/),o={};s.pop();for(var a=0,u=s.length;a<u;++a)n=s[a],t=n.indexOf(":"),r=n.slice(0,t).toLowerCase(),i=_(n.slice(t+1)),o[r]=i;return o}function u(e){return/[\/+]json\b/.test(e)}function c(e){return e.split(/ *; */).shift()}function l(e){return e.split(/ *; */).reduce(function(e,t){var n=t.split(/ *= */),r=n.shift(),i=n.shift();return r&&i&&(e[r]=i),e},{})}function h(e,t){t=t||{},this.req=e,this.xhr=this.req.xhr,this.text="HEAD"!=this.req.method&&(""===this.xhr.responseType||"text"===this.xhr.responseType)||void 0===this.xhr.responseType?this.xhr.responseText:null,this.statusText=this.req.xhr.statusText,this._setStatusProperties(this.xhr.status),this.header=this.headers=a(this.xhr.getAllResponseHeaders()),this.header["content-type"]=this.xhr.getResponseHeader("content-type"),this._setHeaderProperties(this.header),this.body="HEAD"!=this.req.method?this._parseBody(this.text?this.text:this.xhr.response):null}function f(e,t){var n=this;this._query=this._query||[],this.method=e,this.url=t,this.header={},this._header={},this.on("end",function(){var e=null,t=null;try{t=new h(n)}catch(t){return e=new Error("Parser is unable to parse the response"),e.parse=!0,e.original=t,e.rawResponse=n.xhr&&n.xhr.responseText?n.xhr.responseText:null,e.statusCode=n.xhr&&n.xhr.status?n.xhr.status:null,n.callback(e)}n.emit("response",t);var r;try{(t.status<200||t.status>=300)&&(r=new Error(t.statusText||"Unsuccessful HTTP response"),r.original=e,r.response=t,r.status=t.status)}catch(e){r=e}r?n.callback(r,t):n.callback(null,t)})}function d(e,t){var n=b("DELETE",e);return t&&n.end(t),n}var p;"undefined"!=typeof window?p=window:"undefined"!=typeof self?p=self:(console.warn("Using browser-only version of superagent in non-browser environment"),p=this);var g=n(44),y=n(45),v=n(46),b=e.exports=n(47).bind(null,f);b.getXHR=function(){if(!(!p.XMLHttpRequest||p.location&&"file:"==p.location.protocol&&p.ActiveXObject))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(e){}throw Error("Browser-only verison of superagent could not find XHR")};var _="".trim?function(e){return e.trim()}:function(e){return e.replace(/(^\s*|\s*$)/g,"")};b.serializeObject=i,b.parseString=o,b.types={html:"text/html",json:"application/json",xml:"application/xml",urlencoded:"application/x-www-form-urlencoded",form:"application/x-www-form-urlencoded","form-data":"application/x-www-form-urlencoded"},b.serialize={"application/x-www-form-urlencoded":i,"application/json":JSON.stringify},b.parse={"application/x-www-form-urlencoded":o,"application/json":JSON.parse},h.prototype.get=function(e){return this.header[e.toLowerCase()]},h.prototype._setHeaderProperties=function(e){var t=this.header["content-type"]||"";this.type=c(t);var n=l(t);for(var r in n)this[r]=n[r]},h.prototype._parseBody=function(e){var t=b.parse[this.type];return!t&&u(this.type)&&(t=b.parse["application/json"]),t&&e&&(e.length||e instanceof Object)?t(e):null},h.prototype._setStatusProperties=function(e){1223===e&&(e=204);var t=e/100|0;this.status=this.statusCode=e,this.statusType=t,this.info=1==t,this.ok=2==t,this.clientError=4==t,this.serverError=5==t,this.error=(4==t||5==t)&&this.toError(),this.accepted=202==e,this.noContent=204==e,this.badRequest=400==e,this.unauthorized=401==e,this.notAcceptable=406==e,this.notFound=404==e,this.forbidden=403==e},h.prototype.toError=function(){var e=this.req,t=e.method,n=e.url,r="cannot "+t+" "+n+" ("+this.status+")",i=new Error(r);return i.status=this.status,i.method=t,i.url=n,i},b.Response=h,g(f.prototype);for(var m in y)f.prototype[m]=y[m];f.prototype.type=function(e){return this.set("Content-Type",b.types[e]||e),this},f.prototype.responseType=function(e){return this._responseType=e,this},f.prototype.accept=function(e){return this.set("Accept",b.types[e]||e),this},f.prototype.auth=function(e,t,n){switch(n||(n={type:"basic"}),n.type){case"basic":var r=btoa(e+":"+t);this.set("Authorization","Basic "+r);break;case"auto":this.username=e,this.password=t}return this},f.prototype.query=function(e){return"string"!=typeof e&&(e=i(e)),e&&this._query.push(e),this},f.prototype.attach=function(e,t,n){return this._getFormData().append(e,t,n||t.name),this},f.prototype._getFormData=function(){return this._formData||(this._formData=new p.FormData),this._formData},f.prototype.callback=function(e,t){var n=this._callback;this.clearTimeout(),n(e,t)},f.prototype.crossDomainError=function(){var e=new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");e.crossDomain=!0,e.status=this.status,e.method=this.method,e.url=this.url,this.callback(e)},f.prototype._timeoutError=function(){var e=this._timeout,t=new Error("timeout of "+e+"ms exceeded");t.timeout=e,this.callback(t)},f.prototype._appendQueryString=function(){var e=this._query.join("&");e&&(this.url+=~this.url.indexOf("?")?"&"+e:"?"+e)},f.prototype.end=function(e){var t=this,n=this.xhr=b.getXHR(),i=this._timeout,s=this._formData||this._data;this._callback=e||r,n.onreadystatechange=function(){if(4==n.readyState){var e;try{e=n.status}catch(t){e=0}if(0==e){if(t.timedout)return t._timeoutError();if(t._aborted)return;return t.crossDomainError()}t.emit("end")}};var o=function(e,n){n.total>0&&(n.percent=n.loaded/n.total*100),n.direction=e,t.emit("progress",n)};if(this.hasListeners("progress"))try{n.onprogress=o.bind(null,"download"),n.upload&&(n.upload.onprogress=o.bind(null,"upload"))}catch(e){}if(i&&!this._timer&&(this._timer=setTimeout(function(){t.timedout=!0,t.abort()},i)),this._appendQueryString(),this.username&&this.password?n.open(this.method,this.url,!0,this.username,this.password):n.open(this.method,this.url,!0),this._withCredentials&&(n.withCredentials=!0),"GET"!=this.method&&"HEAD"!=this.method&&"string"!=typeof s&&!this._isHost(s)){var a=this._header["content-type"],c=this._serializer||b.serialize[a?a.split(";")[0]:""];!c&&u(a)&&(c=b.serialize["application/json"]),c&&(s=c(s))}for(var l in this.header)null!=this.header[l]&&n.setRequestHeader(l,this.header[l]);return this._responseType&&(n.responseType=this._responseType),this.emit("request",this),n.send(void 0!==s?s:null),this},b.Request=f,b.get=function(e,t,n){var r=b("GET",e);return"function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},b.head=function(e,t,n){var r=b("HEAD",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.options=function(e,t,n){var r=b("OPTIONS",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.del=d,b.delete=d,b.patch=function(e,t,n){var r=b("PATCH",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.post=function(e,t,n){var r=b("POST",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},b.put=function(e,t,n){var r=b("PUT",e);return"function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}},function(e,t,n){function r(e){if(e)return i(e)}function i(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+e]=this._callbacks["$"+e]||[]).push(t),this},r.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var n=this._callbacks["$"+e];if(!n)return this;if(1==arguments.length)return delete this._callbacks["$"+e],this;for(var r,i=0;i<n.length;i++)if((r=n[i])===t||r.fn===t){n.splice(i,1);break}return this},r.prototype.emit=function(e){this._callbacks=this._callbacks||{};var t=[].slice.call(arguments,1),n=this._callbacks["$"+e];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},r.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks["$"+e]||[]},r.prototype.hasListeners=function(e){return!!this.listeners(e).length}},function(e,t,n){var r=n(46);t.clearTimeout=function(){return this._timeout=0,clearTimeout(this._timer),this},t.parse=function(e){return this._parser=e,this},t.serialize=function(e){return this._serializer=e,this},t.timeout=function(e){return this._timeout=e,this},t.then=function(e,t){if(!this._fullfilledPromise){var n=this;this._fullfilledPromise=new Promise(function(e,t){n.end(function(n,r){n?t(n):e(r)})})}return this._fullfilledPromise.then(e,t)},t.catch=function(e){return this.then(void 0,e)},t.use=function(e){return e(this),this},t.get=function(e){return this._header[e.toLowerCase()]},t.getHeader=t.get,t.set=function(e,t){if(r(e)){for(var n in e)this.set(n,e[n]);return this}return this._header[e.toLowerCase()]=t,this.header[e]=t,this},t.unset=function(e){return delete this._header[e.toLowerCase()],delete this.header[e],this},t.field=function(e,t){if(null===e||void 0===e)throw new Error(".field(name, val) name can not be empty");if(r(e)){for(var n in e)this.field(n,e[n]);return this}if(null===t||void 0===t)throw new Error(".field(name, val) val can not be empty");return this._getFormData().append(e,t),this},t.abort=function(){return this._aborted?this:(this._aborted=!0,this.xhr&&this.xhr.abort(),this.req&&this.req.abort(),this.clearTimeout(),this.emit("abort"),this)},t.withCredentials=function(){return this._withCredentials=!0,this},t.redirects=function(e){return this._maxRedirects=e,this},t.toJSON=function(){return{method:this.method,url:this.url,data:this._data,headers:this._header}},t._isHost=function(e){switch({}.toString.call(e)){case"[object File]":case"[object Blob]":case"[object FormData]":return!0;default:return!1}},t.send=function(e){var t=r(e),n=this._header["content-type"];if(t&&r(this._data))for(var i in e)this._data[i]=e[i];else"string"==typeof e?(n||this.type("form"),n=this._header["content-type"],this._data="application/x-www-form-urlencoded"==n?this._data?this._data+"&"+e:e:(this._data||"")+e):this._data=e;return!t||this._isHost(e)?this:(n||this.type("json"),this)}},function(e,t){function n(e){return null!==e&&"object"==typeof e}e.exports=n},function(e,t){function n(e,t,n){return"function"==typeof n?new e("GET",t).end(n):2==arguments.length?new e("GET",t):new e(t,n)}e.exports=n}])});
},{}],31:[function(require,module,exports){
 "use strict";

// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const PubNub = require('pubnub');

// allows a synchronous execution flow.
const waterfall = require('async/waterfall');

/**
* Global object used to create an instance of ChatEngine.
*
* @class OpenChatFramework
* @constructor
* @param {Object} foo Argument 1
* @param config.pubnub {Object} ChatEngine is based off PubNub. Supply your PubNub config here.
* @param config.globalChannel {String} his is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.
* @return {Object} Returns an instance of ChatEngine
*/

const create = function(pnConfig, globalChannel = 'chat-engine') {

    let ChatEngine = false;

    /**
    * Configures an event emitter that other ChatEngine objects inherit. Adds shortcut methods for
    * ```this.on()```, ```this.emit()```, etc.
    *
    * @class RootEmitter
    * @constructor
    */
    class RootEmitter {

        constructor() {

            // create an ee2
            this.emitter = new EventEmitter2({
              wildcard: true,
              newListener: true,
              maxListeners: 50,
              verboseMemoryLeak: true
            });

            // we bind to make sure wildcards work
            // https://github.com/asyncly/EventEmitter2/issues/186
            this._emit = this.emitter.emit.bind(this.emitter);

            /**
            * Listen for a specific event and fire a callback when it's emitted
            *
            * @method on
            * @param {String} event The event name
            * @param {Function} callback The function to run when the event is emitted
            */
            this._on = this.emitter.on.bind(this.emitter);

            this.on = (event, cb) => {

                // ensure the user exists within the global space
                this.events[event] = this.events[event] || new Event(this, event);

                this._on(event, cb);

            };

            this.off = this.emitter.off.bind(this.emitter);

            /**
            * Listen for any event on this object and fire a callback when it's emitted
            *
            * @method onAny
            * @param {Function} callback The function to run when any event is emitted. First parameter is the event name and second is the payload.
            */
            this.onAny = this.emitter.onAny.bind(this.emitter);

            /**
            * Listen for an event and only fire the callback a single time
            *
            * @method once
            * @param {String} event The event name
            * @param {Function} callback The function to run once
            */
            this.once = this.emitter.once.bind(this.emitter);

        }

    }

    class Event {

        constructor(Chat, event) {

            this.channel = [Chat.channel, event].join('.');

            this.publish = (m) => {

                ChatEngine.pubnub.publish({
                    message: m,
                    channel: this.channel
                });

            }

            this.onMessage = (m) => {

                if(this.channel == m.channel) {
                    Chat.trigger(event, m.message);
                }

            }

            ChatEngine.pubnub.addListener({
                message: this.onMessage
            });

            ChatEngine.pubnub.subscribe({
                channels: [this.channel],
                withPresence: true
            });

        }

    }

    /**
    * An ChatEngine generic emitter that supports plugins and forwards
    * events to a global emitter.
    *
    * @class Emitter
    * @constructor
    * @extends RootEmitter
    */
    class Emitter extends RootEmitter {

        constructor() {

            super();

            // emit an event from this object
            this._emit = (event, data) => {

                // all events are forwarded to ChatEngine object
                // so you can globally bind to events with ChatEngine.on()
                ChatEngine._emit(event, data);

                // emit the event from the object that created it
                this.emitter.emit(event, data);

            }

            // assign the list of plugins for this scope
            this.plugins = [];

            // bind a plugin to this object
            this.plugin = function(module) {

                this.plugins.push(module);

                // returns the name of the class
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
    * This is the root {{#crossLink "Chat"}}{{/crossLink}} class that represents a chat room
    *
    * @class Chat
    * @constructor
    * @param {String} channel The channel name for the Chat
    * @extends Emitter
    */
    class Chat extends Emitter {

        constructor(channel) {

            super();

            /**
            * The channel name for this {{#crossLink "Chat"}}{{/crossLink}}
            *
            * @property channel
            * @type String
            */

            this.channel = channel;

            if(channel.indexOf(globalChannel) == -1) {
                this.channel = [globalChannel, channel].join('.');
            }

            /**
            * A list of users in this {{#crossLink "Chat"}}{{/crossLink}}. Automatically kept in sync,
            * Use ```Chat.on('$.join')``` and related events to get notified when this changes
            *
            * @property users
            * @type Object
            */
            this.users = {};


            this.events = {}

            // whenever we get a message from the network
            // run local trigger message

            this.onHereNow = (status, response) => {

                if(status.error) {
                    throw new Error('There was a problem fetching here.', status.err);
                } else {

                    // get the list of occupants in this channel
                    let occupants = response.channels[this.channel].occupants;

                    // format the userList for rltm.js standard
                    for(let i in occupants) {
                        this.userUpdate(occupants[i].uuid, occupants[i].state);
                    }

                }

            };

            this.onStatus = (statusEvent) => {

                if (statusEvent.category === "PNConnectedCategory") {

                    if(statusEvent.affectedChannels.indexOf(this.channel) > -1) {
                        this.trigger('$.ready');
                    }

                }

            };

            this.history = (event, config = {}) => {

                this.events[event] = this.events[event] || new Event(this, event);

                config.channel = this.events[event].channel;

                ChatEngine.pubnub.history(config, (status, response) => {

                    if(response.error) {
                        throw new Error(response.error);
                    } else {

                        response.messages.forEach((message) => {

                            // trigger the same event with the same data
                            // but the event name is now history:name rather than just name
                            // to distinguish it from the original live events
                            this.trigger(
                                ['$history', event].join('.'),
                                message.entry);

                        });

                    }

                });

            }

            this.onPresence = (presenceEvent) => {

                // make sure channel matches this channel
                if(this.channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has joined the room
                        *
                        * @event $.join
                        * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                        */
                        this.trigger('$.join', {
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

            ChatEngine.pubnub.addListener({
                status: this.onStatus,
                message: this.onMessage,
                presence: this.onPresence
            });

            ChatEngine.pubnub.subscribe({
                channels: [this.channel],
                withPresence: true
            });

            // get a list of users online now
            // ask PubNub for information about connected users in this channel
            ChatEngine.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, this.onHereNow);

        }

        /**
        * Send events to other clients in this {{#crossLink "User"}}{{/crossLink}}.
        * Events are trigger over the network  and all events are made
        * on behalf of {{#crossLink "Me"}}{{/crossLink}}
        *
        * @method emit
        * @param {String} event The event name
        * @param {Object} data The event payload object
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
        * @private
        * Broadcasts an event locally to all listeners.
        *
        * @method trigger
        * @param {String} event The event name
        * @param {Object} payload The event payload object
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
        * @private
        * Add a user to the {{#crossLink "Chat"}}{{/crossLink}}, creating it if it doesn't already exist.
        *
        * @method createUser
        * @param {String} uuid The user uuid
        * @param {Object} state The user initial state
        * @param {Boolean} trigger Force a trigger that this user is online
        */
        createUser(uuid, state, trigger = false) {

            // Ensure that this user exists in the global list
            // so we can reference it from here out
            ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            ChatEngine.users[uuid].addChat(this, state);

            // trigger the join event over this chatroom
            if(!this.users[uuid] || trigger) {

                /**
                * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has come online
                *
                * @event $.online
                * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                */
                this.trigger('$.online', {
                    user: ChatEngine.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = ChatEngine.users[uuid];

            // return the instance of this user
            return ChatEngine.users[uuid];

        }

        /**
        * @private
        * Update a user's state within this {{#crossLink "Chat"}}{{/crossLink}}.
        *
        * @method userUpdate
        * @param {String} uuid The {{#crossLink "User"}}{{/crossLink}} uuid
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
            * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has changed state
            *
            * @event $.state
            * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that changed state
            * @param {Object} payload.state The new user state for this ```Chat```
            */
            this.trigger('$.state', {
                user: this.users[uuid],
                state: this.users[uuid].state(this)
            });

        }

        /**
         * Leave from the {{#crossLink "Chat"}}{{/crossLink}} on behalf of {{#crossLink "Me"}}{{/crossLink}}
         *
         * @method leave
         */
        leave() {

            ChatEngine.pubnub.unsubscribe({
                channels: [this.channel]
            });

        }

        /**
         * @private
         * Perform updates when a user has left the {{#crossLink "Chat"}}{{/crossLink}}.
         *
         * @method leave
         */
        userLeave(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                // if a user leaves, trigger the event
                this.trigger('$.leave', this.users[uuid]);
                this.trigger('$.offline', this.users[uuid]);

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
        * @private
        * Fired when a user disconnects from the {{#crossLink "Chat"}}{{/crossLink}}
        *
        * @method userDisconnect
        * @param {String} uuid The uuid of the {{#crossLink "Chat"}}{{/crossLink}} that left
        */
        userDisconnect(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                /**
                * A {{#crossLink "User"}}{{/crossLink}} has been disconnected from the ```Chat```
                *
                * @event $.disconnect
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that disconnected
                */
                this.trigger('$.disconnect', this.users[uuid]);

                /**
                * A {{#crossLink "User"}}{{/crossLink}} has gone offline
                *
                * @event $.offline
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that has gone offline
                */
                this.trigger('$.offline', this.users[uuid]);

            }

        }

        /**
        * @private
        * Load plugins and attach a queue of functions to execute before and
        * after events are trigger or received.
        *
        * @method runPluginQueue
        * @param {String} location Where in the middleeware the event should run (emit, trigger)
        * @param {String} event The event name
        * @param {String} first The first function to run before the plugins have run
        * @param {String} last The last function to run after the plugins have run
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
        * @private
        * Set the state for {{#crossLink "Me"}}{{/crossLink}} within this {{#crossLink "User"}}{{/crossLink}}.
        * Broadcasts the ```$.state``` event on other clients
        *
        * @method setState
        * @param {Object} state The new state {{#crossLink "Me"}}{{/crossLink}} will have within this {{#crossLink "User"}}{{/crossLink}}
        */
        setState(state) {

            ChatEngine.pubnub.setState(
                {
                    state: state,
                    channels: [this.channel]
                },
                function (status, response) {
                    // handle status, response
                }
            );

        }

    };

    /**
    * This is our User class which represents a connected client
    *
    * @class User
    * @constructor
    * @extends Emitter
    */
    class User extends Emitter {

        constructor(uuid, state = {}, chat = ChatEngine.globalChat) {

            super();

            /**
            * the User's uuid. This is public id exposed to the network.
            *
            * @property uuid
            * @type String
            */
            this.uuid = uuid;

            /**
            * keeps account of user state in each channel
            *
            * @property states
            * @type Object
            */
            this.states = {};

            /**
            * keep a list of chatrooms this user is in
            *
            * @property chats
            * @type Object
            */
            this.chats = {};

            /**
            * every user has a couple personal rooms we can connect to
            * feed is a list of things a specific user does that
            * many people can subscribe to
            *
            * @property feed
            * @type Chat
            */
            this.feed = new Chat(
                [ChatEngine.globalChat.channel, uuid, 'feed'].join('.'));

            /**
            * direct is a private channel that anybody can publish to
            * but only the user can subscribe to
            * this permission based system is not implemented yet
            *
            * @property direct
            * @type Chat
            */
            this.direct = new Chat(
                [ChatEngine.globalChat.channel, uuid, 'direct'].join('.'));

            // if the user does not exist at all and we get enough
            // information to build the user
            if(!ChatEngine.users[uuid]) {
                ChatEngine.users[uuid] = this;
            }

            // update this user's state in it's created context
            this.assign(state, chat)

        }

        /**
        * get the user's state in a chatroom
        *
        * @method state
        * @param {Chat} chat Chatroom to retrieve state from
        */
        state(chat = ChatEngine.globalChat) {
            return this.states[chat.channel] || {};
        }

        /**
        * update the user's state in a specific chatroom
        *
        * @method update
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state, chat = ChatEngine.globalChat) {
            let chatState = this.state(chat) || {};
            this.states[chat.channel] = Object.assign(chatState, state);
        }

        /**
        * @private
        * this is only called from network updates
        *
        * @method assign
        */
        assign(state, chat) {
            this.update(state, chat);
        }

        /**
        * @private
        * adds a chat to this user
        *
        * @method addChat
        */
        addChat(chat, state) {

            // store the chat in this user object
            this.chats[chat.channel] = chat;

            // updates the user's state in that chatroom
            this.assign(state, chat);
        }

    }

    /**
    * Represents the client connection as a {{#crossLink "User"}}{{/crossLink}}.
    * Has the ability to update it's state on the network. An instance of
    * {{#crossLink "Me"}}{{/crossLink}} is returned by the ```ChatEngine.connect()```
    * method.
    *
    * @class Me
    * @constructor
    * @param {String} uuid The uuid of this user
    * @extends User
    */
    class Me extends User {

        constructor(uuid) {

            // call the User constructor
            super(uuid);

        }

        // assign updates from network
        assign(state, chat) {
            // we call "update" because calling "super.assign"
            // will direct back to "this.update" which creates
            // a loop of network updates
            super.update(state, chat);
        }

        /**
        * Update this user state over the network
        *
        * @method update
        * @param {Object} state The new state for {{#crossLink "Me"}}{{/crossLink}}
        * @param {Chat} chat An instance of the {{#crossLink "Chat"}}{{/crossLink}} where state will be updated.
        * Defaults to ```ChatEngine.globalChat```.
        */
        update(state, chat = ChatEngine.globalChat) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel
            chat.setState(state);

        }

    }

    /**
     * Provides the base Widget class...
     *
     * @class ChatEngine
     */
    const init = function() {

        // Create the root ChatEngine object
        ChatEngine = new RootEmitter;

        // create a global list of known users
        ChatEngine.users = {};

        // define our global chatroom all users join by default
        ChatEngine.globalChat = false;

        // define the user that this client represents
        ChatEngine.me = false;

        // store a reference to PubNub
        ChatEngine.pubnub = false;

        /**
        * connect to realtime service and create instance of {{#crossLink "Me"}}{{/crossLink}}
        *
        * @method connect
        * @param {String} uuid The uuid for {{#crossLink "Me"}}{{/crossLink}}
        * @param {Object} state The initial state for {{#crossLink "Me"}}{{/crossLink}}
        * @return {Me} me an instance of me
        */
        ChatEngine.connect = function(uuid, state = {}) {

            // this creates a user known as Me and
            // connects to the global chatroom

            // this.config.rltm.config.uuid = uuid;
            pnConfig.uuid = uuid || pnConfig.uuid;

            this.pubnub = new PubNub(pnConfig);

            // create a new chat to use as globalChat
            this.globalChat = new Chat(globalChannel);

            // create a new user that represents this client
            this.me = new Me(this.pubnub.getUUID());

            // create a new instance of Me using input parameters
            this.globalChat.createUser(this.pubnub.getUUID(), state);

            this.me.update(state);

            // return me
            return this.me;

            // client can access globalChat through ChatEngine.globalChat

        };

        // our exported classes
        ChatEngine.Chat = Chat;
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

},{"async/waterfall":3,"eventemitter2":4,"pubnub":30}],32:[function(require,module,exports){
window.ChatEngineCore = window.ChatEngineCore || require('./index.js');

},{"./index.js":31}]},{},[32])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvaW50ZXJuYWwvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9vbmx5T25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy93YXRlcmZhbGwuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvY29uc3RhbnQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbm9vcC5qcyIsIm5vZGVfbW9kdWxlcy9wdWJudWIvZGlzdC93ZWIvcHVibnViLm1pbi5qcyIsInNyYy9pbmRleC5qcyIsInNyYy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0NEJBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG9uY2U7XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIHZhciBjYWxsRm4gPSBmbjtcbiAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICBjYWxsRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gb25seU9uY2U7XG5mdW5jdGlvbiBvbmx5T25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIGNhbGxGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSAoMCwgX29uY2UyLmRlZmF1bHQpKGNhbGxiYWNrIHx8IF9ub29wMi5kZWZhdWx0KTtcbiAgICBpZiAoISgwLCBfaXNBcnJheTIuZGVmYXVsdCkodGFza3MpKSByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKSk7XG4gICAgaWYgKCF0YXNrcy5sZW5ndGgpIHJldHVybiBjYWxsYmFjaygpO1xuICAgIHZhciB0YXNrSW5kZXggPSAwO1xuXG4gICAgZnVuY3Rpb24gbmV4dFRhc2soYXJncykge1xuICAgICAgICBpZiAodGFza0luZGV4ID09PSB0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSAoMCwgX29ubHlPbmNlMi5kZWZhdWx0KSgoMCwgX2Jhc2VSZXN0Mi5kZWZhdWx0KShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0VGFzayhhcmdzKTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGFyZ3MucHVzaCh0YXNrQ2FsbGJhY2spO1xuXG4gICAgICAgIHZhciB0YXNrID0gdGFza3NbdGFza0luZGV4KytdO1xuICAgICAgICB0YXNrLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH1cblxuICAgIG5leHRUYXNrKFtdKTtcbn07XG5cbnZhciBfaXNBcnJheSA9IHJlcXVpcmUoJ2xvZGFzaC9pc0FycmF5Jyk7XG5cbnZhciBfaXNBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc0FycmF5KTtcblxudmFyIF9ub29wID0gcmVxdWlyZSgnbG9kYXNoL25vb3AnKTtcblxudmFyIF9ub29wMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25vb3ApO1xuXG52YXIgX29uY2UgPSByZXF1aXJlKCcuL2ludGVybmFsL29uY2UnKTtcblxudmFyIF9vbmNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX29uY2UpO1xuXG52YXIgX2Jhc2VSZXN0ID0gcmVxdWlyZSgnbG9kYXNoL19iYXNlUmVzdCcpO1xuXG52YXIgX2Jhc2VSZXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Jhc2VSZXN0KTtcblxudmFyIF9vbmx5T25jZSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvb25seU9uY2UnKTtcblxudmFyIF9vbmx5T25jZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vbmx5T25jZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKipcbiAqIFJ1bnMgdGhlIGB0YXNrc2AgYXJyYXkgb2YgZnVuY3Rpb25zIGluIHNlcmllcywgZWFjaCBwYXNzaW5nIHRoZWlyIHJlc3VsdHMgdG9cbiAqIHRoZSBuZXh0IGluIHRoZSBhcnJheS4gSG93ZXZlciwgaWYgYW55IG9mIHRoZSBgdGFza3NgIHBhc3MgYW4gZXJyb3IgdG8gdGhlaXJcbiAqIG93biBjYWxsYmFjaywgdGhlIG5leHQgZnVuY3Rpb24gaXMgbm90IGV4ZWN1dGVkLCBhbmQgdGhlIG1haW4gYGNhbGxiYWNrYCBpc1xuICogaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIGVycm9yLlxuICpcbiAqIEBuYW1lIHdhdGVyZmFsbFxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIG1vZHVsZTpDb250cm9sRmxvd1xuICogQG1ldGhvZFxuICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICogQHBhcmFtIHtBcnJheX0gdGFza3MgLSBBbiBhcnJheSBvZiBmdW5jdGlvbnMgdG8gcnVuLCBlYWNoIGZ1bmN0aW9uIGlzIHBhc3NlZFxuICogYSBgY2FsbGJhY2soZXJyLCByZXN1bHQxLCByZXN1bHQyLCAuLi4pYCBpdCBtdXN0IGNhbGwgb24gY29tcGxldGlvbi4gVGhlXG4gKiBmaXJzdCBhcmd1bWVudCBpcyBhbiBlcnJvciAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFueSBmdXJ0aGVyIGFyZ3VtZW50c1xuICogd2lsbCBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIGluIG9yZGVyIHRvIHRoZSBuZXh0IHRhc2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gcnVuIG9uY2UgYWxsIHRoZVxuICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBUaGlzIHdpbGwgYmUgcGFzc2VkIHRoZSByZXN1bHRzIG9mIHRoZSBsYXN0IHRhc2snc1xuICogY2FsbGJhY2suIEludm9rZWQgd2l0aCAoZXJyLCBbcmVzdWx0c10pLlxuICogQHJldHVybnMgdW5kZWZpbmVkXG4gKiBAZXhhbXBsZVxuICpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqICAgICB9LFxuICogICAgIGZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNhbGxiYWNrKSB7XG4gKiAgICAgICAgIC8vIGFyZzEgbm93IGVxdWFscyAnb25lJyBhbmQgYXJnMiBub3cgZXF1YWxzICd0d28nXG4gKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogICAgIH0sXG4gKiAgICAgZnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAgICAgLy8gYXJnMSBub3cgZXF1YWxzICd0aHJlZSdcbiAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAqICAgICB9XG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICpcbiAqIC8vIE9yLCB3aXRoIG5hbWVkIGZ1bmN0aW9uczpcbiAqIGFzeW5jLndhdGVyZmFsbChbXG4gKiAgICAgbXlGaXJzdEZ1bmN0aW9uLFxuICogICAgIG15U2Vjb25kRnVuY3Rpb24sXG4gKiAgICAgbXlMYXN0RnVuY3Rpb24sXG4gKiBdLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAqIH0pO1xuICogZnVuY3Rpb24gbXlGaXJzdEZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gKiAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAqIH1cbiAqIGZ1bmN0aW9uIG15U2Vjb25kRnVuY3Rpb24oYXJnMSwgYXJnMiwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICd0aHJlZScpO1xuICogfVxuICogZnVuY3Rpb24gbXlMYXN0RnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ3RocmVlJ1xuICogICAgIGNhbGxiYWNrKG51bGwsICdkb25lJyk7XG4gKiB9XG4gKi8iLCIvKiFcclxuICogRXZlbnRFbWl0dGVyMlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vaGlqMW54L0V2ZW50RW1pdHRlcjJcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDEzIGhpajFueFxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqL1xyXG47IWZ1bmN0aW9uKHVuZGVmaW5lZCkge1xyXG5cclxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gX2lzQXJyYXkob2JqKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIjtcclxuICB9O1xyXG4gIHZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIGlmICh0aGlzLl9jb25mKSB7XHJcbiAgICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIHRoaXMuX2NvbmYpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uZmlndXJlKGNvbmYpIHtcclxuICAgIGlmIChjb25mKSB7XHJcbiAgICAgIHRoaXMuX2NvbmYgPSBjb25mO1xyXG5cclxuICAgICAgY29uZi5kZWxpbWl0ZXIgJiYgKHRoaXMuZGVsaW1pdGVyID0gY29uZi5kZWxpbWl0ZXIpO1xyXG4gICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gY29uZi5tYXhMaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCA/IGNvbmYubWF4TGlzdGVuZXJzIDogZGVmYXVsdE1heExpc3RlbmVycztcclxuICAgICAgY29uZi53aWxkY2FyZCAmJiAodGhpcy53aWxkY2FyZCA9IGNvbmYud2lsZGNhcmQpO1xyXG4gICAgICBjb25mLm5ld0xpc3RlbmVyICYmICh0aGlzLm5ld0xpc3RlbmVyID0gY29uZi5uZXdMaXN0ZW5lcik7XHJcbiAgICAgIGNvbmYudmVyYm9zZU1lbW9yeUxlYWsgJiYgKHRoaXMudmVyYm9zZU1lbW9yeUxlYWsgPSBjb25mLnZlcmJvc2VNZW1vcnlMZWFrKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lclRyZWUgPSB7fTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBsb2dQb3NzaWJsZU1lbW9yeUxlYWsoY291bnQsIGV2ZW50TmFtZSkge1xyXG4gICAgdmFyIGVycm9yTXNnID0gJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xyXG4gICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xyXG4gICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nO1xyXG5cclxuICAgIGlmKHRoaXMudmVyYm9zZU1lbW9yeUxlYWspe1xyXG4gICAgICBlcnJvck1zZyArPSAnIEV2ZW50IG5hbWU6ICVzLic7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGNvdW50LCBldmVudE5hbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvck1zZywgY291bnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb25zb2xlLnRyYWNlKXtcclxuICAgICAgY29uc29sZS50cmFjZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKGNvbmYpIHtcclxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xyXG4gICAgdGhpcy5uZXdMaXN0ZW5lciA9IGZhbHNlO1xyXG4gICAgdGhpcy52ZXJib3NlTWVtb3J5TGVhayA9IGZhbHNlO1xyXG4gICAgY29uZmlndXJlLmNhbGwodGhpcywgY29uZik7XHJcbiAgfVxyXG4gIEV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyOyAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBmb3IgZXhwb3J0aW5nIEV2ZW50RW1pdHRlciBwcm9wZXJ0eVxyXG5cclxuICAvL1xyXG4gIC8vIEF0dGVudGlvbiwgZnVuY3Rpb24gcmV0dXJuIHR5cGUgbm93IGlzIGFycmF5LCBhbHdheXMgIVxyXG4gIC8vIEl0IGhhcyB6ZXJvIGVsZW1lbnRzIGlmIG5vIGFueSBtYXRjaGVzIGZvdW5kIGFuZCBvbmUgb3IgbW9yZVxyXG4gIC8vIGVsZW1lbnRzIChsZWFmcykgaWYgdGhlcmUgYXJlIG1hdGNoZXNcclxuICAvL1xyXG4gIGZ1bmN0aW9uIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgaSkge1xyXG4gICAgaWYgKCF0cmVlKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHZhciBsaXN0ZW5lcnM9W10sIGxlYWYsIGxlbiwgYnJhbmNoLCB4VHJlZSwgeHhUcmVlLCBpc29sYXRlZEJyYW5jaCwgZW5kUmVhY2hlZCxcclxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZS5sZW5ndGgsIGN1cnJlbnRUeXBlID0gdHlwZVtpXSwgbmV4dFR5cGUgPSB0eXBlW2krMV07XHJcbiAgICBpZiAoaSA9PT0gdHlwZUxlbmd0aCAmJiB0cmVlLl9saXN0ZW5lcnMpIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgYXQgdGhlIGVuZCBvZiB0aGUgZXZlbnQocykgbGlzdCBhbmQgdGhlIHRyZWUgaGFzIGxpc3RlbmVyc1xyXG4gICAgICAvLyBpbnZva2UgdGhvc2UgbGlzdGVuZXJzLlxyXG4gICAgICAvL1xyXG4gICAgICBpZiAodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzKTtcclxuICAgICAgICByZXR1cm4gW3RyZWVdO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAobGVhZiA9IDAsIGxlbiA9IHRyZWUuX2xpc3RlbmVycy5sZW5ndGg7IGxlYWYgPCBsZW47IGxlYWYrKykge1xyXG4gICAgICAgICAgaGFuZGxlcnMgJiYgaGFuZGxlcnMucHVzaCh0cmVlLl9saXN0ZW5lcnNbbGVhZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3RyZWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChjdXJyZW50VHlwZSA9PT0gJyonIHx8IGN1cnJlbnRUeXBlID09PSAnKionKSB8fCB0cmVlW2N1cnJlbnRUeXBlXSkge1xyXG4gICAgICAvL1xyXG4gICAgICAvLyBJZiB0aGUgZXZlbnQgZW1pdHRlZCBpcyAnKicgYXQgdGhpcyBwYXJ0XHJcbiAgICAgIC8vIG9yIHRoZXJlIGlzIGEgY29uY3JldGUgbWF0Y2ggYXQgdGhpcyBwYXRjaFxyXG4gICAgICAvL1xyXG4gICAgICBpZiAoY3VycmVudFR5cGUgPT09ICcqJykge1xyXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcclxuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsxKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICAgIH0gZWxzZSBpZihjdXJyZW50VHlwZSA9PT0gJyoqJykge1xyXG4gICAgICAgIGVuZFJlYWNoZWQgPSAoaSsxID09PSB0eXBlTGVuZ3RoIHx8IChpKzIgPT09IHR5cGVMZW5ndGggJiYgbmV4dFR5cGUgPT09ICcqJykpO1xyXG4gICAgICAgIGlmKGVuZFJlYWNoZWQgJiYgdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAvLyBUaGUgbmV4dCBlbGVtZW50IGhhcyBhIF9saXN0ZW5lcnMsIGFkZCBpdCB0byB0aGUgaGFuZGxlcnMuXHJcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgdHlwZUxlbmd0aCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChicmFuY2ggaW4gdHJlZSkge1xyXG4gICAgICAgICAgaWYgKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHRyZWUuaGFzT3duUHJvcGVydHkoYnJhbmNoKSkge1xyXG4gICAgICAgICAgICBpZihicmFuY2ggPT09ICcqJyB8fCBicmFuY2ggPT09ICcqKicpIHtcclxuICAgICAgICAgICAgICBpZih0cmVlW2JyYW5jaF0uX2xpc3RlbmVycyAmJiAhZW5kUmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgdHlwZUxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IG5leHRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsyKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gTm8gbWF0Y2ggb24gdGhpcyBvbmUsIHNoaWZ0IGludG8gdGhlIHRyZWUgYnV0IG5vdCBpbiB0aGUgdHlwZSBhcnJheS5cclxuICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVticmFuY2hdLCBpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgICAgfVxyXG5cclxuICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbY3VycmVudFR5cGVdLCBpKzEpKTtcclxuICAgIH1cclxuXHJcbiAgICB4VHJlZSA9IHRyZWVbJyonXTtcclxuICAgIGlmICh4VHJlZSkge1xyXG4gICAgICAvL1xyXG4gICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgdHJlZSB3aWxsIGFsbG93IGFueSBtYXRjaCBmb3IgdGhpcyBwYXJ0LFxyXG4gICAgICAvLyB0aGVuIHJlY3Vyc2l2ZWx5IGV4cGxvcmUgYWxsIGJyYW5jaGVzIG9mIHRoZSB0cmVlXHJcbiAgICAgIC8vXHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeFRyZWUsIGkrMSk7XHJcbiAgICB9XHJcblxyXG4gICAgeHhUcmVlID0gdHJlZVsnKionXTtcclxuICAgIGlmKHh4VHJlZSkge1xyXG4gICAgICBpZihpIDwgdHlwZUxlbmd0aCkge1xyXG4gICAgICAgIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbGlzdGVuZXIgb24gYSAnKionLCBpdCB3aWxsIGNhdGNoIGFsbCwgc28gYWRkIGl0cyBoYW5kbGVyLlxyXG4gICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgYXJyYXlzIG9mIG1hdGNoaW5nIG5leHQgYnJhbmNoZXMgYW5kIG90aGVycy5cclxuICAgICAgICBmb3IoYnJhbmNoIGluIHh4VHJlZSkge1xyXG4gICAgICAgICAgaWYoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgeHhUcmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xyXG4gICAgICAgICAgICAgIC8vIFdlIGtub3cgdGhlIG5leHQgZWxlbWVudCB3aWxsIG1hdGNoLCBzbyBqdW1wIHR3aWNlLlxyXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlW2JyYW5jaF0sIGkrMik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IGN1cnJlbnRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgLy8gQ3VycmVudCBub2RlIG1hdGNoZXMsIG1vdmUgaW50byB0aGUgdHJlZS5cclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoID0ge307XHJcbiAgICAgICAgICAgICAgaXNvbGF0ZWRCcmFuY2hbYnJhbmNoXSA9IHh4VHJlZVticmFuY2hdO1xyXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeyAnKionOiBpc29sYXRlZEJyYW5jaCB9LCBpKzEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYoeHhUcmVlLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICAvLyBXZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBhbmQgc3RpbGwgb24gYSAnKionXHJcbiAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWUsIHR5cGVMZW5ndGgpO1xyXG4gICAgICB9IGVsc2UgaWYoeHhUcmVlWycqJ10gJiYgeHhUcmVlWycqJ10uX2xpc3RlbmVycykge1xyXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlWycqJ10sIHR5cGVMZW5ndGgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGxpc3RlbmVycztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdyb3dMaXN0ZW5lclRyZWUodHlwZSwgbGlzdGVuZXIpIHtcclxuXHJcbiAgICB0eXBlID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcblxyXG4gICAgLy9cclxuICAgIC8vIExvb2tzIGZvciB0d28gY29uc2VjdXRpdmUgJyoqJywgaWYgc28sIGRvbid0IGFkZCB0aGUgZXZlbnQgYXQgYWxsLlxyXG4gICAgLy9cclxuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IHR5cGUubGVuZ3RoOyBpKzEgPCBsZW47IGkrKykge1xyXG4gICAgICBpZih0eXBlW2ldID09PSAnKionICYmIHR5cGVbaSsxXSA9PT0gJyoqJykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0cmVlID0gdGhpcy5saXN0ZW5lclRyZWU7XHJcbiAgICB2YXIgbmFtZSA9IHR5cGUuc2hpZnQoKTtcclxuXHJcbiAgICB3aGlsZSAobmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICBpZiAoIXRyZWVbbmFtZV0pIHtcclxuICAgICAgICB0cmVlW25hbWVdID0ge307XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyZWUgPSB0cmVlW25hbWVdO1xyXG5cclxuICAgICAgaWYgKHR5cGUubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgIGlmICghdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBsaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMgPSBbdHJlZS5fbGlzdGVuZXJzXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAhdHJlZS5fbGlzdGVuZXJzLndhcm5lZCAmJlxyXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID4gMCAmJlxyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoID4gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVyc1xyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRyZWUuX2xpc3RlbmVycy53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBsb2dQb3NzaWJsZU1lbW9yeUxlYWsuY2FsbCh0aGlzLCB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoLCBuYW1lKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgbmFtZSA9IHR5cGUuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhblxyXG4gIC8vIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaFxyXG4gIC8vIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxyXG4gIC8vXHJcbiAgLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXHJcbiAgLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZGVsaW1pdGVyID0gJy4nO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcclxuICAgIGlmIChuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IG47XHJcbiAgICAgIGlmICghdGhpcy5fY29uZikgdGhpcy5fY29uZiA9IHt9O1xyXG4gICAgICB0aGlzLl9jb25mLm1heExpc3RlbmVycyA9IG47XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudCA9ICcnO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pIHtcclxuICAgIHRoaXMubWFueShldmVudCwgMSwgZm4pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5tYW55ID0gZnVuY3Rpb24oZXZlbnQsIHR0bCwgZm4pIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XHJcbiAgICAgIGlmICgtLXR0bCA9PT0gMCkge1xyXG4gICAgICAgIHNlbGYub2ZmKGV2ZW50LCBsaXN0ZW5lcik7XHJcbiAgICAgIH1cclxuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5lci5fb3JpZ2luID0gZm47XHJcblxyXG4gICAgdGhpcy5vbihldmVudCwgbGlzdGVuZXIpO1xyXG5cclxuICAgIHJldHVybiBzZWxmO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgaWYgKCF0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgYWwgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgdmFyIGFyZ3MsbCxpLGo7XHJcbiAgICB2YXIgaGFuZGxlcjtcclxuXHJcbiAgICBpZiAodGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGgpIHtcclxuICAgICAgaGFuZGxlciA9IHRoaXMuX2FsbC5zbGljZSgpO1xyXG4gICAgICBpZiAoYWwgPiAzKSB7XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCk7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGFsOyBqKyspIGFyZ3Nbal0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBoYW5kbGVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzLCB0eXBlLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICBoYW5kbGVyID0gW107XHJcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVyLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsIC0gMSk7XHJcbiAgICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIGlmIChoYW5kbGVyKSB7XHJcbiAgICAgICAgLy8gbmVlZCB0byBtYWtlIGNvcHkgb2YgaGFuZGxlcnMgYmVjYXVzZSBsaXN0IGNhbiBjaGFuZ2UgaW4gdGhlIG1pZGRsZVxyXG4gICAgICAgIC8vIG9mIGVtaXQgY2FsbFxyXG4gICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLmxlbmd0aCkge1xyXG4gICAgICBpZiAoYWwgPiAzKSB7XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gaGFuZGxlci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fYWxsICYmIHR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICEhdGhpcy5fYWxsO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdEFzeW5jID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1swXTtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ25ld0xpc3RlbmVyJyAmJiAhdGhpcy5uZXdMaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUoW2ZhbHNlXSk7IH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcHJvbWlzZXM9IFtdO1xyXG5cclxuICAgIHZhciBhbCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICB2YXIgYXJncyxsLGksajtcclxuICAgIHZhciBoYW5kbGVyO1xyXG5cclxuICAgIGlmICh0aGlzLl9hbGwpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2pdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLl9hbGwubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLl9hbGxbaV0uY2FsbCh0aGlzLCB0eXBlLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5hcHBseSh0aGlzLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgaGFuZGxlciA9IFtdO1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgIGZvciAoaiA9IDE7IGogPCBhbDsgaisrKSBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5sZW5ndGgpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChpID0gMCwgbCA9IGhhbmRsZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyW2ldLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fYWxsICYmIHR5cGUgPT09ICdlcnJvcicpIHtcclxuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGFyZ3VtZW50c1sxXSk7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiVW5jYXVnaHQsIHVuc3BlY2lmaWVkICdlcnJvcicgZXZlbnQuXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcclxuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLm9uQW55KHR5cGUpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignb24gb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09IFwibmV3TGlzdGVuZXJzXCIhIEJlZm9yZVxyXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lcnNcIi5cclxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgZ3Jvd0xpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHtcclxuICAgICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXHJcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fZXZlbnRzW3R5cGVdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gQ2hhbmdlIHRvIGFycmF5LlxyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXHJcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXHJcbiAgICAgIGlmIChcclxuICAgICAgICAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPiAwICYmXHJcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnNcclxuICAgICAgKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XHJcbiAgICAgICAgbG9nUG9zc2libGVNZW1vcnlMZWFrLmNhbGwodGhpcywgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCwgdHlwZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uQW55ID0gZnVuY3Rpb24oZm4pIHtcclxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvbkFueSBvbmx5IGFjY2VwdHMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9hbGwpIHtcclxuICAgICAgdGhpcy5fYWxsID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBmdW5jdGlvbiB0byB0aGUgZXZlbnQgbGlzdGVuZXIgY29sbGVjdGlvbi5cclxuICAgIHRoaXMuX2FsbC5wdXNoKGZuKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFuZGxlcnMsbGVhZnM9W107XHJcblxyXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgbGVhZnMgPSBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBudWxsLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxyXG4gICAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICBsZWFmcy5wdXNoKHtfbGlzdGVuZXJzOmhhbmRsZXJzfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaUxlYWY9MDsgaUxlYWY8bGVhZnMubGVuZ3RoOyBpTGVhZisrKSB7XHJcbiAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xyXG4gICAgICBoYW5kbGVycyA9IGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgaWYgKGlzQXJyYXkoaGFuZGxlcnMpKSB7XHJcblxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IC0xO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChoYW5kbGVyc1tpXSA9PT0gbGlzdGVuZXIgfHxcclxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLmxpc3RlbmVyICYmIGhhbmRsZXJzW2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikgfHxcclxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLl9vcmlnaW4gJiYgaGFuZGxlcnNbaV0uX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgIGxlYWYuX2xpc3RlbmVycy5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgICAgICBkZWxldGUgbGVhZi5fbGlzdGVuZXJzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lclwiLCB0eXBlLCBsaXN0ZW5lcik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGhhbmRsZXJzID09PSBsaXN0ZW5lciB8fFxyXG4gICAgICAgIChoYW5kbGVycy5saXN0ZW5lciAmJiBoYW5kbGVycy5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XHJcbiAgICAgICAgKGhhbmRsZXJzLl9vcmlnaW4gJiYgaGFuZGxlcnMuX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XHJcbiAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlTGlzdGVuZXJcIiwgdHlwZSwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVjdXJzaXZlbHlHYXJiYWdlQ29sbGVjdChyb290KSB7XHJcbiAgICAgIGlmIChyb290ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb290KTtcclxuICAgICAgZm9yICh2YXIgaSBpbiBrZXlzKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIG9iaiA9IHJvb3Rba2V5XTtcclxuICAgICAgICBpZiAoKG9iaiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB8fCAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikgfHwgKG9iaiA9PT0gbnVsbCkpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICByZWN1cnNpdmVseUdhcmJhZ2VDb2xsZWN0KHJvb3Rba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgZGVsZXRlIHJvb3Rba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlY3Vyc2l2ZWx5R2FyYmFnZUNvbGxlY3QodGhpcy5saXN0ZW5lclRyZWUpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmQW55ID0gZnVuY3Rpb24oZm4pIHtcclxuICAgIHZhciBpID0gMCwgbCA9IDAsIGZucztcclxuICAgIGlmIChmbiAmJiB0aGlzLl9hbGwgJiYgdGhpcy5fYWxsLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm5zID0gdGhpcy5fYWxsO1xyXG4gICAgICBmb3IoaSA9IDAsIGwgPSBmbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYoZm4gPT09IGZuc1tpXSkge1xyXG4gICAgICAgICAgZm5zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyQW55XCIsIGZuKTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm5zID0gdGhpcy5fYWxsO1xyXG4gICAgICBmb3IoaSA9IDAsIGwgPSBmbnMubGVuZ3RoOyBpIDwgbDsgaSsrKVxyXG4gICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyQW55XCIsIGZuc1tpXSk7XHJcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmO1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICF0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgdmFyIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xyXG4gICAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xyXG4gICAgICAgIGxlYWYuX2xpc3RlbmVycyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50cykge1xyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICB2YXIgaGFuZGxlcnMgPSBbXTtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXJzLCBucywgdGhpcy5saXN0ZW5lclRyZWUsIDApO1xyXG4gICAgICByZXR1cm4gaGFuZGxlcnM7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gW107XHJcbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyc0FueSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmKHRoaXMuX2FsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fYWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cclxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAvLyBDb21tb25KU1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gQnJvd3NlciBnbG9iYWwuXHJcbiAgICB3aW5kb3cuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcclxuICB9XHJcbn0oKTtcclxuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgdmFsdWUgPSBPYmplY3QodmFsdWUpO1xuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIHZhbHVlKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuIiwidmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eScpLFxuICAgIG92ZXJSZXN0ID0gcmVxdWlyZSgnLi9fb3ZlclJlc3QnKSxcbiAgICBzZXRUb1N0cmluZyA9IHJlcXVpcmUoJy4vX3NldFRvU3RyaW5nJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVzdGAgd2hpY2ggZG9lc24ndCB2YWxpZGF0ZSBvciBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VSZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCBzdGFydCwgaWRlbnRpdHkpLCBmdW5jICsgJycpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VSZXN0O1xuIiwidmFyIGNvbnN0YW50ID0gcmVxdWlyZSgnLi9jb25zdGFudCcpLFxuICAgIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVNldFRvU3RyaW5nO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZUpzRGF0YTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lUHJvcGVydHk7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlclJlc3Q7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgYmFzZVNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fYmFzZVNldFRvU3RyaW5nJyksXG4gICAgc2hvcnRPdXQgPSByZXF1aXJlKCcuL19zaG9ydE91dCcpO1xuXG4vKipcbiAqIFNldHMgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIG9mIGBmdW5jYCB0byByZXR1cm4gYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgc2V0VG9TdHJpbmcgPSBzaG9ydE91dChiYXNlU2V0VG9TdHJpbmcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvU3RyaW5nO1xuIiwiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3J0T3V0O1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHMpO1xuICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0c1swXSA9PT0gb2JqZWN0c1sxXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29uc3RhbnQ7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8ubm9vcCk7XG4gKiAvLyA9PiBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gKi9cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIC8vIE5vIG9wZXJhdGlvbiBwZXJmb3JtZWQuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIiFmdW5jdGlvbihlLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLHQpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuUHViTnViPXQoKTplLlB1Yk51Yj10KCl9KHRoaXMsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChyKXtpZihuW3JdKXJldHVybiBuW3JdLmV4cG9ydHM7dmFyIGk9bltyXT17ZXhwb3J0czp7fSxpZDpyLGxvYWRlZDohMX07cmV0dXJuIGVbcl0uY2FsbChpLmV4cG9ydHMsaSxpLmV4cG9ydHMsdCksaS5sb2FkZWQ9ITAsaS5leHBvcnRzfXZhciBuPXt9O3JldHVybiB0Lm09ZSx0LmM9bix0LnA9XCJcIix0KDApfShbZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIHMoZSx0KXtpZighZSl0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7cmV0dXJuIXR8fFwib2JqZWN0XCIhPXR5cGVvZiB0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiB0P2U6dH1mdW5jdGlvbiBvKGUsdCl7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCYmbnVsbCE9PXQpdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIrdHlwZW9mIHQpO2UucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodCYmdC5wcm90b3R5cGUse2NvbnN0cnVjdG9yOnt2YWx1ZTplLGVudW1lcmFibGU6ITEsd3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiEwfX0pLHQmJihPYmplY3Quc2V0UHJvdG90eXBlT2Y/T2JqZWN0LnNldFByb3RvdHlwZU9mKGUsdCk6ZS5fX3Byb3RvX189dCl9ZnVuY3Rpb24gYShlKXtpZighbmF2aWdhdG9yfHwhbmF2aWdhdG9yLnNlbmRCZWFjb24pcmV0dXJuITE7bmF2aWdhdG9yLnNlbmRCZWFjb24oZSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHU9bigxKSxjPXIodSksbD1uKDQwKSxoPXIobCksZj1uKDQxKSxkPXIoZikscD1uKDQyKSxnPShuKDgpLGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSl7aSh0aGlzLHQpO3ZhciBuPWUubGlzdGVuVG9Ccm93c2VyTmV0d29ya0V2ZW50cyxyPXZvaWQgMD09PW58fG47ZS5kYj1kLmRlZmF1bHQsZS5zZGtGYW1pbHk9XCJXZWJcIixlLm5ldHdvcmtpbmc9bmV3IGguZGVmYXVsdCh7Z2V0OnAuZ2V0LHBvc3Q6cC5wb3N0LHNlbmRCZWFjb246YX0pO3ZhciBvPXModGhpcywodC5fX3Byb3RvX198fE9iamVjdC5nZXRQcm90b3R5cGVPZih0KSkuY2FsbCh0aGlzLGUpKTtyZXR1cm4gciYmKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib2ZmbGluZVwiLGZ1bmN0aW9uKCl7by5uZXR3b3JrRG93bkRldGVjdGVkKCl9KSx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9ubGluZVwiLGZ1bmN0aW9uKCl7by5uZXR3b3JrVXBEZXRlY3RlZCgpfSkpLG99cmV0dXJuIG8odCxlKSx0fShjLmRlZmF1bHQpKTt0LmRlZmF1bHQ9ZyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtpZihlJiZlLl9fZXNNb2R1bGUpcmV0dXJuIGU7dmFyIHQ9e307aWYobnVsbCE9ZSlmb3IodmFyIG4gaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxuKSYmKHRbbl09ZVtuXSk7cmV0dXJuIHQuZGVmYXVsdD1lLHR9ZnVuY3Rpb24gaShlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gcyhlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxhPW4oMiksdT1pKGEpLGM9big3KSxsPWkoYyksaD1uKDkpLGY9aShoKSxkPW4oMTEpLHA9aShkKSxnPW4oMTIpLHk9aShnKSx2PW4oMTgpLGI9aSh2KSxfPW4oMTkpLG09cihfKSxrPW4oMjApLFA9cihrKSxTPW4oMjEpLE89cihTKSx3PW4oMjIpLFQ9cih3KSxDPW4oMjMpLE09cihDKSxFPW4oMjQpLHg9cihFKSxOPW4oMjUpLFI9cihOKSxLPW4oMjYpLEE9cihLKSxqPW4oMjcpLEQ9cihqKSxHPW4oMjgpLFU9cihHKSxCPW4oMjkpLEk9cihCKSxIPW4oMzApLEw9cihIKSxxPW4oMzEpLEY9cihxKSx6PW4oMzIpLFg9cih6KSxXPW4oMzMpLFY9cihXKSxKPW4oMzQpLCQ9cihKKSxRPW4oMzUpLFk9cihRKSxaPW4oMzYpLGVlPXIoWiksdGU9bigzNyksbmU9cih0ZSkscmU9bigzOCksaWU9cihyZSksc2U9bigxNSksb2U9cihzZSksYWU9bigzOSksdWU9cihhZSksY2U9bigxNiksbGU9aShjZSksaGU9bigxMyksZmU9aShoZSksZGU9KG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXRoaXM7cyh0aGlzLGUpO3ZhciByPXQuZGIsaT10Lm5ldHdvcmtpbmcsbz10aGlzLl9jb25maWc9bmV3IGwuZGVmYXVsdCh7c2V0dXA6dCxkYjpyfSksYT1uZXcgZi5kZWZhdWx0KHtjb25maWc6b30pO2kuaW5pdChvKTt2YXIgdT17Y29uZmlnOm8sbmV0d29ya2luZzppLGNyeXB0bzphfSxjPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxvZSksaD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsVSksZD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsTCksZz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsWCksdj1iLmRlZmF1bHQuYmluZCh0aGlzLHUsdWUpLF89dGhpcy5fbGlzdGVuZXJNYW5hZ2VyPW5ldyB5LmRlZmF1bHQsaz1uZXcgcC5kZWZhdWx0KHt0aW1lRW5kcG9pbnQ6YyxsZWF2ZUVuZHBvaW50OmgsaGVhcnRiZWF0RW5kcG9pbnQ6ZCxzZXRTdGF0ZUVuZHBvaW50Omcsc3Vic2NyaWJlRW5kcG9pbnQ6dixjcnlwdG86dS5jcnlwdG8sY29uZmlnOnUuY29uZmlnLGxpc3RlbmVyTWFuYWdlcjpffSk7dGhpcy5hZGRMaXN0ZW5lcj1fLmFkZExpc3RlbmVyLmJpbmQoXyksdGhpcy5yZW1vdmVMaXN0ZW5lcj1fLnJlbW92ZUxpc3RlbmVyLmJpbmQoXyksdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnM9Xy5yZW1vdmVBbGxMaXN0ZW5lcnMuYmluZChfKSx0aGlzLmNoYW5uZWxHcm91cHM9e2xpc3RHcm91cHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFQpLGxpc3RDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsTSksYWRkQ2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LG0pLHJlbW92ZUNoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxQKSxkZWxldGVHcm91cDpiLmRlZmF1bHQuYmluZCh0aGlzLHUsTyl9LHRoaXMucHVzaD17YWRkQ2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHgpLHJlbW92ZUNoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxSKSxkZWxldGVEZXZpY2U6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEQpLGxpc3RDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsQSl9LHRoaXMuaGVyZU5vdz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsViksdGhpcy53aGVyZU5vdz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsSSksdGhpcy5nZXRTdGF0ZT1iLmRlZmF1bHQuYmluZCh0aGlzLHUsRiksdGhpcy5zZXRTdGF0ZT1rLmFkYXB0U3RhdGVDaGFuZ2UuYmluZChrKSx0aGlzLmdyYW50PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxZKSx0aGlzLmF1ZGl0PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSwkKSx0aGlzLnB1Ymxpc2g9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LGVlKSx0aGlzLmZpcmU9ZnVuY3Rpb24oZSx0KXtlLnJlcGxpY2F0ZT0hMSxlLnN0b3JlSW5IaXN0b3J5PSExLG4ucHVibGlzaChlLHQpfSx0aGlzLmhpc3Rvcnk9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LG5lKSx0aGlzLmZldGNoTWVzc2FnZXM9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LGllKSx0aGlzLnRpbWU9Yyx0aGlzLnN1YnNjcmliZT1rLmFkYXB0U3Vic2NyaWJlQ2hhbmdlLmJpbmQoayksdGhpcy51bnN1YnNjcmliZT1rLmFkYXB0VW5zdWJzY3JpYmVDaGFuZ2UuYmluZChrKSx0aGlzLmRpc2Nvbm5lY3Q9ay5kaXNjb25uZWN0LmJpbmQoayksdGhpcy5yZWNvbm5lY3Q9ay5yZWNvbm5lY3QuYmluZChrKSx0aGlzLmRlc3Ryb3k9ZnVuY3Rpb24oZSl7ay51bnN1YnNjcmliZUFsbChlKSxrLmRpc2Nvbm5lY3QoKX0sdGhpcy5zdG9wPXRoaXMuZGVzdHJveSx0aGlzLnVuc3Vic2NyaWJlQWxsPWsudW5zdWJzY3JpYmVBbGwuYmluZChrKSx0aGlzLmdldFN1YnNjcmliZWRDaGFubmVscz1rLmdldFN1YnNjcmliZWRDaGFubmVscy5iaW5kKGspLHRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHM9ay5nZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwcy5iaW5kKGspLHRoaXMuZW5jcnlwdD1hLmVuY3J5cHQuYmluZChhKSx0aGlzLmRlY3J5cHQ9YS5kZWNyeXB0LmJpbmQoYSksdGhpcy5nZXRBdXRoS2V5PXUuY29uZmlnLmdldEF1dGhLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRBdXRoS2V5PXUuY29uZmlnLnNldEF1dGhLZXkuYmluZCh1LmNvbmZpZyksdGhpcy5zZXRDaXBoZXJLZXk9dS5jb25maWcuc2V0Q2lwaGVyS2V5LmJpbmQodS5jb25maWcpLHRoaXMuZ2V0VVVJRD11LmNvbmZpZy5nZXRVVUlELmJpbmQodS5jb25maWcpLHRoaXMuc2V0VVVJRD11LmNvbmZpZy5zZXRVVUlELmJpbmQodS5jb25maWcpLHRoaXMuZ2V0RmlsdGVyRXhwcmVzc2lvbj11LmNvbmZpZy5nZXRGaWx0ZXJFeHByZXNzaW9uLmJpbmQodS5jb25maWcpLHRoaXMuc2V0RmlsdGVyRXhwcmVzc2lvbj11LmNvbmZpZy5zZXRGaWx0ZXJFeHByZXNzaW9uLmJpbmQodS5jb25maWcpfXJldHVybiBvKGUsW3trZXk6XCJnZXRWZXJzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY29uZmlnLmdldFZlcnNpb24oKX19LHtrZXk6XCJuZXR3b3JrRG93bkRldGVjdGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrRG93bigpLHRoaXMuX2NvbmZpZy5yZXN0b3JlP3RoaXMuZGlzY29ubmVjdCgpOnRoaXMuZGVzdHJveSghMCl9fSx7a2V5OlwibmV0d29ya1VwRGV0ZWN0ZWRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU5ldHdvcmtVcCgpLHRoaXMucmVjb25uZWN0KCl9fV0sW3trZXk6XCJnZW5lcmF0ZVVVSURcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB1LmRlZmF1bHQudjQoKX19XSksZX0oKSk7ZGUuT1BFUkFUSU9OUz1sZS5kZWZhdWx0LGRlLkNBVEVHT1JJRVM9ZmUuZGVmYXVsdCx0LmRlZmF1bHQ9ZGUsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe3ZhciByPW4oMyksaT1uKDYpLHM9aTtzLnYxPXIscy52ND1pLGUuZXhwb3J0cz1zfSxmdW5jdGlvbihlLHQsbil7ZnVuY3Rpb24gcihlLHQsbil7dmFyIHI9dCYmbnx8MCxpPXR8fFtdO2U9ZXx8e307dmFyIG89dm9pZCAwIT09ZS5jbG9ja3NlcT9lLmNsb2Nrc2VxOnUsaD12b2lkIDAhPT1lLm1zZWNzP2UubXNlY3M6KG5ldyBEYXRlKS5nZXRUaW1lKCksZj12b2lkIDAhPT1lLm5zZWNzP2UubnNlY3M6bCsxLGQ9aC1jKyhmLWwpLzFlNDtpZihkPDAmJnZvaWQgMD09PWUuY2xvY2tzZXEmJihvPW8rMSYxNjM4MyksKGQ8MHx8aD5jKSYmdm9pZCAwPT09ZS5uc2VjcyYmKGY9MCksZj49MWU0KXRocm93IG5ldyBFcnJvcihcInV1aWQudjEoKTogQ2FuJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjXCIpO2M9aCxsPWYsdT1vLGgrPTEyMjE5MjkyOGU1O3ZhciBwPSgxZTQqKDI2ODQzNTQ1NSZoKStmKSU0Mjk0OTY3Mjk2O2lbcisrXT1wPj4+MjQmMjU1LGlbcisrXT1wPj4+MTYmMjU1LGlbcisrXT1wPj4+OCYyNTUsaVtyKytdPTI1NSZwO3ZhciBnPWgvNDI5NDk2NzI5NioxZTQmMjY4NDM1NDU1O2lbcisrXT1nPj4+OCYyNTUsaVtyKytdPTI1NSZnLGlbcisrXT1nPj4+MjQmMTV8MTYsaVtyKytdPWc+Pj4xNiYyNTUsaVtyKytdPW8+Pj44fDEyOCxpW3IrK109MjU1Jm87Zm9yKHZhciB5PWUubm9kZXx8YSx2PTA7djw2OysrdilpW3Irdl09eVt2XTtyZXR1cm4gdHx8cyhpKX12YXIgaT1uKDQpLHM9big1KSxvPWkoKSxhPVsxfG9bMF0sb1sxXSxvWzJdLG9bM10sb1s0XSxvWzVdXSx1PTE2MzgzJihvWzZdPDw4fG9bN10pLGM9MCxsPTA7ZS5leHBvcnRzPXJ9LGZ1bmN0aW9uKGUsdCl7KGZ1bmN0aW9uKHQpe3ZhciBuLHI9dC5jcnlwdG98fHQubXNDcnlwdG87aWYociYmci5nZXRSYW5kb21WYWx1ZXMpe3ZhciBpPW5ldyBVaW50OEFycmF5KDE2KTtuPWZ1bmN0aW9uKCl7cmV0dXJuIHIuZ2V0UmFuZG9tVmFsdWVzKGkpLGl9fWlmKCFuKXt2YXIgcz1uZXcgQXJyYXkoMTYpO249ZnVuY3Rpb24oKXtmb3IodmFyIGUsdD0wO3Q8MTY7dCsrKTA9PSgzJnQpJiYoZT00Mjk0OTY3Mjk2Kk1hdGgucmFuZG9tKCkpLHNbdF09ZT4+PigoMyZ0KTw8MykmMjU1O3JldHVybiBzfX1lLmV4cG9ydHM9bn0pLmNhbGwodCxmdW5jdGlvbigpe3JldHVybiB0aGlzfSgpKX0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUsdCl7dmFyIG49dHx8MCxpPXI7cmV0dXJuIGlbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXX1mb3IodmFyIHI9W10saT0wO2k8MjU2OysraSlyW2ldPShpKzI1NikudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtlLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSx0LG4pe3ZhciByPXQmJm58fDA7XCJzdHJpbmdcIj09dHlwZW9mIGUmJih0PVwiYmluYXJ5XCI9PWU/bmV3IEFycmF5KDE2KTpudWxsLGU9bnVsbCksZT1lfHx7fTt2YXIgbz1lLnJhbmRvbXx8KGUucm5nfHxpKSgpO2lmKG9bNl09MTUmb1s2XXw2NCxvWzhdPTYzJm9bOF18MTI4LHQpZm9yKHZhciBhPTA7YTwxNjsrK2EpdFtyK2FdPW9bYV07cmV0dXJuIHR8fHMobyl9dmFyIGk9big0KSxzPW4oNSk7ZS5leHBvcnRzPXJ9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLHM9bigyKSxvPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0ocyksYT0obig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC5zZXR1cCxpPXQuZGI7cih0aGlzLGUpLHRoaXMuX2RiPWksdGhpcy5pbnN0YW5jZUlkPVwicG4tXCIrby5kZWZhdWx0LnY0KCksdGhpcy5zZWNyZXRLZXk9bi5zZWNyZXRLZXl8fG4uc2VjcmV0X2tleSx0aGlzLnN1YnNjcmliZUtleT1uLnN1YnNjcmliZUtleXx8bi5zdWJzY3JpYmVfa2V5LHRoaXMucHVibGlzaEtleT1uLnB1Ymxpc2hLZXl8fG4ucHVibGlzaF9rZXksdGhpcy5zZGtGYW1pbHk9bi5zZGtGYW1pbHksdGhpcy5wYXJ0bmVySWQ9bi5wYXJ0bmVySWQsdGhpcy5zZXRBdXRoS2V5KG4uYXV0aEtleSksdGhpcy5zZXRDaXBoZXJLZXkobi5jaXBoZXJLZXkpLHRoaXMuc2V0RmlsdGVyRXhwcmVzc2lvbihuLmZpbHRlckV4cHJlc3Npb24pLHRoaXMub3JpZ2luPW4ub3JpZ2lufHxcInB1YnN1Yi5wdWJudWIuY29tXCIsdGhpcy5zZWN1cmU9bi5zc2x8fCExLHRoaXMucmVzdG9yZT1uLnJlc3RvcmV8fCExLHRoaXMucHJveHk9bi5wcm94eSx0aGlzLmtlZXBBbGl2ZT1uLmtlZXBBbGl2ZSx0aGlzLmtlZXBBbGl2ZVNldHRpbmdzPW4ua2VlcEFsaXZlU2V0dGluZ3MsdGhpcy5jdXN0b21FbmNyeXB0PW4uY3VzdG9tRW5jcnlwdCx0aGlzLmN1c3RvbURlY3J5cHQ9bi5jdXN0b21EZWNyeXB0LFwidW5kZWZpbmVkXCIhPXR5cGVvZiBsb2NhdGlvbiYmXCJodHRwczpcIj09PWxvY2F0aW9uLnByb3RvY29sJiYodGhpcy5zZWN1cmU9ITApLHRoaXMubG9nVmVyYm9zaXR5PW4ubG9nVmVyYm9zaXR5fHwhMSx0aGlzLnN1cHByZXNzTGVhdmVFdmVudHM9bi5zdXBwcmVzc0xlYXZlRXZlbnRzfHwhMSx0aGlzLmFubm91bmNlRmFpbGVkSGVhcnRiZWF0cz1uLmFubm91bmNlRmFpbGVkSGVhcnRiZWF0c3x8ITAsdGhpcy5hbm5vdW5jZVN1Y2Nlc3NmdWxIZWFydGJlYXRzPW4uYW5ub3VuY2VTdWNjZXNzZnVsSGVhcnRiZWF0c3x8ITEsdGhpcy51c2VJbnN0YW5jZUlkPW4udXNlSW5zdGFuY2VJZHx8ITEsdGhpcy51c2VSZXF1ZXN0SWQ9bi51c2VSZXF1ZXN0SWR8fCExLHRoaXMucmVxdWVzdE1lc3NhZ2VDb3VudFRocmVzaG9sZD1uLnJlcXVlc3RNZXNzYWdlQ291bnRUaHJlc2hvbGQsdGhpcy5zZXRUcmFuc2FjdGlvblRpbWVvdXQobi50cmFuc2FjdGlvbmFsUmVxdWVzdFRpbWVvdXR8fDE1ZTMpLHRoaXMuc2V0U3Vic2NyaWJlVGltZW91dChuLnN1YnNjcmliZVJlcXVlc3RUaW1lb3V0fHwzMWU0KSx0aGlzLnNldFNlbmRCZWFjb25Db25maWcobi51c2VTZW5kQmVhY29ufHwhMCksdGhpcy5zZXRQcmVzZW5jZVRpbWVvdXQobi5wcmVzZW5jZVRpbWVvdXR8fDMwMCksbi5oZWFydGJlYXRJbnRlcnZhbCYmdGhpcy5zZXRIZWFydGJlYXRJbnRlcnZhbChuLmhlYXJ0YmVhdEludGVydmFsKSx0aGlzLnNldFVVSUQodGhpcy5fZGVjaWRlVVVJRChuLnV1aWQpKX1yZXR1cm4gaShlLFt7a2V5OlwiZ2V0QXV0aEtleVwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYXV0aEtleX19LHtrZXk6XCJzZXRBdXRoS2V5XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuYXV0aEtleT1lLHRoaXN9fSx7a2V5Olwic2V0Q2lwaGVyS2V5XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuY2lwaGVyS2V5PWUsdGhpc319LHtrZXk6XCJnZXRVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5VVUlEfX0se2tleTpcInNldFVVSURcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fZGImJnRoaXMuX2RiLnNldCYmdGhpcy5fZGIuc2V0KHRoaXMuc3Vic2NyaWJlS2V5K1widXVpZFwiLGUpLHRoaXMuVVVJRD1lLHRoaXN9fSx7a2V5OlwiZ2V0RmlsdGVyRXhwcmVzc2lvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZmlsdGVyRXhwcmVzc2lvbn19LHtrZXk6XCJzZXRGaWx0ZXJFeHByZXNzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZmlsdGVyRXhwcmVzc2lvbj1lLHRoaXN9fSx7a2V5OlwiZ2V0UHJlc2VuY2VUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcHJlc2VuY2VUaW1lb3V0fX0se2tleTpcInNldFByZXNlbmNlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9wcmVzZW5jZVRpbWVvdXQ9ZSx0aGlzLnNldEhlYXJ0YmVhdEludGVydmFsKHRoaXMuX3ByZXNlbmNlVGltZW91dC8yLTEpLHRoaXN9fSx7a2V5OlwiZ2V0SGVhcnRiZWF0SW50ZXJ2YWxcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbH19LHtrZXk6XCJzZXRIZWFydGJlYXRJbnRlcnZhbFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9oZWFydGJlYXRJbnRlcnZhbD1lLHRoaXN9fSx7a2V5OlwiZ2V0U3Vic2NyaWJlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N1YnNjcmliZVJlcXVlc3RUaW1lb3V0fX0se2tleTpcInNldFN1YnNjcmliZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fc3Vic2NyaWJlUmVxdWVzdFRpbWVvdXQ9ZSx0aGlzfX0se2tleTpcImdldFRyYW5zYWN0aW9uVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3RyYW5zYWN0aW9uYWxSZXF1ZXN0VGltZW91dH19LHtrZXk6XCJzZXRUcmFuc2FjdGlvblRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fdHJhbnNhY3Rpb25hbFJlcXVlc3RUaW1lb3V0PWUsdGhpc319LHtrZXk6XCJpc1NlbmRCZWFjb25FbmFibGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdXNlU2VuZEJlYWNvbn19LHtrZXk6XCJzZXRTZW5kQmVhY29uQ29uZmlnXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3VzZVNlbmRCZWFjb249ZSx0aGlzfX0se2tleTpcImdldFZlcnNpb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVyblwiNC4xMC4wXCJ9fSx7a2V5OlwiX2RlY2lkZVVVSURcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gZXx8KHRoaXMuX2RiJiZ0aGlzLl9kYi5nZXQmJnRoaXMuX2RiLmdldCh0aGlzLnN1YnNjcmliZUtleStcInV1aWRcIik/dGhpcy5fZGIuZ2V0KHRoaXMuc3Vic2NyaWJlS2V5K1widXVpZFwiKTpcInBuLVwiK28uZGVmYXVsdC52NCgpKX19XSksZX0oKSk7dC5kZWZhdWx0PWEsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtlLmV4cG9ydHM9e319LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89big3KSxhPShyKG8pLG4oMTApKSx1PXIoYSksYz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC5jb25maWc7aSh0aGlzLGUpLHRoaXMuX2NvbmZpZz1uLHRoaXMuX2l2PVwiMDEyMzQ1Njc4OTAxMjM0NVwiLHRoaXMuX2FsbG93ZWRLZXlFbmNvZGluZ3M9W1wiaGV4XCIsXCJ1dGY4XCIsXCJiYXNlNjRcIixcImJpbmFyeVwiXSx0aGlzLl9hbGxvd2VkS2V5TGVuZ3Rocz1bMTI4LDI1Nl0sdGhpcy5fYWxsb3dlZE1vZGVzPVtcImVjYlwiLFwiY2JjXCJdLHRoaXMuX2RlZmF1bHRPcHRpb25zPXtlbmNyeXB0S2V5OiEwLGtleUVuY29kaW5nOlwidXRmOFwiLGtleUxlbmd0aDoyNTYsbW9kZTpcImNiY1wifX1yZXR1cm4gcyhlLFt7a2V5OlwiSE1BQ1NIQTI1NlwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB1LmRlZmF1bHQuSG1hY1NIQTI1NihlLHRoaXMuX2NvbmZpZy5zZWNyZXRLZXkpLnRvU3RyaW5nKHUuZGVmYXVsdC5lbmMuQmFzZTY0KX19LHtrZXk6XCJTSEEyNTZcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdS5kZWZhdWx0LlNIQTI1NihlKS50b1N0cmluZyh1LmRlZmF1bHQuZW5jLkhleCl9fSx7a2V5OlwiX3BhcnNlT3B0aW9uc1wiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PWV8fHt9O3JldHVybiB0Lmhhc093blByb3BlcnR5KFwiZW5jcnlwdEtleVwiKXx8KHQuZW5jcnlwdEtleT10aGlzLl9kZWZhdWx0T3B0aW9ucy5lbmNyeXB0S2V5KSx0Lmhhc093blByb3BlcnR5KFwia2V5RW5jb2RpbmdcIil8fCh0LmtleUVuY29kaW5nPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUVuY29kaW5nKSx0Lmhhc093blByb3BlcnR5KFwia2V5TGVuZ3RoXCIpfHwodC5rZXlMZW5ndGg9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5TGVuZ3RoKSx0Lmhhc093blByb3BlcnR5KFwibW9kZVwiKXx8KHQubW9kZT10aGlzLl9kZWZhdWx0T3B0aW9ucy5tb2RlKSwtMT09PXRoaXMuX2FsbG93ZWRLZXlFbmNvZGluZ3MuaW5kZXhPZih0LmtleUVuY29kaW5nLnRvTG93ZXJDYXNlKCkpJiYodC5rZXlFbmNvZGluZz10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlFbmNvZGluZyksLTE9PT10aGlzLl9hbGxvd2VkS2V5TGVuZ3Rocy5pbmRleE9mKHBhcnNlSW50KHQua2V5TGVuZ3RoLDEwKSkmJih0LmtleUxlbmd0aD10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlMZW5ndGgpLC0xPT09dGhpcy5fYWxsb3dlZE1vZGVzLmluZGV4T2YodC5tb2RlLnRvTG93ZXJDYXNlKCkpJiYodC5tb2RlPXRoaXMuX2RlZmF1bHRPcHRpb25zLm1vZGUpLHR9fSx7a2V5OlwiX2RlY29kZUtleVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuXCJiYXNlNjRcIj09PXQua2V5RW5jb2Rpbmc/dS5kZWZhdWx0LmVuYy5CYXNlNjQucGFyc2UoZSk6XCJoZXhcIj09PXQua2V5RW5jb2Rpbmc/dS5kZWZhdWx0LmVuYy5IZXgucGFyc2UoZSk6ZX19LHtrZXk6XCJfZ2V0UGFkZGVkS2V5XCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZT10aGlzLl9kZWNvZGVLZXkoZSx0KSx0LmVuY3J5cHRLZXk/dS5kZWZhdWx0LmVuYy5VdGY4LnBhcnNlKHRoaXMuU0hBMjU2KGUpLnNsaWNlKDAsMzIpKTplfX0se2tleTpcIl9nZXRNb2RlXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuXCJlY2JcIj09PWUubW9kZT91LmRlZmF1bHQubW9kZS5FQ0I6dS5kZWZhdWx0Lm1vZGUuQ0JDfX0se2tleTpcIl9nZXRJVlwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVyblwiY2JjXCI9PT1lLm1vZGU/dS5kZWZhdWx0LmVuYy5VdGY4LnBhcnNlKHRoaXMuX2l2KTpudWxsfX0se2tleTpcImVuY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX2NvbmZpZy5jdXN0b21FbmNyeXB0P3RoaXMuX2NvbmZpZy5jdXN0b21FbmNyeXB0KGUpOnRoaXMucG5FbmNyeXB0KGUsdCxuKX19LHtrZXk6XCJkZWNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9jb25maWcuY3VzdG9tRGVjcnlwdD90aGlzLl9jb25maWcuY3VzdG9tRGVjcnlwdChlKTp0aGlzLnBuRGVjcnlwdChlLHQsbil9fSx7a2V5OlwicG5FbmNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe2lmKCF0JiYhdGhpcy5fY29uZmlnLmNpcGhlcktleSlyZXR1cm4gZTtuPXRoaXMuX3BhcnNlT3B0aW9ucyhuKTt2YXIgcj10aGlzLl9nZXRJVihuKSxpPXRoaXMuX2dldE1vZGUobikscz10aGlzLl9nZXRQYWRkZWRLZXkodHx8dGhpcy5fY29uZmlnLmNpcGhlcktleSxuKTtyZXR1cm4gdS5kZWZhdWx0LkFFUy5lbmNyeXB0KGUscyx7aXY6cixtb2RlOml9KS5jaXBoZXJ0ZXh0LnRvU3RyaW5nKHUuZGVmYXVsdC5lbmMuQmFzZTY0KXx8ZX19LHtrZXk6XCJwbkRlY3J5cHRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7aWYoIXQmJiF0aGlzLl9jb25maWcuY2lwaGVyS2V5KXJldHVybiBlO249dGhpcy5fcGFyc2VPcHRpb25zKG4pO3ZhciByPXRoaXMuX2dldElWKG4pLGk9dGhpcy5fZ2V0TW9kZShuKSxzPXRoaXMuX2dldFBhZGRlZEtleSh0fHx0aGlzLl9jb25maWcuY2lwaGVyS2V5LG4pO3RyeXt2YXIgbz11LmRlZmF1bHQuZW5jLkJhc2U2NC5wYXJzZShlKSxhPXUuZGVmYXVsdC5BRVMuZGVjcnlwdCh7Y2lwaGVydGV4dDpvfSxzLHtpdjpyLG1vZGU6aX0pLnRvU3RyaW5nKHUuZGVmYXVsdC5lbmMuVXRmOCk7cmV0dXJuIEpTT04ucGFyc2UoYSl9Y2F0Y2goZSl7cmV0dXJuIG51bGx9fX1dKSxlfSgpO3QuZGVmYXVsdD1jLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIG49bnx8ZnVuY3Rpb24oZSx0KXt2YXIgbj17fSxyPW4ubGliPXt9LGk9ZnVuY3Rpb24oKXt9LHM9ci5CYXNlPXtleHRlbmQ6ZnVuY3Rpb24oZSl7aS5wcm90b3R5cGU9dGhpczt2YXIgdD1uZXcgaTtyZXR1cm4gZSYmdC5taXhJbihlKSx0Lmhhc093blByb3BlcnR5KFwiaW5pdFwiKXx8KHQuaW5pdD1mdW5jdGlvbigpe3QuJHN1cGVyLmluaXQuYXBwbHkodGhpcyxhcmd1bWVudHMpfSksdC5pbml0LnByb3RvdHlwZT10LHQuJHN1cGVyPXRoaXMsdH0sY3JlYXRlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5leHRlbmQoKTtyZXR1cm4gZS5pbml0LmFwcGx5KGUsYXJndW1lbnRzKSxlfSxpbml0OmZ1bmN0aW9uKCl7fSxtaXhJbjpmdW5jdGlvbihlKXtmb3IodmFyIHQgaW4gZSllLmhhc093blByb3BlcnR5KHQpJiYodGhpc1t0XT1lW3RdKTtlLmhhc093blByb3BlcnR5KFwidG9TdHJpbmdcIikmJih0aGlzLnRvU3RyaW5nPWUudG9TdHJpbmcpfSxjbG9uZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmluaXQucHJvdG90eXBlLmV4dGVuZCh0aGlzKX19LG89ci5Xb3JkQXJyYXk9cy5leHRlbmQoe2luaXQ6ZnVuY3Rpb24oZSx0KXtlPXRoaXMud29yZHM9ZXx8W10sdGhpcy5zaWdCeXRlcz12b2lkIDAhPXQ/dDo0KmUubGVuZ3RofSx0b1N0cmluZzpmdW5jdGlvbihlKXtyZXR1cm4oZXx8dSkuc3RyaW5naWZ5KHRoaXMpfSxjb25jYXQ6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy53b3JkcyxuPWUud29yZHMscj10aGlzLnNpZ0J5dGVzO2lmKGU9ZS5zaWdCeXRlcyx0aGlzLmNsYW1wKCksciU0KWZvcih2YXIgaT0wO2k8ZTtpKyspdFtyK2k+Pj4yXXw9KG5baT4+PjJdPj4+MjQtaSU0KjgmMjU1KTw8MjQtKHIraSklNCo4O2Vsc2UgaWYoNjU1MzU8bi5sZW5ndGgpZm9yKGk9MDtpPGU7aSs9NCl0W3IraT4+PjJdPW5baT4+PjJdO2Vsc2UgdC5wdXNoLmFwcGx5KHQsbik7cmV0dXJuIHRoaXMuc2lnQnl0ZXMrPWUsdGhpc30sY2xhbXA6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLndvcmRzLG49dGhpcy5zaWdCeXRlczt0W24+Pj4yXSY9NDI5NDk2NzI5NTw8MzItbiU0KjgsdC5sZW5ndGg9ZS5jZWlsKG4vNCl9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9cy5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLndvcmRzPXRoaXMud29yZHMuc2xpY2UoMCksZX0scmFuZG9tOmZ1bmN0aW9uKHQpe2Zvcih2YXIgbj1bXSxyPTA7cjx0O3IrPTQpbi5wdXNoKDQyOTQ5NjcyOTYqZS5yYW5kb20oKXwwKTtyZXR1cm4gbmV3IG8uaW5pdChuLHQpfX0pLGE9bi5lbmM9e30sdT1hLkhleD17c3RyaW5naWZ5OmZ1bmN0aW9uKGUpe3ZhciB0PWUud29yZHM7ZT1lLnNpZ0J5dGVzO2Zvcih2YXIgbj1bXSxyPTA7cjxlO3IrKyl7dmFyIGk9dFtyPj4+Ml0+Pj4yNC1yJTQqOCYyNTU7bi5wdXNoKChpPj4+NCkudG9TdHJpbmcoMTYpKSxuLnB1c2goKDE1JmkpLnRvU3RyaW5nKDE2KSl9cmV0dXJuIG4uam9pbihcIlwiKX0scGFyc2U6ZnVuY3Rpb24oZSl7Zm9yKHZhciB0PWUubGVuZ3RoLG49W10scj0wO3I8dDtyKz0yKW5bcj4+PjNdfD1wYXJzZUludChlLnN1YnN0cihyLDIpLDE2KTw8MjQtciU4KjQ7cmV0dXJuIG5ldyBvLmluaXQobix0LzIpfX0sYz1hLkxhdGluMT17c3RyaW5naWZ5OmZ1bmN0aW9uKGUpe3ZhciB0PWUud29yZHM7ZT1lLnNpZ0J5dGVzO2Zvcih2YXIgbj1bXSxyPTA7cjxlO3IrKyluLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSh0W3I+Pj4yXT4+PjI0LXIlNCo4JjI1NSkpO3JldHVybiBuLmpvaW4oXCJcIil9LHBhcnNlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1lLmxlbmd0aCxuPVtdLHI9MDtyPHQ7cisrKW5bcj4+PjJdfD0oMjU1JmUuY2hhckNvZGVBdChyKSk8PDI0LXIlNCo4O3JldHVybiBuZXcgby5pbml0KG4sdCl9fSxsPWEuVXRmOD17c3RyaW5naWZ5OmZ1bmN0aW9uKGUpe3RyeXtyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShjLnN0cmluZ2lmeShlKSkpfWNhdGNoKGUpe3Rocm93IEVycm9yKFwiTWFsZm9ybWVkIFVURi04IGRhdGFcIil9fSxwYXJzZTpmdW5jdGlvbihlKXtyZXR1cm4gYy5wYXJzZSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoZSkpKX19LGg9ci5CdWZmZXJlZEJsb2NrQWxnb3JpdGhtPXMuZXh0ZW5kKHtyZXNldDpmdW5jdGlvbigpe3RoaXMuX2RhdGE9bmV3IG8uaW5pdCx0aGlzLl9uRGF0YUJ5dGVzPTB9LF9hcHBlbmQ6ZnVuY3Rpb24oZSl7XCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPWwucGFyc2UoZSkpLHRoaXMuX2RhdGEuY29uY2F0KGUpLHRoaXMuX25EYXRhQnl0ZXMrPWUuc2lnQnl0ZXN9LF9wcm9jZXNzOmZ1bmN0aW9uKHQpe3ZhciBuPXRoaXMuX2RhdGEscj1uLndvcmRzLGk9bi5zaWdCeXRlcyxzPXRoaXMuYmxvY2tTaXplLGE9aS8oNCpzKSxhPXQ/ZS5jZWlsKGEpOmUubWF4KCgwfGEpLXRoaXMuX21pbkJ1ZmZlclNpemUsMCk7aWYodD1hKnMsaT1lLm1pbig0KnQsaSksdCl7Zm9yKHZhciB1PTA7dTx0O3UrPXMpdGhpcy5fZG9Qcm9jZXNzQmxvY2socix1KTt1PXIuc3BsaWNlKDAsdCksbi5zaWdCeXRlcy09aX1yZXR1cm4gbmV3IG8uaW5pdCh1LGkpfSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPXMuY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS5fZGF0YT10aGlzLl9kYXRhLmNsb25lKCksZX0sX21pbkJ1ZmZlclNpemU6MH0pO3IuSGFzaGVyPWguZXh0ZW5kKHtjZmc6cy5leHRlbmQoKSxpbml0OmZ1bmN0aW9uKGUpe3RoaXMuY2ZnPXRoaXMuY2ZnLmV4dGVuZChlKSx0aGlzLnJlc2V0KCl9LHJlc2V0OmZ1bmN0aW9uKCl7aC5yZXNldC5jYWxsKHRoaXMpLHRoaXMuX2RvUmVzZXQoKX0sdXBkYXRlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9hcHBlbmQoZSksdGhpcy5fcHJvY2VzcygpLHRoaXN9LGZpbmFsaXplOmZ1bmN0aW9uKGUpe3JldHVybiBlJiZ0aGlzLl9hcHBlbmQoZSksdGhpcy5fZG9GaW5hbGl6ZSgpfSxibG9ja1NpemU6MTYsX2NyZWF0ZUhlbHBlcjpmdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24odCxuKXtyZXR1cm4gbmV3IGUuaW5pdChuKS5maW5hbGl6ZSh0KX19LF9jcmVhdGVIbWFjSGVscGVyOmZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0LG4pe3JldHVybiBuZXcgZi5ITUFDLmluaXQoZSxuKS5maW5hbGl6ZSh0KX19fSk7dmFyIGY9bi5hbGdvPXt9O3JldHVybiBufShNYXRoKTshZnVuY3Rpb24oZSl7Zm9yKHZhciB0PW4scj10LmxpYixpPXIuV29yZEFycmF5LHM9ci5IYXNoZXIscj10LmFsZ28sbz1bXSxhPVtdLHU9ZnVuY3Rpb24oZSl7cmV0dXJuIDQyOTQ5NjcyOTYqKGUtKDB8ZSkpfDB9LGM9MixsPTA7NjQ+bDspe3ZhciBoO2U6e2g9Yztmb3IodmFyIGY9ZS5zcXJ0KGgpLGQ9MjtkPD1mO2QrKylpZighKGglZCkpe2g9ITE7YnJlYWsgZX1oPSEwfWgmJig4PmwmJihvW2xdPXUoZS5wb3coYywuNSkpKSxhW2xdPXUoZS5wb3coYywxLzMpKSxsKyspLGMrK312YXIgcD1bXSxyPXIuU0hBMjU2PXMuZXh0ZW5kKHtfZG9SZXNldDpmdW5jdGlvbigpe3RoaXMuX2hhc2g9bmV3IGkuaW5pdChvLnNsaWNlKDApKX0sX2RvUHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPXRoaXMuX2hhc2gud29yZHMscj1uWzBdLGk9blsxXSxzPW5bMl0sbz1uWzNdLHU9bls0XSxjPW5bNV0sbD1uWzZdLGg9bls3XSxmPTA7NjQ+ZjtmKyspe2lmKDE2PmYpcFtmXT0wfGVbdCtmXTtlbHNle3ZhciBkPXBbZi0xNV0sZz1wW2YtMl07cFtmXT0oKGQ8PDI1fGQ+Pj43KV4oZDw8MTR8ZD4+PjE4KV5kPj4+MykrcFtmLTddKygoZzw8MTV8Zz4+PjE3KV4oZzw8MTN8Zz4+PjE5KV5nPj4+MTApK3BbZi0xNl19ZD1oKygodTw8MjZ8dT4+PjYpXih1PDwyMXx1Pj4+MTEpXih1PDw3fHU+Pj4yNSkpKyh1JmNefnUmbCkrYVtmXStwW2ZdLGc9KChyPDwzMHxyPj4+MileKHI8PDE5fHI+Pj4xMyleKHI8PDEwfHI+Pj4yMikpKyhyJmleciZzXmkmcyksaD1sLGw9YyxjPXUsdT1vK2R8MCxvPXMscz1pLGk9cixyPWQrZ3wwfW5bMF09blswXStyfDAsblsxXT1uWzFdK2l8MCxuWzJdPW5bMl0rc3wwLG5bM109blszXStvfDAsbls0XT1uWzRdK3V8MCxuWzVdPW5bNV0rY3wwLG5bNl09bls2XStsfDAsbls3XT1uWzddK2h8MH0sX2RvRmluYWxpemU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLl9kYXRhLG49dC53b3JkcyxyPTgqdGhpcy5fbkRhdGFCeXRlcyxpPTgqdC5zaWdCeXRlcztyZXR1cm4gbltpPj4+NV18PTEyODw8MjQtaSUzMixuWzE0KyhpKzY0Pj4+OTw8NCldPWUuZmxvb3Ioci80Mjk0OTY3Mjk2KSxuWzE1KyhpKzY0Pj4+OTw8NCldPXIsdC5zaWdCeXRlcz00Km4ubGVuZ3RoLHRoaXMuX3Byb2Nlc3MoKSx0aGlzLl9oYXNofSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPXMuY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS5faGFzaD10aGlzLl9oYXNoLmNsb25lKCksZX19KTt0LlNIQTI1Nj1zLl9jcmVhdGVIZWxwZXIociksdC5IbWFjU0hBMjU2PXMuX2NyZWF0ZUhtYWNIZWxwZXIocil9KE1hdGgpLGZ1bmN0aW9uKCl7dmFyIGU9bix0PWUuZW5jLlV0Zjg7ZS5hbGdvLkhNQUM9ZS5saWIuQmFzZS5leHRlbmQoe2luaXQ6ZnVuY3Rpb24oZSxuKXtlPXRoaXMuX2hhc2hlcj1uZXcgZS5pbml0LFwic3RyaW5nXCI9PXR5cGVvZiBuJiYobj10LnBhcnNlKG4pKTt2YXIgcj1lLmJsb2NrU2l6ZSxpPTQqcjtuLnNpZ0J5dGVzPmkmJihuPWUuZmluYWxpemUobikpLG4uY2xhbXAoKTtmb3IodmFyIHM9dGhpcy5fb0tleT1uLmNsb25lKCksbz10aGlzLl9pS2V5PW4uY2xvbmUoKSxhPXMud29yZHMsdT1vLndvcmRzLGM9MDtjPHI7YysrKWFbY11ePTE1NDk1NTY4MjgsdVtjXV49OTA5NTIyNDg2O3Muc2lnQnl0ZXM9by5zaWdCeXRlcz1pLHRoaXMucmVzZXQoKX0scmVzZXQ6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLl9oYXNoZXI7ZS5yZXNldCgpLGUudXBkYXRlKHRoaXMuX2lLZXkpfSx1cGRhdGU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2hhc2hlci51cGRhdGUoZSksdGhpc30sZmluYWxpemU6ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5faGFzaGVyO3JldHVybiBlPXQuZmluYWxpemUoZSksdC5yZXNldCgpLHQuZmluYWxpemUodGhpcy5fb0tleS5jbG9uZSgpLmNvbmNhdChlKSl9fSl9KCksZnVuY3Rpb24oKXt2YXIgZT1uLHQ9ZS5saWIuV29yZEFycmF5O2UuZW5jLkJhc2U2ND17c3RyaW5naWZ5OmZ1bmN0aW9uKGUpe3ZhciB0PWUud29yZHMsbj1lLnNpZ0J5dGVzLHI9dGhpcy5fbWFwO2UuY2xhbXAoKSxlPVtdO2Zvcih2YXIgaT0wO2k8bjtpKz0zKWZvcih2YXIgcz0odFtpPj4+Ml0+Pj4yNC1pJTQqOCYyNTUpPDwxNnwodFtpKzE+Pj4yXT4+PjI0LShpKzEpJTQqOCYyNTUpPDw4fHRbaSsyPj4+Ml0+Pj4yNC0oaSsyKSU0KjgmMjU1LG89MDs0Pm8mJmkrLjc1Km88bjtvKyspZS5wdXNoKHIuY2hhckF0KHM+Pj42KigzLW8pJjYzKSk7aWYodD1yLmNoYXJBdCg2NCkpZm9yKDtlLmxlbmd0aCU0OyllLnB1c2godCk7cmV0dXJuIGUuam9pbihcIlwiKX0scGFyc2U6ZnVuY3Rpb24oZSl7dmFyIG49ZS5sZW5ndGgscj10aGlzLl9tYXAsaT1yLmNoYXJBdCg2NCk7aSYmLTEhPShpPWUuaW5kZXhPZihpKSkmJihuPWkpO2Zvcih2YXIgaT1bXSxzPTAsbz0wO288bjtvKyspaWYobyU0KXt2YXIgYT1yLmluZGV4T2YoZS5jaGFyQXQoby0xKSk8PG8lNCoyLHU9ci5pbmRleE9mKGUuY2hhckF0KG8pKT4+PjYtbyU0KjI7aVtzPj4+Ml18PShhfHUpPDwyNC1zJTQqOCxzKyt9cmV0dXJuIHQuY3JlYXRlKGkscyl9LF9tYXA6XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwifX0oKSxmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUsdCxuLHIsaSxzLG8pe3JldHVybigoZT1lKyh0Jm58fnQmcikraStvKTw8c3xlPj4+MzItcykrdH1mdW5jdGlvbiByKGUsdCxuLHIsaSxzLG8pe3JldHVybigoZT1lKyh0JnJ8biZ+cikraStvKTw8c3xlPj4+MzItcykrdH1mdW5jdGlvbiBpKGUsdCxuLHIsaSxzLG8pe3JldHVybigoZT1lKyh0Xm5ecikraStvKTw8c3xlPj4+MzItcykrdH1mdW5jdGlvbiBzKGUsdCxuLHIsaSxzLG8pe3JldHVybigoZT1lKyhuXih0fH5yKSkraStvKTw8c3xlPj4+MzItcykrdH1mb3IodmFyIG89bixhPW8ubGliLHU9YS5Xb3JkQXJyYXksYz1hLkhhc2hlcixhPW8uYWxnbyxsPVtdLGg9MDs2ND5oO2grKylsW2hdPTQyOTQ5NjcyOTYqZS5hYnMoZS5zaW4oaCsxKSl8MDthPWEuTUQ1PWMuZXh0ZW5kKHtfZG9SZXNldDpmdW5jdGlvbigpe3RoaXMuX2hhc2g9bmV3IHUuaW5pdChbMTczMjU4NDE5Myw0MDIzMjMzNDE3LDI1NjIzODMxMDIsMjcxNzMzODc4XSl9LF9kb1Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLG4pe2Zvcih2YXIgbz0wOzE2Pm87bysrKXt2YXIgYT1uK28sdT1lW2FdO2VbYV09MTY3MTE5MzUmKHU8PDh8dT4+PjI0KXw0Mjc4MjU1MzYwJih1PDwyNHx1Pj4+OCl9dmFyIG89dGhpcy5faGFzaC53b3JkcyxhPWVbbiswXSx1PWVbbisxXSxjPWVbbisyXSxoPWVbbiszXSxmPWVbbis0XSxkPWVbbis1XSxwPWVbbis2XSxnPWVbbis3XSx5PWVbbis4XSx2PWVbbis5XSxiPWVbbisxMF0sXz1lW24rMTFdLG09ZVtuKzEyXSxrPWVbbisxM10sUD1lW24rMTRdLFM9ZVtuKzE1XSxPPW9bMF0sdz1vWzFdLFQ9b1syXSxDPW9bM10sTz10KE8sdyxULEMsYSw3LGxbMF0pLEM9dChDLE8sdyxULHUsMTIsbFsxXSksVD10KFQsQyxPLHcsYywxNyxsWzJdKSx3PXQodyxULEMsTyxoLDIyLGxbM10pLE89dChPLHcsVCxDLGYsNyxsWzRdKSxDPXQoQyxPLHcsVCxkLDEyLGxbNV0pLFQ9dChULEMsTyx3LHAsMTcsbFs2XSksdz10KHcsVCxDLE8sZywyMixsWzddKSxPPXQoTyx3LFQsQyx5LDcsbFs4XSksQz10KEMsTyx3LFQsdiwxMixsWzldKSxUPXQoVCxDLE8sdyxiLDE3LGxbMTBdKSx3PXQodyxULEMsTyxfLDIyLGxbMTFdKSxPPXQoTyx3LFQsQyxtLDcsbFsxMl0pLEM9dChDLE8sdyxULGssMTIsbFsxM10pLFQ9dChULEMsTyx3LFAsMTcsbFsxNF0pLHc9dCh3LFQsQyxPLFMsMjIsbFsxNV0pLE89cihPLHcsVCxDLHUsNSxsWzE2XSksQz1yKEMsTyx3LFQscCw5LGxbMTddKSxUPXIoVCxDLE8sdyxfLDE0LGxbMThdKSx3PXIodyxULEMsTyxhLDIwLGxbMTldKSxPPXIoTyx3LFQsQyxkLDUsbFsyMF0pLEM9cihDLE8sdyxULGIsOSxsWzIxXSksVD1yKFQsQyxPLHcsUywxNCxsWzIyXSksdz1yKHcsVCxDLE8sZiwyMCxsWzIzXSksTz1yKE8sdyxULEMsdiw1LGxbMjRdKSxDPXIoQyxPLHcsVCxQLDksbFsyNV0pLFQ9cihULEMsTyx3LGgsMTQsbFsyNl0pLHc9cih3LFQsQyxPLHksMjAsbFsyN10pLE89cihPLHcsVCxDLGssNSxsWzI4XSksQz1yKEMsTyx3LFQsYyw5LGxbMjldKSxUPXIoVCxDLE8sdyxnLDE0LGxbMzBdKSx3PXIodyxULEMsTyxtLDIwLGxbMzFdKSxPPWkoTyx3LFQsQyxkLDQsbFszMl0pLEM9aShDLE8sdyxULHksMTEsbFszM10pLFQ9aShULEMsTyx3LF8sMTYsbFszNF0pLHc9aSh3LFQsQyxPLFAsMjMsbFszNV0pLE89aShPLHcsVCxDLHUsNCxsWzM2XSksQz1pKEMsTyx3LFQsZiwxMSxsWzM3XSksVD1pKFQsQyxPLHcsZywxNixsWzM4XSksdz1pKHcsVCxDLE8sYiwyMyxsWzM5XSksTz1pKE8sdyxULEMsayw0LGxbNDBdKSxDPWkoQyxPLHcsVCxhLDExLGxbNDFdKSxUPWkoVCxDLE8sdyxoLDE2LGxbNDJdKSx3PWkodyxULEMsTyxwLDIzLGxbNDNdKSxPPWkoTyx3LFQsQyx2LDQsbFs0NF0pLEM9aShDLE8sdyxULG0sMTEsbFs0NV0pLFQ9aShULEMsTyx3LFMsMTYsbFs0Nl0pLHc9aSh3LFQsQyxPLGMsMjMsbFs0N10pLE89cyhPLHcsVCxDLGEsNixsWzQ4XSksQz1zKEMsTyx3LFQsZywxMCxsWzQ5XSksVD1zKFQsQyxPLHcsUCwxNSxsWzUwXSksdz1zKHcsVCxDLE8sZCwyMSxsWzUxXSksTz1zKE8sdyxULEMsbSw2LGxbNTJdKSxDPXMoQyxPLHcsVCxoLDEwLGxbNTNdKSxUPXMoVCxDLE8sdyxiLDE1LGxbNTRdKSx3PXModyxULEMsTyx1LDIxLGxbNTVdKSxPPXMoTyx3LFQsQyx5LDYsbFs1Nl0pLEM9cyhDLE8sdyxULFMsMTAsbFs1N10pLFQ9cyhULEMsTyx3LHAsMTUsbFs1OF0pLHc9cyh3LFQsQyxPLGssMjEsbFs1OV0pLE89cyhPLHcsVCxDLGYsNixsWzYwXSksQz1zKEMsTyx3LFQsXywxMCxsWzYxXSksVD1zKFQsQyxPLHcsYywxNSxsWzYyXSksdz1zKHcsVCxDLE8sdiwyMSxsWzYzXSk7b1swXT1vWzBdK098MCxvWzFdPW9bMV0rd3wwLG9bMl09b1syXStUfDAsb1szXT1vWzNdK0N8MH0sX2RvRmluYWxpemU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLl9kYXRhLG49dC53b3JkcyxyPTgqdGhpcy5fbkRhdGFCeXRlcyxpPTgqdC5zaWdCeXRlcztuW2k+Pj41XXw9MTI4PDwyNC1pJTMyO3ZhciBzPWUuZmxvb3Ioci80Mjk0OTY3Mjk2KTtmb3IoblsxNSsoaSs2ND4+Pjk8PDQpXT0xNjcxMTkzNSYoczw8OHxzPj4+MjQpfDQyNzgyNTUzNjAmKHM8PDI0fHM+Pj44KSxuWzE0KyhpKzY0Pj4+OTw8NCldPTE2NzExOTM1JihyPDw4fHI+Pj4yNCl8NDI3ODI1NTM2MCYocjw8MjR8cj4+PjgpLHQuc2lnQnl0ZXM9NCoobi5sZW5ndGgrMSksdGhpcy5fcHJvY2VzcygpLHQ9dGhpcy5faGFzaCxuPXQud29yZHMscj0wOzQ+cjtyKyspaT1uW3JdLG5bcl09MTY3MTE5MzUmKGk8PDh8aT4+PjI0KXw0Mjc4MjU1MzYwJihpPDwyNHxpPj4+OCk7cmV0dXJuIHR9LGNsb25lOmZ1bmN0aW9uKCl7dmFyIGU9Yy5jbG9uZS5jYWxsKHRoaXMpO3JldHVybiBlLl9oYXNoPXRoaXMuX2hhc2guY2xvbmUoKSxlfX0pLG8uTUQ1PWMuX2NyZWF0ZUhlbHBlcihhKSxvLkhtYWNNRDU9Yy5fY3JlYXRlSG1hY0hlbHBlcihhKX0oTWF0aCksZnVuY3Rpb24oKXt2YXIgZT1uLHQ9ZS5saWIscj10LkJhc2UsaT10LldvcmRBcnJheSx0PWUuYWxnbyxzPXQuRXZwS0RGPXIuZXh0ZW5kKHtjZmc6ci5leHRlbmQoe2tleVNpemU6NCxoYXNoZXI6dC5NRDUsaXRlcmF0aW9uczoxfSksaW5pdDpmdW5jdGlvbihlKXt0aGlzLmNmZz10aGlzLmNmZy5leHRlbmQoZSl9LGNvbXB1dGU6ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49dGhpcy5jZmcscj1uLmhhc2hlci5jcmVhdGUoKSxzPWkuY3JlYXRlKCksbz1zLndvcmRzLGE9bi5rZXlTaXplLG49bi5pdGVyYXRpb25zO28ubGVuZ3RoPGE7KXt1JiZyLnVwZGF0ZSh1KTt2YXIgdT1yLnVwZGF0ZShlKS5maW5hbGl6ZSh0KTtyLnJlc2V0KCk7Zm9yKHZhciBjPTE7YzxuO2MrKyl1PXIuZmluYWxpemUodSksci5yZXNldCgpO3MuY29uY2F0KHUpfXJldHVybiBzLnNpZ0J5dGVzPTQqYSxzfX0pO2UuRXZwS0RGPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gcy5jcmVhdGUobikuY29tcHV0ZShlLHQpfX0oKSxuLmxpYi5DaXBoZXJ8fGZ1bmN0aW9uKGUpe3ZhciB0PW4scj10LmxpYixpPXIuQmFzZSxzPXIuV29yZEFycmF5LG89ci5CdWZmZXJlZEJsb2NrQWxnb3JpdGhtLGE9dC5lbmMuQmFzZTY0LHU9dC5hbGdvLkV2cEtERixjPXIuQ2lwaGVyPW8uZXh0ZW5kKHtjZmc6aS5leHRlbmQoKSxjcmVhdGVFbmNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5jcmVhdGUodGhpcy5fRU5DX1hGT1JNX01PREUsZSx0KX0sY3JlYXRlRGVjcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuY3JlYXRlKHRoaXMuX0RFQ19YRk9STV9NT0RFLGUsdCl9LGluaXQ6ZnVuY3Rpb24oZSx0LG4pe3RoaXMuY2ZnPXRoaXMuY2ZnLmV4dGVuZChuKSx0aGlzLl94Zm9ybU1vZGU9ZSx0aGlzLl9rZXk9dCx0aGlzLnJlc2V0KCl9LHJlc2V0OmZ1bmN0aW9uKCl7by5yZXNldC5jYWxsKHRoaXMpLHRoaXMuX2RvUmVzZXQoKX0scHJvY2VzczpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fYXBwZW5kKGUpLHRoaXMuX3Byb2Nlc3MoKX0sZmluYWxpemU6ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJnRoaXMuX2FwcGVuZChlKSx0aGlzLl9kb0ZpbmFsaXplKCl9LGtleVNpemU6NCxpdlNpemU6NCxfRU5DX1hGT1JNX01PREU6MSxfREVDX1hGT1JNX01PREU6MixfY3JlYXRlSGVscGVyOmZ1bmN0aW9uKGUpe3JldHVybntlbmNyeXB0OmZ1bmN0aW9uKHQsbixyKXtyZXR1cm4oXCJzdHJpbmdcIj09dHlwZW9mIG4/ZzpwKS5lbmNyeXB0KGUsdCxuLHIpfSxkZWNyeXB0OmZ1bmN0aW9uKHQsbixyKXtyZXR1cm4oXCJzdHJpbmdcIj09dHlwZW9mIG4/ZzpwKS5kZWNyeXB0KGUsdCxuLHIpfX19fSk7ci5TdHJlYW1DaXBoZXI9Yy5leHRlbmQoe19kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Byb2Nlc3MoITApfSxibG9ja1NpemU6MX0pO3ZhciBsPXQubW9kZT17fSxoPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10aGlzLl9pdjtyP3RoaXMuX2l2PXZvaWQgMDpyPXRoaXMuX3ByZXZCbG9jaztmb3IodmFyIGk9MDtpPG47aSsrKWVbdCtpXV49cltpXX0sZj0oci5CbG9ja0NpcGhlck1vZGU9aS5leHRlbmQoe2NyZWF0ZUVuY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLkVuY3J5cHRvci5jcmVhdGUoZSx0KX0sY3JlYXRlRGVjcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuRGVjcnlwdG9yLmNyZWF0ZShlLHQpfSxpbml0OmZ1bmN0aW9uKGUsdCl7dGhpcy5fY2lwaGVyPWUsdGhpcy5faXY9dH19KSkuZXh0ZW5kKCk7Zi5FbmNyeXB0b3I9Zi5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMuX2NpcGhlcixyPW4uYmxvY2tTaXplO2guY2FsbCh0aGlzLGUsdCxyKSxuLmVuY3J5cHRCbG9jayhlLHQpLHRoaXMuX3ByZXZCbG9jaz1lLnNsaWNlKHQsdCtyKX19KSxmLkRlY3J5cHRvcj1mLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcy5fY2lwaGVyLHI9bi5ibG9ja1NpemUsaT1lLnNsaWNlKHQsdCtyKTtuLmRlY3J5cHRCbG9jayhlLHQpLGguY2FsbCh0aGlzLGUsdCxyKSx0aGlzLl9wcmV2QmxvY2s9aX19KSxsPWwuQ0JDPWYsZj0odC5wYWQ9e30pLlBrY3M3PXtwYWQ6ZnVuY3Rpb24oZSx0KXtmb3IodmFyIG49NCp0LG49bi1lLnNpZ0J5dGVzJW4scj1uPDwyNHxuPDwxNnxuPDw4fG4saT1bXSxvPTA7bzxuO28rPTQpaS5wdXNoKHIpO249cy5jcmVhdGUoaSxuKSxlLmNvbmNhdChuKX0sdW5wYWQ6ZnVuY3Rpb24oZSl7ZS5zaWdCeXRlcy09MjU1JmUud29yZHNbZS5zaWdCeXRlcy0xPj4+Ml19fSxyLkJsb2NrQ2lwaGVyPWMuZXh0ZW5kKHtjZmc6Yy5jZmcuZXh0ZW5kKHttb2RlOmwscGFkZGluZzpmfSkscmVzZXQ6ZnVuY3Rpb24oKXtjLnJlc2V0LmNhbGwodGhpcyk7dmFyIGU9dGhpcy5jZmcsdD1lLml2LGU9ZS5tb2RlO2lmKHRoaXMuX3hmb3JtTW9kZT09dGhpcy5fRU5DX1hGT1JNX01PREUpdmFyIG49ZS5jcmVhdGVFbmNyeXB0b3I7ZWxzZSBuPWUuY3JlYXRlRGVjcnlwdG9yLHRoaXMuX21pbkJ1ZmZlclNpemU9MTt0aGlzLl9tb2RlPW4uY2FsbChlLHRoaXMsdCYmdC53b3Jkcyl9LF9kb1Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3RoaXMuX21vZGUucHJvY2Vzc0Jsb2NrKGUsdCl9LF9kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5jZmcucGFkZGluZztpZih0aGlzLl94Zm9ybU1vZGU9PXRoaXMuX0VOQ19YRk9STV9NT0RFKXtlLnBhZCh0aGlzLl9kYXRhLHRoaXMuYmxvY2tTaXplKTt2YXIgdD10aGlzLl9wcm9jZXNzKCEwKX1lbHNlIHQ9dGhpcy5fcHJvY2VzcyghMCksZS51bnBhZCh0KTtyZXR1cm4gdH0sYmxvY2tTaXplOjR9KTt2YXIgZD1yLkNpcGhlclBhcmFtcz1pLmV4dGVuZCh7aW5pdDpmdW5jdGlvbihlKXt0aGlzLm1peEluKGUpfSx0b1N0cmluZzpmdW5jdGlvbihlKXtyZXR1cm4oZXx8dGhpcy5mb3JtYXR0ZXIpLnN0cmluZ2lmeSh0aGlzKX19KSxsPSh0LmZvcm1hdD17fSkuT3BlblNTTD17c3RyaW5naWZ5OmZ1bmN0aW9uKGUpe3ZhciB0PWUuY2lwaGVydGV4dDtyZXR1cm4gZT1lLnNhbHQsKGU/cy5jcmVhdGUoWzEzOTg4OTM2ODQsMTcwMTA3NjgzMV0pLmNvbmNhdChlKS5jb25jYXQodCk6dCkudG9TdHJpbmcoYSl9LHBhcnNlOmZ1bmN0aW9uKGUpe2U9YS5wYXJzZShlKTt2YXIgdD1lLndvcmRzO2lmKDEzOTg4OTM2ODQ9PXRbMF0mJjE3MDEwNzY4MzE9PXRbMV0pe3ZhciBuPXMuY3JlYXRlKHQuc2xpY2UoMiw0KSk7dC5zcGxpY2UoMCw0KSxlLnNpZ0J5dGVzLT0xNn1yZXR1cm4gZC5jcmVhdGUoe2NpcGhlcnRleHQ6ZSxzYWx0Om59KX19LHA9ci5TZXJpYWxpemFibGVDaXBoZXI9aS5leHRlbmQoe2NmZzppLmV4dGVuZCh7Zm9ybWF0Omx9KSxlbmNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3I9dGhpcy5jZmcuZXh0ZW5kKHIpO3ZhciBpPWUuY3JlYXRlRW5jcnlwdG9yKG4scik7cmV0dXJuIHQ9aS5maW5hbGl6ZSh0KSxpPWkuY2ZnLGQuY3JlYXRlKHtjaXBoZXJ0ZXh0OnQsa2V5Om4saXY6aS5pdixhbGdvcml0aG06ZSxtb2RlOmkubW9kZSxwYWRkaW5nOmkucGFkZGluZyxibG9ja1NpemU6ZS5ibG9ja1NpemUsZm9ybWF0dGVyOnIuZm9ybWF0fSl9LGRlY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHI9dGhpcy5jZmcuZXh0ZW5kKHIpLHQ9dGhpcy5fcGFyc2UodCxyLmZvcm1hdCksZS5jcmVhdGVEZWNyeXB0b3IobixyKS5maW5hbGl6ZSh0LmNpcGhlcnRleHQpfSxfcGFyc2U6ZnVuY3Rpb24oZSx0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgZT90LnBhcnNlKGUsdGhpcyk6ZX19KSx0PSh0LmtkZj17fSkuT3BlblNTTD17ZXhlY3V0ZTpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcnx8KHI9cy5yYW5kb20oOCkpLGU9dS5jcmVhdGUoe2tleVNpemU6dCtufSkuY29tcHV0ZShlLHIpLG49cy5jcmVhdGUoZS53b3Jkcy5zbGljZSh0KSw0Km4pLGUuc2lnQnl0ZXM9NCp0LGQuY3JlYXRlKHtrZXk6ZSxpdjpuLHNhbHQ6cn0pfX0sZz1yLlBhc3N3b3JkQmFzZWRDaXBoZXI9cC5leHRlbmQoe2NmZzpwLmNmZy5leHRlbmQoe2tkZjp0fSksZW5jcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gcj10aGlzLmNmZy5leHRlbmQociksbj1yLmtkZi5leGVjdXRlKG4sZS5rZXlTaXplLGUuaXZTaXplKSxyLml2PW4uaXYsZT1wLmVuY3J5cHQuY2FsbCh0aGlzLGUsdCxuLmtleSxyKSxlLm1peEluKG4pLGV9LGRlY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHI9dGhpcy5jZmcuZXh0ZW5kKHIpLHQ9dGhpcy5fcGFyc2UodCxyLmZvcm1hdCksbj1yLmtkZi5leGVjdXRlKG4sZS5rZXlTaXplLGUuaXZTaXplLHQuc2FsdCksci5pdj1uLml2LHAuZGVjcnlwdC5jYWxsKHRoaXMsZSx0LG4ua2V5LHIpfX0pfSgpLGZ1bmN0aW9uKCl7Zm9yKHZhciBlPW4sdD1lLmxpYi5CbG9ja0NpcGhlcixyPWUuYWxnbyxpPVtdLHM9W10sbz1bXSxhPVtdLHU9W10sYz1bXSxsPVtdLGg9W10sZj1bXSxkPVtdLHA9W10sZz0wOzI1Nj5nO2crKylwW2ddPTEyOD5nP2c8PDE6Zzw8MV4yODM7Zm9yKHZhciB5PTAsdj0wLGc9MDsyNTY+ZztnKyspe3ZhciBiPXZedjw8MV52PDwyXnY8PDNedjw8NCxiPWI+Pj44XjI1NSZiXjk5O2lbeV09YixzW2JdPXk7dmFyIF89cFt5XSxtPXBbX10saz1wW21dLFA9MjU3KnBbYl1eMTY4NDMwMDgqYjtvW3ldPVA8PDI0fFA+Pj44LGFbeV09UDw8MTZ8UD4+PjE2LHVbeV09UDw8OHxQPj4+MjQsY1t5XT1QLFA9MTY4NDMwMDkqa142NTUzNyptXjI1NypfXjE2ODQzMDA4KnksbFtiXT1QPDwyNHxQPj4+OCxoW2JdPVA8PDE2fFA+Pj4xNixmW2JdPVA8PDh8UD4+PjI0LGRbYl09UCx5Pyh5PV9ecFtwW3Bba15fXV1dLHZePXBbcFt2XV0pOnk9dj0xfXZhciBTPVswLDEsMiw0LDgsMTYsMzIsNjQsMTI4LDI3LDU0XSxyPXIuQUVTPXQuZXh0ZW5kKHtfZG9SZXNldDpmdW5jdGlvbigpe2Zvcih2YXIgZT10aGlzLl9rZXksdD1lLndvcmRzLG49ZS5zaWdCeXRlcy80LGU9NCooKHRoaXMuX25Sb3VuZHM9bis2KSsxKSxyPXRoaXMuX2tleVNjaGVkdWxlPVtdLHM9MDtzPGU7cysrKWlmKHM8bilyW3NdPXRbc107ZWxzZXt2YXIgbz1yW3MtMV07cyVuPzY8biYmND09cyVuJiYobz1pW28+Pj4yNF08PDI0fGlbbz4+PjE2JjI1NV08PDE2fGlbbz4+PjgmMjU1XTw8OHxpWzI1NSZvXSk6KG89bzw8OHxvPj4+MjQsbz1pW28+Pj4yNF08PDI0fGlbbz4+PjE2JjI1NV08PDE2fGlbbz4+PjgmMjU1XTw8OHxpWzI1NSZvXSxvXj1TW3MvbnwwXTw8MjQpLHJbc109cltzLW5dXm99Zm9yKHQ9dGhpcy5faW52S2V5U2NoZWR1bGU9W10sbj0wO248ZTtuKyspcz1lLW4sbz1uJTQ/cltzXTpyW3MtNF0sdFtuXT00Pm58fDQ+PXM/bzpsW2lbbz4+PjI0XV1eaFtpW28+Pj4xNiYyNTVdXV5mW2lbbz4+PjgmMjU1XV1eZFtpWzI1NSZvXV19LGVuY3J5cHRCbG9jazpmdW5jdGlvbihlLHQpe3RoaXMuX2RvQ3J5cHRCbG9jayhlLHQsdGhpcy5fa2V5U2NoZWR1bGUsbyxhLHUsYyxpKX0sZGVjcnlwdEJsb2NrOmZ1bmN0aW9uKGUsdCl7dmFyIG49ZVt0KzFdO2VbdCsxXT1lW3QrM10sZVt0KzNdPW4sdGhpcy5fZG9DcnlwdEJsb2NrKGUsdCx0aGlzLl9pbnZLZXlTY2hlZHVsZSxsLGgsZixkLHMpLG49ZVt0KzFdLGVbdCsxXT1lW3QrM10sZVt0KzNdPW59LF9kb0NyeXB0QmxvY2s6ZnVuY3Rpb24oZSx0LG4scixpLHMsbyxhKXtmb3IodmFyIHU9dGhpcy5fblJvdW5kcyxjPWVbdF1eblswXSxsPWVbdCsxXV5uWzFdLGg9ZVt0KzJdXm5bMl0sZj1lW3QrM11eblszXSxkPTQscD0xO3A8dTtwKyspdmFyIGc9cltjPj4+MjRdXmlbbD4+PjE2JjI1NV1ec1toPj4+OCYyNTVdXm9bMjU1JmZdXm5bZCsrXSx5PXJbbD4+PjI0XV5pW2g+Pj4xNiYyNTVdXnNbZj4+PjgmMjU1XV5vWzI1NSZjXV5uW2QrK10sdj1yW2g+Pj4yNF1eaVtmPj4+MTYmMjU1XV5zW2M+Pj44JjI1NV1eb1syNTUmbF1ebltkKytdLGY9cltmPj4+MjRdXmlbYz4+PjE2JjI1NV1ec1tsPj4+OCYyNTVdXm9bMjU1JmhdXm5bZCsrXSxjPWcsbD15LGg9djtnPShhW2M+Pj4yNF08PDI0fGFbbD4+PjE2JjI1NV08PDE2fGFbaD4+PjgmMjU1XTw8OHxhWzI1NSZmXSlebltkKytdLHk9KGFbbD4+PjI0XTw8MjR8YVtoPj4+MTYmMjU1XTw8MTZ8YVtmPj4+OCYyNTVdPDw4fGFbMjU1JmNdKV5uW2QrK10sdj0oYVtoPj4+MjRdPDwyNHxhW2Y+Pj4xNiYyNTVdPDwxNnxhW2M+Pj44JjI1NV08PDh8YVsyNTUmbF0pXm5bZCsrXSxmPShhW2Y+Pj4yNF08PDI0fGFbYz4+PjE2JjI1NV08PDE2fGFbbD4+PjgmMjU1XTw8OHxhWzI1NSZoXSlebltkKytdLGVbdF09ZyxlW3QrMV09eSxlW3QrMl09dixlW3QrM109Zn0sa2V5U2l6ZTo4fSk7ZS5BRVM9dC5fY3JlYXRlSGVscGVyKHIpfSgpLG4ubW9kZS5FQ0I9ZnVuY3Rpb24oKXt2YXIgZT1uLmxpYi5CbG9ja0NpcGhlck1vZGUuZXh0ZW5kKCk7cmV0dXJuIGUuRW5jcnlwdG9yPWUuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9jaXBoZXIuZW5jcnlwdEJsb2NrKGUsdCl9fSksZS5EZWNyeXB0b3I9ZS5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3RoaXMuX2NpcGhlci5kZWNyeXB0QmxvY2soZSx0KX19KSxlfSgpLGUuZXhwb3J0cz1ufSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxvPW4oOSksYT0ocihvKSxuKDcpKSx1PShyKGEpLG4oMTIpKSxjPShyKHUpLG4oMTQpKSxsPXIoYyksaD1uKDE3KSxmPXIoaCksZD0obig4KSxuKDEzKSkscD1yKGQpLGc9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuc3Vic2NyaWJlRW5kcG9pbnQscj10LmxlYXZlRW5kcG9pbnQscz10LmhlYXJ0YmVhdEVuZHBvaW50LG89dC5zZXRTdGF0ZUVuZHBvaW50LGE9dC50aW1lRW5kcG9pbnQsdT10LmNvbmZpZyxjPXQuY3J5cHRvLGg9dC5saXN0ZW5lck1hbmFnZXI7aSh0aGlzLGUpLHRoaXMuX2xpc3RlbmVyTWFuYWdlcj1oLHRoaXMuX2NvbmZpZz11LHRoaXMuX2xlYXZlRW5kcG9pbnQ9cix0aGlzLl9oZWFydGJlYXRFbmRwb2ludD1zLHRoaXMuX3NldFN0YXRlRW5kcG9pbnQ9byx0aGlzLl9zdWJzY3JpYmVFbmRwb2ludD1uLHRoaXMuX2NyeXB0bz1jLHRoaXMuX2NoYW5uZWxzPXt9LHRoaXMuX3ByZXNlbmNlQ2hhbm5lbHM9e30sdGhpcy5fY2hhbm5lbEdyb3Vwcz17fSx0aGlzLl9wcmVzZW5jZUNoYW5uZWxHcm91cHM9e30sdGhpcy5fcGVuZGluZ0NoYW5uZWxTdWJzY3JpcHRpb25zPVtdLHRoaXMuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zPVtdLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49MCx0aGlzLl9sYXN0VGltZXRva2VuPTAsdGhpcy5fc3RvcmVkVGltZXRva2VuPW51bGwsdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSExLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXI9bmV3IGwuZGVmYXVsdCh7dGltZUVuZHBvaW50OmF9KX1yZXR1cm4gcyhlLFt7a2V5OlwiYWRhcHRTdGF0ZUNoYW5nZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcyxyPWUuc3RhdGUsaT1lLmNoYW5uZWxzLHM9dm9pZCAwPT09aT9bXTppLG89ZS5jaGFubmVsR3JvdXBzLGE9dm9pZCAwPT09bz9bXTpvO3JldHVybiBzLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVscyYmKG4uX2NoYW5uZWxzW2VdLnN0YXRlPXIpfSksYS5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UgaW4gbi5fY2hhbm5lbEdyb3VwcyYmKG4uX2NoYW5uZWxHcm91cHNbZV0uc3RhdGU9cil9KSx0aGlzLl9zZXRTdGF0ZUVuZHBvaW50KHtzdGF0ZTpyLGNoYW5uZWxzOnMsY2hhbm5lbEdyb3VwczphfSx0KX19LHtrZXk6XCJhZGFwdFN1YnNjcmliZUNoYW5nZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMsbj1lLnRpbWV0b2tlbixyPWUuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1lLmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1zP1tdOnMsYT1lLndpdGhQcmVzZW5jZSx1PXZvaWQgMCE9PWEmJmE7aWYoIXRoaXMuX2NvbmZpZy5zdWJzY3JpYmVLZXl8fFwiXCI9PT10aGlzLl9jb25maWcuc3Vic2NyaWJlS2V5KXJldHVybiB2b2lkKGNvbnNvbGUmJmNvbnNvbGUubG9nJiZjb25zb2xlLmxvZyhcInN1YnNjcmliZSBrZXkgbWlzc2luZzsgYWJvcnRpbmcgc3Vic2NyaWJlXCIpKTtuJiYodGhpcy5fbGFzdFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49biksXCIwXCIhPT10aGlzLl9jdXJyZW50VGltZXRva2VuJiYodGhpcy5fc3RvcmVkVGltZXRva2VuPXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sdGhpcy5fY3VycmVudFRpbWV0b2tlbj0wKSxpLmZvckVhY2goZnVuY3Rpb24oZSl7dC5fY2hhbm5lbHNbZV09e3N0YXRlOnt9fSx1JiYodC5fcHJlc2VuY2VDaGFubmVsc1tlXT17fSksdC5fcGVuZGluZ0NoYW5uZWxTdWJzY3JpcHRpb25zLnB1c2goZSl9KSxvLmZvckVhY2goZnVuY3Rpb24oZSl7dC5fY2hhbm5lbEdyb3Vwc1tlXT17c3RhdGU6e319LHUmJih0Ll9wcmVzZW5jZUNoYW5uZWxHcm91cHNbZV09e30pLHQuX3BlbmRpbmdDaGFubmVsR3JvdXBTdWJzY3JpcHRpb25zLnB1c2goZSl9KSx0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITEsdGhpcy5yZWNvbm5lY3QoKX19LHtrZXk6XCJhZGFwdFVuc3Vic2NyaWJlQ2hhbmdlXCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXtcbnZhciBuPXRoaXMscj1lLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9ZS5jaGFubmVsR3JvdXBzLG89dm9pZCAwPT09cz9bXTpzO2kuZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxzJiZkZWxldGUgbi5fY2hhbm5lbHNbZV0sZSBpbiBuLl9wcmVzZW5jZUNoYW5uZWxzJiZkZWxldGUgbi5fcHJlc2VuY2VDaGFubmVsc1tlXX0pLG8uZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxHcm91cHMmJmRlbGV0ZSBuLl9jaGFubmVsR3JvdXBzW2VdLGUgaW4gbi5fcHJlc2VuY2VDaGFubmVsR3JvdXBzJiZkZWxldGUgbi5fY2hhbm5lbEdyb3Vwc1tlXX0pLCExIT09dGhpcy5fY29uZmlnLnN1cHByZXNzTGVhdmVFdmVudHN8fHR8fHRoaXMuX2xlYXZlRW5kcG9pbnQoe2NoYW5uZWxzOmksY2hhbm5lbEdyb3VwczpvfSxmdW5jdGlvbihlKXtlLmFmZmVjdGVkQ2hhbm5lbHM9aSxlLmFmZmVjdGVkQ2hhbm5lbEdyb3Vwcz1vLGUuY3VycmVudFRpbWV0b2tlbj1uLl9jdXJyZW50VGltZXRva2VuLGUubGFzdFRpbWV0b2tlbj1uLl9sYXN0VGltZXRva2VuLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKX0pLDA9PT1PYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscykubGVuZ3RoJiYwPT09T2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVscykubGVuZ3RoJiYwPT09T2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3VwcykubGVuZ3RoJiYwPT09T2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzKS5sZW5ndGgmJih0aGlzLl9sYXN0VGltZXRva2VuPTAsdGhpcy5fY3VycmVudFRpbWV0b2tlbj0wLHRoaXMuX3N0b3JlZFRpbWV0b2tlbj1udWxsLHRoaXMuX3JlZ2lvbj1udWxsLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIuc3RvcFBvbGxpbmcoKSksdGhpcy5yZWNvbm5lY3QoKX19LHtrZXk6XCJ1bnN1YnNjcmliZUFsbFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuYWRhcHRVbnN1YnNjcmliZUNoYW5nZSh7Y2hhbm5lbHM6dGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbHMoKSxjaGFubmVsR3JvdXBzOnRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHMoKX0sZSl9fSx7a2V5OlwiZ2V0U3Vic2NyaWJlZENoYW5uZWxzXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpfX0se2tleTpcImdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3Vwcyl9fSx7a2V5OlwicmVjb25uZWN0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdGFydFN1YnNjcmliZUxvb3AoKSx0aGlzLl9yZWdpc3RlckhlYXJ0YmVhdFRpbWVyKCl9fSx7a2V5OlwiZGlzY29ubmVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RvcFN1YnNjcmliZUxvb3AoKSx0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLnN0b3BQb2xsaW5nKCl9fSx7a2V5OlwiX3JlZ2lzdGVySGVhcnRiZWF0VGltZXJcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BIZWFydGJlYXRUaW1lcigpLHRoaXMuX3BlcmZvcm1IZWFydGJlYXRMb29wKCksdGhpcy5faGVhcnRiZWF0VGltZXI9c2V0SW50ZXJ2YWwodGhpcy5fcGVyZm9ybUhlYXJ0YmVhdExvb3AuYmluZCh0aGlzKSwxZTMqdGhpcy5fY29uZmlnLmdldEhlYXJ0YmVhdEludGVydmFsKCkpfX0se2tleTpcIl9zdG9wSGVhcnRiZWF0VGltZXJcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2hlYXJ0YmVhdFRpbWVyJiYoY2xlYXJJbnRlcnZhbCh0aGlzLl9oZWFydGJlYXRUaW1lciksdGhpcy5faGVhcnRiZWF0VGltZXI9bnVsbCl9fSx7a2V5OlwiX3BlcmZvcm1IZWFydGJlYXRMb29wXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLHQ9T2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpLG49T2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3Vwcykscj17fTtpZigwIT09dC5sZW5ndGh8fDAhPT1uLmxlbmd0aCl7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBuPWUuX2NoYW5uZWxzW3RdLnN0YXRlO09iamVjdC5rZXlzKG4pLmxlbmd0aCYmKHJbdF09bil9KSxuLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIG49ZS5fY2hhbm5lbEdyb3Vwc1t0XS5zdGF0ZTtPYmplY3Qua2V5cyhuKS5sZW5ndGgmJihyW3RdPW4pfSk7dmFyIGk9ZnVuY3Rpb24odCl7dC5lcnJvciYmZS5fY29uZmlnLmFubm91bmNlRmFpbGVkSGVhcnRiZWF0cyYmZS5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHQpLCF0LmVycm9yJiZlLl9jb25maWcuYW5ub3VuY2VTdWNjZXNzZnVsSGVhcnRiZWF0cyYmZS5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHQpfTt0aGlzLl9oZWFydGJlYXRFbmRwb2ludCh7Y2hhbm5lbHM6dCxjaGFubmVsR3JvdXBzOm4sc3RhdGU6cn0saS5iaW5kKHRoaXMpKX19fSx7a2V5OlwiX3N0YXJ0U3Vic2NyaWJlTG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RvcFN1YnNjcmliZUxvb3AoKTt2YXIgZT1bXSx0PVtdO2lmKE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3JldHVybiBlLnB1c2godCl9KSxPYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxzKS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3JldHVybiBlLnB1c2godCtcIi1wbnByZXNcIil9KSxPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVsR3JvdXBzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZSl9KSxPYmplY3Qua2V5cyh0aGlzLl9wcmVzZW5jZUNoYW5uZWxHcm91cHMpLmZvckVhY2goZnVuY3Rpb24oZSl7cmV0dXJuIHQucHVzaChlK1wiLXBucHJlc1wiKX0pLDAhPT1lLmxlbmd0aHx8MCE9PXQubGVuZ3RoKXt2YXIgbj17Y2hhbm5lbHM6ZSxjaGFubmVsR3JvdXBzOnQsdGltZXRva2VuOnRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sZmlsdGVyRXhwcmVzc2lvbjp0aGlzLl9jb25maWcuZmlsdGVyRXhwcmVzc2lvbixyZWdpb246dGhpcy5fcmVnaW9ufTt0aGlzLl9zdWJzY3JpYmVDYWxsPXRoaXMuX3N1YnNjcmliZUVuZHBvaW50KG4sdGhpcy5fcHJvY2Vzc1N1YnNjcmliZVJlc3BvbnNlLmJpbmQodGhpcykpfX19LHtrZXk6XCJfcHJvY2Vzc1N1YnNjcmliZVJlc3BvbnNlXCIsdmFsdWU6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzO2lmKGUuZXJyb3IpcmV0dXJuIHZvaWQoZS5jYXRlZ29yeT09PXAuZGVmYXVsdC5QTlRpbWVvdXRDYXRlZ29yeT90aGlzLl9zdGFydFN1YnNjcmliZUxvb3AoKTplLmNhdGVnb3J5PT09cC5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5Pyh0aGlzLmRpc2Nvbm5lY3QoKSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLm9uUmVjb25uZWN0aW9uKGZ1bmN0aW9uKCl7bi5yZWNvbm5lY3QoKSxuLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITA7dmFyIHQ9e2NhdGVnb3J5OnAuZGVmYXVsdC5QTlJlY29ubmVjdGVkQ2F0ZWdvcnksb3BlcmF0aW9uOmUub3BlcmF0aW9uLGxhc3RUaW1ldG9rZW46bi5fbGFzdFRpbWV0b2tlbixjdXJyZW50VGltZXRva2VuOm4uX2N1cnJlbnRUaW1ldG9rZW59O24uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KX0pLHRoaXMuX3JlY29ubmVjdGlvbk1hbmFnZXIuc3RhcnRQb2xsaW5nKCksdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpKTplLmNhdGVnb3J5PT09cC5kZWZhdWx0LlBOQmFkUmVxdWVzdENhdGVnb3J5Pyh0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSkpOnRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKSk7aWYodGhpcy5fc3RvcmVkVGltZXRva2VuPyh0aGlzLl9jdXJyZW50VGltZXRva2VuPXRoaXMuX3N0b3JlZFRpbWV0b2tlbix0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCk6KHRoaXMuX2xhc3RUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPXQubWV0YWRhdGEudGltZXRva2VuKSwhdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkKXt2YXIgcj17fTtyLmNhdGVnb3J5PXAuZGVmYXVsdC5QTkNvbm5lY3RlZENhdGVnb3J5LHIub3BlcmF0aW9uPWUub3BlcmF0aW9uLHIuYWZmZWN0ZWRDaGFubmVscz10aGlzLl9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnMsci5zdWJzY3JpYmVkQ2hhbm5lbHM9dGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbHMoKSxyLmFmZmVjdGVkQ2hhbm5lbEdyb3Vwcz10aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucyxyLmxhc3RUaW1ldG9rZW49dGhpcy5fbGFzdFRpbWV0b2tlbixyLmN1cnJlbnRUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9zdWJzY3JpcHRpb25TdGF0dXNBbm5vdW5jZWQ9ITAsdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKHIpLHRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucz1bXX12YXIgaT10Lm1lc3NhZ2VzfHxbXSxzPXRoaXMuX2NvbmZpZy5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkO2lmKHMmJmkubGVuZ3RoPj1zKXt2YXIgbz17fTtvLmNhdGVnb3J5PXAuZGVmYXVsdC5QTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5LG8ub3BlcmF0aW9uPWUub3BlcmF0aW9uLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhvKX1pLmZvckVhY2goZnVuY3Rpb24oZSl7dmFyIHQ9ZS5jaGFubmVsLHI9ZS5zdWJzY3JpcHRpb25NYXRjaCxpPWUucHVibGlzaE1ldGFEYXRhO2lmKHQ9PT1yJiYocj1udWxsKSxmLmRlZmF1bHQuZW5kc1dpdGgoZS5jaGFubmVsLFwiLXBucHJlc1wiKSl7dmFyIHM9e307cy5jaGFubmVsPW51bGwscy5zdWJzY3JpcHRpb249bnVsbCxzLmFjdHVhbENoYW5uZWw9bnVsbCE9cj90Om51bGwscy5zdWJzY3JpYmVkQ2hhbm5lbD1udWxsIT1yP3I6dCx0JiYocy5jaGFubmVsPXQuc3Vic3RyaW5nKDAsdC5sYXN0SW5kZXhPZihcIi1wbnByZXNcIikpKSxyJiYocy5zdWJzY3JpcHRpb249ci5zdWJzdHJpbmcoMCxyLmxhc3RJbmRleE9mKFwiLXBucHJlc1wiKSkpLHMuYWN0aW9uPWUucGF5bG9hZC5hY3Rpb24scy5zdGF0ZT1lLnBheWxvYWQuZGF0YSxzLnRpbWV0b2tlbj1pLnB1Ymxpc2hUaW1ldG9rZW4scy5vY2N1cGFuY3k9ZS5wYXlsb2FkLm9jY3VwYW5jeSxzLnV1aWQ9ZS5wYXlsb2FkLnV1aWQscy50aW1lc3RhbXA9ZS5wYXlsb2FkLnRpbWVzdGFtcCxlLnBheWxvYWQuam9pbiYmKHMuam9pbj1lLnBheWxvYWQuam9pbiksZS5wYXlsb2FkLmxlYXZlJiYocy5sZWF2ZT1lLnBheWxvYWQubGVhdmUpLGUucGF5bG9hZC50aW1lb3V0JiYocy50aW1lb3V0PWUucGF5bG9hZC50aW1lb3V0KSxuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VQcmVzZW5jZShzKX1lbHNle3ZhciBvPXt9O28uY2hhbm5lbD1udWxsLG8uc3Vic2NyaXB0aW9uPW51bGwsby5hY3R1YWxDaGFubmVsPW51bGwhPXI/dDpudWxsLG8uc3Vic2NyaWJlZENoYW5uZWw9bnVsbCE9cj9yOnQsby5jaGFubmVsPXQsby5zdWJzY3JpcHRpb249cixvLnRpbWV0b2tlbj1pLnB1Ymxpc2hUaW1ldG9rZW4sby5wdWJsaXNoZXI9ZS5pc3N1aW5nQ2xpZW50SWQsZS51c2VyTWV0YWRhdGEmJihvLnVzZXJNZXRhZGF0YT1lLnVzZXJNZXRhZGF0YSksbi5fY29uZmlnLmNpcGhlcktleT9vLm1lc3NhZ2U9bi5fY3J5cHRvLmRlY3J5cHQoZS5wYXlsb2FkKTpvLm1lc3NhZ2U9ZS5wYXlsb2FkLG4uX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZU1lc3NhZ2Uobyl9fSksdGhpcy5fcmVnaW9uPXQubWV0YWRhdGEucmVnaW9uLHRoaXMuX3N0YXJ0U3Vic2NyaWJlTG9vcCgpfX0se2tleTpcIl9zdG9wU3Vic2NyaWJlTG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3Vic2NyaWJlQ2FsbCYmKHRoaXMuX3N1YnNjcmliZUNhbGwuYWJvcnQoKSx0aGlzLl9zdWJzY3JpYmVDYWxsPW51bGwpfX1dKSxlfSgpO3QuZGVmYXVsdD1nLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLHM9KG4oOCksbigxMykpLG89ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShzKSxhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSgpe3IodGhpcyxlKSx0aGlzLl9saXN0ZW5lcnM9W119cmV0dXJuIGkoZSxbe2tleTpcImFkZExpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fbGlzdGVuZXJzLnB1c2goZSl9fSx7a2V5OlwicmVtb3ZlTGlzdGVuZXJcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1bXTt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihuKXtuIT09ZSYmdC5wdXNoKG4pfSksdGhpcy5fbGlzdGVuZXJzPXR9fSx7a2V5OlwicmVtb3ZlQWxsTGlzdGVuZXJzXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lcnM9W119fSx7a2V5OlwiYW5ub3VuY2VQcmVzZW5jZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QucHJlc2VuY2UmJnQucHJlc2VuY2UoZSl9KX19LHtrZXk6XCJhbm5vdW5jZVN0YXR1c1wiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3Quc3RhdHVzJiZ0LnN0YXR1cyhlKX0pfX0se2tleTpcImFubm91bmNlTWVzc2FnZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QubWVzc2FnZSYmdC5tZXNzYWdlKGUpfSl9fSx7a2V5OlwiYW5ub3VuY2VOZXR3b3JrVXBcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXt9O2UuY2F0ZWdvcnk9by5kZWZhdWx0LlBOTmV0d29ya1VwQ2F0ZWdvcnksdGhpcy5hbm5vdW5jZVN0YXR1cyhlKX19LHtrZXk6XCJhbm5vdW5jZU5ldHdvcmtEb3duXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT17fTtlLmNhdGVnb3J5PW8uZGVmYXVsdC5QTk5ldHdvcmtEb3duQ2F0ZWdvcnksdGhpcy5hbm5vdW5jZVN0YXR1cyhlKX19XSksZX0oKTt0LmRlZmF1bHQ9YSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD17UE5OZXR3b3JrVXBDYXRlZ29yeTpcIlBOTmV0d29ya1VwQ2F0ZWdvcnlcIixQTk5ldHdvcmtEb3duQ2F0ZWdvcnk6XCJQTk5ldHdvcmtEb3duQ2F0ZWdvcnlcIixQTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTpcIlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5XCIsUE5UaW1lb3V0Q2F0ZWdvcnk6XCJQTlRpbWVvdXRDYXRlZ29yeVwiLFBOQmFkUmVxdWVzdENhdGVnb3J5OlwiUE5CYWRSZXF1ZXN0Q2F0ZWdvcnlcIixQTkFjY2Vzc0RlbmllZENhdGVnb3J5OlwiUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeVwiLFBOVW5rbm93bkNhdGVnb3J5OlwiUE5Vbmtub3duQ2F0ZWdvcnlcIixQTlJlY29ubmVjdGVkQ2F0ZWdvcnk6XCJQTlJlY29ubmVjdGVkQ2F0ZWdvcnlcIixQTkNvbm5lY3RlZENhdGVnb3J5OlwiUE5Db25uZWN0ZWRDYXRlZ29yeVwiLFBOUmVxdWVzdE1lc3NhZ2VDb3VudEV4Y2VlZGVkQ2F0ZWdvcnk6XCJQTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5XCJ9LGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLHM9bigxNSksbz0oZnVuY3Rpb24oZSl7ZSYmZS5fX2VzTW9kdWxlfShzKSxuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LnRpbWVFbmRwb2ludDtyKHRoaXMsZSksdGhpcy5fdGltZUVuZHBvaW50PW59cmV0dXJuIGkoZSxbe2tleTpcIm9uUmVjb25uZWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dGhpcy5fcmVjb25uZWN0aW9uQ2FsbGJhY2s9ZX19LHtrZXk6XCJzdGFydFBvbGxpbmdcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3RpbWVUaW1lcj1zZXRJbnRlcnZhbCh0aGlzLl9wZXJmb3JtVGltZUxvb3AuYmluZCh0aGlzKSwzZTMpfX0se2tleTpcInN0b3BQb2xsaW5nXCIsdmFsdWU6ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKHRoaXMuX3RpbWVUaW1lcil9fSx7a2V5OlwiX3BlcmZvcm1UaW1lTG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt0aGlzLl90aW1lRW5kcG9pbnQoZnVuY3Rpb24odCl7dC5lcnJvcnx8KGNsZWFySW50ZXJ2YWwoZS5fdGltZVRpbWVyKSxlLl9yZWNvbm5lY3Rpb25DYWxsYmFjaygpKX0pfX1dKSxlfSgpKTt0LmRlZmF1bHQ9byxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5UaW1lT3BlcmF0aW9ufWZ1bmN0aW9uIGkoKXtyZXR1cm5cIi90aW1lLzBcIn1mdW5jdGlvbiBzKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBvKCl7cmV0dXJue319ZnVuY3Rpb24gYSgpe3JldHVybiExfWZ1bmN0aW9uIHUoZSx0KXtyZXR1cm57dGltZXRva2VuOnRbMF19fWZ1bmN0aW9uIGMoKXt9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LmdldFVSTD1pLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9cyx0LnByZXBhcmVQYXJhbXM9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQuaGFuZGxlUmVzcG9uc2U9dSx0LnZhbGlkYXRlUGFyYW1zPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9e1BOVGltZU9wZXJhdGlvbjpcIlBOVGltZU9wZXJhdGlvblwiLFBOSGlzdG9yeU9wZXJhdGlvbjpcIlBOSGlzdG9yeU9wZXJhdGlvblwiLFBORmV0Y2hNZXNzYWdlc09wZXJhdGlvbjpcIlBORmV0Y2hNZXNzYWdlc09wZXJhdGlvblwiLFBOU3Vic2NyaWJlT3BlcmF0aW9uOlwiUE5TdWJzY3JpYmVPcGVyYXRpb25cIixQTlVuc3Vic2NyaWJlT3BlcmF0aW9uOlwiUE5VbnN1YnNjcmliZU9wZXJhdGlvblwiLFBOUHVibGlzaE9wZXJhdGlvbjpcIlBOUHVibGlzaE9wZXJhdGlvblwiLFBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbjpcIlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvblwiLFBOUmVtb3ZlQWxsUHVzaE5vdGlmaWNhdGlvbnNPcGVyYXRpb246XCJQTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9uXCIsUE5XaGVyZU5vd09wZXJhdGlvbjpcIlBOV2hlcmVOb3dPcGVyYXRpb25cIixQTlNldFN0YXRlT3BlcmF0aW9uOlwiUE5TZXRTdGF0ZU9wZXJhdGlvblwiLFBOSGVyZU5vd09wZXJhdGlvbjpcIlBOSGVyZU5vd09wZXJhdGlvblwiLFBOR2V0U3RhdGVPcGVyYXRpb246XCJQTkdldFN0YXRlT3BlcmF0aW9uXCIsUE5IZWFydGJlYXRPcGVyYXRpb246XCJQTkhlYXJ0YmVhdE9wZXJhdGlvblwiLFBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvbjpcIlBOQ2hhbm5lbEdyb3Vwc09wZXJhdGlvblwiLFBOUmVtb3ZlR3JvdXBPcGVyYXRpb246XCJQTlJlbW92ZUdyb3VwT3BlcmF0aW9uXCIsUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9uOlwiUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9uXCIsUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb246XCJQTkFkZENoYW5uZWxzVG9Hcm91cE9wZXJhdGlvblwiLFBOUmVtb3ZlQ2hhbm5lbHNGcm9tR3JvdXBPcGVyYXRpb246XCJQTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9uXCIsUE5BY2Nlc3NNYW5hZ2VyR3JhbnQ6XCJQTkFjY2Vzc01hbmFnZXJHcmFudFwiLFBOQWNjZXNzTWFuYWdlckF1ZGl0OlwiUE5BY2Nlc3NNYW5hZ2VyQXVkaXRcIn0sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUpe3ZhciB0PVtdO3JldHVybiBPYmplY3Qua2V5cyhlKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZSl9KSx0fWZ1bmN0aW9uIHIoZSl7cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChlKS5yZXBsYWNlKC9bIX4qJygpXS9nLGZ1bmN0aW9uKGUpe3JldHVyblwiJVwiK2UuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX0pfWZ1bmN0aW9uIGkoZSl7cmV0dXJuIG4oZSkuc29ydCgpfWZ1bmN0aW9uIHMoZSl7cmV0dXJuIGkoZSkubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0K1wiPVwiK3IoZVt0XSl9KS5qb2luKFwiJlwiKX1mdW5jdGlvbiBvKGUsdCl7cmV0dXJuLTEhPT1lLmluZGV4T2YodCx0aGlzLmxlbmd0aC10Lmxlbmd0aCl9ZnVuY3Rpb24gYSgpe3ZhciBlPXZvaWQgMCx0PXZvaWQgMDtyZXR1cm57cHJvbWlzZTpuZXcgUHJvbWlzZShmdW5jdGlvbihuLHIpe2U9bix0PXJ9KSxyZWplY3Q6dCxmdWxmaWxsOmV9fWUuZXhwb3J0cz17c2lnblBhbUZyb21QYXJhbXM6cyxlbmRzV2l0aDpvLGNyZWF0ZVByb21pc2U6YSxlbmNvZGVTdHJpbmc6cn19LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBzKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gbyhlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfWZ1bmN0aW9uIGEoZSx0KXtyZXR1cm4gZS50eXBlPXQsZS5lcnJvcj0hMCxlfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGEoe21lc3NhZ2U6ZX0sXCJ2YWxpZGF0aW9uRXJyb3JcIil9ZnVuY3Rpb24gYyhlLHQsbil7cmV0dXJuIGUudXNlUG9zdCYmZS51c2VQb3N0KHQsbik/ZS5wb3N0VVJMKHQsbik6ZS5nZXRVUkwodCxuKX1mdW5jdGlvbiBsKGUpe3ZhciB0PVwiUHViTnViLUpTLVwiK2Uuc2RrRmFtaWx5O3JldHVybiBlLnBhcnRuZXJJZCYmKHQrPVwiLVwiK2UucGFydG5lcklkKSx0Kz1cIi9cIitlLmdldFZlcnNpb24oKX1mdW5jdGlvbiBoKGUsdCxuKXt2YXIgcj1lLmNvbmZpZyxpPWUuY3J5cHRvO24udGltZXN0YW1wPU1hdGguZmxvb3IoKG5ldyBEYXRlKS5nZXRUaW1lKCkvMWUzKTt2YXIgcz1yLnN1YnNjcmliZUtleStcIlxcblwiK3IucHVibGlzaEtleStcIlxcblwiK3QrXCJcXG5cIjtzKz1nLmRlZmF1bHQuc2lnblBhbUZyb21QYXJhbXMobik7dmFyIG89aS5ITUFDU0hBMjU2KHMpO289by5yZXBsYWNlKC9cXCsvZyxcIi1cIiksbz1vLnJlcGxhY2UoL1xcLy9nLFwiX1wiKSxuLnNpZ25hdHVyZT1vfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD1mdW5jdGlvbihlLHQpe3ZhciBuPWUubmV0d29ya2luZyxyPWUuY29uZmlnLGk9bnVsbCxzPW51bGwsbz17fTt0LmdldE9wZXJhdGlvbigpPT09Yi5kZWZhdWx0LlBOVGltZU9wZXJhdGlvbnx8dC5nZXRPcGVyYXRpb24oKT09PWIuZGVmYXVsdC5QTkNoYW5uZWxHcm91cHNPcGVyYXRpb24/aT1hcmd1bWVudHMubGVuZ3RoPD0yP3ZvaWQgMDphcmd1bWVudHNbMl06KG89YXJndW1lbnRzLmxlbmd0aDw9Mj92b2lkIDA6YXJndW1lbnRzWzJdLGk9YXJndW1lbnRzLmxlbmd0aDw9Mz92b2lkIDA6YXJndW1lbnRzWzNdKSxcInVuZGVmaW5lZFwiPT10eXBlb2YgUHJvbWlzZXx8aXx8KHM9Zy5kZWZhdWx0LmNyZWF0ZVByb21pc2UoKSk7dmFyIGE9dC52YWxpZGF0ZVBhcmFtcyhlLG8pO2lmKCFhKXt2YXIgZj10LnByZXBhcmVQYXJhbXMoZSxvKSxwPWModCxlLG8pLHk9dm9pZCAwLHY9e3VybDpwLG9wZXJhdGlvbjp0LmdldE9wZXJhdGlvbigpLHRpbWVvdXQ6dC5nZXRSZXF1ZXN0VGltZW91dChlKX07Zi51dWlkPXIuVVVJRCxmLnBuc2RrPWwociksci51c2VJbnN0YW5jZUlkJiYoZi5pbnN0YW5jZWlkPXIuaW5zdGFuY2VJZCksci51c2VSZXF1ZXN0SWQmJihmLnJlcXVlc3RpZD1kLmRlZmF1bHQudjQoKSksdC5pc0F1dGhTdXBwb3J0ZWQoKSYmci5nZXRBdXRoS2V5KCkmJihmLmF1dGg9ci5nZXRBdXRoS2V5KCkpLHIuc2VjcmV0S2V5JiZoKGUscCxmKTt2YXIgbT1mdW5jdGlvbihuLHIpe2lmKG4uZXJyb3IpcmV0dXJuIHZvaWQoaT9pKG4pOnMmJnMucmVqZWN0KG5ldyBfKFwiUHViTnViIGNhbGwgZmFpbGVkLCBjaGVjayBzdGF0dXMgZm9yIGRldGFpbHNcIixuKSkpO3ZhciBhPXQuaGFuZGxlUmVzcG9uc2UoZSxyLG8pO2k/aShuLGEpOnMmJnMuZnVsZmlsbChhKX07aWYodC51c2VQb3N0JiZ0LnVzZVBvc3QoZSxvKSl7dmFyIGs9dC5wb3N0UGF5bG9hZChlLG8pO3k9bi5QT1NUKGYsayx2LG0pfWVsc2UgeT1uLkdFVChmLHYsbSk7cmV0dXJuIHQuZ2V0T3BlcmF0aW9uKCk9PT1iLmRlZmF1bHQuUE5TdWJzY3JpYmVPcGVyYXRpb24/eTpzP3MucHJvbWlzZTp2b2lkIDB9cmV0dXJuIGk/aSh1KGEpKTpzPyhzLnJlamVjdChuZXcgXyhcIlZhbGlkYXRpb24gZmFpbGVkLCBjaGVjayBzdGF0dXMgZm9yIGRldGFpbHNcIix1KGEpKSkscy5wcm9taXNlKTp2b2lkIDB9O3ZhciBmPW4oMiksZD1yKGYpLHA9KG4oOCksbigxNykpLGc9cihwKSx5PW4oNyksdj0ocih5KSxuKDE2KSksYj1yKHYpLF89ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlLG4pe2kodGhpcyx0KTt2YXIgcj1zKHRoaXMsKHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwodGhpcyxlKSk7cmV0dXJuIHIubmFtZT1yLmNvbnN0cnVjdG9yLm5hbWUsci5zdGF0dXM9bixyLm1lc3NhZ2U9ZSxyfXJldHVybiBvKHQsZSksdH0oRXJyb3IpO2UuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkFkZENoYW5uZWxzVG9Hcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXQuY2hhbm5lbEdyb3VwLGk9ZS5jb25maWc7cmV0dXJuIHI/biYmMCE9PW4ubGVuZ3RoP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbHM7cmV0dXJue2FkZDoodm9pZCAwPT09bj9bXTpuKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9dC5jaGFubmVsR3JvdXAsaT1lLmNvbmZpZztyZXR1cm4gcj9uJiYwIT09bi5sZW5ndGg/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVscztyZXR1cm57cmVtb3ZlOih2b2lkIDA9PT1uP1tdOm4pLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOUmVtb3ZlR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwLHI9ZS5jb25maWc7cmV0dXJuIG4/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWwgR3JvdXBcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXA7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pK1wiL3JlbW92ZVwifWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKCl7cmV0dXJue319ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTkNoYW5uZWxHcm91cHNPcGVyYXRpb259ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwXCJ9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoKXtyZXR1cm57fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJue2dyb3Vwczp0LnBheWxvYWQuZ3JvdXBzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5DaGFubmVsc0Zvckdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cCxyPWUuY29uZmlnO3JldHVybiBuP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYygpe3JldHVybnt9fWZ1bmN0aW9uIGwoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dC5wYXlsb2FkLmNoYW5uZWxzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT10LmNoYW5uZWxzLHM9ZS5jb25maWc7cmV0dXJuIG4/cj9pJiYwIT09aS5sZW5ndGg/cy5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIitufWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5wdXNoR2F0ZXdheSxyPXQuY2hhbm5lbHM7cmV0dXJue3R5cGU6bixhZGQ6KHZvaWQgMD09PXI/W106cikuam9pbihcIixcIil9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT10LmNoYW5uZWxzLHM9ZS5jb25maWc7cmV0dXJuIG4/cj9pJiYwIT09aS5sZW5ndGg/cy5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIENoYW5uZWxzXCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIitufWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7dmFyIG49dC5wdXNoR2F0ZXdheSxyPXQuY2hhbm5lbHM7cmV0dXJue3R5cGU6bixyZW1vdmU6KHZvaWQgMD09PXI/W106cikuam9pbihcIixcIil9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5QdXNoTm90aWZpY2F0aW9uRW5hYmxlZENoYW5uZWxzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT1lLmNvbmZpZztyZXR1cm4gbj9yP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3JldHVybnt0eXBlOnQucHVzaEdhdGV3YXl9fWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUmVtb3ZlQWxsUHVzaE5vdGlmaWNhdGlvbnNPcGVyYXRpb259ZnVuY3Rpb24gaShlLHQpe3ZhciBuPXQuZGV2aWNlLHI9dC5wdXNoR2F0ZXdheSxpPWUuY29uZmlnO3JldHVybiBuP3I/aS5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIEdXIFR5cGUgKHB1c2hHYXRld2F5OiBnY20gb3IgYXBucylcIjpcIk1pc3NpbmcgRGV2aWNlIElEIChkZXZpY2UpXCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuZGV2aWNlO3JldHVyblwiL3YxL3B1c2gvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvZGV2aWNlcy9cIituK1wiL3JlbW92ZVwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KGUsdCl7cmV0dXJue3R5cGU6dC5wdXNoR2F0ZXdheX19ZnVuY3Rpb24gYygpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlVuc3Vic2NyaWJlT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcocykrXCIvbGVhdmVcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXt9O3JldHVybiByLmxlbmd0aD4wJiYoaVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksaX1mdW5jdGlvbiBsKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOV2hlcmVOb3dPcGVyYXRpb259ZnVuY3Rpb24gaShlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC51dWlkLGk9dm9pZCAwPT09cj9uLlVVSUQ6cjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL3V1aWQvXCIraX1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdSgpe3JldHVybnt9fWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm57Y2hhbm5lbHM6dC5wYXlsb2FkLmNoYW5uZWxzfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5IZWFydGJlYXRPcGVyYXRpb259ZnVuY3Rpb24gcyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhzKStcIi9oZWFydGJlYXRcIn1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXQuc3RhdGUscz12b2lkIDA9PT1pP3t9Omksbz1lLmNvbmZpZyxhPXt9O3JldHVybiByLmxlbmd0aD4wJiYoYVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksYS5zdGF0ZT1KU09OLnN0cmluZ2lmeShzKSxhLmhlYXJ0YmVhdD1vLmdldFByZXNlbmNlVGltZW91dCgpLGF9ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkdldFN0YXRlT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQudXVpZCxpPXZvaWQgMD09PXI/bi5VVUlEOnIscz10LmNoYW5uZWxzLG89dm9pZCAwPT09cz9bXTpzLGE9by5sZW5ndGg+MD9vLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKGEpK1wiL3V1aWQvXCIraX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXt9O3JldHVybiByLmxlbmd0aD4wJiYoaVtcImNoYW5uZWwtZ3JvdXBcIl09ci5qb2luKFwiLFwiKSksaX1mdW5jdGlvbiBsKGUsdCxuKXt2YXIgcj1uLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9bi5jaGFubmVsR3JvdXBzLG89dm9pZCAwPT09cz9bXTpzLGE9e307cmV0dXJuIDE9PT1pLmxlbmd0aCYmMD09PW8ubGVuZ3RoP2FbaVswXV09dC5wYXlsb2FkOmE9dC5wYXlsb2FkLHtjaGFubmVsczphfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5TZXRTdGF0ZU9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49ZS5jb25maWcscj10LnN0YXRlLGk9dC5jaGFubmVscyxzPXZvaWQgMD09PWk/W106aSxvPXQuY2hhbm5lbEdyb3VwcyxhPXZvaWQgMD09PW8/W106bztyZXR1cm4gcj9uLnN1YnNjcmliZUtleT8wPT09cy5sZW5ndGgmJjA9PT1hLmxlbmd0aD9cIlBsZWFzZSBwcm92aWRlIGEgbGlzdCBvZiBjaGFubmVscyBhbmQvb3IgY2hhbm5lbC1ncm91cHNcIjp2b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgU3RhdGVcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpK1wiL3V1aWQvXCIrbi5VVUlEK1wiL2RhdGFcIn1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuc3RhdGUscj10LmNoYW5uZWxHcm91cHMsaT12b2lkIDA9PT1yP1tdOnIscz17fTtyZXR1cm4gcy5zdGF0ZT1KU09OLnN0cmluZ2lmeShuKSxpLmxlbmd0aD4wJiYoc1tcImNoYW5uZWwtZ3JvdXBcIl09aS5qb2luKFwiLFwiKSksc31mdW5jdGlvbiBsKGUsdCl7cmV0dXJue3N0YXRlOnQucGF5bG9hZH19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOSGVyZU5vd09wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9dC5jaGFubmVsR3JvdXBzLG89dm9pZCAwPT09cz9bXTpzLGE9XCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleTtpZihpLmxlbmd0aD4wfHxvLmxlbmd0aD4wKXt2YXIgdT1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7YSs9XCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHUpfXJldHVybiBhfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXBzLHI9dm9pZCAwPT09bj9bXTpuLGk9dC5pbmNsdWRlVVVJRHMscz12b2lkIDA9PT1pfHxpLG89dC5pbmNsdWRlU3RhdGUsYT12b2lkIDAhPT1vJiZvLHU9e307cmV0dXJuIHN8fCh1LmRpc2FibGVfdXVpZHM9MSksYSYmKHUuc3RhdGU9MSksci5sZW5ndGg+MCYmKHVbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLHV9ZnVuY3Rpb24gbChlLHQsbil7dmFyIHI9bi5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPW4uY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PXM/W106cyxhPW4uaW5jbHVkZVVVSURzLHU9dm9pZCAwPT09YXx8YSxjPW4uaW5jbHVkZVN0YXRlLGw9dm9pZCAwIT09YyYmYztyZXR1cm4gaS5sZW5ndGg+MXx8by5sZW5ndGg+MHx8MD09PW8ubGVuZ3RoJiYwPT09aS5sZW5ndGg/ZnVuY3Rpb24oKXt2YXIgZT17fTtyZXR1cm4gZS50b3RhbENoYW5uZWxzPXQucGF5bG9hZC50b3RhbF9jaGFubmVscyxlLnRvdGFsT2NjdXBhbmN5PXQucGF5bG9hZC50b3RhbF9vY2N1cGFuY3ksZS5jaGFubmVscz17fSxPYmplY3Qua2V5cyh0LnBheWxvYWQuY2hhbm5lbHMpLmZvckVhY2goZnVuY3Rpb24obil7dmFyIHI9dC5wYXlsb2FkLmNoYW5uZWxzW25dLGk9W107cmV0dXJuIGUuY2hhbm5lbHNbbl09e29jY3VwYW50czppLG5hbWU6bixvY2N1cGFuY3k6ci5vY2N1cGFuY3l9LHUmJnIudXVpZHMuZm9yRWFjaChmdW5jdGlvbihlKXtsP2kucHVzaCh7c3RhdGU6ZS5zdGF0ZSx1dWlkOmUudXVpZH0pOmkucHVzaCh7c3RhdGU6bnVsbCx1dWlkOmV9KX0pLGV9KSxlfSgpOmZ1bmN0aW9uKCl7dmFyIGU9e30sbj1bXTtyZXR1cm4gZS50b3RhbENoYW5uZWxzPTEsZS50b3RhbE9jY3VwYW5jeT10Lm9jY3VwYW5jeSxlLmNoYW5uZWxzPXt9LGUuY2hhbm5lbHNbaVswXV09e29jY3VwYW50czpuLG5hbWU6aVswXSxvY2N1cGFuY3k6dC5vY2N1cGFuY3l9LHUmJnQudXVpZHMuZm9yRWFjaChmdW5jdGlvbihlKXtsP24ucHVzaCh7c3RhdGU6ZS5zdGF0ZSx1dWlkOmUudXVpZH0pOm4ucHVzaCh7c3RhdGU6bnVsbCx1dWlkOmV9KX0pLGV9KCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOQWNjZXNzTWFuYWdlckF1ZGl0fWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSl7cmV0dXJuXCIvdjIvYXV0aC9hdWRpdC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleX1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITF9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQuY2hhbm5lbCxyPXQuY2hhbm5lbEdyb3VwLGk9dC5hdXRoS2V5cyxzPXZvaWQgMD09PWk/W106aSxvPXt9O3JldHVybiBuJiYoby5jaGFubmVsPW4pLHImJihvW1wiY2hhbm5lbC1ncm91cFwiXT1yKSxzLmxlbmd0aD4wJiYoby5hdXRoPXMuam9pbihcIixcIikpLG99ZnVuY3Rpb24gYyhlLHQpe3JldHVybiB0LnBheWxvYWR9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOQWNjZXNzTWFuYWdlckdyYW50fWZ1bmN0aW9uIGkoZSl7dmFyIHQ9ZS5jb25maWc7cmV0dXJuIHQuc3Vic2NyaWJlS2V5P3QucHVibGlzaEtleT90LnNlY3JldEtleT92b2lkIDA6XCJNaXNzaW5nIFNlY3JldCBLZXlcIjpcIk1pc3NpbmcgUHVibGlzaCBLZXlcIjpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSl7cmV0dXJuXCIvdjIvYXV0aC9ncmFudC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleX1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITF9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj12b2lkIDA9PT1uP1tdOm4saT10LmNoYW5uZWxHcm91cHMscz12b2lkIDA9PT1pP1tdOmksbz10LnR0bCxhPXQucmVhZCx1PXZvaWQgMCE9PWEmJmEsYz10LndyaXRlLGw9dm9pZCAwIT09YyYmYyxoPXQubWFuYWdlLGY9dm9pZCAwIT09aCYmaCxkPXQuYXV0aEtleXMscD12b2lkIDA9PT1kP1tdOmQsZz17fTtyZXR1cm4gZy5yPXU/XCIxXCI6XCIwXCIsZy53PWw/XCIxXCI6XCIwXCIsZy5tPWY/XCIxXCI6XCIwXCIsci5sZW5ndGg+MCYmKGcuY2hhbm5lbD1yLmpvaW4oXCIsXCIpKSxzLmxlbmd0aD4wJiYoZ1tcImNoYW5uZWwtZ3JvdXBcIl09cy5qb2luKFwiLFwiKSkscC5sZW5ndGg+MCYmKGcuYXV0aD1wLmpvaW4oXCIsXCIpKSwob3x8MD09PW8pJiYoZy50dGw9byksZ31mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNyeXB0byxyPWUuY29uZmlnLGk9SlNPTi5zdHJpbmdpZnkodCk7cmV0dXJuIHIuY2lwaGVyS2V5JiYoaT1uLmVuY3J5cHQoaSksaT1KU09OLnN0cmluZ2lmeShpKSksaX1mdW5jdGlvbiBzKCl7cmV0dXJuIHYuZGVmYXVsdC5QTlB1Ymxpc2hPcGVyYXRpb259ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5tZXNzYWdlO3JldHVybiB0LmNoYW5uZWw/cj9uLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgTWVzc2FnZVwiOlwiTWlzc2luZyBDaGFubmVsXCJ9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQuc2VuZEJ5UG9zdDtyZXR1cm4gdm9pZCAwIT09biYmbn1mdW5jdGlvbiB1KGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWwscz10Lm1lc3NhZ2Usbz1pKGUscyk7cmV0dXJuXCIvcHVibGlzaC9cIituLnB1Ymxpc2hLZXkrXCIvXCIrbi5zdWJzY3JpYmVLZXkrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHIpK1wiLzAvXCIrXy5kZWZhdWx0LmVuY29kZVN0cmluZyhvKX1mdW5jdGlvbiBjKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWw7cmV0dXJuXCIvcHVibGlzaC9cIituLnB1Ymxpc2hLZXkrXCIvXCIrbi5zdWJzY3JpYmVLZXkrXCIvMC9cIitfLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHIpK1wiLzBcIn1mdW5jdGlvbiBsKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBoKCl7cmV0dXJuITB9ZnVuY3Rpb24gZihlLHQpe3JldHVybiBpKGUsdC5tZXNzYWdlKX1mdW5jdGlvbiBkKGUsdCl7dmFyIG49dC5tZXRhLHI9dC5yZXBsaWNhdGUsaT12b2lkIDA9PT1yfHxyLHM9dC5zdG9yZUluSGlzdG9yeSxvPXQudHRsLGE9e307cmV0dXJuIG51bGwhPXMmJihhLnN0b3JlPXM/XCIxXCI6XCIwXCIpLG8mJihhLnR0bD1vKSwhMT09PWkmJihhLm5vcmVwPVwidHJ1ZVwiKSxuJiZcIm9iamVjdFwiPT09KHZvaWQgMD09PW4/XCJ1bmRlZmluZWRcIjpnKG4pKSYmKGEubWV0YT1KU09OLnN0cmluZ2lmeShuKSksYX1mdW5jdGlvbiBwKGUsdCl7cmV0dXJue3RpbWV0b2tlbjp0WzJdfX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgZz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24oZSl7cmV0dXJuIHR5cGVvZiBlfTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZlLmNvbnN0cnVjdG9yPT09U3ltYm9sJiZlIT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiBlfTt0LmdldE9wZXJhdGlvbj1zLHQudmFsaWRhdGVQYXJhbXM9byx0LnVzZVBvc3Q9YSx0LmdldFVSTD11LHQucG9zdFVSTD1jLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9bCx0LmlzQXV0aFN1cHBvcnRlZD1oLHQucG9zdFBheWxvYWQ9Zix0LnByZXBhcmVQYXJhbXM9ZCx0LmhhbmRsZVJlc3BvbnNlPXA7dmFyIHk9KG4oOCksbigxNikpLHY9cih5KSxiPW4oMTcpLF89cihiKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPWUuY3J5cHRvO2lmKCFuLmNpcGhlcktleSlyZXR1cm4gdDt0cnl7cmV0dXJuIHIuZGVjcnlwdCh0KX1jYXRjaChlKXtyZXR1cm4gdH19ZnVuY3Rpb24gcygpe3JldHVybiBkLmRlZmF1bHQuUE5IaXN0b3J5T3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWwscj1lLmNvbmZpZztyZXR1cm4gbj9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgY2hhbm5lbFwifWZ1bmN0aW9uIGEoZSx0KXt2YXIgbj10LmNoYW5uZWw7cmV0dXJuXCIvdjIvaGlzdG9yeS9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK2cuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybiEwfWZ1bmN0aW9uIGwoZSx0KXt2YXIgbj10LnN0YXJ0LHI9dC5lbmQsaT10LnJldmVyc2Uscz10LmNvdW50LG89dm9pZCAwPT09cz8xMDA6cyxhPXQuc3RyaW5naWZpZWRUaW1lVG9rZW4sdT12b2lkIDAhPT1hJiZhLGM9e2luY2x1ZGVfdG9rZW46XCJ0cnVlXCJ9O3JldHVybiBjLmNvdW50PW8sbiYmKGMuc3RhcnQ9biksciYmKGMuZW5kPXIpLHUmJihjLnN0cmluZ19tZXNzYWdlX3Rva2VuPVwidHJ1ZVwiKSxudWxsIT1pJiYoYy5yZXZlcnNlPWkudG9TdHJpbmcoKSksY31mdW5jdGlvbiBoKGUsdCl7dmFyIG49e21lc3NhZ2VzOltdLHN0YXJ0VGltZVRva2VuOnRbMV0sZW5kVGltZVRva2VuOnRbMl19O3JldHVybiB0WzBdLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIHI9e3RpbWV0b2tlbjp0LnRpbWV0b2tlbixlbnRyeTppKGUsdC5tZXNzYWdlKX07bi5tZXNzYWdlcy5wdXNoKHIpfSksbn1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1zLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LmlzQXV0aFN1cHBvcnRlZD1jLHQucHJlcGFyZVBhcmFtcz1sLHQuaGFuZGxlUmVzcG9uc2U9aDt2YXIgZj0obig4KSxcbm4oMTYpKSxkPXIoZikscD1uKDE3KSxnPXIocCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7dmFyIG49ZS5jb25maWcscj1lLmNyeXB0bztpZighbi5jaXBoZXJLZXkpcmV0dXJuIHQ7dHJ5e3JldHVybiByLmRlY3J5cHQodCl9Y2F0Y2goZSl7cmV0dXJuIHR9fWZ1bmN0aW9uIHMoKXtyZXR1cm4gZC5kZWZhdWx0LlBORmV0Y2hNZXNzYWdlc09wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPWUuY29uZmlnO3JldHVybiBuJiYwIT09bi5sZW5ndGg/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIGNoYW5uZWxzXCJ9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj12b2lkIDA9PT1uP1tdOm4saT1lLmNvbmZpZyxzPXIubGVuZ3RoPjA/ci5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92My9oaXN0b3J5L3N1Yi1rZXkvXCIraS5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitnLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoKXtyZXR1cm4hMH1mdW5jdGlvbiBsKGUsdCl7dmFyIG49dC5zdGFydCxyPXQuZW5kLGk9dC5jb3VudCxzPXt9O3JldHVybiBpJiYocy5tYXg9aSksbiYmKHMuc3RhcnQ9biksciYmKHMuZW5kPXIpLHN9ZnVuY3Rpb24gaChlLHQpe3ZhciBuPXtjaGFubmVsczp7fX07cmV0dXJuIE9iamVjdC5rZXlzKHQuY2hhbm5lbHN8fHt9KS5mb3JFYWNoKGZ1bmN0aW9uKHIpe24uY2hhbm5lbHNbcl09W10sKHQuY2hhbm5lbHNbcl18fFtdKS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBzPXt9O3MuY2hhbm5lbD1yLHMuc3Vic2NyaXB0aW9uPW51bGwscy50aW1ldG9rZW49dC50aW1ldG9rZW4scy5tZXNzYWdlPWkoZSx0Lm1lc3NhZ2UpLG4uY2hhbm5lbHNbcl0ucHVzaChzKX0pfSksbn1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1zLHQudmFsaWRhdGVQYXJhbXM9byx0LmdldFVSTD1hLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9dSx0LmlzQXV0aFN1cHBvcnRlZD1jLHQucHJlcGFyZVBhcmFtcz1sLHQuaGFuZGxlUmVzcG9uc2U9aDt2YXIgZj0obig4KSxuKDE2KSksZD1yKGYpLHA9bigxNyksZz1yKHApfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5TdWJzY3JpYmVPcGVyYXRpb259ZnVuY3Rpb24gcyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9zdWJzY3JpYmUvXCIrbi5zdWJzY3JpYmVLZXkrXCIvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhzKStcIi8wXCJ9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0U3Vic2NyaWJlVGltZW91dCgpfWZ1bmN0aW9uIHUoKXtyZXR1cm4hMH1mdW5jdGlvbiBjKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxHcm91cHMsaT12b2lkIDA9PT1yP1tdOnIscz10LnRpbWV0b2tlbixvPXQuZmlsdGVyRXhwcmVzc2lvbixhPXQucmVnaW9uLHU9e2hlYXJ0YmVhdDpuLmdldFByZXNlbmNlVGltZW91dCgpfTtyZXR1cm4gaS5sZW5ndGg+MCYmKHVbXCJjaGFubmVsLWdyb3VwXCJdPWkuam9pbihcIixcIikpLG8mJm8ubGVuZ3RoPjAmJih1W1wiZmlsdGVyLWV4cHJcIl09bykscyYmKHUudHQ9cyksYSYmKHUudHI9YSksdX1mdW5jdGlvbiBsKGUsdCl7dmFyIG49W107dC5tLmZvckVhY2goZnVuY3Rpb24oZSl7dmFyIHQ9e3B1Ymxpc2hUaW1ldG9rZW46ZS5wLnQscmVnaW9uOmUucC5yfSxyPXtzaGFyZDpwYXJzZUludChlLmEsMTApLHN1YnNjcmlwdGlvbk1hdGNoOmUuYixjaGFubmVsOmUuYyxwYXlsb2FkOmUuZCxmbGFnczplLmYsaXNzdWluZ0NsaWVudElkOmUuaSxzdWJzY3JpYmVLZXk6ZS5rLG9yaWdpbmF0aW9uVGltZXRva2VuOmUubyx1c2VyTWV0YWRhdGE6ZS51LHB1Ymxpc2hNZXRhRGF0YTp0fTtuLnB1c2gocil9KTt2YXIgcj17dGltZXRva2VuOnQudC50LHJlZ2lvbjp0LnQucn07cmV0dXJue21lc3NhZ2VzOm4sbWV0YWRhdGE6cn19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz1uKDcpLGE9KHIobyksbigxMykpLHU9cihhKSxjPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10aGlzO2kodGhpcyxlKSx0aGlzLl9tb2R1bGVzPXt9LE9iamVjdC5rZXlzKHQpLmZvckVhY2goZnVuY3Rpb24oZSl7bi5fbW9kdWxlc1tlXT10W2VdLmJpbmQobil9KX1yZXR1cm4gcyhlLFt7a2V5OlwiaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2NvbmZpZz1lLHRoaXMuX21heFN1YkRvbWFpbj0yMCx0aGlzLl9jdXJyZW50U3ViRG9tYWluPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSp0aGlzLl9tYXhTdWJEb21haW4pLHRoaXMuX3Byb3ZpZGVkRlFETj0odGhpcy5fY29uZmlnLnNlY3VyZT9cImh0dHBzOi8vXCI6XCJodHRwOi8vXCIpK3RoaXMuX2NvbmZpZy5vcmlnaW4sdGhpcy5fY29yZVBhcmFtcz17fSx0aGlzLnNoaWZ0U3RhbmRhcmRPcmlnaW4oKX19LHtrZXk6XCJuZXh0T3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24oKXtpZigtMT09PXRoaXMuX3Byb3ZpZGVkRlFETi5pbmRleE9mKFwicHVic3ViLlwiKSlyZXR1cm4gdGhpcy5fcHJvdmlkZWRGUUROO3ZhciBlPXZvaWQgMDtyZXR1cm4gdGhpcy5fY3VycmVudFN1YkRvbWFpbj10aGlzLl9jdXJyZW50U3ViRG9tYWluKzEsdGhpcy5fY3VycmVudFN1YkRvbWFpbj49dGhpcy5fbWF4U3ViRG9tYWluJiYodGhpcy5fY3VycmVudFN1YkRvbWFpbj0xKSxlPXRoaXMuX2N1cnJlbnRTdWJEb21haW4udG9TdHJpbmcoKSx0aGlzLl9wcm92aWRlZEZRRE4ucmVwbGFjZShcInB1YnN1YlwiLFwicHNcIitlKX19LHtrZXk6XCJzaGlmdFN0YW5kYXJkT3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXSYmYXJndW1lbnRzWzBdO3JldHVybiB0aGlzLl9zdGFuZGFyZE9yaWdpbj10aGlzLm5leHRPcmlnaW4oZSksdGhpcy5fc3RhbmRhcmRPcmlnaW59fSx7a2V5OlwiZ2V0U3RhbmRhcmRPcmlnaW5cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdGFuZGFyZE9yaWdpbn19LHtrZXk6XCJQT1NUXCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHRoaXMuX21vZHVsZXMucG9zdChlLHQsbixyKX19LHtrZXk6XCJHRVRcIix2YWx1ZTpmdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX21vZHVsZXMuZ2V0KGUsdCxuKX19LHtrZXk6XCJfZGV0ZWN0RXJyb3JDYXRlZ29yeVwiLHZhbHVlOmZ1bmN0aW9uKGUpe2lmKFwiRU5PVEZPVU5EXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVDT05OUkVGVVNFRFwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoXCJFQ09OTlJFU0VUXCI9PT1lLmNvZGUpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihcIkVBSV9BR0FJTlwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoMD09PWUuc3RhdHVzfHxlLmhhc093blByb3BlcnR5KFwic3RhdHVzXCIpJiZ2b2lkIDA9PT1lLnN0YXR1cylyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKGUudGltZW91dClyZXR1cm4gdS5kZWZhdWx0LlBOVGltZW91dENhdGVnb3J5O2lmKGUucmVzcG9uc2Upe2lmKGUucmVzcG9uc2UuYmFkUmVxdWVzdClyZXR1cm4gdS5kZWZhdWx0LlBOQmFkUmVxdWVzdENhdGVnb3J5O2lmKGUucmVzcG9uc2UuZm9yYmlkZGVuKXJldHVybiB1LmRlZmF1bHQuUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeX1yZXR1cm4gdS5kZWZhdWx0LlBOVW5rbm93bkNhdGVnb3J5fX1dKSxlfSgpKTt0LmRlZmF1bHQ9YyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZGVmYXVsdD17Z2V0OmZ1bmN0aW9uKGUpe3RyeXtyZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oZSl9Y2F0Y2goZSl7cmV0dXJuIG51bGx9fSxzZXQ6ZnVuY3Rpb24oZSx0KXt0cnl7cmV0dXJuIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGUsdCl9Y2F0Y2goZSl7cmV0dXJuIG51bGx9fX0sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7dmFyIHQ9KG5ldyBEYXRlKS5nZXRUaW1lKCksbj0obmV3IERhdGUpLnRvSVNPU3RyaW5nKCkscj1mdW5jdGlvbigpe3JldHVybiBjb25zb2xlJiZjb25zb2xlLmxvZz9jb25zb2xlOndpbmRvdyYmd2luZG93LmNvbnNvbGUmJndpbmRvdy5jb25zb2xlLmxvZz93aW5kb3cuY29uc29sZTpjb25zb2xlfSgpO3IubG9nKFwiPDw8PDxcIiksci5sb2coXCJbXCIrbitcIl1cIixcIlxcblwiLGUudXJsLFwiXFxuXCIsZS5xcyksci5sb2coXCItLS0tLVwiKSxlLm9uKFwicmVzcG9uc2VcIixmdW5jdGlvbihuKXt2YXIgaT0obmV3IERhdGUpLmdldFRpbWUoKSxzPWktdCxvPShuZXcgRGF0ZSkudG9JU09TdHJpbmcoKTtyLmxvZyhcIj4+Pj4+PlwiKSxyLmxvZyhcIltcIitvK1wiIC8gXCIrcytcIl1cIixcIlxcblwiLGUudXJsLFwiXFxuXCIsZS5xcyxcIlxcblwiLG4udGV4dCksci5sb2coXCItLS0tLVwiKX0pfWZ1bmN0aW9uIGkoZSx0LG4pe3ZhciBpPXRoaXM7cmV0dXJuIHRoaXMuX2NvbmZpZy5sb2dWZXJib3NpdHkmJihlPWUudXNlKHIpKSx0aGlzLl9jb25maWcucHJveHkmJnRoaXMuX21vZHVsZXMucHJveHkmJihlPXRoaXMuX21vZHVsZXMucHJveHkuY2FsbCh0aGlzLGUpKSx0aGlzLl9jb25maWcua2VlcEFsaXZlJiZ0aGlzLl9tb2R1bGVzLmtlZXBBbGl2ZSYmKGU9dGhpcy5fbW9kdWxlLmtlZXBBbGl2ZShlKSksZS50aW1lb3V0KHQudGltZW91dCkuZW5kKGZ1bmN0aW9uKGUscil7dmFyIHM9e307aWYocy5lcnJvcj1udWxsIT09ZSxzLm9wZXJhdGlvbj10Lm9wZXJhdGlvbixyJiZyLnN0YXR1cyYmKHMuc3RhdHVzQ29kZT1yLnN0YXR1cyksZSlyZXR1cm4gcy5lcnJvckRhdGE9ZSxzLmNhdGVnb3J5PWkuX2RldGVjdEVycm9yQ2F0ZWdvcnkoZSksbihzLG51bGwpO3ZhciBvPUpTT04ucGFyc2Uoci50ZXh0KTtyZXR1cm4gbihzLG8pfSl9ZnVuY3Rpb24gcyhlLHQsbil7dmFyIHI9dS5kZWZhdWx0LmdldCh0aGlzLmdldFN0YW5kYXJkT3JpZ2luKCkrdC51cmwpLnF1ZXJ5KGUpO3JldHVybiBpLmNhbGwodGhpcyxyLHQsbil9ZnVuY3Rpb24gbyhlLHQsbixyKXt2YXIgcz11LmRlZmF1bHQucG9zdCh0aGlzLmdldFN0YW5kYXJkT3JpZ2luKCkrbi51cmwpLnF1ZXJ5KGUpLnNlbmQodCk7cmV0dXJuIGkuY2FsbCh0aGlzLHMsbixyKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldD1zLHQucG9zdD1vO3ZhciBhPW4oNDMpLHU9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShhKTtuKDgpfSxmdW5jdGlvbihlLHQsbil7ZnVuY3Rpb24gcigpe31mdW5jdGlvbiBpKGUpe2lmKCF2KGUpKXJldHVybiBlO3ZhciB0PVtdO2Zvcih2YXIgbiBpbiBlKXModCxuLGVbbl0pO3JldHVybiB0LmpvaW4oXCImXCIpfWZ1bmN0aW9uIHMoZSx0LG4pe2lmKG51bGwhPW4paWYoQXJyYXkuaXNBcnJheShuKSluLmZvckVhY2goZnVuY3Rpb24obil7cyhlLHQsbil9KTtlbHNlIGlmKHYobikpZm9yKHZhciByIGluIG4pcyhlLHQrXCJbXCIrcitcIl1cIixuW3JdKTtlbHNlIGUucHVzaChlbmNvZGVVUklDb21wb25lbnQodCkrXCI9XCIrZW5jb2RlVVJJQ29tcG9uZW50KG4pKTtlbHNlIG51bGw9PT1uJiZlLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHQpKX1mdW5jdGlvbiBvKGUpe2Zvcih2YXIgdCxuLHI9e30saT1lLnNwbGl0KFwiJlwiKSxzPTAsbz1pLmxlbmd0aDtzPG87KytzKXQ9aVtzXSxuPXQuaW5kZXhPZihcIj1cIiksLTE9PW4/cltkZWNvZGVVUklDb21wb25lbnQodCldPVwiXCI6cltkZWNvZGVVUklDb21wb25lbnQodC5zbGljZSgwLG4pKV09ZGVjb2RlVVJJQ29tcG9uZW50KHQuc2xpY2UobisxKSk7cmV0dXJuIHJ9ZnVuY3Rpb24gYShlKXt2YXIgdCxuLHIsaSxzPWUuc3BsaXQoL1xccj9cXG4vKSxvPXt9O3MucG9wKCk7Zm9yKHZhciBhPTAsdT1zLmxlbmd0aDthPHU7KythKW49c1thXSx0PW4uaW5kZXhPZihcIjpcIikscj1uLnNsaWNlKDAsdCkudG9Mb3dlckNhc2UoKSxpPV8obi5zbGljZSh0KzEpKSxvW3JdPWk7cmV0dXJuIG99ZnVuY3Rpb24gdShlKXtyZXR1cm4vW1xcLytdanNvblxcYi8udGVzdChlKX1mdW5jdGlvbiBjKGUpe3JldHVybiBlLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCl9ZnVuY3Rpb24gbChlKXtyZXR1cm4gZS5zcGxpdCgvICo7ICovKS5yZWR1Y2UoZnVuY3Rpb24oZSx0KXt2YXIgbj10LnNwbGl0KC8gKj0gKi8pLHI9bi5zaGlmdCgpLGk9bi5zaGlmdCgpO3JldHVybiByJiZpJiYoZVtyXT1pKSxlfSx7fSl9ZnVuY3Rpb24gaChlLHQpe3Q9dHx8e30sdGhpcy5yZXE9ZSx0aGlzLnhocj10aGlzLnJlcS54aHIsdGhpcy50ZXh0PVwiSEVBRFwiIT10aGlzLnJlcS5tZXRob2QmJihcIlwiPT09dGhpcy54aHIucmVzcG9uc2VUeXBlfHxcInRleHRcIj09PXRoaXMueGhyLnJlc3BvbnNlVHlwZSl8fHZvaWQgMD09PXRoaXMueGhyLnJlc3BvbnNlVHlwZT90aGlzLnhoci5yZXNwb25zZVRleHQ6bnVsbCx0aGlzLnN0YXR1c1RleHQ9dGhpcy5yZXEueGhyLnN0YXR1c1RleHQsdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpLHRoaXMuaGVhZGVyPXRoaXMuaGVhZGVycz1hKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSx0aGlzLmhlYWRlcltcImNvbnRlbnQtdHlwZVwiXT10aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcihcImNvbnRlbnQtdHlwZVwiKSx0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKSx0aGlzLmJvZHk9XCJIRUFEXCIhPXRoaXMucmVxLm1ldGhvZD90aGlzLl9wYXJzZUJvZHkodGhpcy50ZXh0P3RoaXMudGV4dDp0aGlzLnhoci5yZXNwb25zZSk6bnVsbH1mdW5jdGlvbiBmKGUsdCl7dmFyIG49dGhpczt0aGlzLl9xdWVyeT10aGlzLl9xdWVyeXx8W10sdGhpcy5tZXRob2Q9ZSx0aGlzLnVybD10LHRoaXMuaGVhZGVyPXt9LHRoaXMuX2hlYWRlcj17fSx0aGlzLm9uKFwiZW5kXCIsZnVuY3Rpb24oKXt2YXIgZT1udWxsLHQ9bnVsbDt0cnl7dD1uZXcgaChuKX1jYXRjaCh0KXtyZXR1cm4gZT1uZXcgRXJyb3IoXCJQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZVwiKSxlLnBhcnNlPSEwLGUub3JpZ2luYWw9dCxlLnJhd1Jlc3BvbnNlPW4ueGhyJiZuLnhoci5yZXNwb25zZVRleHQ/bi54aHIucmVzcG9uc2VUZXh0Om51bGwsZS5zdGF0dXNDb2RlPW4ueGhyJiZuLnhoci5zdGF0dXM/bi54aHIuc3RhdHVzOm51bGwsbi5jYWxsYmFjayhlKX1uLmVtaXQoXCJyZXNwb25zZVwiLHQpO3ZhciByO3RyeXsodC5zdGF0dXM8MjAwfHx0LnN0YXR1cz49MzAwKSYmKHI9bmV3IEVycm9yKHQuc3RhdHVzVGV4dHx8XCJVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZVwiKSxyLm9yaWdpbmFsPWUsci5yZXNwb25zZT10LHIuc3RhdHVzPXQuc3RhdHVzKX1jYXRjaChlKXtyPWV9cj9uLmNhbGxiYWNrKHIsdCk6bi5jYWxsYmFjayhudWxsLHQpfSl9ZnVuY3Rpb24gZChlLHQpe3ZhciBuPWIoXCJERUxFVEVcIixlKTtyZXR1cm4gdCYmbi5lbmQodCksbn12YXIgcDtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3A9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3A9c2VsZjooY29uc29sZS53YXJuKFwiVXNpbmcgYnJvd3Nlci1vbmx5IHZlcnNpb24gb2Ygc3VwZXJhZ2VudCBpbiBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKSxwPXRoaXMpO3ZhciBnPW4oNDQpLHk9big0NSksdj1uKDQ2KSxiPWUuZXhwb3J0cz1uKDQ3KS5iaW5kKG51bGwsZik7Yi5nZXRYSFI9ZnVuY3Rpb24oKXtpZighKCFwLlhNTEh0dHBSZXF1ZXN0fHxwLmxvY2F0aW9uJiZcImZpbGU6XCI9PXAubG9jYXRpb24ucHJvdG9jb2wmJnAuQWN0aXZlWE9iamVjdCkpcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDt0cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIil9Y2F0Y2goZSl7fXRyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUC42LjBcIil9Y2F0Y2goZSl7fXRyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUC4zLjBcIil9Y2F0Y2goZSl7fXRyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoXCJNc3htbDIuWE1MSFRUUFwiKX1jYXRjaChlKXt9dGhyb3cgRXJyb3IoXCJCcm93c2VyLW9ubHkgdmVyaXNvbiBvZiBzdXBlcmFnZW50IGNvdWxkIG5vdCBmaW5kIFhIUlwiKX07dmFyIF89XCJcIi50cmltP2Z1bmN0aW9uKGUpe3JldHVybiBlLnRyaW0oKX06ZnVuY3Rpb24oZSl7cmV0dXJuIGUucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLFwiXCIpfTtiLnNlcmlhbGl6ZU9iamVjdD1pLGIucGFyc2VTdHJpbmc9byxiLnR5cGVzPXtodG1sOlwidGV4dC9odG1sXCIsanNvbjpcImFwcGxpY2F0aW9uL2pzb25cIix4bWw6XCJhcHBsaWNhdGlvbi94bWxcIix1cmxlbmNvZGVkOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsZm9ybTpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLFwiZm9ybS1kYXRhXCI6XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIn0sYi5zZXJpYWxpemU9e1wiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6aSxcImFwcGxpY2F0aW9uL2pzb25cIjpKU09OLnN0cmluZ2lmeX0sYi5wYXJzZT17XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjpvLFwiYXBwbGljYXRpb24vanNvblwiOkpTT04ucGFyc2V9LGgucHJvdG90eXBlLmdldD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5oZWFkZXJbZS50b0xvd2VyQ2FzZSgpXX0saC5wcm90b3R5cGUuX3NldEhlYWRlclByb3BlcnRpZXM9ZnVuY3Rpb24oZSl7dmFyIHQ9dGhpcy5oZWFkZXJbXCJjb250ZW50LXR5cGVcIl18fFwiXCI7dGhpcy50eXBlPWModCk7dmFyIG49bCh0KTtmb3IodmFyIHIgaW4gbil0aGlzW3JdPW5bcl19LGgucHJvdG90eXBlLl9wYXJzZUJvZHk9ZnVuY3Rpb24oZSl7dmFyIHQ9Yi5wYXJzZVt0aGlzLnR5cGVdO3JldHVybiF0JiZ1KHRoaXMudHlwZSkmJih0PWIucGFyc2VbXCJhcHBsaWNhdGlvbi9qc29uXCJdKSx0JiZlJiYoZS5sZW5ndGh8fGUgaW5zdGFuY2VvZiBPYmplY3QpP3QoZSk6bnVsbH0saC5wcm90b3R5cGUuX3NldFN0YXR1c1Byb3BlcnRpZXM9ZnVuY3Rpb24oZSl7MTIyMz09PWUmJihlPTIwNCk7dmFyIHQ9ZS8xMDB8MDt0aGlzLnN0YXR1cz10aGlzLnN0YXR1c0NvZGU9ZSx0aGlzLnN0YXR1c1R5cGU9dCx0aGlzLmluZm89MT09dCx0aGlzLm9rPTI9PXQsdGhpcy5jbGllbnRFcnJvcj00PT10LHRoaXMuc2VydmVyRXJyb3I9NT09dCx0aGlzLmVycm9yPSg0PT10fHw1PT10KSYmdGhpcy50b0Vycm9yKCksdGhpcy5hY2NlcHRlZD0yMDI9PWUsdGhpcy5ub0NvbnRlbnQ9MjA0PT1lLHRoaXMuYmFkUmVxdWVzdD00MDA9PWUsdGhpcy51bmF1dGhvcml6ZWQ9NDAxPT1lLHRoaXMubm90QWNjZXB0YWJsZT00MDY9PWUsdGhpcy5ub3RGb3VuZD00MDQ9PWUsdGhpcy5mb3JiaWRkZW49NDAzPT1lfSxoLnByb3RvdHlwZS50b0Vycm9yPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5yZXEsdD1lLm1ldGhvZCxuPWUudXJsLHI9XCJjYW5ub3QgXCIrdCtcIiBcIituK1wiIChcIit0aGlzLnN0YXR1cytcIilcIixpPW5ldyBFcnJvcihyKTtyZXR1cm4gaS5zdGF0dXM9dGhpcy5zdGF0dXMsaS5tZXRob2Q9dCxpLnVybD1uLGl9LGIuUmVzcG9uc2U9aCxnKGYucHJvdG90eXBlKTtmb3IodmFyIG0gaW4geSlmLnByb3RvdHlwZVttXT15W21dO2YucHJvdG90eXBlLnR5cGU9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuc2V0KFwiQ29udGVudC1UeXBlXCIsYi50eXBlc1tlXXx8ZSksdGhpc30sZi5wcm90b3R5cGUucmVzcG9uc2VUeXBlPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9yZXNwb25zZVR5cGU9ZSx0aGlzfSxmLnByb3RvdHlwZS5hY2NlcHQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuc2V0KFwiQWNjZXB0XCIsYi50eXBlc1tlXXx8ZSksdGhpc30sZi5wcm90b3R5cGUuYXV0aD1mdW5jdGlvbihlLHQsbil7c3dpdGNoKG58fChuPXt0eXBlOlwiYmFzaWNcIn0pLG4udHlwZSl7Y2FzZVwiYmFzaWNcIjp2YXIgcj1idG9hKGUrXCI6XCIrdCk7dGhpcy5zZXQoXCJBdXRob3JpemF0aW9uXCIsXCJCYXNpYyBcIityKTticmVhaztjYXNlXCJhdXRvXCI6dGhpcy51c2VybmFtZT1lLHRoaXMucGFzc3dvcmQ9dH1yZXR1cm4gdGhpc30sZi5wcm90b3R5cGUucXVlcnk9ZnVuY3Rpb24oZSl7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGUmJihlPWkoZSkpLGUmJnRoaXMuX3F1ZXJ5LnB1c2goZSksdGhpc30sZi5wcm90b3R5cGUuYXR0YWNoPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fZ2V0Rm9ybURhdGEoKS5hcHBlbmQoZSx0LG58fHQubmFtZSksdGhpc30sZi5wcm90b3R5cGUuX2dldEZvcm1EYXRhPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2Zvcm1EYXRhfHwodGhpcy5fZm9ybURhdGE9bmV3IHAuRm9ybURhdGEpLHRoaXMuX2Zvcm1EYXRhfSxmLnByb3RvdHlwZS5jYWxsYmFjaz1mdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMuX2NhbGxiYWNrO3RoaXMuY2xlYXJUaW1lb3V0KCksbihlLHQpfSxmLnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IEVycm9yKFwiUmVxdWVzdCBoYXMgYmVlbiB0ZXJtaW5hdGVkXFxuUG9zc2libGUgY2F1c2VzOiB0aGUgbmV0d29yayBpcyBvZmZsaW5lLCBPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luLCB0aGUgcGFnZSBpcyBiZWluZyB1bmxvYWRlZCwgZXRjLlwiKTtlLmNyb3NzRG9tYWluPSEwLGUuc3RhdHVzPXRoaXMuc3RhdHVzLGUubWV0aG9kPXRoaXMubWV0aG9kLGUudXJsPXRoaXMudXJsLHRoaXMuY2FsbGJhY2soZSl9LGYucHJvdG90eXBlLl90aW1lb3V0RXJyb3I9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLl90aW1lb3V0LHQ9bmV3IEVycm9yKFwidGltZW91dCBvZiBcIitlK1wibXMgZXhjZWVkZWRcIik7dC50aW1lb3V0PWUsdGhpcy5jYWxsYmFjayh0KX0sZi5wcm90b3R5cGUuX2FwcGVuZFF1ZXJ5U3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5fcXVlcnkuam9pbihcIiZcIik7ZSYmKHRoaXMudXJsKz1+dGhpcy51cmwuaW5kZXhPZihcIj9cIik/XCImXCIrZTpcIj9cIitlKX0sZi5wcm90b3R5cGUuZW5kPWZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMsbj10aGlzLnhocj1iLmdldFhIUigpLGk9dGhpcy5fdGltZW91dCxzPXRoaXMuX2Zvcm1EYXRhfHx0aGlzLl9kYXRhO3RoaXMuX2NhbGxiYWNrPWV8fHIsbi5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtpZig0PT1uLnJlYWR5U3RhdGUpe3ZhciBlO3RyeXtlPW4uc3RhdHVzfWNhdGNoKHQpe2U9MH1pZigwPT1lKXtpZih0LnRpbWVkb3V0KXJldHVybiB0Ll90aW1lb3V0RXJyb3IoKTtpZih0Ll9hYm9ydGVkKXJldHVybjtyZXR1cm4gdC5jcm9zc0RvbWFpbkVycm9yKCl9dC5lbWl0KFwiZW5kXCIpfX07dmFyIG89ZnVuY3Rpb24oZSxuKXtuLnRvdGFsPjAmJihuLnBlcmNlbnQ9bi5sb2FkZWQvbi50b3RhbCoxMDApLG4uZGlyZWN0aW9uPWUsdC5lbWl0KFwicHJvZ3Jlc3NcIixuKX07aWYodGhpcy5oYXNMaXN0ZW5lcnMoXCJwcm9ncmVzc1wiKSl0cnl7bi5vbnByb2dyZXNzPW8uYmluZChudWxsLFwiZG93bmxvYWRcIiksbi51cGxvYWQmJihuLnVwbG9hZC5vbnByb2dyZXNzPW8uYmluZChudWxsLFwidXBsb2FkXCIpKX1jYXRjaChlKXt9aWYoaSYmIXRoaXMuX3RpbWVyJiYodGhpcy5fdGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe3QudGltZWRvdXQ9ITAsdC5hYm9ydCgpfSxpKSksdGhpcy5fYXBwZW5kUXVlcnlTdHJpbmcoKSx0aGlzLnVzZXJuYW1lJiZ0aGlzLnBhc3N3b3JkP24ub3Blbih0aGlzLm1ldGhvZCx0aGlzLnVybCwhMCx0aGlzLnVzZXJuYW1lLHRoaXMucGFzc3dvcmQpOm4ub3Blbih0aGlzLm1ldGhvZCx0aGlzLnVybCwhMCksdGhpcy5fd2l0aENyZWRlbnRpYWxzJiYobi53aXRoQ3JlZGVudGlhbHM9ITApLFwiR0VUXCIhPXRoaXMubWV0aG9kJiZcIkhFQURcIiE9dGhpcy5tZXRob2QmJlwic3RyaW5nXCIhPXR5cGVvZiBzJiYhdGhpcy5faXNIb3N0KHMpKXt2YXIgYT10aGlzLl9oZWFkZXJbXCJjb250ZW50LXR5cGVcIl0sYz10aGlzLl9zZXJpYWxpemVyfHxiLnNlcmlhbGl6ZVthP2Euc3BsaXQoXCI7XCIpWzBdOlwiXCJdOyFjJiZ1KGEpJiYoYz1iLnNlcmlhbGl6ZVtcImFwcGxpY2F0aW9uL2pzb25cIl0pLGMmJihzPWMocykpfWZvcih2YXIgbCBpbiB0aGlzLmhlYWRlciludWxsIT10aGlzLmhlYWRlcltsXSYmbi5zZXRSZXF1ZXN0SGVhZGVyKGwsdGhpcy5oZWFkZXJbbF0pO3JldHVybiB0aGlzLl9yZXNwb25zZVR5cGUmJihuLnJlc3BvbnNlVHlwZT10aGlzLl9yZXNwb25zZVR5cGUpLHRoaXMuZW1pdChcInJlcXVlc3RcIix0aGlzKSxuLnNlbmQodm9pZCAwIT09cz9zOm51bGwpLHRoaXN9LGIuUmVxdWVzdD1mLGIuZ2V0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiR0VUXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIucXVlcnkodCksbiYmci5lbmQobikscn0sYi5oZWFkPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiSEVBRFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn0sYi5vcHRpb25zPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiT1BUSU9OU1wiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn0sYi5kZWw9ZCxiLmRlbGV0ZT1kLGIucGF0Y2g9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJQQVRDSFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn0sYi5wb3N0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiUE9TVFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnNlbmQodCksbiYmci5lbmQobikscn0sYi5wdXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPWIoXCJQVVRcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9fSxmdW5jdGlvbihlLHQsbil7ZnVuY3Rpb24gcihlKXtpZihlKXJldHVybiBpKGUpfWZ1bmN0aW9uIGkoZSl7Zm9yKHZhciB0IGluIHIucHJvdG90eXBlKWVbdF09ci5wcm90b3R5cGVbdF07cmV0dXJuIGV9ZS5leHBvcnRzPXIsci5wcm90b3R5cGUub249ci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSwodGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdPXRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXXx8W10pLnB1c2godCksdGhpc30sci5wcm90b3R5cGUub25jZT1mdW5jdGlvbihlLHQpe2Z1bmN0aW9uIG4oKXt0aGlzLm9mZihlLG4pLHQuYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBuLmZuPXQsdGhpcy5vbihlLG4pLHRoaXN9LHIucHJvdG90eXBlLm9mZj1yLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcj1yLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnM9ci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihlLHQpe2lmKHRoaXMuX2NhbGxiYWNrcz10aGlzLl9jYWxsYmFja3N8fHt9LDA9PWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX2NhbGxiYWNrcz17fSx0aGlzO3ZhciBuPXRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXTtpZighbilyZXR1cm4gdGhpcztpZigxPT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdLHRoaXM7Zm9yKHZhciByLGk9MDtpPG4ubGVuZ3RoO2krKylpZigocj1uW2ldKT09PXR8fHIuZm49PT10KXtuLnNwbGljZShpLDEpO2JyZWFrfXJldHVybiB0aGlzfSxyLnByb3RvdHlwZS5lbWl0PWZ1bmN0aW9uKGUpe3RoaXMuX2NhbGxiYWNrcz10aGlzLl9jYWxsYmFja3N8fHt9O3ZhciB0PVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpLG49dGhpcy5fY2FsbGJhY2tzW1wiJFwiK2VdO2lmKG4pe249bi5zbGljZSgwKTtmb3IodmFyIHI9MCxpPW4ubGVuZ3RoO3I8aTsrK3IpbltyXS5hcHBseSh0aGlzLHQpfXJldHVybiB0aGlzfSxyLnByb3RvdHlwZS5saXN0ZW5lcnM9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2NhbGxiYWNrcz10aGlzLl9jYWxsYmFja3N8fHt9LHRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXXx8W119LHIucHJvdG90eXBlLmhhc0xpc3RlbmVycz1mdW5jdGlvbihlKXtyZXR1cm4hIXRoaXMubGlzdGVuZXJzKGUpLmxlbmd0aH19LGZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uKDQ2KTt0LmNsZWFyVGltZW91dD1mdW5jdGlvbigpe3JldHVybiB0aGlzLl90aW1lb3V0PTAsY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKSx0aGlzfSx0LnBhcnNlPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9wYXJzZXI9ZSx0aGlzfSx0LnNlcmlhbGl6ZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fc2VyaWFsaXplcj1lLHRoaXN9LHQudGltZW91dD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fdGltZW91dD1lLHRoaXN9LHQudGhlbj1mdW5jdGlvbihlLHQpe2lmKCF0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSl7dmFyIG49dGhpczt0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZT1uZXcgUHJvbWlzZShmdW5jdGlvbihlLHQpe24uZW5kKGZ1bmN0aW9uKG4scil7bj90KG4pOmUocil9KX0pfXJldHVybiB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZS50aGVuKGUsdCl9LHQuY2F0Y2g9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMudGhlbih2b2lkIDAsZSl9LHQudXNlPWZ1bmN0aW9uKGUpe3JldHVybiBlKHRoaXMpLHRoaXN9LHQuZ2V0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9oZWFkZXJbZS50b0xvd2VyQ2FzZSgpXX0sdC5nZXRIZWFkZXI9dC5nZXQsdC5zZXQ9ZnVuY3Rpb24oZSx0KXtpZihyKGUpKXtmb3IodmFyIG4gaW4gZSl0aGlzLnNldChuLGVbbl0pO3JldHVybiB0aGlzfXJldHVybiB0aGlzLl9oZWFkZXJbZS50b0xvd2VyQ2FzZSgpXT10LHRoaXMuaGVhZGVyW2VdPXQsdGhpc30sdC51bnNldD1mdW5jdGlvbihlKXtyZXR1cm4gZGVsZXRlIHRoaXMuX2hlYWRlcltlLnRvTG93ZXJDYXNlKCldLGRlbGV0ZSB0aGlzLmhlYWRlcltlXSx0aGlzfSx0LmZpZWxkPWZ1bmN0aW9uKGUsdCl7aWYobnVsbD09PWV8fHZvaWQgMD09PWUpdGhyb3cgbmV3IEVycm9yKFwiLmZpZWxkKG5hbWUsIHZhbCkgbmFtZSBjYW4gbm90IGJlIGVtcHR5XCIpO2lmKHIoZSkpe2Zvcih2YXIgbiBpbiBlKXRoaXMuZmllbGQobixlW25dKTtyZXR1cm4gdGhpc31pZihudWxsPT09dHx8dm9pZCAwPT09dCl0aHJvdyBuZXcgRXJyb3IoXCIuZmllbGQobmFtZSwgdmFsKSB2YWwgY2FuIG5vdCBiZSBlbXB0eVwiKTtyZXR1cm4gdGhpcy5fZ2V0Rm9ybURhdGEoKS5hcHBlbmQoZSx0KSx0aGlzfSx0LmFib3J0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2Fib3J0ZWQ/dGhpczoodGhpcy5fYWJvcnRlZD0hMCx0aGlzLnhociYmdGhpcy54aHIuYWJvcnQoKSx0aGlzLnJlcSYmdGhpcy5yZXEuYWJvcnQoKSx0aGlzLmNsZWFyVGltZW91dCgpLHRoaXMuZW1pdChcImFib3J0XCIpLHRoaXMpfSx0LndpdGhDcmVkZW50aWFscz1mdW5jdGlvbigpe3JldHVybiB0aGlzLl93aXRoQ3JlZGVudGlhbHM9ITAsdGhpc30sdC5yZWRpcmVjdHM9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX21heFJlZGlyZWN0cz1lLHRoaXN9LHQudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJue21ldGhvZDp0aGlzLm1ldGhvZCx1cmw6dGhpcy51cmwsZGF0YTp0aGlzLl9kYXRhLGhlYWRlcnM6dGhpcy5faGVhZGVyfX0sdC5faXNIb3N0PWZ1bmN0aW9uKGUpe3N3aXRjaCh7fS50b1N0cmluZy5jYWxsKGUpKXtjYXNlXCJbb2JqZWN0IEZpbGVdXCI6Y2FzZVwiW29iamVjdCBCbG9iXVwiOmNhc2VcIltvYmplY3QgRm9ybURhdGFdXCI6cmV0dXJuITA7ZGVmYXVsdDpyZXR1cm4hMX19LHQuc2VuZD1mdW5jdGlvbihlKXt2YXIgdD1yKGUpLG49dGhpcy5faGVhZGVyW1wiY29udGVudC10eXBlXCJdO2lmKHQmJnIodGhpcy5fZGF0YSkpZm9yKHZhciBpIGluIGUpdGhpcy5fZGF0YVtpXT1lW2ldO2Vsc2VcInN0cmluZ1wiPT10eXBlb2YgZT8obnx8dGhpcy50eXBlKFwiZm9ybVwiKSxuPXRoaXMuX2hlYWRlcltcImNvbnRlbnQtdHlwZVwiXSx0aGlzLl9kYXRhPVwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI9PW4/dGhpcy5fZGF0YT90aGlzLl9kYXRhK1wiJlwiK2U6ZToodGhpcy5fZGF0YXx8XCJcIikrZSk6dGhpcy5fZGF0YT1lO3JldHVybiF0fHx0aGlzLl9pc0hvc3QoZSk/dGhpczoobnx8dGhpcy50eXBlKFwianNvblwiKSx0aGlzKX19LGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlKXtyZXR1cm4gbnVsbCE9PWUmJlwib2JqZWN0XCI9PXR5cGVvZiBlfWUuZXhwb3J0cz1ufSxmdW5jdGlvbihlLHQpe2Z1bmN0aW9uIG4oZSx0LG4pe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4/bmV3IGUoXCJHRVRcIix0KS5lbmQobik6Mj09YXJndW1lbnRzLmxlbmd0aD9uZXcgZShcIkdFVFwiLHQpOm5ldyBlKHQsbil9ZS5leHBvcnRzPW59XSl9KTsiLCIgXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIEFsbG93cyB1cyB0byBjcmVhdGUgYW5kIGJpbmQgdG8gZXZlbnRzLiBFdmVyeXRoaW5nIGluIENoYXRFbmdpbmUgaXMgYW4gZXZlbnRcbi8vIGVtaXR0ZXJcbmNvbnN0IEV2ZW50RW1pdHRlcjIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIyJykuRXZlbnRFbWl0dGVyMjtcblxuY29uc3QgUHViTnViID0gcmVxdWlyZSgncHVibnViJyk7XG5cbi8vIGFsbG93cyBhIHN5bmNocm9ub3VzIGV4ZWN1dGlvbiBmbG93LlxuY29uc3Qgd2F0ZXJmYWxsID0gcmVxdWlyZSgnYXN5bmMvd2F0ZXJmYWxsJyk7XG5cbi8qKlxuKiBHbG9iYWwgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIENoYXRFbmdpbmUuXG4qXG4qIEBjbGFzcyBPcGVuQ2hhdEZyYW1ld29ya1xuKiBAY29uc3RydWN0b3JcbiogQHBhcmFtIHtPYmplY3R9IGZvbyBBcmd1bWVudCAxXG4qIEBwYXJhbSBjb25maWcucHVibnViIHtPYmplY3R9IENoYXRFbmdpbmUgaXMgYmFzZWQgb2ZmIFB1Yk51Yi4gU3VwcGx5IHlvdXIgUHViTnViIGNvbmZpZyBoZXJlLlxuKiBAcGFyYW0gY29uZmlnLmdsb2JhbENoYW5uZWwge1N0cmluZ30gaGlzIGlzIHRoZSBnbG9iYWwgY2hhbm5lbCB0aGF0IGFsbCBjbGllbnRzIGFyZSBjb25uZWN0ZWQgdG8gYXV0b21hdGljYWxseS4gSXQncyB1c2VkIGZvciBnbG9iYWwgYW5ub3VuY2VtZW50cywgZ2xvYmFsIHByZXNlbmNlLCBldGMuXG4qIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhbiBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4qL1xuXG5jb25zdCBjcmVhdGUgPSBmdW5jdGlvbihwbkNvbmZpZywgZ2xvYmFsQ2hhbm5lbCA9ICdjaGF0LWVuZ2luZScpIHtcblxuICAgIGxldCBDaGF0RW5naW5lID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAqIENvbmZpZ3VyZXMgYW4gZXZlbnQgZW1pdHRlciB0aGF0IG90aGVyIENoYXRFbmdpbmUgb2JqZWN0cyBpbmhlcml0LiBBZGRzIHNob3J0Y3V0IG1ldGhvZHMgZm9yXG4gICAgKiBgYGB0aGlzLm9uKClgYGAsIGBgYHRoaXMuZW1pdCgpYGBgLCBldGMuXG4gICAgKlxuICAgICogQGNsYXNzIFJvb3RFbWl0dGVyXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGNsYXNzIFJvb3RFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGFuIGVlMlxuICAgICAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjIoe1xuICAgICAgICAgICAgICB3aWxkY2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgbmV3TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICAgIG1heExpc3RlbmVyczogNTAsXG4gICAgICAgICAgICAgIHZlcmJvc2VNZW1vcnlMZWFrOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gd2UgYmluZCB0byBtYWtlIHN1cmUgd2lsZGNhcmRzIHdvcmtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc3luY2x5L0V2ZW50RW1pdHRlcjIvaXNzdWVzLzE4NlxuICAgICAgICAgICAgdGhpcy5fZW1pdCA9IHRoaXMuZW1pdHRlci5lbWl0LmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIExpc3RlbiBmb3IgYSBzcGVjaWZpYyBldmVudCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBtZXRob2Qgb25cbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgZXZlbnQgaXMgZW1pdHRlZFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuX29uID0gdGhpcy5lbWl0dGVyLm9uLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgdGhpcy5vbiA9IChldmVudCwgY2IpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgdXNlciBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0gfHwgbmV3IEV2ZW50KHRoaXMsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX29uKGV2ZW50LCBjYik7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub2ZmID0gdGhpcy5lbWl0dGVyLm9mZi5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGFueSBldmVudCBvbiB0aGlzIG9iamVjdCBhbmQgZmlyZSBhIGNhbGxiYWNrIHdoZW4gaXQncyBlbWl0dGVkXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBtZXRob2Qgb25BbnlcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIGFueSBldmVudCBpcyBlbWl0dGVkLiBGaXJzdCBwYXJhbWV0ZXIgaXMgdGhlIGV2ZW50IG5hbWUgYW5kIHNlY29uZCBpcyB0aGUgcGF5bG9hZC5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uQW55ID0gdGhpcy5lbWl0dGVyLm9uQW55LmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIExpc3RlbiBmb3IgYW4gZXZlbnQgYW5kIG9ubHkgZmlyZSB0aGUgY2FsbGJhY2sgYSBzaW5nbGUgdGltZVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAbWV0aG9kIG9uY2VcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBydW4gb25jZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub25jZSA9IHRoaXMuZW1pdHRlci5vbmNlLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjbGFzcyBFdmVudCB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoQ2hhdCwgZXZlbnQpIHtcblxuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gW0NoYXQuY2hhbm5lbCwgZXZlbnRdLmpvaW4oJy4nKTtcblxuICAgICAgICAgICAgdGhpcy5wdWJsaXNoID0gKG0pID0+IHtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNoYW5uZWxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZSA9IChtKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLmNoYW5uZWwgPT0gbS5jaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIENoYXQudHJpZ2dlcihldmVudCwgbS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMub25NZXNzYWdlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF0sXG4gICAgICAgICAgICAgICAgd2l0aFByZXNlbmNlOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEFuIENoYXRFbmdpbmUgZ2VuZXJpYyBlbWl0dGVyIHRoYXQgc3VwcG9ydHMgcGx1Z2lucyBhbmQgZm9yd2FyZHNcbiAgICAqIGV2ZW50cyB0byBhIGdsb2JhbCBlbWl0dGVyLlxuICAgICpcbiAgICAqIEBjbGFzcyBFbWl0dGVyXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqIEBleHRlbmRzIFJvb3RFbWl0dGVyXG4gICAgKi9cbiAgICBjbGFzcyBFbWl0dGVyIGV4dGVuZHMgUm9vdEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAvLyBlbWl0IGFuIGV2ZW50IGZyb20gdGhpcyBvYmplY3RcbiAgICAgICAgICAgIHRoaXMuX2VtaXQgPSAoZXZlbnQsIGRhdGEpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIGFsbCBldmVudHMgYXJlIGZvcndhcmRlZCB0byBDaGF0RW5naW5lIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIHNvIHlvdSBjYW4gZ2xvYmFsbHkgYmluZCB0byBldmVudHMgd2l0aCBDaGF0RW5naW5lLm9uKClcbiAgICAgICAgICAgICAgICBDaGF0RW5naW5lLl9lbWl0KGV2ZW50LCBkYXRhKTtcblxuICAgICAgICAgICAgICAgIC8vIGVtaXQgdGhlIGV2ZW50IGZyb20gdGhlIG9iamVjdCB0aGF0IGNyZWF0ZWQgaXRcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdChldmVudCwgZGF0YSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYXNzaWduIHRoZSBsaXN0IG9mIHBsdWdpbnMgZm9yIHRoaXMgc2NvcGVcbiAgICAgICAgICAgIHRoaXMucGx1Z2lucyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBiaW5kIGEgcGx1Z2luIHRvIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLnBsdWdpbiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zLnB1c2gobW9kdWxlKTtcblxuICAgICAgICAgICAgICAgIC8vIHJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGNsYXNzXG4gICAgICAgICAgICAgICAgbGV0IGNsYXNzTmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcblxuICAgICAgICAgICAgICAgIC8vIHNlZSBpZiB0aGVyZSBhcmUgcGx1Z2lucyB0byBhdHRhY2ggdG8gdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgIGlmKG1vZHVsZS5leHRlbmRzICYmIG1vZHVsZS5leHRlbmRzW2NsYXNzTmFtZV0pIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHBsdWdpbnMgdG8gdGhpcyBjbGFzc1xuICAgICAgICAgICAgICAgICAgICAvLyB1bmRlciB0aGVpciBuYW1lc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS5hZGRDaGlsZCh0aGlzLCBtb2R1bGUubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG1vZHVsZS5leHRlbmRzW2NsYXNzTmFtZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uQ2hhdEVuZ2luZSA9IENoYXRFbmdpbmU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHBsdWdpbiBoYXMgYSBzcGVjaWFsIGNvbnN0cnVjdCBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyBydW4gaXRcblxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzW21vZHVsZS5uYW1lc3BhY2VdLmNvbnN0cnVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1ttb2R1bGUubmFtZXNwYWNlXS5jb25zdHJ1Y3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFRoaXMgaXMgdGhlIHJvb3Qge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fSBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBjaGF0IHJvb21cbiAgICAqXG4gICAgKiBAY2xhc3MgQ2hhdFxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gY2hhbm5lbCBUaGUgY2hhbm5lbCBuYW1lIGZvciB0aGUgQ2hhdFxuICAgICogQGV4dGVuZHMgRW1pdHRlclxuICAgICovXG4gICAgY2xhc3MgQ2hhdCBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKGNoYW5uZWwpIHtcblxuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIFRoZSBjaGFubmVsIG5hbWUgZm9yIHRoaXMge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgY2hhbm5lbFxuICAgICAgICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG5cbiAgICAgICAgICAgIGlmKGNoYW5uZWwuaW5kZXhPZihnbG9iYWxDaGFubmVsKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbCA9IFtnbG9iYWxDaGFubmVsLCBjaGFubmVsXS5qb2luKCcuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBBIGxpc3Qgb2YgdXNlcnMgaW4gdGhpcyB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319LiBBdXRvbWF0aWNhbGx5IGtlcHQgaW4gc3luYyxcbiAgICAgICAgICAgICogVXNlIGBgYENoYXQub24oJyQuam9pbicpYGBgIGFuZCByZWxhdGVkIGV2ZW50cyB0byBnZXQgbm90aWZpZWQgd2hlbiB0aGlzIGNoYW5nZXNcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHByb3BlcnR5IHVzZXJzXG4gICAgICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudXNlcnMgPSB7fTtcblxuXG4gICAgICAgICAgICB0aGlzLmV2ZW50cyA9IHt9XG5cbiAgICAgICAgICAgIC8vIHdoZW5ldmVyIHdlIGdldCBhIG1lc3NhZ2UgZnJvbSB0aGUgbmV0d29ya1xuICAgICAgICAgICAgLy8gcnVuIGxvY2FsIHRyaWdnZXIgbWVzc2FnZVxuXG4gICAgICAgICAgICB0aGlzLm9uSGVyZU5vdyA9IChzdGF0dXMsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZihzdGF0dXMuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIGZldGNoaW5nIGhlcmUuJywgc3RhdHVzLmVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGxpc3Qgb2Ygb2NjdXBhbnRzIGluIHRoaXMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBsZXQgb2NjdXBhbnRzID0gcmVzcG9uc2UuY2hhbm5lbHNbdGhpcy5jaGFubmVsXS5vY2N1cGFudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHRoZSB1c2VyTGlzdCBmb3Igcmx0bS5qcyBzdGFuZGFyZFxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgaW4gb2NjdXBhbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJVcGRhdGUob2NjdXBhbnRzW2ldLnV1aWQsIG9jY3VwYW50c1tpXS5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vblN0YXR1cyA9IChzdGF0dXNFdmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1c0V2ZW50LmNhdGVnb3J5ID09PSBcIlBOQ29ubmVjdGVkQ2F0ZWdvcnlcIikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHN0YXR1c0V2ZW50LmFmZmVjdGVkQ2hhbm5lbHMuaW5kZXhPZih0aGlzLmNoYW5uZWwpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5yZWFkeScpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IChldmVudCwgY29uZmlnID0ge30pID0+IHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBuZXcgRXZlbnQodGhpcywgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSB0aGlzLmV2ZW50c1tldmVudF0uY2hhbm5lbDtcblxuICAgICAgICAgICAgICAgIENoYXRFbmdpbmUucHVibnViLmhpc3RvcnkoY29uZmlnLCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5tZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBzYW1lIGV2ZW50IHdpdGggdGhlIHNhbWUgZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgZXZlbnQgbmFtZSBpcyBub3cgaGlzdG9yeTpuYW1lIHJhdGhlciB0aGFuIGp1c3QgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIGRpc3Rpbmd1aXNoIGl0IGZyb20gdGhlIG9yaWdpbmFsIGxpdmUgZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbJyRoaXN0b3J5JywgZXZlbnRdLmpvaW4oJy4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5lbnRyeSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub25QcmVzZW5jZSA9IChwcmVzZW5jZUV2ZW50KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgY2hhbm5lbCBtYXRjaGVzIHRoaXMgY2hhbm5lbFxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY2hhbm5lbCA9PSBwcmVzZW5jZUV2ZW50LmNoYW5uZWwpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIGpvaW5zIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJqb2luXCIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXIgPSB0aGlzLmNyZWF0ZVVzZXIocHJlc2VuY2VFdmVudC51dWlkLCBwcmVzZW5jZUV2ZW50LnN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEJyb2FkY2FzdCB0aGF0IGEge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSBoYXMgam9pbmVkIHRoZSByb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAqIEBldmVudCAkLmpvaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQudXNlciBUaGUge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSB0aGF0IGNhbWUgb25saW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLmpvaW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgbGVhdmVzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJsZWF2ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJMZWF2ZShwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSB0aW1lc291dFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcInRpbWVvdXRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyRGlzY29ubmVjdChwcmVzZW5jZUV2ZW50LnV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSdzIHN0YXRlIGlzIHVwZGF0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYocHJlc2VuY2VFdmVudC5hY3Rpb24gPT0gXCJzdGF0ZS1jaGFuZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKHByZXNlbmNlRXZlbnQudXVpZCwgcHJlc2VuY2VFdmVudC5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgICAgIHN0YXR1czogdGhpcy5vblN0YXR1cyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm9uTWVzc2FnZSxcbiAgICAgICAgICAgICAgICBwcmVzZW5jZTogdGhpcy5vblByZXNlbmNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF0sXG4gICAgICAgICAgICAgICAgd2l0aFByZXNlbmNlOiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ2V0IGEgbGlzdCBvZiB1c2VycyBvbmxpbmUgbm93XG4gICAgICAgICAgICAvLyBhc2sgUHViTnViIGZvciBpbmZvcm1hdGlvbiBhYm91dCBjb25uZWN0ZWQgdXNlcnMgaW4gdGhpcyBjaGFubmVsXG4gICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5oZXJlTm93KHtcbiAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF0sXG4gICAgICAgICAgICAgICAgaW5jbHVkZVVVSURzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVTdGF0ZTogdHJ1ZVxuICAgICAgICAgICAgfSwgdGhpcy5vbkhlcmVOb3cpO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBTZW5kIGV2ZW50cyB0byBvdGhlciBjbGllbnRzIGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAgICAgKiBFdmVudHMgYXJlIHRyaWdnZXIgb3ZlciB0aGUgbmV0d29yayAgYW5kIGFsbCBldmVudHMgYXJlIG1hZGVcbiAgICAgICAgKiBvbiBiZWhhbGYgb2Yge3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX1cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgZW1pdFxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBldmVudCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAqL1xuICAgICAgICBlbWl0KGV2ZW50LCBkYXRhKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHN0YW5kYXJkaXplZCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAgICAgbGV0IHBheWxvYWQgPSB7XG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSwgICAgICAgICAgICAvLyB0aGUgZGF0YSBzdXBwbGllZCBmcm9tIHBhcmFtc1xuICAgICAgICAgICAgICAgIHNlbmRlcjogQ2hhdEVuZ2luZS5tZS51dWlkLCAgIC8vIG15IG93biB1dWlkXG4gICAgICAgICAgICAgICAgY2hhdDogdGhpcywgICAgICAgICAgICAvLyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHJ1biB0aGUgcGx1Z2luIHF1ZXVlIHRvIG1vZGlmeSB0aGUgZXZlbnRcbiAgICAgICAgICAgIHRoaXMucnVuUGx1Z2luUXVldWUoJ2VtaXQnLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNoYXQgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIHNlcmlhbGl6ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkLCBpdCdzIHJlYnVpbHQgb24gdGhlIG90aGVyIGVuZC5cbiAgICAgICAgICAgICAgICAvLyBzZWUgdGhpcy50cmlnZ2VyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2hhdDtcblxuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2ggdGhlIGV2ZW50IGFuZCBkYXRhIG92ZXIgdGhlIGNvbmZpZ3VyZWQgY2hhbm5lbFxuXG4gICAgICAgICAgICAgICAgLy8gZW5zdXJlIHRoZSBldmVudCBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0gfHwgbmV3IEV2ZW50KHRoaXMsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5wdWJsaXNoKHBheWxvYWQpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBCcm9hZGNhc3RzIGFuIGV2ZW50IGxvY2FsbHkgdG8gYWxsIGxpc3RlbmVycy5cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgdHJpZ2dlclxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXlsb2FkIFRoZSBldmVudCBwYXlsb2FkIG9iamVjdFxuICAgICAgICAqL1xuICAgICAgICB0cmlnZ2VyKGV2ZW50LCBwYXlsb2FkKSB7XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXlsb2FkID09IFwib2JqZWN0XCIpIHtcblxuICAgICAgICAgICAgICAgIC8vIHJlc3RvcmUgY2hhdCBpbiBwYXlsb2FkXG4gICAgICAgICAgICAgICAgaWYoIXBheWxvYWQuY2hhdCkge1xuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmNoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHR1cm4gYSB1dWlkIGZvdW5kIGluIHBheWxvYWQuc2VuZGVyIHRvIGEgcmVhbCB1c2VyXG4gICAgICAgICAgICAgICAgaWYocGF5bG9hZC5zZW5kZXIgJiYgQ2hhdEVuZ2luZS51c2Vyc1twYXlsb2FkLnNlbmRlcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5zZW5kZXIgPSBDaGF0RW5naW5lLnVzZXJzW3BheWxvYWQuc2VuZGVyXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbGV0IHBsdWdpbnMgbW9kaWZ5IHRoZSBldmVudFxuICAgICAgICAgICAgdGhpcy5ydW5QbHVnaW5RdWV1ZSgnb24nLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gZW1pdCB0aGlzIGV2ZW50IHRvIGFueSBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnQsIHBheWxvYWQpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBBZGQgYSB1c2VyIHRvIHRoZSB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319LCBjcmVhdGluZyBpdCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QuXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGNyZWF0ZVVzZXJcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXNlciB1dWlkXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSB1c2VyIGluaXRpYWwgc3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRyaWdnZXIgRm9yY2UgYSB0cmlnZ2VyIHRoYXQgdGhpcyB1c2VyIGlzIG9ubGluZVxuICAgICAgICAqL1xuICAgICAgICBjcmVhdGVVc2VyKHV1aWQsIHN0YXRlLCB0cmlnZ2VyID0gZmFsc2UpIHtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhpcyB1c2VyIGV4aXN0cyBpbiB0aGUgZ2xvYmFsIGxpc3RcbiAgICAgICAgICAgIC8vIHNvIHdlIGNhbiByZWZlcmVuY2UgaXQgZnJvbSBoZXJlIG91dFxuICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IENoYXRFbmdpbmUudXNlcnNbdXVpZF0gfHwgbmV3IFVzZXIodXVpZCk7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGlzIGNoYXRyb29tIHRvIHRoZSB1c2VyJ3MgbGlzdCBvZiBjaGF0c1xuICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXS5hZGRDaGF0KHRoaXMsIHN0YXRlKTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgam9pbiBldmVudCBvdmVyIHRoaXMgY2hhdHJvb21cbiAgICAgICAgICAgIGlmKCF0aGlzLnVzZXJzW3V1aWRdIHx8IHRyaWdnZXIpIHtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IGhhcyBjb21lIG9ubGluZVxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkLm9ubGluZVxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQudXNlciBUaGUge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSB0aGF0IGNhbWUgb25saW5lXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQub25saW5lJywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiBDaGF0RW5naW5lLnVzZXJzW3V1aWRdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhpcyB1c2VyIGluIHRoZSBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy51c2Vyc1t1dWlkXSA9IENoYXRFbmdpbmUudXNlcnNbdXVpZF07XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgaW5zdGFuY2Ugb2YgdGhpcyB1c2VyXG4gICAgICAgICAgICByZXR1cm4gQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBVcGRhdGUgYSB1c2VyJ3Mgc3RhdGUgd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgdXNlclVwZGF0ZVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHV1aWRcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgU3RhdGUgdG8gdXBkYXRlIGZvciB0aGUgdXNlclxuICAgICAgICAqL1xuICAgICAgICB1c2VyVXBkYXRlKHV1aWQsIHN0YXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgdXNlciBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgIENoYXRFbmdpbmUudXNlcnNbdXVpZF0gPSBDaGF0RW5naW5lLnVzZXJzW3V1aWRdIHx8IG5ldyBVc2VyKHV1aWQpO1xuXG4gICAgICAgICAgICAvLyBpZiB3ZSBkb24ndCBrbm93IGFib3V0IHRoaXMgdXNlclxuICAgICAgICAgICAgaWYoIXRoaXMudXNlcnNbdXVpZF0pIHtcbiAgICAgICAgICAgICAgICAvLyBkbyB0aGUgd2hvbGUgam9pbiB0aGluZ1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVXNlcih1dWlkLCBzdGF0ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiB0aGlzIGNoYXRyb29tXG4gICAgICAgICAgICB0aGlzLnVzZXJzW3V1aWRdLmFzc2lnbihzdGF0ZSwgdGhpcyk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBCcm9hZGNhc3QgdGhhdCBhIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0gaGFzIGNoYW5nZWQgc3RhdGVcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQGV2ZW50ICQuc3RhdGVcbiAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQudXNlciBUaGUge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSB0aGF0IGNoYW5nZWQgc3RhdGVcbiAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQuc3RhdGUgVGhlIG5ldyB1c2VyIHN0YXRlIGZvciB0aGlzIGBgYENoYXRgYGBcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQuc3RhdGUnLCB7XG4gICAgICAgICAgICAgICAgdXNlcjogdGhpcy51c2Vyc1t1dWlkXSxcbiAgICAgICAgICAgICAgICBzdGF0ZTogdGhpcy51c2Vyc1t1dWlkXS5zdGF0ZSh0aGlzKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMZWF2ZSBmcm9tIHRoZSB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319IG9uIGJlaGFsZiBvZiB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGxlYXZlXG4gICAgICAgICAqL1xuICAgICAgICBsZWF2ZSgpIHtcblxuICAgICAgICAgICAgQ2hhdEVuZ2luZS5wdWJudWIudW5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBQZXJmb3JtIHVwZGF0ZXMgd2hlbiBhIHVzZXIgaGFzIGxlZnQgdGhlIHt7I2Nyb3NzTGluayBcIkNoYXRcIn19e3svY3Jvc3NMaW5rfX0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgbGVhdmVcbiAgICAgICAgICovXG4gICAgICAgIHVzZXJMZWF2ZSh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhIHVzZXIgbGVhdmVzLCB0cmlnZ2VyIHRoZSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5sZWF2ZScsIHRoaXMudXNlcnNbdXVpZF0pO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJC5vZmZsaW5lJywgdGhpcy51c2Vyc1t1dWlkXSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgbG9jYWwgbGlzdCBvZiB1c2Vyc1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgcmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlIGdsb2JhbCBsaXN0LFxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhleSBtYXkgYmUgb25saW5lIGluIG90aGVyIGNoYW5uZWxzXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGF0IHVzZXIgaXNuJ3QgaW4gdGhlIHVzZXIgbGlzdFxuICAgICAgICAgICAgICAgIC8vIHdlIG5ldmVyIGtuZXcgYWJvdXQgdGhpcyB1c2VyIG9yIHRoZXkgYWxyZWFkeSBsZWZ0XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXNlciBhbHJlYWR5IGxlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogRmlyZWQgd2hlbiBhIHVzZXIgZGlzY29ubmVjdHMgZnJvbSB0aGUge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCB1c2VyRGlzY29ubmVjdFxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB1dWlkIG9mIHRoZSB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgbGVmdFxuICAgICAgICAqL1xuICAgICAgICB1c2VyRGlzY29ubmVjdCh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIEEge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgYGBgQ2hhdGBgYFxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkLmRpc2Nvbm5lY3RcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBVc2VyIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgZGlzY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyQuZGlzY29ubmVjdCcsIHRoaXMudXNlcnNbdXVpZF0pO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBBIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0gaGFzIGdvbmUgb2ZmbGluZVxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkLm9mZmxpbmVcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBVc2VyIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgaGFzIGdvbmUgb2ZmbGluZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckLm9mZmxpbmUnLCB0aGlzLnVzZXJzW3V1aWRdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIExvYWQgcGx1Z2lucyBhbmQgYXR0YWNoIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIGV4ZWN1dGUgYmVmb3JlIGFuZFxuICAgICAgICAqIGFmdGVyIGV2ZW50cyBhcmUgdHJpZ2dlciBvciByZWNlaXZlZC5cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgcnVuUGx1Z2luUXVldWVcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gV2hlcmUgaW4gdGhlIG1pZGRsZWV3YXJlIHRoZSBldmVudCBzaG91bGQgcnVuIChlbWl0LCB0cmlnZ2VyKVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaXJzdCBUaGUgZmlyc3QgZnVuY3Rpb24gdG8gcnVuIGJlZm9yZSB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBsYXN0IFRoZSBsYXN0IGZ1bmN0aW9uIHRvIHJ1biBhZnRlciB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICAqL1xuICAgICAgICBydW5QbHVnaW5RdWV1ZShsb2NhdGlvbiwgZXZlbnQsIGZpcnN0LCBsYXN0KSB7XG5cbiAgICAgICAgICAgIC8vIHRoaXMgYXNzZW1ibGVzIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIHJ1biBhcyBtaWRkbGV3YXJlXG4gICAgICAgICAgICAvLyBldmVudCBpcyBhIHRyaWdnZXJlZCBldmVudCBrZXlcbiAgICAgICAgICAgIGxldCBwbHVnaW5fcXVldWUgPSBbXTtcblxuICAgICAgICAgICAgLy8gdGhlIGZpcnN0IGZ1bmN0aW9uIGlzIGFsd2F5cyByZXF1aXJlZFxuICAgICAgICAgICAgcGx1Z2luX3F1ZXVlLnB1c2goZmlyc3QpO1xuXG4gICAgICAgICAgICAvLyBsb29rIHRocm91Z2ggdGhlIGNvbmZpZ3VyZWQgcGx1Z2luc1xuICAgICAgICAgICAgZm9yKGxldCBpIGluIHRoaXMucGx1Z2lucykge1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhleSBoYXZlIGRlZmluZWQgYSBmdW5jdGlvbiB0byBydW4gc3BlY2lmaWNhbGx5XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgZXZlbnRcbiAgICAgICAgICAgICAgICBpZih0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVtsb2NhdGlvbl1cbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dW2V2ZW50XSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbl9xdWV1ZS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dW2V2ZW50XSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdhdGVyZmFsbCBydW5zIHRoZSBmdW5jdGlvbnMgaW4gYXNzaWduZWQgb3JkZXJcbiAgICAgICAgICAgIC8vIHdhaXRpbmcgZm9yIG9uZSB0byBjb21wbGV0ZSBiZWZvcmUgbW92aW5nIHRvIHRoZSBuZXh0XG4gICAgICAgICAgICAvLyB3aGVuIGl0J3MgZG9uZSwgdGhlIGBgYGxhc3RgYGAgcGFyYW1ldGVyIGlzIGNhbGxlZFxuICAgICAgICAgICAgd2F0ZXJmYWxsKHBsdWdpbl9xdWV1ZSwgbGFzdCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogU2V0IHRoZSBzdGF0ZSBmb3Ige3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX0gd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAgICAgKiBCcm9hZGNhc3RzIHRoZSBgYGAkLnN0YXRlYGBgIGV2ZW50IG9uIG90aGVyIGNsaWVudHNcbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2Qgc2V0U3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fSB3aWxsIGhhdmUgd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqL1xuICAgICAgICBzZXRTdGF0ZShzdGF0ZSkge1xuXG4gICAgICAgICAgICBDaGF0RW5naW5lLnB1Ym51Yi5zZXRTdGF0ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoc3RhdHVzLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBoYW5kbGUgc3RhdHVzLCByZXNwb25zZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICogVGhpcyBpcyBvdXIgVXNlciBjbGFzcyB3aGljaCByZXByZXNlbnRzIGEgY29ubmVjdGVkIGNsaWVudFxuICAgICpcbiAgICAqIEBjbGFzcyBVc2VyXG4gICAgKiBAY29uc3RydWN0b3JcbiAgICAqIEBleHRlbmRzIEVtaXR0ZXJcbiAgICAqL1xuICAgIGNsYXNzIFVzZXIgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih1dWlkLCBzdGF0ZSA9IHt9LCBjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWxDaGF0KSB7XG5cbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiB0aGUgVXNlcidzIHV1aWQuIFRoaXMgaXMgcHVibGljIGlkIGV4cG9zZWQgdG8gdGhlIG5ldHdvcmsuXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwcm9wZXJ0eSB1dWlkXG4gICAgICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMudXVpZCA9IHV1aWQ7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBrZWVwcyBhY2NvdW50IG9mIHVzZXIgc3RhdGUgaW4gZWFjaCBjaGFubmVsXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwcm9wZXJ0eSBzdGF0ZXNcbiAgICAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5zdGF0ZXMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIGtlZXAgYSBsaXN0IG9mIGNoYXRyb29tcyB0aGlzIHVzZXIgaXMgaW5cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHByb3BlcnR5IGNoYXRzXG4gICAgICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuY2hhdHMgPSB7fTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIGV2ZXJ5IHVzZXIgaGFzIGEgY291cGxlIHBlcnNvbmFsIHJvb21zIHdlIGNhbiBjb25uZWN0IHRvXG4gICAgICAgICAgICAqIGZlZWQgaXMgYSBsaXN0IG9mIHRoaW5ncyBhIHNwZWNpZmljIHVzZXIgZG9lcyB0aGF0XG4gICAgICAgICAgICAqIG1hbnkgcGVvcGxlIGNhbiBzdWJzY3JpYmUgdG9cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHByb3BlcnR5IGZlZWRcbiAgICAgICAgICAgICogQHR5cGUgQ2hhdFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZmVlZCA9IG5ldyBDaGF0KFxuICAgICAgICAgICAgICAgIFtDaGF0RW5naW5lLmdsb2JhbENoYXQuY2hhbm5lbCwgdXVpZCwgJ2ZlZWQnXS5qb2luKCcuJykpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogZGlyZWN0IGlzIGEgcHJpdmF0ZSBjaGFubmVsIHRoYXQgYW55Ym9keSBjYW4gcHVibGlzaCB0b1xuICAgICAgICAgICAgKiBidXQgb25seSB0aGUgdXNlciBjYW4gc3Vic2NyaWJlIHRvXG4gICAgICAgICAgICAqIHRoaXMgcGVybWlzc2lvbiBiYXNlZCBzeXN0ZW0gaXMgbm90IGltcGxlbWVudGVkIHlldFxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgZGlyZWN0XG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmRpcmVjdCA9IG5ldyBDaGF0KFxuICAgICAgICAgICAgICAgIFtDaGF0RW5naW5lLmdsb2JhbENoYXQuY2hhbm5lbCwgdXVpZCwgJ2RpcmVjdCddLmpvaW4oJy4nKSk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGRvZXMgbm90IGV4aXN0IGF0IGFsbCBhbmQgd2UgZ2V0IGVub3VnaFxuICAgICAgICAgICAgLy8gaW5mb3JtYXRpb24gdG8gYnVpbGQgdGhlIHVzZXJcbiAgICAgICAgICAgIGlmKCFDaGF0RW5naW5lLnVzZXJzW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgQ2hhdEVuZ2luZS51c2Vyc1t1dWlkXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiBpdCdzIGNyZWF0ZWQgY29udGV4dFxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIGdldCB0aGUgdXNlcidzIHN0YXRlIGluIGEgY2hhdHJvb21cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2Qgc3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQ2hhdHJvb20gdG8gcmV0cmlldmUgc3RhdGUgZnJvbVxuICAgICAgICAqL1xuICAgICAgICBzdGF0ZShjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWxDaGF0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZXNbY2hhdC5jaGFubmVsXSB8fCB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIHVwZGF0ZSB0aGUgdXNlcidzIHN0YXRlIGluIGEgc3BlY2lmaWMgY2hhdHJvb21cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgdXBkYXRlXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSBuZXcgc3RhdGUgZm9yIHRoZSB1c2VyXG4gICAgICAgICogQHBhcmFtIHtDaGF0fSBjaGF0IENoYXRyb29tIHRvIHJldHJpZXZlIHN0YXRlIGZyb21cbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlKHN0YXRlLCBjaGF0ID0gQ2hhdEVuZ2luZS5nbG9iYWxDaGF0KSB7XG4gICAgICAgICAgICBsZXQgY2hhdFN0YXRlID0gdGhpcy5zdGF0ZShjaGF0KSB8fCB7fTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzW2NoYXQuY2hhbm5lbF0gPSBPYmplY3QuYXNzaWduKGNoYXRTdGF0ZSwgc3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiB0aGlzIGlzIG9ubHkgY2FsbGVkIGZyb20gbmV0d29yayB1cGRhdGVzXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGFzc2lnblxuICAgICAgICAqL1xuICAgICAgICBhc3NpZ24oc3RhdGUsIGNoYXQpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHN0YXRlLCBjaGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogYWRkcyBhIGNoYXQgdG8gdGhpcyB1c2VyXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGFkZENoYXRcbiAgICAgICAgKi9cbiAgICAgICAgYWRkQ2hhdChjaGF0LCBzdGF0ZSkge1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2hhdCBpbiB0aGlzIHVzZXIgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLmNoYXRzW2NoYXQuY2hhbm5lbF0gPSBjaGF0O1xuXG4gICAgICAgICAgICAvLyB1cGRhdGVzIHRoZSB1c2VyJ3Mgc3RhdGUgaW4gdGhhdCBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFJlcHJlc2VudHMgdGhlIGNsaWVudCBjb25uZWN0aW9uIGFzIGEge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAqIEhhcyB0aGUgYWJpbGl0eSB0byB1cGRhdGUgaXQncyBzdGF0ZSBvbiB0aGUgbmV0d29yay4gQW4gaW5zdGFuY2Ugb2ZcbiAgICAqIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319IGlzIHJldHVybmVkIGJ5IHRoZSBgYGBDaGF0RW5naW5lLmNvbm5lY3QoKWBgYFxuICAgICogbWV0aG9kLlxuICAgICpcbiAgICAqIEBjbGFzcyBNZVxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBvZiB0aGlzIHVzZXJcbiAgICAqIEBleHRlbmRzIFVzZXJcbiAgICAqL1xuICAgIGNsYXNzIE1lIGV4dGVuZHMgVXNlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IodXVpZCkge1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBVc2VyIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBzdXBlcih1dWlkKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXNzaWduIHVwZGF0ZXMgZnJvbSBuZXR3b3JrXG4gICAgICAgIGFzc2lnbihzdGF0ZSwgY2hhdCkge1xuICAgICAgICAgICAgLy8gd2UgY2FsbCBcInVwZGF0ZVwiIGJlY2F1c2UgY2FsbGluZyBcInN1cGVyLmFzc2lnblwiXG4gICAgICAgICAgICAvLyB3aWxsIGRpcmVjdCBiYWNrIHRvIFwidGhpcy51cGRhdGVcIiB3aGljaCBjcmVhdGVzXG4gICAgICAgICAgICAvLyBhIGxvb3Agb2YgbmV0d29yayB1cGRhdGVzXG4gICAgICAgICAgICBzdXBlci51cGRhdGUoc3RhdGUsIGNoYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVXBkYXRlIHRoaXMgdXNlciBzdGF0ZSBvdmVyIHRoZSBuZXR3b3JrXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIGZvciB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqIEBwYXJhbSB7Q2hhdH0gY2hhdCBBbiBpbnN0YW5jZSBvZiB0aGUge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fSB3aGVyZSBzdGF0ZSB3aWxsIGJlIHVwZGF0ZWQuXG4gICAgICAgICogRGVmYXVsdHMgdG8gYGBgQ2hhdEVuZ2luZS5nbG9iYWxDaGF0YGBgLlxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGUoc3RhdGUsIGNoYXQgPSBDaGF0RW5naW5lLmdsb2JhbENoYXQpIHtcblxuICAgICAgICAgICAgLy8gcnVuIHRoZSByb290IHVwZGF0ZSBmdW5jdGlvblxuICAgICAgICAgICAgc3VwZXIudXBkYXRlKHN0YXRlLCBjaGF0KTtcblxuICAgICAgICAgICAgLy8gcHVibGlzaCB0aGUgdXBkYXRlIG92ZXIgdGhlIGdsb2JhbCBjaGFubmVsXG4gICAgICAgICAgICBjaGF0LnNldFN0YXRlKHN0YXRlKTtcblxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm92aWRlcyB0aGUgYmFzZSBXaWRnZXQgY2xhc3MuLi5cbiAgICAgKlxuICAgICAqIEBjbGFzcyBDaGF0RW5naW5lXG4gICAgICovXG4gICAgY29uc3QgaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcm9vdCBDaGF0RW5naW5lIG9iamVjdFxuICAgICAgICBDaGF0RW5naW5lID0gbmV3IFJvb3RFbWl0dGVyO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBhIGdsb2JhbCBsaXN0IG9mIGtub3duIHVzZXJzXG4gICAgICAgIENoYXRFbmdpbmUudXNlcnMgPSB7fTtcblxuICAgICAgICAvLyBkZWZpbmUgb3VyIGdsb2JhbCBjaGF0cm9vbSBhbGwgdXNlcnMgam9pbiBieSBkZWZhdWx0XG4gICAgICAgIENoYXRFbmdpbmUuZ2xvYmFsQ2hhdCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGRlZmluZSB0aGUgdXNlciB0aGF0IHRoaXMgY2xpZW50IHJlcHJlc2VudHNcbiAgICAgICAgQ2hhdEVuZ2luZS5tZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHN0b3JlIGEgcmVmZXJlbmNlIHRvIFB1Yk51YlxuICAgICAgICBDaGF0RW5naW5lLnB1Ym51YiA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIGNvbm5lY3QgdG8gcmVhbHRpbWUgc2VydmljZSBhbmQgY3JlYXRlIGluc3RhbmNlIG9mIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319XG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGNvbm5lY3RcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBmb3Ige3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX1cbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIGluaXRpYWwgc3RhdGUgZm9yIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319XG4gICAgICAgICogQHJldHVybiB7TWV9IG1lIGFuIGluc3RhbmNlIG9mIG1lXG4gICAgICAgICovXG4gICAgICAgIENoYXRFbmdpbmUuY29ubmVjdCA9IGZ1bmN0aW9uKHV1aWQsIHN0YXRlID0ge30pIHtcblxuICAgICAgICAgICAgLy8gdGhpcyBjcmVhdGVzIGEgdXNlciBrbm93biBhcyBNZSBhbmRcbiAgICAgICAgICAgIC8vIGNvbm5lY3RzIHRvIHRoZSBnbG9iYWwgY2hhdHJvb21cblxuICAgICAgICAgICAgLy8gdGhpcy5jb25maWcucmx0bS5jb25maWcudXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICBwbkNvbmZpZy51dWlkID0gdXVpZCB8fCBwbkNvbmZpZy51dWlkO1xuXG4gICAgICAgICAgICB0aGlzLnB1Ym51YiA9IG5ldyBQdWJOdWIocG5Db25maWcpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgY2hhdCB0byB1c2UgYXMgZ2xvYmFsQ2hhdFxuICAgICAgICAgICAgdGhpcy5nbG9iYWxDaGF0ID0gbmV3IENoYXQoZ2xvYmFsQ2hhbm5lbCk7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyB1c2VyIHRoYXQgcmVwcmVzZW50cyB0aGlzIGNsaWVudFxuICAgICAgICAgICAgdGhpcy5tZSA9IG5ldyBNZSh0aGlzLnB1Ym51Yi5nZXRVVUlEKCkpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgTWUgdXNpbmcgaW5wdXQgcGFyYW1ldGVyc1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxDaGF0LmNyZWF0ZVVzZXIodGhpcy5wdWJudWIuZ2V0VVVJRCgpLCBzdGF0ZSk7XG5cbiAgICAgICAgICAgIHRoaXMubWUudXBkYXRlKHN0YXRlKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIG1lXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZTtcblxuICAgICAgICAgICAgLy8gY2xpZW50IGNhbiBhY2Nlc3MgZ2xvYmFsQ2hhdCB0aHJvdWdoIENoYXRFbmdpbmUuZ2xvYmFsQ2hhdFxuXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gb3VyIGV4cG9ydGVkIGNsYXNzZXNcbiAgICAgICAgQ2hhdEVuZ2luZS5DaGF0ID0gQ2hhdDtcbiAgICAgICAgQ2hhdEVuZ2luZS5Vc2VyID0gVXNlcjtcblxuICAgICAgICAvLyBhZGQgYW4gb2JqZWN0IGFzIGEgc3Vib2JqZWN0IHVuZGVyIGEgbmFtZXNwb2FjZVxuICAgICAgICBDaGF0RW5naW5lLmFkZENoaWxkID0gKG9iLCBjaGlsZE5hbWUsIGNoaWxkT2IpID0+IHtcblxuICAgICAgICAgICAgLy8gYXNzaWduIHRoZSBuZXcgY2hpbGQgb2JqZWN0IGFzIGEgcHJvcGVydHkgb2YgcGFyZW50IHVuZGVyIHRoZVxuICAgICAgICAgICAgLy8gZ2l2ZW4gbmFtZXNwYWNlXG4gICAgICAgICAgICBvYltjaGlsZE5hbWVdID0gY2hpbGRPYjtcblxuICAgICAgICAgICAgLy8gdGhlIG5ldyBvYmplY3QgY2FuIHVzZSBgYGB0aGlzLnBhcmVudGBgYCB0byBhY2Nlc3NcbiAgICAgICAgICAgIC8vIHRoZSByb290IGNsYXNzXG4gICAgICAgICAgICBjaGlsZE9iLnBhcmVudCA9IG9iO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gQ2hhdEVuZ2luZTtcblxuICAgIH1cblxuICAgIC8vIHJldHVybiBhbiBpbnN0YW5jZSBvZiBDaGF0RW5naW5lXG4gICAgcmV0dXJuIGluaXQoKTtcblxufVxuXG4vLyBleHBvcnQgdGhlIENoYXRFbmdpbmUgYXBpXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwbHVnaW46IHt9LCAgLy8gbGVhdmUgYSBzcG90IGZvciBwbHVnaW5zIHRvIGV4aXN0XG4gICAgY3JlYXRlOiBjcmVhdGVcbn07XG4iLCJ3aW5kb3cuQ2hhdEVuZ2luZUNvcmUgPSB3aW5kb3cuQ2hhdEVuZ2luZUNvcmUgfHwgcmVxdWlyZSgnLi9pbmRleC5qcycpO1xuIl19
