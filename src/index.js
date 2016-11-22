"use strict";
const EventEmitter = require('events');

let Rltm = require('../../rltm/src/index');
let waterfall = require('async/waterfall');

let plugins = []; 

let uuid = null;
let me = false;
let globalChat = false;
let rltm;

function addChild(ob, childName, childOb) {
   ob[childName] = childOb;
   childOb.parent = ob;
}

let users = {};

function loadClassPlugins(obj) {

    let className = obj.constructor.name;

    for(let i in plugins) {
        // do plugin error checking here

        if(plugins[i].extends && plugins[i].extends[className]) {
            
            // add properties from plugin object to class under plugin namespace
            addChild(obj, plugins[i].namespace, plugins[i].extends[className]);   

            // this is a reserved function in plugins that run at start of class            
            if(obj[plugins[i].namespace].construct) {
                obj[plugins[i].namespace].construct();
            }

        }


    }

}

class Chat {

    constructor(channel) {

        this.channel = channel;

        this.users = {};

        // our events published over this event emitter
        this.emitter = new EventEmitter();

        this.room = rltm.join(this.channel);

        this.room.on('ready', (data) => {
            this.emitter.emit('ready');
        });

        this.room.on('message', (uuid, data) => {

            let event = data.message[0];
            let payload = data.message[1];

            payload.chat = this;

            if(payload.sender && globalChat.users[payload.sender]) {
                payload.sender = globalChat.users[payload.sender];
            }

            this.broadcast(event, payload);

        });

        loadClassPlugins(this);

    }

    publish(event, data) {

        let payload = {
            data: data,
            chat: this
        };

        payload.sender = me.data.uuid;

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

        this.runPluginQueue(event, payload, (next) => {
            next(null, payload);
        }, (err, payload) => {
           this.emitter.emit(event, payload);
        });


    }

    userJoin(uuid, state, data) {

        // if the user is not in this list
        if(!this.users[uuid]) {

            // if the user does not exist at all and we get enough information to build the user
            if(!globalChat.users[uuid] && state && state._initialized) {
                if(uuid == me.data.uuid) {
                    globalChat.users[uuid] = me;
                } else {
                    globalChat.users[uuid] = new User(uuid, state);
                }
            }

            // if the user has been built previously, assign it to local list
            if(globalChat.users[uuid]) {
                this.users[uuid] = globalChat.users[uuid];
            }

            // if user has been built using previous steps
            if(this.users[uuid]) {
                
                // broadcast that this is a new user
                this.broadcast('join', {
                    user: this.users[uuid],
                    chat: this,
                    data: data
                });

                return this.users[uuid];
                   
            } else {
                // console.log('user does not exist, and no state given, ignoring');
            }

        } else {
            console.log('double userJoin called');
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

    for(let i in plugins) {

        if(plugins[i].middleware && plugins[i].middleware[location] && plugins[i].middleware[location][event]) {
            plugin_queue.push(plugins[i].middleware[location][event]);
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

            console.log('here now called', occupants)

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

        channel = channel || [globalChat.channel, 'group', new Date().getTime()].join('.');

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

class User {
    constructor(uuid, state) {

        // this is public data exposed to the network
        // we can't JSON stringify the object without circular reference        
        this.data = {
            uuid: uuid,
            state: state || {}
        }

        // user can be created before network sync has begun
        // this property lets us know when that has happened
        this.data.state._initialized = true;

        this.feed = new Chat([globalChat.channel, 'feed', uuid].join('.'));
        this.direct = new Chat([globalChat.channel, 'private', uuid].join('.'));

        // our personal event emitter
        this.emitter = new EventEmitter();
        
    }
    set(property, value) {

        // this is a public setter that sets locally and publishes an event
        this.data.state[property] = value;

        // publish data to the network
        this.emitter.emit('state-update', {
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
};

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

        globalChat.setState(this.data.state);

    }
    update(state) {

        super.update(state);

        globalChat.setState(this.data.state);

    }
}

module.exports = {
    config(config, plugs) {

        this.config = config || {};

        this.config.globalChannel = this.config.globalChannel || 'ofc-global';

        plugins = plugs;

        this.plugin = {};

        return this;

    },
    identify(uuid, state) {

        this.config.rltm[1].uuid = uuid;

        rltm = new Rltm(this.config.rltm[0], this.config.rltm[1]);

        globalChat = new GlobalChat(this.config.globalChannel);

        me = new Me(uuid, state);

        return me;
    },
    getGlobalChat() {
        return globalChat
    },
    Chat: Chat,
    GlobalChat: GlobalChat,
    GroupChat: GroupChat,
    User: User,
    Me: Me,
    plugin: {}
};
