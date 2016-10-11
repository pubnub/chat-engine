const EventEmitter = require('events');

let Rltm = require('rltm');
let me = false;

class Chat {

    constructor(userIds) {

        // sort alphabetically between people
        // add self into this
        this.channels = [userIds.join(':')];

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
            message: (message) => {
                this.emitter.emit('message', message);
            },
            presence: (presenceEvent) => {
                this.emitter.emit('presence', presenceEvent);
            }
        })
         
        this.rltm.subscribe({ 
            channels: this.channels
        });

    }

    publish(payload) {

        this.rltm.publish({
            message: ['message', me, payload],
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
        return new Chat(users);
    };

};

Chat.prototype.doStuff = function() {
    console.log('doing things')
};

me = new User('ian', {value: true});

var chat = me.createChat(['john', 'mary']);

chat.doStuff();

chat.emitter.on('message', function(message) {
    console.log('got chat message bind 1', message);
});

chat.emitter.on('message', function(message) {
    console.log('got chat message bind 2', message);
});

chat.emitter.on('ready', function() {

    console.log('chat is ready, sending message');
    chat.publish({
        text: 'hello world'
    });

});

var chat2 = me.createChat(['dustin', 'adam']);

chat2.emitter.on('message', function(message) {
    console.log('got chat 2 message bind 1', message);
});

chat.emitter.on('ready', function() {

    console.log('chat2 is ready, sending message');

    chat2.publish({
        text: 'hello world'
    });

});
