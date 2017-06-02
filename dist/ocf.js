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


// Allows us to create and bind to events. Everything in OCF is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const PubNub = require('pubnub');

// allows a synchronous execution flow.
const waterfall = require('async/waterfall');

/**
* Global object used to create an instance of OCF.
*
* @class OpenChatFramework
* @constructor
* @param {Object} foo Argument 1
* @param config.pubnub {Object} OCF is based off PubNub. Supply your PubNub config here.
* @param config.globalChannel {String} his is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.
* @return {Object} Returns an instance of OCF
*/

const create = function(pnConfig, globalChannel = 'ocf-global') {

    let OCF = false;

    /**
    * Configures an event emitter that other OCF objects inherit. Adds shortcut methods for
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
            this.on = this.emitter.on.bind(this.emitter);

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

    /**
    * An OCF generic emitter that supports plugins and forwards
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

                // all events are forwarded to OCF object
                // so you can globally bind to events with OCF.on()
                OCF._emit(event, data);

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
                    OCF.addChild(this, module.namespace,
                        new module.extends[className]);

                    this[module.namespace].OCF = OCF;

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

            /**
            * A list of users in this {{#crossLink "Chat"}}{{/crossLink}}. Automatically kept in sync,
            * Use ```Chat.on('$ocf.join')``` and related events to get notified when this changes
            *
            * @property users
            * @type Object
            */
            this.users = {};

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
                        this.trigger('$ocf.ready');
                    }

                }

            };

            this.onMessage = (m) => {

                // if message is sent to this specific channel
                if(this.channel == m.channel) {
                    this.trigger(m.message[0], m.message[1]);
                }

            };

            this.onPresence = (presenceEvent) => {

                // make sure channel matches this channel
                if(this.channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has joined the room
                        *
                        * @event $ocf.join
                        * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                        */
                        this.trigger('$ocf.join', {
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

            // get a list of users online now
            // ask PubNub for information about connected users in this channel
            OCF.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, this.onHereNow);

            OCF.pubnub.addListener({
                status: this.onStatus,
                message: this.onMessage,
                presence: this.onPresence
            });

            OCF.pubnub.subscribe({
                channels: [this.channel]
            });

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
                sender: OCF.me.uuid,   // my own uuid
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

                OCF.pubnub.publish({
                    message: [event, payload],
                    channel: this.channel
                });

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
                if(payload.sender && OCF.users[payload.sender]) {
                    payload.sender = OCF.users[payload.sender];
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
            OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            OCF.users[uuid].addChat(this, state);

            // trigger the join event over this chatroom
            if(!this.users[uuid] || trigger) {

                /**
                * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has come online
                *
                * @event $ocf.online
                * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                */
                this.trigger('$ocf.online', {
                    user: OCF.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = OCF.users[uuid];

            // return the instance of this user
            return OCF.users[uuid];

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
            OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

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
            * @event $ocf.state
            * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that changed state
            * @param {Object} payload.state The new user state for this ```Chat```
            */
            this.trigger('$ocf.state', {
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

            OCF.pubnub.unsubscribe({
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
                this.trigger('$ocf.leave', this.users[uuid]);
                this.trigger('$ocf.offline', this.users[uuid]);

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
                * @event $ocf.disconnect
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that disconnected
                */
                this.trigger('$ocf.disconnect', this.users[uuid]);

                /**
                * A {{#crossLink "User"}}{{/crossLink}} has gone offline
                *
                * @event $ocf.offline
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that has gone offline
                */
                this.trigger('$ocf.offline', this.users[uuid]);

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
        * Broadcasts the ```$ocf.state``` event on other clients
        *
        * @method setState
        * @param {Object} state The new state {{#crossLink "Me"}}{{/crossLink}} will have within this {{#crossLink "User"}}{{/crossLink}}
        */
        setState(state) {

            OCF.pubnub.setState(
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

        constructor(uuid, state = {}, chat = OCF.globalChat) {

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
                [OCF.globalChat.channel, 'feed', uuid].join('.'));

            /**
            * direct is a private channel that anybody can publish to
            * but only the user can subscribe to
            * this permission based system is not implemented yet
            *
            * @property direct
            * @type Chat
            */
            this.direct = new Chat(
                [OCF.globalChat.channel, 'direct', uuid].join('.'));

            // if the user does not exist at all and we get enough
            // information to build the user
            if(!OCF.users[uuid]) {
                OCF.users[uuid] = this;
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
        state(chat = OCF.globalChat) {
            return this.states[chat.channel] || {};
        }

        /**
        * update the user's state in a specific chatroom
        *
        * @method update
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state, chat = OCF.globalChat) {
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
    * {{#crossLink "Me"}}{{/crossLink}} is returned by the ```OCF.connect()```
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
        * Defaults to ```OCF.globalChat```.
        */
        update(state, chat = OCF.globalChat) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel
            chat.setState(state);

        }

    }

    /**
     * Provides the base Widget class...
     *
     * @class OCF
     */
    const init = function() {

        // Create the root OCF object
        OCF = new RootEmitter;

        // create a global list of known users
        OCF.users = {};

        // define our global chatroom all users join by default
        OCF.globalChat = false;

        // define the user that this client represents
        OCF.me = false;

        // store a reference to PubNub
        OCF.pubnub = false;

        /**
        * connect to realtime service and create instance of {{#crossLink "Me"}}{{/crossLink}}
        *
        * @method connect
        * @param {String} uuid The uuid for {{#crossLink "Me"}}{{/crossLink}}
        * @param {Object} state The initial state for {{#crossLink "Me"}}{{/crossLink}}
        * @return {Me} me an instance of me
        */
        OCF.connect = function(uuid, state) {

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

            // client can access globalChat through OCF.globalChat

        };

        // our exported classes
        OCF.Chat = Chat;
        OCF.User = User;

        // add an object as a subobject under a namespoace
        OCF.addChild = (ob, childName, childOb) => {

            // assign the new child object as a property of parent under the
            // given namespace
            ob[childName] = childOb;

            // the new object can use ```this.parent``` to access
            // the root class
            childOb.parent = ob;

        }

        return OCF;

    }

    // return an instance of OCF
    return init();

}

// export the OCF api
module.exports = {
    plugin: {},  // leave a spot for plugins to exist
    create: create
};

},{"async/waterfall":3,"eventemitter2":4,"pubnub":30}],32:[function(require,module,exports){
window.OpenChatFramework = window.OpenChatFramework || require('./index.js');

},{"./index.js":31}]},{},[32])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXN5bmMvaW50ZXJuYWwvb25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9pbnRlcm5hbC9vbmx5T25jZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy93YXRlcmZhbGwuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMi9saWIvZXZlbnRlbWl0dGVyMi5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJSZXN0LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvY29uc3RhbnQuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lkZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbm9vcC5qcyIsIm5vZGVfbW9kdWxlcy9wdWJudWIvZGlzdC93ZWIvcHVibnViLm1pbi5qcyIsInNyYy9pbmRleC5qcyIsInNyYy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2x0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN3pCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBvbmNlO1xuZnVuY3Rpb24gb25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB2YXIgY2FsbEZuID0gZm47XG4gICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG9ubHlPbmNlO1xuZnVuY3Rpb24gb25seU9uY2UoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkNhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC5cIik7XG4gICAgICAgIHZhciBjYWxsRm4gPSBmbjtcbiAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICBjYWxsRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gKDAsIF9vbmNlMi5kZWZhdWx0KShjYWxsYmFjayB8fCBfbm9vcDIuZGVmYXVsdCk7XG4gICAgaWYgKCEoMCwgX2lzQXJyYXkyLmRlZmF1bHQpKHRhc2tzKSkgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJykpO1xuICAgIGlmICghdGFza3MubGVuZ3RoKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB2YXIgdGFza0luZGV4ID0gMDtcblxuICAgIGZ1bmN0aW9uIG5leHRUYXNrKGFyZ3MpIHtcbiAgICAgICAgaWYgKHRhc2tJbmRleCA9PT0gdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gKDAsIF9vbmx5T25jZTIuZGVmYXVsdCkoKDAsIF9iYXNlUmVzdDIuZGVmYXVsdCkoZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV4dFRhc2soYXJncyk7XG4gICAgICAgIH0pKTtcblxuICAgICAgICBhcmdzLnB1c2godGFza0NhbGxiYWNrKTtcblxuICAgICAgICB2YXIgdGFzayA9IHRhc2tzW3Rhc2tJbmRleCsrXTtcbiAgICAgICAgdGFzay5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9XG5cbiAgICBuZXh0VGFzayhbXSk7XG59O1xuXG52YXIgX2lzQXJyYXkgPSByZXF1aXJlKCdsb2Rhc2gvaXNBcnJheScpO1xuXG52YXIgX2lzQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNBcnJheSk7XG5cbnZhciBfbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaC9ub29wJyk7XG5cbnZhciBfbm9vcDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ub29wKTtcblxudmFyIF9vbmNlID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9vbmNlJyk7XG5cbnZhciBfb25jZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vbmNlKTtcblxudmFyIF9iYXNlUmVzdCA9IHJlcXVpcmUoJ2xvZGFzaC9fYmFzZVJlc3QnKTtcblxudmFyIF9iYXNlUmVzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9iYXNlUmVzdCk7XG5cbnZhciBfb25seU9uY2UgPSByZXF1aXJlKCcuL2ludGVybmFsL29ubHlPbmNlJyk7XG5cbnZhciBfb25seU9uY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfb25seU9uY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxuLyoqXG4gKiBSdW5zIHRoZSBgdGFza3NgIGFycmF5IG9mIGZ1bmN0aW9ucyBpbiBzZXJpZXMsIGVhY2ggcGFzc2luZyB0aGVpciByZXN1bHRzIHRvXG4gKiB0aGUgbmV4dCBpbiB0aGUgYXJyYXkuIEhvd2V2ZXIsIGlmIGFueSBvZiB0aGUgYHRhc2tzYCBwYXNzIGFuIGVycm9yIHRvIHRoZWlyXG4gKiBvd24gY2FsbGJhY2ssIHRoZSBuZXh0IGZ1bmN0aW9uIGlzIG5vdCBleGVjdXRlZCwgYW5kIHRoZSBtYWluIGBjYWxsYmFja2AgaXNcbiAqIGltbWVkaWF0ZWx5IGNhbGxlZCB3aXRoIHRoZSBlcnJvci5cbiAqXG4gKiBAbmFtZSB3YXRlcmZhbGxcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBtb2R1bGU6Q29udHJvbEZsb3dcbiAqIEBtZXRob2RcbiAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAqIEBwYXJhbSB7QXJyYXl9IHRhc2tzIC0gQW4gYXJyYXkgb2YgZnVuY3Rpb25zIHRvIHJ1biwgZWFjaCBmdW5jdGlvbiBpcyBwYXNzZWRcbiAqIGEgYGNhbGxiYWNrKGVyciwgcmVzdWx0MSwgcmVzdWx0MiwgLi4uKWAgaXQgbXVzdCBjYWxsIG9uIGNvbXBsZXRpb24uIFRoZVxuICogZmlyc3QgYXJndW1lbnQgaXMgYW4gZXJyb3IgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHNcbiAqIHdpbGwgYmUgcGFzc2VkIGFzIGFyZ3VtZW50cyBpbiBvcmRlciB0byB0aGUgbmV4dCB0YXNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEFuIG9wdGlvbmFsIGNhbGxiYWNrIHRvIHJ1biBvbmNlIGFsbCB0aGVcbiAqIGZ1bmN0aW9ucyBoYXZlIGNvbXBsZXRlZC4gVGhpcyB3aWxsIGJlIHBhc3NlZCB0aGUgcmVzdWx0cyBvZiB0aGUgbGFzdCB0YXNrJ3NcbiAqIGNhbGxiYWNrLiBJbnZva2VkIHdpdGggKGVyciwgW3Jlc3VsdHNdKS5cbiAqIEByZXR1cm5zIHVuZGVmaW5lZFxuICogQGV4YW1wbGVcbiAqXG4gKiBhc3luYy53YXRlcmZhbGwoW1xuICogICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdvbmUnLCAndHdvJyk7XG4gKiAgICAgfSxcbiAqICAgICBmdW5jdGlvbihhcmcxLCBhcmcyLCBjYWxsYmFjaykge1xuICogICAgICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICogICAgICAgICBjYWxsYmFjayhudWxsLCAndGhyZWUnKTtcbiAqICAgICB9LFxuICogICAgIGZ1bmN0aW9uKGFyZzEsIGNhbGxiYWNrKSB7XG4gKiAgICAgICAgIC8vIGFyZzEgbm93IGVxdWFscyAndGhyZWUnXG4gKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdkb25lJyk7XG4gKiAgICAgfVxuICogXSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gKiAgICAgLy8gcmVzdWx0IG5vdyBlcXVhbHMgJ2RvbmUnXG4gKiB9KTtcbiAqXG4gKiAvLyBPciwgd2l0aCBuYW1lZCBmdW5jdGlvbnM6XG4gKiBhc3luYy53YXRlcmZhbGwoW1xuICogICAgIG15Rmlyc3RGdW5jdGlvbixcbiAqICAgICBteVNlY29uZEZ1bmN0aW9uLFxuICogICAgIG15TGFzdEZ1bmN0aW9uLFxuICogXSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gKiAgICAgLy8gcmVzdWx0IG5vdyBlcXVhbHMgJ2RvbmUnXG4gKiB9KTtcbiAqIGZ1bmN0aW9uIG15Rmlyc3RGdW5jdGlvbihjYWxsYmFjaykge1xuICogICAgIGNhbGxiYWNrKG51bGwsICdvbmUnLCAndHdvJyk7XG4gKiB9XG4gKiBmdW5jdGlvbiBteVNlY29uZEZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNhbGxiYWNrKSB7XG4gKiAgICAgLy8gYXJnMSBub3cgZXF1YWxzICdvbmUnIGFuZCBhcmcyIG5vdyBlcXVhbHMgJ3R3bydcbiAqICAgICBjYWxsYmFjayhudWxsLCAndGhyZWUnKTtcbiAqIH1cbiAqIGZ1bmN0aW9uIG15TGFzdEZ1bmN0aW9uKGFyZzEsIGNhbGxiYWNrKSB7XG4gKiAgICAgLy8gYXJnMSBub3cgZXF1YWxzICd0aHJlZSdcbiAqICAgICBjYWxsYmFjayhudWxsLCAnZG9uZScpO1xuICogfVxuICovIiwiLyohXHJcbiAqIEV2ZW50RW1pdHRlcjJcclxuICogaHR0cHM6Ly9naXRodWIuY29tL2hpajFueC9FdmVudEVtaXR0ZXIyXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMyBoaWoxbnhcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKi9cclxuOyFmdW5jdGlvbih1bmRlZmluZWQpIHtcclxuXHJcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5ID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIF9pc0FycmF5KG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCI7XHJcbiAgfTtcclxuICB2YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgdGhpcy5fZXZlbnRzID0ge307XHJcbiAgICBpZiAodGhpcy5fY29uZikge1xyXG4gICAgICBjb25maWd1cmUuY2FsbCh0aGlzLCB0aGlzLl9jb25mKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25mKSB7XHJcbiAgICBpZiAoY29uZikge1xyXG4gICAgICB0aGlzLl9jb25mID0gY29uZjtcclxuXHJcbiAgICAgIGNvbmYuZGVsaW1pdGVyICYmICh0aGlzLmRlbGltaXRlciA9IGNvbmYuZGVsaW1pdGVyKTtcclxuICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IGNvbmYubWF4TGlzdGVuZXJzICE9PSB1bmRlZmluZWQgPyBjb25mLm1heExpc3RlbmVycyA6IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbiAgICAgIGNvbmYud2lsZGNhcmQgJiYgKHRoaXMud2lsZGNhcmQgPSBjb25mLndpbGRjYXJkKTtcclxuICAgICAgY29uZi5uZXdMaXN0ZW5lciAmJiAodGhpcy5uZXdMaXN0ZW5lciA9IGNvbmYubmV3TGlzdGVuZXIpO1xyXG4gICAgICBjb25mLnZlcmJvc2VNZW1vcnlMZWFrICYmICh0aGlzLnZlcmJvc2VNZW1vcnlMZWFrID0gY29uZi52ZXJib3NlTWVtb3J5TGVhayk7XHJcblxyXG4gICAgICBpZiAodGhpcy53aWxkY2FyZCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJUcmVlID0ge307XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbG9nUG9zc2libGVNZW1vcnlMZWFrKGNvdW50LCBldmVudE5hbWUpIHtcclxuICAgIHZhciBlcnJvck1zZyA9ICcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcclxuICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcclxuICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJztcclxuXHJcbiAgICBpZih0aGlzLnZlcmJvc2VNZW1vcnlMZWFrKXtcclxuICAgICAgZXJyb3JNc2cgKz0gJyBFdmVudCBuYW1lOiAlcy4nO1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnLCBjb3VudCwgZXZlbnROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGNvdW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29uc29sZS50cmFjZSl7XHJcbiAgICAgIGNvbnNvbGUudHJhY2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcihjb25mKSB7XHJcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcclxuICAgIHRoaXMubmV3TGlzdGVuZXIgPSBmYWxzZTtcclxuICAgIHRoaXMudmVyYm9zZU1lbW9yeUxlYWsgPSBmYWxzZTtcclxuICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmYpO1xyXG4gIH1cclxuICBFdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjsgLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgZm9yIGV4cG9ydGluZyBFdmVudEVtaXR0ZXIgcHJvcGVydHlcclxuXHJcbiAgLy9cclxuICAvLyBBdHRlbnRpb24sIGZ1bmN0aW9uIHJldHVybiB0eXBlIG5vdyBpcyBhcnJheSwgYWx3YXlzICFcclxuICAvLyBJdCBoYXMgemVybyBlbGVtZW50cyBpZiBubyBhbnkgbWF0Y2hlcyBmb3VuZCBhbmQgb25lIG9yIG1vcmVcclxuICAvLyBlbGVtZW50cyAobGVhZnMpIGlmIHRoZXJlIGFyZSBtYXRjaGVzXHJcbiAgLy9cclxuICBmdW5jdGlvbiBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIGkpIHtcclxuICAgIGlmICghdHJlZSkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICB2YXIgbGlzdGVuZXJzPVtdLCBsZWFmLCBsZW4sIGJyYW5jaCwgeFRyZWUsIHh4VHJlZSwgaXNvbGF0ZWRCcmFuY2gsIGVuZFJlYWNoZWQsXHJcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGUubGVuZ3RoLCBjdXJyZW50VHlwZSA9IHR5cGVbaV0sIG5leHRUeXBlID0gdHlwZVtpKzFdO1xyXG4gICAgaWYgKGkgPT09IHR5cGVMZW5ndGggJiYgdHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIElmIGF0IHRoZSBlbmQgb2YgdGhlIGV2ZW50KHMpIGxpc3QgYW5kIHRoZSB0cmVlIGhhcyBsaXN0ZW5lcnNcclxuICAgICAgLy8gaW52b2tlIHRob3NlIGxpc3RlbmVycy5cclxuICAgICAgLy9cclxuICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBoYW5kbGVycyAmJiBoYW5kbGVycy5wdXNoKHRyZWUuX2xpc3RlbmVycyk7XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGxlYWYgPSAwLCBsZW4gPSB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoOyBsZWFmIDwgbGVuOyBsZWFmKyspIHtcclxuICAgICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzW2xlYWZdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgoY3VycmVudFR5cGUgPT09ICcqJyB8fCBjdXJyZW50VHlwZSA9PT0gJyoqJykgfHwgdHJlZVtjdXJyZW50VHlwZV0pIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGV2ZW50IGVtaXR0ZWQgaXMgJyonIGF0IHRoaXMgcGFydFxyXG4gICAgICAvLyBvciB0aGVyZSBpcyBhIGNvbmNyZXRlIG1hdGNoIGF0IHRoaXMgcGF0Y2hcclxuICAgICAgLy9cclxuICAgICAgaWYgKGN1cnJlbnRUeXBlID09PSAnKicpIHtcclxuICAgICAgICBmb3IgKGJyYW5jaCBpbiB0cmVlKSB7XHJcbiAgICAgICAgICBpZiAoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgdHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgICB9IGVsc2UgaWYoY3VycmVudFR5cGUgPT09ICcqKicpIHtcclxuICAgICAgICBlbmRSZWFjaGVkID0gKGkrMSA9PT0gdHlwZUxlbmd0aCB8fCAoaSsyID09PSB0eXBlTGVuZ3RoICYmIG5leHRUeXBlID09PSAnKicpKTtcclxuICAgICAgICBpZihlbmRSZWFjaGVkICYmIHRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gVGhlIG5leHQgZWxlbWVudCBoYXMgYSBfbGlzdGVuZXJzLCBhZGQgaXQgdG8gdGhlIGhhbmRsZXJzLlxyXG4gICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWUsIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoYnJhbmNoIGluIHRyZWUpIHtcclxuICAgICAgICAgIGlmIChicmFuY2ggIT09ICdfbGlzdGVuZXJzJyAmJiB0cmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcclxuICAgICAgICAgICAgaWYoYnJhbmNoID09PSAnKicgfHwgYnJhbmNoID09PSAnKionKSB7XHJcbiAgICAgICAgICAgICAgaWYodHJlZVticmFuY2hdLl9saXN0ZW5lcnMgJiYgIWVuZFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIHR5cGVMZW5ndGgpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBuZXh0VHlwZSkge1xyXG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIE5vIG1hdGNoIG9uIHRoaXMgb25lLCBzaGlmdCBpbnRvIHRoZSB0cmVlIGJ1dCBub3QgaW4gdGhlIHR5cGUgYXJyYXkuXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2N1cnJlbnRUeXBlXSwgaSsxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgeFRyZWUgPSB0cmVlWycqJ107XHJcbiAgICBpZiAoeFRyZWUpIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHRyZWUgd2lsbCBhbGxvdyBhbnkgbWF0Y2ggZm9yIHRoaXMgcGFydCxcclxuICAgICAgLy8gdGhlbiByZWN1cnNpdmVseSBleHBsb3JlIGFsbCBicmFuY2hlcyBvZiB0aGUgdHJlZVxyXG4gICAgICAvL1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHhUcmVlLCBpKzEpO1xyXG4gICAgfVxyXG5cclxuICAgIHh4VHJlZSA9IHRyZWVbJyoqJ107XHJcbiAgICBpZih4eFRyZWUpIHtcclxuICAgICAgaWYoaSA8IHR5cGVMZW5ndGgpIHtcclxuICAgICAgICBpZih4eFRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGxpc3RlbmVyIG9uIGEgJyoqJywgaXQgd2lsbCBjYXRjaCBhbGwsIHNvIGFkZCBpdHMgaGFuZGxlci5cclxuICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGFycmF5cyBvZiBtYXRjaGluZyBuZXh0IGJyYW5jaGVzIGFuZCBvdGhlcnMuXHJcbiAgICAgICAgZm9yKGJyYW5jaCBpbiB4eFRyZWUpIHtcclxuICAgICAgICAgIGlmKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHh4VHJlZS5oYXNPd25Qcm9wZXJ0eShicmFuY2gpKSB7XHJcbiAgICAgICAgICAgIGlmKGJyYW5jaCA9PT0gbmV4dFR5cGUpIHtcclxuICAgICAgICAgICAgICAvLyBXZSBrbm93IHRoZSBuZXh0IGVsZW1lbnQgd2lsbCBtYXRjaCwgc28ganVtcCB0d2ljZS5cclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBjdXJyZW50VHlwZSkge1xyXG4gICAgICAgICAgICAgIC8vIEN1cnJlbnQgbm9kZSBtYXRjaGVzLCBtb3ZlIGludG8gdGhlIHRyZWUuXHJcbiAgICAgICAgICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4eFRyZWVbYnJhbmNoXSwgaSsxKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpc29sYXRlZEJyYW5jaCA9IHt9O1xyXG4gICAgICAgICAgICAgIGlzb2xhdGVkQnJhbmNoW2JyYW5jaF0gPSB4eFRyZWVbYnJhbmNoXTtcclxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHsgJyoqJzogaXNvbGF0ZWRCcmFuY2ggfSwgaSsxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZS5fbGlzdGVuZXJzKSB7XHJcbiAgICAgICAgLy8gV2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgYW5kIHN0aWxsIG9uIGEgJyoqJ1xyXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfSBlbHNlIGlmKHh4VHJlZVsnKiddICYmIHh4VHJlZVsnKiddLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVsnKiddLCB0eXBlTGVuZ3RoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBsaXN0ZW5lcnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBncm93TGlzdGVuZXJUcmVlKHR5cGUsIGxpc3RlbmVyKSB7XHJcblxyXG4gICAgdHlwZSA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG5cclxuICAgIC8vXHJcbiAgICAvLyBMb29rcyBmb3IgdHdvIGNvbnNlY3V0aXZlICcqKicsIGlmIHNvLCBkb24ndCBhZGQgdGhlIGV2ZW50IGF0IGFsbC5cclxuICAgIC8vXHJcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0eXBlLmxlbmd0aDsgaSsxIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYodHlwZVtpXSA9PT0gJyoqJyAmJiB0eXBlW2krMV0gPT09ICcqKicpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJlZSA9IHRoaXMubGlzdGVuZXJUcmVlO1xyXG4gICAgdmFyIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcblxyXG4gICAgd2hpbGUgKG5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgaWYgKCF0cmVlW25hbWVdKSB7XHJcbiAgICAgICAgdHJlZVtuYW1lXSA9IHt9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cmVlID0gdHJlZVtuYW1lXTtcclxuXHJcbiAgICAgIGlmICh0eXBlLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICBpZiAoIXRyZWUuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gbGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiB0cmVlLl9saXN0ZW5lcnMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzID0gW3RyZWUuX2xpc3RlbmVyc107XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG5cclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgIXRyZWUuX2xpc3RlbmVycy53YXJuZWQgJiZcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA+IDAgJiZcclxuICAgICAgICAgICAgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCA+IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnNcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMud2FybmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbG9nUG9zc2libGVNZW1vcnlMZWFrLmNhbGwodGhpcywgdHJlZS5fbGlzdGVuZXJzLmxlbmd0aCwgbmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW5cclxuICAvLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcclxuICAvLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cclxuICAvL1xyXG4gIC8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xyXG4gIC8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmRlbGltaXRlciA9ICcuJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XHJcbiAgICBpZiAobiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcbiAgICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgICBpZiAoIXRoaXMuX2NvbmYpIHRoaXMuX2NvbmYgPSB7fTtcclxuICAgICAgdGhpcy5fY29uZi5tYXhMaXN0ZW5lcnMgPSBuO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnQgPSAnJztcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XHJcbiAgICB0aGlzLm1hbnkoZXZlbnQsIDEsIGZuKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubWFueSA9IGZ1bmN0aW9uKGV2ZW50LCB0dGwsIGZuKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xyXG4gICAgICBpZiAoLS10dGwgPT09IDApIHtcclxuICAgICAgICBzZWxmLm9mZihldmVudCwgbGlzdGVuZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuZXIuX29yaWdpbiA9IGZuO1xyXG5cclxuICAgIHRoaXMub24oZXZlbnQsIGxpc3RlbmVyKTtcclxuXHJcbiAgICByZXR1cm4gc2VsZjtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHZhciB0eXBlID0gYXJndW1lbnRzWzBdO1xyXG5cclxuICAgIGlmICh0eXBlID09PSAnbmV3TGlzdGVuZXInICYmICF0aGlzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFsID0gYXJndW1lbnRzLmxlbmd0aDtcclxuICAgIHZhciBhcmdzLGwsaSxqO1xyXG4gICAgdmFyIGhhbmRsZXI7XHJcblxyXG4gICAgaWYgKHRoaXMuX2FsbCAmJiB0aGlzLl9hbGwubGVuZ3RoKSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9hbGwuc2xpY2UoKTtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwpO1xyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBhbDsgaisrKSBhcmdzW2pdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gaGFuZGxlci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgICBzd2l0Y2ggKGFsKSB7XHJcbiAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgaGFuZGxlciA9IFtdO1xyXG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcclxuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgaGFuZGxlciwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XHJcbiAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgYXJncyA9IG5ldyBBcnJheShhbCAtIDEpO1xyXG4gICAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSBpZiAoaGFuZGxlcikge1xyXG4gICAgICAgIC8vIG5lZWQgdG8gbWFrZSBjb3B5IG9mIGhhbmRsZXJzIGJlY2F1c2UgbGlzdCBjYW4gY2hhbmdlIGluIHRoZSBtaWRkbGVcclxuICAgICAgICAvLyBvZiBlbWl0IGNhbGxcclxuICAgICAgICBoYW5kbGVyID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5sZW5ndGgpIHtcclxuICAgICAgaWYgKGFsID4gMykge1xyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChpID0gMCwgbCA9IGhhbmRsZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XHJcbiAgICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAhIXRoaXMuX2FsbDtcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXRBc3luYyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcikgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtmYWxzZV0pOyB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHByb21pc2VzPSBbXTtcclxuXHJcbiAgICB2YXIgYWwgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgdmFyIGFyZ3MsbCxpLGo7XHJcbiAgICB2YXIgaGFuZGxlcjtcclxuXHJcbiAgICBpZiAodGhpcy5fYWxsKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqXSA9IGFyZ3VtZW50c1tqXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGkgPSAwLCBsID0gdGhpcy5fYWxsLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5fYWxsW2ldLmNhbGwodGhpcywgdHlwZSwgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHRoaXMuX2FsbFtpXS5jYWxsKHRoaXMsIHR5cGUsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLl9hbGxbaV0uYXBwbHkodGhpcywgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGhhbmRsZXIgPSBbXTtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXIsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLmV2ZW50ID0gdHlwZTtcclxuICAgICAgc3dpdGNoIChhbCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcykpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkoYWwgLSAxKTtcclxuICAgICAgICBmb3IgKGogPSAxOyBqIDwgYWw7IGorKykgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XHJcbiAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChoYW5kbGVyICYmIGhhbmRsZXIubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChhbCA+IDMpIHtcclxuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGFsIC0gMSk7XHJcbiAgICAgICAgZm9yIChqID0gMTsgaiA8IGFsOyBqKyspIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBoYW5kbGVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xyXG4gICAgICAgIHN3aXRjaCAoYWwpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGhhbmRsZXJbaV0uY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgIHByb21pc2VzLnB1c2goaGFuZGxlcltpXS5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChoYW5kbGVyW2ldLmFwcGx5KHRoaXMsIGFyZ3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2FsbCAmJiB0eXBlID09PSAnZXJyb3InKSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChhcmd1bWVudHNbMV0pOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vbkFueSh0eXBlKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29uIG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcclxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJzXCIuXHJcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgIGlmICh0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgIGdyb3dMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCB0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XHJcbiAgICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAodHlwZW9mIHRoaXMuX2V2ZW50c1t0eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8vIENoYW5nZSB0byBhcnJheS5cclxuICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxyXG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgJiZcclxuICAgICAgICB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID4gMCAmJlxyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgIGxvZ1Bvc3NpYmxlTWVtb3J5TGVhay5jYWxsKHRoaXMsIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgsIHR5cGUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignb25Bbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fYWxsKSB7XHJcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIGV2ZW50IGxpc3RlbmVyIGNvbGxlY3Rpb24uXHJcbiAgICB0aGlzLl9hbGwucHVzaChmbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhbmRsZXJzLGxlYWZzPVtdO1xyXG5cclxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cclxuICAgICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xyXG4gICAgICBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgbGVhZnMucHVzaCh7X2xpc3RlbmVyczpoYW5kbGVyc30pO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGlMZWFmPTA7IGlMZWFmPGxlYWZzLmxlbmd0aDsgaUxlYWYrKykge1xyXG4gICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgaGFuZGxlcnMgPSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgIGlmIChpc0FycmF5KGhhbmRsZXJzKSkge1xyXG5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAtMTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoaGFuZGxlcnNbaV0gPT09IGxpc3RlbmVyIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5saXN0ZW5lciAmJiBoYW5kbGVyc1tpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHx8XHJcbiAgICAgICAgICAgIChoYW5kbGVyc1tpXS5fb3JpZ2luICYmIGhhbmRsZXJzW2ldLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMCkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XHJcbiAgICAgICAgICBsZWFmLl9saXN0ZW5lcnMuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbWl0KFwicmVtb3ZlTGlzdGVuZXJcIiwgdHlwZSwgbGlzdGVuZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChoYW5kbGVycyA9PT0gbGlzdGVuZXIgfHxcclxuICAgICAgICAoaGFuZGxlcnMubGlzdGVuZXIgJiYgaGFuZGxlcnMubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB8fFxyXG4gICAgICAgIChoYW5kbGVycy5fb3JpZ2luICYmIGhhbmRsZXJzLl9vcmlnaW4gPT09IGxpc3RlbmVyKSkge1xyXG4gICAgICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgICAgIGRlbGV0ZSBsZWFmLl9saXN0ZW5lcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW1pdChcInJlbW92ZUxpc3RlbmVyXCIsIHR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5R2FyYmFnZUNvbGxlY3Qocm9vdCkge1xyXG4gICAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vdCk7XHJcbiAgICAgIGZvciAodmFyIGkgaW4ga2V5cykge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciBvYmogPSByb290W2tleV07XHJcbiAgICAgICAgaWYgKChvYmogaW5zdGFuY2VvZiBGdW5jdGlvbikgfHwgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHx8IChvYmogPT09IG51bGwpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmVjdXJzaXZlbHlHYXJiYWdlQ29sbGVjdChyb290W2tleV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIGRlbGV0ZSByb290W2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZWN1cnNpdmVseUdhcmJhZ2VDb2xsZWN0KHRoaXMubGlzdGVuZXJUcmVlKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZkFueSA9IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICB2YXIgaSA9IDAsIGwgPSAwLCBmbnM7XHJcbiAgICBpZiAoZm4gJiYgdGhpcy5fYWxsICYmIHRoaXMuX2FsbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmKGZuID09PSBmbnNbaV0pIHtcclxuICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbik7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZucyA9IHRoaXMuX2FsbDtcclxuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKylcclxuICAgICAgICB0aGlzLmVtaXQoXCJyZW1vdmVMaXN0ZW5lckFueVwiLCBmbnNbaV0pO1xyXG4gICAgICB0aGlzLl9hbGwgPSBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZjtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAhdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XHJcbiAgICAgIHZhciBsZWFmcyA9IHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIG51bGwsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XHJcblxyXG4gICAgICBmb3IgKHZhciBpTGVhZj0wOyBpTGVhZjxsZWFmcy5sZW5ndGg7IGlMZWFmKyspIHtcclxuICAgICAgICB2YXIgbGVhZiA9IGxlYWZzW2lMZWFmXTtcclxuICAgICAgICBsZWFmLl9saXN0ZW5lcnMgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHMpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgaWYgKHRoaXMud2lsZGNhcmQpIHtcclxuICAgICAgdmFyIGhhbmRsZXJzID0gW107XHJcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xyXG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVycywgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcclxuICAgICAgcmV0dXJuIGhhbmRsZXJzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2V2ZW50cyB8fCBpbml0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xyXG4gICAgaWYgKCFpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcclxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzW3R5cGVdO1xyXG4gIH07XHJcblxyXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiB0aGlzLmxpc3RlbmVycyh0eXBlKS5sZW5ndGg7XHJcbiAgfTtcclxuXHJcbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnNBbnkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZih0aGlzLl9hbGwpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2FsbDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgLy8gQ29tbW9uSlNcclxuICAgIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsLlxyXG4gICAgd2luZG93LkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XHJcbiAgfVxyXG59KCk7XHJcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCIvKipcbiAqIEEgZmFzdGVyIGFsdGVybmF0aXZlIHRvIGBGdW5jdGlvbiNhcHBseWAsIHRoaXMgZnVuY3Rpb24gaW52b2tlcyBgZnVuY2BcbiAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAqIEBwYXJhbSB7Kn0gdGhpc0FyZyBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtBcnJheX0gYXJncyBUaGUgYXJndW1lbnRzIHRvIGludm9rZSBgZnVuY2Agd2l0aC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICovXG5mdW5jdGlvbiBhcHBseShmdW5jLCB0aGlzQXJnLCBhcmdzKSB7XG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZyk7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHk7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHZhbHVlID0gT2JqZWN0KHZhbHVlKTtcbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiB2YWx1ZSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc01hc2tlZCA9IHJlcXVpcmUoJy4vX2lzTWFza2VkJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc05hdGl2ZTtcbiIsInZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHknKSxcbiAgICBvdmVyUmVzdCA9IHJlcXVpcmUoJy4vX292ZXJSZXN0JyksXG4gICAgc2V0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19zZXRUb1N0cmluZycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICByZXR1cm4gc2V0VG9TdHJpbmcob3ZlclJlc3QoZnVuYywgc3RhcnQsIGlkZW50aXR5KSwgZnVuYyArICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlUmVzdDtcbiIsInZhciBjb25zdGFudCA9IHJlcXVpcmUoJy4vY29uc3RhbnQnKSxcbiAgICBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTZXRUb1N0cmluZztcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBjb3JlSnNEYXRhID0gcmVxdWlyZSgnLi9fY29yZUpzRGF0YScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgYXBwbHkgPSByZXF1aXJlKCcuL19hcHBseScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUmVzdGAgd2hpY2ggdHJhbnNmb3JtcyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgcmVzdCBhcnJheSB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlclJlc3QoZnVuYywgc3RhcnQsIHRyYW5zZm9ybSkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSB0cmFuc2Zvcm0oYXJyYXkpO1xuICAgIHJldHVybiBhcHBseShmdW5jLCB0aGlzLCBvdGhlckFyZ3MpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJSZXN0O1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIGJhc2VTZXRUb1N0cmluZyA9IHJlcXVpcmUoJy4vX2Jhc2VTZXRUb1N0cmluZycpLFxuICAgIHNob3J0T3V0ID0gcmVxdWlyZSgnLi9fc2hvcnRPdXQnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG9ydE91dDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29uc3RhbnQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gXy50aW1lcygyLCBfLmNvbnN0YW50KHsgJ2EnOiAxIH0pKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzKTtcbiAqIC8vID0+IFt7ICdhJzogMSB9LCB7ICdhJzogMSB9XVxuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHNbMF0gPT09IG9iamVjdHNbMV0pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBjb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnN0YW50O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLm5vb3ApO1xuICogLy8gPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkXVxuICovXG5mdW5jdGlvbiBub29wKCkge1xuICAvLyBObyBvcGVyYXRpb24gcGVyZm9ybWVkLlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5vb3A7XG4iLCIhZnVuY3Rpb24oZSx0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSx0KTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9leHBvcnRzLlB1Yk51Yj10KCk6ZS5QdWJOdWI9dCgpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQocil7aWYobltyXSlyZXR1cm4gbltyXS5leHBvcnRzO3ZhciBpPW5bcl09e2V4cG9ydHM6e30saWQ6cixsb2FkZWQ6ITF9O3JldHVybiBlW3JdLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLHQpLGkubG9hZGVkPSEwLGkuZXhwb3J0c312YXIgbj17fTtyZXR1cm4gdC5tPWUsdC5jPW4sdC5wPVwiXCIsdCgwKX0oW2Z1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1mdW5jdGlvbiBzKGUsdCl7aWYoIWUpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiF0fHxcIm9iamVjdFwiIT10eXBlb2YgdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgdD9lOnR9ZnVuY3Rpb24gbyhlLHQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIHQmJm51bGwhPT10KXRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiK3R5cGVvZiB0KTtlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQmJnQucHJvdG90eXBlLHtjb25zdHJ1Y3Rvcjp7dmFsdWU6ZSxlbnVtZXJhYmxlOiExLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH19KSx0JiYoT2JqZWN0LnNldFByb3RvdHlwZU9mP09iamVjdC5zZXRQcm90b3R5cGVPZihlLHQpOmUuX19wcm90b19fPXQpfWZ1bmN0aW9uIGEoZSl7aWYoIW5hdmlnYXRvcnx8IW5hdmlnYXRvci5zZW5kQmVhY29uKXJldHVybiExO25hdmlnYXRvci5zZW5kQmVhY29uKGUpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciB1PW4oMSksYz1yKHUpLGw9big0MCksaD1yKGwpLGY9big0MSksZD1yKGYpLHA9big0MiksZz0obig4KSxmdW5jdGlvbihlKXtmdW5jdGlvbiB0KGUpe2kodGhpcyx0KTt2YXIgbj1lLmxpc3RlblRvQnJvd3Nlck5ldHdvcmtFdmVudHMscj12b2lkIDA9PT1ufHxuO2UuZGI9ZC5kZWZhdWx0LGUuc2RrRmFtaWx5PVwiV2ViXCIsZS5uZXR3b3JraW5nPW5ldyBoLmRlZmF1bHQoe2dldDpwLmdldCxwb3N0OnAucG9zdCxzZW5kQmVhY29uOmF9KTt2YXIgbz1zKHRoaXMsKHQuX19wcm90b19ffHxPYmplY3QuZ2V0UHJvdG90eXBlT2YodCkpLmNhbGwodGhpcyxlKSk7cmV0dXJuIHImJih3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9mZmxpbmVcIixmdW5jdGlvbigpe28ubmV0d29ya0Rvd25EZXRlY3RlZCgpfSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmxpbmVcIixmdW5jdGlvbigpe28ubmV0d29ya1VwRGV0ZWN0ZWQoKX0pKSxvfXJldHVybiBvKHQsZSksdH0oYy5kZWZhdWx0KSk7dC5kZWZhdWx0PWcsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7aWYoZSYmZS5fX2VzTW9kdWxlKXJldHVybiBlO3ZhciB0PXt9O2lmKG51bGwhPWUpZm9yKHZhciBuIGluIGUpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsbikmJih0W25dPWVbbl0pO3JldHVybiB0LmRlZmF1bHQ9ZSx0fWZ1bmN0aW9uIGkoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIHMoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksYT1uKDIpLHU9aShhKSxjPW4oNyksbD1pKGMpLGg9big5KSxmPWkoaCksZD1uKDExKSxwPWkoZCksZz1uKDEyKSx5PWkoZyksdj1uKDE4KSxiPWkodiksXz1uKDE5KSxtPXIoXyksaz1uKDIwKSxQPXIoayksUz1uKDIxKSxPPXIoUyksdz1uKDIyKSxUPXIodyksQz1uKDIzKSxNPXIoQyksRT1uKDI0KSx4PXIoRSksTj1uKDI1KSxSPXIoTiksSz1uKDI2KSxBPXIoSyksaj1uKDI3KSxEPXIoaiksRz1uKDI4KSxVPXIoRyksQj1uKDI5KSxJPXIoQiksSD1uKDMwKSxMPXIoSCkscT1uKDMxKSxGPXIocSksej1uKDMyKSxYPXIoeiksVz1uKDMzKSxWPXIoVyksSj1uKDM0KSwkPXIoSiksUT1uKDM1KSxZPXIoUSksWj1uKDM2KSxlZT1yKFopLHRlPW4oMzcpLG5lPXIodGUpLHJlPW4oMzgpLGllPXIocmUpLHNlPW4oMTUpLG9lPXIoc2UpLGFlPW4oMzkpLHVlPXIoYWUpLGNlPW4oMTYpLGxlPWkoY2UpLGhlPW4oMTMpLGZlPWkoaGUpLGRlPShuKDgpLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10aGlzO3ModGhpcyxlKTt2YXIgcj10LmRiLGk9dC5uZXR3b3JraW5nLG89dGhpcy5fY29uZmlnPW5ldyBsLmRlZmF1bHQoe3NldHVwOnQsZGI6cn0pLGE9bmV3IGYuZGVmYXVsdCh7Y29uZmlnOm99KTtpLmluaXQobyk7dmFyIHU9e2NvbmZpZzpvLG5ldHdvcmtpbmc6aSxjcnlwdG86YX0sYz1iLmRlZmF1bHQuYmluZCh0aGlzLHUsb2UpLGg9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFUpLGQ9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEwpLGc9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFgpLHY9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LHVlKSxfPXRoaXMuX2xpc3RlbmVyTWFuYWdlcj1uZXcgeS5kZWZhdWx0LGs9bmV3IHAuZGVmYXVsdCh7dGltZUVuZHBvaW50OmMsbGVhdmVFbmRwb2ludDpoLGhlYXJ0YmVhdEVuZHBvaW50OmQsc2V0U3RhdGVFbmRwb2ludDpnLHN1YnNjcmliZUVuZHBvaW50OnYsY3J5cHRvOnUuY3J5cHRvLGNvbmZpZzp1LmNvbmZpZyxsaXN0ZW5lck1hbmFnZXI6X30pO3RoaXMuYWRkTGlzdGVuZXI9Xy5hZGRMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlTGlzdGVuZXI9Xy5yZW1vdmVMaXN0ZW5lci5iaW5kKF8pLHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzPV8ucmVtb3ZlQWxsTGlzdGVuZXJzLmJpbmQoXyksdGhpcy5jaGFubmVsR3JvdXBzPXtsaXN0R3JvdXBzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxUKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LE0pLGFkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxtKSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUCksZGVsZXRlR3JvdXA6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LE8pfSx0aGlzLnB1c2g9e2FkZENoYW5uZWxzOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSx4KSxyZW1vdmVDaGFubmVsczpiLmRlZmF1bHQuYmluZCh0aGlzLHUsUiksZGVsZXRlRGV2aWNlOmIuZGVmYXVsdC5iaW5kKHRoaXMsdSxEKSxsaXN0Q2hhbm5lbHM6Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEEpfSx0aGlzLmhlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LFYpLHRoaXMud2hlcmVOb3c9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEkpLHRoaXMuZ2V0U3RhdGU9Yi5kZWZhdWx0LmJpbmQodGhpcyx1LEYpLHRoaXMuc2V0U3RhdGU9ay5hZGFwdFN0YXRlQ2hhbmdlLmJpbmQoayksdGhpcy5ncmFudD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsWSksdGhpcy5hdWRpdD1iLmRlZmF1bHQuYmluZCh0aGlzLHUsJCksdGhpcy5wdWJsaXNoPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxlZSksdGhpcy5maXJlPWZ1bmN0aW9uKGUsdCl7ZS5yZXBsaWNhdGU9ITEsZS5zdG9yZUluSGlzdG9yeT0hMSxuLnB1Ymxpc2goZSx0KX0sdGhpcy5oaXN0b3J5PWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxuZSksdGhpcy5mZXRjaE1lc3NhZ2VzPWIuZGVmYXVsdC5iaW5kKHRoaXMsdSxpZSksdGhpcy50aW1lPWMsdGhpcy5zdWJzY3JpYmU9ay5hZGFwdFN1YnNjcmliZUNoYW5nZS5iaW5kKGspLHRoaXMudW5zdWJzY3JpYmU9ay5hZGFwdFVuc3Vic2NyaWJlQ2hhbmdlLmJpbmQoayksdGhpcy5kaXNjb25uZWN0PWsuZGlzY29ubmVjdC5iaW5kKGspLHRoaXMucmVjb25uZWN0PWsucmVjb25uZWN0LmJpbmQoayksdGhpcy5kZXN0cm95PWZ1bmN0aW9uKGUpe2sudW5zdWJzY3JpYmVBbGwoZSksay5kaXNjb25uZWN0KCl9LHRoaXMuc3RvcD10aGlzLmRlc3Ryb3ksdGhpcy51bnN1YnNjcmliZUFsbD1rLnVuc3Vic2NyaWJlQWxsLmJpbmQoayksdGhpcy5nZXRTdWJzY3JpYmVkQ2hhbm5lbHM9ay5nZXRTdWJzY3JpYmVkQ2hhbm5lbHMuYmluZChrKSx0aGlzLmdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzPWsuZ2V0U3Vic2NyaWJlZENoYW5uZWxHcm91cHMuYmluZChrKSx0aGlzLmVuY3J5cHQ9YS5lbmNyeXB0LmJpbmQoYSksdGhpcy5kZWNyeXB0PWEuZGVjcnlwdC5iaW5kKGEpLHRoaXMuZ2V0QXV0aEtleT11LmNvbmZpZy5nZXRBdXRoS2V5LmJpbmQodS5jb25maWcpLHRoaXMuc2V0QXV0aEtleT11LmNvbmZpZy5zZXRBdXRoS2V5LmJpbmQodS5jb25maWcpLHRoaXMuc2V0Q2lwaGVyS2V5PXUuY29uZmlnLnNldENpcGhlcktleS5iaW5kKHUuY29uZmlnKSx0aGlzLmdldFVVSUQ9dS5jb25maWcuZ2V0VVVJRC5iaW5kKHUuY29uZmlnKSx0aGlzLnNldFVVSUQ9dS5jb25maWcuc2V0VVVJRC5iaW5kKHUuY29uZmlnKSx0aGlzLmdldEZpbHRlckV4cHJlc3Npb249dS5jb25maWcuZ2V0RmlsdGVyRXhwcmVzc2lvbi5iaW5kKHUuY29uZmlnKSx0aGlzLnNldEZpbHRlckV4cHJlc3Npb249dS5jb25maWcuc2V0RmlsdGVyRXhwcmVzc2lvbi5iaW5kKHUuY29uZmlnKX1yZXR1cm4gbyhlLFt7a2V5OlwiZ2V0VmVyc2lvblwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NvbmZpZy5nZXRWZXJzaW9uKCl9fSx7a2V5OlwibmV0d29ya0Rvd25EZXRlY3RlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlTmV0d29ya0Rvd24oKSx0aGlzLl9jb25maWcucmVzdG9yZT90aGlzLmRpc2Nvbm5lY3QoKTp0aGlzLmRlc3Ryb3koITApfX0se2tleTpcIm5ldHdvcmtVcERldGVjdGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VOZXR3b3JrVXAoKSx0aGlzLnJlY29ubmVjdCgpfX1dLFt7a2V5OlwiZ2VuZXJhdGVVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdS5kZWZhdWx0LnY0KCl9fV0pLGV9KCkpO2RlLk9QRVJBVElPTlM9bGUuZGVmYXVsdCxkZS5DQVRFR09SSUVTPWZlLmRlZmF1bHQsdC5kZWZhdWx0PWRlLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uKDMpLGk9big2KSxzPWk7cy52MT1yLHMudjQ9aSxlLmV4cG9ydHM9c30sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSx0LG4pe3ZhciByPXQmJm58fDAsaT10fHxbXTtlPWV8fHt9O3ZhciBvPXZvaWQgMCE9PWUuY2xvY2tzZXE/ZS5jbG9ja3NlcTp1LGg9dm9pZCAwIT09ZS5tc2Vjcz9lLm1zZWNzOihuZXcgRGF0ZSkuZ2V0VGltZSgpLGY9dm9pZCAwIT09ZS5uc2Vjcz9lLm5zZWNzOmwrMSxkPWgtYysoZi1sKS8xZTQ7aWYoZDwwJiZ2b2lkIDA9PT1lLmNsb2Nrc2VxJiYobz1vKzEmMTYzODMpLChkPDB8fGg+YykmJnZvaWQgMD09PWUubnNlY3MmJihmPTApLGY+PTFlNCl0aHJvdyBuZXcgRXJyb3IoXCJ1dWlkLnYxKCk6IENhbid0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlY1wiKTtjPWgsbD1mLHU9byxoKz0xMjIxOTI5MjhlNTt2YXIgcD0oMWU0KigyNjg0MzU0NTUmaCkrZiklNDI5NDk2NzI5NjtpW3IrK109cD4+PjI0JjI1NSxpW3IrK109cD4+PjE2JjI1NSxpW3IrK109cD4+PjgmMjU1LGlbcisrXT0yNTUmcDt2YXIgZz1oLzQyOTQ5NjcyOTYqMWU0JjI2ODQzNTQ1NTtpW3IrK109Zz4+PjgmMjU1LGlbcisrXT0yNTUmZyxpW3IrK109Zz4+PjI0JjE1fDE2LGlbcisrXT1nPj4+MTYmMjU1LGlbcisrXT1vPj4+OHwxMjgsaVtyKytdPTI1NSZvO2Zvcih2YXIgeT1lLm5vZGV8fGEsdj0wO3Y8NjsrK3YpaVtyK3ZdPXlbdl07cmV0dXJuIHR8fHMoaSl9dmFyIGk9big0KSxzPW4oNSksbz1pKCksYT1bMXxvWzBdLG9bMV0sb1syXSxvWzNdLG9bNF0sb1s1XV0sdT0xNjM4MyYob1s2XTw8OHxvWzddKSxjPTAsbD0wO2UuZXhwb3J0cz1yfSxmdW5jdGlvbihlLHQpeyhmdW5jdGlvbih0KXt2YXIgbixyPXQuY3J5cHRvfHx0Lm1zQ3J5cHRvO2lmKHImJnIuZ2V0UmFuZG9tVmFsdWVzKXt2YXIgaT1uZXcgVWludDhBcnJheSgxNik7bj1mdW5jdGlvbigpe3JldHVybiByLmdldFJhbmRvbVZhbHVlcyhpKSxpfX1pZighbil7dmFyIHM9bmV3IEFycmF5KDE2KTtuPWZ1bmN0aW9uKCl7Zm9yKHZhciBlLHQ9MDt0PDE2O3QrKykwPT0oMyZ0KSYmKGU9NDI5NDk2NzI5NipNYXRoLnJhbmRvbSgpKSxzW3RdPWU+Pj4oKDMmdCk8PDMpJjI1NTtyZXR1cm4gc319ZS5leHBvcnRzPW59KS5jYWxsKHQsZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKSl9LGZ1bmN0aW9uKGUsdCl7ZnVuY3Rpb24gbihlLHQpe3ZhciBuPXR8fDAsaT1yO3JldHVybiBpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStcIi1cIitpW2VbbisrXV0raVtlW24rK11dK1wiLVwiK2lbZVtuKytdXStpW2VbbisrXV0rXCItXCIraVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV0raVtlW24rK11dK2lbZVtuKytdXStpW2VbbisrXV19Zm9yKHZhciByPVtdLGk9MDtpPDI1NjsrK2kpcltpXT0oaSsyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7ZS5leHBvcnRzPW59LGZ1bmN0aW9uKGUsdCxuKXtmdW5jdGlvbiByKGUsdCxuKXt2YXIgcj10JiZufHwwO1wic3RyaW5nXCI9PXR5cGVvZiBlJiYodD1cImJpbmFyeVwiPT1lP25ldyBBcnJheSgxNik6bnVsbCxlPW51bGwpLGU9ZXx8e307dmFyIG89ZS5yYW5kb218fChlLnJuZ3x8aSkoKTtpZihvWzZdPTE1Jm9bNl18NjQsb1s4XT02MyZvWzhdfDEyOCx0KWZvcih2YXIgYT0wO2E8MTY7KythKXRbcithXT1vW2FdO3JldHVybiB0fHxzKG8pfXZhciBpPW4oNCkscz1uKDUpO2UuZXhwb3J0cz1yfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oMiksbz1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KHMpLGE9KG4oOCksZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuc2V0dXAsaT10LmRiO3IodGhpcyxlKSx0aGlzLl9kYj1pLHRoaXMuaW5zdGFuY2VJZD1cInBuLVwiK28uZGVmYXVsdC52NCgpLHRoaXMuc2VjcmV0S2V5PW4uc2VjcmV0S2V5fHxuLnNlY3JldF9rZXksdGhpcy5zdWJzY3JpYmVLZXk9bi5zdWJzY3JpYmVLZXl8fG4uc3Vic2NyaWJlX2tleSx0aGlzLnB1Ymxpc2hLZXk9bi5wdWJsaXNoS2V5fHxuLnB1Ymxpc2hfa2V5LHRoaXMuc2RrRmFtaWx5PW4uc2RrRmFtaWx5LHRoaXMucGFydG5lcklkPW4ucGFydG5lcklkLHRoaXMuc2V0QXV0aEtleShuLmF1dGhLZXkpLHRoaXMuc2V0Q2lwaGVyS2V5KG4uY2lwaGVyS2V5KSx0aGlzLnNldEZpbHRlckV4cHJlc3Npb24obi5maWx0ZXJFeHByZXNzaW9uKSx0aGlzLm9yaWdpbj1uLm9yaWdpbnx8XCJwdWJzdWIucHVibnViLmNvbVwiLHRoaXMuc2VjdXJlPW4uc3NsfHwhMSx0aGlzLnJlc3RvcmU9bi5yZXN0b3JlfHwhMSx0aGlzLnByb3h5PW4ucHJveHksdGhpcy5rZWVwQWxpdmU9bi5rZWVwQWxpdmUsdGhpcy5rZWVwQWxpdmVTZXR0aW5ncz1uLmtlZXBBbGl2ZVNldHRpbmdzLHRoaXMuY3VzdG9tRW5jcnlwdD1uLmN1c3RvbUVuY3J5cHQsdGhpcy5jdXN0b21EZWNyeXB0PW4uY3VzdG9tRGVjcnlwdCxcInVuZGVmaW5lZFwiIT10eXBlb2YgbG9jYXRpb24mJlwiaHR0cHM6XCI9PT1sb2NhdGlvbi5wcm90b2NvbCYmKHRoaXMuc2VjdXJlPSEwKSx0aGlzLmxvZ1ZlcmJvc2l0eT1uLmxvZ1ZlcmJvc2l0eXx8ITEsdGhpcy5zdXBwcmVzc0xlYXZlRXZlbnRzPW4uc3VwcHJlc3NMZWF2ZUV2ZW50c3x8ITEsdGhpcy5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHM9bi5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHN8fCEwLHRoaXMuYW5ub3VuY2VTdWNjZXNzZnVsSGVhcnRiZWF0cz1uLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHN8fCExLHRoaXMudXNlSW5zdGFuY2VJZD1uLnVzZUluc3RhbmNlSWR8fCExLHRoaXMudXNlUmVxdWVzdElkPW4udXNlUmVxdWVzdElkfHwhMSx0aGlzLnJlcXVlc3RNZXNzYWdlQ291bnRUaHJlc2hvbGQ9bi5yZXF1ZXN0TWVzc2FnZUNvdW50VGhyZXNob2xkLHRoaXMuc2V0VHJhbnNhY3Rpb25UaW1lb3V0KG4udHJhbnNhY3Rpb25hbFJlcXVlc3RUaW1lb3V0fHwxNWUzKSx0aGlzLnNldFN1YnNjcmliZVRpbWVvdXQobi5zdWJzY3JpYmVSZXF1ZXN0VGltZW91dHx8MzFlNCksdGhpcy5zZXRTZW5kQmVhY29uQ29uZmlnKG4udXNlU2VuZEJlYWNvbnx8ITApLHRoaXMuc2V0UHJlc2VuY2VUaW1lb3V0KG4ucHJlc2VuY2VUaW1lb3V0fHwzMDApLG4uaGVhcnRiZWF0SW50ZXJ2YWwmJnRoaXMuc2V0SGVhcnRiZWF0SW50ZXJ2YWwobi5oZWFydGJlYXRJbnRlcnZhbCksdGhpcy5zZXRVVUlEKHRoaXMuX2RlY2lkZVVVSUQobi51dWlkKSl9cmV0dXJuIGkoZSxbe2tleTpcImdldEF1dGhLZXlcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmF1dGhLZXl9fSx7a2V5Olwic2V0QXV0aEtleVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmF1dGhLZXk9ZSx0aGlzfX0se2tleTpcInNldENpcGhlcktleVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmNpcGhlcktleT1lLHRoaXN9fSx7a2V5OlwiZ2V0VVVJRFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuVVVJRH19LHtrZXk6XCJzZXRVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2RiJiZ0aGlzLl9kYi5zZXQmJnRoaXMuX2RiLnNldCh0aGlzLnN1YnNjcmliZUtleStcInV1aWRcIixlKSx0aGlzLlVVSUQ9ZSx0aGlzfX0se2tleTpcImdldEZpbHRlckV4cHJlc3Npb25cIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZpbHRlckV4cHJlc3Npb259fSx7a2V5Olwic2V0RmlsdGVyRXhwcmVzc2lvblwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmZpbHRlckV4cHJlc3Npb249ZSx0aGlzfX0se2tleTpcImdldFByZXNlbmNlVGltZW91dFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ByZXNlbmNlVGltZW91dH19LHtrZXk6XCJzZXRQcmVzZW5jZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcHJlc2VuY2VUaW1lb3V0PWUsdGhpcy5zZXRIZWFydGJlYXRJbnRlcnZhbCh0aGlzLl9wcmVzZW5jZVRpbWVvdXQvMi0xKSx0aGlzfX0se2tleTpcImdldEhlYXJ0YmVhdEludGVydmFsXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWx9fSx7a2V5Olwic2V0SGVhcnRiZWF0SW50ZXJ2YWxcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGVhcnRiZWF0SW50ZXJ2YWw9ZSx0aGlzfX0se2tleTpcImdldFN1YnNjcmliZVRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zdWJzY3JpYmVSZXF1ZXN0VGltZW91dH19LHtrZXk6XCJzZXRTdWJzY3JpYmVUaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3N1YnNjcmliZVJlcXVlc3RUaW1lb3V0PWUsdGhpc319LHtrZXk6XCJnZXRUcmFuc2FjdGlvblRpbWVvdXRcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl90cmFuc2FjdGlvbmFsUmVxdWVzdFRpbWVvdXR9fSx7a2V5Olwic2V0VHJhbnNhY3Rpb25UaW1lb3V0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3RyYW5zYWN0aW9uYWxSZXF1ZXN0VGltZW91dD1lLHRoaXN9fSx7a2V5OlwiaXNTZW5kQmVhY29uRW5hYmxlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3VzZVNlbmRCZWFjb259fSx7a2V5Olwic2V0U2VuZEJlYWNvbkNvbmZpZ1wiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl91c2VTZW5kQmVhY29uPWUsdGhpc319LHtrZXk6XCJnZXRWZXJzaW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm5cIjQuMTAuMFwifX0se2tleTpcIl9kZWNpZGVVVUlEXCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIGV8fCh0aGlzLl9kYiYmdGhpcy5fZGIuZ2V0JiZ0aGlzLl9kYi5nZXQodGhpcy5zdWJzY3JpYmVLZXkrXCJ1dWlkXCIpP3RoaXMuX2RiLmdldCh0aGlzLnN1YnNjcmliZUtleStcInV1aWRcIik6XCJwbi1cIitvLmRlZmF1bHQudjQoKSl9fV0pLGV9KCkpO3QuZGVmYXVsdD1hLGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZS5leHBvcnRzPXt9fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxvPW4oNyksYT0ocihvKSxuKDEwKSksdT1yKGEpLGM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQpe3ZhciBuPXQuY29uZmlnO2kodGhpcyxlKSx0aGlzLl9jb25maWc9bix0aGlzLl9pdj1cIjAxMjM0NTY3ODkwMTIzNDVcIix0aGlzLl9hbGxvd2VkS2V5RW5jb2RpbmdzPVtcImhleFwiLFwidXRmOFwiLFwiYmFzZTY0XCIsXCJiaW5hcnlcIl0sdGhpcy5fYWxsb3dlZEtleUxlbmd0aHM9WzEyOCwyNTZdLHRoaXMuX2FsbG93ZWRNb2Rlcz1bXCJlY2JcIixcImNiY1wiXSx0aGlzLl9kZWZhdWx0T3B0aW9ucz17ZW5jcnlwdEtleTohMCxrZXlFbmNvZGluZzpcInV0ZjhcIixrZXlMZW5ndGg6MjU2LG1vZGU6XCJjYmNcIn19cmV0dXJuIHMoZSxbe2tleTpcIkhNQUNTSEEyNTZcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm4gdS5kZWZhdWx0LkhtYWNTSEEyNTYoZSx0aGlzLl9jb25maWcuc2VjcmV0S2V5KS50b1N0cmluZyh1LmRlZmF1bHQuZW5jLkJhc2U2NCl9fSx7a2V5OlwiU0hBMjU2XCIsdmFsdWU6ZnVuY3Rpb24oZSl7cmV0dXJuIHUuZGVmYXVsdC5TSEEyNTYoZSkudG9TdHJpbmcodS5kZWZhdWx0LmVuYy5IZXgpfX0se2tleTpcIl9wYXJzZU9wdGlvbnNcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD1lfHx7fTtyZXR1cm4gdC5oYXNPd25Qcm9wZXJ0eShcImVuY3J5cHRLZXlcIil8fCh0LmVuY3J5cHRLZXk9dGhpcy5fZGVmYXVsdE9wdGlvbnMuZW5jcnlwdEtleSksdC5oYXNPd25Qcm9wZXJ0eShcImtleUVuY29kaW5nXCIpfHwodC5rZXlFbmNvZGluZz10aGlzLl9kZWZhdWx0T3B0aW9ucy5rZXlFbmNvZGluZyksdC5oYXNPd25Qcm9wZXJ0eShcImtleUxlbmd0aFwiKXx8KHQua2V5TGVuZ3RoPXRoaXMuX2RlZmF1bHRPcHRpb25zLmtleUxlbmd0aCksdC5oYXNPd25Qcm9wZXJ0eShcIm1vZGVcIil8fCh0Lm1vZGU9dGhpcy5fZGVmYXVsdE9wdGlvbnMubW9kZSksLTE9PT10aGlzLl9hbGxvd2VkS2V5RW5jb2RpbmdzLmluZGV4T2YodC5rZXlFbmNvZGluZy50b0xvd2VyQ2FzZSgpKSYmKHQua2V5RW5jb2Rpbmc9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5RW5jb2RpbmcpLC0xPT09dGhpcy5fYWxsb3dlZEtleUxlbmd0aHMuaW5kZXhPZihwYXJzZUludCh0LmtleUxlbmd0aCwxMCkpJiYodC5rZXlMZW5ndGg9dGhpcy5fZGVmYXVsdE9wdGlvbnMua2V5TGVuZ3RoKSwtMT09PXRoaXMuX2FsbG93ZWRNb2Rlcy5pbmRleE9mKHQubW9kZS50b0xvd2VyQ2FzZSgpKSYmKHQubW9kZT10aGlzLl9kZWZhdWx0T3B0aW9ucy5tb2RlKSx0fX0se2tleTpcIl9kZWNvZGVLZXlcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3JldHVyblwiYmFzZTY0XCI9PT10LmtleUVuY29kaW5nP3UuZGVmYXVsdC5lbmMuQmFzZTY0LnBhcnNlKGUpOlwiaGV4XCI9PT10LmtleUVuY29kaW5nP3UuZGVmYXVsdC5lbmMuSGV4LnBhcnNlKGUpOmV9fSx7a2V5OlwiX2dldFBhZGRlZEtleVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIGU9dGhpcy5fZGVjb2RlS2V5KGUsdCksdC5lbmNyeXB0S2V5P3UuZGVmYXVsdC5lbmMuVXRmOC5wYXJzZSh0aGlzLlNIQTI1NihlKS5zbGljZSgwLDMyKSk6ZX19LHtrZXk6XCJfZ2V0TW9kZVwiLHZhbHVlOmZ1bmN0aW9uKGUpe3JldHVyblwiZWNiXCI9PT1lLm1vZGU/dS5kZWZhdWx0Lm1vZGUuRUNCOnUuZGVmYXVsdC5tb2RlLkNCQ319LHtrZXk6XCJfZ2V0SVZcIix2YWx1ZTpmdW5jdGlvbihlKXtyZXR1cm5cImNiY1wiPT09ZS5tb2RlP3UuZGVmYXVsdC5lbmMuVXRmOC5wYXJzZSh0aGlzLl9pdik6bnVsbH19LHtrZXk6XCJlbmNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9jb25maWcuY3VzdG9tRW5jcnlwdD90aGlzLl9jb25maWcuY3VzdG9tRW5jcnlwdChlKTp0aGlzLnBuRW5jcnlwdChlLHQsbil9fSx7a2V5OlwiZGVjcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gdGhpcy5fY29uZmlnLmN1c3RvbURlY3J5cHQ/dGhpcy5fY29uZmlnLmN1c3RvbURlY3J5cHQoZSk6dGhpcy5wbkRlY3J5cHQoZSx0LG4pfX0se2tleTpcInBuRW5jcnlwdFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuKXtpZighdCYmIXRoaXMuX2NvbmZpZy5jaXBoZXJLZXkpcmV0dXJuIGU7bj10aGlzLl9wYXJzZU9wdGlvbnMobik7dmFyIHI9dGhpcy5fZ2V0SVYobiksaT10aGlzLl9nZXRNb2RlKG4pLHM9dGhpcy5fZ2V0UGFkZGVkS2V5KHR8fHRoaXMuX2NvbmZpZy5jaXBoZXJLZXksbik7cmV0dXJuIHUuZGVmYXVsdC5BRVMuZW5jcnlwdChlLHMse2l2OnIsbW9kZTppfSkuY2lwaGVydGV4dC50b1N0cmluZyh1LmRlZmF1bHQuZW5jLkJhc2U2NCl8fGV9fSx7a2V5OlwicG5EZWNyeXB0XCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe2lmKCF0JiYhdGhpcy5fY29uZmlnLmNpcGhlcktleSlyZXR1cm4gZTtuPXRoaXMuX3BhcnNlT3B0aW9ucyhuKTt2YXIgcj10aGlzLl9nZXRJVihuKSxpPXRoaXMuX2dldE1vZGUobikscz10aGlzLl9nZXRQYWRkZWRLZXkodHx8dGhpcy5fY29uZmlnLmNpcGhlcktleSxuKTt0cnl7dmFyIG89dS5kZWZhdWx0LmVuYy5CYXNlNjQucGFyc2UoZSksYT11LmRlZmF1bHQuQUVTLmRlY3J5cHQoe2NpcGhlcnRleHQ6b30scyx7aXY6cixtb2RlOml9KS50b1N0cmluZyh1LmRlZmF1bHQuZW5jLlV0ZjgpO3JldHVybiBKU09OLnBhcnNlKGEpfWNhdGNoKGUpe3JldHVybiBudWxsfX19XSksZX0oKTt0LmRlZmF1bHQ9YyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO3ZhciBuPW58fGZ1bmN0aW9uKGUsdCl7dmFyIG49e30scj1uLmxpYj17fSxpPWZ1bmN0aW9uKCl7fSxzPXIuQmFzZT17ZXh0ZW5kOmZ1bmN0aW9uKGUpe2kucHJvdG90eXBlPXRoaXM7dmFyIHQ9bmV3IGk7cmV0dXJuIGUmJnQubWl4SW4oZSksdC5oYXNPd25Qcm9wZXJ0eShcImluaXRcIil8fCh0LmluaXQ9ZnVuY3Rpb24oKXt0LiRzdXBlci5pbml0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX0pLHQuaW5pdC5wcm90b3R5cGU9dCx0LiRzdXBlcj10aGlzLHR9LGNyZWF0ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuZXh0ZW5kKCk7cmV0dXJuIGUuaW5pdC5hcHBseShlLGFyZ3VtZW50cyksZX0saW5pdDpmdW5jdGlvbigpe30sbWl4SW46ZnVuY3Rpb24oZSl7Zm9yKHZhciB0IGluIGUpZS5oYXNPd25Qcm9wZXJ0eSh0KSYmKHRoaXNbdF09ZVt0XSk7ZS5oYXNPd25Qcm9wZXJ0eShcInRvU3RyaW5nXCIpJiYodGhpcy50b1N0cmluZz1lLnRvU3RyaW5nKX0sY2xvbmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbml0LnByb3RvdHlwZS5leHRlbmQodGhpcyl9fSxvPXIuV29yZEFycmF5PXMuZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUsdCl7ZT10aGlzLndvcmRzPWV8fFtdLHRoaXMuc2lnQnl0ZXM9dm9pZCAwIT10P3Q6NCplLmxlbmd0aH0sdG9TdHJpbmc6ZnVuY3Rpb24oZSl7cmV0dXJuKGV8fHUpLnN0cmluZ2lmeSh0aGlzKX0sY29uY2F0OmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMud29yZHMsbj1lLndvcmRzLHI9dGhpcy5zaWdCeXRlcztpZihlPWUuc2lnQnl0ZXMsdGhpcy5jbGFtcCgpLHIlNClmb3IodmFyIGk9MDtpPGU7aSsrKXRbcitpPj4+Ml18PShuW2k+Pj4yXT4+PjI0LWklNCo4JjI1NSk8PDI0LShyK2kpJTQqODtlbHNlIGlmKDY1NTM1PG4ubGVuZ3RoKWZvcihpPTA7aTxlO2krPTQpdFtyK2k+Pj4yXT1uW2k+Pj4yXTtlbHNlIHQucHVzaC5hcHBseSh0LG4pO3JldHVybiB0aGlzLnNpZ0J5dGVzKz1lLHRoaXN9LGNsYW1wOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy53b3JkcyxuPXRoaXMuc2lnQnl0ZXM7dFtuPj4+Ml0mPTQyOTQ5NjcyOTU8PDMyLW4lNCo4LHQubGVuZ3RoPWUuY2VpbChuLzQpfSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPXMuY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS53b3Jkcz10aGlzLndvcmRzLnNsaWNlKDApLGV9LHJhbmRvbTpmdW5jdGlvbih0KXtmb3IodmFyIG49W10scj0wO3I8dDtyKz00KW4ucHVzaCg0Mjk0OTY3Mjk2KmUucmFuZG9tKCl8MCk7cmV0dXJuIG5ldyBvLmluaXQobix0KX19KSxhPW4uZW5jPXt9LHU9YS5IZXg9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzO2U9ZS5zaWdCeXRlcztmb3IodmFyIG49W10scj0wO3I8ZTtyKyspe3ZhciBpPXRbcj4+PjJdPj4+MjQtciU0KjgmMjU1O24ucHVzaCgoaT4+PjQpLnRvU3RyaW5nKDE2KSksbi5wdXNoKCgxNSZpKS50b1N0cmluZygxNikpfXJldHVybiBuLmpvaW4oXCJcIil9LHBhcnNlOmZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1lLmxlbmd0aCxuPVtdLHI9MDtyPHQ7cis9MiluW3I+Pj4zXXw9cGFyc2VJbnQoZS5zdWJzdHIociwyKSwxNik8PDI0LXIlOCo0O3JldHVybiBuZXcgby5pbml0KG4sdC8yKX19LGM9YS5MYXRpbjE9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzO2U9ZS5zaWdCeXRlcztmb3IodmFyIG49W10scj0wO3I8ZTtyKyspbi5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUodFtyPj4+Ml0+Pj4yNC1yJTQqOCYyNTUpKTtyZXR1cm4gbi5qb2luKFwiXCIpfSxwYXJzZTpmdW5jdGlvbihlKXtmb3IodmFyIHQ9ZS5sZW5ndGgsbj1bXSxyPTA7cjx0O3IrKyluW3I+Pj4yXXw9KDI1NSZlLmNoYXJDb2RlQXQocikpPDwyNC1yJTQqODtyZXR1cm4gbmV3IG8uaW5pdChuLHQpfX0sbD1hLlV0Zjg9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt0cnl7cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoYy5zdHJpbmdpZnkoZSkpKX1jYXRjaChlKXt0aHJvdyBFcnJvcihcIk1hbGZvcm1lZCBVVEYtOCBkYXRhXCIpfX0scGFyc2U6ZnVuY3Rpb24oZSl7cmV0dXJuIGMucGFyc2UodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGUpKSl9fSxoPXIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobT1zLmV4dGVuZCh7cmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9kYXRhPW5ldyBvLmluaXQsdGhpcy5fbkRhdGFCeXRlcz0wfSxfYXBwZW5kOmZ1bmN0aW9uKGUpe1wic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT1sLnBhcnNlKGUpKSx0aGlzLl9kYXRhLmNvbmNhdChlKSx0aGlzLl9uRGF0YUJ5dGVzKz1lLnNpZ0J5dGVzfSxfcHJvY2VzczpmdW5jdGlvbih0KXt2YXIgbj10aGlzLl9kYXRhLHI9bi53b3JkcyxpPW4uc2lnQnl0ZXMscz10aGlzLmJsb2NrU2l6ZSxhPWkvKDQqcyksYT10P2UuY2VpbChhKTplLm1heCgoMHxhKS10aGlzLl9taW5CdWZmZXJTaXplLDApO2lmKHQ9YSpzLGk9ZS5taW4oNCp0LGkpLHQpe2Zvcih2YXIgdT0wO3U8dDt1Kz1zKXRoaXMuX2RvUHJvY2Vzc0Jsb2NrKHIsdSk7dT1yLnNwbGljZSgwLHQpLG4uc2lnQnl0ZXMtPWl9cmV0dXJuIG5ldyBvLmluaXQodSxpKX0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1zLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2RhdGE9dGhpcy5fZGF0YS5jbG9uZSgpLGV9LF9taW5CdWZmZXJTaXplOjB9KTtyLkhhc2hlcj1oLmV4dGVuZCh7Y2ZnOnMuZXh0ZW5kKCksaW5pdDpmdW5jdGlvbihlKXt0aGlzLmNmZz10aGlzLmNmZy5leHRlbmQoZSksdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe2gucmVzZXQuY2FsbCh0aGlzKSx0aGlzLl9kb1Jlc2V0KCl9LHVwZGF0ZTpmdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fYXBwZW5kKGUpLHRoaXMuX3Byb2Nlc3MoKSx0aGlzfSxmaW5hbGl6ZTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmdGhpcy5fYXBwZW5kKGUpLHRoaXMuX2RvRmluYWxpemUoKX0sYmxvY2tTaXplOjE2LF9jcmVhdGVIZWxwZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQsbil7cmV0dXJuIG5ldyBlLmluaXQobikuZmluYWxpemUodCl9fSxfY3JlYXRlSG1hY0hlbHBlcjpmdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24odCxuKXtyZXR1cm4gbmV3IGYuSE1BQy5pbml0KGUsbikuZmluYWxpemUodCl9fX0pO3ZhciBmPW4uYWxnbz17fTtyZXR1cm4gbn0oTWF0aCk7IWZ1bmN0aW9uKGUpe2Zvcih2YXIgdD1uLHI9dC5saWIsaT1yLldvcmRBcnJheSxzPXIuSGFzaGVyLHI9dC5hbGdvLG89W10sYT1bXSx1PWZ1bmN0aW9uKGUpe3JldHVybiA0Mjk0OTY3Mjk2KihlLSgwfGUpKXwwfSxjPTIsbD0wOzY0Pmw7KXt2YXIgaDtlOntoPWM7Zm9yKHZhciBmPWUuc3FydChoKSxkPTI7ZDw9ZjtkKyspaWYoIShoJWQpKXtoPSExO2JyZWFrIGV9aD0hMH1oJiYoOD5sJiYob1tsXT11KGUucG93KGMsLjUpKSksYVtsXT11KGUucG93KGMsMS8zKSksbCsrKSxjKyt9dmFyIHA9W10scj1yLlNIQTI1Nj1zLmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9oYXNoPW5ldyBpLmluaXQoby5zbGljZSgwKSl9LF9kb1Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe2Zvcih2YXIgbj10aGlzLl9oYXNoLndvcmRzLHI9blswXSxpPW5bMV0scz1uWzJdLG89blszXSx1PW5bNF0sYz1uWzVdLGw9bls2XSxoPW5bN10sZj0wOzY0PmY7ZisrKXtpZigxNj5mKXBbZl09MHxlW3QrZl07ZWxzZXt2YXIgZD1wW2YtMTVdLGc9cFtmLTJdO3BbZl09KChkPDwyNXxkPj4+NyleKGQ8PDE0fGQ+Pj4xOCleZD4+PjMpK3BbZi03XSsoKGc8PDE1fGc+Pj4xNyleKGc8PDEzfGc+Pj4xOSleZz4+PjEwKStwW2YtMTZdfWQ9aCsoKHU8PDI2fHU+Pj42KV4odTw8MjF8dT4+PjExKV4odTw8N3x1Pj4+MjUpKSsodSZjXn51JmwpK2FbZl0rcFtmXSxnPSgocjw8MzB8cj4+PjIpXihyPDwxOXxyPj4+MTMpXihyPDwxMHxyPj4+MjIpKSsociZpXnImc15pJnMpLGg9bCxsPWMsYz11LHU9bytkfDAsbz1zLHM9aSxpPXIscj1kK2d8MH1uWzBdPW5bMF0rcnwwLG5bMV09blsxXStpfDAsblsyXT1uWzJdK3N8MCxuWzNdPW5bM10rb3wwLG5bNF09bls0XSt1fDAsbls1XT1uWzVdK2N8MCxuWzZdPW5bNl0rbHwwLG5bN109bls3XStofDB9LF9kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fZGF0YSxuPXQud29yZHMscj04KnRoaXMuX25EYXRhQnl0ZXMsaT04KnQuc2lnQnl0ZXM7cmV0dXJuIG5baT4+PjVdfD0xMjg8PDI0LWklMzIsblsxNCsoaSs2ND4+Pjk8PDQpXT1lLmZsb29yKHIvNDI5NDk2NzI5NiksblsxNSsoaSs2ND4+Pjk8PDQpXT1yLHQuc2lnQnl0ZXM9NCpuLmxlbmd0aCx0aGlzLl9wcm9jZXNzKCksdGhpcy5faGFzaH0sY2xvbmU6ZnVuY3Rpb24oKXt2YXIgZT1zLmNsb25lLmNhbGwodGhpcyk7cmV0dXJuIGUuX2hhc2g9dGhpcy5faGFzaC5jbG9uZSgpLGV9fSk7dC5TSEEyNTY9cy5fY3JlYXRlSGVscGVyKHIpLHQuSG1hY1NIQTI1Nj1zLl9jcmVhdGVIbWFjSGVscGVyKHIpfShNYXRoKSxmdW5jdGlvbigpe3ZhciBlPW4sdD1lLmVuYy5VdGY4O2UuYWxnby5ITUFDPWUubGliLkJhc2UuZXh0ZW5kKHtpbml0OmZ1bmN0aW9uKGUsbil7ZT10aGlzLl9oYXNoZXI9bmV3IGUuaW5pdCxcInN0cmluZ1wiPT10eXBlb2YgbiYmKG49dC5wYXJzZShuKSk7dmFyIHI9ZS5ibG9ja1NpemUsaT00KnI7bi5zaWdCeXRlcz5pJiYobj1lLmZpbmFsaXplKG4pKSxuLmNsYW1wKCk7Zm9yKHZhciBzPXRoaXMuX29LZXk9bi5jbG9uZSgpLG89dGhpcy5faUtleT1uLmNsb25lKCksYT1zLndvcmRzLHU9by53b3JkcyxjPTA7YzxyO2MrKylhW2NdXj0xNTQ5NTU2ODI4LHVbY11ePTkwOTUyMjQ4NjtzLnNpZ0J5dGVzPW8uc2lnQnl0ZXM9aSx0aGlzLnJlc2V0KCl9LHJlc2V0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5faGFzaGVyO2UucmVzZXQoKSxlLnVwZGF0ZSh0aGlzLl9pS2V5KX0sdXBkYXRlOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9oYXNoZXIudXBkYXRlKGUpLHRoaXN9LGZpbmFsaXplOmZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuX2hhc2hlcjtyZXR1cm4gZT10LmZpbmFsaXplKGUpLHQucmVzZXQoKSx0LmZpbmFsaXplKHRoaXMuX29LZXkuY2xvbmUoKS5jb25jYXQoZSkpfX0pfSgpLGZ1bmN0aW9uKCl7dmFyIGU9bix0PWUubGliLldvcmRBcnJheTtlLmVuYy5CYXNlNjQ9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLndvcmRzLG49ZS5zaWdCeXRlcyxyPXRoaXMuX21hcDtlLmNsYW1wKCksZT1bXTtmb3IodmFyIGk9MDtpPG47aSs9Mylmb3IodmFyIHM9KHRbaT4+PjJdPj4+MjQtaSU0KjgmMjU1KTw8MTZ8KHRbaSsxPj4+Ml0+Pj4yNC0oaSsxKSU0KjgmMjU1KTw8OHx0W2krMj4+PjJdPj4+MjQtKGkrMiklNCo4JjI1NSxvPTA7ND5vJiZpKy43NSpvPG47bysrKWUucHVzaChyLmNoYXJBdChzPj4+NiooMy1vKSY2MykpO2lmKHQ9ci5jaGFyQXQoNjQpKWZvcig7ZS5sZW5ndGglNDspZS5wdXNoKHQpO3JldHVybiBlLmpvaW4oXCJcIil9LHBhcnNlOmZ1bmN0aW9uKGUpe3ZhciBuPWUubGVuZ3RoLHI9dGhpcy5fbWFwLGk9ci5jaGFyQXQoNjQpO2kmJi0xIT0oaT1lLmluZGV4T2YoaSkpJiYobj1pKTtmb3IodmFyIGk9W10scz0wLG89MDtvPG47bysrKWlmKG8lNCl7dmFyIGE9ci5pbmRleE9mKGUuY2hhckF0KG8tMSkpPDxvJTQqMix1PXIuaW5kZXhPZihlLmNoYXJBdChvKSk+Pj42LW8lNCoyO2lbcz4+PjJdfD0oYXx1KTw8MjQtcyU0KjgscysrfXJldHVybiB0LmNyZWF0ZShpLHMpfSxfbWFwOlwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIn19KCksZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlLHQsbixyLGkscyxvKXtyZXR1cm4oKGU9ZSsodCZufH50JnIpK2krbyk8PHN8ZT4+PjMyLXMpK3R9ZnVuY3Rpb24gcihlLHQsbixyLGkscyxvKXtyZXR1cm4oKGU9ZSsodCZyfG4mfnIpK2krbyk8PHN8ZT4+PjMyLXMpK3R9ZnVuY3Rpb24gaShlLHQsbixyLGkscyxvKXtyZXR1cm4oKGU9ZSsodF5uXnIpK2krbyk8PHN8ZT4+PjMyLXMpK3R9ZnVuY3Rpb24gcyhlLHQsbixyLGkscyxvKXtyZXR1cm4oKGU9ZSsobl4odHx+cikpK2krbyk8PHN8ZT4+PjMyLXMpK3R9Zm9yKHZhciBvPW4sYT1vLmxpYix1PWEuV29yZEFycmF5LGM9YS5IYXNoZXIsYT1vLmFsZ28sbD1bXSxoPTA7NjQ+aDtoKyspbFtoXT00Mjk0OTY3Mjk2KmUuYWJzKGUuc2luKGgrMSkpfDA7YT1hLk1ENT1jLmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXt0aGlzLl9oYXNoPW5ldyB1LmluaXQoWzE3MzI1ODQxOTMsNDAyMzIzMzQxNywyNTYyMzgzMTAyLDI3MTczMzg3OF0pfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSxuKXtmb3IodmFyIG89MDsxNj5vO28rKyl7dmFyIGE9bitvLHU9ZVthXTtlW2FdPTE2NzExOTM1Jih1PDw4fHU+Pj4yNCl8NDI3ODI1NTM2MCYodTw8MjR8dT4+PjgpfXZhciBvPXRoaXMuX2hhc2gud29yZHMsYT1lW24rMF0sdT1lW24rMV0sYz1lW24rMl0saD1lW24rM10sZj1lW24rNF0sZD1lW24rNV0scD1lW24rNl0sZz1lW24rN10seT1lW24rOF0sdj1lW24rOV0sYj1lW24rMTBdLF89ZVtuKzExXSxtPWVbbisxMl0saz1lW24rMTNdLFA9ZVtuKzE0XSxTPWVbbisxNV0sTz1vWzBdLHc9b1sxXSxUPW9bMl0sQz1vWzNdLE89dChPLHcsVCxDLGEsNyxsWzBdKSxDPXQoQyxPLHcsVCx1LDEyLGxbMV0pLFQ9dChULEMsTyx3LGMsMTcsbFsyXSksdz10KHcsVCxDLE8saCwyMixsWzNdKSxPPXQoTyx3LFQsQyxmLDcsbFs0XSksQz10KEMsTyx3LFQsZCwxMixsWzVdKSxUPXQoVCxDLE8sdyxwLDE3LGxbNl0pLHc9dCh3LFQsQyxPLGcsMjIsbFs3XSksTz10KE8sdyxULEMseSw3LGxbOF0pLEM9dChDLE8sdyxULHYsMTIsbFs5XSksVD10KFQsQyxPLHcsYiwxNyxsWzEwXSksdz10KHcsVCxDLE8sXywyMixsWzExXSksTz10KE8sdyxULEMsbSw3LGxbMTJdKSxDPXQoQyxPLHcsVCxrLDEyLGxbMTNdKSxUPXQoVCxDLE8sdyxQLDE3LGxbMTRdKSx3PXQodyxULEMsTyxTLDIyLGxbMTVdKSxPPXIoTyx3LFQsQyx1LDUsbFsxNl0pLEM9cihDLE8sdyxULHAsOSxsWzE3XSksVD1yKFQsQyxPLHcsXywxNCxsWzE4XSksdz1yKHcsVCxDLE8sYSwyMCxsWzE5XSksTz1yKE8sdyxULEMsZCw1LGxbMjBdKSxDPXIoQyxPLHcsVCxiLDksbFsyMV0pLFQ9cihULEMsTyx3LFMsMTQsbFsyMl0pLHc9cih3LFQsQyxPLGYsMjAsbFsyM10pLE89cihPLHcsVCxDLHYsNSxsWzI0XSksQz1yKEMsTyx3LFQsUCw5LGxbMjVdKSxUPXIoVCxDLE8sdyxoLDE0LGxbMjZdKSx3PXIodyxULEMsTyx5LDIwLGxbMjddKSxPPXIoTyx3LFQsQyxrLDUsbFsyOF0pLEM9cihDLE8sdyxULGMsOSxsWzI5XSksVD1yKFQsQyxPLHcsZywxNCxsWzMwXSksdz1yKHcsVCxDLE8sbSwyMCxsWzMxXSksTz1pKE8sdyxULEMsZCw0LGxbMzJdKSxDPWkoQyxPLHcsVCx5LDExLGxbMzNdKSxUPWkoVCxDLE8sdyxfLDE2LGxbMzRdKSx3PWkodyxULEMsTyxQLDIzLGxbMzVdKSxPPWkoTyx3LFQsQyx1LDQsbFszNl0pLEM9aShDLE8sdyxULGYsMTEsbFszN10pLFQ9aShULEMsTyx3LGcsMTYsbFszOF0pLHc9aSh3LFQsQyxPLGIsMjMsbFszOV0pLE89aShPLHcsVCxDLGssNCxsWzQwXSksQz1pKEMsTyx3LFQsYSwxMSxsWzQxXSksVD1pKFQsQyxPLHcsaCwxNixsWzQyXSksdz1pKHcsVCxDLE8scCwyMyxsWzQzXSksTz1pKE8sdyxULEMsdiw0LGxbNDRdKSxDPWkoQyxPLHcsVCxtLDExLGxbNDVdKSxUPWkoVCxDLE8sdyxTLDE2LGxbNDZdKSx3PWkodyxULEMsTyxjLDIzLGxbNDddKSxPPXMoTyx3LFQsQyxhLDYsbFs0OF0pLEM9cyhDLE8sdyxULGcsMTAsbFs0OV0pLFQ9cyhULEMsTyx3LFAsMTUsbFs1MF0pLHc9cyh3LFQsQyxPLGQsMjEsbFs1MV0pLE89cyhPLHcsVCxDLG0sNixsWzUyXSksQz1zKEMsTyx3LFQsaCwxMCxsWzUzXSksVD1zKFQsQyxPLHcsYiwxNSxsWzU0XSksdz1zKHcsVCxDLE8sdSwyMSxsWzU1XSksTz1zKE8sdyxULEMseSw2LGxbNTZdKSxDPXMoQyxPLHcsVCxTLDEwLGxbNTddKSxUPXMoVCxDLE8sdyxwLDE1LGxbNThdKSx3PXModyxULEMsTyxrLDIxLGxbNTldKSxPPXMoTyx3LFQsQyxmLDYsbFs2MF0pLEM9cyhDLE8sdyxULF8sMTAsbFs2MV0pLFQ9cyhULEMsTyx3LGMsMTUsbFs2Ml0pLHc9cyh3LFQsQyxPLHYsMjEsbFs2M10pO29bMF09b1swXStPfDAsb1sxXT1vWzFdK3d8MCxvWzJdPW9bMl0rVHwwLG9bM109b1szXStDfDB9LF9kb0ZpbmFsaXplOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fZGF0YSxuPXQud29yZHMscj04KnRoaXMuX25EYXRhQnl0ZXMsaT04KnQuc2lnQnl0ZXM7bltpPj4+NV18PTEyODw8MjQtaSUzMjt2YXIgcz1lLmZsb29yKHIvNDI5NDk2NzI5Nik7Zm9yKG5bMTUrKGkrNjQ+Pj45PDw0KV09MTY3MTE5MzUmKHM8PDh8cz4+PjI0KXw0Mjc4MjU1MzYwJihzPDwyNHxzPj4+OCksblsxNCsoaSs2ND4+Pjk8PDQpXT0xNjcxMTkzNSYocjw8OHxyPj4+MjQpfDQyNzgyNTUzNjAmKHI8PDI0fHI+Pj44KSx0LnNpZ0J5dGVzPTQqKG4ubGVuZ3RoKzEpLHRoaXMuX3Byb2Nlc3MoKSx0PXRoaXMuX2hhc2gsbj10LndvcmRzLHI9MDs0PnI7cisrKWk9bltyXSxuW3JdPTE2NzExOTM1JihpPDw4fGk+Pj4yNCl8NDI3ODI1NTM2MCYoaTw8MjR8aT4+PjgpO3JldHVybiB0fSxjbG9uZTpmdW5jdGlvbigpe3ZhciBlPWMuY2xvbmUuY2FsbCh0aGlzKTtyZXR1cm4gZS5faGFzaD10aGlzLl9oYXNoLmNsb25lKCksZX19KSxvLk1ENT1jLl9jcmVhdGVIZWxwZXIoYSksby5IbWFjTUQ1PWMuX2NyZWF0ZUhtYWNIZWxwZXIoYSl9KE1hdGgpLGZ1bmN0aW9uKCl7dmFyIGU9bix0PWUubGliLHI9dC5CYXNlLGk9dC5Xb3JkQXJyYXksdD1lLmFsZ28scz10LkV2cEtERj1yLmV4dGVuZCh7Y2ZnOnIuZXh0ZW5kKHtrZXlTaXplOjQsaGFzaGVyOnQuTUQ1LGl0ZXJhdGlvbnM6MX0pLGluaXQ6ZnVuY3Rpb24oZSl7dGhpcy5jZmc9dGhpcy5jZmcuZXh0ZW5kKGUpfSxjb21wdXRlOmZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPXRoaXMuY2ZnLHI9bi5oYXNoZXIuY3JlYXRlKCkscz1pLmNyZWF0ZSgpLG89cy53b3JkcyxhPW4ua2V5U2l6ZSxuPW4uaXRlcmF0aW9ucztvLmxlbmd0aDxhOyl7dSYmci51cGRhdGUodSk7dmFyIHU9ci51cGRhdGUoZSkuZmluYWxpemUodCk7ci5yZXNldCgpO2Zvcih2YXIgYz0xO2M8bjtjKyspdT1yLmZpbmFsaXplKHUpLHIucmVzZXQoKTtzLmNvbmNhdCh1KX1yZXR1cm4gcy5zaWdCeXRlcz00KmEsc319KTtlLkV2cEtERj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIHMuY3JlYXRlKG4pLmNvbXB1dGUoZSx0KX19KCksbi5saWIuQ2lwaGVyfHxmdW5jdGlvbihlKXt2YXIgdD1uLHI9dC5saWIsaT1yLkJhc2Uscz1yLldvcmRBcnJheSxvPXIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobSxhPXQuZW5jLkJhc2U2NCx1PXQuYWxnby5FdnBLREYsYz1yLkNpcGhlcj1vLmV4dGVuZCh7Y2ZnOmkuZXh0ZW5kKCksY3JlYXRlRW5jcnlwdG9yOmZ1bmN0aW9uKGUsdCl7cmV0dXJuIHRoaXMuY3JlYXRlKHRoaXMuX0VOQ19YRk9STV9NT0RFLGUsdCl9LGNyZWF0ZURlY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLmNyZWF0ZSh0aGlzLl9ERUNfWEZPUk1fTU9ERSxlLHQpfSxpbml0OmZ1bmN0aW9uKGUsdCxuKXt0aGlzLmNmZz10aGlzLmNmZy5leHRlbmQobiksdGhpcy5feGZvcm1Nb2RlPWUsdGhpcy5fa2V5PXQsdGhpcy5yZXNldCgpfSxyZXNldDpmdW5jdGlvbigpe28ucmVzZXQuY2FsbCh0aGlzKSx0aGlzLl9kb1Jlc2V0KCl9LHByb2Nlc3M6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX2FwcGVuZChlKSx0aGlzLl9wcm9jZXNzKCl9LGZpbmFsaXplOmZ1bmN0aW9uKGUpe3JldHVybiBlJiZ0aGlzLl9hcHBlbmQoZSksdGhpcy5fZG9GaW5hbGl6ZSgpfSxrZXlTaXplOjQsaXZTaXplOjQsX0VOQ19YRk9STV9NT0RFOjEsX0RFQ19YRk9STV9NT0RFOjIsX2NyZWF0ZUhlbHBlcjpmdW5jdGlvbihlKXtyZXR1cm57ZW5jcnlwdDpmdW5jdGlvbih0LG4scil7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiBuP2c6cCkuZW5jcnlwdChlLHQsbixyKX0sZGVjcnlwdDpmdW5jdGlvbih0LG4scil7cmV0dXJuKFwic3RyaW5nXCI9PXR5cGVvZiBuP2c6cCkuZGVjcnlwdChlLHQsbixyKX19fX0pO3IuU3RyZWFtQ2lwaGVyPWMuZXh0ZW5kKHtfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wcm9jZXNzKCEwKX0sYmxvY2tTaXplOjF9KTt2YXIgbD10Lm1vZGU9e30saD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dGhpcy5faXY7cj90aGlzLl9pdj12b2lkIDA6cj10aGlzLl9wcmV2QmxvY2s7Zm9yKHZhciBpPTA7aTxuO2krKyllW3QraV1ePXJbaV19LGY9KHIuQmxvY2tDaXBoZXJNb2RlPWkuZXh0ZW5kKHtjcmVhdGVFbmNyeXB0b3I6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5FbmNyeXB0b3IuY3JlYXRlKGUsdCl9LGNyZWF0ZURlY3J5cHRvcjpmdW5jdGlvbihlLHQpe3JldHVybiB0aGlzLkRlY3J5cHRvci5jcmVhdGUoZSx0KX0saW5pdDpmdW5jdGlvbihlLHQpe3RoaXMuX2NpcGhlcj1lLHRoaXMuX2l2PXR9fSkpLmV4dGVuZCgpO2YuRW5jcnlwdG9yPWYuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jaXBoZXIscj1uLmJsb2NrU2l6ZTtoLmNhbGwodGhpcyxlLHQsciksbi5lbmNyeXB0QmxvY2soZSx0KSx0aGlzLl9wcmV2QmxvY2s9ZS5zbGljZSh0LHQrcil9fSksZi5EZWNyeXB0b3I9Zi5leHRlbmQoe3Byb2Nlc3NCbG9jazpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMuX2NpcGhlcixyPW4uYmxvY2tTaXplLGk9ZS5zbGljZSh0LHQrcik7bi5kZWNyeXB0QmxvY2soZSx0KSxoLmNhbGwodGhpcyxlLHQsciksdGhpcy5fcHJldkJsb2NrPWl9fSksbD1sLkNCQz1mLGY9KHQucGFkPXt9KS5Qa2NzNz17cGFkOmZ1bmN0aW9uKGUsdCl7Zm9yKHZhciBuPTQqdCxuPW4tZS5zaWdCeXRlcyVuLHI9bjw8MjR8bjw8MTZ8bjw8OHxuLGk9W10sbz0wO288bjtvKz00KWkucHVzaChyKTtuPXMuY3JlYXRlKGksbiksZS5jb25jYXQobil9LHVucGFkOmZ1bmN0aW9uKGUpe2Uuc2lnQnl0ZXMtPTI1NSZlLndvcmRzW2Uuc2lnQnl0ZXMtMT4+PjJdfX0sci5CbG9ja0NpcGhlcj1jLmV4dGVuZCh7Y2ZnOmMuY2ZnLmV4dGVuZCh7bW9kZTpsLHBhZGRpbmc6Zn0pLHJlc2V0OmZ1bmN0aW9uKCl7Yy5yZXNldC5jYWxsKHRoaXMpO3ZhciBlPXRoaXMuY2ZnLHQ9ZS5pdixlPWUubW9kZTtpZih0aGlzLl94Zm9ybU1vZGU9PXRoaXMuX0VOQ19YRk9STV9NT0RFKXZhciBuPWUuY3JlYXRlRW5jcnlwdG9yO2Vsc2Ugbj1lLmNyZWF0ZURlY3J5cHRvcix0aGlzLl9taW5CdWZmZXJTaXplPTE7dGhpcy5fbW9kZT1uLmNhbGwoZSx0aGlzLHQmJnQud29yZHMpfSxfZG9Qcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9tb2RlLnByb2Nlc3NCbG9jayhlLHQpfSxfZG9GaW5hbGl6ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXMuY2ZnLnBhZGRpbmc7aWYodGhpcy5feGZvcm1Nb2RlPT10aGlzLl9FTkNfWEZPUk1fTU9ERSl7ZS5wYWQodGhpcy5fZGF0YSx0aGlzLmJsb2NrU2l6ZSk7dmFyIHQ9dGhpcy5fcHJvY2VzcyghMCl9ZWxzZSB0PXRoaXMuX3Byb2Nlc3MoITApLGUudW5wYWQodCk7cmV0dXJuIHR9LGJsb2NrU2l6ZTo0fSk7dmFyIGQ9ci5DaXBoZXJQYXJhbXM9aS5leHRlbmQoe2luaXQ6ZnVuY3Rpb24oZSl7dGhpcy5taXhJbihlKX0sdG9TdHJpbmc6ZnVuY3Rpb24oZSl7cmV0dXJuKGV8fHRoaXMuZm9ybWF0dGVyKS5zdHJpbmdpZnkodGhpcyl9fSksbD0odC5mb3JtYXQ9e30pLk9wZW5TU0w9e3N0cmluZ2lmeTpmdW5jdGlvbihlKXt2YXIgdD1lLmNpcGhlcnRleHQ7cmV0dXJuIGU9ZS5zYWx0LChlP3MuY3JlYXRlKFsxMzk4ODkzNjg0LDE3MDEwNzY4MzFdKS5jb25jYXQoZSkuY29uY2F0KHQpOnQpLnRvU3RyaW5nKGEpfSxwYXJzZTpmdW5jdGlvbihlKXtlPWEucGFyc2UoZSk7dmFyIHQ9ZS53b3JkcztpZigxMzk4ODkzNjg0PT10WzBdJiYxNzAxMDc2ODMxPT10WzFdKXt2YXIgbj1zLmNyZWF0ZSh0LnNsaWNlKDIsNCkpO3Quc3BsaWNlKDAsNCksZS5zaWdCeXRlcy09MTZ9cmV0dXJuIGQuY3JlYXRlKHtjaXBoZXJ0ZXh0OmUsc2FsdDpufSl9fSxwPXIuU2VyaWFsaXphYmxlQ2lwaGVyPWkuZXh0ZW5kKHtjZmc6aS5leHRlbmQoe2Zvcm1hdDpsfSksZW5jcnlwdDpmdW5jdGlvbihlLHQsbixyKXtyPXRoaXMuY2ZnLmV4dGVuZChyKTt2YXIgaT1lLmNyZWF0ZUVuY3J5cHRvcihuLHIpO3JldHVybiB0PWkuZmluYWxpemUodCksaT1pLmNmZyxkLmNyZWF0ZSh7Y2lwaGVydGV4dDp0LGtleTpuLGl2OmkuaXYsYWxnb3JpdGhtOmUsbW9kZTppLm1vZGUscGFkZGluZzppLnBhZGRpbmcsYmxvY2tTaXplOmUuYmxvY2tTaXplLGZvcm1hdHRlcjpyLmZvcm1hdH0pfSxkZWNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSx0PXRoaXMuX3BhcnNlKHQsci5mb3JtYXQpLGUuY3JlYXRlRGVjcnlwdG9yKG4scikuZmluYWxpemUodC5jaXBoZXJ0ZXh0KX0sX3BhcnNlOmZ1bmN0aW9uKGUsdCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/dC5wYXJzZShlLHRoaXMpOmV9fSksdD0odC5rZGY9e30pLk9wZW5TU0w9e2V4ZWN1dGU6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHJ8fChyPXMucmFuZG9tKDgpKSxlPXUuY3JlYXRlKHtrZXlTaXplOnQrbn0pLmNvbXB1dGUoZSxyKSxuPXMuY3JlYXRlKGUud29yZHMuc2xpY2UodCksNCpuKSxlLnNpZ0J5dGVzPTQqdCxkLmNyZWF0ZSh7a2V5OmUsaXY6bixzYWx0OnJ9KX19LGc9ci5QYXNzd29yZEJhc2VkQ2lwaGVyPXAuZXh0ZW5kKHtjZmc6cC5jZmcuZXh0ZW5kKHtrZGY6dH0pLGVuY3J5cHQ6ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIHI9dGhpcy5jZmcuZXh0ZW5kKHIpLG49ci5rZGYuZXhlY3V0ZShuLGUua2V5U2l6ZSxlLml2U2l6ZSksci5pdj1uLml2LGU9cC5lbmNyeXB0LmNhbGwodGhpcyxlLHQsbi5rZXksciksZS5taXhJbihuKSxlfSxkZWNyeXB0OmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiByPXRoaXMuY2ZnLmV4dGVuZChyKSx0PXRoaXMuX3BhcnNlKHQsci5mb3JtYXQpLG49ci5rZGYuZXhlY3V0ZShuLGUua2V5U2l6ZSxlLml2U2l6ZSx0LnNhbHQpLHIuaXY9bi5pdixwLmRlY3J5cHQuY2FsbCh0aGlzLGUsdCxuLmtleSxyKX19KX0oKSxmdW5jdGlvbigpe2Zvcih2YXIgZT1uLHQ9ZS5saWIuQmxvY2tDaXBoZXIscj1lLmFsZ28saT1bXSxzPVtdLG89W10sYT1bXSx1PVtdLGM9W10sbD1bXSxoPVtdLGY9W10sZD1bXSxwPVtdLGc9MDsyNTY+ZztnKyspcFtnXT0xMjg+Zz9nPDwxOmc8PDFeMjgzO2Zvcih2YXIgeT0wLHY9MCxnPTA7MjU2Pmc7ZysrKXt2YXIgYj12XnY8PDFedjw8Ml52PDwzXnY8PDQsYj1iPj4+OF4yNTUmYl45OTtpW3ldPWIsc1tiXT15O3ZhciBfPXBbeV0sbT1wW19dLGs9cFttXSxQPTI1NypwW2JdXjE2ODQzMDA4KmI7b1t5XT1QPDwyNHxQPj4+OCxhW3ldPVA8PDE2fFA+Pj4xNix1W3ldPVA8PDh8UD4+PjI0LGNbeV09UCxQPTE2ODQzMDA5KmteNjU1MzcqbV4yNTcqX14xNjg0MzAwOCp5LGxbYl09UDw8MjR8UD4+PjgsaFtiXT1QPDwxNnxQPj4+MTYsZltiXT1QPDw4fFA+Pj4yNCxkW2JdPVAseT8oeT1fXnBbcFtwW2teX11dXSx2Xj1wW3Bbdl1dKTp5PXY9MX12YXIgUz1bMCwxLDIsNCw4LDE2LDMyLDY0LDEyOCwyNyw1NF0scj1yLkFFUz10LmV4dGVuZCh7X2RvUmVzZXQ6ZnVuY3Rpb24oKXtmb3IodmFyIGU9dGhpcy5fa2V5LHQ9ZS53b3JkcyxuPWUuc2lnQnl0ZXMvNCxlPTQqKCh0aGlzLl9uUm91bmRzPW4rNikrMSkscj10aGlzLl9rZXlTY2hlZHVsZT1bXSxzPTA7czxlO3MrKylpZihzPG4pcltzXT10W3NdO2Vsc2V7dmFyIG89cltzLTFdO3Mlbj82PG4mJjQ9PXMlbiYmKG89aVtvPj4+MjRdPDwyNHxpW28+Pj4xNiYyNTVdPDwxNnxpW28+Pj44JjI1NV08PDh8aVsyNTUmb10pOihvPW88PDh8bz4+PjI0LG89aVtvPj4+MjRdPDwyNHxpW28+Pj4xNiYyNTVdPDwxNnxpW28+Pj44JjI1NV08PDh8aVsyNTUmb10sb149U1tzL258MF08PDI0KSxyW3NdPXJbcy1uXV5vfWZvcih0PXRoaXMuX2ludktleVNjaGVkdWxlPVtdLG49MDtuPGU7bisrKXM9ZS1uLG89biU0P3Jbc106cltzLTRdLHRbbl09ND5ufHw0Pj1zP286bFtpW28+Pj4yNF1dXmhbaVtvPj4+MTYmMjU1XV1eZltpW28+Pj44JjI1NV1dXmRbaVsyNTUmb11dfSxlbmNyeXB0QmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9kb0NyeXB0QmxvY2soZSx0LHRoaXMuX2tleVNjaGVkdWxlLG8sYSx1LGMsaSl9LGRlY3J5cHRCbG9jazpmdW5jdGlvbihlLHQpe3ZhciBuPWVbdCsxXTtlW3QrMV09ZVt0KzNdLGVbdCszXT1uLHRoaXMuX2RvQ3J5cHRCbG9jayhlLHQsdGhpcy5faW52S2V5U2NoZWR1bGUsbCxoLGYsZCxzKSxuPWVbdCsxXSxlW3QrMV09ZVt0KzNdLGVbdCszXT1ufSxfZG9DcnlwdEJsb2NrOmZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8sYSl7Zm9yKHZhciB1PXRoaXMuX25Sb3VuZHMsYz1lW3RdXm5bMF0sbD1lW3QrMV1eblsxXSxoPWVbdCsyXV5uWzJdLGY9ZVt0KzNdXm5bM10sZD00LHA9MTtwPHU7cCsrKXZhciBnPXJbYz4+PjI0XV5pW2w+Pj4xNiYyNTVdXnNbaD4+PjgmMjU1XV5vWzI1NSZmXV5uW2QrK10seT1yW2w+Pj4yNF1eaVtoPj4+MTYmMjU1XV5zW2Y+Pj44JjI1NV1eb1syNTUmY11ebltkKytdLHY9cltoPj4+MjRdXmlbZj4+PjE2JjI1NV1ec1tjPj4+OCYyNTVdXm9bMjU1JmxdXm5bZCsrXSxmPXJbZj4+PjI0XV5pW2M+Pj4xNiYyNTVdXnNbbD4+PjgmMjU1XV5vWzI1NSZoXV5uW2QrK10sYz1nLGw9eSxoPXY7Zz0oYVtjPj4+MjRdPDwyNHxhW2w+Pj4xNiYyNTVdPDwxNnxhW2g+Pj44JjI1NV08PDh8YVsyNTUmZl0pXm5bZCsrXSx5PShhW2w+Pj4yNF08PDI0fGFbaD4+PjE2JjI1NV08PDE2fGFbZj4+PjgmMjU1XTw8OHxhWzI1NSZjXSlebltkKytdLHY9KGFbaD4+PjI0XTw8MjR8YVtmPj4+MTYmMjU1XTw8MTZ8YVtjPj4+OCYyNTVdPDw4fGFbMjU1JmxdKV5uW2QrK10sZj0oYVtmPj4+MjRdPDwyNHxhW2M+Pj4xNiYyNTVdPDwxNnxhW2w+Pj44JjI1NV08PDh8YVsyNTUmaF0pXm5bZCsrXSxlW3RdPWcsZVt0KzFdPXksZVt0KzJdPXYsZVt0KzNdPWZ9LGtleVNpemU6OH0pO2UuQUVTPXQuX2NyZWF0ZUhlbHBlcihyKX0oKSxuLm1vZGUuRUNCPWZ1bmN0aW9uKCl7dmFyIGU9bi5saWIuQmxvY2tDaXBoZXJNb2RlLmV4dGVuZCgpO3JldHVybiBlLkVuY3J5cHRvcj1lLmV4dGVuZCh7cHJvY2Vzc0Jsb2NrOmZ1bmN0aW9uKGUsdCl7dGhpcy5fY2lwaGVyLmVuY3J5cHRCbG9jayhlLHQpfX0pLGUuRGVjcnlwdG9yPWUuZXh0ZW5kKHtwcm9jZXNzQmxvY2s6ZnVuY3Rpb24oZSx0KXt0aGlzLl9jaXBoZXIuZGVjcnlwdEJsb2NrKGUsdCl9fSksZX0oKSxlLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHQpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO3IuZW51bWVyYWJsZT1yLmVudW1lcmFibGV8fCExLHIuY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIHImJihyLndyaXRhYmxlPSEwKSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxyLmtleSxyKX19cmV0dXJuIGZ1bmN0aW9uKHQsbixyKXtyZXR1cm4gbiYmZSh0LnByb3RvdHlwZSxuKSxyJiZlKHQsciksdH19KCksbz1uKDkpLGE9KHIobyksbig3KSksdT0ocihhKSxuKDEyKSksYz0ocih1KSxuKDE0KSksbD1yKGMpLGg9bigxNyksZj1yKGgpLGQ9KG4oOCksbigxMykpLHA9cihkKSxnPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0KXt2YXIgbj10LnN1YnNjcmliZUVuZHBvaW50LHI9dC5sZWF2ZUVuZHBvaW50LHM9dC5oZWFydGJlYXRFbmRwb2ludCxvPXQuc2V0U3RhdGVFbmRwb2ludCxhPXQudGltZUVuZHBvaW50LHU9dC5jb25maWcsYz10LmNyeXB0byxoPXQubGlzdGVuZXJNYW5hZ2VyO2kodGhpcyxlKSx0aGlzLl9saXN0ZW5lck1hbmFnZXI9aCx0aGlzLl9jb25maWc9dSx0aGlzLl9sZWF2ZUVuZHBvaW50PXIsdGhpcy5faGVhcnRiZWF0RW5kcG9pbnQ9cyx0aGlzLl9zZXRTdGF0ZUVuZHBvaW50PW8sdGhpcy5fc3Vic2NyaWJlRW5kcG9pbnQ9bix0aGlzLl9jcnlwdG89Yyx0aGlzLl9jaGFubmVscz17fSx0aGlzLl9wcmVzZW5jZUNoYW5uZWxzPXt9LHRoaXMuX2NoYW5uZWxHcm91cHM9e30sdGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzPXt9LHRoaXMuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucz1bXSx0aGlzLl9jdXJyZW50VGltZXRva2VuPTAsdGhpcy5fbGFzdFRpbWV0b2tlbj0wLHRoaXMuX3N0b3JlZFRpbWV0b2tlbj1udWxsLHRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZD0hMSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyPW5ldyBsLmRlZmF1bHQoe3RpbWVFbmRwb2ludDphfSl9cmV0dXJuIHMoZSxbe2tleTpcImFkYXB0U3RhdGVDaGFuZ2VcIix2YWx1ZTpmdW5jdGlvbihlLHQpe3ZhciBuPXRoaXMscj1lLnN0YXRlLGk9ZS5jaGFubmVscyxzPXZvaWQgMD09PWk/W106aSxvPWUuY2hhbm5lbEdyb3VwcyxhPXZvaWQgMD09PW8/W106bztyZXR1cm4gcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UgaW4gbi5fY2hhbm5lbHMmJihuLl9jaGFubmVsc1tlXS5zdGF0ZT1yKX0pLGEuZm9yRWFjaChmdW5jdGlvbihlKXtlIGluIG4uX2NoYW5uZWxHcm91cHMmJihuLl9jaGFubmVsR3JvdXBzW2VdLnN0YXRlPXIpfSksdGhpcy5fc2V0U3RhdGVFbmRwb2ludCh7c3RhdGU6cixjaGFubmVsczpzLGNoYW5uZWxHcm91cHM6YX0sdCl9fSx7a2V5OlwiYWRhcHRTdWJzY3JpYmVDaGFuZ2VcIix2YWx1ZTpmdW5jdGlvbihlKXt2YXIgdD10aGlzLG49ZS50aW1ldG9rZW4scj1lLmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9ZS5jaGFubmVsR3JvdXBzLG89dm9pZCAwPT09cz9bXTpzLGE9ZS53aXRoUHJlc2VuY2UsdT12b2lkIDAhPT1hJiZhO2lmKCF0aGlzLl9jb25maWcuc3Vic2NyaWJlS2V5fHxcIlwiPT09dGhpcy5fY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm4gdm9pZChjb25zb2xlJiZjb25zb2xlLmxvZyYmY29uc29sZS5sb2coXCJzdWJzY3JpYmUga2V5IG1pc3Npbmc7IGFib3J0aW5nIHN1YnNjcmliZVwiKSk7biYmKHRoaXMuX2xhc3RUaW1ldG9rZW49dGhpcy5fY3VycmVudFRpbWV0b2tlbix0aGlzLl9jdXJyZW50VGltZXRva2VuPW4pLFwiMFwiIT09dGhpcy5fY3VycmVudFRpbWV0b2tlbiYmKHRoaXMuX3N0b3JlZFRpbWV0b2tlbj10aGlzLl9jdXJyZW50VGltZXRva2VuLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49MCksaS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuX2NoYW5uZWxzW2VdPXtzdGF0ZTp7fX0sdSYmKHQuX3ByZXNlbmNlQ2hhbm5lbHNbZV09e30pLHQuX3BlbmRpbmdDaGFubmVsU3Vic2NyaXB0aW9ucy5wdXNoKGUpfSksby5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuX2NoYW5uZWxHcm91cHNbZV09e3N0YXRlOnt9fSx1JiYodC5fcHJlc2VuY2VDaGFubmVsR3JvdXBzW2VdPXt9KSx0Ll9wZW5kaW5nQ2hhbm5lbEdyb3VwU3Vic2NyaXB0aW9ucy5wdXNoKGUpfSksdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSExLHRoaXMucmVjb25uZWN0KCl9fSx7a2V5OlwiYWRhcHRVbnN1YnNjcmliZUNoYW5nZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7XG52YXIgbj10aGlzLHI9ZS5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPWUuY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PXM/W106cztpLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVscyYmZGVsZXRlIG4uX2NoYW5uZWxzW2VdLGUgaW4gbi5fcHJlc2VuY2VDaGFubmVscyYmZGVsZXRlIG4uX3ByZXNlbmNlQ2hhbm5lbHNbZV19KSxvLmZvckVhY2goZnVuY3Rpb24oZSl7ZSBpbiBuLl9jaGFubmVsR3JvdXBzJiZkZWxldGUgbi5fY2hhbm5lbEdyb3Vwc1tlXSxlIGluIG4uX3ByZXNlbmNlQ2hhbm5lbEdyb3VwcyYmZGVsZXRlIG4uX2NoYW5uZWxHcm91cHNbZV19KSwhMSE9PXRoaXMuX2NvbmZpZy5zdXBwcmVzc0xlYXZlRXZlbnRzfHx0fHx0aGlzLl9sZWF2ZUVuZHBvaW50KHtjaGFubmVsczppLGNoYW5uZWxHcm91cHM6b30sZnVuY3Rpb24oZSl7ZS5hZmZlY3RlZENoYW5uZWxzPWksZS5hZmZlY3RlZENoYW5uZWxHcm91cHM9byxlLmN1cnJlbnRUaW1ldG9rZW49bi5fY3VycmVudFRpbWV0b2tlbixlLmxhc3RUaW1ldG9rZW49bi5fbGFzdFRpbWV0b2tlbixuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSl9KSwwPT09T2JqZWN0LmtleXModGhpcy5fY2hhbm5lbHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLmxlbmd0aCYmMD09PU9iamVjdC5rZXlzKHRoaXMuX3ByZXNlbmNlQ2hhbm5lbEdyb3VwcykubGVuZ3RoJiYodGhpcy5fbGFzdFRpbWV0b2tlbj0wLHRoaXMuX2N1cnJlbnRUaW1ldG9rZW49MCx0aGlzLl9zdG9yZWRUaW1ldG9rZW49bnVsbCx0aGlzLl9yZWdpb249bnVsbCx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLnN0b3BQb2xsaW5nKCkpLHRoaXMucmVjb25uZWN0KCl9fSx7a2V5OlwidW5zdWJzY3JpYmVBbGxcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLmFkYXB0VW5zdWJzY3JpYmVDaGFuZ2Uoe2NoYW5uZWxzOnRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxzKCksY2hhbm5lbEdyb3Vwczp0aGlzLmdldFN1YnNjcmliZWRDaGFubmVsR3JvdXBzKCl9LGUpfX0se2tleTpcImdldFN1YnNjcmliZWRDaGFubmVsc1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKX19LHtrZXk6XCJnZXRTdWJzY3JpYmVkQ2hhbm5lbEdyb3Vwc1wiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpfX0se2tleTpcInJlY29ubmVjdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCksdGhpcy5fcmVnaXN0ZXJIZWFydGJlYXRUaW1lcigpfX0se2tleTpcImRpc2Nvbm5lY3RcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BTdWJzY3JpYmVMb29wKCksdGhpcy5fc3RvcEhlYXJ0YmVhdFRpbWVyKCksdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5zdG9wUG9sbGluZygpfX0se2tleTpcIl9yZWdpc3RlckhlYXJ0YmVhdFRpbWVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9zdG9wSGVhcnRiZWF0VGltZXIoKSx0aGlzLl9wZXJmb3JtSGVhcnRiZWF0TG9vcCgpLHRoaXMuX2hlYXJ0YmVhdFRpbWVyPXNldEludGVydmFsKHRoaXMuX3BlcmZvcm1IZWFydGJlYXRMb29wLmJpbmQodGhpcyksMWUzKnRoaXMuX2NvbmZpZy5nZXRIZWFydGJlYXRJbnRlcnZhbCgpKX19LHtrZXk6XCJfc3RvcEhlYXJ0YmVhdFRpbWVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9oZWFydGJlYXRUaW1lciYmKGNsZWFySW50ZXJ2YWwodGhpcy5faGVhcnRiZWF0VGltZXIpLHRoaXMuX2hlYXJ0YmVhdFRpbWVyPW51bGwpfX0se2tleTpcIl9wZXJmb3JtSGVhcnRiZWF0TG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcyx0PU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxzKSxuPU9iamVjdC5rZXlzKHRoaXMuX2NoYW5uZWxHcm91cHMpLHI9e307aWYoMCE9PXQubGVuZ3RofHwwIT09bi5sZW5ndGgpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgbj1lLl9jaGFubmVsc1t0XS5zdGF0ZTtPYmplY3Qua2V5cyhuKS5sZW5ndGgmJihyW3RdPW4pfSksbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBuPWUuX2NoYW5uZWxHcm91cHNbdF0uc3RhdGU7T2JqZWN0LmtleXMobikubGVuZ3RoJiYoclt0XT1uKX0pO3ZhciBpPWZ1bmN0aW9uKHQpe3QuZXJyb3ImJmUuX2NvbmZpZy5hbm5vdW5jZUZhaWxlZEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KSwhdC5lcnJvciYmZS5fY29uZmlnLmFubm91bmNlU3VjY2Vzc2Z1bEhlYXJ0YmVhdHMmJmUuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyh0KX07dGhpcy5faGVhcnRiZWF0RW5kcG9pbnQoe2NoYW5uZWxzOnQsY2hhbm5lbEdyb3VwczpuLHN0YXRlOnJ9LGkuYmluZCh0aGlzKSl9fX0se2tleTpcIl9zdGFydFN1YnNjcmliZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N0b3BTdWJzY3JpYmVMb29wKCk7dmFyIGU9W10sdD1bXTtpZihPYmplY3Qua2V5cyh0aGlzLl9jaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVscykuZm9yRWFjaChmdW5jdGlvbih0KXtyZXR1cm4gZS5wdXNoKHQrXCItcG5wcmVzXCIpfSksT2JqZWN0LmtleXModGhpcy5fY2hhbm5lbEdyb3VwcykuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUpfSksT2JqZWN0LmtleXModGhpcy5fcHJlc2VuY2VDaGFubmVsR3JvdXBzKS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3JldHVybiB0LnB1c2goZStcIi1wbnByZXNcIil9KSwwIT09ZS5sZW5ndGh8fDAhPT10Lmxlbmd0aCl7dmFyIG49e2NoYW5uZWxzOmUsY2hhbm5lbEdyb3Vwczp0LHRpbWV0b2tlbjp0aGlzLl9jdXJyZW50VGltZXRva2VuLGZpbHRlckV4cHJlc3Npb246dGhpcy5fY29uZmlnLmZpbHRlckV4cHJlc3Npb24scmVnaW9uOnRoaXMuX3JlZ2lvbn07dGhpcy5fc3Vic2NyaWJlQ2FsbD10aGlzLl9zdWJzY3JpYmVFbmRwb2ludChuLHRoaXMuX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZS5iaW5kKHRoaXMpKX19fSx7a2V5OlwiX3Byb2Nlc3NTdWJzY3JpYmVSZXNwb25zZVwiLHZhbHVlOmZ1bmN0aW9uKGUsdCl7dmFyIG49dGhpcztpZihlLmVycm9yKXJldHVybiB2b2lkKGUuY2F0ZWdvcnk9PT1wLmRlZmF1bHQuUE5UaW1lb3V0Q2F0ZWdvcnk/dGhpcy5fc3RhcnRTdWJzY3JpYmVMb29wKCk6ZS5jYXRlZ29yeT09PXAuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeT8odGhpcy5kaXNjb25uZWN0KCksdGhpcy5fcmVjb25uZWN0aW9uTWFuYWdlci5vblJlY29ubmVjdGlvbihmdW5jdGlvbigpe24ucmVjb25uZWN0KCksbi5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSEwO3ZhciB0PXtjYXRlZ29yeTpwLmRlZmF1bHQuUE5SZWNvbm5lY3RlZENhdGVnb3J5LG9wZXJhdGlvbjplLm9wZXJhdGlvbixsYXN0VGltZXRva2VuOm4uX2xhc3RUaW1ldG9rZW4sY3VycmVudFRpbWV0b2tlbjpuLl9jdXJyZW50VGltZXRva2VufTtuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXModCl9KSx0aGlzLl9yZWNvbm5lY3Rpb25NYW5hZ2VyLnN0YXJ0UG9sbGluZygpLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhlKSk6ZS5jYXRlZ29yeT09PXAuZGVmYXVsdC5QTkJhZFJlcXVlc3RDYXRlZ29yeT8odGhpcy5fc3RvcEhlYXJ0YmVhdFRpbWVyKCksdGhpcy5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlU3RhdHVzKGUpKTp0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMoZSkpO2lmKHRoaXMuX3N0b3JlZFRpbWV0b2tlbj8odGhpcy5fY3VycmVudFRpbWV0b2tlbj10aGlzLl9zdG9yZWRUaW1ldG9rZW4sdGhpcy5fc3RvcmVkVGltZXRva2VuPW51bGwpOih0aGlzLl9sYXN0VGltZXRva2VuPXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sdGhpcy5fY3VycmVudFRpbWV0b2tlbj10Lm1ldGFkYXRhLnRpbWV0b2tlbiksIXRoaXMuX3N1YnNjcmlwdGlvblN0YXR1c0Fubm91bmNlZCl7dmFyIHI9e307ci5jYXRlZ29yeT1wLmRlZmF1bHQuUE5Db25uZWN0ZWRDYXRlZ29yeSxyLm9wZXJhdGlvbj1lLm9wZXJhdGlvbixyLmFmZmVjdGVkQ2hhbm5lbHM9dGhpcy5fcGVuZGluZ0NoYW5uZWxTdWJzY3JpcHRpb25zLHIuc3Vic2NyaWJlZENoYW5uZWxzPXRoaXMuZ2V0U3Vic2NyaWJlZENoYW5uZWxzKCksci5hZmZlY3RlZENoYW5uZWxHcm91cHM9dGhpcy5fcGVuZGluZ0NoYW5uZWxHcm91cFN1YnNjcmlwdGlvbnMsci5sYXN0VGltZXRva2VuPXRoaXMuX2xhc3RUaW1ldG9rZW4sci5jdXJyZW50VGltZXRva2VuPXRoaXMuX2N1cnJlbnRUaW1ldG9rZW4sdGhpcy5fc3Vic2NyaXB0aW9uU3RhdHVzQW5ub3VuY2VkPSEwLHRoaXMuX2xpc3RlbmVyTWFuYWdlci5hbm5vdW5jZVN0YXR1cyhyKSx0aGlzLl9wZW5kaW5nQ2hhbm5lbFN1YnNjcmlwdGlvbnM9W10sdGhpcy5fcGVuZGluZ0NoYW5uZWxHcm91cFN1YnNjcmlwdGlvbnM9W119dmFyIGk9dC5tZXNzYWdlc3x8W10scz10aGlzLl9jb25maWcucmVxdWVzdE1lc3NhZ2VDb3VudFRocmVzaG9sZDtpZihzJiZpLmxlbmd0aD49cyl7dmFyIG89e307by5jYXRlZ29yeT1wLmRlZmF1bHQuUE5SZXF1ZXN0TWVzc2FnZUNvdW50RXhjZWVkZWRDYXRlZ29yeSxvLm9wZXJhdGlvbj1lLm9wZXJhdGlvbix0aGlzLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VTdGF0dXMobyl9aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciB0PWUuY2hhbm5lbCxyPWUuc3Vic2NyaXB0aW9uTWF0Y2gsaT1lLnB1Ymxpc2hNZXRhRGF0YTtpZih0PT09ciYmKHI9bnVsbCksZi5kZWZhdWx0LmVuZHNXaXRoKGUuY2hhbm5lbCxcIi1wbnByZXNcIikpe3ZhciBzPXt9O3MuY2hhbm5lbD1udWxsLHMuc3Vic2NyaXB0aW9uPW51bGwscy5hY3R1YWxDaGFubmVsPW51bGwhPXI/dDpudWxsLHMuc3Vic2NyaWJlZENoYW5uZWw9bnVsbCE9cj9yOnQsdCYmKHMuY2hhbm5lbD10LnN1YnN0cmluZygwLHQubGFzdEluZGV4T2YoXCItcG5wcmVzXCIpKSksciYmKHMuc3Vic2NyaXB0aW9uPXIuc3Vic3RyaW5nKDAsci5sYXN0SW5kZXhPZihcIi1wbnByZXNcIikpKSxzLmFjdGlvbj1lLnBheWxvYWQuYWN0aW9uLHMuc3RhdGU9ZS5wYXlsb2FkLmRhdGEscy50aW1ldG9rZW49aS5wdWJsaXNoVGltZXRva2VuLHMub2NjdXBhbmN5PWUucGF5bG9hZC5vY2N1cGFuY3kscy51dWlkPWUucGF5bG9hZC51dWlkLHMudGltZXN0YW1wPWUucGF5bG9hZC50aW1lc3RhbXAsZS5wYXlsb2FkLmpvaW4mJihzLmpvaW49ZS5wYXlsb2FkLmpvaW4pLGUucGF5bG9hZC5sZWF2ZSYmKHMubGVhdmU9ZS5wYXlsb2FkLmxlYXZlKSxlLnBheWxvYWQudGltZW91dCYmKHMudGltZW91dD1lLnBheWxvYWQudGltZW91dCksbi5fbGlzdGVuZXJNYW5hZ2VyLmFubm91bmNlUHJlc2VuY2Uocyl9ZWxzZXt2YXIgbz17fTtvLmNoYW5uZWw9bnVsbCxvLnN1YnNjcmlwdGlvbj1udWxsLG8uYWN0dWFsQ2hhbm5lbD1udWxsIT1yP3Q6bnVsbCxvLnN1YnNjcmliZWRDaGFubmVsPW51bGwhPXI/cjp0LG8uY2hhbm5lbD10LG8uc3Vic2NyaXB0aW9uPXIsby50aW1ldG9rZW49aS5wdWJsaXNoVGltZXRva2VuLG8ucHVibGlzaGVyPWUuaXNzdWluZ0NsaWVudElkLGUudXNlck1ldGFkYXRhJiYoby51c2VyTWV0YWRhdGE9ZS51c2VyTWV0YWRhdGEpLG4uX2NvbmZpZy5jaXBoZXJLZXk/by5tZXNzYWdlPW4uX2NyeXB0by5kZWNyeXB0KGUucGF5bG9hZCk6by5tZXNzYWdlPWUucGF5bG9hZCxuLl9saXN0ZW5lck1hbmFnZXIuYW5ub3VuY2VNZXNzYWdlKG8pfX0pLHRoaXMuX3JlZ2lvbj10Lm1ldGFkYXRhLnJlZ2lvbix0aGlzLl9zdGFydFN1YnNjcmliZUxvb3AoKX19LHtrZXk6XCJfc3RvcFN1YnNjcmliZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3N1YnNjcmliZUNhbGwmJih0aGlzLl9zdWJzY3JpYmVDYWxsLmFib3J0KCksdGhpcy5fc3Vic2NyaWJlQ2FsbD1udWxsKX19XSksZX0oKTt0LmRlZmF1bHQ9ZyxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPShuKDgpLG4oMTMpKSxvPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0ocyksYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXtyKHRoaXMsZSksdGhpcy5fbGlzdGVuZXJzPVtdfXJldHVybiBpKGUsW3trZXk6XCJhZGRMaXN0ZW5lclwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX2xpc3RlbmVycy5wdXNoKGUpfX0se2tleTpcInJlbW92ZUxpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24oZSl7dmFyIHQ9W107dGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obil7biE9PWUmJnQucHVzaChuKX0pLHRoaXMuX2xpc3RlbmVycz10fX0se2tleTpcInJlbW92ZUFsbExpc3RlbmVyc1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fbGlzdGVuZXJzPVtdfX0se2tleTpcImFubm91bmNlUHJlc2VuY2VcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0LnByZXNlbmNlJiZ0LnByZXNlbmNlKGUpfSl9fSx7a2V5OlwiYW5ub3VuY2VTdGF0dXNcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0LnN0YXR1cyYmdC5zdGF0dXMoZSl9KX19LHtrZXk6XCJhbm5vdW5jZU1lc3NhZ2VcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbih0KXt0Lm1lc3NhZ2UmJnQubWVzc2FnZShlKX0pfX0se2tleTpcImFubm91bmNlTmV0d29ya1VwXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT17fTtlLmNhdGVnb3J5PW8uZGVmYXVsdC5QTk5ldHdvcmtVcENhdGVnb3J5LHRoaXMuYW5ub3VuY2VTdGF0dXMoZSl9fSx7a2V5OlwiYW5ub3VuY2VOZXR3b3JrRG93blwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9e307ZS5jYXRlZ29yeT1vLmRlZmF1bHQuUE5OZXR3b3JrRG93bkNhdGVnb3J5LHRoaXMuYW5ub3VuY2VTdGF0dXMoZSl9fV0pLGV9KCk7dC5kZWZhdWx0PWEsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9e1BOTmV0d29ya1VwQ2F0ZWdvcnk6XCJQTk5ldHdvcmtVcENhdGVnb3J5XCIsUE5OZXR3b3JrRG93bkNhdGVnb3J5OlwiUE5OZXR3b3JrRG93bkNhdGVnb3J5XCIsUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk6XCJQTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeVwiLFBOVGltZW91dENhdGVnb3J5OlwiUE5UaW1lb3V0Q2F0ZWdvcnlcIixQTkJhZFJlcXVlc3RDYXRlZ29yeTpcIlBOQmFkUmVxdWVzdENhdGVnb3J5XCIsUE5BY2Nlc3NEZW5pZWRDYXRlZ29yeTpcIlBOQWNjZXNzRGVuaWVkQ2F0ZWdvcnlcIixQTlVua25vd25DYXRlZ29yeTpcIlBOVW5rbm93bkNhdGVnb3J5XCIsUE5SZWNvbm5lY3RlZENhdGVnb3J5OlwiUE5SZWNvbm5lY3RlZENhdGVnb3J5XCIsUE5Db25uZWN0ZWRDYXRlZ29yeTpcIlBOQ29ubmVjdGVkQ2F0ZWdvcnlcIixQTlJlcXVlc3RNZXNzYWdlQ291bnRFeGNlZWRlZENhdGVnb3J5OlwiUE5SZXF1ZXN0TWVzc2FnZUNvdW50RXhjZWVkZWRDYXRlZ29yeVwifSxlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciByPXRbbl07ci5lbnVtZXJhYmxlPXIuZW51bWVyYWJsZXx8ITEsci5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gciYmKHIud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLHIua2V5LHIpfX1yZXR1cm4gZnVuY3Rpb24odCxuLHIpe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLHImJmUodCxyKSx0fX0oKSxzPW4oMTUpLG89KGZ1bmN0aW9uKGUpe2UmJmUuX19lc01vZHVsZX0ocyksbig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dC50aW1lRW5kcG9pbnQ7cih0aGlzLGUpLHRoaXMuX3RpbWVFbmRwb2ludD1ufXJldHVybiBpKGUsW3trZXk6XCJvblJlY29ubmVjdGlvblwiLHZhbHVlOmZ1bmN0aW9uKGUpe3RoaXMuX3JlY29ubmVjdGlvbkNhbGxiYWNrPWV9fSx7a2V5Olwic3RhcnRQb2xsaW5nXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl90aW1lVGltZXI9c2V0SW50ZXJ2YWwodGhpcy5fcGVyZm9ybVRpbWVMb29wLmJpbmQodGhpcyksM2UzKX19LHtrZXk6XCJzdG9wUG9sbGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7Y2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lVGltZXIpfX0se2tleTpcIl9wZXJmb3JtVGltZUxvb3BcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciBlPXRoaXM7dGhpcy5fdGltZUVuZHBvaW50KGZ1bmN0aW9uKHQpe3QuZXJyb3J8fChjbGVhckludGVydmFsKGUuX3RpbWVUaW1lciksZS5fcmVjb25uZWN0aW9uQ2FsbGJhY2soKSl9KX19XSksZX0oKSk7dC5kZWZhdWx0PW8sZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOVGltZU9wZXJhdGlvbn1mdW5jdGlvbiBpKCl7cmV0dXJuXCIvdGltZS8wXCJ9ZnVuY3Rpb24gcyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gbygpe3JldHVybnt9fWZ1bmN0aW9uIGEoKXtyZXR1cm4hMX1mdW5jdGlvbiB1KGUsdCl7cmV0dXJue3RpbWV0b2tlbjp0WzBdfX1mdW5jdGlvbiBjKCl7fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC5nZXRVUkw9aSx0LmdldFJlcXVlc3RUaW1lb3V0PXMsdC5wcmVwYXJlUGFyYW1zPW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LmhhbmRsZVJlc3BvbnNlPXUsdC52YWxpZGF0ZVBhcmFtcz1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5kZWZhdWx0PXtQTlRpbWVPcGVyYXRpb246XCJQTlRpbWVPcGVyYXRpb25cIixQTkhpc3RvcnlPcGVyYXRpb246XCJQTkhpc3RvcnlPcGVyYXRpb25cIixQTkZldGNoTWVzc2FnZXNPcGVyYXRpb246XCJQTkZldGNoTWVzc2FnZXNPcGVyYXRpb25cIixQTlN1YnNjcmliZU9wZXJhdGlvbjpcIlBOU3Vic2NyaWJlT3BlcmF0aW9uXCIsUE5VbnN1YnNjcmliZU9wZXJhdGlvbjpcIlBOVW5zdWJzY3JpYmVPcGVyYXRpb25cIixQTlB1Ymxpc2hPcGVyYXRpb246XCJQTlB1Ymxpc2hPcGVyYXRpb25cIixQTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb246XCJQTlB1c2hOb3RpZmljYXRpb25FbmFibGVkQ2hhbm5lbHNPcGVyYXRpb25cIixQTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9uOlwiUE5SZW1vdmVBbGxQdXNoTm90aWZpY2F0aW9uc09wZXJhdGlvblwiLFBOV2hlcmVOb3dPcGVyYXRpb246XCJQTldoZXJlTm93T3BlcmF0aW9uXCIsUE5TZXRTdGF0ZU9wZXJhdGlvbjpcIlBOU2V0U3RhdGVPcGVyYXRpb25cIixQTkhlcmVOb3dPcGVyYXRpb246XCJQTkhlcmVOb3dPcGVyYXRpb25cIixQTkdldFN0YXRlT3BlcmF0aW9uOlwiUE5HZXRTdGF0ZU9wZXJhdGlvblwiLFBOSGVhcnRiZWF0T3BlcmF0aW9uOlwiUE5IZWFydGJlYXRPcGVyYXRpb25cIixQTkNoYW5uZWxHcm91cHNPcGVyYXRpb246XCJQTkNoYW5uZWxHcm91cHNPcGVyYXRpb25cIixQTlJlbW92ZUdyb3VwT3BlcmF0aW9uOlwiUE5SZW1vdmVHcm91cE9wZXJhdGlvblwiLFBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvbjpcIlBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvblwiLFBOQWRkQ2hhbm5lbHNUb0dyb3VwT3BlcmF0aW9uOlwiUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb25cIixQTlJlbW92ZUNoYW5uZWxzRnJvbUdyb3VwT3BlcmF0aW9uOlwiUE5SZW1vdmVDaGFubmVsc0Zyb21Hcm91cE9wZXJhdGlvblwiLFBOQWNjZXNzTWFuYWdlckdyYW50OlwiUE5BY2Nlc3NNYW5hZ2VyR3JhbnRcIixQTkFjY2Vzc01hbmFnZXJBdWRpdDpcIlBOQWNjZXNzTWFuYWdlckF1ZGl0XCJ9LGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlKXt2YXIgdD1bXTtyZXR1cm4gT2JqZWN0LmtleXMoZSkuZm9yRWFjaChmdW5jdGlvbihlKXtyZXR1cm4gdC5wdXNoKGUpfSksdH1mdW5jdGlvbiByKGUpe3JldHVybiBlbmNvZGVVUklDb21wb25lbnQoZSkucmVwbGFjZSgvWyF+KicoKV0vZyxmdW5jdGlvbihlKXtyZXR1cm5cIiVcIitlLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9KX1mdW5jdGlvbiBpKGUpe3JldHVybiBuKGUpLnNvcnQoKX1mdW5jdGlvbiBzKGUpe3JldHVybiBpKGUpLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdCtcIj1cIityKGVbdF0pfSkuam9pbihcIiZcIil9ZnVuY3Rpb24gbyhlLHQpe3JldHVybi0xIT09ZS5pbmRleE9mKHQsdGhpcy5sZW5ndGgtdC5sZW5ndGgpfWZ1bmN0aW9uIGEoKXt2YXIgZT12b2lkIDAsdD12b2lkIDA7cmV0dXJue3Byb21pc2U6bmV3IFByb21pc2UoZnVuY3Rpb24obixyKXtlPW4sdD1yfSkscmVqZWN0OnQsZnVsZmlsbDplfX1lLmV4cG9ydHM9e3NpZ25QYW1Gcm9tUGFyYW1zOnMsZW5kc1dpdGg6byxjcmVhdGVQcm9taXNlOmEsZW5jb2RlU3RyaW5nOnJ9fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe2lmKCEoZSBpbnN0YW5jZW9mIHQpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIil9ZnVuY3Rpb24gcyhlLHQpe2lmKCFlKXRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtyZXR1cm4hdHx8XCJvYmplY3RcIiE9dHlwZW9mIHQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIHQ/ZTp0fWZ1bmN0aW9uIG8oZSx0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZudWxsIT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIit0eXBlb2YgdCk7ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0JiZ0LnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmUsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksdCYmKE9iamVjdC5zZXRQcm90b3R5cGVPZj9PYmplY3Quc2V0UHJvdG90eXBlT2YoZSx0KTplLl9fcHJvdG9fXz10KX1mdW5jdGlvbiBhKGUsdCl7cmV0dXJuIGUudHlwZT10LGUuZXJyb3I9ITAsZX1mdW5jdGlvbiB1KGUpe3JldHVybiBhKHttZXNzYWdlOmV9LFwidmFsaWRhdGlvbkVycm9yXCIpfWZ1bmN0aW9uIGMoZSx0LG4pe3JldHVybiBlLnVzZVBvc3QmJmUudXNlUG9zdCh0LG4pP2UucG9zdFVSTCh0LG4pOmUuZ2V0VVJMKHQsbil9ZnVuY3Rpb24gbChlKXt2YXIgdD1cIlB1Yk51Yi1KUy1cIitlLnNka0ZhbWlseTtyZXR1cm4gZS5wYXJ0bmVySWQmJih0Kz1cIi1cIitlLnBhcnRuZXJJZCksdCs9XCIvXCIrZS5nZXRWZXJzaW9uKCl9ZnVuY3Rpb24gaChlLHQsbil7dmFyIHI9ZS5jb25maWcsaT1lLmNyeXB0bztuLnRpbWVzdGFtcD1NYXRoLmZsb29yKChuZXcgRGF0ZSkuZ2V0VGltZSgpLzFlMyk7dmFyIHM9ci5zdWJzY3JpYmVLZXkrXCJcXG5cIityLnB1Ymxpc2hLZXkrXCJcXG5cIit0K1wiXFxuXCI7cys9Zy5kZWZhdWx0LnNpZ25QYW1Gcm9tUGFyYW1zKG4pO3ZhciBvPWkuSE1BQ1NIQTI1NihzKTtvPW8ucmVwbGFjZSgvXFwrL2csXCItXCIpLG89by5yZXBsYWNlKC9cXC8vZyxcIl9cIiksbi5zaWduYXR1cmU9b31PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj1lLm5ldHdvcmtpbmcscj1lLmNvbmZpZyxpPW51bGwscz1udWxsLG89e307dC5nZXRPcGVyYXRpb24oKT09PWIuZGVmYXVsdC5QTlRpbWVPcGVyYXRpb258fHQuZ2V0T3BlcmF0aW9uKCk9PT1iLmRlZmF1bHQuUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9uP2k9YXJndW1lbnRzLmxlbmd0aDw9Mj92b2lkIDA6YXJndW1lbnRzWzJdOihvPWFyZ3VtZW50cy5sZW5ndGg8PTI/dm9pZCAwOmFyZ3VtZW50c1syXSxpPWFyZ3VtZW50cy5sZW5ndGg8PTM/dm9pZCAwOmFyZ3VtZW50c1szXSksXCJ1bmRlZmluZWRcIj09dHlwZW9mIFByb21pc2V8fGl8fChzPWcuZGVmYXVsdC5jcmVhdGVQcm9taXNlKCkpO3ZhciBhPXQudmFsaWRhdGVQYXJhbXMoZSxvKTtpZighYSl7dmFyIGY9dC5wcmVwYXJlUGFyYW1zKGUsbykscD1jKHQsZSxvKSx5PXZvaWQgMCx2PXt1cmw6cCxvcGVyYXRpb246dC5nZXRPcGVyYXRpb24oKSx0aW1lb3V0OnQuZ2V0UmVxdWVzdFRpbWVvdXQoZSl9O2YudXVpZD1yLlVVSUQsZi5wbnNkaz1sKHIpLHIudXNlSW5zdGFuY2VJZCYmKGYuaW5zdGFuY2VpZD1yLmluc3RhbmNlSWQpLHIudXNlUmVxdWVzdElkJiYoZi5yZXF1ZXN0aWQ9ZC5kZWZhdWx0LnY0KCkpLHQuaXNBdXRoU3VwcG9ydGVkKCkmJnIuZ2V0QXV0aEtleSgpJiYoZi5hdXRoPXIuZ2V0QXV0aEtleSgpKSxyLnNlY3JldEtleSYmaChlLHAsZik7dmFyIG09ZnVuY3Rpb24obixyKXtpZihuLmVycm9yKXJldHVybiB2b2lkKGk/aShuKTpzJiZzLnJlamVjdChuZXcgXyhcIlB1Yk51YiBjYWxsIGZhaWxlZCwgY2hlY2sgc3RhdHVzIGZvciBkZXRhaWxzXCIsbikpKTt2YXIgYT10LmhhbmRsZVJlc3BvbnNlKGUscixvKTtpP2kobixhKTpzJiZzLmZ1bGZpbGwoYSl9O2lmKHQudXNlUG9zdCYmdC51c2VQb3N0KGUsbykpe3ZhciBrPXQucG9zdFBheWxvYWQoZSxvKTt5PW4uUE9TVChmLGssdixtKX1lbHNlIHk9bi5HRVQoZix2LG0pO3JldHVybiB0LmdldE9wZXJhdGlvbigpPT09Yi5kZWZhdWx0LlBOU3Vic2NyaWJlT3BlcmF0aW9uP3k6cz9zLnByb21pc2U6dm9pZCAwfXJldHVybiBpP2kodShhKSk6cz8ocy5yZWplY3QobmV3IF8oXCJWYWxpZGF0aW9uIGZhaWxlZCwgY2hlY2sgc3RhdHVzIGZvciBkZXRhaWxzXCIsdShhKSkpLHMucHJvbWlzZSk6dm9pZCAwfTt2YXIgZj1uKDIpLGQ9cihmKSxwPShuKDgpLG4oMTcpKSxnPXIocCkseT1uKDcpLHY9KHIoeSksbigxNikpLGI9cih2KSxfPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSxuKXtpKHRoaXMsdCk7dmFyIHI9cyh0aGlzLCh0Ll9fcHJvdG9fX3x8T2JqZWN0LmdldFByb3RvdHlwZU9mKHQpKS5jYWxsKHRoaXMsZSkpO3JldHVybiByLm5hbWU9ci5jb25zdHJ1Y3Rvci5uYW1lLHIuc3RhdHVzPW4sci5tZXNzYWdlPWUscn1yZXR1cm4gbyh0LGUpLHR9KEVycm9yKTtlLmV4cG9ydHM9dC5kZWZhdWx0fSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5BZGRDaGFubmVsc1RvR3JvdXBPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj10LmNoYW5uZWxHcm91cCxpPWUuY29uZmlnO3JldHVybiByP24mJjAhPT1uLmxlbmd0aD9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbHNcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxzO3JldHVybnthZGQ6KHZvaWQgMD09PW4/W106bikuam9pbihcIixcIil9fWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9YSx0LmlzQXV0aFN1cHBvcnRlZD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5SZW1vdmVDaGFubmVsc0Zyb21Hcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVscyxyPXQuY2hhbm5lbEdyb3VwLGk9ZS5jb25maWc7cmV0dXJuIHI/biYmMCE9PW4ubGVuZ3RoP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbHM7cmV0dXJue3JlbW92ZToodm9pZCAwPT09bj9bXTpuKS5qb2luKFwiLFwiKX19ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTlJlbW92ZUdyb3VwT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cCxyPWUuY29uZmlnO3JldHVybiBuP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsIEdyb3VwXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwO3JldHVyblwiL3YxL2NoYW5uZWwtcmVnaXN0cmF0aW9uL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwtZ3JvdXAvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhuKStcIi9yZW1vdmVcIn1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYygpe3JldHVybnt9fWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcigpe3JldHVybiBoLmRlZmF1bHQuUE5DaGFubmVsR3JvdXBzT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSl7cmV0dXJuXCIvdjEvY2hhbm5lbC1yZWdpc3RyYXRpb24vc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC1ncm91cFwifWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGEoKXtyZXR1cm4hMH1mdW5jdGlvbiB1KCl7cmV0dXJue319ZnVuY3Rpb24gYyhlLHQpe3JldHVybntncm91cHM6dC5wYXlsb2FkLmdyb3Vwc319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOQ2hhbm5lbHNGb3JHcm91cE9wZXJhdGlvbn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5jaGFubmVsR3JvdXAscj1lLmNvbmZpZztyZXR1cm4gbj9yLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgQ2hhbm5lbCBHcm91cFwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cDtyZXR1cm5cIi92MS9jaGFubmVsLXJlZ2lzdHJhdGlvbi9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9jaGFubmVsLWdyb3VwL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcobil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1mdW5jdGlvbiBsKGUsdCl7cmV0dXJue2NoYW5uZWxzOnQucGF5bG9hZC5jaGFubmVsc319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9dC5jaGFubmVscyxzPWUuY29uZmlnO3JldHVybiBuP3I/aSYmMCE9PWkubGVuZ3RoP3Muc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQucHVzaEdhdGV3YXkscj10LmNoYW5uZWxzO3JldHVybnt0eXBlOm4sYWRkOih2b2lkIDA9PT1yP1tdOnIpLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9dC5jaGFubmVscyxzPWUuY29uZmlnO3JldHVybiBuP3I/aSYmMCE9PWkubGVuZ3RoP3Muc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBDaGFubmVsc1wiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3ZhciBuPXQucHVzaEdhdGV3YXkscj10LmNoYW5uZWxzO3JldHVybnt0eXBlOm4scmVtb3ZlOih2b2lkIDA9PT1yP1tdOnIpLmpvaW4oXCIsXCIpfX1mdW5jdGlvbiBjKCl7cmV0dXJue319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoKXtyZXR1cm4gaC5kZWZhdWx0LlBOUHVzaE5vdGlmaWNhdGlvbkVuYWJsZWRDaGFubmVsc09wZXJhdGlvbn1mdW5jdGlvbiBpKGUsdCl7dmFyIG49dC5kZXZpY2Uscj10LnB1c2hHYXRld2F5LGk9ZS5jb25maWc7cmV0dXJuIG4/cj9pLnN1YnNjcmliZUtleT92b2lkIDA6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIjpcIk1pc3NpbmcgR1cgVHlwZSAocHVzaEdhdGV3YXk6IGdjbSBvciBhcG5zKVwiOlwiTWlzc2luZyBEZXZpY2UgSUQgKGRldmljZSlcIn1mdW5jdGlvbiBzKGUsdCl7dmFyIG49dC5kZXZpY2U7cmV0dXJuXCIvdjEvcHVzaC9zdWIta2V5L1wiK2UuY29uZmlnLnN1YnNjcmliZUtleStcIi9kZXZpY2VzL1wiK259ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSx0KXtyZXR1cm57dHlwZTp0LnB1c2hHYXRld2F5fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJue2NoYW5uZWxzOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTlJlbW92ZUFsbFB1c2hOb3RpZmljYXRpb25zT3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSx0KXt2YXIgbj10LmRldmljZSxyPXQucHVzaEdhdGV3YXksaT1lLmNvbmZpZztyZXR1cm4gbj9yP2kuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBHVyBUeXBlIChwdXNoR2F0ZXdheTogZ2NtIG9yIGFwbnMpXCI6XCJNaXNzaW5nIERldmljZSBJRCAoZGV2aWNlKVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj10LmRldmljZTtyZXR1cm5cIi92MS9wdXNoL3N1Yi1rZXkvXCIrZS5jb25maWcuc3Vic2NyaWJlS2V5K1wiL2RldmljZXMvXCIrbitcIi9yZW1vdmVcIn1mdW5jdGlvbiBvKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBhKCl7cmV0dXJuITB9ZnVuY3Rpb24gdShlLHQpe3JldHVybnt0eXBlOnQucHVzaEdhdGV3YXl9fWZ1bmN0aW9uIGMoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1yLHQudmFsaWRhdGVQYXJhbXM9aSx0LmdldFVSTD1zLHQuZ2V0UmVxdWVzdFRpbWVvdXQ9byx0LmlzQXV0aFN1cHBvcnRlZD1hLHQucHJlcGFyZVBhcmFtcz11LHQuaGFuZGxlUmVzcG9uc2U9Yzt2YXIgbD0obig4KSxuKDE2KSksaD1mdW5jdGlvbihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19KGwpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5VbnN1YnNjcmliZU9wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LmNoYW5uZWxzLGk9dm9pZCAwPT09cj9bXTpyLHM9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO3JldHVyblwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitwLmRlZmF1bHQuZW5jb2RlU3RyaW5nKHMpK1wiL2xlYXZlXCJ9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT17fTtyZXR1cm4gci5sZW5ndGg+MCYmKGlbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLGl9ZnVuY3Rpb24gbCgpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTldoZXJlTm93T3BlcmF0aW9ufWZ1bmN0aW9uIGkoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIHMoZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQudXVpZCxpPXZvaWQgMD09PXI/bi5VVUlEOnI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi91dWlkL1wiK2l9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoKXtyZXR1cm57fX1mdW5jdGlvbiBjKGUsdCl7cmV0dXJue2NoYW5uZWxzOnQucGF5bG9hZC5jaGFubmVsc319T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cix0LnZhbGlkYXRlUGFyYW1zPWksdC5nZXRVUkw9cyx0LmdldFJlcXVlc3RUaW1lb3V0PW8sdC5pc0F1dGhTdXBwb3J0ZWQ9YSx0LnByZXBhcmVQYXJhbXM9dSx0LmhhbmRsZVJlc3BvbnNlPWM7dmFyIGw9KG4oOCksbigxNikpLGg9ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fShsKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOSGVhcnRiZWF0T3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvcHJlc2VuY2Uvc3ViLWtleS9cIituLnN1YnNjcmliZUtleStcIi9jaGFubmVsL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcocykrXCIvaGVhcnRiZWF0XCJ9ZnVuY3Rpb24gYSgpe3JldHVybiEwfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT10LnN0YXRlLHM9dm9pZCAwPT09aT97fTppLG89ZS5jb25maWcsYT17fTtyZXR1cm4gci5sZW5ndGg+MCYmKGFbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLGEuc3RhdGU9SlNPTi5zdHJpbmdpZnkocyksYS5oZWFydGJlYXQ9by5nZXRQcmVzZW5jZVRpbWVvdXQoKSxhfWZ1bmN0aW9uIGwoKXtyZXR1cm57fX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmdldE9wZXJhdGlvbj1pLHQudmFsaWRhdGVQYXJhbXM9cyx0LmdldFVSTD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5nZXRSZXF1ZXN0VGltZW91dD11LHQucHJlcGFyZVBhcmFtcz1jLHQuaGFuZGxlUmVzcG9uc2U9bDt2YXIgaD0obig4KSxuKDE2KSksZj1yKGgpLGQ9bigxNykscD1yKGQpfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaSgpe3JldHVybiBmLmRlZmF1bHQuUE5HZXRTdGF0ZU9wZXJhdGlvbn1mdW5jdGlvbiBzKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49ZS5jb25maWcscj10LnV1aWQsaT12b2lkIDA9PT1yP24uVVVJRDpyLHM9dC5jaGFubmVscyxvPXZvaWQgMD09PXM/W106cyxhPW8ubGVuZ3RoPjA/by5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhhKStcIi91dWlkL1wiK2l9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LmNoYW5uZWxHcm91cHMscj12b2lkIDA9PT1uP1tdOm4saT17fTtyZXR1cm4gci5sZW5ndGg+MCYmKGlbXCJjaGFubmVsLWdyb3VwXCJdPXIuam9pbihcIixcIikpLGl9ZnVuY3Rpb24gbChlLHQsbil7dmFyIHI9bi5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPW4uY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PXM/W106cyxhPXt9O3JldHVybiAxPT09aS5sZW5ndGgmJjA9PT1vLmxlbmd0aD9hW2lbMF1dPXQucGF5bG9hZDphPXQucGF5bG9hZCx7Y2hhbm5lbHM6YX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249aSx0LnZhbGlkYXRlUGFyYW1zPXMsdC5nZXRVUkw9byx0LmdldFJlcXVlc3RUaW1lb3V0PWEsdC5pc0F1dGhTdXBwb3J0ZWQ9dSx0LnByZXBhcmVQYXJhbXM9Yyx0LmhhbmRsZVJlc3BvbnNlPWw7dmFyIGg9KG4oOCksbigxNikpLGY9cihoKSxkPW4oMTcpLHA9cihkKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOU2V0U3RhdGVPcGVyYXRpb259ZnVuY3Rpb24gcyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5zdGF0ZSxpPXQuY2hhbm5lbHMscz12b2lkIDA9PT1pP1tdOmksbz10LmNoYW5uZWxHcm91cHMsYT12b2lkIDA9PT1vP1tdOm87cmV0dXJuIHI/bi5zdWJzY3JpYmVLZXk/MD09PXMubGVuZ3RoJiYwPT09YS5sZW5ndGg/XCJQbGVhc2UgcHJvdmlkZSBhIGxpc3Qgb2YgY2hhbm5lbHMgYW5kL29yIGNoYW5uZWwtZ3JvdXBzXCI6dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIFN0YXRlXCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPWkubGVuZ3RoPjA/aS5qb2luKFwiLFwiKTpcIixcIjtyZXR1cm5cIi92Mi9wcmVzZW5jZS9zdWIta2V5L1wiK24uc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyhzKStcIi91dWlkL1wiK24uVVVJRCtcIi9kYXRhXCJ9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gdSgpe3JldHVybiEwfWZ1bmN0aW9uIGMoZSx0KXt2YXIgbj10LnN0YXRlLHI9dC5jaGFubmVsR3JvdXBzLGk9dm9pZCAwPT09cj9bXTpyLHM9e307cmV0dXJuIHMuc3RhdGU9SlNPTi5zdHJpbmdpZnkobiksaS5sZW5ndGg+MCYmKHNbXCJjaGFubmVsLWdyb3VwXCJdPWkuam9pbihcIixcIikpLHN9ZnVuY3Rpb24gbChlLHQpe3JldHVybntzdGF0ZTp0LnBheWxvYWR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGYuZGVmYXVsdC5QTkhlcmVOb3dPcGVyYXRpb259ZnVuY3Rpb24gcyhlKXtpZighZS5jb25maWcuc3Vic2NyaWJlS2V5KXJldHVyblwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCJ9ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVscyxpPXZvaWQgMD09PXI/W106cixzPXQuY2hhbm5lbEdyb3VwcyxvPXZvaWQgMD09PXM/W106cyxhPVwiL3YyL3ByZXNlbmNlL3N1Yi1rZXkvXCIrbi5zdWJzY3JpYmVLZXk7aWYoaS5sZW5ndGg+MHx8by5sZW5ndGg+MCl7dmFyIHU9aS5sZW5ndGg+MD9pLmpvaW4oXCIsXCIpOlwiLFwiO2ErPVwiL2NoYW5uZWwvXCIrcC5kZWZhdWx0LmVuY29kZVN0cmluZyh1KX1yZXR1cm4gYX1mdW5jdGlvbiBhKGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPXQuY2hhbm5lbEdyb3VwcyxyPXZvaWQgMD09PW4/W106bixpPXQuaW5jbHVkZVVVSURzLHM9dm9pZCAwPT09aXx8aSxvPXQuaW5jbHVkZVN0YXRlLGE9dm9pZCAwIT09byYmbyx1PXt9O3JldHVybiBzfHwodS5kaXNhYmxlX3V1aWRzPTEpLGEmJih1LnN0YXRlPTEpLHIubGVuZ3RoPjAmJih1W1wiY2hhbm5lbC1ncm91cFwiXT1yLmpvaW4oXCIsXCIpKSx1fWZ1bmN0aW9uIGwoZSx0LG4pe3ZhciByPW4uY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1uLmNoYW5uZWxHcm91cHMsbz12b2lkIDA9PT1zP1tdOnMsYT1uLmluY2x1ZGVVVUlEcyx1PXZvaWQgMD09PWF8fGEsYz1uLmluY2x1ZGVTdGF0ZSxsPXZvaWQgMCE9PWMmJmM7cmV0dXJuIGkubGVuZ3RoPjF8fG8ubGVuZ3RoPjB8fDA9PT1vLmxlbmd0aCYmMD09PWkubGVuZ3RoP2Z1bmN0aW9uKCl7dmFyIGU9e307cmV0dXJuIGUudG90YWxDaGFubmVscz10LnBheWxvYWQudG90YWxfY2hhbm5lbHMsZS50b3RhbE9jY3VwYW5jeT10LnBheWxvYWQudG90YWxfb2NjdXBhbmN5LGUuY2hhbm5lbHM9e30sT2JqZWN0LmtleXModC5wYXlsb2FkLmNoYW5uZWxzKS5mb3JFYWNoKGZ1bmN0aW9uKG4pe3ZhciByPXQucGF5bG9hZC5jaGFubmVsc1tuXSxpPVtdO3JldHVybiBlLmNoYW5uZWxzW25dPXtvY2N1cGFudHM6aSxuYW1lOm4sb2NjdXBhbmN5OnIub2NjdXBhbmN5fSx1JiZyLnV1aWRzLmZvckVhY2goZnVuY3Rpb24oZSl7bD9pLnB1c2goe3N0YXRlOmUuc3RhdGUsdXVpZDplLnV1aWR9KTppLnB1c2goe3N0YXRlOm51bGwsdXVpZDplfSl9KSxlfSksZX0oKTpmdW5jdGlvbigpe3ZhciBlPXt9LG49W107cmV0dXJuIGUudG90YWxDaGFubmVscz0xLGUudG90YWxPY2N1cGFuY3k9dC5vY2N1cGFuY3ksZS5jaGFubmVscz17fSxlLmNoYW5uZWxzW2lbMF1dPXtvY2N1cGFudHM6bixuYW1lOmlbMF0sb2NjdXBhbmN5OnQub2NjdXBhbmN5fSx1JiZ0LnV1aWRzLmZvckVhY2goZnVuY3Rpb24oZSl7bD9uLnB1c2goe3N0YXRlOmUuc3RhdGUsdXVpZDplLnV1aWR9KTpuLnB1c2goe3N0YXRlOm51bGwsdXVpZDplfSl9KSxlfSgpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTkFjY2Vzc01hbmFnZXJBdWRpdH1mdW5jdGlvbiBpKGUpe2lmKCFlLmNvbmZpZy5zdWJzY3JpYmVLZXkpcmV0dXJuXCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBzKGUpe3JldHVyblwiL3YyL2F1dGgvYXVkaXQvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXl9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiExfWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj10LmNoYW5uZWwscj10LmNoYW5uZWxHcm91cCxpPXQuYXV0aEtleXMscz12b2lkIDA9PT1pP1tdOmksbz17fTtyZXR1cm4gbiYmKG8uY2hhbm5lbD1uKSxyJiYob1tcImNoYW5uZWwtZ3JvdXBcIl09cikscy5sZW5ndGg+MCYmKG8uYXV0aD1zLmpvaW4oXCIsXCIpKSxvfWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm4gdC5wYXlsb2FkfU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKCl7cmV0dXJuIGguZGVmYXVsdC5QTkFjY2Vzc01hbmFnZXJHcmFudH1mdW5jdGlvbiBpKGUpe3ZhciB0PWUuY29uZmlnO3JldHVybiB0LnN1YnNjcmliZUtleT90LnB1Ymxpc2hLZXk/dC5zZWNyZXRLZXk/dm9pZCAwOlwiTWlzc2luZyBTZWNyZXQgS2V5XCI6XCJNaXNzaW5nIFB1Ymxpc2ggS2V5XCI6XCJNaXNzaW5nIFN1YnNjcmliZSBLZXlcIn1mdW5jdGlvbiBzKGUpe3JldHVyblwiL3YyL2F1dGgvZ3JhbnQvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXl9ZnVuY3Rpb24gbyhlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gYSgpe3JldHVybiExfWZ1bmN0aW9uIHUoZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9dm9pZCAwPT09bj9bXTpuLGk9dC5jaGFubmVsR3JvdXBzLHM9dm9pZCAwPT09aT9bXTppLG89dC50dGwsYT10LnJlYWQsdT12b2lkIDAhPT1hJiZhLGM9dC53cml0ZSxsPXZvaWQgMCE9PWMmJmMsaD10Lm1hbmFnZSxmPXZvaWQgMCE9PWgmJmgsZD10LmF1dGhLZXlzLHA9dm9pZCAwPT09ZD9bXTpkLGc9e307cmV0dXJuIGcucj11P1wiMVwiOlwiMFwiLGcudz1sP1wiMVwiOlwiMFwiLGcubT1mP1wiMVwiOlwiMFwiLHIubGVuZ3RoPjAmJihnLmNoYW5uZWw9ci5qb2luKFwiLFwiKSkscy5sZW5ndGg+MCYmKGdbXCJjaGFubmVsLWdyb3VwXCJdPXMuam9pbihcIixcIikpLHAubGVuZ3RoPjAmJihnLmF1dGg9cC5qb2luKFwiLFwiKSksKG98fDA9PT1vKSYmKGcudHRsPW8pLGd9ZnVuY3Rpb24gYygpe3JldHVybnt9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPXIsdC52YWxpZGF0ZVBhcmFtcz1pLHQuZ2V0VVJMPXMsdC5nZXRSZXF1ZXN0VGltZW91dD1vLHQuaXNBdXRoU3VwcG9ydGVkPWEsdC5wcmVwYXJlUGFyYW1zPXUsdC5oYW5kbGVSZXNwb25zZT1jO3ZhciBsPShuKDgpLG4oMTYpKSxoPWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0obCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7dmFyIG49ZS5jcnlwdG8scj1lLmNvbmZpZyxpPUpTT04uc3RyaW5naWZ5KHQpO3JldHVybiByLmNpcGhlcktleSYmKGk9bi5lbmNyeXB0KGkpLGk9SlNPTi5zdHJpbmdpZnkoaSkpLGl9ZnVuY3Rpb24gcygpe3JldHVybiB2LmRlZmF1bHQuUE5QdWJsaXNoT3BlcmF0aW9ufWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQubWVzc2FnZTtyZXR1cm4gdC5jaGFubmVsP3I/bi5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIE1lc3NhZ2VcIjpcIk1pc3NpbmcgQ2hhbm5lbFwifWZ1bmN0aW9uIGEoZSx0KXt2YXIgbj10LnNlbmRCeVBvc3Q7cmV0dXJuIHZvaWQgMCE9PW4mJm59ZnVuY3Rpb24gdShlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVsLHM9dC5tZXNzYWdlLG89aShlLHMpO3JldHVyblwiL3B1Ymxpc2gvXCIrbi5wdWJsaXNoS2V5K1wiL1wiK24uc3Vic2NyaWJlS2V5K1wiLzAvXCIrXy5kZWZhdWx0LmVuY29kZVN0cmluZyhyKStcIi8wL1wiK18uZGVmYXVsdC5lbmNvZGVTdHJpbmcobyl9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVsO3JldHVyblwiL3B1Ymxpc2gvXCIrbi5wdWJsaXNoS2V5K1wiL1wiK24uc3Vic2NyaWJlS2V5K1wiLzAvXCIrXy5kZWZhdWx0LmVuY29kZVN0cmluZyhyKStcIi8wXCJ9ZnVuY3Rpb24gbChlKXtyZXR1cm4gZS5jb25maWcuZ2V0VHJhbnNhY3Rpb25UaW1lb3V0KCl9ZnVuY3Rpb24gaCgpe3JldHVybiEwfWZ1bmN0aW9uIGYoZSx0KXtyZXR1cm4gaShlLHQubWVzc2FnZSl9ZnVuY3Rpb24gZChlLHQpe3ZhciBuPXQubWV0YSxyPXQucmVwbGljYXRlLGk9dm9pZCAwPT09cnx8cixzPXQuc3RvcmVJbkhpc3Rvcnksbz10LnR0bCxhPXt9O3JldHVybiBudWxsIT1zJiYoYS5zdG9yZT1zP1wiMVwiOlwiMFwiKSxvJiYoYS50dGw9byksITE9PT1pJiYoYS5ub3JlcD1cInRydWVcIiksbiYmXCJvYmplY3RcIj09PSh2b2lkIDA9PT1uP1widW5kZWZpbmVkXCI6ZyhuKSkmJihhLm1ldGE9SlNPTi5zdHJpbmdpZnkobikpLGF9ZnVuY3Rpb24gcChlLHQpe3JldHVybnt0aW1ldG9rZW46dFsyXX19T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGc9XCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZcInN5bWJvbFwiPT10eXBlb2YgU3ltYm9sLml0ZXJhdG9yP2Z1bmN0aW9uKGUpe3JldHVybiB0eXBlb2YgZX06ZnVuY3Rpb24oZSl7cmV0dXJuIGUmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFN5bWJvbCYmZS5jb25zdHJ1Y3Rvcj09PVN5bWJvbCYmZSE9PVN5bWJvbC5wcm90b3R5cGU/XCJzeW1ib2xcIjp0eXBlb2YgZX07dC5nZXRPcGVyYXRpb249cyx0LnZhbGlkYXRlUGFyYW1zPW8sdC51c2VQb3N0PWEsdC5nZXRVUkw9dSx0LnBvc3RVUkw9Yyx0LmdldFJlcXVlc3RUaW1lb3V0PWwsdC5pc0F1dGhTdXBwb3J0ZWQ9aCx0LnBvc3RQYXlsb2FkPWYsdC5wcmVwYXJlUGFyYW1zPWQsdC5oYW5kbGVSZXNwb25zZT1wO3ZhciB5PShuKDgpLG4oMTYpKSx2PXIoeSksYj1uKDE3KSxfPXIoYil9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7dmFyIG49ZS5jb25maWcscj1lLmNyeXB0bztpZighbi5jaXBoZXJLZXkpcmV0dXJuIHQ7dHJ5e3JldHVybiByLmRlY3J5cHQodCl9Y2F0Y2goZSl7cmV0dXJuIHR9fWZ1bmN0aW9uIHMoKXtyZXR1cm4gZC5kZWZhdWx0LlBOSGlzdG9yeU9wZXJhdGlvbn1mdW5jdGlvbiBvKGUsdCl7dmFyIG49dC5jaGFubmVsLHI9ZS5jb25maWc7cmV0dXJuIG4/ci5zdWJzY3JpYmVLZXk/dm9pZCAwOlwiTWlzc2luZyBTdWJzY3JpYmUgS2V5XCI6XCJNaXNzaW5nIGNoYW5uZWxcIn1mdW5jdGlvbiBhKGUsdCl7dmFyIG49dC5jaGFubmVsO3JldHVyblwiL3YyL2hpc3Rvcnkvc3ViLWtleS9cIitlLmNvbmZpZy5zdWJzY3JpYmVLZXkrXCIvY2hhbm5lbC9cIitnLmRlZmF1bHQuZW5jb2RlU3RyaW5nKG4pfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGUuY29uZmlnLmdldFRyYW5zYWN0aW9uVGltZW91dCgpfWZ1bmN0aW9uIGMoKXtyZXR1cm4hMH1mdW5jdGlvbiBsKGUsdCl7dmFyIG49dC5zdGFydCxyPXQuZW5kLGk9dC5yZXZlcnNlLHM9dC5jb3VudCxvPXZvaWQgMD09PXM/MTAwOnMsYT10LnN0cmluZ2lmaWVkVGltZVRva2VuLHU9dm9pZCAwIT09YSYmYSxjPXtpbmNsdWRlX3Rva2VuOlwidHJ1ZVwifTtyZXR1cm4gYy5jb3VudD1vLG4mJihjLnN0YXJ0PW4pLHImJihjLmVuZD1yKSx1JiYoYy5zdHJpbmdfbWVzc2FnZV90b2tlbj1cInRydWVcIiksbnVsbCE9aSYmKGMucmV2ZXJzZT1pLnRvU3RyaW5nKCkpLGN9ZnVuY3Rpb24gaChlLHQpe3ZhciBuPXttZXNzYWdlczpbXSxzdGFydFRpbWVUb2tlbjp0WzFdLGVuZFRpbWVUb2tlbjp0WzJdfTtyZXR1cm4gdFswXS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciByPXt0aW1ldG9rZW46dC50aW1ldG9rZW4sZW50cnk6aShlLHQubWVzc2FnZSl9O24ubWVzc2FnZXMucHVzaChyKX0pLG59T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cyx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5pc0F1dGhTdXBwb3J0ZWQ9Yyx0LnByZXBhcmVQYXJhbXM9bCx0LmhhbmRsZVJlc3BvbnNlPWg7dmFyIGY9KG4oOCksXG5uKDE2KSksZD1yKGYpLHA9bigxNyksZz1yKHApfSxmdW5jdGlvbihlLHQsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmZS5fX2VzTW9kdWxlP2U6e2RlZmF1bHQ6ZX19ZnVuY3Rpb24gaShlLHQpe3ZhciBuPWUuY29uZmlnLHI9ZS5jcnlwdG87aWYoIW4uY2lwaGVyS2V5KXJldHVybiB0O3RyeXtyZXR1cm4gci5kZWNyeXB0KHQpfWNhdGNoKGUpe3JldHVybiB0fX1mdW5jdGlvbiBzKCl7cmV0dXJuIGQuZGVmYXVsdC5QTkZldGNoTWVzc2FnZXNPcGVyYXRpb259ZnVuY3Rpb24gbyhlLHQpe3ZhciBuPXQuY2hhbm5lbHMscj1lLmNvbmZpZztyZXR1cm4gbiYmMCE9PW4ubGVuZ3RoP3Iuc3Vic2NyaWJlS2V5P3ZvaWQgMDpcIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwiOlwiTWlzc2luZyBjaGFubmVsc1wifWZ1bmN0aW9uIGEoZSx0KXt2YXIgbj10LmNoYW5uZWxzLHI9dm9pZCAwPT09bj9bXTpuLGk9ZS5jb25maWcscz1yLmxlbmd0aD4wP3Iuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjMvaGlzdG9yeS9zdWIta2V5L1wiK2kuc3Vic2NyaWJlS2V5K1wiL2NoYW5uZWwvXCIrZy5kZWZhdWx0LmVuY29kZVN0cmluZyhzKX1mdW5jdGlvbiB1KGUpe3JldHVybiBlLmNvbmZpZy5nZXRUcmFuc2FjdGlvblRpbWVvdXQoKX1mdW5jdGlvbiBjKCl7cmV0dXJuITB9ZnVuY3Rpb24gbChlLHQpe3ZhciBuPXQuc3RhcnQscj10LmVuZCxpPXQuY291bnQscz17fTtyZXR1cm4gaSYmKHMubWF4PWkpLG4mJihzLnN0YXJ0PW4pLHImJihzLmVuZD1yKSxzfWZ1bmN0aW9uIGgoZSx0KXt2YXIgbj17Y2hhbm5lbHM6e319O3JldHVybiBPYmplY3Qua2V5cyh0LmNoYW5uZWxzfHx7fSkuZm9yRWFjaChmdW5jdGlvbihyKXtuLmNoYW5uZWxzW3JdPVtdLCh0LmNoYW5uZWxzW3JdfHxbXSkuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgcz17fTtzLmNoYW5uZWw9cixzLnN1YnNjcmlwdGlvbj1udWxsLHMudGltZXRva2VuPXQudGltZXRva2VuLHMubWVzc2FnZT1pKGUsdC5tZXNzYWdlKSxuLmNoYW5uZWxzW3JdLnB1c2gocyl9KX0pLG59T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXRPcGVyYXRpb249cyx0LnZhbGlkYXRlUGFyYW1zPW8sdC5nZXRVUkw9YSx0LmdldFJlcXVlc3RUaW1lb3V0PXUsdC5pc0F1dGhTdXBwb3J0ZWQ9Yyx0LnByZXBhcmVQYXJhbXM9bCx0LmhhbmRsZVJlc3BvbnNlPWg7dmFyIGY9KG4oOCksbigxNikpLGQ9cihmKSxwPW4oMTcpLGc9cihwKX0sZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7cmV0dXJuIGUmJmUuX19lc01vZHVsZT9lOntkZWZhdWx0OmV9fWZ1bmN0aW9uIGkoKXtyZXR1cm4gZi5kZWZhdWx0LlBOU3Vic2NyaWJlT3BlcmF0aW9ufWZ1bmN0aW9uIHMoZSl7aWYoIWUuY29uZmlnLnN1YnNjcmliZUtleSlyZXR1cm5cIk1pc3NpbmcgU3Vic2NyaWJlIEtleVwifWZ1bmN0aW9uIG8oZSx0KXt2YXIgbj1lLmNvbmZpZyxyPXQuY2hhbm5lbHMsaT12b2lkIDA9PT1yP1tdOnIscz1pLmxlbmd0aD4wP2kuam9pbihcIixcIik6XCIsXCI7cmV0dXJuXCIvdjIvc3Vic2NyaWJlL1wiK24uc3Vic2NyaWJlS2V5K1wiL1wiK3AuZGVmYXVsdC5lbmNvZGVTdHJpbmcocykrXCIvMFwifWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUuY29uZmlnLmdldFN1YnNjcmliZVRpbWVvdXQoKX1mdW5jdGlvbiB1KCl7cmV0dXJuITB9ZnVuY3Rpb24gYyhlLHQpe3ZhciBuPWUuY29uZmlnLHI9dC5jaGFubmVsR3JvdXBzLGk9dm9pZCAwPT09cj9bXTpyLHM9dC50aW1ldG9rZW4sbz10LmZpbHRlckV4cHJlc3Npb24sYT10LnJlZ2lvbix1PXtoZWFydGJlYXQ6bi5nZXRQcmVzZW5jZVRpbWVvdXQoKX07cmV0dXJuIGkubGVuZ3RoPjAmJih1W1wiY2hhbm5lbC1ncm91cFwiXT1pLmpvaW4oXCIsXCIpKSxvJiZvLmxlbmd0aD4wJiYodVtcImZpbHRlci1leHByXCJdPW8pLHMmJih1LnR0PXMpLGEmJih1LnRyPWEpLHV9ZnVuY3Rpb24gbChlLHQpe3ZhciBuPVtdO3QubS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciB0PXtwdWJsaXNoVGltZXRva2VuOmUucC50LHJlZ2lvbjplLnAucn0scj17c2hhcmQ6cGFyc2VJbnQoZS5hLDEwKSxzdWJzY3JpcHRpb25NYXRjaDplLmIsY2hhbm5lbDplLmMscGF5bG9hZDplLmQsZmxhZ3M6ZS5mLGlzc3VpbmdDbGllbnRJZDplLmksc3Vic2NyaWJlS2V5OmUuayxvcmlnaW5hdGlvblRpbWV0b2tlbjplLm8sdXNlck1ldGFkYXRhOmUudSxwdWJsaXNoTWV0YURhdGE6dH07bi5wdXNoKHIpfSk7dmFyIHI9e3RpbWV0b2tlbjp0LnQudCxyZWdpb246dC50LnJ9O3JldHVybnttZXNzYWdlczpuLG1ldGFkYXRhOnJ9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLHQuZ2V0T3BlcmF0aW9uPWksdC52YWxpZGF0ZVBhcmFtcz1zLHQuZ2V0VVJMPW8sdC5nZXRSZXF1ZXN0VGltZW91dD1hLHQuaXNBdXRoU3VwcG9ydGVkPXUsdC5wcmVwYXJlUGFyYW1zPWMsdC5oYW5kbGVSZXNwb25zZT1sO3ZhciBoPShuKDgpLG4oMTYpKSxmPXIoaCksZD1uKDE3KSxwPXIoZCl9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX1mdW5jdGlvbiBpKGUsdCl7aWYoIShlIGluc3RhbmNlb2YgdCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoZSx0KXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHI9dFtuXTtyLmVudW1lcmFibGU9ci5lbnVtZXJhYmxlfHwhMSxyLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiByJiYoci53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsci5rZXkscil9fXJldHVybiBmdW5jdGlvbih0LG4scil7cmV0dXJuIG4mJmUodC5wcm90b3R5cGUsbiksciYmZSh0LHIpLHR9fSgpLG89big3KSxhPShyKG8pLG4oMTMpKSx1PXIoYSksYz0obig4KSxmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7dmFyIG49dGhpcztpKHRoaXMsZSksdGhpcy5fbW9kdWxlcz17fSxPYmplY3Qua2V5cyh0KS5mb3JFYWNoKGZ1bmN0aW9uKGUpe24uX21vZHVsZXNbZV09dFtlXS5iaW5kKG4pfSl9cmV0dXJuIHMoZSxbe2tleTpcImluaXRcIix2YWx1ZTpmdW5jdGlvbihlKXt0aGlzLl9jb25maWc9ZSx0aGlzLl9tYXhTdWJEb21haW49MjAsdGhpcy5fY3VycmVudFN1YkRvbWFpbj1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqdGhpcy5fbWF4U3ViRG9tYWluKSx0aGlzLl9wcm92aWRlZEZRRE49KHRoaXMuX2NvbmZpZy5zZWN1cmU/XCJodHRwczovL1wiOlwiaHR0cDovL1wiKSt0aGlzLl9jb25maWcub3JpZ2luLHRoaXMuX2NvcmVQYXJhbXM9e30sdGhpcy5zaGlmdFN0YW5kYXJkT3JpZ2luKCl9fSx7a2V5OlwibmV4dE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKCl7aWYoLTE9PT10aGlzLl9wcm92aWRlZEZRRE4uaW5kZXhPZihcInB1YnN1Yi5cIikpcmV0dXJuIHRoaXMuX3Byb3ZpZGVkRlFETjt2YXIgZT12b2lkIDA7cmV0dXJuIHRoaXMuX2N1cnJlbnRTdWJEb21haW49dGhpcy5fY3VycmVudFN1YkRvbWFpbisxLHRoaXMuX2N1cnJlbnRTdWJEb21haW4+PXRoaXMuX21heFN1YkRvbWFpbiYmKHRoaXMuX2N1cnJlbnRTdWJEb21haW49MSksZT10aGlzLl9jdXJyZW50U3ViRG9tYWluLnRvU3RyaW5nKCksdGhpcy5fcHJvdmlkZWRGUUROLnJlcGxhY2UoXCJwdWJzdWJcIixcInBzXCIrZSl9fSx7a2V5Olwic2hpZnRTdGFuZGFyZE9yaWdpblwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTtyZXR1cm4gdGhpcy5fc3RhbmRhcmRPcmlnaW49dGhpcy5uZXh0T3JpZ2luKGUpLHRoaXMuX3N0YW5kYXJkT3JpZ2lufX0se2tleTpcImdldFN0YW5kYXJkT3JpZ2luXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3RhbmRhcmRPcmlnaW59fSx7a2V5OlwiUE9TVFwiLHZhbHVlOmZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiB0aGlzLl9tb2R1bGVzLnBvc3QoZSx0LG4scil9fSx7a2V5OlwiR0VUXCIsdmFsdWU6ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB0aGlzLl9tb2R1bGVzLmdldChlLHQsbil9fSx7a2V5OlwiX2RldGVjdEVycm9yQ2F0ZWdvcnlcIix2YWx1ZTpmdW5jdGlvbihlKXtpZihcIkVOT1RGT1VORFwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoXCJFQ09OTlJFRlVTRURcIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKFwiRUNPTk5SRVNFVFwiPT09ZS5jb2RlKXJldHVybiB1LmRlZmF1bHQuUE5OZXR3b3JrSXNzdWVzQ2F0ZWdvcnk7aWYoXCJFQUlfQUdBSU5cIj09PWUuY29kZSlyZXR1cm4gdS5kZWZhdWx0LlBOTmV0d29ya0lzc3Vlc0NhdGVnb3J5O2lmKDA9PT1lLnN0YXR1c3x8ZS5oYXNPd25Qcm9wZXJ0eShcInN0YXR1c1wiKSYmdm9pZCAwPT09ZS5zdGF0dXMpcmV0dXJuIHUuZGVmYXVsdC5QTk5ldHdvcmtJc3N1ZXNDYXRlZ29yeTtpZihlLnRpbWVvdXQpcmV0dXJuIHUuZGVmYXVsdC5QTlRpbWVvdXRDYXRlZ29yeTtpZihlLnJlc3BvbnNlKXtpZihlLnJlc3BvbnNlLmJhZFJlcXVlc3QpcmV0dXJuIHUuZGVmYXVsdC5QTkJhZFJlcXVlc3RDYXRlZ29yeTtpZihlLnJlc3BvbnNlLmZvcmJpZGRlbilyZXR1cm4gdS5kZWZhdWx0LlBOQWNjZXNzRGVuaWVkQ2F0ZWdvcnl9cmV0dXJuIHUuZGVmYXVsdC5QTlVua25vd25DYXRlZ29yeX19XSksZX0oKSk7dC5kZWZhdWx0PWMsZS5leHBvcnRzPXQuZGVmYXVsdH0sZnVuY3Rpb24oZSx0KXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSx0LmRlZmF1bHQ9e2dldDpmdW5jdGlvbihlKXt0cnl7cmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKGUpfWNhdGNoKGUpe3JldHVybiBudWxsfX0sc2V0OmZ1bmN0aW9uKGUsdCl7dHJ5e3JldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShlLHQpfWNhdGNoKGUpe3JldHVybiBudWxsfX19LGUuZXhwb3J0cz10LmRlZmF1bHR9LGZ1bmN0aW9uKGUsdCxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe3ZhciB0PShuZXcgRGF0ZSkuZ2V0VGltZSgpLG49KG5ldyBEYXRlKS50b0lTT1N0cmluZygpLHI9ZnVuY3Rpb24oKXtyZXR1cm4gY29uc29sZSYmY29uc29sZS5sb2c/Y29uc29sZTp3aW5kb3cmJndpbmRvdy5jb25zb2xlJiZ3aW5kb3cuY29uc29sZS5sb2c/d2luZG93LmNvbnNvbGU6Y29uc29sZX0oKTtyLmxvZyhcIjw8PDw8XCIpLHIubG9nKFwiW1wiK24rXCJdXCIsXCJcXG5cIixlLnVybCxcIlxcblwiLGUucXMpLHIubG9nKFwiLS0tLS1cIiksZS5vbihcInJlc3BvbnNlXCIsZnVuY3Rpb24obil7dmFyIGk9KG5ldyBEYXRlKS5nZXRUaW1lKCkscz1pLXQsbz0obmV3IERhdGUpLnRvSVNPU3RyaW5nKCk7ci5sb2coXCI+Pj4+Pj5cIiksci5sb2coXCJbXCIrbytcIiAvIFwiK3MrXCJdXCIsXCJcXG5cIixlLnVybCxcIlxcblwiLGUucXMsXCJcXG5cIixuLnRleHQpLHIubG9nKFwiLS0tLS1cIil9KX1mdW5jdGlvbiBpKGUsdCxuKXt2YXIgaT10aGlzO3JldHVybiB0aGlzLl9jb25maWcubG9nVmVyYm9zaXR5JiYoZT1lLnVzZShyKSksdGhpcy5fY29uZmlnLnByb3h5JiZ0aGlzLl9tb2R1bGVzLnByb3h5JiYoZT10aGlzLl9tb2R1bGVzLnByb3h5LmNhbGwodGhpcyxlKSksdGhpcy5fY29uZmlnLmtlZXBBbGl2ZSYmdGhpcy5fbW9kdWxlcy5rZWVwQWxpdmUmJihlPXRoaXMuX21vZHVsZS5rZWVwQWxpdmUoZSkpLGUudGltZW91dCh0LnRpbWVvdXQpLmVuZChmdW5jdGlvbihlLHIpe3ZhciBzPXt9O2lmKHMuZXJyb3I9bnVsbCE9PWUscy5vcGVyYXRpb249dC5vcGVyYXRpb24sciYmci5zdGF0dXMmJihzLnN0YXR1c0NvZGU9ci5zdGF0dXMpLGUpcmV0dXJuIHMuZXJyb3JEYXRhPWUscy5jYXRlZ29yeT1pLl9kZXRlY3RFcnJvckNhdGVnb3J5KGUpLG4ocyxudWxsKTt2YXIgbz1KU09OLnBhcnNlKHIudGV4dCk7cmV0dXJuIG4ocyxvKX0pfWZ1bmN0aW9uIHMoZSx0LG4pe3ZhciByPXUuZGVmYXVsdC5nZXQodGhpcy5nZXRTdGFuZGFyZE9yaWdpbigpK3QudXJsKS5xdWVyeShlKTtyZXR1cm4gaS5jYWxsKHRoaXMscix0LG4pfWZ1bmN0aW9uIG8oZSx0LG4scil7dmFyIHM9dS5kZWZhdWx0LnBvc3QodGhpcy5nZXRTdGFuZGFyZE9yaWdpbigpK24udXJsKS5xdWVyeShlKS5zZW5kKHQpO3JldHVybiBpLmNhbGwodGhpcyxzLG4scil9T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksdC5nZXQ9cyx0LnBvc3Q9bzt2YXIgYT1uKDQzKSx1PWZ1bmN0aW9uKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGU/ZTp7ZGVmYXVsdDplfX0oYSk7big4KX0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoKXt9ZnVuY3Rpb24gaShlKXtpZighdihlKSlyZXR1cm4gZTt2YXIgdD1bXTtmb3IodmFyIG4gaW4gZSlzKHQsbixlW25dKTtyZXR1cm4gdC5qb2luKFwiJlwiKX1mdW5jdGlvbiBzKGUsdCxuKXtpZihudWxsIT1uKWlmKEFycmF5LmlzQXJyYXkobikpbi5mb3JFYWNoKGZ1bmN0aW9uKG4pe3MoZSx0LG4pfSk7ZWxzZSBpZih2KG4pKWZvcih2YXIgciBpbiBuKXMoZSx0K1wiW1wiK3IrXCJdXCIsbltyXSk7ZWxzZSBlLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KHQpK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudChuKSk7ZWxzZSBudWxsPT09biYmZS5wdXNoKGVuY29kZVVSSUNvbXBvbmVudCh0KSl9ZnVuY3Rpb24gbyhlKXtmb3IodmFyIHQsbixyPXt9LGk9ZS5zcGxpdChcIiZcIikscz0wLG89aS5sZW5ndGg7czxvOysrcyl0PWlbc10sbj10LmluZGV4T2YoXCI9XCIpLC0xPT1uP3JbZGVjb2RlVVJJQ29tcG9uZW50KHQpXT1cIlwiOnJbZGVjb2RlVVJJQ29tcG9uZW50KHQuc2xpY2UoMCxuKSldPWRlY29kZVVSSUNvbXBvbmVudCh0LnNsaWNlKG4rMSkpO3JldHVybiByfWZ1bmN0aW9uIGEoZSl7dmFyIHQsbixyLGkscz1lLnNwbGl0KC9cXHI/XFxuLyksbz17fTtzLnBvcCgpO2Zvcih2YXIgYT0wLHU9cy5sZW5ndGg7YTx1OysrYSluPXNbYV0sdD1uLmluZGV4T2YoXCI6XCIpLHI9bi5zbGljZSgwLHQpLnRvTG93ZXJDYXNlKCksaT1fKG4uc2xpY2UodCsxKSksb1tyXT1pO3JldHVybiBvfWZ1bmN0aW9uIHUoZSl7cmV0dXJuL1tcXC8rXWpzb25cXGIvLnRlc3QoZSl9ZnVuY3Rpb24gYyhlKXtyZXR1cm4gZS5zcGxpdCgvICo7ICovKS5zaGlmdCgpfWZ1bmN0aW9uIGwoZSl7cmV0dXJuIGUuc3BsaXQoLyAqOyAqLykucmVkdWNlKGZ1bmN0aW9uKGUsdCl7dmFyIG49dC5zcGxpdCgvICo9ICovKSxyPW4uc2hpZnQoKSxpPW4uc2hpZnQoKTtyZXR1cm4gciYmaSYmKGVbcl09aSksZX0se30pfWZ1bmN0aW9uIGgoZSx0KXt0PXR8fHt9LHRoaXMucmVxPWUsdGhpcy54aHI9dGhpcy5yZXEueGhyLHRoaXMudGV4dD1cIkhFQURcIiE9dGhpcy5yZXEubWV0aG9kJiYoXCJcIj09PXRoaXMueGhyLnJlc3BvbnNlVHlwZXx8XCJ0ZXh0XCI9PT10aGlzLnhoci5yZXNwb25zZVR5cGUpfHx2b2lkIDA9PT10aGlzLnhoci5yZXNwb25zZVR5cGU/dGhpcy54aHIucmVzcG9uc2VUZXh0Om51bGwsdGhpcy5zdGF0dXNUZXh0PXRoaXMucmVxLnhoci5zdGF0dXNUZXh0LHRoaXMuX3NldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKSx0aGlzLmhlYWRlcj10aGlzLmhlYWRlcnM9YSh0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSksdGhpcy5oZWFkZXJbXCJjb250ZW50LXR5cGVcIl09dGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJjb250ZW50LXR5cGVcIiksdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlciksdGhpcy5ib2R5PVwiSEVBRFwiIT10aGlzLnJlcS5tZXRob2Q/dGhpcy5fcGFyc2VCb2R5KHRoaXMudGV4dD90aGlzLnRleHQ6dGhpcy54aHIucmVzcG9uc2UpOm51bGx9ZnVuY3Rpb24gZihlLHQpe3ZhciBuPXRoaXM7dGhpcy5fcXVlcnk9dGhpcy5fcXVlcnl8fFtdLHRoaXMubWV0aG9kPWUsdGhpcy51cmw9dCx0aGlzLmhlYWRlcj17fSx0aGlzLl9oZWFkZXI9e30sdGhpcy5vbihcImVuZFwiLGZ1bmN0aW9uKCl7dmFyIGU9bnVsbCx0PW51bGw7dHJ5e3Q9bmV3IGgobil9Y2F0Y2godCl7cmV0dXJuIGU9bmV3IEVycm9yKFwiUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2VcIiksZS5wYXJzZT0hMCxlLm9yaWdpbmFsPXQsZS5yYXdSZXNwb25zZT1uLnhociYmbi54aHIucmVzcG9uc2VUZXh0P24ueGhyLnJlc3BvbnNlVGV4dDpudWxsLGUuc3RhdHVzQ29kZT1uLnhociYmbi54aHIuc3RhdHVzP24ueGhyLnN0YXR1czpudWxsLG4uY2FsbGJhY2soZSl9bi5lbWl0KFwicmVzcG9uc2VcIix0KTt2YXIgcjt0cnl7KHQuc3RhdHVzPDIwMHx8dC5zdGF0dXM+PTMwMCkmJihyPW5ldyBFcnJvcih0LnN0YXR1c1RleHR8fFwiVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2VcIiksci5vcmlnaW5hbD1lLHIucmVzcG9uc2U9dCxyLnN0YXR1cz10LnN0YXR1cyl9Y2F0Y2goZSl7cj1lfXI/bi5jYWxsYmFjayhyLHQpOm4uY2FsbGJhY2sobnVsbCx0KX0pfWZ1bmN0aW9uIGQoZSx0KXt2YXIgbj1iKFwiREVMRVRFXCIsZSk7cmV0dXJuIHQmJm4uZW5kKHQpLG59dmFyIHA7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz9wPXdpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9wPXNlbGY6KGNvbnNvbGUud2FybihcIlVzaW5nIGJyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIikscD10aGlzKTt2YXIgZz1uKDQ0KSx5PW4oNDUpLHY9big0NiksYj1lLmV4cG9ydHM9big0NykuYmluZChudWxsLGYpO2IuZ2V0WEhSPWZ1bmN0aW9uKCl7aWYoISghcC5YTUxIdHRwUmVxdWVzdHx8cC5sb2NhdGlvbiYmXCJmaWxlOlwiPT1wLmxvY2F0aW9uLnByb3RvY29sJiZwLkFjdGl2ZVhPYmplY3QpKXJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuNi4wXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIpfWNhdGNoKGUpe310cnl7cmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFBcIil9Y2F0Y2goZSl7fXRocm93IEVycm9yKFwiQnJvd3Nlci1vbmx5IHZlcmlzb24gb2Ygc3VwZXJhZ2VudCBjb3VsZCBub3QgZmluZCBYSFJcIil9O3ZhciBfPVwiXCIudHJpbT9mdW5jdGlvbihlKXtyZXR1cm4gZS50cmltKCl9OmZ1bmN0aW9uKGUpe3JldHVybiBlLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZyxcIlwiKX07Yi5zZXJpYWxpemVPYmplY3Q9aSxiLnBhcnNlU3RyaW5nPW8sYi50eXBlcz17aHRtbDpcInRleHQvaHRtbFwiLGpzb246XCJhcHBsaWNhdGlvbi9qc29uXCIseG1sOlwiYXBwbGljYXRpb24veG1sXCIsdXJsZW5jb2RlZDpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLGZvcm06XCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcImZvcm0tZGF0YVwiOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJ9LGIuc2VyaWFsaXplPXtcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiOmksXCJhcHBsaWNhdGlvbi9qc29uXCI6SlNPTi5zdHJpbmdpZnl9LGIucGFyc2U9e1wiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI6byxcImFwcGxpY2F0aW9uL2pzb25cIjpKU09OLnBhcnNlfSxoLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuaGVhZGVyW2UudG9Mb3dlckNhc2UoKV19LGgucHJvdG90eXBlLl9zZXRIZWFkZXJQcm9wZXJ0aWVzPWZ1bmN0aW9uKGUpe3ZhciB0PXRoaXMuaGVhZGVyW1wiY29udGVudC10eXBlXCJdfHxcIlwiO3RoaXMudHlwZT1jKHQpO3ZhciBuPWwodCk7Zm9yKHZhciByIGluIG4pdGhpc1tyXT1uW3JdfSxoLnByb3RvdHlwZS5fcGFyc2VCb2R5PWZ1bmN0aW9uKGUpe3ZhciB0PWIucGFyc2VbdGhpcy50eXBlXTtyZXR1cm4hdCYmdSh0aGlzLnR5cGUpJiYodD1iLnBhcnNlW1wiYXBwbGljYXRpb24vanNvblwiXSksdCYmZSYmKGUubGVuZ3RofHxlIGluc3RhbmNlb2YgT2JqZWN0KT90KGUpOm51bGx9LGgucHJvdG90eXBlLl9zZXRTdGF0dXNQcm9wZXJ0aWVzPWZ1bmN0aW9uKGUpezEyMjM9PT1lJiYoZT0yMDQpO3ZhciB0PWUvMTAwfDA7dGhpcy5zdGF0dXM9dGhpcy5zdGF0dXNDb2RlPWUsdGhpcy5zdGF0dXNUeXBlPXQsdGhpcy5pbmZvPTE9PXQsdGhpcy5vaz0yPT10LHRoaXMuY2xpZW50RXJyb3I9ND09dCx0aGlzLnNlcnZlckVycm9yPTU9PXQsdGhpcy5lcnJvcj0oND09dHx8NT09dCkmJnRoaXMudG9FcnJvcigpLHRoaXMuYWNjZXB0ZWQ9MjAyPT1lLHRoaXMubm9Db250ZW50PTIwND09ZSx0aGlzLmJhZFJlcXVlc3Q9NDAwPT1lLHRoaXMudW5hdXRob3JpemVkPTQwMT09ZSx0aGlzLm5vdEFjY2VwdGFibGU9NDA2PT1lLHRoaXMubm90Rm91bmQ9NDA0PT1lLHRoaXMuZm9yYmlkZGVuPTQwMz09ZX0saC5wcm90b3R5cGUudG9FcnJvcj1mdW5jdGlvbigpe3ZhciBlPXRoaXMucmVxLHQ9ZS5tZXRob2Qsbj1lLnVybCxyPVwiY2Fubm90IFwiK3QrXCIgXCIrbitcIiAoXCIrdGhpcy5zdGF0dXMrXCIpXCIsaT1uZXcgRXJyb3Iocik7cmV0dXJuIGkuc3RhdHVzPXRoaXMuc3RhdHVzLGkubWV0aG9kPXQsaS51cmw9bixpfSxiLlJlc3BvbnNlPWgsZyhmLnByb3RvdHlwZSk7Zm9yKHZhciBtIGluIHkpZi5wcm90b3R5cGVbbV09eVttXTtmLnByb3RvdHlwZS50eXBlPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnNldChcIkNvbnRlbnQtVHlwZVwiLGIudHlwZXNbZV18fGUpLHRoaXN9LGYucHJvdG90eXBlLnJlc3BvbnNlVHlwZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcmVzcG9uc2VUeXBlPWUsdGhpc30sZi5wcm90b3R5cGUuYWNjZXB0PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnNldChcIkFjY2VwdFwiLGIudHlwZXNbZV18fGUpLHRoaXN9LGYucHJvdG90eXBlLmF1dGg9ZnVuY3Rpb24oZSx0LG4pe3N3aXRjaChufHwobj17dHlwZTpcImJhc2ljXCJ9KSxuLnR5cGUpe2Nhc2VcImJhc2ljXCI6dmFyIHI9YnRvYShlK1wiOlwiK3QpO3RoaXMuc2V0KFwiQXV0aG9yaXphdGlvblwiLFwiQmFzaWMgXCIrcik7YnJlYWs7Y2FzZVwiYXV0b1wiOnRoaXMudXNlcm5hbWU9ZSx0aGlzLnBhc3N3b3JkPXR9cmV0dXJuIHRoaXN9LGYucHJvdG90eXBlLnF1ZXJ5PWZ1bmN0aW9uKGUpe3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBlJiYoZT1pKGUpKSxlJiZ0aGlzLl9xdWVyeS5wdXNoKGUpLHRoaXN9LGYucHJvdG90eXBlLmF0dGFjaD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGUsdCxufHx0Lm5hbWUpLHRoaXN9LGYucHJvdG90eXBlLl9nZXRGb3JtRGF0YT1mdW5jdGlvbigpe3JldHVybiB0aGlzLl9mb3JtRGF0YXx8KHRoaXMuX2Zvcm1EYXRhPW5ldyBwLkZvcm1EYXRhKSx0aGlzLl9mb3JtRGF0YX0sZi5wcm90b3R5cGUuY2FsbGJhY2s9ZnVuY3Rpb24oZSx0KXt2YXIgbj10aGlzLl9jYWxsYmFjazt0aGlzLmNsZWFyVGltZW91dCgpLG4oZSx0KX0sZi5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvcj1mdW5jdGlvbigpe3ZhciBlPW5ldyBFcnJvcihcIlJlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy5cIik7ZS5jcm9zc0RvbWFpbj0hMCxlLnN0YXR1cz10aGlzLnN0YXR1cyxlLm1ldGhvZD10aGlzLm1ldGhvZCxlLnVybD10aGlzLnVybCx0aGlzLmNhbGxiYWNrKGUpfSxmLnByb3RvdHlwZS5fdGltZW91dEVycm9yPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5fdGltZW91dCx0PW5ldyBFcnJvcihcInRpbWVvdXQgb2YgXCIrZStcIm1zIGV4Y2VlZGVkXCIpO3QudGltZW91dD1lLHRoaXMuY2FsbGJhY2sodCl9LGYucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZz1mdW5jdGlvbigpe3ZhciBlPXRoaXMuX3F1ZXJ5LmpvaW4oXCImXCIpO2UmJih0aGlzLnVybCs9fnRoaXMudXJsLmluZGV4T2YoXCI/XCIpP1wiJlwiK2U6XCI/XCIrZSl9LGYucHJvdG90eXBlLmVuZD1mdW5jdGlvbihlKXt2YXIgdD10aGlzLG49dGhpcy54aHI9Yi5nZXRYSFIoKSxpPXRoaXMuX3RpbWVvdXQscz10aGlzLl9mb3JtRGF0YXx8dGhpcy5fZGF0YTt0aGlzLl9jYWxsYmFjaz1lfHxyLG4ub25yZWFkeXN0YXRlY2hhbmdlPWZ1bmN0aW9uKCl7aWYoND09bi5yZWFkeVN0YXRlKXt2YXIgZTt0cnl7ZT1uLnN0YXR1c31jYXRjaCh0KXtlPTB9aWYoMD09ZSl7aWYodC50aW1lZG91dClyZXR1cm4gdC5fdGltZW91dEVycm9yKCk7aWYodC5fYWJvcnRlZClyZXR1cm47cmV0dXJuIHQuY3Jvc3NEb21haW5FcnJvcigpfXQuZW1pdChcImVuZFwiKX19O3ZhciBvPWZ1bmN0aW9uKGUsbil7bi50b3RhbD4wJiYobi5wZXJjZW50PW4ubG9hZGVkL24udG90YWwqMTAwKSxuLmRpcmVjdGlvbj1lLHQuZW1pdChcInByb2dyZXNzXCIsbil9O2lmKHRoaXMuaGFzTGlzdGVuZXJzKFwicHJvZ3Jlc3NcIikpdHJ5e24ub25wcm9ncmVzcz1vLmJpbmQobnVsbCxcImRvd25sb2FkXCIpLG4udXBsb2FkJiYobi51cGxvYWQub25wcm9ncmVzcz1vLmJpbmQobnVsbCxcInVwbG9hZFwiKSl9Y2F0Y2goZSl7fWlmKGkmJiF0aGlzLl90aW1lciYmKHRoaXMuX3RpbWVyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXt0LnRpbWVkb3V0PSEwLHQuYWJvcnQoKX0saSkpLHRoaXMuX2FwcGVuZFF1ZXJ5U3RyaW5nKCksdGhpcy51c2VybmFtZSYmdGhpcy5wYXNzd29yZD9uLm9wZW4odGhpcy5tZXRob2QsdGhpcy51cmwsITAsdGhpcy51c2VybmFtZSx0aGlzLnBhc3N3b3JkKTpuLm9wZW4odGhpcy5tZXRob2QsdGhpcy51cmwsITApLHRoaXMuX3dpdGhDcmVkZW50aWFscyYmKG4ud2l0aENyZWRlbnRpYWxzPSEwKSxcIkdFVFwiIT10aGlzLm1ldGhvZCYmXCJIRUFEXCIhPXRoaXMubWV0aG9kJiZcInN0cmluZ1wiIT10eXBlb2YgcyYmIXRoaXMuX2lzSG9zdChzKSl7dmFyIGE9dGhpcy5faGVhZGVyW1wiY29udGVudC10eXBlXCJdLGM9dGhpcy5fc2VyaWFsaXplcnx8Yi5zZXJpYWxpemVbYT9hLnNwbGl0KFwiO1wiKVswXTpcIlwiXTshYyYmdShhKSYmKGM9Yi5zZXJpYWxpemVbXCJhcHBsaWNhdGlvbi9qc29uXCJdKSxjJiYocz1jKHMpKX1mb3IodmFyIGwgaW4gdGhpcy5oZWFkZXIpbnVsbCE9dGhpcy5oZWFkZXJbbF0mJm4uc2V0UmVxdWVzdEhlYWRlcihsLHRoaXMuaGVhZGVyW2xdKTtyZXR1cm4gdGhpcy5fcmVzcG9uc2VUeXBlJiYobi5yZXNwb25zZVR5cGU9dGhpcy5fcmVzcG9uc2VUeXBlKSx0aGlzLmVtaXQoXCJyZXF1ZXN0XCIsdGhpcyksbi5zZW5kKHZvaWQgMCE9PXM/czpudWxsKSx0aGlzfSxiLlJlcXVlc3Q9ZixiLmdldD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIkdFVFwiLGUpO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1udWxsKSx0JiZyLnF1ZXJ5KHQpLG4mJnIuZW5kKG4pLHJ9LGIuaGVhZD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIkhFQURcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIub3B0aW9ucz1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIk9QVElPTlNcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIuZGVsPWQsYi5kZWxldGU9ZCxiLnBhdGNoPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiUEFUQ0hcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIucG9zdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9YihcIlBPU1RcIixlKTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0JiYobj10LHQ9bnVsbCksdCYmci5zZW5kKHQpLG4mJnIuZW5kKG4pLHJ9LGIucHV0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1iKFwiUFVUXCIsZSk7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdCYmKG49dCx0PW51bGwpLHQmJnIuc2VuZCh0KSxuJiZyLmVuZChuKSxyfX0sZnVuY3Rpb24oZSx0LG4pe2Z1bmN0aW9uIHIoZSl7aWYoZSlyZXR1cm4gaShlKX1mdW5jdGlvbiBpKGUpe2Zvcih2YXIgdCBpbiByLnByb3RvdHlwZSllW3RdPXIucHJvdG90eXBlW3RdO3JldHVybiBlfWUuZXhwb3J0cz1yLHIucHJvdG90eXBlLm9uPXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc3x8e30sKHRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXT10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV18fFtdKS5wdXNoKHQpLHRoaXN9LHIucHJvdG90eXBlLm9uY2U9ZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKCl7dGhpcy5vZmYoZSxuKSx0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gbi5mbj10LHRoaXMub24oZSxuKSx0aGlzfSxyLnByb3RvdHlwZS5vZmY9ci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI9ci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzPXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oZSx0KXtpZih0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSwwPT1hcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9jYWxsYmFja3M9e30sdGhpczt2YXIgbj10aGlzLl9jYWxsYmFja3NbXCIkXCIrZV07aWYoIW4pcmV0dXJuIHRoaXM7aWYoMT09YXJndW1lbnRzLmxlbmd0aClyZXR1cm4gZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXSx0aGlzO2Zvcih2YXIgcixpPTA7aTxuLmxlbmd0aDtpKyspaWYoKHI9bltpXSk9PT10fHxyLmZuPT09dCl7bi5zcGxpY2UoaSwxKTticmVha31yZXR1cm4gdGhpc30sci5wcm90b3R5cGUuZW1pdD1mdW5jdGlvbihlKXt0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fTt2YXIgdD1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSxuPXRoaXMuX2NhbGxiYWNrc1tcIiRcIitlXTtpZihuKXtuPW4uc2xpY2UoMCk7Zm9yKHZhciByPTAsaT1uLmxlbmd0aDtyPGk7KytyKW5bcl0uYXBwbHkodGhpcyx0KX1yZXR1cm4gdGhpc30sci5wcm90b3R5cGUubGlzdGVuZXJzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9jYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzfHx7fSx0aGlzLl9jYWxsYmFja3NbXCIkXCIrZV18fFtdfSxyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnM9ZnVuY3Rpb24oZSl7cmV0dXJuISF0aGlzLmxpc3RlbmVycyhlKS5sZW5ndGh9fSxmdW5jdGlvbihlLHQsbil7dmFyIHI9big0Nik7dC5jbGVhclRpbWVvdXQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdGltZW91dD0wLGNsZWFyVGltZW91dCh0aGlzLl90aW1lciksdGhpc30sdC5wYXJzZT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5fcGFyc2VyPWUsdGhpc30sdC5zZXJpYWxpemU9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3NlcmlhbGl6ZXI9ZSx0aGlzfSx0LnRpbWVvdXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuX3RpbWVvdXQ9ZSx0aGlzfSx0LnRoZW49ZnVuY3Rpb24oZSx0KXtpZighdGhpcy5fZnVsbGZpbGxlZFByb21pc2Upe3ZhciBuPXRoaXM7dGhpcy5fZnVsbGZpbGxlZFByb21pc2U9bmV3IFByb21pc2UoZnVuY3Rpb24oZSx0KXtuLmVuZChmdW5jdGlvbihuLHIpe24/dChuKTplKHIpfSl9KX1yZXR1cm4gdGhpcy5fZnVsbGZpbGxlZFByb21pc2UudGhlbihlLHQpfSx0LmNhdGNoPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLnRoZW4odm9pZCAwLGUpfSx0LnVzZT1mdW5jdGlvbihlKXtyZXR1cm4gZSh0aGlzKSx0aGlzfSx0LmdldD1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV19LHQuZ2V0SGVhZGVyPXQuZ2V0LHQuc2V0PWZ1bmN0aW9uKGUsdCl7aWYocihlKSl7Zm9yKHZhciBuIGluIGUpdGhpcy5zZXQobixlW25dKTtyZXR1cm4gdGhpc31yZXR1cm4gdGhpcy5faGVhZGVyW2UudG9Mb3dlckNhc2UoKV09dCx0aGlzLmhlYWRlcltlXT10LHRoaXN9LHQudW5zZXQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZS50b0xvd2VyQ2FzZSgpXSxkZWxldGUgdGhpcy5oZWFkZXJbZV0sdGhpc30sdC5maWVsZD1mdW5jdGlvbihlLHQpe2lmKG51bGw9PT1lfHx2b2lkIDA9PT1lKXRocm93IG5ldyBFcnJvcihcIi5maWVsZChuYW1lLCB2YWwpIG5hbWUgY2FuIG5vdCBiZSBlbXB0eVwiKTtpZihyKGUpKXtmb3IodmFyIG4gaW4gZSl0aGlzLmZpZWxkKG4sZVtuXSk7cmV0dXJuIHRoaXN9aWYobnVsbD09PXR8fHZvaWQgMD09PXQpdGhyb3cgbmV3IEVycm9yKFwiLmZpZWxkKG5hbWUsIHZhbCkgdmFsIGNhbiBub3QgYmUgZW1wdHlcIik7cmV0dXJuIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGUsdCksdGhpc30sdC5hYm9ydD1mdW5jdGlvbigpe3JldHVybiB0aGlzLl9hYm9ydGVkP3RoaXM6KHRoaXMuX2Fib3J0ZWQ9ITAsdGhpcy54aHImJnRoaXMueGhyLmFib3J0KCksdGhpcy5yZXEmJnRoaXMucmVxLmFib3J0KCksdGhpcy5jbGVhclRpbWVvdXQoKSx0aGlzLmVtaXQoXCJhYm9ydFwiKSx0aGlzKX0sdC53aXRoQ3JlZGVudGlhbHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd2l0aENyZWRlbnRpYWxzPSEwLHRoaXN9LHQucmVkaXJlY3RzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9tYXhSZWRpcmVjdHM9ZSx0aGlzfSx0LnRvSlNPTj1mdW5jdGlvbigpe3JldHVybnttZXRob2Q6dGhpcy5tZXRob2QsdXJsOnRoaXMudXJsLGRhdGE6dGhpcy5fZGF0YSxoZWFkZXJzOnRoaXMuX2hlYWRlcn19LHQuX2lzSG9zdD1mdW5jdGlvbihlKXtzd2l0Y2goe30udG9TdHJpbmcuY2FsbChlKSl7Y2FzZVwiW29iamVjdCBGaWxlXVwiOmNhc2VcIltvYmplY3QgQmxvYl1cIjpjYXNlXCJbb2JqZWN0IEZvcm1EYXRhXVwiOnJldHVybiEwO2RlZmF1bHQ6cmV0dXJuITF9fSx0LnNlbmQ9ZnVuY3Rpb24oZSl7dmFyIHQ9cihlKSxuPXRoaXMuX2hlYWRlcltcImNvbnRlbnQtdHlwZVwiXTtpZih0JiZyKHRoaXMuX2RhdGEpKWZvcih2YXIgaSBpbiBlKXRoaXMuX2RhdGFbaV09ZVtpXTtlbHNlXCJzdHJpbmdcIj09dHlwZW9mIGU/KG58fHRoaXMudHlwZShcImZvcm1cIiksbj10aGlzLl9oZWFkZXJbXCJjb250ZW50LXR5cGVcIl0sdGhpcy5fZGF0YT1cImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiPT1uP3RoaXMuX2RhdGE/dGhpcy5fZGF0YStcIiZcIitlOmU6KHRoaXMuX2RhdGF8fFwiXCIpK2UpOnRoaXMuX2RhdGE9ZTtyZXR1cm4hdHx8dGhpcy5faXNIb3N0KGUpP3RoaXM6KG58fHRoaXMudHlwZShcImpzb25cIiksdGhpcyl9fSxmdW5jdGlvbihlLHQpe2Z1bmN0aW9uIG4oZSl7cmV0dXJuIG51bGwhPT1lJiZcIm9iamVjdFwiPT10eXBlb2YgZX1lLmV4cG9ydHM9bn0sZnVuY3Rpb24oZSx0KXtmdW5jdGlvbiBuKGUsdCxuKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuP25ldyBlKFwiR0VUXCIsdCkuZW5kKG4pOjI9PWFyZ3VtZW50cy5sZW5ndGg/bmV3IGUoXCJHRVRcIix0KTpuZXcgZSh0LG4pfWUuZXhwb3J0cz1ufV0pfSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuLy8gQWxsb3dzIHVzIHRvIGNyZWF0ZSBhbmQgYmluZCB0byBldmVudHMuIEV2ZXJ5dGhpbmcgaW4gT0NGIGlzIGFuIGV2ZW50XG4vLyBlbWl0dGVyXG5jb25zdCBFdmVudEVtaXR0ZXIyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMicpLkV2ZW50RW1pdHRlcjI7XG5cbmNvbnN0IFB1Yk51YiA9IHJlcXVpcmUoJ3B1Ym51YicpO1xuXG4vLyBhbGxvd3MgYSBzeW5jaHJvbm91cyBleGVjdXRpb24gZmxvdy5cbmNvbnN0IHdhdGVyZmFsbCA9IHJlcXVpcmUoJ2FzeW5jL3dhdGVyZmFsbCcpO1xuXG4vKipcbiogR2xvYmFsIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBPQ0YuXG4qXG4qIEBjbGFzcyBPcGVuQ2hhdEZyYW1ld29ya1xuKiBAY29uc3RydWN0b3JcbiogQHBhcmFtIHtPYmplY3R9IGZvbyBBcmd1bWVudCAxXG4qIEBwYXJhbSBjb25maWcucHVibnViIHtPYmplY3R9IE9DRiBpcyBiYXNlZCBvZmYgUHViTnViLiBTdXBwbHkgeW91ciBQdWJOdWIgY29uZmlnIGhlcmUuXG4qIEBwYXJhbSBjb25maWcuZ2xvYmFsQ2hhbm5lbCB7U3RyaW5nfSBoaXMgaXMgdGhlIGdsb2JhbCBjaGFubmVsIHRoYXQgYWxsIGNsaWVudHMgYXJlIGNvbm5lY3RlZCB0byBhdXRvbWF0aWNhbGx5LiBJdCdzIHVzZWQgZm9yIGdsb2JhbCBhbm5vdW5jZW1lbnRzLCBnbG9iYWwgcHJlc2VuY2UsIGV0Yy5cbiogQHJldHVybiB7T2JqZWN0fSBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIE9DRlxuKi9cblxuY29uc3QgY3JlYXRlID0gZnVuY3Rpb24ocG5Db25maWcsIGdsb2JhbENoYW5uZWwgPSAnb2NmLWdsb2JhbCcpIHtcblxuICAgIGxldCBPQ0YgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICogQ29uZmlndXJlcyBhbiBldmVudCBlbWl0dGVyIHRoYXQgb3RoZXIgT0NGIG9iamVjdHMgaW5oZXJpdC4gQWRkcyBzaG9ydGN1dCBtZXRob2RzIGZvclxuICAgICogYGBgdGhpcy5vbigpYGBgLCBgYGB0aGlzLmVtaXQoKWBgYCwgZXRjLlxuICAgICpcbiAgICAqIEBjbGFzcyBSb290RW1pdHRlclxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBjbGFzcyBSb290RW1pdHRlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBlZTJcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIyKHtcbiAgICAgICAgICAgICAgd2lsZGNhcmQ6IHRydWUsXG4gICAgICAgICAgICAgIG5ld0xpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgICBtYXhMaXN0ZW5lcnM6IDUwLFxuICAgICAgICAgICAgICB2ZXJib3NlTWVtb3J5TGVhazogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHdlIGJpbmQgdG8gbWFrZSBzdXJlIHdpbGRjYXJkcyB3b3JrXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXN5bmNseS9FdmVudEVtaXR0ZXIyL2lzc3Vlcy8xODZcbiAgICAgICAgICAgIHRoaXMuX2VtaXQgPSB0aGlzLmVtaXR0ZXIuZW1pdC5iaW5kKHRoaXMuZW1pdHRlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMaXN0ZW4gZm9yIGEgc3BlY2lmaWMgZXZlbnQgYW5kIGZpcmUgYSBjYWxsYmFjayB3aGVuIGl0J3MgZW1pdHRlZFxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAbWV0aG9kIG9uXG4gICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLm9uID0gdGhpcy5lbWl0dGVyLm9uLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgdGhpcy5vZmYgPSB0aGlzLmVtaXR0ZXIub2ZmLmJpbmQodGhpcy5lbWl0dGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIExpc3RlbiBmb3IgYW55IGV2ZW50IG9uIHRoaXMgb2JqZWN0IGFuZCBmaXJlIGEgY2FsbGJhY2sgd2hlbiBpdCdzIGVtaXR0ZWRcbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQG1ldGhvZCBvbkFueVxuICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gYW55IGV2ZW50IGlzIGVtaXR0ZWQuIEZpcnN0IHBhcmFtZXRlciBpcyB0aGUgZXZlbnQgbmFtZSBhbmQgc2Vjb25kIGlzIHRoZSBwYXlsb2FkLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMub25BbnkgPSB0aGlzLmVtaXR0ZXIub25BbnkuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogTGlzdGVuIGZvciBhbiBldmVudCBhbmQgb25seSBmaXJlIHRoZSBjYWxsYmFjayBhIHNpbmdsZSB0aW1lXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBtZXRob2Qgb25jZVxuICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHJ1biBvbmNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5vbmNlID0gdGhpcy5lbWl0dGVyLm9uY2UuYmluZCh0aGlzLmVtaXR0ZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICogQW4gT0NGIGdlbmVyaWMgZW1pdHRlciB0aGF0IHN1cHBvcnRzIHBsdWdpbnMgYW5kIGZvcndhcmRzXG4gICAgKiBldmVudHMgdG8gYSBnbG9iYWwgZW1pdHRlci5cbiAgICAqXG4gICAgKiBAY2xhc3MgRW1pdHRlclxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAZXh0ZW5kcyBSb290RW1pdHRlclxuICAgICovXG4gICAgY2xhc3MgRW1pdHRlciBleHRlbmRzIFJvb3RFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAgICAgLy8gZW1pdCBhbiBldmVudCBmcm9tIHRoaXMgb2JqZWN0XG4gICAgICAgICAgICB0aGlzLl9lbWl0ID0gKGV2ZW50LCBkYXRhKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBhbGwgZXZlbnRzIGFyZSBmb3J3YXJkZWQgdG8gT0NGIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIHNvIHlvdSBjYW4gZ2xvYmFsbHkgYmluZCB0byBldmVudHMgd2l0aCBPQ0Yub24oKVxuICAgICAgICAgICAgICAgIE9DRi5fZW1pdChldmVudCwgZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBlbWl0IHRoZSBldmVudCBmcm9tIHRoZSBvYmplY3QgdGhhdCBjcmVhdGVkIGl0XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoZXZlbnQsIGRhdGEpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFzc2lnbiB0aGUgbGlzdCBvZiBwbHVnaW5zIGZvciB0aGlzIHNjb3BlXG4gICAgICAgICAgICB0aGlzLnBsdWdpbnMgPSBbXTtcblxuICAgICAgICAgICAgLy8gYmluZCBhIHBsdWdpbiB0byB0aGlzIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5wbHVnaW4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2lucy5wdXNoKG1vZHVsZSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjbGFzc1xuICAgICAgICAgICAgICAgIGxldCBjbGFzc05hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBzZWUgaWYgdGhlcmUgYXJlIHBsdWdpbnMgdG8gYXR0YWNoIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICBpZihtb2R1bGUuZXh0ZW5kcyAmJiBtb2R1bGUuZXh0ZW5kc1tjbGFzc05hbWVdKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYXR0YWNoIHRoZSBwbHVnaW5zIHRvIHRoaXMgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgLy8gdW5kZXIgdGhlaXIgbmFtZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIE9DRi5hZGRDaGlsZCh0aGlzLCBtb2R1bGUubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG1vZHVsZS5leHRlbmRzW2NsYXNzTmFtZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uT0NGID0gT0NGO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBwbHVnaW4gaGFzIGEgc3BlY2lhbCBjb25zdHJ1Y3QgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gcnVuIGl0XG5cbiAgICAgICAgICAgICAgICAgICAgaWYodGhpc1ttb2R1bGUubmFtZXNwYWNlXS5jb25zdHJ1Y3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbbW9kdWxlLm5hbWVzcGFjZV0uY29uc3RydWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBUaGlzIGlzIHRoZSByb290IHt7I2Nyb3NzTGluayBcIkNoYXRcIn19e3svY3Jvc3NMaW5rfX0gY2xhc3MgdGhhdCByZXByZXNlbnRzIGEgY2hhdCByb29tXG4gICAgKlxuICAgICogQGNsYXNzIENoYXRcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHBhcmFtIHtTdHJpbmd9IGNoYW5uZWwgVGhlIGNoYW5uZWwgbmFtZSBmb3IgdGhlIENoYXRcbiAgICAqIEBleHRlbmRzIEVtaXR0ZXJcbiAgICAqL1xuICAgIGNsYXNzIENoYXQgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgICAgICBjb25zdHJ1Y3RvcihjaGFubmVsKSB7XG5cbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBUaGUgY2hhbm5lbCBuYW1lIGZvciB0aGlzIHt7I2Nyb3NzTGluayBcIkNoYXRcIn19e3svY3Jvc3NMaW5rfX1cbiAgICAgICAgICAgICpcbiAgICAgICAgICAgICogQHByb3BlcnR5IGNoYW5uZWxcbiAgICAgICAgICAgICogQHR5cGUgU3RyaW5nXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEEgbGlzdCBvZiB1c2VycyBpbiB0aGlzIHt7I2Nyb3NzTGluayBcIkNoYXRcIn19e3svY3Jvc3NMaW5rfX0uIEF1dG9tYXRpY2FsbHkga2VwdCBpbiBzeW5jLFxuICAgICAgICAgICAgKiBVc2UgYGBgQ2hhdC5vbignJG9jZi5qb2luJylgYGAgYW5kIHJlbGF0ZWQgZXZlbnRzIHRvIGdldCBub3RpZmllZCB3aGVuIHRoaXMgY2hhbmdlc1xuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgdXNlcnNcbiAgICAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy51c2VycyA9IHt9O1xuXG4gICAgICAgICAgICAvLyB3aGVuZXZlciB3ZSBnZXQgYSBtZXNzYWdlIGZyb20gdGhlIG5ldHdvcmtcbiAgICAgICAgICAgIC8vIHJ1biBsb2NhbCB0cmlnZ2VyIG1lc3NhZ2VcblxuICAgICAgICAgICAgdGhpcy5vbkhlcmVOb3cgPSAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYoc3RhdHVzLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlcmUgd2FzIGEgcHJvYmxlbSBmZXRjaGluZyBoZXJlLicsIHN0YXR1cy5lcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBsaXN0IG9mIG9jY3VwYW50cyBpbiB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9jY3VwYW50cyA9IHJlc3BvbnNlLmNoYW5uZWxzW3RoaXMuY2hhbm5lbF0ub2NjdXBhbnRzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCB0aGUgdXNlckxpc3QgZm9yIHJsdG0uanMgc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIG9jY3VwYW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51c2VyVXBkYXRlKG9jY3VwYW50c1tpXS51dWlkLCBvY2N1cGFudHNbaV0uc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub25TdGF0dXMgPSAoc3RhdHVzRXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXNFdmVudC5jYXRlZ29yeSA9PT0gXCJQTkNvbm5lY3RlZENhdGVnb3J5XCIpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZihzdGF0dXNFdmVudC5hZmZlY3RlZENoYW5uZWxzLmluZGV4T2YodGhpcy5jaGFubmVsKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyRvY2YucmVhZHknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZSA9IChtKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBtZXNzYWdlIGlzIHNlbnQgdG8gdGhpcyBzcGVjaWZpYyBjaGFubmVsXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IG0uY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIobS5tZXNzYWdlWzBdLCBtLm1lc3NhZ2VbMV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vblByZXNlbmNlID0gKHByZXNlbmNlRXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBjaGFubmVsIG1hdGNoZXMgdGhpcyBjaGFubmVsXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jaGFubmVsID09IHByZXNlbmNlRXZlbnQuY2hhbm5lbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgam9pbnMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcImpvaW5cIikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXNlciA9IHRoaXMuY3JlYXRlVXNlcihwcmVzZW5jZUV2ZW50LnV1aWQsIHByZXNlbmNlRXZlbnQuc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IGhhcyBqb2luZWQgdGhlIHJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50ICRvY2Yuam9pblxuICAgICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcGF5bG9hZC51c2VyIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgY2FtZSBvbmxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyRvY2Yuam9pbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiB1c2VyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZW9uZSBsZWF2ZXMgY2hhbm5lbFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcImxlYXZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlckxlYXZlKHByZXNlbmNlRXZlbnQudXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIHRpbWVzb3V0XG4gICAgICAgICAgICAgICAgICAgIGlmKHByZXNlbmNlRXZlbnQuYWN0aW9uID09IFwidGltZW91dFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJEaXNjb25uZWN0KHByZXNlbmNlRXZlbnQudXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lJ3Mgc3RhdGUgaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgICAgICBpZihwcmVzZW5jZUV2ZW50LmFjdGlvbiA9PSBcInN0YXRlLWNoYW5nZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJVcGRhdGUocHJlc2VuY2VFdmVudC51dWlkLCBwcmVzZW5jZUV2ZW50LnN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIHVzZXJzIG9ubGluZSBub3dcbiAgICAgICAgICAgIC8vIGFzayBQdWJOdWIgZm9yIGluZm9ybWF0aW9uIGFib3V0IGNvbm5lY3RlZCB1c2VycyBpbiB0aGlzIGNoYW5uZWxcbiAgICAgICAgICAgIE9DRi5wdWJudWIuaGVyZU5vdyh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVVVUlEczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU3RhdGU6IHRydWVcbiAgICAgICAgICAgIH0sIHRoaXMub25IZXJlTm93KTtcblxuICAgICAgICAgICAgT0NGLnB1Ym51Yi5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiB0aGlzLm9uU3RhdHVzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMub25NZXNzYWdlLFxuICAgICAgICAgICAgICAgIHByZXNlbmNlOiB0aGlzLm9uUHJlc2VuY2VcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBPQ0YucHVibnViLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHM6IFt0aGlzLmNoYW5uZWxdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogU2VuZCBldmVudHMgdG8gb3RoZXIgY2xpZW50cyBpbiB0aGlzIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0uXG4gICAgICAgICogRXZlbnRzIGFyZSB0cmlnZ2VyIG92ZXIgdGhlIG5ldHdvcmsgIGFuZCBhbGwgZXZlbnRzIGFyZSBtYWRlXG4gICAgICAgICogb24gYmVoYWxmIG9mIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319XG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGVtaXRcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZXZlbnQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgKi9cbiAgICAgICAgZW1pdChldmVudCwgZGF0YSkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBzdGFuZGFyZGl6ZWQgcGF5bG9hZCBvYmplY3RcbiAgICAgICAgICAgIGxldCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsICAgICAgICAgICAgLy8gdGhlIGRhdGEgc3VwcGxpZWQgZnJvbSBwYXJhbXNcbiAgICAgICAgICAgICAgICBzZW5kZXI6IE9DRi5tZS51dWlkLCAgIC8vIG15IG93biB1dWlkXG4gICAgICAgICAgICAgICAgY2hhdDogdGhpcywgICAgICAgICAgICAvLyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNoYXRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIHJ1biB0aGUgcGx1Z2luIHF1ZXVlIHRvIG1vZGlmeSB0aGUgZXZlbnRcbiAgICAgICAgICAgIHRoaXMucnVuUGx1Z2luUXVldWUoJ2VtaXQnLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNoYXQgb3RoZXJ3aXNlIGl0IHdvdWxkIGJlIHNlcmlhbGl6ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkLCBpdCdzIHJlYnVpbHQgb24gdGhlIG90aGVyIGVuZC5cbiAgICAgICAgICAgICAgICAvLyBzZWUgdGhpcy50cmlnZ2VyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHBheWxvYWQuY2hhdDtcblxuICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2ggdGhlIGV2ZW50IGFuZCBkYXRhIG92ZXIgdGhlIGNvbmZpZ3VyZWQgY2hhbm5lbFxuXG4gICAgICAgICAgICAgICAgT0NGLnB1Ym51Yi5wdWJsaXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogW2V2ZW50LCBwYXlsb2FkXSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jaGFubmVsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIEJyb2FkY2FzdHMgYW4gZXZlbnQgbG9jYWxseSB0byBhbGwgbGlzdGVuZXJzLlxuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCB0cmlnZ2VyXG4gICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQgVGhlIGV2ZW50IHBheWxvYWQgb2JqZWN0XG4gICAgICAgICovXG4gICAgICAgIHRyaWdnZXIoZXZlbnQsIHBheWxvYWQpIHtcblxuICAgICAgICAgICAgaWYodHlwZW9mIHBheWxvYWQgPT0gXCJvYmplY3RcIikge1xuXG4gICAgICAgICAgICAgICAgLy8gcmVzdG9yZSBjaGF0IGluIHBheWxvYWRcbiAgICAgICAgICAgICAgICBpZighcGF5bG9hZC5jaGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuY2hhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdHVybiBhIHV1aWQgZm91bmQgaW4gcGF5bG9hZC5zZW5kZXIgdG8gYSByZWFsIHVzZXJcbiAgICAgICAgICAgICAgICBpZihwYXlsb2FkLnNlbmRlciAmJiBPQ0YudXNlcnNbcGF5bG9hZC5zZW5kZXJdKSB7XG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuc2VuZGVyID0gT0NGLnVzZXJzW3BheWxvYWQuc2VuZGVyXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbGV0IHBsdWdpbnMgbW9kaWZ5IHRoZSBldmVudFxuICAgICAgICAgICAgdGhpcy5ydW5QbHVnaW5RdWV1ZSgnb24nLCBldmVudCwgKG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHBheWxvYWQpO1xuICAgICAgICAgICAgfSwgKGVyciwgcGF5bG9hZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgLy8gZW1pdCB0aGlzIGV2ZW50IHRvIGFueSBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnQsIHBheWxvYWQpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBBZGQgYSB1c2VyIHRvIHRoZSB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319LCBjcmVhdGluZyBpdCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QuXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGNyZWF0ZVVzZXJcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXNlciB1dWlkXG4gICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRlIFRoZSB1c2VyIGluaXRpYWwgc3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRyaWdnZXIgRm9yY2UgYSB0cmlnZ2VyIHRoYXQgdGhpcyB1c2VyIGlzIG9ubGluZVxuICAgICAgICAqL1xuICAgICAgICBjcmVhdGVVc2VyKHV1aWQsIHN0YXRlLCB0cmlnZ2VyID0gZmFsc2UpIHtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhpcyB1c2VyIGV4aXN0cyBpbiB0aGUgZ2xvYmFsIGxpc3RcbiAgICAgICAgICAgIC8vIHNvIHdlIGNhbiByZWZlcmVuY2UgaXQgZnJvbSBoZXJlIG91dFxuICAgICAgICAgICAgT0NGLnVzZXJzW3V1aWRdID0gT0NGLnVzZXJzW3V1aWRdIHx8IG5ldyBVc2VyKHV1aWQpO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhpcyBjaGF0cm9vbSB0byB0aGUgdXNlcidzIGxpc3Qgb2YgY2hhdHNcbiAgICAgICAgICAgIE9DRi51c2Vyc1t1dWlkXS5hZGRDaGF0KHRoaXMsIHN0YXRlKTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgam9pbiBldmVudCBvdmVyIHRoaXMgY2hhdHJvb21cbiAgICAgICAgICAgIGlmKCF0aGlzLnVzZXJzW3V1aWRdIHx8IHRyaWdnZXIpIHtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IGhhcyBjb21lIG9ubGluZVxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkb2NmLm9ubGluZVxuICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBheWxvYWQudXNlciBUaGUge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSB0aGF0IGNhbWUgb25saW5lXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyRvY2Yub25saW5lJywge1xuICAgICAgICAgICAgICAgICAgICB1c2VyOiBPQ0YudXNlcnNbdXVpZF1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGlzIHVzZXIgaW4gdGhlIGNoYXRyb29tXG4gICAgICAgICAgICB0aGlzLnVzZXJzW3V1aWRdID0gT0NGLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIGluc3RhbmNlIG9mIHRoaXMgdXNlclxuICAgICAgICAgICAgcmV0dXJuIE9DRi51c2Vyc1t1dWlkXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQHByaXZhdGVcbiAgICAgICAgKiBVcGRhdGUgYSB1c2VyJ3Mgc3RhdGUgd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgdXNlclVwZGF0ZVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHV1aWRcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgU3RhdGUgdG8gdXBkYXRlIGZvciB0aGUgdXNlclxuICAgICAgICAqL1xuICAgICAgICB1c2VyVXBkYXRlKHV1aWQsIHN0YXRlKSB7XG5cbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgdXNlciBleGlzdHMgd2l0aGluIHRoZSBnbG9iYWwgc3BhY2VcbiAgICAgICAgICAgIE9DRi51c2Vyc1t1dWlkXSA9IE9DRi51c2Vyc1t1dWlkXSB8fCBuZXcgVXNlcih1dWlkKTtcblxuICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3Qga25vdyBhYm91dCB0aGlzIHVzZXJcbiAgICAgICAgICAgIGlmKCF0aGlzLnVzZXJzW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgLy8gZG8gdGhlIHdob2xlIGpvaW4gdGhpbmdcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVVzZXIodXVpZCwgc3RhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhpcyB1c2VyJ3Mgc3RhdGUgaW4gdGhpcyBjaGF0cm9vbVxuICAgICAgICAgICAgdGhpcy51c2Vyc1t1dWlkXS5hc3NpZ24oc3RhdGUsIHRoaXMpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogQnJvYWRjYXN0IHRoYXQgYSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IGhhcyBjaGFuZ2VkIHN0YXRlXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBldmVudCAkb2NmLnN0YXRlXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXlsb2FkLnVzZXIgVGhlIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0gdGhhdCBjaGFuZ2VkIHN0YXRlXG4gICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXlsb2FkLnN0YXRlIFRoZSBuZXcgdXNlciBzdGF0ZSBmb3IgdGhpcyBgYGBDaGF0YGBgXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckb2NmLnN0YXRlJywge1xuICAgICAgICAgICAgICAgIHVzZXI6IHRoaXMudXNlcnNbdXVpZF0sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHRoaXMudXNlcnNbdXVpZF0uc3RhdGUodGhpcylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogTGVhdmUgZnJvbSB0aGUge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fSBvbiBiZWhhbGYgb2Yge3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX1cbiAgICAgICAgICpcbiAgICAgICAgICogQG1ldGhvZCBsZWF2ZVxuICAgICAgICAgKi9cbiAgICAgICAgbGVhdmUoKSB7XG5cbiAgICAgICAgICAgIE9DRi5wdWJudWIudW5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzOiBbdGhpcy5jaGFubmVsXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBQZXJmb3JtIHVwZGF0ZXMgd2hlbiBhIHVzZXIgaGFzIGxlZnQgdGhlIHt7I2Nyb3NzTGluayBcIkNoYXRcIn19e3svY3Jvc3NMaW5rfX0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgbGVhdmVcbiAgICAgICAgICovXG4gICAgICAgIHVzZXJMZWF2ZSh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhIHVzZXIgbGVhdmVzLCB0cmlnZ2VyIHRoZSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJG9jZi5sZWF2ZScsIHRoaXMudXNlcnNbdXVpZF0pO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcignJG9jZi5vZmZsaW5lJywgdGhpcy51c2Vyc1t1dWlkXSk7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgbG9jYWwgbGlzdCBvZiB1c2Vyc1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnVzZXJzW3V1aWRdO1xuXG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgcmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlIGdsb2JhbCBsaXN0LFxuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhleSBtYXkgYmUgb25saW5lIGluIG90aGVyIGNoYW5uZWxzXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGF0IHVzZXIgaXNuJ3QgaW4gdGhlIHVzZXIgbGlzdFxuICAgICAgICAgICAgICAgIC8vIHdlIG5ldmVyIGtuZXcgYWJvdXQgdGhpcyB1c2VyIG9yIHRoZXkgYWxyZWFkeSBsZWZ0XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXNlciBhbHJlYWR5IGxlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogRmlyZWQgd2hlbiBhIHVzZXIgZGlzY29ubmVjdHMgZnJvbSB0aGUge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCB1c2VyRGlzY29ubmVjdFxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1dWlkIFRoZSB1dWlkIG9mIHRoZSB7eyNjcm9zc0xpbmsgXCJDaGF0XCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgbGVmdFxuICAgICAgICAqL1xuICAgICAgICB1c2VyRGlzY29ubmVjdCh1dWlkKSB7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGV2ZW50IGlzIHJlYWwsIHVzZXIgbWF5IGhhdmUgYWxyZWFkeSBsZWZ0XG4gICAgICAgICAgICBpZih0aGlzLnVzZXJzW3V1aWRdKSB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAqIEEge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgYGBgQ2hhdGBgYFxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkb2NmLmRpc2Nvbm5lY3RcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBVc2VyIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgZGlzY29ubmVjdGVkXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJyRvY2YuZGlzY29ubmVjdCcsIHRoaXMudXNlcnNbdXVpZF0pO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgKiBBIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0gaGFzIGdvbmUgb2ZmbGluZVxuICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAqIEBldmVudCAkb2NmLm9mZmxpbmVcbiAgICAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBVc2VyIFRoZSB7eyNjcm9zc0xpbmsgXCJVc2VyXCJ9fXt7L2Nyb3NzTGlua319IHRoYXQgaGFzIGdvbmUgb2ZmbGluZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCckb2NmLm9mZmxpbmUnLCB0aGlzLnVzZXJzW3V1aWRdKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIExvYWQgcGx1Z2lucyBhbmQgYXR0YWNoIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIGV4ZWN1dGUgYmVmb3JlIGFuZFxuICAgICAgICAqIGFmdGVyIGV2ZW50cyBhcmUgdHJpZ2dlciBvciByZWNlaXZlZC5cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2QgcnVuUGx1Z2luUXVldWVcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbG9jYXRpb24gV2hlcmUgaW4gdGhlIG1pZGRsZWV3YXJlIHRoZSBldmVudCBzaG91bGQgcnVuIChlbWl0LCB0cmlnZ2VyKVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaXJzdCBUaGUgZmlyc3QgZnVuY3Rpb24gdG8gcnVuIGJlZm9yZSB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBsYXN0IFRoZSBsYXN0IGZ1bmN0aW9uIHRvIHJ1biBhZnRlciB0aGUgcGx1Z2lucyBoYXZlIHJ1blxuICAgICAgICAqL1xuICAgICAgICBydW5QbHVnaW5RdWV1ZShsb2NhdGlvbiwgZXZlbnQsIGZpcnN0LCBsYXN0KSB7XG5cbiAgICAgICAgICAgIC8vIHRoaXMgYXNzZW1ibGVzIGEgcXVldWUgb2YgZnVuY3Rpb25zIHRvIHJ1biBhcyBtaWRkbGV3YXJlXG4gICAgICAgICAgICAvLyBldmVudCBpcyBhIHRyaWdnZXJlZCBldmVudCBrZXlcbiAgICAgICAgICAgIGxldCBwbHVnaW5fcXVldWUgPSBbXTtcblxuICAgICAgICAgICAgLy8gdGhlIGZpcnN0IGZ1bmN0aW9uIGlzIGFsd2F5cyByZXF1aXJlZFxuICAgICAgICAgICAgcGx1Z2luX3F1ZXVlLnB1c2goZmlyc3QpO1xuXG4gICAgICAgICAgICAvLyBsb29rIHRocm91Z2ggdGhlIGNvbmZpZ3VyZWQgcGx1Z2luc1xuICAgICAgICAgICAgZm9yKGxldCBpIGluIHRoaXMucGx1Z2lucykge1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhleSBoYXZlIGRlZmluZWQgYSBmdW5jdGlvbiB0byBydW4gc3BlY2lmaWNhbGx5XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgZXZlbnRcbiAgICAgICAgICAgICAgICBpZih0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLnBsdWdpbnNbaV0ubWlkZGxld2FyZVtsb2NhdGlvbl1cbiAgICAgICAgICAgICAgICAgICAgJiYgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dW2V2ZW50XSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbl9xdWV1ZS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW2ldLm1pZGRsZXdhcmVbbG9jYXRpb25dW2V2ZW50XSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdhdGVyZmFsbCBydW5zIHRoZSBmdW5jdGlvbnMgaW4gYXNzaWduZWQgb3JkZXJcbiAgICAgICAgICAgIC8vIHdhaXRpbmcgZm9yIG9uZSB0byBjb21wbGV0ZSBiZWZvcmUgbW92aW5nIHRvIHRoZSBuZXh0XG4gICAgICAgICAgICAvLyB3aGVuIGl0J3MgZG9uZSwgdGhlIGBgYGxhc3RgYGAgcGFyYW1ldGVyIGlzIGNhbGxlZFxuICAgICAgICAgICAgd2F0ZXJmYWxsKHBsdWdpbl9xdWV1ZSwgbGFzdCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogU2V0IHRoZSBzdGF0ZSBmb3Ige3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX0gd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fS5cbiAgICAgICAgKiBCcm9hZGNhc3RzIHRoZSBgYGAkb2NmLnN0YXRlYGBgIGV2ZW50IG9uIG90aGVyIGNsaWVudHNcbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2Qgc2V0U3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fSB3aWxsIGhhdmUgd2l0aGluIHRoaXMge3sjY3Jvc3NMaW5rIFwiVXNlclwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqL1xuICAgICAgICBzZXRTdGF0ZShzdGF0ZSkge1xuXG4gICAgICAgICAgICBPQ0YucHVibnViLnNldFN0YXRlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBjaGFubmVsczogW3RoaXMuY2hhbm5lbF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChzdGF0dXMsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBzdGF0dXMsIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgKiBUaGlzIGlzIG91ciBVc2VyIGNsYXNzIHdoaWNoIHJlcHJlc2VudHMgYSBjb25uZWN0ZWQgY2xpZW50XG4gICAgKlxuICAgICogQGNsYXNzIFVzZXJcbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQGV4dGVuZHMgRW1pdHRlclxuICAgICovXG4gICAgY2xhc3MgVXNlciBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHV1aWQsIHN0YXRlID0ge30sIGNoYXQgPSBPQ0YuZ2xvYmFsQ2hhdCkge1xuXG4gICAgICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogdGhlIFVzZXIncyB1dWlkLiBUaGlzIGlzIHB1YmxpYyBpZCBleHBvc2VkIHRvIHRoZSBuZXR3b3JrLlxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgdXVpZFxuICAgICAgICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLnV1aWQgPSB1dWlkO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICoga2VlcHMgYWNjb3VudCBvZiB1c2VyIHN0YXRlIGluIGVhY2ggY2hhbm5lbFxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgc3RhdGVzXG4gICAgICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuc3RhdGVzID0ge307XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBrZWVwIGEgbGlzdCBvZiBjaGF0cm9vbXMgdGhpcyB1c2VyIGlzIGluXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwcm9wZXJ0eSBjaGF0c1xuICAgICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmNoYXRzID0ge307XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBldmVyeSB1c2VyIGhhcyBhIGNvdXBsZSBwZXJzb25hbCByb29tcyB3ZSBjYW4gY29ubmVjdCB0b1xuICAgICAgICAgICAgKiBmZWVkIGlzIGEgbGlzdCBvZiB0aGluZ3MgYSBzcGVjaWZpYyB1c2VyIGRvZXMgdGhhdFxuICAgICAgICAgICAgKiBtYW55IHBlb3BsZSBjYW4gc3Vic2NyaWJlIHRvXG4gICAgICAgICAgICAqXG4gICAgICAgICAgICAqIEBwcm9wZXJ0eSBmZWVkXG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZlZWQgPSBuZXcgQ2hhdChcbiAgICAgICAgICAgICAgICBbT0NGLmdsb2JhbENoYXQuY2hhbm5lbCwgJ2ZlZWQnLCB1dWlkXS5qb2luKCcuJykpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogZGlyZWN0IGlzIGEgcHJpdmF0ZSBjaGFubmVsIHRoYXQgYW55Ym9keSBjYW4gcHVibGlzaCB0b1xuICAgICAgICAgICAgKiBidXQgb25seSB0aGUgdXNlciBjYW4gc3Vic2NyaWJlIHRvXG4gICAgICAgICAgICAqIHRoaXMgcGVybWlzc2lvbiBiYXNlZCBzeXN0ZW0gaXMgbm90IGltcGxlbWVudGVkIHlldFxuICAgICAgICAgICAgKlxuICAgICAgICAgICAgKiBAcHJvcGVydHkgZGlyZWN0XG4gICAgICAgICAgICAqIEB0eXBlIENoYXRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmRpcmVjdCA9IG5ldyBDaGF0KFxuICAgICAgICAgICAgICAgIFtPQ0YuZ2xvYmFsQ2hhdC5jaGFubmVsLCAnZGlyZWN0JywgdXVpZF0uam9pbignLicpKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgZG9lcyBub3QgZXhpc3QgYXQgYWxsIGFuZCB3ZSBnZXQgZW5vdWdoXG4gICAgICAgICAgICAvLyBpbmZvcm1hdGlvbiB0byBidWlsZCB0aGUgdXNlclxuICAgICAgICAgICAgaWYoIU9DRi51c2Vyc1t1dWlkXSkge1xuICAgICAgICAgICAgICAgIE9DRi51c2Vyc1t1dWlkXSA9IHRoaXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGlzIHVzZXIncyBzdGF0ZSBpbiBpdCdzIGNyZWF0ZWQgY29udGV4dFxuICAgICAgICAgICAgdGhpcy5hc3NpZ24oc3RhdGUsIGNoYXQpXG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIGdldCB0aGUgdXNlcidzIHN0YXRlIGluIGEgY2hhdHJvb21cbiAgICAgICAgKlxuICAgICAgICAqIEBtZXRob2Qgc3RhdGVcbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQ2hhdHJvb20gdG8gcmV0cmlldmUgc3RhdGUgZnJvbVxuICAgICAgICAqL1xuICAgICAgICBzdGF0ZShjaGF0ID0gT0NGLmdsb2JhbENoYXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlc1tjaGF0LmNoYW5uZWxdIHx8IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogdXBkYXRlIHRoZSB1c2VyJ3Mgc3RhdGUgaW4gYSBzcGVjaWZpYyBjaGF0cm9vbVxuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCB1cGRhdGVcbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIG5ldyBzdGF0ZSBmb3IgdGhlIHVzZXJcbiAgICAgICAgKiBAcGFyYW0ge0NoYXR9IGNoYXQgQ2hhdHJvb20gdG8gcmV0cmlldmUgc3RhdGUgZnJvbVxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGUoc3RhdGUsIGNoYXQgPSBPQ0YuZ2xvYmFsQ2hhdCkge1xuICAgICAgICAgICAgbGV0IGNoYXRTdGF0ZSA9IHRoaXMuc3RhdGUoY2hhdCkgfHwge307XG4gICAgICAgICAgICB0aGlzLnN0YXRlc1tjaGF0LmNoYW5uZWxdID0gT2JqZWN0LmFzc2lnbihjaGF0U3RhdGUsIHN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICogdGhpcyBpcyBvbmx5IGNhbGxlZCBmcm9tIG5ldHdvcmsgdXBkYXRlc1xuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCBhc3NpZ25cbiAgICAgICAgKi9cbiAgICAgICAgYXNzaWduKHN0YXRlLCBjaGF0KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAqIGFkZHMgYSBjaGF0IHRvIHRoaXMgdXNlclxuICAgICAgICAqXG4gICAgICAgICogQG1ldGhvZCBhZGRDaGF0XG4gICAgICAgICovXG4gICAgICAgIGFkZENoYXQoY2hhdCwgc3RhdGUpIHtcblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGNoYXQgaW4gdGhpcyB1c2VyIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5jaGF0c1tjaGF0LmNoYW5uZWxdID0gY2hhdDtcblxuICAgICAgICAgICAgLy8gdXBkYXRlcyB0aGUgdXNlcidzIHN0YXRlIGluIHRoYXQgY2hhdHJvb21cbiAgICAgICAgICAgIHRoaXMuYXNzaWduKHN0YXRlLCBjaGF0KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBSZXByZXNlbnRzIHRoZSBjbGllbnQgY29ubmVjdGlvbiBhcyBhIHt7I2Nyb3NzTGluayBcIlVzZXJcIn19e3svY3Jvc3NMaW5rfX0uXG4gICAgKiBIYXMgdGhlIGFiaWxpdHkgdG8gdXBkYXRlIGl0J3Mgc3RhdGUgb24gdGhlIG5ldHdvcmsuIEFuIGluc3RhbmNlIG9mXG4gICAgKiB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fSBpcyByZXR1cm5lZCBieSB0aGUgYGBgT0NGLmNvbm5lY3QoKWBgYFxuICAgICogbWV0aG9kLlxuICAgICpcbiAgICAqIEBjbGFzcyBNZVxuICAgICogQGNvbnN0cnVjdG9yXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBvZiB0aGlzIHVzZXJcbiAgICAqIEBleHRlbmRzIFVzZXJcbiAgICAqL1xuICAgIGNsYXNzIE1lIGV4dGVuZHMgVXNlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3IodXVpZCkge1xuXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBVc2VyIGNvbnN0cnVjdG9yXG4gICAgICAgICAgICBzdXBlcih1dWlkKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXNzaWduIHVwZGF0ZXMgZnJvbSBuZXR3b3JrXG4gICAgICAgIGFzc2lnbihzdGF0ZSwgY2hhdCkge1xuICAgICAgICAgICAgLy8gd2UgY2FsbCBcInVwZGF0ZVwiIGJlY2F1c2UgY2FsbGluZyBcInN1cGVyLmFzc2lnblwiXG4gICAgICAgICAgICAvLyB3aWxsIGRpcmVjdCBiYWNrIHRvIFwidGhpcy51cGRhdGVcIiB3aGljaCBjcmVhdGVzXG4gICAgICAgICAgICAvLyBhIGxvb3Agb2YgbmV0d29yayB1cGRhdGVzXG4gICAgICAgICAgICBzdXBlci51cGRhdGUoc3RhdGUsIGNoYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVXBkYXRlIHRoaXMgdXNlciBzdGF0ZSBvdmVyIHRoZSBuZXR3b3JrXG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIHVwZGF0ZVxuICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZSBUaGUgbmV3IHN0YXRlIGZvciB7eyNjcm9zc0xpbmsgXCJNZVwifX17ey9jcm9zc0xpbmt9fVxuICAgICAgICAqIEBwYXJhbSB7Q2hhdH0gY2hhdCBBbiBpbnN0YW5jZSBvZiB0aGUge3sjY3Jvc3NMaW5rIFwiQ2hhdFwifX17ey9jcm9zc0xpbmt9fSB3aGVyZSBzdGF0ZSB3aWxsIGJlIHVwZGF0ZWQuXG4gICAgICAgICogRGVmYXVsdHMgdG8gYGBgT0NGLmdsb2JhbENoYXRgYGAuXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZShzdGF0ZSwgY2hhdCA9IE9DRi5nbG9iYWxDaGF0KSB7XG5cbiAgICAgICAgICAgIC8vIHJ1biB0aGUgcm9vdCB1cGRhdGUgZnVuY3Rpb25cbiAgICAgICAgICAgIHN1cGVyLnVwZGF0ZShzdGF0ZSwgY2hhdCk7XG5cbiAgICAgICAgICAgIC8vIHB1Ymxpc2ggdGhlIHVwZGF0ZSBvdmVyIHRoZSBnbG9iYWwgY2hhbm5lbFxuICAgICAgICAgICAgY2hhdC5zZXRTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgdGhlIGJhc2UgV2lkZ2V0IGNsYXNzLi4uXG4gICAgICpcbiAgICAgKiBAY2xhc3MgT0NGXG4gICAgICovXG4gICAgY29uc3QgaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcm9vdCBPQ0Ygb2JqZWN0XG4gICAgICAgIE9DRiA9IG5ldyBSb290RW1pdHRlcjtcblxuICAgICAgICAvLyBjcmVhdGUgYSBnbG9iYWwgbGlzdCBvZiBrbm93biB1c2Vyc1xuICAgICAgICBPQ0YudXNlcnMgPSB7fTtcblxuICAgICAgICAvLyBkZWZpbmUgb3VyIGdsb2JhbCBjaGF0cm9vbSBhbGwgdXNlcnMgam9pbiBieSBkZWZhdWx0XG4gICAgICAgIE9DRi5nbG9iYWxDaGF0ID0gZmFsc2U7XG5cbiAgICAgICAgLy8gZGVmaW5lIHRoZSB1c2VyIHRoYXQgdGhpcyBjbGllbnQgcmVwcmVzZW50c1xuICAgICAgICBPQ0YubWUgPSBmYWxzZTtcblxuICAgICAgICAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byBQdWJOdWJcbiAgICAgICAgT0NGLnB1Ym51YiA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAqIGNvbm5lY3QgdG8gcmVhbHRpbWUgc2VydmljZSBhbmQgY3JlYXRlIGluc3RhbmNlIG9mIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319XG4gICAgICAgICpcbiAgICAgICAgKiBAbWV0aG9kIGNvbm5lY3RcbiAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXVpZCBUaGUgdXVpZCBmb3Ige3sjY3Jvc3NMaW5rIFwiTWVcIn19e3svY3Jvc3NMaW5rfX1cbiAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhdGUgVGhlIGluaXRpYWwgc3RhdGUgZm9yIHt7I2Nyb3NzTGluayBcIk1lXCJ9fXt7L2Nyb3NzTGlua319XG4gICAgICAgICogQHJldHVybiB7TWV9IG1lIGFuIGluc3RhbmNlIG9mIG1lXG4gICAgICAgICovXG4gICAgICAgIE9DRi5jb25uZWN0ID0gZnVuY3Rpb24odXVpZCwgc3RhdGUpIHtcblxuICAgICAgICAgICAgLy8gdGhpcyBjcmVhdGVzIGEgdXNlciBrbm93biBhcyBNZSBhbmRcbiAgICAgICAgICAgIC8vIGNvbm5lY3RzIHRvIHRoZSBnbG9iYWwgY2hhdHJvb21cblxuICAgICAgICAgICAgLy8gdGhpcy5jb25maWcucmx0bS5jb25maWcudXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICBwbkNvbmZpZy51dWlkID0gdXVpZCB8fCBwbkNvbmZpZy51dWlkO1xuXG4gICAgICAgICAgICB0aGlzLnB1Ym51YiA9IG5ldyBQdWJOdWIocG5Db25maWcpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgY2hhdCB0byB1c2UgYXMgZ2xvYmFsQ2hhdFxuICAgICAgICAgICAgdGhpcy5nbG9iYWxDaGF0ID0gbmV3IENoYXQoZ2xvYmFsQ2hhbm5lbCk7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyB1c2VyIHRoYXQgcmVwcmVzZW50cyB0aGlzIGNsaWVudFxuICAgICAgICAgICAgdGhpcy5tZSA9IG5ldyBNZSh0aGlzLnB1Ym51Yi5nZXRVVUlEKCkpO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgTWUgdXNpbmcgaW5wdXQgcGFyYW1ldGVyc1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxDaGF0LmNyZWF0ZVVzZXIodGhpcy5wdWJudWIuZ2V0VVVJRCgpLCBzdGF0ZSk7XG5cbiAgICAgICAgICAgIHRoaXMubWUudXBkYXRlKHN0YXRlKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIG1lXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZTtcblxuICAgICAgICAgICAgLy8gY2xpZW50IGNhbiBhY2Nlc3MgZ2xvYmFsQ2hhdCB0aHJvdWdoIE9DRi5nbG9iYWxDaGF0XG5cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBvdXIgZXhwb3J0ZWQgY2xhc3Nlc1xuICAgICAgICBPQ0YuQ2hhdCA9IENoYXQ7XG4gICAgICAgIE9DRi5Vc2VyID0gVXNlcjtcblxuICAgICAgICAvLyBhZGQgYW4gb2JqZWN0IGFzIGEgc3Vib2JqZWN0IHVuZGVyIGEgbmFtZXNwb2FjZVxuICAgICAgICBPQ0YuYWRkQ2hpbGQgPSAob2IsIGNoaWxkTmFtZSwgY2hpbGRPYikgPT4ge1xuXG4gICAgICAgICAgICAvLyBhc3NpZ24gdGhlIG5ldyBjaGlsZCBvYmplY3QgYXMgYSBwcm9wZXJ0eSBvZiBwYXJlbnQgdW5kZXIgdGhlXG4gICAgICAgICAgICAvLyBnaXZlbiBuYW1lc3BhY2VcbiAgICAgICAgICAgIG9iW2NoaWxkTmFtZV0gPSBjaGlsZE9iO1xuXG4gICAgICAgICAgICAvLyB0aGUgbmV3IG9iamVjdCBjYW4gdXNlIGBgYHRoaXMucGFyZW50YGBgIHRvIGFjY2Vzc1xuICAgICAgICAgICAgLy8gdGhlIHJvb3QgY2xhc3NcbiAgICAgICAgICAgIGNoaWxkT2IucGFyZW50ID0gb2I7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBPQ0Y7XG5cbiAgICB9XG5cbiAgICAvLyByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgT0NGXG4gICAgcmV0dXJuIGluaXQoKTtcblxufVxuXG4vLyBleHBvcnQgdGhlIE9DRiBhcGlcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsdWdpbjoge30sICAvLyBsZWF2ZSBhIHNwb3QgZm9yIHBsdWdpbnMgdG8gZXhpc3RcbiAgICBjcmVhdGU6IGNyZWF0ZVxufTtcbiIsIndpbmRvdy5PcGVuQ2hhdEZyYW1ld29yayA9IHdpbmRvdy5PcGVuQ2hhdEZyYW1ld29yayB8fCByZXF1aXJlKCcuL2luZGV4LmpzJyk7XG4iXX0=
