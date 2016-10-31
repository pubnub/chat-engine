"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');
let waterfall = require('async/waterfall');

isDebug = true // toggle this to turn on / off for global controll

let plugins = []; 
let me = false;

if (isDebug) var debug = console.log.bind(window.console);
else var debug = function(){}

function addChild(ob, childName, childOb) {
   ob[childName] = childOb;
   childOb.parent = ob;
}

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

        // key/value of user sin channel
        this.users = {};

        // turn our singular string into an array of channels
        this.channels = [channel];

        // our events published over this event emitter
        this.emitter = new EventEmitter();

        // initialize RLTM with pubnub keys
        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: me ? me.data.uuid : null
        });

        // get users online now
        this.rltm.hereNow({
            channels: this.channels, 
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            // get the result of who's online
            let occupants = response.channels[this.channels[0]].occupants;

            // for every occupant, create a model user
            for(let i in occupants) {
                this.users[occupants[i].uuid] = new User(occupants[i].uuid, occupants[i].state)
            }
            
            // emit the list of online users
            this.emitter.emit('online-list', this.users);

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

                if(payload.sender) {
                    if(this.users[payload.sender.uuid]) {
                        payload.sender = this.users[payload.sender.uuid];
                    }
                }

                runPluginQueue('subscribe', event, (next) => {
                    next(null, payload);
                }, (err, payload) => {
                   this.emitter.emit(event, payload);
                });

            },
            presence: (presenceEvent) => {

                let broadcast = (eventName) => {

                    let payload = {
                        user: this.users[presenceEvent.uuid],
                        data: presenceEvent
                    }

                    runPluginQueue(eventName, presenceEvent, (next) => {
                        next(null, payload);
                    }, (err, payload) => {
                       this.emitter.emit(eventName, payload);
                    });

                }

                if(presenceEvent.action == "join") {
                    
                    if(!this.users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {
                        this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                        broadcast('join');
                    }

                }
                if(presenceEvent.action == "leave") {
                    delete this.users[presenceEvent.uuid];
                    broadcast('leave');
                }
                if(presenceEvent.action == "timeout") {
                    // set idle?
                    broadcast('timeout');  
                }
                if(presenceEvent.action == "state-change") {

                    if(this.users[presenceEvent.uuid]) {
                        this.users[presenceEvent.uuid].update(presenceEvent.state);
                        // this will broadcast every change individually
                    } else {
                        
                        if(!this.users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {

                            this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                            broadcast('join');
                        }

                    }

                }

            }
        });

        this.rltm.subscribe({ 
            channels: this.channels,
            withPresence: true
        });

        me.chats.push(this);
        
        this.rltm.setState({
            state: me.data.state,
            channels: this.channels
        }, (status, response) => {
        });

        loadClassPlugins(this);

    }

    publish(event, data) {

        let payload = {
            data: data
        };

        payload.sender = me.data;

        runPluginQueue('publish', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            delete payload.chat;

            this.rltm.publish({
                message: [event, payload],
                channel: this.channels[0]
            });

        });

    }

};

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
        
        // our personal event emitter
        this.emitter = new EventEmitter();
        
        loadClassPlugins(this);
        
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
        
        // we keep a list of chats we're subscribed to
        this.chats = [];
        
        // load Me plugins
        loadClassPlugins(this);

    }
    set(property, value) {

        // set the property using User method
        super.set(property, value);

        // but we also need to broadcast the state change to all chats
        for(let i in this.chats) {

            this.rltm.setState({
                state: this.data.state,
                channels: this.chats[i].channels
            }, (status, response) => {
            });

        }

    }
}

module.exports = class {
    constructor(config, plugs) {

        plugins = plugs;

        this.Chat = Chat;
        this.User = User;

        return this;

    }
    config(params) {
        // do some config
    }
    identify(uuid, state) {

        me = new Me(uuid, state);

        return me;
    }
};
