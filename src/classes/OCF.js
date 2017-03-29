const Emitter = require('./RootEmitter'); 

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
* @extend RootEmitter
*/
module.exports = class OCF extends Emitter {

    constructor(config) {

        super();

        this.config = config || {};

        // set a default global channel if none is set
        this.config.globalChannel = this.config.globalChannel || 'ocf-global';

        // create a global list of known users
        this.users = {};

        // define our global chatroom all users join by default
        this.globalChat = false;

        // define the user that this client represents
        this.me = false;

        // store a reference to the rltm.js networking library
        this.rltm = false;

        // connect to realtime service and identify
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

            // client can access globalChat through this.globalChat

        };

        // our exported classes
        this.Chat = Chat;
        this.User = User;


    }

}
