"use strict";

let OCF = require('./src/index.js'); 

OCF.config();

var me = OCF.identify('ian' + new Date().getTime(), {value: true});

var chat = new OCF.Chat('dogsandcats');

chat.emitter.on('join', (payload) => {
    console.log('got join', payload);
});

chat.emitter.on('message', (payload) => {
    console.log('got message', payload.data);
});

chat.emitter.on('ready', () => {

    console.log('chat is ready');

    chat.publish('message', {
        text: 'hello world'
    });

});
