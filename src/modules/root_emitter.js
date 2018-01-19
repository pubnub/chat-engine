
// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

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
