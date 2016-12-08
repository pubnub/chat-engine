"use strict";

// allows us to create and bind to events
const EventEmitter = require('events');

// import the rltm.js library from a sister directory
// this is not final
let Rltm = require('../../rltm/src/index');

// allows a synchronous execution flow. if we move to promises we can remove this dependency
let waterfall = require('async/waterfall');

// this adds an object to another object under some namespace
const addChild = (ob, childName, childOb) => {

    if(!ob[childName]) {
        ob[childName] = childOb;   
    } else {
        console.error('plugin is trying to add duplicate method to class');
    }

    // the new object can use ```this.parent``` to access the root class
    childOb.parent = ob;

    // the new object can use ```this.OCF``` to get the global config
    childOb.OCF = OCF;
    
}

// this loads plugins
// works by dynamically assigning methods to classes on creation
const loadClassPlugins = (obj) => {

    // returns the name of the class
    let className = obj.constructor.name;

    // for every plugin
    for(let i in OCF.plugins) {

        // see if there are plugins to attach to this class
        if(OCF.plugins[i].extends && OCF.plugins[i].extends[className]) {
            
            // attach the plugins to this class under their namespace
            addChild(obj, OCF.plugins[i].namespace, OCF.plugins[i].extends[className]);   

            // if the plugin has a special construct function, run it
            if(obj[OCF.plugins[i].namespace].construct) {
                obj[OCF.plugins[i].namespace].construct();
            }

        }

    }

}

// this is the root Chat class through which all other chats extend
class Chat extends EventEmitter {

    constructor(channel) {

        super();

        this.channel = channel;
        this.users = {};

        // this.room is our rltm.js connection 
        this.room = OCF.rltm.join(this.channel);

        // whenever we get a message, run local broadcast message
        this.room.on('message', (uuid, data) => {

            // all messages are in format [event_name, data]
            this.broadcast(data.message[0], data.message[1]);

        });

        // load the plugins and attach methods to them
        loadClassPlugins(this);

    }

    ready(fn) {
        // convenience method to set the rltm ready callback
        this.room.ready(fn);
    }

    send(event, data) {

        let payload = {
            data: data,                 // the data supplied from params
            sender: OCF.me.data.uuid,   // my own uuid
            chat: this,                 // an instance of this chat 
        };

        this.runPluginQueue('publish', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            // remove chat otherwise it would be serialized
            // instead, it's rebuilt on the other end. see this.broadcast
            delete payload.chat; 

            // publish the event and data over the configured channel
            this.room.publish({
                message: [event, payload],
                channel: this.channel
            });

        });

    }

    broadcast(event, payload) {

        // this broadcasts an event locally

        // restore chat in payload
        if(!payload.chat) {
            payload.chat = this;   
        }

        // turn a uuid found in payload.sender to a real user if we know about one
        if(payload.sender && OCF.globalChat.users[payload.sender]) {
            payload.sender = OCF.globalChat.users[payload.sender];
        }

        this.runPluginQueue('subscribe', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            // emit this event to any listener
            this.emit(event, payload);

        });

    }

    userJoin(uuid, state, data) {

        // if the user is not in this list
        if(!this.users[uuid]) {

            // if the user does not exist at all and we get enough information to build the user
            if(!OCF.globalChat.users[uuid] && state && state._initialized) {

                if(uuid == OCF.me.data.uuid) {
                    // if this user is me, reference Me class
                    OCF.globalChat.users[uuid] = OCF.me;
                } else {
                    // otherwise, create a new User
                    OCF.globalChat.users[uuid] = new User(uuid, state);
                }


            }

            // if the user has been built previously, assign it to local list of users in this chat
            if(OCF.globalChat.users[uuid]) {
                this.users[uuid] = OCF.globalChat.users[uuid];
            }

            // if user has been built using previous steps
            if(this.users[uuid]) {
                
                // broadcast that this is a new user
                this.broadcast('join', {
                    user: this.users[uuid],
                    data: data
                });

                return this.users[uuid];
                   
            } else {
                // something went wrong
                // we weren't able to find the user in our global list
                // we weren't able to build the user

                // console.log('user does not exist, and no state given, ignoring');
            }

        } else {

            // this user already exists in our list
            // so we incorrectly sent two joins
            // or user disconnected and reconnected

            // console.log('double userJoin called');
        }

    }
    userLeave(uuid) {

        // make sure this event is real, user may have already left
        if(this.users[uuid]) {

            // if a user leaves, broadcast the event
            this.broadcast('leave', this.users[uuid]);

            // remove the user from the local list of users
            delete this.users[uuid];

            // we don't remove the user from the global list, because they
            // may be online in other channels

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
        for(let i in OCF.plugins) {

            // if they have defined a function to run specifically for this event
            if(OCF.plugins[i].middleware && OCF.plugins[i].middleware[location] && OCF.plugins[i].middleware[location][event]) {

                // add the function to the queue
                plugin_queue.push(OCF.plugins[i].middleware[location][event]);
            }

        }

        // waterfall runs the functions in assigned order, waiting for one to complete
        // before moving to the next
        // when it's done, the ```last``` parameter is called
        waterfall(plugin_queue, last);

    }

};

