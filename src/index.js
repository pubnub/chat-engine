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

    constructor(users, anonymous) {

        loadClassPlugins(this);

        this.users = users;
        this.isIdentified = !anonymous && me;

        let userIds = [];
        for(var i in this.users) {
            userIds.push(this.users[i].id); 
        };

        this.channels = [new Date().getTime()]; // replace with uuid

        // use star channels ian:*
        this.emitter = new EventEmitter();

        this.rltm = new Rltm({
            publishKey: 'pub-c-f7d7be90-895a-4b24-bf99-5977c22c66c9',
            subscribeKey: 'sub-c-bd013f24-9a24-11e6-a681-02ee2ddab7fe'
        });

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

                    if(this.isIdentified) {

                        this.rltm.setState({
                                state: me,
                                channels: this.channels
                            },
                            function (status, response) {
                                // handle status, response
                            }
                        );

                    }

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

        if(this.isIdentified) {
            userIds.push(me.id);
            this.users.push(me);
            this.rltm.setUUID(me.id);
        }

    }

    publish(event, data) {

        if(this.isIdentified) {

            var payload = {
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

        } else {
            console.log('cant publish to chat you are not in');
        }

    }

};

class User {

    constructor(id, data) {
    
        loadClassPlugins(this);
        
        this.id = id;
        this.data = data;
        
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
    identify(id, data) {
        me = new User(id, data);
        return me;
    }
};
