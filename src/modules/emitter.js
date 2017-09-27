const RootEmitter = require('./root_emitter');
const Event = require('../components/event');

/**
 An ChatEngine generic emitter that supports plugins and forwards
 events to the root emitter.
 @extends RootEmitter
 */
class Emitter extends RootEmitter {

    constructor(chatEngine) {

        super();

        this.chatEngine = chatEngine;

        this.name = 'Emitter';

        /**
         Emit events locally.

         @private
         @param {String} event The event payload object
         */
        this._emit = (event, data) => {

            // all events are forwarded to ChatEngine object
            // so you can globally bind to events with ChatEngine.on()
            this.chatEngine._emit(event, data);

            // emit the event from the object that created it
            this.emitter.emit(event, data);

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
        this.plugin = (module) => {

            // add this plugin to a list of plugins for this object
            this.plugins.push(module);

            // see if there are plugins to attach to this class
            if (module.extends && module.extends[this.name]) {

                // attach the plugins to this class
                // under their namespace
                this.chatEngine.addChild(this, module.namespace, new module.extends[this.name]());

                this[module.namespace].ChatEngine = this.chatEngine;

                // if the plugin has a special construct function
                // run it
                if (this[module.namespace].construct) {
                    this[module.namespace].construct();
                }

            }
        };
    }

}

module.exports = Emitter;


