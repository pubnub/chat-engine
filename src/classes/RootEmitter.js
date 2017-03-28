/**
* create an EventEmitter2 that all other emitters can inherit
*
* @class RootEmitter
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
        this.on = this.emitter.on.bind(this.emitter);
        this.onAny = this.emitter.onAny.bind(this.emitter);
        this.once = this.emitter.once.bind(this.emitter);

    }

}
