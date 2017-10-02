
const waterfall = require('async/waterfall');

// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

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
            }, (err, pluginResponse) => {
                // emit this event to any listener
                this._emit(event, pluginResponse);
            });

        };

        // this can be made into plugin
        if (typeof payload === 'object') {

            // restore chat in payload
            if (!payload.chat && this.name === 'Chat') {
                payload.chat = this;
            }

            // if we should try to restore the sender property
            if (payload.sender) {

                // this use already exists in memory
                if (this.chatEngine.users[payload.sender]) {
                    payload.sender = this.chatEngine.users[payload.sender];
                    complete();
                } else {

                    // the user doesn't exist, create it
                    payload.sender = new User(this.chatEngine, payload.sender);

                    // try to get stored state from server
                    payload.sender._getState(this, () => {
                        complete();
                    });

                }

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
     after events are f or received.

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
            if (pluginItem.middleware && pluginItem.middleware[location] && pluginItem.middleware[location][event]) {
                // add the function to the queue
                pluginQueue.push(pluginItem.middleware[location][event]);
            }
        });

        // waterfall runs the functions in assigned order
        // waiting for one to complete before moving to the next
        // when it's done, the ```last``` parameter is called
        waterfall(pluginQueue, last);

    }

}

module.exports = RootEmitter;
