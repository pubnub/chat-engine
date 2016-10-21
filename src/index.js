"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');
let me = false;

let plugins = [];

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

var runPluginQueue = function(location, event, first, last) {
    
    var plugin_queue = [];

    plugin_queue.push(first);

    for(let i in plugins) {
        if(plugins[i].middleware && plugins[i].middleware[location] && plugins[i].middleware[location][event]) {
            plugin_queue.push(plugins[i].middleware[location][event]);
        }
    }

    waterfall(plugin_queue, last);

}

class Chat {

    constructor(me, users) {

        loadClassPlugins(this);

        this.me = me;
        this.users = users;

        let userIds = [];
        for(var i in this.users) {
            userIds.push(this.users[i].id); 
        };
        userIds.push(this.me.id);

        this.channels = [userIds.sort().join(':')];

        // use star channels ian:*
        this.emitter = new EventEmitter();

        this.rltm = new Rltm({
            publishKey: 'pub-c-72832def-4ca3-4802-971d-68112db1b30a',
            subscribeKey: 'sub-c-28e05466-8c18-11e6-a68c-0619f8945a4f'
        });
            
        this.rltm.addListener({
            status: (statusEvent) => {
                
                if (statusEvent.category === "PNConnectedCategory") {
                    this.emitter.emit('ready');
                }

            },
            message: (m) => {

                var event = m.message[0];
                var payload = m.message[1];
                payload.chat = this;

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
                this.emitter.emit('presence', presenceEvent);
            }
        })
         
        this.rltm.subscribe({ 
            channels: this.channels
        });

    }

    publish(event, data) {

        var payload = {
            sender: this.me,
            chat: this,
            data: data
        };

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

    constructor(id, data) {
    
        loadClassPlugins(this);
        
        this.id = id;
        this.data = data;
    }

    createChat(users) {
        return new Chat(this, users);
    };

};

module.exports = class {
    constructor(config, plugs) {

        plugins = plugs;

        let classes = {Chat, User};

        return classes;

    }
    config(params) {
        // do some config
    }
};
