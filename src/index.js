"use strict";

// Allows us to create and bind to events. Everything in OCF is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

// import the rltm.js library from a sister directory
// @todo include this as module
const Rltm = require('rltm');

// allows a synchronous execution flow. 
const waterfall = require('async/waterfall');

const create = function(config) {

    // creat an EventEmitter2 that all other emitters can inherit
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
            this.emit = this.emitter.emit.bind(this.emitter);
            this.on = this.emitter.on.bind(this.emitter);
            this.onAny = this.emitter.onAny.bind(this.emitter);
            this.once = this.emitter.once.bind(this.emitter);

        }

    }

    // Create the root OCF object
    const OCF = new RootEmitter;

    // Extend emitter and add OCF specific behaviors
    class Emitter extends RootEmitter {

        constructor() {

            super();
            
            // emit an event from this object
            this.emit = (event, data) => {

                // all events are forwarded to OCF object
                // so you can globally bind to events with OCF.on()
                OCF.emit(event, data);
                
                // send the event from the object that created it
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
                    addChild(this, module.namespace, 
                        new module.extends[className]);

                    // if the plugin has a special construct function
                    // run it
                    if(this[module.namespace].construct) {
                        this[module.namespace].construct();
                    }

                }


            }

        }

    }

    // supply a default config if none is set
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

    // add an object as a subobject under a namespoace
    const addChild = (ob, childName, childOb) => {

        // assign the new child object as a property of parent under the
        // given namespace
        ob[childName] = childOb;

        // the new object can use ```this.parent``` to access 
        // the root class
        childOb.parent = ob;

        // the new object can use ```this.OCF``` to get the global config
        childOb.OCF = OCF;
        
    }

    // this is the root Chat class that represents a chatroom
    class Chat extends Emitter {

        constructor(channel) {

            super();

            // the channel name for this chatroom
            this.channel = channel;

            // a list of users in this chatroom
            this.users = {};

            // this.room is our rltm.js connection 
            this.room = OCF.rltm.join(this.channel);

            // whenever we get a message from the network 
            // run local broadcast message
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
                this.userUpdate(uuid, state)
            });

            // forward user leaving events
            this.room.on('leave', (uuid) => {
                this.userLeave(uuid);
            });

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

        }

        // convenience method to set the rltm ready callback
        ready(fn) {
            this.room.ready(fn);
        }

        // send events over the network
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

        // broadcasts an event locally
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

        // when OCF learns about a user in the channel
        createUser(uuid, state, broadcast = false) {

            // Ensure that this user exists in the global list
            // so we can reference it from here out
            OCF.users[uuid] = OCF.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            OCF.users[uuid].addChat(this, state);

            // broadcast the join event over this chatroom
            if(!this.users[uuid] || broadcast) {

                // broadcast that this is not a new user                    
                this.broadcast('$ocf.user', {
                    user: OCF.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = OCF.users[uuid];

            // return the instance of this user
            return OCF.users[uuid];

        }

        // get notified when a user's state changes
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

        leave() {

            // disconnect from the chat
            this.room.unsubscribe().then(() => {
                // should get caught on as network event
            });

        }

        userLeave(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                // if a user leaves, broadcast the event
                this.broadcast('$ocf.leave', this.users[uuid]);

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

        runPluginQueue(location, event, first, last) {

            // this assembles a queue of functions to run as middleware
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

        setState(state) {

            // handy method to set state of user without touching rltm
            this.room.setState(state);
        }

    };

    // this is our User class which represents a connected client
    class User extends Emitter {

        constructor(uuid, state = {}, chat = OCF.globalChat) {

            super();

            // this is public id exposed to the network
            this.uuid = uuid;

            // keeps account of user state in each channel
            this.states = {};

            // keep a list of chatrooms this user is in
            this.chats = {};

            // every user has a couple personal rooms we can connect to
            // feed is a list of things a specific user does that 
            // many people can subscribe to
            this.feed = new Chat(
                [OCF.globalChat.channel, 'feed', uuid].join('.'));

            // direct is a private channel that anybody can publish to
            // but only the user can subscribe to
            // this permission based system is not implemented yet
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

        // get the user's state in a chatroom
        state(chat = OCF.globalChat) {
            return this.states[chat.channel] || {};
        }

        // update the user's state in a specific chatroom
        // this is called from the client
        update(state, chat = OCF.globalChat) {
            let chatState = this.state(chat) || {};
            this.states[chat.channel] = Object.assign(chatState, state);
        }

        // this is only called from network updates
        assign(state, chat) {
            this.update(state, chat);
        }

        // adds a chat to this user
        addChat(chat, state) {

            // store the chat in this user object
            this.chats[chat.channel] = chat;
        
            // updates the user's state in that chatroom
            this.assign(state, chat);
        }

    }

    // Same as User, but has permission to update state on network
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

        // update this user state over the network
        update(state, chat = OCF.globalChat) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel
            chat.setState(state);

        }

    }

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
module.exports = {
    plugin: {},  // leave a spot for plugins to exist
    create: create
};
