"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');
let me = false;

let plugins = [];


function addChild(ob, childName, childOb) {
   ob[childName] = childOb;
   childOb.parent = ob;
}

function loadPlugins(obj) {

    let className = obj.constructor.name;

    for(let i in plugins) {
        // do plugin error checking here
        addChild(obj, plugins[i].namespace, plugins[i].extends[className]);
    }

}

class Chat {

    constructor(me, userIds) {

        loadPlugins(this);

        userIds.push(me.id);

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
                this.emitter.emit(m.message[0], m.message[1], m.message[2]);
            },
            presence: (presenceEvent) => {
                this.emitter.emit('presence', presenceEvent);
            }
        })
         
        this.rltm.subscribe({ 
            channels: this.channels
        });

    }

    publish(type, payload) {

        this.rltm.publish({
            message: [type, me, payload],
            channel: this.channels[0]
        });

    }

};

class User {
    
    loadPlugins(this);

    constructor(id, data) {
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
