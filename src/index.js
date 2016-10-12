"use strict";
const EventEmitter = require('events');

let Rltm = require('rltm');
let me = false;

class Chat {

    constructor(me, userIds) {

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

    constructor(id, data) {
        this.id = id;
        this.data = data;
    }

    createChat(users) {
        return new Chat(this, users);
    };

};

class Plugin {
    constructor(defaults, funct) {

        this.funct = funct;
        this.funct(defaults);

    }
    config(params) {
        this.funct(params);
    }
};

var OCF = {Chat, User, Plugin};

module.exports = OCF;
global.OCF = OCF;

// function(plugins) {

//     let classes = {Chat, User};

//     // for(let i in plugins) {

//     //     Object.keys(plugins[i]).forEach(function (className) {

//     //         Object.keys(plugins[i][className]).forEach(function (methodName) {
//     //             classes[className].prototype[methodName] = plugins[i][className][methodName];
//     //         });

//     //     });

//     // }

//     return classes;

// }
