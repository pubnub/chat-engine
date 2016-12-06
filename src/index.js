"use strict";

const EventEmitter = require('events');

let Rltm = require('../../rltm/src/index');
let waterfall = require('async/waterfall');

const loadClassPlugins = (obj) => {

    const addChild = (ob, childName, childOb) => {

        if(!ob[childName]) {
            ob[childName] = childOb;   
        } else {
            console.error('plugin is trying to add duplicate method to class');
        }

        childOb.parent = ob;
        childOb.OCF = OCF;
        
    }

    let className = obj.constructor.name;

    for(let i in OCF.plugins) {

        // do plugin error checking here
        if(OCF.plugins[i].extends && OCF.plugins[i].extends[className]) {
            
            // add properties from plugin object to class under plugin namespace
            addChild(obj, OCF.plugins[i].namespace, OCF.plugins[i].extends[className]);   

            // this is a reserved function in OCF.plugins that run at start of class            
            if(obj[OCF.plugins[i].namespace].construct) {
                obj[OCF.plugins[i].namespace].construct();
            }

        }


    }

}

class Chat extends EventEmitter {

    constructor(channel) {

        super();

        this.channel = channel;

        this.users = {};

        this.room = OCF.rltm.join(this.channel);

        this.room.on('message', (uuid, data) => {

            this.broadcast(data.message[0], data.message[1]);

        });

        loadClassPlugins(this);

    }

    ready(fn) {
        this.room.ready(fn);
    }

    send(event, data) {

        let payload = {
            data: data,
            chat: this
        };

        payload.sender = OCF.me.data.uuid;

        this.runPluginQueue('publish', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            delete payload.chat;

            this.room.publish({
                message: [event, payload],
                channel: this.channel
            });

        });

    }

    broadcast(event, payload) {

        if(!payload.chat) {
            payload.chat = this;   
        }

        if(payload.sender && OCF.globalChat.users[payload.sender]) {
            payload.sender = OCF.globalChat.users[payload.sender];
        }

        this.runPluginQueue('subscribe', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

           this.emit(event, payload);

        });

    }

    userJoin(uuid, state, data) {

        // if the user is not in this list
        if(!this.users[uuid]) {

            // if the user does not exist at all and we get enough information to build the user
            if(!OCF.globalChat.users[uuid] && state && state._initialized) {
                if(uuid == OCF.me.data.uuid) {
                    OCF.globalChat.users[uuid] = OCF.me;
                } else {
                    OCF.globalChat.users[uuid] = new User(uuid, state);
                }
            }

            // if the user has been built previously, assign it to local list
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
                // console.log('user does not exist, and no state given, ignoring');
            }

        } else {
            // console.log('double userJoin called');
        }

    }
    userLeave(uuid) {
        if(this.users[uuid]) {
            this.broadcast('leave', this.users[uuid]);
            delete this.users[uuid];   
        } else {
            console.log('user already left');
        }
    }

    runPluginQueue(location, event, first, last) {
    
        let plugin_queue = [];

        plugin_queue.push(first);

        for(let i in OCF.plugins) {

            if(OCF.plugins[i].middleware && OCF.plugins[i].middleware[location] && OCF.plugins[i].middleware[location][event]) {
                plugin_queue.push(OCF.plugins[i].middleware[location][event]);
            }

        }

        waterfall(plugin_queue, last);

    }

};

class GlobalChat extends Chat {

    constructor(channel) {

        super(channel);

        this.room.on('join', (uuid, state) => {
            this.userJoin(uuid, state);
        });

        this.room.on('leave', (uuid) => {
            this.userLeave(uuid);
        });

        this.room.on('state', (uuid, state) => {
            
            if(this.users[uuid]) {
                this.users[uuid].update(state);
            } else {
                this.userJoin(uuid, state);
            }

        });

        // get users online now
        this.room.hereNow((occupants) => {

            // for every occupant, create a model user
            for(let uuid in occupants) {

                if(this.users[uuid]) {
                    this.users[uuid].update(occupants[uuid]);
                    // this will broadcast every change individually
                } else {
                    this.userJoin(uuid, occupants[uuid]);
                }

            }

        });
    

    }

    setState(state) {
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

class User extends EventEmitter {

    constructor(uuid, state) {

        super();

        // this is public data exposed to the network
        // we can't JSON stringify the object without circular reference        
        this.data = {
            uuid: uuid,
            state: state || {}
        }

        // user can be created before network sync has begun
        // this property lets us know when that has happened
        this.data.state._initialized = true;

        this.feed = new Chat([OCF.globalChat.channel, 'feed', uuid].join('.'));
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

        this.update(this.data.state);
        
        // load Me plugins
        loadClassPlugins(this);

    }

    set(property, value) {

        // set the property using User method
        super.set(property, value);

        OCF.globalChat.setState(this.data.state);

    }

    update(state) {

        super.update(state);

        OCF.globalChat.setState(this.data.state);

    }

}

let OCF = {

    config(config, plugs) {

        this.config = config || {};
        this.config.globalChannel = this.config.globalChannel || 'ofc-global';
        this.plugins = plugs;

        return this;

    },

    identify(uuid, state) {

        this.config.rltm[1].uuid = uuid;
        this.rltm = new Rltm(this.config.rltm[0], this.config.rltm[1]);
        this.globalChat = new GlobalChat(this.config.globalChannel);
        this.me = new Me(uuid, state);

        return this.me;

    },

    globalChat: false,
    me: false,
    rltm: false,
    plugins: [],
    plugin: {}, // used to bind external plugins

    Chat: Chat,
    GroupChat: GroupChat,
    User: User,

};

module.exports = OCF;
