"use strict";

// adds shortcuts to build "ianjennings is typing..." functionality into your app
let plugin = (config) => {

    // set the default for typing
    // if the client types input, we wont fire "stopTyping" unless the client 
    // doesn't type anything for this timeout
    config = config || {timeout: 1000};

    // create a place to store the setTimeout in
    let stopTypingTimeout = null;
    
    // define the methods that will be attached to the class Chat
    let extension = {
        construct: function() {
            // will set Chat.typing.isTyping to false immediately
            this.isTyping = false;
        },
        startTyping: function() {

            // this is called manually by the client

            // set boolean that we're in middle of typing
            this.isTyping = true;

            // send an event over the network that this user started typing
            this.parent.send('startTyping');

            // kill any existing timeouts
            clearTimeout(stopTypingTimeout);

            // create a new timeout
            stopTypingTimeout = setTimeout (() => {
                // trigger stop typing after a set amount of time
                this.stopTyping();   
            }, config.timeout);

        },
        stopTyping: function() {

            // we must be currently typing to stop typing
            if(this.isTyping) {
                
                // remove the timeout
                clearTimeout(stopTypingTimeout);
                
                // broadcast a stoptyping event
                this.parent.send('stopTyping');      

            }

        }
    }

    // define publish middleware
    let publish = {
        message: (payload, next) => {

            // it's worth noting here, we can't access ```extension``` here
            // because this function runs in a different context

            // on every message, tell the chat to stop typing
            payload.chat.typing.stopTyping();

            // continue on
            next(null, payload);
        }
    };

    // define both the extended methods and the middleware in our plugin
    return {
        namespace: 'typing',
        extends: {
            Chat: extension,
            GroupChat: extension
        },
        middleware: {
            publish
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = plugin;
} else {
    window.OCF.plugin.typingIndicator = plugin;
}
