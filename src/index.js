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

        loadClassPlugins(this);

        this.users = {};

        this.channels = [channel]; // replace with uuid

        // use star channels ian:*
        this.emitter = new EventEmitter();

        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe',
            uuid: me ? me.uuid : null
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

            console.log(this.users);

        });
            
        this.rltm.addListener({
            status: (statusEvent) => {
                
                if (statusEvent.category === "PNConnectedCategory") {

                    if(me) {

                        this.rltm.setState({
                                state: me.state,
                                channels: this.channels
                            }, (status, response) => {

                            }
                        );

                        this.users[me.uuid] = new User(me.uuid, me.state);

                    } 
                    
                    this.emitter.emit('ready');

                }

            },
            message: (m) => {

                let event = m.message[0];
                let payload = m.message[1];
                payload.chat = this;

                if(payload.sender) {
                    for(let i in this.users) {
                        if(this.users[i].uuid == payload.sender.uuid) {
                            payload.sender = this.users[i];
                        }
                    }
                }

                runPluginQueue('subscribe', event, 
                    (next) => {
                        next(null, payload);
                    },
                    (err, payload) => {
                       this.emitter.emit(event, payload);
                    }
                );

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
                    this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
                }

                let payload = {
                    user: this.users[presenceEvent.uuid],
                    data: presenceEvent
                }

                runPluginQueue(presenceEvent.action, presenceEvent, 
                    (next) => {
                        next(null, payload);
                    },
                    (err, payload) => {
                       this.emitter.emit(presenceEvent.action, payload);
                    }
                );

            }
        });

        this.rltm.subscribe({ 
            channels: this.channels,
            withPresence: true
        });

    }

    publish(event, data) {

        let payload = {
            chat: this,
            data: data
        };

        payload.sender = me;

        runPluginQueue('publish', event, 
            (next) => {
                next(null, payload);
            },
            (err, payload) => {

                delete payload.chat; // will be rebuilt on subscribe

                this.rltm.publish({
                    message: [event, payload],
                    channel: this.channels[0]
                });

            }
        );

    }

};

class User {

    constructor(uuid, state) {
    
        loadClassPlugins(this);
        
        this.uuid = uuid;
        this.state = state;
        
    }

};

module.exports = class {
    constructor(config, plugs) {

        plugins = plugs;

        this.class = {Chat, User};

        return this;

    }
    config(params) {
        // do some config
    }
    identify(uuid, state) {
        me = new User(uuid, state);

        console.log('I am ', me.uuid)

        return me;
    }
};
