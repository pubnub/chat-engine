const waterfall = require('async/waterfall');
const RootEmitter = require('./root_emitter');
const Event = require('../components/event');

/**
 An ChatEngine generic emitter that supports plugins and forwards
 events to the root emitter.
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
