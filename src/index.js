/**
 * Provides the base Widget class...
 *
 * @module Root
 */

"use strict";

const OCF = require('./classes/OCF');

// Allows us to create and bind to events. Everything in OCF is an event
// emitter

/**
* Global object used to create an instance of OCF.
*
* @class OpenChatFramework
* @constructor
* @param {Object} foo Argument 1
* @param config.rltm {Object} OCF is based off PubNub [rltm.js](https://github.com/pubnub/rltm.js) which lets you switch between PubNub and Socket.io just by changing your configuration. Check out [the rltm.js docs](https://github.com/pubnub/rltm.js) for more information.
* @param config.globalChannel {String} his is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.
* @return {Object} Returns an instance of OCF
*/
const config = function(config) {

    
    // return an instance of OCF
    return new OCF(config);

}

// export the OCF api
const returns = {
    plugin: {},  // leave a spot for plugins to exist
    config: config
};

module.exports = returns;
