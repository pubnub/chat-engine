"use strict";

var typingIndicator = require('./plugins/typingIndicator.js');
var pubSubModify = require('./plugins/pubSubModify.js');

var OCFBuilder = require('./src/index.js'); 

var OCF = new OCFBuilder({
    globalConfigs: 'here'
}, [
    new typingIndicator(),
    new pubSubModify()
]);

let me = new OCF.User('ian', {value: true});

let john = new OCF.User('john', {value: true});
let mary = new OCF.User('mary', {value: true});

var chat = me.createChat([john, mary]);

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

    chat.typing.startTyping();

    chat.publish('message', {
        text: 'hello world'
    });

});
