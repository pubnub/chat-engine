"use strict";

let OpenChatFramework = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

var OCF = OpenChatFramework.create({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'pub-c-4d01656a-cdd2-4474-adc3-30692132915c',
            subscribeKey: 'sub-c-a59afd1c-a85b-11e6-af18-02ee2ddab7fe',
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
