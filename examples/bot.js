"use strict";

let OpenChatFramework = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

var OCF = OpenChatFramework.create({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'pub-c-4d01656a-cdd2-4474-adc3-30692132915c',
            subscribeKey: 'sub-c-a59afd1c-a85b-11e6-af18-02ee2ddab7fe',
        }    
    },
    globalChannel: 'ofc-tester-13' // global chan or root, namespace? organization
});

OCF.loadPlugin(typingIndicator({
    timeout: 5000
}));

var me = OCF.connect('robot-stephen', {username: 'robot-stephen'});

var chats = {};

me.direct.on('private-invite', (payload) => {

    console.log('got private invite')

    var chat = chats[payload.data.channel];

    if(!chat) {

        chats[payload.data.channel] = new OCF.Chat(payload.data.channel);

        chat = chats[payload.data.channel];

        chat.on('message', (payload) => {
            
            if(payload.sender.data.uuid !== me.data.uuid) { // add to github issues

                setTimeout((argument) => {

                    chat.typing.startTyping();

                    setTimeout((argument) => {

                            // payload.sender.isMe

                            console.log('sending message')

                            chat.send('message', {
                                text: 'hey there ' + payload.sender.data.state.username 
                            });

                        chat.typing.stopTyping(); // add this to plugin middleware

                    }, 1000);

                }, 500);

            }

        });

    }

});
