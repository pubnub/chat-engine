/**
* Extend emitter and add OCF specific behaviors
*
* @class Emitter
* @constructor
* @extend RootEmitter
*/

const RootEmitter = require('./RootEmitter');
const OCF = require('./OCF');

module.exports = class Emitter extends RootEmitter {

    constructor() {
        
        super();   

        this.plugins = [];

    }

    // emit an event from this object
    emit(event, data) {

        // all events are forwarded to OCF object
        // so you can globally bind to events with OCF.on()
        OCF.emit(event, data);
        
        // send the event from the object that created it
        this.emitter.emit(event, data);

    }

    addChild(ob, childName, childOb) {

        // assign the new child object as a property of parent under the
        // given namespace
        ob[childName] = childOb;

        // the new object can use ```this.parent``` to access 
        // the root class
        childOb.parent = ob;

        // the new object can use ```this.OCF``` to get the global config
        childOb.OCF = this.OCF;
        
    }

    // bind a plugin to this object
    plugin(module) {

        this.plugins.push(module);

        // returns the name of the class
        let className = this.constructor.name;

        // see if there are plugins to attach to this class
        if(module.extends && module.extends[className]) {

            // attach the plugins to this class 
            // under their namespace
            this.addChild(this, module.namespace, 
                new module.extends[className]);

            // if the plugin has a special construct function
            // run it
            if(this[module.namespace].construct) {
                this[module.namespace].construct();
            }

        }


    }

}
