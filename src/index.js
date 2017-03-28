/**
 * Provides the base Widget class...
 *
 * @module Root
 */

"use strict";

const OCF = require('./classes/OCF');
const Me = require('./classes/Me');
const User = require('./classes/User');
const Chat = require('./classes/Chat');

// Allows us to create and bind to events. Everything in OCF is an event
// emitter

// import the rltm.js library from a sister directory
const Rltm = require('rltm');

/**
* Global object used to create an instance of OCF.
*
* @class OpenChatFramework
* @param {Object} foo Argument 1
* @param config.rltm {Object} OCF is based off PubNub [rltm.js](https://github.com/pubnub/rltm.js) which lets you switch between PubNub and Socket.io just by changing your configuration. Check out [the rltm.js docs](https://github.com/pubnub/rltm.js) for more information.
* @param config.globalChannel {String} his is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.
* @return {Object} Returns an instance of OCF
*/
const config = function(config) {

    OCF.config = config || {};

    // set a default global channel if none is set
    OCF.config.globalChannel = OCF.config.globalChannel || 'ocf-global';

    // create a global list of known users
    OCF.users = {};

    // define our global chatroom all users join by default
    OCF.globalChat = false;

    // define the user that this client represents
    OCF.me = false;

    // store a reference to the rltm.js networking library
    OCF.rltm = false;

    // connect to realtime service and identify
    OCF.connect = function(uuid, state) {

        // make sure the uuid is set for this client 
        if(!uuid) {
            throw new Error('You must supply a uuid as the ' + 
                'first parameter when connecting.');
        }

        // this creates a user known as Me and 
        // connects to the global chatroom
        this.config.rltm.config.uuid = uuid;
        this.config.rltm.config.state = state;

        // configure the rltm plugin with the params set in config method
        this.rltm = new Rltm(this.config.rltm);

        // create a new chat to use as globalChat
        this.globalChat = new Chat(this.config.globalChannel);

        // create a new user that represents this client
        this.me = new Me(uuid);

        // create a new instance of Me using input parameters
        this.globalChat.createUser(uuid, state);

        // return me
        return this.me;

        // client can access globalChat through OCF.globalChat

    };

    // our exported classes
    OCF.Chat = Chat;
    OCF.User = User;

    // return an instance of OCF
    return OCF;

}

// export the OCF api
const returns = {
    plugin: {},  // leave a spot for plugins to exist
    config: config
};

module.exports = returns;
