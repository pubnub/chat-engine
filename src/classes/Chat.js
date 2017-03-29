const Emitter = require('./Emitter');
const OCF = require('./OCF');

// allows a synchronous execution flow. 
const waterfall = require('async/waterfall');

/**
* This is the root Chat class that represents a chatroom
*
* @class Chat
* @constructor
* @extend Emitter
*/
module.exports = class Chat extends Emitter {

    constructor(channel) {

        super();

        // the channel name for this chatroom
        this.channel = channel;

        // a list of users in this chatroom
        this.users = {};

        // get a list of users online now
        this.room.here().then((occupants) => {

            // for every occupant, create a model user
            for(let uuid in occupants) {
                // and run the join functions
                this.createUser(uuid, occupants[uuid], true);
            }

        }, (err) => {
            throw new Error(
                'There was a problem fetching here.', err);
        });

        // this.room is our rltm.js connection 
        this.room = OCF.rltm.join(this.channel);

        // whenever we get a message from the network 
        this.room.on('message', (uuid, data) => {

            // all messages are in format [event_name, data]
            this.broadcast(data.message[0], data.message[1]);

        });

        // forward user join events
        this.room.on('join', (uuid, state) => {
            
            let user = this.createUser(uuid, state);

            // broadcast that this is a user
            this.broadcast('$ocf.join', {
                user: user
            });

        });

        // forward user state change events
        this.room.on('state', (uuid, state) => {
            this.userUpdate(uuid, state);
        });

        // forward user leaving events
        this.room.on('leave', (uuid) => {
            this.userLeave(uuid);
        });

        // When a user disconnects
        this.room.on('disconnect', (uuid) => {
            this.userDisconnect(uuid);
        });

    }

    /**
     * convenience method to set the rltm ready callback
     *
     * @method ready
     */
    ready(fn) {
        this.room.ready(fn);
        return false;
    }

    /**
     * send events over the network
     *
     * @method send
     * @param {String} event The event name
     * @param {Object} data The event payload object
     */
    send(event, data) {

        // create a standardized payload object 
        let payload = {
            data: data,            // the data supplied from params
            sender: OCF.me.uuid,   // my own uuid
            chat: this,            // an instance of this chat 
        };

        // run the plugin queue to modify the event
        this.runPluginQueue('send', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            // remove chat otherwise it would be serialized
            // instead, it's rebuilt on the other end. 
            // see this.broadcast
            delete payload.chat; 

            // publish the event and data over the configured channel
            this.room.publish({
                message: [event, payload],
                channel: this.channel
            });

        });

    }

    /**
     * broadcasts an event locally
     *
     * @method broadcast
     * @param {String} event The event name
     * @param {Object} payload The event payload object
     */
    broadcast(event, payload) {

        // restore chat in payload
        if(!payload.chat) {
            payload.chat = this;   
        }

        // turn a uuid found in payload.sender to a real user
        if(payload.sender && OCF.users[payload.sender]) {
            payload.sender = OCF.users[payload.sender];
        }

        // let plugins modify the event
        this.runPluginQueue('broadcast', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            // emit this event to any listener
            this.emit(event, payload);

        });

    }

    /**
     * when OCF learns about a user in the channel
     *
     * @method createUser
     * @param {String} uuid The user uuid
     * @param {Object} state The user initial state
     * @param {Boolean} broadcast Force a broadcast that this user is online
     */
    createUser(uuid, state, broadcast = false) {

        // Ensure that this user exists in the global list
        // so we can reference it from here out
        OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

        // Add this chatroom to the user's list of chats
        OCF.users[uuid].addChat(this, state);

        // broadcast the join event over this chatroom
        if(!this.users[uuid] || broadcast) {

            // broadcast that this is not a new user                    
            this.broadcast('$ocf.online', {
                user: OCF.users[uuid]
            });

        }

        // store this user in the chatroom
        this.users[uuid] = OCF.users[uuid];

        // return the instance of this user
        return OCF.users[uuid];

    }

    /**
     * get notified when a user's state changes
     *
     * @method userUpdate
     * @param {String} uuid The ```User``` uuid
     * @param {Object} state State to update for the user
     */
    userUpdate(uuid, state) {

        // ensure the user exists within the global space
        OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

        // if we don't know about this user
        if(!this.users[uuid]) {
            // do the whole join thing
            this.createUser(uuid, state);
        }

        // update this user's state in this chatroom
        this.users[uuid].assign(state, this);

        // broadcast the user's state update                
        this.broadcast('$ocf.state', {
            user: this.users[uuid],
            state: this.users[uuid].state(this)
        });

    }

    /**
     * Have Me leave the chatroom
     *
     * @method leave
     */
    leave() {

        // disconnect from the chat
        this.room.unsubscribe().then(() => {
            // should get caught on as network event
        });

    }

    /**
     * Fired when a user leaves the chatroom
     *
     * @method userLeave
     * @param {String} uuid The ```User``` uuid
     */
    userLeave(uuid) {

        // make sure this event is real, user may have already left
        if(this.users[uuid]) {

            // if a user leaves, broadcast the event
            this.broadcast('$ocf.leave', this.users[uuid]);
            this.broadcast('$ocf.offline', this.users[uuid]);

            // remove the user from the local list of users
            delete this.users[uuid];

            // we don't remove the user from the global list, 
            // because they may be online in other channels

        } else {

            // that user isn't in the user list
            // we never knew about this user or they already left

            // console.log('user already left');
        }
    }

    /**
     * Fired when a user disconnects from the chatroom
     *
     * @method userDisconnect
     * @param {String} uuid The ```User``` uuid
     */
    userDisconnect(uuid) {

        // make sure this event is real, user may have already left
        if(this.users[uuid]) {

            // if a user leaves, broadcast the event
            this.broadcast('$ocf.disconnect', this.users[uuid]);
            this.broadcast('$ocf.offline', this.users[uuid]);

        }

    }

    /**
     * this assembles a queue of functions to run as middleware
     *
     * @method runPluginQueue
     * @param {String} location Where in the middleeware the event should run (send, broadcast)
     * @param {String} event The event name
     * @param {String} first The first function to run before the plugins have run
     * @param {String} last The last function to run after the plugins have run
     */
    runPluginQueue(location, event, first, last) {

        // event is a broadcasted event key
        let plugin_queue = [];

        // the first function is always required
        plugin_queue.push(first);

        // look through the configured plugins
        for(let i in this.plugins) {

            // if they have defined a function to run specifically 
            // for this event
            if(this.plugins[i].middleware 
                && this.plugins[i].middleware[location] 
                && this.plugins[i].middleware[location][event]) {

                // add the function to the queue
                plugin_queue.push(
                    this.plugins[i].middleware[location][event]);
            }

        }

        // waterfall runs the functions in assigned order
        // waiting for one to complete before moving to the next
        // when it's done, the ```last``` parameter is called
        waterfall(plugin_queue, last);

    }

    /**
     * set Me state in the room
     *
     * @method setState
     */
    setState(state) {

        // handy method to set state of user without touching rltm
        this.room.setState(state);
    }

};
