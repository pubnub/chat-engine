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
        this.users.push(this.me);

        this.channels = [userIds.sort().join(':')];

        // use star channels ian:*
        this.emitter = new EventEmitter();

        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe'
        });

        this.rltm.setUUID(this.me.id);

        this.rltm.hereNow(
            {
                channels: this.channels, 
                includeUUIDs: true,
                includeState: true
            }, (status, response) => {
                console.log(response.channels[this.channels[0]])
            }
        );
            
        this.rltm.addListener({
            status: (statusEvent) => {
                
                if (statusEvent.category === "PNConnectedCategory") {
                    
                    this.emitter.emit('ready');

                    this.rltm.setState({
                            state: this.me,
                            channels: this.channels
                        },
                        function (status, response) {
                            // handle status, response
                        }
                    );

                }

            },
            message: (m) => {

                var event = m.message[0];
                var payload = m.message[1];
                payload.chat = this;

                if(payload.sender) {
                    for(var i in this.users) {
                        if(this.users[i].id == payload.sender.id) {
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

                console.log('presence')
                console.log(presenceEvent)

                this.emitter.emit('presence', presenceEvent);
            }
        });

        this.rltm.subscribe({ 
            channels: this.channels,
            withPresence: true
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
