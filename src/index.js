const EventEmitter = require('events');

var Rltm = require('rltm');
var rltm = new Rltm({
    publishKey: 'pub-c-72832def-4ca3-4802-971d-68112db1b30a',
    subscribeKey: 'sub-c-28e05466-8c18-11e6-a68c-0619f8945a4f'
});

var me;

const Chat = function(userIds) {

    this.channels = [userIds.join(':')];

    this.emitter = new EventEmitter();

    this.init = () => {
        
        rltm.addListener({
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
         
        rltm.subscribe({ 
            channels: this.channels
        });

    };

    this.startTyping = () => {
        rltm.publish(['typing', me, {isTyping: true}]);
    };

    this.stopTyping = () => {
        rltm.publish(['typing', me, {isTyping: false}]);
    };

    this.publish = (payload) => {
        rltm.publish({
            message: ['message', me, payload],
            channel: this.channels[0]
        });
    };

    this.init();

    return this;

};

const User = function(id, data) {

    this.id = id;
    this.data = data;

    this.createChat = (users) => {
        return new Chat(users);
    };

};

me = new User('ian', {value: true});

var chat = me.createChat(['john', 'mary']);

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