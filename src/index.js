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
                    
                    this.emitter.emit('ready');

                }

            },
            message: (m) => {

                let event = m.message[0];
                let payload = m.message[1];
                payload.chat = this;

                console.log('got message')

                console.log(payload.sender.state.avatar)
                console.log(this.users[payload.sender.uuid].state.avatar)

                if(payload.sender) {
                    if(this.users[payload.sender.uuid]) {
                        payload.sender = this.users[payload.sender.uuid];
                        console.log('setting sender as ', payload.sender)
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

                    console.log('user not set, setting with', presenceEvent.uuid, presenceEvent.state)

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
                    console.log('updating state', presenceEvent.uuid, presenceEvent.state)
                    this.users[presenceEvent.uuid] = new User(presenceEvent.uuid, presenceEvent.state);
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

        me.joinChat(this);

    }

    publish(event, data) {

        let payload = {
            chat: this,
            data: data
        };

        console.log('publish', me.state.avatar)

        payload.sender = me;

        console.log('after paylaod set', me.state.avatar)

        runPluginQueue('publish', event, (next) => {
            next(null, payload);
        }, (err, payload) => {

            console.log('after plugin queue', payload.sender.state.avatar)

            delete payload.chat; // will be rebuilt on subscribe

            console.log(event, payload)

            this.rltm.publish({
                message: [event, payload],
                channel: this.channels[0]
            });

        });

    }

};

class User {

    constructor(uuid, state) {

        loadClassPlugins(this);
        
        this.uuid = uuid;
        this.state = state;
        
    }

};

class Me extends User {
    constructor(uuid, state) {
    
        // get list of all chats a user is in
        // update their chat based state
        // or their entire user based state

        // create a set command

        super(uuid, state);
        
        let chats = [];

        this.joinChat = (chat) => {
            chats.push(chat)
        }
        this.getChats = (chat) => {
            return chats;
        }
    }
    set(property, value) {

        this.state[property] = value;

        let chats = this.getChats();

        for(let i in chats) {

            this.rltm.setState({
                state: this.state,
                channels: this.chats[i].channels
            }, (status, response) => {
                console.log(status)
                console.log(response)
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

        console.log('I am ', me.uuid)

        return me;
    }
};
