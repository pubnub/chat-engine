"use strict";

let OCF = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

OCF.config({
    rltm: ['pubnub', {
        publishKey: 'pub-c-191d5212-dd99-4f2e-a8cf-fb63775232bc',
        subscribeKey: 'sub-c-aa1d9fe8-a85b-11e6-a397-02ee2ddab7fe',
        uuid: new Date(),
        state: {}
    }],
    globalChannel: 'ofc-tester-13' // global chan or root, namespace? organization
}, [
    typingIndicator({
        timeout: 5000
    })
]);

var me = OCF.identify('robot-stephen', {username: 'robot-stephen'});

var chats = {};

me.direct.on('private-invite', (payload) => {

    console.log('got private invite')

    var chat = chats[payload.data.channel];

    if(!chat) {

        chats[payload.data.channel] = new OCF.GroupChat(payload.data.channel);

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