// this is the root chat class
// it is responsible for global events, global who's online, etc
class GlobalChat extends Chat {

    constructor(channel) {

        // call the Chat constructor
        super(channel);

        // if someone joins the room, call our assigned function
        // this function is not automatically called from Chat class
        // because Chat class does not assume presence
        this.room.on('join', (uuid, state) => {
            this.userJoin(uuid, state);
        });

        // if user leaves, then call self assigned leave function
        this.room.on('leave', (uuid) => {
            this.userLeave(uuid);
        });

        // if user sets state
        this.room.on('state', (uuid, state) => {
            
            // if we know about the user
            if(this.users[uuid]) {
                // update them
                this.users[uuid].update(state);
            } else {
                // otherwise broadcast them as a join
                this.userJoin(uuid, state);
            }

        });

        // get users online now
        this.room.hereNow((occupants) => {

            // for every occupant, create a model user
            for(let uuid in occupants) {

                // if we know about the user
                if(this.users[uuid]) {
                    // update their state
                    this.users[uuid].update(occupants[uuid]);
                } else {
                    // otherwise broadcast them as join
                    this.userJoin(uuid, occupants[uuid]);
                }

            }

        });
    

    }

    setState(state) {
        // handy method to set state of user without touching rltm
        this.room.setState(state);
    }

}

class GroupChat extends Chat {

    constructor(channel) {

        channel = channel || [OCF.globalChat.channel, 'group', new Date().getTime()].join('.');

        super(channel);

        this.room.on('join', (uuid, state) => {
            this.userJoin(uuid, state);
        });

        this.room.on('leave', (uuid) => {
            this.userLeave(uuid);
        });

        // get users online now
        this.room.hereNow((occupants) => {

            // for every occupant, create a model user
            for(let uuid in occupants) {
                this.userJoin(uuid, occupants[uuid]);
            }

        });

    }

}

// this is our User class which represents a connected client
class User extends EventEmitter {

    constructor(uuid, state) {

        super();

        // this is public data exposed to the network
        // we can't JSON stringify the object without circular reference
        // so we store some properties under the ```data``` property
        this.data = {
            uuid: uuid,
            state: state || {}
        }

        // user can be created before network sync has begun
        // this property lets us know when that has happened
        this.data.state._initialized = true;

        // every user has a couple personal rooms we can connect to
        // feed is a list of things a specific user does that many people can subscribe to
        this.feed = new Chat([OCF.globalChat.channel, 'feed', uuid].join('.'));

        // direct is a private channel that anybody can publish to, but only the user can subscribe to
        // this permission based system is not implemented yet
        this.direct = new Chat([OCF.globalChat.channel, 'private', uuid].join('.'));
        
    }

    set(property, value) {

        // this is a public setter that sets locally and publishes an event
        this.data.state[property] = value;

        // publish data to the network
        this.emit('state-update', {
            property: property,
            value: value
        });

    }

    update(state) {
        
        // shorthand loop for updating multiple properties with set
        for(let key in state) {
            this.set(key, state[key]);
        }

    }

}

class Me extends User {

    constructor(uuid, state) {

        // call the User constructor
        super(uuid, state);

        // set our own state on init
        this.update(this.data.state);
        
        // load Me plugins
        loadClassPlugins(this);

    }

    set(property, value) {

        // set the property using User method
        super.set(property, value);

        // publish that the user was updated over the global channel
        OCF.globalChat.setState(this.data.state);

        // these two functions may be redundant

    }

    update(state) {

        // run the root update function
        super.update(state);

        // publish the update over the global channel
        OCF.globalChat.setState(this.data.state);

    }

}

// this is the root object that our api exports
let OCF = {

    config(config, plugs) {

        // supply a default config if none is set
        this.config = config || {};

        // set a default global channel if none is set
        this.config.globalChannel = this.config.globalChannel || 'ofc-global';

        // assign the plug (plugins) parameter in this scope
        this.plugins = plugs;

        // return an instance of OCF
        return this;

    },

    identify(uuid, state) {

        // this creates a user known as Me and connects to the global chatroom
        this.config.rltm[1].uuid = uuid;

        // configure the rltm plugin with the params set in config method
        this.rltm = new Rltm(this.config.rltm[0], this.config.rltm[1]);

        // create a new chat to use as globalChat
        this.globalChat = new GlobalChat(this.config.globalChannel);

        // create a new instance of Me using input parameters
        this.me = new Me(uuid, state);

        // return me
        return this.me;

        // client can access globalChat through OCF.globalChat

    },

    globalChat: false,
    me: false,
    rltm: false,
    plugins: [],
    plugin: {}, // used to bind external plugins from client

    // our exported classes
    Chat: Chat,
    GroupChat: GroupChat,
    User: User,

};

// export the OCF api
module.exports = OCF;
