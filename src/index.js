const EventEmitter = require('events');

var Rltm = require('rltm');
var rltm = new Rltm({
    publishKey: 'pub-c-72832def-4ca3-4802-971d-68112db1b30a',
    subscribeKey: 'sub-c-28e05466-8c18-11e6-a68c-0619f8945a4f'
});

var me;

const Chat = function(userIds, callback) {

    this.channel = userIds.join(':');

    this.emitter = new EventEmitter();

    this.init = () => {
        
        rltm.addListener({
            status: (statusEvent) => {
                if (statusEvent.category === "PNConnectedCategory") {
                    this.emitter.emit('ready');
                }
            },
            message: (message) => {
                // handle message
            },
            presence: (presenceEvent) => {
                // handle presence
            }
        })
         
        rltm.subscribe({ 
            channels: ['ch1', 'ch2', 'ch3'] 
        });

    };

    this.startTyping = () => {
        rltm.publish();
    };

    this.startTyping = () => {
        rltm.publish();
    };

    this.init();

    return this.emitter;

};

const User = function(id, data) {

    this.id = id;
    this.data = data;

    this.createChat = (users) => {

    };

};

me = new User('ian', {value: true});

var chat = new Chat(['john', 'mary']);

chat.on('ready', function() {
  console.log('got foo');
});

console.log(rltm);

var chatSDK = {};
