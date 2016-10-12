"use strict";

require('./src/index.js');
require('./plugins/typingIndicator.js');

// from here on out is same on node / web
OCF.typingIndicator({timeout: 1000});

let me = new OCF.User('ian', {value: true});

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
