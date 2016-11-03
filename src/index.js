"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');
let waterfall = require('async/waterfall');

let plugins = []; 

let uuid = null;
let me = false;
let globalChat = false;

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

let runPluginQueue = function(location, event, first, last) {
    
    let plugin_queue = [];

    plugin_queue.push(first);

    for(let i in plugins) {
        if(plugins[i].middleware && plugins[i].middleware[location] && plugins[i].middleware[location][event]) {
            plugin_queue.push(plugins[i].middleware[location][event]);
        }
    }

    waterfall(plugin_queue, last);

}

class Chat {

    constructor(channel) {

        this.channel = channel;

        this.users = {};

        // our events published over this event emitter
        this.emitter = new EventEmitter();

        // initialize RLTM with pubnub keys
        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: uuid
        });
            
        this.rltm.addListener({
            status: (statusEvent) => {
                
                if (statusEvent.category === "PNConnectedCategory") {
                    this.emitter.emit('ready');
                }

            },
            message: (m) => {

                let event = m.message[0];
                let payload = m.message[1];
                payload.chat = this;

                if(payload.sender && globalChat.users[payload.sender]) {
                    payload.sender = globalChat.users[payload.sender];
                }

                this.broadcast(event, payload);

            }
        });

        this.rltm.subscribe({ 
            channels: [this.channel],
            withPresence: true
        });

        loadClassPlugins(this);

    }

    publish(event, data) {

        let payload = {
            data: data
        };

        payload.sender = me.data.uuid;

        runPluginQueue('publish', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            delete payload.chat;

            this.rltm.publish({
                message: [event, payload],
                channel: this.channel
            });

        });

    }

    broadcast(event, payload) {

        runPluginQueue(event, payload, (next) => {
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
                globalChat.users[uuid] = new User(uuid, state);
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
                console.log('user does not exist, and no state given, ignoring');
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

};

class GlobalChat extends Chat {
    constructor(channel) {

        super(channel);

        this.rltm.addListener({
            presence: (presenceEvent) => {

                if(presenceEvent.action == "join") {
                    this.userJoin(presenceEvent.uuid, presenceEvent.state, presenceEvent);
                }
                if(presenceEvent.action == "leave") {
                    this.userLeave(presenceEvent.uuid);
                }
                if(presenceEvent.action == "timeout") {
                    // set idle?
                    // this.broadcast('timeout', payload);  
                }
                if(presenceEvent.action == "state-change") {

                    if(payload.user) {
                        this.users[payload.user.data.uuid].update(presenceEvent.state);
                    } else {
                        this.userJoin(presenceEvent.uuid, presenceEvent.state, presenceEvent);
                    }

                }

            }
        });

        // get users online now
        this.rltm.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            if(!status.error) {

                // get the result of who's online
                let occupants = response.channels[this.channel].occupants;

                // for every occupant, create a model user
                for(let i in occupants) {

                    if(this.users[occupants[i].uuid]) {
                        this.users[occupants[i].uuid].update(occupants[i].state);
                        // this will broadcast every change individually
                    } else {
                        this.userJoin(occupants[i].uuid, occupants[i].state);
                    }

                }

            } else {
                console.log(status, response);
            }

        });
    

    }
    setState(state) {

        this.rltm.setState({
            state: state,
            channels: [this.channel]
        }, (status, response) => {
        });

    }
}

class GroupChat extends Chat {
    constructor(channel) {

        channel = channel || [globalChat.channel, 'group', new Date().getTime()].join('.');

        super(channel);

        this.rltm.addListener({
            presence: (presenceEvent) => {

                if(presenceEvent.action == "join") {
                    this.userJoin(presenceEvent.uuid, presenceEvent.state, presenceEvent);
                }
                if(presenceEvent.action == "leave") {
                    this.userLeave(presenceEvent.uuid);
                }
                if(presenceEvent.action == "timeout") {
                    // this.broadcast('timeout', payload);  
                }

            }
        });

        // get users online now
        this.rltm.hereNow({
            channels: [this.channel],
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            console.log('here now', status, response)

            if(!status.error) {

                // get the result of who's online
                let occupants = response.channels[this.channel].occupants;

                // for every occupant, create a model user
                for(let i in occupants) {
                    this.userJoin(occupants[i].uuid, occupants[i].state);
                }

            } else {
                console.log(status, response);
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
        this.update(state)
        
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
    identify(id, state) {

        uuid = id;

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
