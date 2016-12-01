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

me.direct.on('private-invite', (payload) => {

    var newchat = new OCF.GroupChat(payload.data.channel);

    newchat.on('message', (payload) => {
        
        if(payload.sender.data.uuid !== me.data.uuid) { // add to github issues

            setTimeout((argument) => {

                newchat.typing.startTyping();

                setTimeout((argument) => {

                        // payload.sender.isMe

                        newchat.send('message', {
                            text: 'hey there ' + payload.sender.data.state.username 
                        });

                    newchat.typing.stopTyping(); // add this to plugin middleware

                }, 1000);

            }, 500);

        }

    });

});
