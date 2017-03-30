const RootEmitter = require('./RootEmitter'); 

const Me = require('./Me');
const User = require('./User');
const Chat = require('./Chat');

// import the rltm.js library from a sister directory
const Rltm = require('rltm');

/**
* A global {{#crossLink "Emitter"}}{{/crossLink}}. All events broadcast within the OCF framework will also be broadcast to this Object.
*
* @class OCF
* @constructor
* @param {Object} config
* @param {String} config.globalChannel A channel name for the global {{#crossLink "Chat"}}{{/crossLink}}
* @param {Object} config.rltm Rltm.js configuration. See [rltmjs docs](http://rltmjs.com).
* @param {Object} config.rltm.service PubNub or Socket.io
* @param {Object} config.rltm.config Rltm.js service configuration.
* @extend RootEmitter
*/
module.exports = class OCF extends RootEmitter {

    constructor(config) {

        super();

        /**
        * The configured options for this instance of OCF
        *
        * @property config
        * @type Object
        */
        this.config = config || {};

        /**
        * set a default global channel if none is set
        *
        * @property config.globalChannel
        * @type String
        */
        this.config.globalChannel = this.config.globalChannel || 'ocf-global';

        /**
        * create a global list of known users
        *
        * @property users
        * @type Object
        */
        this.users = {};

        /**
        * define our global chatroom all users join by default
        *
        * @property globalChat
        * @type Chat
        */
        this.globalChat = false;

        /**
        * define the user that this client represents
        *
        * @property me
        * @type Me
        */
        this.me = false;

        /**
        * @private
        * store a reference to the rltm.js networking library
        *
        * @property rltm
        * @type Object
        */
        this.rltm = false;

        // connect to realtime service and identify

        /**
        *
        * Initiate a connection to rltm
        *
        * @method connect
        * @param {String} uuid The uuid of this client
        * @param {String} state The starting state for this client
        * @return {Me} An instance of the current user
        */
        this.connect = (uuid, state) => {

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

        };

        /**
        * Export the Chat class to be used on the client
        *
        * @property Chat
        * @type Chat
        */
        this.Chat = Chat;

        /**
        * Export the User class to be used on the client
        *
        * @property User
        * @type User
        */
        this.User = User;

    }

}
