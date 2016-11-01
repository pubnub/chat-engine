"use strict";

let OCF = require('./src/index.js'); 

var me = OCF.identify('ian' + new Date().getTime(), {value: true});

OCF.init({
    globalConfigs: 'here'
});

var chat = new OCF.Chat('dogsandcats');

chat.emitter.on('join', (payload) => {
    console.log('got join', payload.user.uuid);
});

chat.emitter.on('message', (payload) => {
    console.log('got message', payload.data);
});

chat.emitter.on('ready', () => {

    console.log('chat is ready');

    console.log(chat.users)

    chat.publish('message', {
        text: 'hello world'
    });

});
