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

var users = {};

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

        // our events published over this event emitter
        this.emitter = new EventEmitter();

        // key/value of users in channel
        this.users = {};

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

                if(payload.sender && users[payload.sender]) {
                    payload.sender = users[payload.sender];
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

};

class GlobalChat extends Chat {
    constructor(channel) {

        super(channel);

        this.rltm.addListener({
            presence: (presenceEvent) => {

                let payload = {
                    user: users[presenceEvent.uuid],
                    data: presenceEvent
                }

                if(presenceEvent.action == "join") {

                    if(!users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {
                        users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                        this.broadcast('join', payload);

                    }

                }
                if(presenceEvent.action == "leave") {
                    delete users[presenceEvent.uuid];
                    this.broadcast('leave', payload);
                }
                if(presenceEvent.action == "timeout") {
                    // set idle?
                    this.broadcast('timeout', payload);  
                }
                if(presenceEvent.action == "state-change") {

                    if(users[presenceEvent.uuid]) {
                        users[presenceEvent.uuid].update(presenceEvent.state);
                        // this will broadcast every change individually
                        // probably doesn't work anymore
                    } else {
                        
                        if(!users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {

                            users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);

                            payload.user = users[presenceEvent.uuid];
                            this.broadcast('join', payload);
                        }

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

                    if(users[occupants[i].uuid]) {
                        users[occupants[i].uuid].update(occupants[i].state);
                        // this will broadcast every change individually
                    } else {
                        
                        if(!users[occupants[i].uuid] && occupants[i].state && occupants[i].state._initialized) {
                            users[occupants[i].uuid] = new User(occupants[i].uuid, occupants[i].state);
                        }

                    }

                    this.broadcast('join', {
                        user: users[occupants[i].uuid],
                        chat: this
                    });

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

                let payload = {
                    user: users[presenceEvent.uuid],
                    data: presenceEvent
                }

                if(presenceEvent.action == "join") {
                    this.broadcast('join', payload);
                }
                if(presenceEvent.action == "leave") {
                    this.broadcast('leave', payload);
                }
                if(presenceEvent.action == "timeout") {
                    this.broadcast('timeout', payload);  
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

                    this.broadcast('join', {
                        user: users[occupants[i].uuid],
                        chat: this
                    });

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
        for(var key in state) {
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
