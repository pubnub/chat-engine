"use strict";

let typingIndicator = require('./plugins/typingIndicator.js')({
    timeout: 1000
});

let OCF = require('./src/index.js')([typingIndicator]);

let User = OCF.User;

let me = new User('ian', {value: true});

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

    chat.publish('message', {
        text: 'hello world'
    });

});
