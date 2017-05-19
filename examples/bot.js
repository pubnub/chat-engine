"use strict";

let OpenChatFramework = require('../src/index.js');
let typingIndicator = require('../plugins/typingIndicator.js');

var OCF = OpenChatFramework.create({
    rltm: {
        service: 'pubnub',
        config: {
            publishKey: 'demo',
            subscribeKey: 'demo',
            restore: false
        }
    },
    globalChannel: 'ocf-demo-angular-2'
});

OCF.onAny((payload) => {
    console.log('any', payload)
})

var me = OCF.connect('robot-stephen', {username: 'robot-stephen'});

var chats = {};

me.direct.on('private-invite', (payload) => {

    var chat = chats[payload.data.channel];

    if(!chat) {

        chats[payload.data.channel] = new OCF.Chat(payload.data.channel);

        chat = chats[payload.data.channel];

        chat.plugin(typingIndicator({
            timeout: 5000
        }));

        chat.send('message', 'hey, how can I help you?');

        chat.on('message', (payload) => {

            if(payload.sender.uuid !== me.uuid) { // add to github issues

                setTimeout((argument) => {

                    chat.typingIndicator.startTyping();

                    setTimeout((argument) => {

                        chat.send('message', 'hey there ' + payload.sender.state().username);

                        chat.typingIndicator.stopTyping(); // add this to plugin middleware

                    }, 1000);

                }, 500);

            }

        });

    }

});
