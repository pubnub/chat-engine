"use strict";

let OpenChatFramework = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

var OCF = OpenChatFramework.config({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'pub-c-07824b7a-6637-4e6d-91b4-7f0505d3de3f',
            subscribeKey: 'sub-c-43b48ad6-d453-11e6-bd29-0619f8945a4f',
            restore: false
        }
    },
    globalChannel: 'ocf-javascript-demo'
});

OCF.loadPlugin(typingIndicator({
    timeout: 5000
}));

OCF.onAny((payload) => {
    console.log('any', payload)
})

var me = OCF.connect('robot-stephen', {username: 'robot-stephen'});

var chats = {};

console.log(me.direct)

me.direct.onAny((payload) => {
    console.log(payload)
})

me.direct.on('private-invite', (payload) => {

    console.log('got private invite')

    var chat = chats[payload.data.channel];

    if(!chat) {

        chats[payload.data.channel] = new OCF.Chat(payload.data.channel);

        chat = chats[payload.data.channel];

        chat.on('message', (payload) => {
            
            if(payload.sender.data.uuid !== me.data.uuid) { // add to github issues

                setTimeout((argument) => {

                    chat.typingIndicator.startTyping();

                    setTimeout((argument) => {

                            // payload.sender.isMe

                            console.log('sending message')

                            chat.send('message', {
                                text: 'hey there ' + payload.sender.data.state.username 
                            });

                        chat.typingIndicator.stopTyping(); // add this to plugin middleware

                    }, 1000);

                }, 500);

            }

        });

    }

});
