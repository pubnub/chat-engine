"use strict";

let plugin = (config) => {

    config = config || {timeout: 1000};

    let stopTypingTimeout = null;
    
    let extension = {
        construct: function() {
            this.isTyping = false;
        },
        startTyping: function() {

            this.isTyping = true;
            this.parent.send('startTyping');

            clearTimeout(stopTypingTimeout);
            stopTypingTimeout = setTimeout (() => {
                this.stopTyping();   
            }, config.timeout);

        },
        stopTyping: function() {

            if(this.isTyping) {
                clearTimeout(stopTypingTimeout);
                this.parent.send('stopTyping');      
            }

        }
    }

    let publish = {
        message: (payload, next) => {
            payload.chat.typing.stopTyping();
            next(null, payload);
        }
    };

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
