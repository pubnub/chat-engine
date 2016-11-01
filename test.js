"use strict";

let OCF = require('./src/index.js'); 
let typingIndicator = require('./plugins/typingIndicator.js'); 

OCF.config({
        globalChannel: 'ofc-tester-9' // global chan or root, namespace? organization
    }, [
        typingIndicator({
            timeout: 2000
        })
    ]);

var me = OCF.identify('robot-ian', {username: 'robot-ian'});

me.direct.emitter.on('private-invite', (payload) => {

    var newchat = new OCF.GroupChat(payload.data.channel);

    newchat.emitter.on('message', (payload) => {

        console.log(payload)

        newchat.typing.startTyping();

        setTimeout((argument) => {
            
            if(payload.sender.data.uuid !== me.data.uuid) { // add to github issues

                newchat.publish('message', {
                    text: 'hey there ' + payload.sender.data.state.username 
                });

            }

            newchat.typing.stopTyping();

        }, 1000);

    });


});
