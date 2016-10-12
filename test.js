var typingIndicator = require('./plugins/typingIndicator.js')({
    timeout: 1000
});
var OCF = require('./src/index.js')([]);

let Chat = OCF.Chat;
let User = OCF.User;

me = new User('ian', {value: true});

var chat = me.createChat(['john', 'mary']);

chat.emitter.on('message', (user, packet) => {
    console.log('got message', user, packet);
});

chat.emitter.on('startTyping', (user, packet) => {
    console.log('start typing', user, packet);
});

chat.emitter.on('stopTyping', (user, packet) => {
    console.log('stop typing', user, packet);
});

chat.emitter.on('ready', () => {

    console.log('chat is ready');

    chat.startTyping();

    setTimeout(function() {

    });

    chat.publish('message', {
        text: 'hello world'
    });

});
