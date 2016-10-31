"use strict";
const EventEmitter = require('events');



let Rltm = require('rltm');
let waterfall = require('async/waterfall');

let isDebug = true // toggle this to turn on / off for global controll

let plugins = []; 
let me = false;

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

        console.log('new Chat', channel)

        this.channel = channel;

        // key/value of user sin channel
        // users = {};

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


                }
                
                // emit the list of online users
                this.emitter.emit('online-list', users);

            } else {
                console.log(status, response);
            }

        });
            
        this.rltm.addListener({
            status: (statusEvent) => {
                
                if (statusEvent.category === "PNConnectedCategory") {
                    this.emitter.emit('ready');
                }

            },
            message: (m) => {

                console.log('subscribe', m)

                let event = m.message[0];
                let payload = m.message[1];
                payload.chat = this;

                if(payload.sender && users[payload.sender]) {
                    payload.sender = users[payload.sender];
                }

                runPluginQueue('subscribe', event, (next) => {
                    next(null, payload);
                }, (err, payload) => {

                    console.log(event, payload)

                   this.emitter.emit(event, payload);
                });

            },
            presence: (presenceEvent) => {

                let broadcast = (eventName) => {

                    let payload = {
                        user: users[presenceEvent.uuid],
                        data: presenceEvent
                    }

                    runPluginQueue(eventName, presenceEvent, (next) => {
                        next(null, payload);
                    }, (err, payload) => {
                       this.emitter.emit(eventName, payload);
                    });

                }

                if(presenceEvent.action == "join") {

                    console.log('join', presenceEvent.uuid, presenceEvent.state);

                    if(!users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {
                        users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                        broadcast('join');

                    }

                }
                if(presenceEvent.action == "leave") {
                    delete users[presenceEvent.uuid];
                    broadcast('leave');
                }
                if(presenceEvent.action == "timeout") {
                    // set idle?
                    broadcast('timeout');  
                }
                if(presenceEvent.action == "state-change") {

                    console.log('state change', presenceEvent.uuid, presenceEvent.state);

                    if(users[presenceEvent.uuid]) {
                        users[presenceEvent.uuid].update(presenceEvent.state);
                        // this will broadcast every change individually
                    } else {
                        
                        if(!users[presenceEvent.uuid] && presenceEvent.state && presenceEvent.state._initialized) {

                            users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                            broadcast('join');
                        }

                    }

                }

            }
        });

        console.log('subscribing to', this.channel)

        this.rltm.subscribe({ 
            channels: [this.channel],
            withPresence: true
        });

        me.chats.push(this);
        // console.log(me.chats.length)

        this.rltm.setState({
            state: me.data.state,
            channels: [this.channel]
        }, (status, response) => {
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

};

class Person {
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

class User extends Person {
    constructor(uuid, state) {
        
        console.log('new User');

        super(uuid, state);

        this.chat = new Chat([uuid, me.data.uuid].sort().join(':'));
        
        loadClassPlugins(this);

    }   
}

class Me extends Person {
    constructor(uuid, state) {
        
        console.log('new me');

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

        console.log(this.chats)

        // but we also need to broadcast the state change to all chats
        for(let i in this.chats) {

            console.log(this.chats[i]);
            console.log('setting statusate in chats');

            this.chats[i].rltm.setState({
                state: this.data.state,
                channels: [this.chats[i].channel]
            }, (status, response) => {
            });

        }

    }
}

module.exports = {
    init(config, plugs) {

        plugins = plugs;

        this.Chat = Chat;
        this.User = User;

        this.plugin = {};

        return this;

    },
    identify(uuid, state) {
        me = new Me(uuid, state);
        return me;
    },
    plugin: {}
};
