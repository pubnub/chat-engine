"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');

let plugins = []; 

let me = false;

let waterfall = require('async/waterfall');

function addChild(ob, childName, childOb) {
   ob[childName] = childOb;
   childOb.parent = ob;
}

function loadClassPlugins(obj) {

    let className = obj.constructor.name;

    for(let i in plugins) {
        // do plugin error checking here

        if(plugins[i].extends && plugins[i].extends[className]) {
            
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

        this.users = {};

        this.channels = [channel]; // replace with uuid

        // use star channels ian:*
        this.emitter = new EventEmitter();

        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: me ? me.data.uuid : null
        });

        this.rltm.hereNow({
            channels: this.channels, 
            includeUUIDs: true,
            includeState: true
        }, (status, response) => {

            let occupants = response.channels[this.channels[0]].occupants;

            for(let i in occupants) {
                this.users[occupants[i].uuid] = new User(occupants[i].uuid, occupants[i].state)
            }
            
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

                if(presenceEvent.action == "join") {

                    if(!this.users[presenceEvent.uuid]) {
                        this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                    }

                }
                if(presenceEvent.action == "leave") {
                    delete this.users[presenceEvent.uuid];
                }
                if(presenceEvent.action == "timeout") {
                    // set idle?   
                }
                if(presenceEvent.action == "state-change") {

                    if(this.users[presenceEvent.uuid]) {
                        this.users[presenceEvent.uuid].update(presenceEvent.state);   
                    } else {
                        this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);   
                    }

                }

                let payload = {
                    user: this.users[presenceEvent.uuid],
                    data: presenceEvent
                }

                runPluginQueue(presenceEvent.action, presenceEvent, (next) => {
                    next(null, payload);
                }, (err, payload) => {
                   this.emitter.emit(presenceEvent.action, payload);
                });

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
        
        this.data = {
            uuid: uuid,
            state: state || {}
        }
        
        this.emitter = new EventEmitter();
        
    }
    set(property, value) {

        // this is global

        this.data.state[property] = value;

        this.emitter.emit('state-update', {
            property: property,
            value: value
        });

    }
    update(state) {
        
        for(var key in state) {
            this.set(key, state[key]);
        }

    }
};

class Me extends User {
    constructor(uuid, state) {

        super(uuid, state);
        
        this.chats = [];
        
        loadClassPlugins(this);

    }
    set(property, value) {

        super.set(property, value);

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
