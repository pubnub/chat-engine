"use strict";

let OCF = require('../src/index.js'); 
let typingIndicator = require('../plugins/typingIndicator.js'); 

OCF.config({
    globalChannel: 'ofc-tester-9' // global chan or root, namespace? organization
}, [
    typingIndicator({
        timeout: 2000
    })
]);

var me = OCF.identify('robot-stephen', {username: 'robot-stephen'});

me.direct.emitter.on('private-invite', (payload) => {

    var newchat = new OCF.GroupChat(payload.data.channel);

    newchat.emitter.on('message', (payload) => {
        
        if(payload.sender.data.uuid !== me.data.uuid) { // add to github issues

            setTimeout((argument) => {

                newchat.typing.startTyping();

                setTimeout((argument) => {

                        // payload.sender.isMe

                        newchat.    lish('message', {
                            text: 'hey there ' + payload.sender.data.state.username 
                        });

                    newchat.typing.stopTyping(); // add this to plugin middleware

                }, 1000);

            }, 500);

        }

    });

});
