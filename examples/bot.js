"use strict";

let OpenChatFramework = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

var OCF = OpenChatFramework.create({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'pub-c-07824b7a-6637-4e6d-91b4-7f0505d3de3f',
            subscribeKey: 'sub-c-43b48ad6-d453-11e6-bd29-0619f8945a4f',
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
