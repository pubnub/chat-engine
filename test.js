var typingIndicator = require('./plugins/typingIndicator.js');
var OCF = require('./src/index.js')([typingIndicator]);

let Chat = OCF.Chat;
let User = OCF.User;

me = new User('ian', {value: true});

var chat = me.createChat(['john', 'mary']);

chat.doStuff();

chat.emitter.on('message', function(message) {
    console.log('test.js got message', message);
});

chat.emitter.on('ready', function() {

    console.log('chat is ready, sending message');
    chat.publish({
        text: 'hello world'
    });

});
