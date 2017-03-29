/**
* create an EventEmitter2 that all other emitters can inherit
*
* @class RootEmitter
* @constructor
*/

const EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = class RootEmitter {

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
        this.emit = this.emitter.emit.bind(this.emitter);

        /**
        * Listen for a specific event and fire a callback when it's emitted
        *
        * @method on
        * @param {String} event The event name
        * @param {Function} callback The function to run when the event is emitted 
        */
        this.on = this.emitter.on.bind(this.emitter);

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
        * @param {Function} callback The function to run once 
        */
        this.once = this.emitter.once.bind(this.emitter);

    }

}
