/**
* A global {{#crossLink "Emitter"}}{{/crossLink}}. All events broadcast within the OCF framework will also be broadcast to this Object.
*
* @class OCF
* @constructor
* @extend RootEmitter
*/

const Emitter = require('./RootEmitter'); 
module.exports = new Emitter;
