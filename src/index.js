const EventEmitter = require('events');

var Rltm = require('rltm');

var me;

const TypingModule extends Class Chat() {
    
    this.isTyping = false;

    this.emitter 

    this.startTyping = (timeout) => {
        this.rltm.publish(['typing', me, {isTyping: true}]);
        
        setTimeout(function() {
            // this.isTyping = false;
        });

    };

    this.stopTyping = () => {
        this.rltm.publish(['typing', me, {isTyping: false}]);
    };    

};


////////////////////////////////////////
const TypingModule extends Class Chat() {
    
    this.isTyping = false;

    this.sendGif = (text) => {

        if(!text.length) {
            alert('please supply a gif to search for');
        }

        this.publish('/gif');  
    };

};

// block.js
function(request) {
    request.message.gif = http://gif.com/gif.gif
    return request;
}

$('.gif').click(function(){ 
})

////////////////////////////////////////

const Chat = function(userIds) {

    // sort alphabetically between people
    this.channels = [userIds.join(':')];

    // use star channels ian:*

    this.emitter = new EventEmitter();

    this.rltm = new Rltm({
        publishKey: 'pub-c-72832def-4ca3-4802-971d-68112db1b30a',
        subscribeKey: 'sub-c-28e05466-8c18-11e6-a68c-0619f8945a4f'
    });

    this.init = () => {
        
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

    };

    this.publish = (payload) => {
        this.rltm.publish({
            message: ['message', me, payload],
            channel: this.channels[0]
        });
    };

    this.init();

    return this;

};

$('textbox').on('focus', function() {
    chat.startTyping();
});

$('form').on('submit', function() {
    chat.stopTyping();
});

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