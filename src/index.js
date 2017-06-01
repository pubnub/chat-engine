"use strict";


// Allows us to create and bind to events. Everything in OCF is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const PubNub = require('pubnub');

// allows a synchronous execution flow.
const waterfall = require('async/waterfall');

/**
* Global object used to create an instance of OCF.
*
* @class OpenChatFramework
* @constructor
* @param {Object} foo Argument 1
* @param config.pubnub {Object} OCF is based off PubNub. Supply your PubNub config here.
* @param config.globalChannel {String} his is the global channel that all clients are connected to automatically. It's used for global announcements, global presence, etc.
* @return {Object} Returns an instance of OCF
*/

const create = function(globalChannel = 'ocf-global', pnConfig) {

    let OCF = false;

    /**
    * Configures an event emitter that other OCF objects inherit. Adds shortcut methods for
    * ```this.on()```, ```this.emit()```, etc.
    *
    * @class RootEmitter
    * @constructor
    */
    class RootEmitter {

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
            this._emit = this.emitter.emit.bind(this.emitter);

            /**
            * Listen for a specific event and fire a callback when it's emitted
            *
            * @method on
            * @param {String} event The event name
            * @param {Function} callback The function to run when the event is emitted
            */
            this.on = this.emitter.on.bind(this.emitter);

            this.off = this.emitter.off.bind(this.emitter);

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
            * @param {String} event The event name
            * @param {Function} callback The function to run once
            */
            this.once = this.emitter.once.bind(this.emitter);

        }

    }

    /**
    * An OCF generic emitter that supports plugins and forwards
    * events to a global emitter.
    *
    * @class Emitter
    * @constructor
    * @extends RootEmitter
    */
    class Emitter extends RootEmitter {

        constructor() {

            super();

            // emit an event from this object
            this._emit = (event, data) => {

                // all events are forwarded to OCF object
                // so you can globally bind to events with OCF.on()
                OCF._emit(event, data);

                // emit the event from the object that created it
                this.emitter.emit(event, data);

            }

            // assign the list of plugins for this scope
            this.plugins = [];

            // bind a plugin to this object
            this.plugin = function(module) {

                this.plugins.push(module);

                // returns the name of the class
                let className = this.constructor.name;

                // see if there are plugins to attach to this class
                if(module.extends && module.extends[className]) {

                    // attach the plugins to this class
                    // under their namespace
                    OCF.addChild(this, module.namespace,
                        new module.extends[className]);

                    this[module.namespace].OCF = OCF;

                    // if the plugin has a special construct function
                    // run it

                    if(this[module.namespace].construct) {
                        this[module.namespace].construct();
                    }

                }


            }

        }

    }

    /**
    * This is the root {{#crossLink "Chat"}}{{/crossLink}} class that represents a chat room
    *
    * @class Chat
    * @constructor
    * @param {String} channel The channel name for the Chat
    * @extends Emitter
    */
    class Chat extends Emitter {

        constructor(channel) {

            super();

            /**
            * The channel name for this {{#crossLink "Chat"}}{{/crossLink}}
            *
            * @property channel
            * @type String
            */
            this.channel = channel;

            /**
            * A list of users in this {{#crossLink "Chat"}}{{/crossLink}}. Automatically kept in sync,
            * Use ```Chat.on('$ocf.join')``` and related events to get notified when this changes
            *
            * @property users
            * @type Object
            */
            this.users = {};

            // whenever we get a message from the network
            // run local trigger message

            this.onHereNow = (status, response) => {

                if(status.error) {
                    throw new Error('There was a problem fetching here.', status.err);
                } else {

                    // get the list of occupants in this channel
                    let occupants = response.channels[this.channel].occupants;

                    // format the userList for rltm.js standard
                    for(let i in occupants) {
                        this.userUpdate(occupants[i].uuid, occupants[i].state);
                    }

                }

            };

            this.onStatus = (statusEvent) => {

                if (statusEvent.category === "PNConnectedCategory") {

                    if(statusEvent.affectedChannels.indexOf(this.channel) > -1) {
                        this.trigger('$ocf.ready');
                    }

                }

            };

            this.onMessage = (m) => {

                // if message is sent to this specific channel
                if(this.channel == m.channel) {
                    this.trigger(m.message[0], m.message[1]);
                }

            };

            this.onPresence = (presenceEvent) => {

                // make sure channel matches this channel
                if(this.channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has joined the room
                        *
                        * @event $ocf.join
                        * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                        */
                        this.trigger('$ocf.join', {
                            user: user
                        });

                    }

                    // someone leaves channel
                    if(presenceEvent.action == "leave") {
                        this.userLeave(presenceEvent.uuid);
                    }

                    // someone timesout
                    if(presenceEvent.action == "timeout") {
                        this.userDisconnect(presenceEvent.uuid);
                    }

                    // someone's state is updated
                    if(presenceEvent.action == "state-change") {
                        this.userUpdate(presenceEvent.uuid, presenceEvent.state);
                    }

                }

            };

            // get a list of users online now
            // ask PubNub for information about connected users in this channel
            OCF.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, this.onHereNow);

            OCF.pubnub.addListener({
                status: this.onStatus,
                message: this.onMessage,
                presence: this.onPresence
            });

            OCF.pubnub.subscribe({
                channels: [this.channel]
            });

        }

        /**
        * Send events to other clients in this {{#crossLink "User"}}{{/crossLink}}.
        * Events are trigger over the network  and all events are made
        * on behalf of {{#crossLink "Me"}}{{/crossLink}}
        *
        * @method emit
        * @param {String} event The event name
        * @param {Object} data The event payload object
        */
        emit(event, data) {

            // create a standardized payload object
            let payload = {
                data: data,            // the data supplied from params
                sender: OCF.me.uuid,   // my own uuid
                chat: this,            // an instance of this chat
            };

            // run the plugin queue to modify the event
            this.runPluginQueue('emit', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // remove chat otherwise it would be serialized
                // instead, it's rebuilt on the other end.
                // see this.trigger
                delete payload.chat;

                // publish the event and data over the configured channel

                OCF.pubnub.publish({
                    message: [event, payload],
                    channel: this.channel
                });

            });

        }

        /**
        * @private
        * Broadcasts an event locally to all listeners.
        *
        * @method trigger
        * @param {String} event The event name
        * @param {Object} payload The event payload object
        */
        trigger(event, payload) {

            if(typeof payload == "object") {

                // restore chat in payload
                if(!payload.chat) {
                    payload.chat = this;
                }

                // turn a uuid found in payload.sender to a real user
                if(payload.sender && OCF.users[payload.sender]) {
                    payload.sender = OCF.users[payload.sender];
                }

            }

            // let plugins modify the event
            this.runPluginQueue('on', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // emit this event to any listener
                this._emit(event, payload);

            });

        }

        /**
        * @private
        * Add a user to the {{#crossLink "Chat"}}{{/crossLink}}, creating it if it doesn't already exist.
        *
        * @method createUser
        * @param {String} uuid The user uuid
        * @param {Object} state The user initial state
        * @param {Boolean} trigger Force a trigger that this user is online
        */
        createUser(uuid, state, trigger = false) {

            // Ensure that this user exists in the global list
            // so we can reference it from here out
            OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            OCF.users[uuid].addChat(this, state);

            // trigger the join event over this chatroom
            if(!this.users[uuid] || trigger) {

                /**
                * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has come online
                *
                * @event $ocf.online
                * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that came online
                */
                this.trigger('$ocf.online', {
                    user: OCF.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = OCF.users[uuid];

            // return the instance of this user
            return OCF.users[uuid];

        }

        /**
        * @private
        * Update a user's state within this {{#crossLink "Chat"}}{{/crossLink}}.
        *
        * @method userUpdate
        * @param {String} uuid The {{#crossLink "User"}}{{/crossLink}} uuid
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

            /**
            * Broadcast that a {{#crossLink "User"}}{{/crossLink}} has changed state
            *
            * @event $ocf.state
            * @param {Object} payload.user The {{#crossLink "User"}}{{/crossLink}} that changed state
            * @param {Object} payload.state The new user state for this ```Chat```
            */
            this.trigger('$ocf.state', {
                user: this.users[uuid],
                state: this.users[uuid].state(this)
            });

        }

        /**
         * Leave from the {{#crossLink "Chat"}}{{/crossLink}} on behalf of {{#crossLink "Me"}}{{/crossLink}}
         *
         * @method leave
         */
        leave() {

            // disconnect from the chat
            this.room.leave().then(() => {
                // should get caught on as network event
            });

        }

        /**
         * @private
         * Perform updates when a user has left the {{#crossLink "Chat"}}{{/crossLink}}.
         *
         * @method leave
         */
        userLeave(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                // if a user leaves, trigger the event
                this.trigger('$ocf.leave', this.users[uuid]);
                this.trigger('$ocf.offline', this.users[uuid]);

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
        * @private
        * Fired when a user disconnects from the {{#crossLink "Chat"}}{{/crossLink}}
        *
        * @method userDisconnect
        * @param {String} uuid The uuid of the {{#crossLink "Chat"}}{{/crossLink}} that left
        */
        userDisconnect(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                /**
                * A {{#crossLink "User"}}{{/crossLink}} has been disconnected from the ```Chat```
                *
                * @event $ocf.disconnect
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that disconnected
                */
                this.trigger('$ocf.disconnect', this.users[uuid]);

                /**
                * A {{#crossLink "User"}}{{/crossLink}} has gone offline
                *
                * @event $ocf.offline
                * @param {Object} User The {{#crossLink "User"}}{{/crossLink}} that has gone offline
                */
                this.trigger('$ocf.offline', this.users[uuid]);

            }

        }

        /**
        * @private
        * Load plugins and attach a queue of functions to execute before and
        * after events are trigger or received.
        *
        * @method runPluginQueue
        * @param {String} location Where in the middleeware the event should run (emit, trigger)
        * @param {String} event The event name
        * @param {String} first The first function to run before the plugins have run
        * @param {String} last The last function to run after the plugins have run
        */
        runPluginQueue(location, event, first, last) {

            // this assembles a queue of functions to run as middleware
            // event is a triggered event key
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
        * @private
        * Set the state for {{#crossLink "Me"}}{{/crossLink}} within this {{#crossLink "User"}}{{/crossLink}}.
        * Broadcasts the ```$ocf.state``` event on other clients
        *
        * @method setState
        * @param {Object} state The new state {{#crossLink "Me"}}{{/crossLink}} will have within this {{#crossLink "User"}}{{/crossLink}}
        */
        setState(state) {

            OCF.pubnub.setState(
                {
                    state: state,
                    channels: [this.channel]
                },
                function (status, response) {
                    // handle status, response
                }
            );

        }

    };

    /**
    * This is our User class which represents a connected client
    *
    * @class User
    * @constructor
    * @extends Emitter
    */
    class User extends Emitter {

        constructor(uuid, state = {}, chat = OCF.globalChat) {

            super();

            /**
            * the User's uuid. This is public id exposed to the network.
            *
            * @property uuid
            * @type String
            */
            this.uuid = uuid;

            /**
            * keeps account of user state in each channel
            *
            * @property states
            * @type Object
            */
            this.states = {};

            /**
            * keep a list of chatrooms this user is in
            *
            * @property chats
            * @type Object
            */
            this.chats = {};

            /**
            * every user has a couple personal rooms we can connect to
            * feed is a list of things a specific user does that
            * many people can subscribe to
            *
            * @property feed
            * @type Chat
            */
            this.feed = new Chat(
                [OCF.globalChat.channel, 'feed', uuid].join('.'));

            /**
            * direct is a private channel that anybody can publish to
            * but only the user can subscribe to
            * this permission based system is not implemented yet
            *
            * @property direct
            * @type Chat
            */
            this.direct = new Chat(
                [OCF.globalChat.channel, 'direct', uuid].join('.'));

            // if the user does not exist at all and we get enough
            // information to build the user
            if(!OCF.users[uuid]) {
                OCF.users[uuid] = this;
            }

            // update this user's state in it's created context
            this.assign(state, chat)

        }

        /**
        * get the user's state in a chatroom
        *
        * @method state
        * @param {Chat} chat Chatroom to retrieve state from
        */
        state(chat = OCF.globalChat) {
            return this.states[chat.channel] || {};
        }

        /**
        * update the user's state in a specific chatroom
        *
        * @method update
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state, chat = OCF.globalChat) {
            let chatState = this.state(chat) || {};
            this.states[chat.channel] = Object.assign(chatState, state);
        }

        /**
        * @private
        * this is only called from network updates
        *
        * @method assign
        */
        assign(state, chat) {
            this.update(state, chat);
        }

        /**
        * @private
        * adds a chat to this user
        *
        * @method addChat
        */
        addChat(chat, state) {

            // store the chat in this user object
            this.chats[chat.channel] = chat;

            // updates the user's state in that chatroom
            this.assign(state, chat);
        }

    }

    /**
    * Represents the client connection as a {{#crossLink "User"}}{{/crossLink}}.
    * Has the ability to update it's state on the network. An instance of
    * {{#crossLink "Me"}}{{/crossLink}} is returned by the ```OCF.connect()```
    * method.
    *
    * @class Me
    * @constructor
    * @param {String} uuid The uuid of this user
    * @extends User
    */
    class Me extends User {

        constructor(uuid) {

            // call the User constructor
            super(uuid);

        }

        // assign updates from network
        assign(state, chat) {
            // we call "update" because calling "super.assign"
            // will direct back to "this.update" which creates
            // a loop of network updates
            super.update(state, chat);
        }

        /**
        * Update this user state over the network
        *
        * @method update
        * @param {Object} state The new state for {{#crossLink "Me"}}{{/crossLink}}
        * @param {Chat} chat An instance of the {{#crossLink "Chat"}}{{/crossLink}} where state will be updated.
        * Defaults to ```OCF.globalChat```.
        */
        update(state, chat = OCF.globalChat) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel
            chat.setState(state);

        }

    }

    /**
     * Provides the base Widget class...
     *
     * @class OCF
     */
    const init = function() {

        // Create the root OCF object
        OCF = new RootEmitter;

        // create a global list of known users
        OCF.users = {};

        // define our global chatroom all users join by default
        OCF.globalChat = false;

        // define the user that this client represents
        OCF.me = false;

        // store a reference to PubNub
        OCF.pubnub = false;

        /**
        * connect to realtime service and create instance of {{#crossLink "Me"}}{{/crossLink}}
        *
        * @method connect
        * @param {String} uuid The uuid for {{#crossLink "Me"}}{{/crossLink}}
        * @param {Object} state The initial state for {{#crossLink "Me"}}{{/crossLink}}
        * @return {Me} me an instance of me
        */
        OCF.connect = function(uuid, state) {

            // this creates a user known as Me and
            // connects to the global chatroom

            // this.config.rltm.config.uuid = uuid;
            pnConfig.uuid = uuid || pnConfig.uuid;

            this.pubnub = new PubNub(pnConfig);

            // create a new chat to use as globalChat
            this.globalChat = new Chat(globalChannel);

            // create a new user that represents this client
            this.me = new Me(this.pubnub.getUUID());

            // create a new instance of Me using input parameters
            this.globalChat.createUser(this.pubnub.getUUID(), state);

            this.me.update(state);

            // return me
            return this.me;

            // client can access globalChat through OCF.globalChat

        };

        // our exported classes
        OCF.Chat = Chat;
        OCF.User = User;

        // add an object as a subobject under a namespoace
        OCF.addChild = (ob, childName, childOb) => {

            // assign the new child object as a property of parent under the
            // given namespace
            ob[childName] = childOb;

            // the new object can use ```this.parent``` to access
            // the root class
            childOb.parent = ob;

        }

        return OCF;

    }

    // return an instance of OCF
    return init();

}

// export the OCF api
module.exports = {
    plugin: {},  // leave a spot for plugins to exist
    create: create
};
